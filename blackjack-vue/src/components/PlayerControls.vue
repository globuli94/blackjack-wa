<template>
  <div class="player-controls" :class="{ 'hidden': !hasContent }">
    <div v-if="gameState === 'Betting' && player && isCurrentUserTurn" class="betting-controls">
      <q-btn
        color="amber"
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

    <div v-if="gameState === 'Betting' && player && !isCurrentUserTurn" class="waiting-message">
      <div class="text-h6 text-center text-white q-pa-md">
        {{ possessiveName }} turn to bet
      </div>
    </div>

    <div v-if="gameState === 'Started' && player && isCurrentUserTurn" class="action-controls" >
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
        color="grey-8"
        icon="exit_to_app"
        label="Leave"
        @click="emit('leave')"
        size="lg"
        unelevated
      />
    </div>

    <div v-if="gameState === 'Started' && player && !isCurrentUserTurn" class="waiting-message">
      <div class="text-h6 text-center text-white q-pa-md">
        {{ possessiveName }} turn
      </div>
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
  currentUserName: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['hit', 'stand', 'double-down', 'bet', 'leave'])

const isCurrentUserTurn = computed(() => {
  console.log(props.player?.name, props.currentUserName)
  return props.player?.name === props.currentUserName
})

const hasContent = computed(() => {
  if (!props.player) return false
  if (props.gameState === 'Betting') return true
  if (props.gameState === 'Started') return true
  return false
})

const possessiveName = computed(() => {
  if (!props.player?.name) return ''
  const name = props.player.name
  // If name ends with 's', just add apostrophe, otherwise add 's
  return name.endsWith('s') ? `${name}'` : `${name}'s`
})

</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  width: clamp(300px, 80%, 600px);
  min-width: 300px;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin: 0 auto;
  min-height: 80px;
  visibility: visible;
  opacity: 1;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.player-controls.hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.betting-controls,
.action-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.betting-controls :deep(.q-btn) {
  flex: 1 1 auto;
  min-width: 150px;
  max-width: 100%;
  width: 100%;
}

.action-controls :deep(.q-btn) {
  flex: 1 1 auto;
  min-width: 120px;
  max-width: 200px;
}

.waiting-message {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.waiting-message :deep(.text-h6) {
  font-size: 1.5rem;
}

.player-controls :deep(.q-btn) {
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1.2rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.player-controls :deep(.q-btn__content) {
  font-size: 1.2rem;
}

.player-controls :deep(.q-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.player-controls :deep(.q-btn:active) {
  transform: translateY(0);
}

.btn-icon {
  height: 24px;
  width: auto;
  vertical-align: middle;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .player-controls {
    padding: 1rem; /* Increased from 0.75rem */
    width: clamp(250px, 90%, 100%);
    min-width: 250px;
    max-width: 100%;
  }

  .betting-controls {
    gap: 0.75rem; /* Increased from 0.5rem */
  }

  .betting-controls :deep(.q-btn) {
    min-width: 100%;
    width: 100%;
    font-size: 1.3rem; /* Increased from 1.1rem */
    padding: 1rem 1.25rem; /* Increased padding */
  }

  .action-controls {
    gap: 0.75rem; /* Increased from 0.5rem */
  }

  .action-controls :deep(.q-btn) {
    min-width: 100px;
    flex: 1 1 calc(33.333% - 0.5rem);
    font-size: 1.3rem; /* Increased from 1.1rem */
    padding: 1rem 1.25rem; /* Increased padding */
  }

  .waiting-message :deep(.text-h6) {
    font-size: 1.75rem !important; /* Increased from 1.5rem */
  }

  .player-controls :deep(.q-btn) {
    font-size: 1.3rem !important; /* Increased from 1.1rem */
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .player-controls {
    width: clamp(350px, 75%, 550px);
    min-width: 350px;
    max-width: 550px;
  }

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
