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
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(251, 191, 36, 0.4);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.dealer-card:hover {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.dealer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.4rem;
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
  padding: 6px 14px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 20px;
}

.dealer-hand {
  display: flex;
  justify-content: center;
  min-height: 160px;
  align-items: center;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .dealer-card {
    padding: 1rem;
    gap: 0.75rem;
    border-radius: 12px;
    max-width: 100%;
  }

  .dealer-header {
    font-size: 1.1rem;
    gap: 0.5rem;
  }

  .dealer-title {
    letter-spacing: 1px;
  }

  .dealer-hand {
    min-height: 140px;
  }

  .status-badge {
    padding: 4px 10px;
    font-size: 0.8rem;
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 1024px) {
  .dealer-card {
    padding: 1.25rem;
    max-width: 450px;
  }

  .dealer-header {
    font-size: 1.25rem;
  }

  .dealer-hand {
    min-height: 150px;
  }
}
</style>
