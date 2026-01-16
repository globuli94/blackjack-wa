<template>
  <div class="game-controls">
    <q-btn
      v-if="gameState === 'Initialized' || !gameState"
      color="primary"
      icon="refresh"
      label="Initialize Game"
      @click="emit('initialize')"
      size="md"
      class="q-mr-sm"
      unelevated
    />

    <q-btn
      v-if="gameState === 'Initialized'"
      color="positive"
      icon="play_arrow"
      label="Start Game"
      @click="emit('start')"
      :disable="players.length === 0"
      size="md"
      class="q-mr-sm"
      unelevated
    />

    <q-btn
      v-if="gameState === 'Initialized' && !hasJoined"
      color="secondary"
      icon="person_add"
      label="Join"
      @click="emit('add-player')"
      size="md"
      unelevated
    />

    <q-btn
      v-if="gameState === 'Initialized' && hasJoined"
      color="negative"
      icon="exit_to_app"
      label="Leave"
      @click="emit('leave')"
      size="md"
      unelevated
    />

    <q-btn
      color="negative"
      icon="refresh"
      label="Reset"
      @click="emit('reset')"
      size="md"
      class="q-ml-sm"
      unelevated
    />

    <div v-if="gameState" class="game-state-badge q-ml-md">
      <q-badge
        :color="getStateBadgeColor(gameState)"
        :label="`State: ${gameState}`"
        class="text-subtitle2"
        style="padding: 8px 16px"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  gameState: {
    type: String,
    default: null,
  },
  players: {
    type: Array,
    default: () => [],
  },
  currentUserName: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['initialize', 'start', 'add-player', 'reset', 'leave'])

const hasJoined = computed(() => {
  if (!props.currentUserName || !props.players || props.players.length === 0) {
    return false
  }
  return props.players.some(player => player.name === props.currentUserName)
})

const getStateBadgeColor = (state) => {
  switch (state) {
    case 'Initialized':
      return 'info'
    case 'Betting':
      return 'warning'
    case 'Started':
      return 'positive'
    case 'Evaluated':
      return 'accent'
    default:
      return 'grey'
  }
}
</script>

<style scoped>
.game-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  width: auto;
  flex-wrap: wrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.game-controls :deep(.q-btn) {
  min-height: 44px;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.game-controls :deep(.q-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.game-controls :deep(.q-btn:active) {
  transform: translateY(0);
}

.game-state-badge {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
}

.game-state-badge :deep(.q-badge) {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .game-controls {
    padding: 0.75rem;
    gap: 0.5rem;
    border-radius: 12px;
  }

  .game-controls :deep(.q-btn) {
    min-height: 48px;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    flex: 1 1 auto;
    min-width: calc(50% - 0.25rem);
  }

  .game-state-badge {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .game-state-badge :deep(.q-badge) {
    font-size: 0.85rem;
    padding: 6px 12px;
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .game-controls {
    gap: 0.625rem;
  }

  .game-controls :deep(.q-btn) {
    min-height: 46px;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
