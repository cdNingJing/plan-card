<template>
  <div class="activity-logger">
    <div class="activity-buttons">
      <button 
        v-for="activity in activities"
        :key="activity"
        @click="logActivity(activity)"
        class="activity-btn"
      >
        {{ activity }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['log-activity'])

const logActivity = (activity) => {
  emit('log-activity', activity)
}
</script>

<style scoped>
.activity-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.activity-btn {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary) / 0.3);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
}

.activity-btn:hover {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  transform: translateY(-2px);
  box-shadow: 0 4px 8px hsl(var(--primary) / 0.2);
}

.activity-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .activity-buttons {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .activity-btn {
    padding: 10px 8px;
    font-size: 12px;
  }
}
</style>