<template>
  <div class="fixed-bottom-bar">
    <div 
      class="dynamic-title" 
      :class="{ 'show': verticalTranslateY >= containerHeight * 0.85 }"
    >
      {{ currentDreamTitle }}
    </div>
    <div class="bottom-content">
      <div class="bottom-text">底部对话框</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dreams: {
    type: Array,
    required: true
  },
  activeDreamIndex: {
    type: Number,
    required: true
  },
  verticalTranslateY: {
    type: Number,
    required: true
  },
  containerHeight: {
    type: Number,
    required: true
  }
})

const currentDreamTitle = computed(() => {
  return props.dreams[props.activeDreamIndex]?.title || ''
})
</script>

<style lang="scss" scoped>
.fixed-bottom-bar {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  
  .dynamic-title {
    position: absolute;
    top: -2.7rem;
    left: 1rem;
    right: 1rem;
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    &.show {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .bottom-content {
    text-align: center;
    
    .bottom-text {
      font-size: 1rem;
      font-weight: 500;
      color: #333;
    }
  }
}
</style>