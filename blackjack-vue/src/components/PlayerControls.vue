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
        color="positive"
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
        color="grey-8"
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
  padding: 0.5rem;
  background: transparent !important;
  border: none !important;
  width: 100%;
  max-width: 500px;
}

/* Remove any blue background from action-controls and betting-controls */
.betting-controls,
.action-controls {
  background: transparent !important;
  border: none !important;
}

.betting-controls,
.action-controls {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.player-controls :deep(.q-btn) {
  min-height: 36px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.8rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* Remove any blue colors from buttons - override Quasar defaults */
.player-controls :deep(.q-btn.bg-primary),
.player-controls :deep(.q-btn--primary),
.player-controls :deep(.q-btn[class*="primary"]) {
  background-color: transparent !important;
  color: inherit !important;
  border: none !important;
}

.player-controls :deep(.q-btn:hover) {
  transform: translateY(-2px);
}

.player-controls :deep(.q-btn:active) {
  transform: translateY(0);
}

/* Ensure positive (green) button shows correctly */
.player-controls :deep(.q-btn.bg-positive),
.player-controls :deep(.q-btn--positive) {
  background-color: #21ba45 !important;
  color: white !important;
}

/* Ensure negative (red) button shows correctly */
.player-controls :deep(.q-btn.bg-negative),
.player-controls :deep(.q-btn--negative) {
  background-color: #c10015 !important;
  color: white !important;
}

/* Ensure warning (orange) button shows correctly */
.player-controls :deep(.q-btn.bg-warning),
.player-controls :deep(.q-btn--warning) {
  background-color: #f2c037 !important;
  color: black !important;
}

/* Ensure amber button shows correctly */
.player-controls :deep(.q-btn.bg-amber),
.player-controls :deep(.q-btn--amber) {
  background-color: #ffb300 !important;
  color: black !important;
}

.player-info {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: none;
}

.player-info :deep(.q-chip) {
  height: 28px;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0 0.5rem;
}

.btn-icon {
  height: 18px;
  width: auto;
  vertical-align: middle;
}

.chip-icon {
  height: 16px;
  width: auto;
  vertical-align: middle;
}

/* Mobile Responsive - More compact */
@media (max-width: 600px) {
  .player-controls {
    padding: 0.5rem;
    margin: 0 0.25rem;
  }

  .betting-controls,
  .action-controls {
    gap: 0.3rem;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .player-controls :deep(.q-btn) {
    flex: 1;
    min-width: calc(50% - 0.15rem);
    min-height: 36px;
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }

  .player-info {
    gap: 0.3rem;
    margin-top: 0.4rem;
    padding-top: 0.4rem;
  }

  .player-info :deep(.q-chip) {
    font-size: 0.7rem;
    height: 24px;
    padding: 0 0.5rem;
  }

  .btn-icon {
    height: 18px;
  }

  .chip-icon {
    height: 16px;
  }
}

/* Small mobile devices */
@media (max-width: 400px) {
  .player-controls {
    padding: 0.4rem;
  }

  .player-controls :deep(.q-btn) {
    min-height: 32px;
    font-size: 0.75rem;
    padding: 0.3rem 0.5rem;
  }

  .player-info :deep(.q-chip) {
    font-size: 0.65rem;
    height: 22px;
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .player-controls {
    padding: 0.4rem;
    max-width: 450px;
  }

  .betting-controls,
  .action-controls {
    gap: 0.4rem;
  }

  .player-controls :deep(.q-btn) {
    min-height: 34px;
    padding: 0.45rem 0.9rem;
    font-size: 0.75rem;
  }

  .player-info :deep(.q-chip) {
    height: 26px;
    font-size: 0.7rem;
  }
}
</style>
