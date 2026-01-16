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
    <div v-if="currentPage === 'home'" ref="gameSectionRef" class="game-section" :style="mobileScaleStyle">
      <!-- Show game only if authenticated -->
      <div v-if="authStore.isAuthenticated">
        <!-- Game Controls -->
        <div class="controls-wrapper">
          <GameControls
            :game-state="gameState"
            :players="players"
            :current-user-name="authStore.userName"
            @initialize="initializeGame"
            @start="startGame"
            @add-player="addPlayer"
            @reset="initializeGame"
            @leave="leavePlayer"
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
            :is-current="player === currentPlayer && gameState !== 'Evaluated'"
          />
        </div>

        <!-- Player Controls -->
        <div class="player-controls-wrapper">
          <PlayerControls
            v-if="currentPlayer"
            :current-user-name="authStore.userName"
            :player="currentPlayer"
            :game-state="gameState"
            @hit="hit"
            @stand="stand"
            @double-down="doubleDown"
            @bet="showBetDialog = true"
          />
        </div>
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
            autofocus
            min="1"
            @keyup.enter="placeBet"
            class="q-mb-sm bet-amount-input"
          />
          <div class="text-caption text-grey-6 q-mt-xs quick-amounts-wrapper">
            <q-btn
              flat
              size="md"
              @click="betAmount = 50"
              class="quick-amount-btn"
              :disable="!isCurrentUserTurn"
            >
              <template v-slot:default>
                <img src="icons/util-icons/casino-chip.png" alt="Coin" class="coin-icon" />
                <span class="quick-amount-value">50</span>
              </template>
            </q-btn>
            <q-btn
              flat
              size="md"
              @click="betAmount = 100"
              class="quick-amount-btn"
              :disable="!isCurrentUserTurn"
            >
              <template v-slot:default>
                <img src="icons/util-icons/casino-chip.png" alt="Coin" class="coin-icon" />
                <img src="icons/util-icons/casino-chip.png" alt="Coin" class="coin-icon" />
                <span class="quick-amount-value">100</span>
              </template>
            </q-btn>
            <q-btn
              flat
              size="md"
              @click="betAmount = 200"
              class="quick-amount-btn"
              :disable="!isCurrentUserTurn"
            >
              <template v-slot:default>
                <img src="icons/util-icons/casino-chip.png" alt="Coin" class="coin-icon" />
                <img src="icons/util-icons/casino-chip.png" alt="Coin" class="coin-icon" />
                <img src="icons/util-icons/casino-chip.png" alt="Coin" class="coin-icon" />
                <span class="quick-amount-value">200</span>
              </template>
            </q-btn>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
const betAmount = ref(100)
const showBetDialog = ref(false)

// for offline management
const online = ref(navigator.onLine)
const showOfflineBanner = ref(false)
let wsManager = null

// Mobile scaling
const gameSectionRef = ref(null)
const mobileScale = ref(1)

const mobileScaleStyle = computed(() => {
  return {
    transform: `scale(${mobileScale.value})`,
    transformOrigin: 'top center'
  }
})

const calculateMobileScale = () => {
  if (typeof window === 'undefined') {
    mobileScale.value = 1
    return
  }

  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    if (!gameSectionRef.value) return

    // Account for navbar and padding
    const navbarHeight = 60
    const padding = 20
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight - navbarHeight - padding
    
    // Get actual content dimensions
    const contentWidth = gameSectionRef.value.scrollWidth || gameSectionRef.value.offsetWidth
    const contentHeight = gameSectionRef.value.scrollHeight || gameSectionRef.value.offsetHeight

    // If content dimensions are not available yet, use estimated values
    if (contentWidth === 0 || contentHeight === 0) {
      // Estimate: controls (~100px), dealer (~200px), players (300px * rows), player controls (~150px)
      const playerRows = Math.ceil((players.value.length || 1) / Math.floor(viewportWidth / 300))
      const estimatedWidth = Math.max(600, 280 * Math.min(players.value.length || 1, Math.floor(viewportWidth / 300)))
      const estimatedHeight = 100 + 200 + (300 * playerRows) + 150 // controls + dealer + players + player controls
      const scaleX = viewportWidth / estimatedWidth
      const scaleY = viewportHeight / estimatedHeight
      const scale = Math.min(scaleX, scaleY, 1)
      mobileScale.value = Math.max(scale, 0.2) // Minimum scale of 20%
      return
    }

    // Calculate scale to fit both width and height - prioritize height to fit on one page
    const scaleX = viewportWidth / contentWidth
    const scaleY = viewportHeight / contentHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down

    mobileScale.value = Math.max(scale, 0.2) // Minimum scale of 20%
  }, 100)
}

// Computed
const currentPlayer = computed(() => {
  if (current_idx.value !== null && players.value.length > 0) {
    return players.value[current_idx.value]
  }
  return null
})

const isCurrentUserTurn = computed(() => {
  return currentPlayer.value && currentPlayer.value.name === authStore.userName
})

// Methods
const updateGameState = (gameData) => {
  current_idx.value = gameData.current_idx
  players.value = gameData.players || []
  dealer.value = gameData.dealer
  deck.value = gameData.deck
  gameState.value = gameData.state
  // Recalculate scale when game state changes
  nextTick(() => {
    calculateMobileScale()
  })
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
  if (!authStore.isAuthenticated) {
    Notify.create({
      type: 'warning',
      message: 'Please sign in to join the game',
      position: 'top',
    })
    return
  }

  const playerName = authStore.userName
  if (!playerName || !playerName.trim()) {
    Notify.create({
      type: 'warning',
      message: 'Unable to get username. Please try again.',
      position: 'top',
    })
    return
  }

  try {
    await gameApi.addPlayer(playerName.trim())
    Notify.create({
      type: 'positive',
      message: 'Joined game successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Error adding player:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to join game'
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    })
    Notify.create({
      type: 'negative',
      message: errorMessage,
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

const leavePlayer = async () => {
  try {
    await gameApi.leavePlayer()
    Notify.create({
      type: 'info',
      message: 'You have left the game',
      position: 'top',
    })
  } catch (error) {
    console.error('Error leaving game:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to leave game',
      position: 'top',
    })
  }
}

// Watch for changes that affect layout (but debounce to prevent rapid recalculations)
let scaleTimeout = null
watch([players, dealer, currentPage], () => {
  if (currentPage.value === 'home') {
    // Debounce the scale calculation to prevent rapid recalculations
    if (scaleTimeout) {
      clearTimeout(scaleTimeout)
    }
    scaleTimeout = setTimeout(() => {
      calculateMobileScale()
    }, 100)
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Only connect WebSocket if user is authenticated
  if (authStore.isAuthenticated) {
    wsManager = new WebSocketManager(updateGameState, authStore)
    wsManager.connect()
  }

  // Calculate initial mobile scale
  calculateMobileScale()
  window.addEventListener('resize', calculateMobileScale)

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
  window.removeEventListener('resize', calculateMobileScale)
})
</script>

<style scoped>
.blackjack-app {
  background: linear-gradient(135deg, #0f766e 0%, #15803d 100%);
  background-attachment: fixed;
  height: 100vh;
  overflow: hidden;
  color: white;
  padding: 0.5rem;
}

.game-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding: 0.5rem;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
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
  min-height: 0;
  flex-shrink: 0;
}

.players-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  max-width: 1400px;
  padding: 0.5rem;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.player-controls-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  position: relative;
  z-index: 1;
  background: transparent;
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


/* Scale entire layout to fit on one page - applies to all screen sizes */
.blackjack-app {
  overflow-x: hidden;
  overflow-y: hidden;
}

.game-section {
  transform-origin: top center;
  /* Scale will be calculated dynamically via JavaScript */
}

/* Mobile Responsive Styles - Additional adjustments for small screens */
@media (max-width: 600px) {
  .blackjack-app {
    padding: 0;
  }

  .game-section {
    gap: 1rem;
    padding: 0.5rem;
  }

  .players-wrapper {
    gap: 0.75rem;
    padding: 0.25rem;
    justify-content: center;
    width: auto;
    max-width: none;
  }

  .controls-wrapper,
  .dealer-wrapper,
  .player-controls-wrapper {
    padding: 0.25rem;
    width: auto;
    max-width: none;
  }

  .player-controls-wrapper {
    position: relative;
    background: transparent;
    z-index: 1;
  }

  .content-section {
    padding: 0.75rem;
  }

}

/* Tablet Styles */
@media (min-width: 601px) and (max-width: 1024px) {
  .players-wrapper {
    justify-content: center;
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

.quick-amounts-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.quick-amounts-label {
  margin-right: 0.5rem;
}

.quick-amount-btn {
  padding: 0.75rem 1.25rem !important;
  min-height: 48px !important;
  border-radius: 8px !important;
}

.quick-amount-btn :deep(.q-btn__content) {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.quick-amount-value {
  font-size: 1.4rem !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  color: inherit !important;
}

.coin-icon {
  height: 24px !important;
  width: 24px !important;
  object-fit: contain !important;
  flex-shrink: 0 !important;
}

.bet-amount-input {
  font-size: 1.1rem !important;
}

.bet-amount-input :deep(.q-field__control) {
  min-height: 48px !important;
  padding: 0 1rem !important;
}

.bet-amount-input :deep(.q-field__native) {
  font-size: 1rem !important;
  font-weight: 500 !important;
  padding: 0.5rem 0 !important;
  position: relative !important;
  z-index: 1 !important;
}

.bet-amount-input :deep(.q-field__label) {
  font-size: 1.1rem !important;
  font-weight: 500 !important;
  z-index: 2 !important;
}

.bet-amount-input :deep(.q-field--float .q-field__label) {
  transform: translateY(-50%) scale(0.85) !important;
  top: 0 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  padding: 0 0.5rem !important;
  z-index: 3 !important;
}

.bet-amount-input :deep(.q-field__inner) {
  position: relative !important;
}

.bet-amount-input :deep(.q-field__marginal) {
  z-index: 2 !important;
}

@media (min-width: 600px) {
  .dialog-card {
    min-width: 350px;
  }
}
</style>
