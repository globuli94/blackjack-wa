<template>
  <div
    ref="playerCardElement"
    class="player-card"
    :class="{ 'current-player': isCurrent }"
  >
    <div class="player-header">
      <q-icon
        :name="isCurrent ? 'person' : 'person_outline'"
        size="sm"
        :color="isCurrent ? 'amber' : 'white'"
      />
      <span class="player-name">{{ player.name }}</span>
    </div>

    <div class="player-status">
      <q-badge
        :color="getStatusColor(player.state)"
        :label="player.state"
        class="status-badge"
      />
      <div v-if="showWinLoss" class="win-loss-amount" :class="getWinLossClass()">
        {{ getWinLossText() }}
      </div>
    </div>

    <div class="player-hand">
      <Hand
        ref="handRef"
        :cards="player.hand?.cards || []"
        :show-value="hasCards"
        :animate-cards="true"
      />
    </div>

    <div class="player-info">
      <div class="info-item">
        <img src="icons/util-icons/dollar_tiny.png" alt="Money" class="info-icon" />
        <span>${{ player.money }}</span>
      </div>
      <div v-if="player.bet" class="info-item">
        <img src="icons/util-icons/casino-chip.png" alt="Bet" class="info-icon" />
        <span>${{ player.bet }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import Hand from './Hand.vue'
import { useCardAnimations } from '../composables/useCardAnimations'

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
})

const playerCardElement = ref(null)
const handRef = ref(null)
const { glow } = useCardAnimations()

// Track the bet amount before evaluation (since bet becomes 0 after evaluation)
const previousBet = ref(0)

// Watch for bet changes and store it before it becomes 0
watch(
  () => props.player.bet,
  (newBet) => {
    if (newBet > 0) {
      previousBet.value = newBet
    }
  },
  { immediate: true }
)

// Add glow effect when player becomes current
watch(
  () => props.isCurrent,
  (newVal) => {
    if (newVal && playerCardElement.value) {
      nextTick(() => {
        glow(playerCardElement.value, 'gold', 0) // Continuous glow
      })
    } else if (playerCardElement.value) {
      // Remove glow
      playerCardElement.value.style.boxShadow = ''
    }
  },
  { immediate: true }
)

// Check if player has blackjack (21 with 2 cards)
const isBlackjack = computed(() => {
  const cards = props.player.hand?.cards || []
  if (cards.length !== 2) return false
  
  // Calculate hand value
  let value = 0
  let aces = 0
  
  cards.forEach((card) => {
    if (card.rank === 'A') {
      aces++
      value += 11
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10
    } else {
      value += parseInt(card.rank)
    }
  })
  
  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  
  return value === 21
})

// Get the bet amount to display (use current bet if available, otherwise use stored previous bet)
const displayBet = computed(() => {
  // If bet is still set, use it
  if (props.player.bet && props.player.bet > 0) {
    return props.player.bet
  }
  
  // For evaluated state, use the stored previous bet
  if (previousBet.value > 0) {
    return previousBet.value
  }
  
  return 0
})

// Check if player has cards
const hasCards = computed(() => {
  return props.player?.hand?.cards && props.player.hand.cards.length > 0
})

const getStatusColor = (state) => {
  switch (state) {
    case 'Playing':
      return 'positive'
    case 'Idle':
      return 'grey'
    case 'Bust':
    case 'Busted':
      return 'negative'
    case 'Stand':
    case 'Standing':
      return 'warning'
    case 'Won':
    case 'WON':
      return 'green'
    case 'Lost':
    case 'LOST':
      return 'red'
    case 'Blackjack':
      return 'green'
    default:
      return 'grey'
  }
}

// Show win/loss amount when player has won or lost
const showWinLoss = computed(() => {
  return props.player?.state === 'Won' || props.player?.state === 'Lost'
})

// Get win/loss text
const getWinLossText = () => {
  if (!props.player?.bet) return ''
  const betAmount = props.player.bet
  if (props.player.state === 'Won') {
    return `+$${betAmount}`
  } else if (props.player.state === 'Lost') {
    return `-$${betAmount}`
  }
  return ''
}

// Get win/loss class for styling
const getWinLossClass = () => {
  if (props.player?.state === 'Won') {
    return 'win-amount'
  } else if (props.player?.state === 'Lost') {
    return 'loss-amount'
  }
  return ''
}
</script>

<style scoped>
.player-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.6rem;
  background: transparent;
  border: none;
  width: 100%;
  transition: all 0.3s ease;
}

.player-card:hover {
  transform: translateY(-2px);
}

.current-player {
  transform: scale(1.1);
  z-index: 10;
  position: relative;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(251, 191, 36, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
  padding: 0.8rem;
}

.current-player:hover {
  transform: scale(1.25) translateY(-2px);
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(251, 191, 36, 0.5) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(251, 191, 36, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.current-player .player-header {
  color: #fbbf24;
  font-size: 1.1rem;
}

.current-player .player-name {
  font-weight: 700;
}

.current-player .player-hand {
  min-height: 130px;
}

.current-player .status-badge {
  padding: 4px 10px;
  font-size: 0.85rem;
}

.current-player .info-item {
  font-size: 0.9rem;
}

.current-player .info-icon {
  height: 18px;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.player-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.status-badge {
  padding: 3px 8px;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 12px;
}

.win-loss-amount {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
}

.win-amount {
  color: #21ba45;
  background: rgba(33, 186, 69, 0.15);
}

.loss-amount {
  color: #c10015;
  background: rgba(193, 0, 21, 0.15);
}

.player-hand {
  display: flex;
  justify-content: center;
  min-height: 100px;
  align-items: center;
}

.player-info {
  display: flex;
  justify-content: space-around;
  gap: 0.5rem;
  padding-top: 0.4rem;
  border-top: none;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.info-icon {
  height: 14px;
  width: auto;
  vertical-align: middle;
  flex-shrink: 0;
}

/* Mobile Responsive - Much more compact */
@media (max-width: 600px) {
  .player-card {
    padding: 0.5rem;
    gap: 0.4rem;
  }

  .player-header {
    font-size: 0.75rem;
    gap: 0.3rem;
  }

  .player-header :deep(.q-icon) {
    font-size: 14px;
  }

  .player-hand {
    min-height: 70px;
  }

  .player-info {
    gap: 0.4rem;
    padding-top: 0.4rem;
    border-top-width: 1px;
  }

  .info-item {
    font-size: 0.7rem;
    gap: 0.25rem;
  }

  .info-icon {
    height: 12px;
  }

  .status-badge {
    padding: 2px 6px;
    font-size: 0.65rem;
  }

  .win-loss-amount {
    font-size: 0.75rem;
    padding: 2px 6px;
  }

  .current-player {
    transform: scale(1.2);
    border-radius: 12px;
    padding: 0.6rem;
  }

  .current-player .player-header {
    font-size: 0.95rem;
  }

  .current-player .player-hand {
    min-height: 90px;
  }

  .current-player .status-badge {
    padding: 3px 8px;
    font-size: 0.75rem;
  }

  .current-player .info-item {
    font-size: 0.8rem;
  }

  .current-player .info-icon {
    height: 14px;
  }
}

/* Small mobile devices - Even more compact */
@media (max-width: 400px) {
  .player-card {
    padding: 0.4rem;
    gap: 0.3rem;
  }

  .player-header {
    font-size: 0.7rem;
  }

  .player-hand {
    min-height: 60px;
  }

  .info-item {
    font-size: 0.65rem;
  }

  .info-icon {
    height: 10px;
  }

  .status-badge {
    padding: 2px 5px;
    font-size: 0.6rem;
  }

  .win-loss-amount {
    font-size: 0.7rem;
    padding: 1px 5px;
  }

  .current-player {
    transform: scale(1.15);
    border-radius: 10px;
    padding: 0.5rem;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }

  .current-player .player-header {
    font-size: 0.85rem;
  }

  .current-player .player-hand {
    min-height: 75px;
  }

  .current-player .status-badge {
    padding: 2px 7px;
    font-size: 0.7rem;
  }

  .current-player .info-item {
    font-size: 0.75rem;
  }

  .current-player .info-icon {
    height: 12px;
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .player-card {
    padding: 0.5rem;
    gap: 0.4rem;
  }

  .player-hand {
    min-height: 90px;
  }

  .player-header {
    font-size: 0.8rem;
  }

  .current-player {
    transform: scale(1.22);
    border-radius: 14px;
    padding: 0.7rem;
  }

  .current-player .player-header {
    font-size: 1.05rem;
  }

  .current-player .player-hand {
    min-height: 120px;
  }

  .current-player .status-badge {
    padding: 4px 9px;
    font-size: 0.8rem;
  }

  .current-player .win-loss-amount {
    font-size: 0.95rem;
    padding: 3px 10px;
  }

  .current-player .info-item {
    font-size: 0.85rem;
  }

  .current-player .info-icon {
    height: 16px;
  }
}
</style>
