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
  padding: 2rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(251, 191, 36, 0.3);
  min-width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dealer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
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
  padding: 4px 12px;
  font-size: 0.85rem;
}

.dealer-hand {
  display: flex;
  justify-content: center;
  min-height: 180px;
}
</style>
