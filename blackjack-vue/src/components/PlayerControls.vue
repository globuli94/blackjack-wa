<template>
  <div class="player-controls">
    <div v-if="gameState === 'Betting'" class="betting-controls">
      <q-btn
        color="amber"
        icon="paid"
        label="Place Bet"
        @click="emit('bet')"
        size="lg"
        unelevated
      />
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
        icon="account_balance_wallet"
        color="green"
        text-color="white"
        size="md"
      >
        Money: ${{ player.money }}
      </q-chip>
      <q-chip
        v-if="player.bet"
        icon="paid"
        color="amber"
        text-color="black"
        size="md"
      >
        Bet: ${{ player.bet }}
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
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  min-width: 400px;
}

.betting-controls,
.action-controls {
  display: flex;
  gap: 0.5rem;
}

.player-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
