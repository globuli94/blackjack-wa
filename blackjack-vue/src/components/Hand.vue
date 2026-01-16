<template>
  <div ref="handContainer" class="hand-container">
    <div 
      ref="cardsDisplay" 
      class="cards-display"
      :style="{
        transform: `scale(${cardScale})`,
        transformOrigin: 'center center'
      }"
    >
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
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
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
const cardsDisplay = ref(null)
const cardRefs = ref([])
const containerWidth = ref(240) // Default width
const resizeObserver = ref(null)
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

// Calculate card scale based on number of cards and container width
// Dynamically calculate based on container width
const cardScale = computed(() => {
  const realCardCount = paddedCards.value.filter(
    (card) => !(card.rank === 'blank' && card.suit === 'blank')
  ).length

  if (realCardCount === 0) {
    return 1
  }

  // Use measured container width
  const containerW = containerWidth.value
  if (containerW <= 0) {
    // If not measured yet, use default calculation
    // Player cards: 280px - 40px padding = 240px
    // Dealer cards: 500px - 48px padding = 452px
    // Use 240px as default for now
    const defaultWidth = 240
    const cardWidth = 100
    const cardOverlap = 20
    const margin = 15
    const totalWidthNeeded = cardWidth + (realCardCount - 1) * (cardWidth - cardOverlap)
    const availableWidth = defaultWidth - (margin * 2)
    
    // Prevent division by zero
    if (totalWidthNeeded <= 0 || availableWidth <= 0) {
      return 1
    }
    
    const scale = availableWidth / totalWidthNeeded
    return Math.max(0.5, Math.min(1, scale))
  }

  // Card base width: 100px
  // Overlap: 20px (each additional card adds 80px visible width)
  const cardWidth = 100
  const cardOverlap = 20
  const margin = 15 // Reduced margin for better scaling

  // Calculate total width needed for all cards
  // First card: 100px, each additional: 80px (100px - 20px overlap)
  const totalWidthNeeded = cardWidth + (realCardCount - 1) * (cardWidth - cardOverlap)

  // Available width is container width minus margins
  const availableWidth = containerW - (margin * 2)

  // Prevent division by zero
  if (totalWidthNeeded <= 0 || availableWidth <= 0) {
    return 1
  }

  // Calculate scale to fit all cards with margin
  const scale = availableWidth / totalWidthNeeded

  // Ensure minimum scale of 0.5 (50%) for better visibility and maximum of 1
  const finalScale = Math.max(0.5, Math.min(1, scale))
  
  // Debug: log scale calculation (remove in production if needed)
  // console.log(`Cards: ${realCardCount}, Container: ${containerW}px, Needed: ${totalWidthNeeded}px, Scale: ${finalScale}`)
  
  return finalScale
})

// Function to update container width - measure the available width for cards
const updateContainerWidth = () => {
  try {
    // First try: Get parent element width (player-hand or dealer-hand) - this is the actual container
    if (handContainer.value?.parentElement) {
      const parent = handContainer.value.parentElement
      const rect = parent.getBoundingClientRect()
      const parentWidth = rect.width
      if (parentWidth > 0 && !isNaN(parentWidth)) {
        containerWidth.value = parentWidth
        return
      }
    }
    
    // Second try: Get grandparent (player-card or dealer-card) width and subtract padding
    if (handContainer.value?.parentElement?.parentElement) {
      const grandparent = handContainer.value.parentElement.parentElement
      const rect = grandparent.getBoundingClientRect()
      const grandparentWidth = rect.width
      if (grandparentWidth > 0 && !isNaN(grandparentWidth)) {
        // Subtract padding: player-card has 1.25rem (20px) on each side = 40px total
        // dealer-card has 1.5rem (24px) on each side = 48px total
        // Use 40px as default
        containerWidth.value = grandparentWidth - 40
        return
      }
    }
    
    // Fallback: Measure hand container itself
    if (handContainer.value) {
      const rect = handContainer.value.getBoundingClientRect()
      const width = rect.width
      if (width > 0 && !isNaN(width)) {
        containerWidth.value = width
        return
      }
    }
  } catch (error) {
    // Silently handle any measurement errors
    console.warn('Error measuring container width:', error)
  }
}

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

// Watch for card count changes to trigger shuffle effect and update scale
watch(
  () => props.cards.length,
  () => {
    // Always update when cards change, not just when increasing
    if (handContainer.value) {
      // New card added or removed - update container width and scale
      nextTick(() => {
        updateContainerWidth()
        setTimeout(() => {
          updateContainerWidth()
        }, 100)
        setTimeout(() => {
          updateContainerWidth()
        }, 300)
      })
    }
  }
)

// Update container width when it becomes available or cards change
watch(
  () => [handContainer.value, paddedCards.value.length],
  () => {
    nextTick(() => {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        updateContainerWidth()
        // Re-observe if ResizeObserver exists
        const observeTarget = handContainer.value?.parentElement || handContainer.value
        if (resizeObserver.value && observeTarget && window.ResizeObserver) {
          resizeObserver.value.disconnect()
          resizeObserver.value = new ResizeObserver(() => {
            updateContainerWidth()
          })
          resizeObserver.value.observe(observeTarget)
        }
      }, 50)
    })
  },
  { immediate: true }
)

// Also update on window resize and use ResizeObserver
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateContainerWidth)
    
    // Use ResizeObserver on the parent container (player-hand or dealer-hand)
    // This is the element that actually constrains the width
    nextTick(() => {
      const observeTarget = handContainer.value?.parentElement || handContainer.value
      if (window.ResizeObserver && observeTarget) {
        resizeObserver.value = new ResizeObserver(() => {
          updateContainerWidth()
        })
        resizeObserver.value.observe(observeTarget)
      }
    })
    
    // Initial measurement with delays to ensure DOM is ready
    nextTick(() => {
      updateContainerWidth()
      setTimeout(() => {
        updateContainerWidth()
      }, 100)
      setTimeout(() => {
        updateContainerWidth()
      }, 500)
    })
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateContainerWidth)
    if (resizeObserver.value) {
      resizeObserver.value.disconnect()
      resizeObserver.value = null
    }
  }
})

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
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  overflow: visible;
  width: fit-content;
  min-width: 0;
  transition: transform 0.3s ease;
  will-change: transform;
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

.hand-value :deep(.q-chip) {
  font-size: 0.95rem;
  font-weight: 500;
  padding: 6px 14px;
}
</style>
