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
  background: transparent;
  border-radius: 0;
  backdrop-filter: none;
  border: none;
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  transition: all 0.3s ease;
  box-shadow: none;
}

.player-card:hover {
  transform: none;
}

.current-player {
  /* No special styling for current player */
}

.current-player:hover {
  transform: none;
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

/* Mobile Responsive - Keep fixed size, scaling handled by parent */
@media (max-width: 600px) {
  .player-card {
    /* Fixed size maintained, parent will scale */
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
