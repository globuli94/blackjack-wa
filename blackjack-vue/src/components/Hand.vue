<template>
  <div ref="handContainer" class="hand-container">
    <div class="cards-display">
      <Card
        v-for="(card, index) in paddedCards"
        :key="`${card.rank}-${card.suit}-${index}`"
        :ref="(el) => setCardRef(el, index)"
        :rank="card.rank"
        :suit="card.suit"
        :animate-on-mount="animateCards"
        :animation-delay="index * 200"
        class="card-item"
        @animation-complete="onCardAnimationComplete"
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
import { computed, ref, watch, nextTick } from 'vue'
import Card from './Card.vue'
import { useCardAnimations } from '../composables/useCardAnimations'

const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  showValue: {
    type: Boolean,
    default: true,
  },
  animateCards: {
    type: Boolean,
    default: true,
  },
})

const handContainer = ref(null)
const cardRefs = ref([])
const { celebrate, shake, glow, shuffleEffect } = useCardAnimations()

// Add blank card when there's only one card (like the old Hand.js)
const paddedCards = computed(() => {
  if (!props.cards || props.cards.length === 0) return []
  
  // Filter out any existing blank cards first (both rank and suit must be 'blank')
  const realCards = props.cards.filter(
    (card) => !(card.rank === 'blank' && card.suit === 'blank')
  )
  
  if (realCards.length === 1) {
    return [...realCards, { rank: 'blank', suit: 'blank' }]
  }
  return props.cards
})

const handValue = computed(() => {
  if (!props.cards || props.cards.length === 0) return 0

  let value = 0
  let aces = 0

  props.cards.forEach((card) => {
    // Skip blank cards
    if (card.rank === 'blank' || card.suit === 'blank') return

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

const setCardRef = (el, index) => {
  if (el) {
    // Handle both component instance and direct element
    if (el.$el) {
      cardRefs.value[index] = el.$el
    } else if (el.element) {
      cardRefs.value[index] = el.element
    } else {
      cardRefs.value[index] = el
    }
  }
}

const onCardAnimationComplete = () => {
  // Handle animation completion if needed
}

// Watch for hand value changes to trigger animations
watch(
  handValue,
  (newValue, oldValue) => {
    if (oldValue === undefined || oldValue === 0) return

    nextTick(() => {
      const firstCard = cardRefs.value[0]
      if (!firstCard) return

      if (newValue === 21) {
        // Blackjack - celebrate!
        celebrate(firstCard)
      } else if (newValue > 21) {
        // Bust - shake
        shake(firstCard)
      }
    })
  }
)

// Watch for card count changes to trigger shuffle effect
watch(
  () => props.cards.length,
  (newLength, oldLength) => {
    if (oldLength && newLength > oldLength && handContainer.value) {
      // New card added - could trigger shuffle effect
      // shuffleEffect(handContainer.value)
    }
  }
)

// Expose methods for parent components
defineExpose({
  celebrate: () => {
    const firstCard = cardRefs.value[0]
    if (firstCard) celebrate(firstCard)
  },
  shake: () => {
    const firstCard = cardRefs.value[0]
    if (firstCard) shake(firstCard)
  },
  glow: (color) => {
    const firstCard = cardRefs.value[0]
    if (firstCard) glow(firstCard, color)
  },
  shuffleEffect: () => {
    if (handContainer.value) shuffleEffect(handContainer.value)
  },
})
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
