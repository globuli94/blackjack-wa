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
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.game-state-badge {
  display: flex;
  align-items: center;
}
</style>
