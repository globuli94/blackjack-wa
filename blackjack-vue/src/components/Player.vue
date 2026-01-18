<template>
  <div
    ref="playerCardElement"
    class="player-card"
    :class="{ 'current-player': isCurrent }"
  >
    <div class="player-status">
      <q-badge
        v-if="player.state === 'Won' || player.state === 'WON' || player.state === 'Lost' || player.state === 'LOST' || player.state === 'Blackjack' || isBlackjack"
        :color="getStatusColor(player.state)"
        :label="player.state === 'Blackjack' || isBlackjack ? 'Blackjack' : player.state"
        class="status-badge"
      />
      <span v-if="(player.state === 'Lost' || player.state === 'LOST') && displayBet > 0" class="bet-indicator loss">
        -${{ displayBet }}
      </span>
      <span v-if="(player.state === 'Won' || player.state === 'WON' || player.state === 'Blackjack' || isBlackjack) && displayBet > 0" class="bet-indicator win">
        +${{ displayBet }}
      </span>
    </div>

    <div class="player-hand">
      <Hand
        ref="handRef"
        :cards="player.hand?.cards || []"
        :show-value="hasCards"
        :animate-cards="isCurrent"
      />
    </div>

    <div class="player-header-wrapper">
      <div class="player-header">
        <q-icon
          :name="isCurrent ? 'person' : 'person_outline'"
          size="sm"
          :color="isCurrent ? 'amber' : 'white'"
        />
        <span class="player-name">{{ player.name }}</span>
      </div>
      <div class="header-line"></div>
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
        glow(playerCardElement.value, 'white', 0) // Continuous white glow
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
</script>

<style scoped>
.player-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: transparent;
  border-radius: 0;
  backdrop-filter: none;
  border: none;
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  flex: 0 0 280px;
  transition: all 0.3s ease;
  box-shadow: none;
}

.player-card:hover {
  transform: none;
}

.current-player {
  border-radius: 16px;
  overflow: hidden;
}

.current-player:hover {
  transform: none;
}

.player-header-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 0;
  gap: 0.75rem;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #0f766e 0%, #15803d 100%);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.header-line {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.player-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  padding: 6px 14px;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 20px;
}

.player-hand {
  display: flex;
  justify-content: center;
  min-height: 140px;
  align-items: center;
}

.player-info {
  display: flex;
  justify-content: space-around;
  gap: 0.75rem;
  padding-top: 0;
  margin-top: -0.25rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.info-icon {
  height: 24px;
  width: auto;
  vertical-align: middle;
  flex-shrink: 0;
}

.bet-indicator {
  font-size: 1rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.bet-indicator.win {
  color: #10b981;
  background-color: rgba(0, 0, 0, 0.8);
}

.bet-indicator.loss {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.2);
}

/* Mobile Responsive - Scaling handled by parent transform */
@media (max-width: 600px) {
  .player-card {
    /* Size maintained at 280px, scaling handled by parent transform */
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .player-card {
    padding: 1.15rem;
  }

  .player-hand {
    min-height: 130px;
  }
}
</style>
