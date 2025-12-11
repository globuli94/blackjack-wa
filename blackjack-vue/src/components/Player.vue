<template>
  <div class="player-card" :class="{ 'current-player': isCurrent }">
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
        :cards="player.hand?.cards || []"
        :show-value="true"
      />
    </div>

    <div class="player-info">
      <div class="info-item">
        <img src="/icons/util-icons/dollar_tiny.png" alt="Money" class="info-icon" />
        <span>${{ player.money }}</span>
      </div>
      <div v-if="player.bet" class="info-item">
        <img src="/icons/util-icons/casino-chip.png" alt="Bet" class="info-icon" />
        <span>${{ player.bet }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import Hand from './Hand.vue'

defineProps({
  player: {
    type: Object,
    required: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
})

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
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  min-width: 250px;
  transition: all 0.3s ease;
}

.player-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.current-player {
  border-color: #fbbf24;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.1);
}

.player-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.player-name {
  flex: 1;
}

.player-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 4px 12px;
  font-size: 0.8rem;
}

.player-hand {
  display: flex;
  justify-content: center;
  min-height: 160px;
}

.player-info {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.info-icon {
  height: 16px;
  width: auto;
  vertical-align: middle;
}
</style>
