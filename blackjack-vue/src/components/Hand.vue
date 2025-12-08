<template>
  <div class="hand-container">
    <div class="cards-display">
      <Card
        v-for="(card, index) in cards"
        :key="`${card.rank}-${card.suit}-${index}`"
        :rank="card.rank"
        :suit="card.suit"
        :hidden="hideFirstCard && index === 0"
        class="card-item"
      />
    </div>
    <div v-if="showValue" class="hand-value">
      <q-chip
        :color="getValueColor()"
        text-color="white"
        size="md"
        icon="calculate"
      >
        Value: {{ handValue }}
      </q-chip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Card from './Card.vue'

const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  hideFirstCard: {
    type: Boolean,
    default: false,
  },
  showValue: {
    type: Boolean,
    default: true,
  },
})

const handValue = computed(() => {
  if (!props.cards || props.cards.length === 0) return 0

  let value = 0
  let aces = 0

  props.cards.forEach((card, index) => {
    // Skip first card if hidden
    if (props.hideFirstCard && index === 0) return

    if (card.rank === 'A') {
      aces++
      value += 11
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10
    } else {
      value += parseInt(card.rank)
    }
  })

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }

  return value
})

const getValueColor = () => {
  if (handValue.value === 21) return 'green'
  if (handValue.value > 21) return 'red'
  return 'primary'
}
</script>

<style scoped>
.hand-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.cards-display {
  display: flex;
  gap: -20px;
  flex-wrap: wrap;
  justify-content: center;
}

.card-item {
  margin-right: -20px;
}

.card-item:last-child {
  margin-right: 0;
}

.hand-value {
  margin-top: 0.5rem;
}
</style>
