<template>
  <div class="medical-widget">
    <button @click="openAdvice" class="medical-btn">
      查看建议
    </button>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['open-advice'])

const openAdvice = () => {
  emit('open-advice')
}
</script>

<style scoped>
.medical-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
  font-size: 14px;
}

.medical-btn:hover {
  background: hsl(var(--destructive) / 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px hsl(var(--destructive) / 0.2);
}

.medical-btn:active {
  transform: translateY(0);
}
</style>