<template>
  <div class="dealer-card">
    <div class="dealer-header">
      <q-icon name="support_agent" size="md" color="amber" />
      <span class="dealer-title">Dealer</span>
    </div>

    <div class="dealer-status">
      <q-badge
        :color="getStatusColor(dealer.state)"
        :label="dealer.state"
        class="status-badge"
      />
    </div>

    <div class="dealer-hand">
      <Hand
        :cards="dealer.hand?.cards || []"
        :show-value="true"
      />
    </div>
  </div>
</template>

<script setup>
import Hand from './Hand.vue'

defineProps({
  dealer: {
    type: Object,
    required: true,
  },
})

const getStatusColor = (state) => {
  switch (state) {
    case 'Playing':
      return 'positive'
    case 'Idle':
      return 'grey'
    case 'Bust':
      return 'negative'
    case 'Stand':
      return 'warning'
    default:
      return 'grey'
  }
}
</script>

<style scoped>
.dealer-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.7rem;
  background: transparent;
  border: none;
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.dealer-card:hover {
  transform: translateY(-2px);
}

.dealer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fbbf24;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  padding: 3px 8px;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 12px;
}

.dealer-hand {
  display: flex;
  justify-content: center;
  min-height: 100px;
  align-items: center;
}

/* Mobile Responsive - More compact */
@media (max-width: 600px) {
  .dealer-card {
    padding: 0.6rem;
    gap: 0.4rem;
    max-width: 100%;
  }

  .dealer-header {
    font-size: 0.85rem;
    gap: 0.4rem;
  }

  .dealer-header :deep(.q-icon) {
    font-size: 18px;
  }

  .dealer-title {
    letter-spacing: 0.5px;
  }

  .dealer-hand {
    min-height: 70px;
  }

  .status-badge {
    padding: 2px 6px;
    font-size: 0.65rem;
  }
}

/* Small mobile devices */
@media (max-width: 400px) {
  .dealer-card {
    padding: 0.5rem;
    gap: 0.3rem;
  }

  .dealer-header {
    font-size: 0.75rem;
  }

  .dealer-hand {
    min-height: 60px;
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .dealer-card {
    padding: 0.6rem;
    max-width: 350px;
  }

  .dealer-header {
    font-size: 0.9rem;
  }

  .dealer-hand {
    min-height: 90px;
  }
}
</style>
