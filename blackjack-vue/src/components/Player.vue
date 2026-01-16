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
    </div>

    <div class="player-hand">
      <Hand
        ref="handRef"
        :cards="player.hand?.cards || []"
        :show-value="true"
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
import { ref, watch, nextTick } from 'vue'
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

const getStatusColor = (state) => {
  switch (state) {
    case 'Playing':
      return 'positive'
    case 'Idle':
      return 'grey'
    case 'Bust':
      return 'negative'
    case 'Stand':
      return 'warning'
    case 'Won':
      return 'green'
    case 'Lost':
      return 'red'
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
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.player-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.25);
}

.current-player {
  border-color: #fbbf24;
  box-shadow: 0 0 24px rgba(251, 191, 36, 0.6);
  background: rgba(251, 191, 36, 0.15);
  transform: scale(1.02);
}

.current-player:hover {
  transform: scale(1.02) translateY(-3px);
}

.player-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
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
  justify-content: center;
}

.status-badge {
  padding: 6px 14px;
  font-size: 0.85rem;
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
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-icon {
  height: 18px;
  width: auto;
  vertical-align: middle;
  flex-shrink: 0;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .player-card {
    padding: 1rem;
    gap: 0.75rem;
    border-radius: 12px;
  }

  .player-header {
    font-size: 1rem;
  }

  .player-hand {
    min-height: 120px;
  }

  .player-info {
    gap: 0.5rem;
    padding-top: 0.5rem;
  }

  .info-item {
    font-size: 0.85rem;
  }

  .info-icon {
    height: 16px;
  }

  .status-badge {
    padding: 4px 10px;
    font-size: 0.75rem;
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
