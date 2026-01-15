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
      v-if="gameState === 'Initialized'"
      color="secondary"
      icon="person_add"
      label="Add Player"
      @click="emit('add-player')"
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
defineProps({
  gameState: {
    type: String,
    default: null,
  },
  players: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['initialize', 'start', 'add-player', 'reset'])

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
  gap: 0.4rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  width: 100%;
  max-width: 100%;
  flex-wrap: wrap;
}

.game-controls :deep(.q-btn) {
  min-height: 32px;
  padding: 0.4rem 0.8rem;
  font-weight: 600;
  font-size: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.game-controls :deep(.q-btn:hover) {
  transform: translateY(-2px);
}

.game-controls :deep(.q-btn:active) {
  transform: translateY(0);
}

.game-state-badge {
  display: flex;
  align-items: center;
  margin-left: 0.3rem;
}

.game-state-badge :deep(.q-badge) {
  font-weight: 600;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
}

/* Mobile Responsive - More compact */
@media (max-width: 600px) {
  .game-controls {
    padding: 0.4rem;
    gap: 0.3rem;
  }

  .game-controls :deep(.q-btn) {
    min-height: 32px;
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
    flex: 1 1 auto;
    min-width: calc(50% - 0.15rem);
  }

  .game-state-badge {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 0.3rem;
  }

  .game-state-badge :deep(.q-badge) {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
}

/* Small mobile devices */
@media (max-width: 400px) {
  .game-controls {
    padding: 0.3rem;
    gap: 0.25rem;
  }

  .game-controls :deep(.q-btn) {
    min-height: 28px;
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
    min-width: calc(50% - 0.125rem);
  }

  .game-state-badge :deep(.q-badge) {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .game-controls {
    gap: 0.4rem;
    padding: 0.4rem;
  }

  .game-controls :deep(.q-btn) {
    min-height: 30px;
    padding: 0.35rem 0.7rem;
    font-size: 0.7rem;
  }
}
</style>
