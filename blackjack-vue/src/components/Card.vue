<template>
  <div
    ref="cardElement"
    class="playing-card"
    :class="{ 'hidden-card': hidden || isBlank }"
  >
    <div v-if="hidden || isBlank" class="card-back">
      <q-img
        src="icons/deck_pngs/back.png"
        :ratio="0.714"
        fit="contain"
        class="card-image"
      />
    </div>
    <div v-else class="card-front">
      <q-img
        :src="cardImagePath"
        :ratio="0.714"
        fit="contain"
        class="card-image"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useCardAnimations } from '../composables/useCardAnimations'

const props = defineProps({
  rank: {
    type: String,
    required: true,
  },
  suit: {
    type: String,
    required: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  animateOnMount: {
    type: Boolean,
    default: true,
  },
  animationDelay: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['animation-complete'])

const cardElement = ref(null)
const { dealCard, flipCard } = useCardAnimations()

// Check if card is blank
const isBlank = computed(() => {
  // Card is blank only if both rank and suit are explicitly 'blank'
  return props.rank === 'blank' && props.suit === 'blank'
})

const cardImagePath = computed(() => {
  // Check if card is blank
  if (isBlank.value) {
    return 'icons/deck_pngs/back.png'
  }

  // Validate that we have valid rank and suit
  if (!props.rank || !props.suit || props.rank === 'blank' || props.suit === 'blank') {
    return 'icons/deck_pngs/back.png'
  }

  // Map rank abbreviations to full names
  const rankMap = {
    'A': 'Ace',
    'J': 'Jack',
    'Q': 'Queen',
    'K': 'King'
  }

  const rankName = rankMap[props.rank] || props.rank

  // Format: {Suit}{Rank}.png (e.g., SpadesAce.png, Hearts10.png)
  return `icons/deck_pngs/${props.suit}${rankName}.png`
})

// Animate card when it appears
onMounted(() => {
  if (props.animateOnMount && cardElement.value) {
    dealCard(cardElement.value, props.animationDelay, () => {
      emit('animation-complete')
    })
  }
})

// Watch for card flip (when hidden state changes)
watch(
  () => props.hidden,
  (newVal, oldVal) => {
    if (cardElement.value && oldVal !== undefined && oldVal !== newVal) {
      // Card is being flipped
      const newImageSrc = newVal
        ? 'icons/deck_pngs/back.png'
        : cardImagePath.value
      flipCard(cardElement.value, newImageSrc)
    }
  }
)

// Expose methods and element for parent components
defineExpose({
  element: cardElement,
  dealCard: () => cardElement.value && dealCard(cardElement.value),
  flipCard: () =>
    cardElement.value &&
    flipCard(cardElement.value, cardImagePath.value),
})
</script>

<style scoped>
.playing-card {
  width: 70px;
  height: 98px;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.playing-card:hover {
  transform: translateY(-5px);
}

.card-front,
.card-back {
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 6px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hidden-card {
  background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
}

/* Tablet - Slightly smaller */
@media (min-width: 601px) and (max-width: 1024px) {
  .playing-card {
    width: 60px;
    height: 84px;
  }
}

/* Mobile Responsive - Much smaller cards */
@media (max-width: 600px) {
  .playing-card {
    width: 45px;
    height: 63px;
    border-radius: 4px;
  }
}

/* Small mobile devices */
@media (max-width: 400px) {
  .playing-card {
    width: 40px;
    height: 56px;
    border-radius: 3px;
  }
}
</style>
