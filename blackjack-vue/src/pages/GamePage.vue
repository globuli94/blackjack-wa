<template>
  <q-page class="blackjack-app" :class="{ 'allow-scroll': currentPage === 'history' || currentPage === 'rules' }">
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
    <Navbar 
      @page-change="handlePageChange"
      @reset="initializeGame"
      :player-money="currentUserPlayer?.money || null"
    />

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
          />
        </div>

        <!-- Dealer -->
        <div v-if="dealer" class="dealer-wrapper">
          <Dealer :dealer="dealer" />
        </div>

        <!-- Players -->
        <div 
          v-if="players.length > 0" 
          ref="playersWrapperRef"
          class="players-wrapper"
          :style="playersScaleStyle"
        >
          <Player
            v-for="player in players"
            :key="player.name"
            :player="player"
            :is-current="player === currentPlayer && gameState !== 'Evaluated'"
          />
        </div>

        <!-- Player Controls -->
        <div 
          v-if="currentPlayer && (gameState === 'Betting' || gameState === 'Started')"
          ref="playerControlsWrapperRef"
          class="player-controls-wrapper"
          :style="playerControlsScaleStyle"
        >
          <PlayerControls
            :current-user-name="authStore.userName"
            :player="currentPlayer"
            :game-state="gameState"
            @hit="hit"
            @stand="stand"
            @double-down="doubleDown"
            @bet="showBetDialog = true"
            @leave="leavePlayer"
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
            outlined
            autofocus
            min="1"
            placeholder="Enter bet amount"
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
          <q-btn 
            flat 
            label="Cancel" 
            color="grey-6" 
            text-color="white"
            v-close-popup 
            class="dialog-btn"
          />
          <q-btn 
            unelevated 
            label="Place Bet" 
            color="amber" 
            text-color="black"
            @click="placeBet" 
            class="dialog-btn"
          />
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
const playersWrapperRef = ref(null)
const playersScale = ref(1)
const playerControlsWrapperRef = ref(null)
const playerControlsScale = ref(0.9)

const mobileScaleStyle = computed(() => {
  return {
    transform: `scale(${mobileScale.value})`,
    transformOrigin: 'top center'
  }
})

const playersScaleStyle = computed(() => {
  return {
    transform: `scale(${playersScale.value})`,
    transformOrigin: 'center'
  }
})

const playerControlsScaleStyle = computed(() => {
  return {
    transform: `scale(${playerControlsScale.value})`,
    transformOrigin: 'center'
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

    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768
    
    // Account for navbar and padding
    // On mobile, use actual navbar height (smaller)
    const navbarHeight = isMobile ? 50 : 60
    const padding = isMobile ? 5 : 20
    
    // Use visual viewport if available (better for mobile browsers with address bars)
    const viewportWidth = window.visualViewport?.width || window.innerWidth
    const viewportHeight = (window.visualViewport?.height || window.innerHeight) - navbarHeight - padding
    
    // Get actual content dimensions - measure all child elements to get accurate height
    let contentWidth = gameSectionRef.value.scrollWidth || gameSectionRef.value.offsetWidth
    let contentHeight = 0
    
    // Measure all visible child elements to get accurate total height
    const children = gameSectionRef.value.children
    if (children && children.length > 0) {
      Array.from(children).forEach((child) => {
        const childRect = child.getBoundingClientRect()
        if (childRect.height > 0) {
          contentHeight = Math.max(contentHeight, child.offsetTop + child.offsetHeight)
        }
      })
    }
    
    // Fallback to scrollHeight if measurement failed
    if (contentHeight === 0) {
      contentHeight = gameSectionRef.value.scrollHeight || gameSectionRef.value.offsetHeight
    }
    
    // Add some buffer for spacing
    contentHeight += 20

    // If content dimensions are not available yet, use estimated values
    if (contentWidth === 0 || contentHeight === 0 || isNaN(contentWidth) || isNaN(contentHeight)) {
      // Estimate: controls (~100px), dealer (~200px), players (300px * rows), player controls (~150px)
      const playerRows = Math.ceil((players.value.length || 1) / Math.floor(viewportWidth / 300))
      const estimatedWidth = Math.max(600, 280 * Math.min(players.value.length || 1, Math.floor(viewportWidth / 300)))
      const estimatedHeight = 100 + 200 + (300 * playerRows) + 150 // controls + dealer + players + player controls
      const scaleX = viewportWidth / estimatedWidth
      const scaleY = viewportHeight / estimatedHeight
      const scale = Math.min(scaleX, scaleY, 1)
      
      // On mobile, allow scaling down more aggressively to fit everything
      if (isMobile) {
        mobileScale.value = Math.max(scale, 0.3) // Allow very small scale but with a reasonable minimum
      } else {
        const minScale = viewportWidth < 400 ? 0.5 : 0.6
        mobileScale.value = Math.max(scale, minScale)
      }
      return
    }

    // Calculate scale to fit both width and height - prioritize height to fit on one page
    const scaleX = viewportWidth / contentWidth
    const scaleY = viewportHeight / contentHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down

    // On mobile, allow scaling down as much as needed to fit everything on one screen
    if (isMobile) {
      // Use a very small minimum scale to ensure everything fits, but not too small to be unusable
      mobileScale.value = Math.max(scale, 0.3)
    } else {
      // Desktop: use minimum scale to maintain readability
      const minScale = viewportWidth < 400 ? 0.5 : 0.6
      mobileScale.value = Math.max(scale, minScale)
    }
  }, 150) // Increased timeout to ensure all elements are rendered
}

const calculatePlayersScale = () => {
  if (typeof window === 'undefined' || !playersWrapperRef.value || players.value.length === 0) {
    playersScale.value = 1
    return
  }

  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    if (!playersWrapperRef.value) return

    const playerCardWidth = 280 // Fixed width per player
    const gap = 16 // 1rem gap between players
    const padding = 16 // 0.5rem padding on each side (0.5rem * 2 = 1rem = 16px)
    
    // Calculate needed width: (number of players * card width) + (gaps between players) + (padding)
    const neededWidth = (players.value.length * playerCardWidth) + ((players.value.length - 1) * gap) + (padding * 2)
    
    // Get available width (parent container width)
    const availableWidth = playersWrapperRef.value.parentElement?.offsetWidth || window.innerWidth
    
    // Calculate scale to fit available width
    let scale = availableWidth / neededWidth
    
    // Don't scale up beyond 1, and set a minimum scale
    scale = Math.min(scale, 1)
    const minScale = 0.5 // Minimum 50% scale
    scale = Math.max(scale, minScale)
    
    playersScale.value = scale
  }, 100)
}

const calculatePlayerControlsScale = () => {
  // Set player controls scale to 0.9 (fixed scale)
  playerControlsScale.value = 0.9
}

// Computed
const currentPlayer = computed(() => {
  if (current_idx.value !== null && players.value.length > 0) {
    return players.value[current_idx.value]
  }
  return null
})

const currentUserPlayer = computed(() => {
  if (!authStore.userName || !players.value.length) {
    return null
  }
  return players.value.find(player => player.name === authStore.userName) || null
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
    // Use multiple timeouts to ensure DOM is fully updated
    setTimeout(() => {
      calculateMobileScale()
      calculatePlayersScale()
      calculatePlayerControlsScale()
    }, 100)
    setTimeout(() => {
      calculateMobileScale()
      calculatePlayersScale()
      calculatePlayerControlsScale()
    }, 300)
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
      message: 'Round started',
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

// Track if we've already triggered auto-leave to prevent multiple calls
const hasAutoLeft = ref(false)

// Watch for player money reaching 0 and automatically leave
watch(
  () => currentUserPlayer.value?.money,
  (newMoney, oldMoney) => {
    // Only check if we're authenticated, have a player, and haven't already auto-left
    if (
      authStore.isAuthenticated &&
      currentUserPlayer.value &&
      newMoney !== undefined &&
      newMoney <= 0 &&
      oldMoney !== undefined &&
      oldMoney > 0 &&
      !hasAutoLeft.value
    ) {
      hasAutoLeft.value = true
      Notify.create({
        type: 'warning',
        message: 'You have no money left. Leaving the game...',
        position: 'top',
        timeout: 2000,
      })
      // Small delay before leaving to show the message
      setTimeout(() => {
        leavePlayer()
      }, 500)
    }
  },
  { immediate: false }
)

// Reset auto-left flag when player rejoins or game resets
watch(
  () => [currentUserPlayer.value, gameState.value],
  () => {
    if (currentUserPlayer.value && currentUserPlayer.value.money > 0) {
      hasAutoLeft.value = false
    }
  }
)

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
      calculatePlayersScale()
      calculatePlayerControlsScale()
    }, 100)
  }
}, { deep: true })

// Player controls scale is fixed at 1.2, no need to sync with players scale

// Lifecycle
onMounted(() => {
  // Only connect WebSocket if user is authenticated
  if (authStore.isAuthenticated) {
    wsManager = new WebSocketManager(updateGameState, authStore)
    wsManager.connect()
  }

  // Calculate initial mobile scale
  calculateMobileScale()
  calculatePlayersScale()
  calculatePlayerControlsScale()
  
  // Handle window resize
  const handleResize = () => {
    calculateMobileScale()
    calculatePlayersScale()
    calculatePlayerControlsScale()
  }
  window.addEventListener('resize', handleResize)
  
  // Handle visual viewport changes (mobile browser address bar show/hide)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleResize)
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
  const handleResize = () => {
    calculateMobileScale()
    calculatePlayersScale()
    calculatePlayerControlsScale()
  }
  window.removeEventListener('resize', handleResize)
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleResize)
    window.visualViewport.removeEventListener('scroll', handleResize)
  }
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
  flex-wrap: nowrap;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  padding: 0.5rem;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  overflow: hidden;
  transform-origin: center;
}

.player-controls-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  position: relative;
  z-index: 1;
  background: transparent;
  padding-top: 1rem;
  padding-bottom: 1rem;
  transform-origin: center;
  /* Ensure margins are maintained when scaling - left, right, and bottom */
  margin-left: auto;
  margin-right: auto;
  max-width: calc(100% - 2rem);
  box-sizing: border-box;
}

.content-section {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
  -webkit-overflow-scrolling: touch;
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
  position: relative;
  height: 100vh;
  width: 100vw;
}

.blackjack-app.allow-scroll {
  overflow-y: auto;
  overflow-x: hidden;
}

.game-section {
  transform-origin: top center;
  /* Scale will be calculated dynamically via JavaScript */
  overflow: visible;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
    gap: 0.5rem;
    padding: 0.25rem;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    margin-left: 1rem;
    margin-right: 1rem;
    box-sizing: border-box;
  }

  .controls-wrapper,
  .dealer-wrapper {
    padding: 0.25rem;
    width: auto;
    max-width: none;
  }

  .player-controls-wrapper {
    position: relative;
    background: transparent;
    z-index: 1;
    max-width: calc(100% - 1rem);
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.5rem;
    box-sizing: border-box;
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
  min-width: clamp(280px, 90vw, 500px);
  max-width: 500px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog-card :deep(.q-card__section) {
  color: white;
}

.dialog-card :deep(.q-card__section:first-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.dialog-card :deep(.text-h6) {
  color: white;
  font-weight: 600;
}

.dialog-actions {
  padding: 0.5rem 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-amounts-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  justify-content: center;
}

.quick-amounts-label {
  margin-right: 0.5rem;
}

.quick-amount-btn {
  padding: 0.75rem 1rem !important;
  min-height: 48px !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: all 0.2s ease !important;
}

.quick-amount-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(251, 191, 36, 0.5) !important;
  transform: translateY(-2px) !important;
}

.quick-amount-btn:active {
  transform: translateY(0) !important;
}

.quick-amount-btn :deep(.q-btn__content) {
  display: flex !important;
  align-items: center !important;
  gap: 0.4rem !important;
  color: white !important;
}

.quick-amount-value {
  font-size: 1.2rem !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  color: white !important;
}

.coin-icon {
  height: 20px !important;
  width: 20px !important;
  object-fit: contain !important;
  flex-shrink: 0 !important;
}

.bet-amount-input {
  font-size: 1.1rem !important;
}

.bet-amount-input :deep(.q-field__control) {
  min-height: 48px !important;
  padding: 0 1rem !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

.bet-amount-input :deep(.q-field__native) {
  font-size: 1rem !important;
  font-weight: 500 !important;
  padding: 0.5rem 0 !important;
  position: relative !important;
  z-index: 1 !important;
  color: white !important;
}

.bet-amount-input :deep(.q-field__label) {
  font-size: 1.1rem !important;
  font-weight: 500 !important;
  z-index: 2 !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.bet-amount-input :deep(.q-field--float .q-field__label) {
  transform: translateY(-50%) scale(0.85) !important;
  top: 0 !important;
  background: rgba(0, 0, 0, 0.3) !important;
  padding: 0 0.5rem !important;
  z-index: 3 !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.bet-amount-input :deep(.q-field__inner) {
  position: relative !important;
}

.bet-amount-input :deep(.q-field__marginal) {
  z-index: 2 !important;
}

.bet-amount-input :deep(.q-field__outlined) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.bet-amount-input :deep(.q-field--focused .q-field__outlined) {
  border-color: rgba(251, 191, 36, 0.8) !important;
}

.dialog-btn {
  min-height: 44px !important;
  padding: 0.625rem 1.25rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.dialog-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.dialog-btn:active {
  transform: translateY(0) !important;
}

@media (min-width: 600px) {
  .dialog-card {
    min-width: clamp(350px, 50vw, 500px);
  }

  .quick-amount-btn {
    padding: 0.875rem 1.5rem !important;
    min-height: 52px !important;
  }

  .quick-amount-value {
    font-size: 1.4rem !important;
  }

  .coin-icon {
    height: 24px !important;
    width: 24px !important;
  }
}

@media (max-width: 600px) {
  .dialog-card {
    min-width: calc(100vw - 0.75rem);
    max-width: calc(100vw - 0.75rem);
    margin: 0.375rem;
    padding: 0.3rem !important;
    max-height: calc(100vh - 1rem);
    overflow-y: auto;
  }

  .dialog-card :deep(.q-card__section) {
    padding: 0.3rem 0.25rem !important;
  }

  .dialog-card :deep(.q-card__section:first-child) {
    padding-top: 0.25rem !important;
    padding-bottom: 0.3rem !important;
  }

  .dialog-card :deep(.q-card__section:nth-child(2)) {
    padding-top: 0.3rem !important;
    padding-bottom: 0.3rem !important;
  }

  .dialog-card :deep(.text-h6) {
    font-size: 0.85rem !important;
    margin-bottom: 0 !important;
  }

  .bet-amount-input {
    font-size: 0.75rem !important;
    margin-bottom: 0.3rem !important;
  }

  .bet-amount-input :deep(.q-field__control) {
    min-height: 28px !important;
    padding: 0 0.4rem !important;
  }

  .bet-amount-input :deep(.q-field__native) {
    font-size: 0.75rem !important;
    padding: 0.25rem 0 !important;
  }

  .bet-amount-input :deep(.q-field__label) {
    font-size: 0.75rem !important;
  }

  .quick-amounts-wrapper {
    gap: 0.2rem;
    margin-top: 0.3rem;
  }

  .quick-amount-btn {
    flex: 1 1 calc(33.333% - 0.2rem);
    min-width: 0;
    padding: 0.25rem 0.25rem !important;
    min-height: 28px !important;
  }

  .quick-amount-value {
    font-size: 0.65rem !important;
  }

  .coin-icon {
    height: 10px !important;
    width: 10px !important;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.25rem 0.25rem 0.3rem !important;
    margin-top: 0 !important;
  }

  .dialog-btn {
    width: 100%;
    min-height: 28px !important;
    padding: 0.25rem 0.5rem !important;
    font-size: 0.75rem !important;
  }
}
</style>
