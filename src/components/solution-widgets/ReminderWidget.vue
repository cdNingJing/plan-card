<template>
  <div class="reminder-widget">
    <button @click="setReminder" class="reminder-btn">
      设置提醒
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  solution: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['set-reminder'])

const setReminder = () => {
  emit('set-reminder', props.solution)
}
</script>

<style scoped>
.reminder-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-size: 14px;
}

.reminder-btn:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px hsl(var(--primary) / 0.2);
}

.reminder-btn:active {
  transform: translateY(0);
}
</style>