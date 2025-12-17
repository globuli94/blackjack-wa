<template>
  <q-layout view="lHh Lpr lFf">
    <div class="blackjack-app">

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
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Add Player</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="newPlayerName"
              label="Player Name"
              outlined
              dense
              @keyup.enter="addPlayer"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey" v-close-popup />
            <q-btn flat label="Add" color="primary" @click="addPlayer" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Bet Dialog -->
      <q-dialog v-model="showBetDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Place Bet</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model.number="betAmount"
              type="number"
              label="Bet Amount"
              outlined
              dense
              @keyup.enter="placeBet"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey" v-close-popup />
            <q-btn flat label="Place Bet" color="primary" @click="placeBet" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { WebSocketManager } from './services/websocket'
import { gameApi } from './services/api'
import { Notify } from 'quasar'

// Import components
import Navbar from './components/Navbar.vue'
import GameControls from './components/GameControls.vue'
import PlayerControls from './components/PlayerControls.vue'
import Dealer from './components/Dealer.vue'
import Player from './components/Player.vue'
import History from './components/History.vue'
import Rules from './components/Rules.vue'

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
  wsManager = new WebSocketManager(updateGameState)
  wsManager.connect()

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
  min-height: 100vh;
  color: white;
  padding: 1rem;
}

.game-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  padding: 1rem;
}

.controls-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.dealer-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.players-wrapper {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1400px;
}

.player-controls-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.content-section {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.offline-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  margin: -1rem -1rem 1rem -1rem; /* Negative margin to extend to edges */
}

.offline-banner .q-banner {
  background: #f59e0b !important; /* Orange/warning color */
  border-radius: 0; /* Remove rounded corners */
}
</style>
