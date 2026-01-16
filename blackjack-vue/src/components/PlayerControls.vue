<template>
  <div class="player-controls">
    <div v-if="gameState === 'Betting'" class="betting-controls">
      <q-btn
        color="amber"
        label="Place Bet"
        @click="emit('bet')"
        size="lg"
        unelevated
      >
        <template v-slot:default>
          <img src="icons/util-icons/bet.png" alt="Bet" class="btn-icon" />
          <span class="q-ml-sm">Place Bet</span>
        </template>
      </q-btn>
    </div>

    <div v-if="gameState === 'Started' && player" class="action-controls">
      <q-btn
        color="primary"
        icon="add"
        label="Hit"
        @click="emit('hit')"
        size="lg"
        class="q-mr-sm"
        unelevated
      />
      <q-btn
        color="negative"
        icon="front_hand"
        label="Stand"
        @click="emit('stand')"
        size="lg"
        class="q-mr-sm"
        unelevated
      />
      <q-btn
        v-if="canDoubleDown"
        color="warning"
        icon="arrow_upward"
        label="Double Down"
        @click="emit('double-down')"
        size="lg"
        unelevated
      />
    </div>

    <div v-if="player" class="player-info q-mt-md">
      <q-chip
        icon="person"
        color="primary"
        text-color="white"
        size="md"
      >
        {{ player.name }}
      </q-chip>
      <q-chip
        color="green"
        text-color="white"
        size="md"
      >
        <img src="icons/util-icons/dollars.png" alt="Money" class="chip-icon" />
        <span class="q-ml-xs">Money: ${{ player.money }}</span>
      </q-chip>
      <q-chip
        v-if="player.bet"
        color="amber"
        text-color="black"
        size="md"
      >
        <img src="icons/util-icons/casino-chip.png" alt="Bet" class="chip-icon" />
        <span class="q-ml-xs">Bet: ${{ player.bet }}</span>
      </q-chip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  player: {
    type: Object,
    default: null,
  },
  gameState: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['hit', 'stand', 'double-down', 'bet'])

const canDoubleDown = computed(() => {
  return props.player?.hand?.cards?.length === 2
})
</script>

<style scoped>
.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  width: 600px;
  min-width: 600px;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.betting-controls,
.action-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.player-controls :deep(.q-btn) {
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.player-controls :deep(.q-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.player-controls :deep(.q-btn:active) {
  transform: translateY(0);
}

.player-info {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.player-info :deep(.q-chip) {
  height: 36px;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0 0.75rem;
}

.btn-icon {
  height: 24px;
  width: auto;
  vertical-align: middle;
}

.chip-icon {
  height: 20px;
  width: auto;
  vertical-align: middle;
}

/* Mobile Responsive - Keep fixed size, scaling handled by parent */
@media (max-width: 600px) {
  .player-controls {
    /* Fixed size maintained, parent will scale */
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .betting-controls,
  .action-controls {
    gap: 0.625rem;
  }

  .player-controls :deep(.q-btn) {
    min-height: 50px;
    padding: 0.625rem 1.25rem;
  }
}
</style>
