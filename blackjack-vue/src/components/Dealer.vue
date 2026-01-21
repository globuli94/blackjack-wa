<template>
  <div class="dealer-card">
    <div v-if="hasCards" class="dealer-header">
      <span class="dealer-title">Dealer</span>
    </div>

    <div class="dealer-status">
      <q-badge
        v-if="dealer.state === 'Bust' || dealer.state === 'Blackjack'"
        :color="getStatusColor(dealer.state)"
        :label="dealer.state"
        class="status-badge"
      />
    </div>

    <div class="dealer-hand">
      <Hand
        :cards="dealer.hand?.cards || []"
        :show-value="hasCards"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Hand from './Hand.vue'

const props = defineProps({
  dealer: {
    type: Object,
    required: true,
  },
})

const hasCards = computed(() => {
  return props.dealer?.hand?.cards && props.dealer.hand.cards.length > 0
})

const getStatusColor = (state) => {
  switch (state) {
    case 'Bust':
      return 'negative'
    case 'Blackjack':
      return 'green'
    default:
      return 'grey'
  }
}
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

.dealer-card {
  animation: fadeIn 0.4s ease-out;
}
.dealer-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  background: transparent;
  border-radius: 0;
  backdrop-filter: none;
  border: none;
  width: 350px;
  min-width: 350px;
  max-width: 350px;
  box-shadow: none;
  transition: none;
}

.dealer-card:hover {
  /* No hover effects */
}

.dealer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fbbf24;
  text-shadow: none;
}

.dealer-title {
  text-transform: uppercase;
  letter-spacing: 2px;
}

.dealer-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 6px 14px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 20px;
}

.dealer-hand {
  display: flex;
  justify-content: center;
  min-height: 120px;
  align-items: center;
}

/* Mobile Responsive - Keep fixed size, scaling handled by parent */
@media (max-width: 600px) {
  .dealer-card {
    /* Fixed size maintained, parent will scale */
  }

  .dealer-header {
    font-size: 1.3rem !important; /* Increased from 1rem */
  }

  .status-badge {
    font-size: 1.1rem !important; /* Increased from 0.9rem */
    padding: 8px 16px !important; /* Increased padding */
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .dealer-card {
    /* Fixed size maintained, parent will scale */
  }
}
</style>
