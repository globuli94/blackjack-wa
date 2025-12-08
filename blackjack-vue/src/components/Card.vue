<template>
  <div class="playing-card" :class="{ 'hidden-card': hidden }">
    <div v-if="hidden" class="card-back">
      <q-img
        src="/icons/deck_pngs/back.png"
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
import { computed } from 'vue'

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
})

const cardImagePath = computed(() => {
  // Map rank abbreviations to full names
  const rankMap = {
    'A': 'Ace',
    'J': 'Jack',
    'Q': 'Queen',
    'K': 'King'
  }

  const rankName = rankMap[props.rank] || props.rank

  // Format: {Suit}{Rank}.png (e.g., SpadesAce.png, Hearts10.png)
  return `/icons/deck_pngs/${props.suit}${rankName}.png`
})
</script>

<style scoped>
.playing-card {
  width: 100px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.playing-card:hover {
  transform: translateY(-5px);
}

.card-front,
.card-back {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hidden-card {
  background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
}
</style>
