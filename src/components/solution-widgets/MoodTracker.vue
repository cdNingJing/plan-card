<template>
  <div class="mood-tracker">
    <div class="mood-emojis">
      <button 
        v-for="mood in moods"
        :key="mood.emoji"
        @click="selectMood(mood)"
        class="mood-btn"
        :class="{ 'active': currentMood === mood.emoji }"
        :title="mood.label"
      >
        {{ mood.emoji }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  moods: {
    type: Array,
    default: () => []
  },
  currentMood: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['log-mood'])

const selectMood = (mood) => {
  emit('log-mood', mood)
}
</script>

<style scoped>
.mood-emojis {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.mood-btn {
  background: hsl(var(--secondary));
  border: 2px solid transparent;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mood-btn:hover {
  transform: scale(1.1);
  background: hsl(var(--secondary) / 0.8);
}

.mood-btn.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  transform: scale(1.1);
}

.mood-btn:active {
  transform: scale(1.05);
}

@media (max-width: 480px) {
  .mood-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .mood-emojis {
    gap: 6px;
  }
}
</style>