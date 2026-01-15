<template>
  <q-page class="blackjack-app">
    <!-- Offline Banner -->
    <div v-if="showOfflineBanner" class="offline-banner">
      <q-banner class="bg-warning text-white">
        <template v-slot:avatar>
          <q-icon name="wifi_off" />
        </template>
        Connection offline! API calls only work with an active connection!
      </q-banner>
    </div>

    <!-- Navbar -->
    <Navbar @page-change="handlePageChange" />

    <!-- HOME (Game) Section -->
    <div v-if="currentPage === 'home'" class="game-section">
      <!-- Show game only if authenticated -->
      <div v-if="authStore.isAuthenticated">
        <!-- Game Controls -->
        <div class="controls-wrapper">
          <GameControls
            :game-state="gameState"
            :players="players"
            @initialize="initializeGame"
            @start="startGame"
            @add-player="showAddPlayerDialog = true"
            @reset="initializeGame"
          />
        </div>

        <!-- Dealer -->
        <div v-if="dealer" class="dealer-wrapper">
          <Dealer :dealer="dealer" />
        </div>

        <!-- Players -->
        <div v-if="players.length > 0" class="players-wrapper">
          <Player
            v-for="player in players"
            :key="player.name"
            :player="player"
            :is-current="player === currentPlayer"
          />
        </div>

        <!-- Player Controls -->
        <div class="player-controls-wrapper">
          <PlayerControls
            v-if="currentPlayer"
            :player="currentPlayer"
            :game-state="gameState"
            @hit="hit"
            @stand="stand"
            @double-down="doubleDown"
            @bet="showBetDialog = true"
          />
        </div>
      </div>

      <div v-else class="login-prompt">
        <q-card class="prompt-card">
          <q-card-section class="text-center">
            <q-icon name="casino" size="64px" color="primary" />
            <div class="text-h5 q-mt-md">Welcome to Blackjack</div>
            <div class="text-body1 q-mt-sm text-grey-6">
              Please sign in to start playing
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn
              color="primary"
              label="Sign In"
              icon="login"
              size="lg"
              @click="$router.push('/auth')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- HISTORY Section -->
    <div v-if="currentPage === 'history'" class="content-section">
      <History />
    </div>

    <!-- RULES Section -->
    <div v-if="currentPage === 'rules'" class="content-section">
      <Rules />
    </div>

    <!-- Add Player Dialog -->
    <q-dialog v-model="showAddPlayerDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Add Player</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newPlayerName"
            label="Player Name"
            outlined
            dense
            autofocus
            @keyup.enter="addPlayer"
            class="q-mb-sm"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn unelevated label="Add" color="primary" @click="addPlayer" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bet Dialog -->
    <q-dialog v-model="showBetDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Place Bet</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.number="betAmount"
            type="number"
            label="Bet Amount"
            outlined
            dense
            autofocus
            min="1"
            @keyup.enter="placeBet"
            class="q-mb-sm"
          />
          <div class="text-caption text-grey-6 q-mt-xs">
            Quick amounts:
            <q-btn
              flat
              dense
              size="sm"
              label="50"
              @click="betAmount = 50"
              class="q-mx-xs"
            />
            <q-btn
              flat
              dense
              size="sm"
              label="100"
              @click="betAmount = 100"
              class="q-mx-xs"
            />
            <q-btn
              flat
              dense
              size="sm"
              label="200"
              @click="betAmount = 200"
              class="q-mx-xs"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn unelevated label="Place Bet" color="primary" @click="placeBet" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { WebSocketManager } from '../services/websocket'
import { gameApi } from '../services/api'
import { Notify } from 'quasar'
import { useAuthStore } from '../stores/auth'

// Import components
import Navbar from '../components/Navbar.vue'
import GameControls from '../components/GameControls.vue'
import PlayerControls from '../components/PlayerControls.vue'
import Dealer from '../components/Dealer.vue'
import Player from '../components/Player.vue'
import History from '../components/History.vue'
import Rules from '../components/Rules.vue'

// Auth Store
const authStore = useAuthStore()

// State
const currentPage = ref('home')
const current_idx = ref(null)
const players = ref([])
const dealer = ref(null)
const deck = ref(null)
const gameState = ref(null)
const newPlayerName = ref('')
const betAmount = ref(100)
const showAddPlayerDialog = ref(false)
const showBetDialog = ref(false)

// for offline management
const online = ref(navigator.onLine)
const showOfflineBanner = ref(false)
let wsManager = null

// Computed
const currentPlayer = computed(() => {
  if (current_idx.value !== null && players.value.length > 0) {
    return players.value[current_idx.value]
  }
  return null
})

// Methods
const updateGameState = (gameData) => {
  current_idx.value = gameData.current_idx
  players.value = gameData.players || []
  dealer.value = gameData.dealer
  deck.value = gameData.deck
  gameState.value = gameData.state
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const initializeGame = async () => {
  try {
    await gameApi.initializeGame()
    Notify.create({
      type: 'positive',
      message: 'Game initialized',
      position: 'top',
    })
  } catch (error) {
    console.error('Error initializing game:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to initialize game',
      position: 'top',
    })
  }
}

const startGame = async () => {
  try {
    await gameApi.startGame()
    Notify.create({
      type: 'positive',
      message: 'Game started',
      position: 'top',
    })
  } catch (error) {
    console.error('Error starting game:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to start game',
      position: 'top',
    })
  }
}

const addPlayer = async () => {
  if (!newPlayerName.value.trim()) {
    Notify.create({
      type: 'warning',
      message: 'Please enter a player name',
      position: 'top',
    })
    return
  }

  try {
    await gameApi.addPlayer(newPlayerName.value.trim())
    newPlayerName.value = ''
    showAddPlayerDialog.value = false
    Notify.create({
      type: 'positive',
      message: 'Player added',
      position: 'top',
    })
  } catch (error) {
    console.error('Error adding player:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to add player',
      position: 'top',
    })
  }
}

const hit = async () => {
  try {
    await gameApi.hit()
  } catch (error) {
    console.error('Error hitting:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to hit',
      position: 'top',
    })
  }
}

const stand = async () => {
  try {
    await gameApi.stand()
  } catch (error) {
    console.error('Error standing:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to stand',
      position: 'top',
    })
  }
}

const doubleDown = async () => {
  try {
    await gameApi.doubleDown()
  } catch (error) {
    console.error('Error doubling down:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to double down',
      position: 'top',
    })
  }
}

const placeBet = async () => {
  if (!betAmount.value || betAmount.value <= 0) {
    Notify.create({
      type: 'warning',
      message: 'Please enter a valid bet amount',
      position: 'top',
    })
    return
  }

  try {
    await gameApi.bet(betAmount.value)
    showBetDialog.value = false
    Notify.create({
      type: 'positive',
      message: `Bet placed: ${betAmount.value}`,
      position: 'top',
    })
  } catch (error) {
    console.error('Error placing bet:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to place bet',
      position: 'top',
    })
  }
}

// Lifecycle
onMounted(() => {
  // Only connect WebSocket if user is authenticated
  if (authStore.isAuthenticated) {
    wsManager = new WebSocketManager(updateGameState, authStore)
    wsManager.connect()
  }

  // events fired by browser for connection changes
  window.addEventListener('online', () => {
    online.value = true;
    showOfflineBanner.value = false;
    Notify.create({
        type: 'positive',
        message: 'Connection online',
        position: 'top',
        timeout: 3000
    })
  })

  window.addEventListener('offline', () => {
    online.value = false;
    showOfflineBanner.value = true;
    Notify.create({
      type: 'negative',
      message: 'Connection offline',
      position: 'top',
      timeout: 3000,
      actions: [{icon: 'close', color: 'white'}]
    })
  })
})

onUnmounted(() => {
  wsManager?.disconnect();
})
</script>

<style scoped>
.blackjack-app {
  background: linear-gradient(135deg, #0f766e 0%, #15803d 100%);
  background-attachment: fixed;
  min-height: 100vh;
  color: white;
  padding: 0.5rem;
}

.game-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.controls-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.5rem;
}

.dealer-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
}

.players-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 1400px;
  padding: 0.5rem;
}

.player-controls-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: linear-gradient(to top, rgba(15, 118, 110, 0.95) 0%, transparent 100%);
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.content-section {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.offline-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  margin: -0.5rem -0.5rem 0.5rem -0.5rem;
}

.offline-banner .q-banner {
  background: #f59e0b !important;
  border-radius: 0;
}

.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 1rem;
}

.prompt-card {
  max-width: 500px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Mobile Responsive Styles */
@media (max-width: 600px) {
  .blackjack-app {
    padding: 0.25rem;
  }

  .game-section {
    gap: 1rem;
    padding: 0.25rem;
  }

  .players-wrapper {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.25rem;
  }

  .controls-wrapper,
  .dealer-wrapper,
  .player-controls-wrapper {
    padding: 0.25rem;
  }

  .content-section {
    padding: 0.75rem;
  }

  .login-prompt {
    padding: 0.5rem;
    min-height: 50vh;
  }
}

/* Tablet Styles */
@media (min-width: 601px) and (max-width: 1024px) {
  .players-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Large Screen Optimizations */
@media (min-width: 1400px) {
  .game-section {
    gap: 2rem;
  }

  .players-wrapper {
    gap: 2rem;
  }
}

/* Dialog Styles */
.dialog-card {
  min-width: 90vw;
  max-width: 500px;
  border-radius: 16px;
}

.dialog-actions {
  padding: 0.5rem 1rem 1rem;
}

@media (min-width: 600px) {
  .dialog-card {
    min-width: 350px;
  }
}
</style>
