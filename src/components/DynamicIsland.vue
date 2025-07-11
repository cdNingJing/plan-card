<template>
  <transition name="island-fade">
    <div v-if="visible" class="dynamic-island">
      <div class="island-content">
        <span class="island-title" :title="docName">{{ shortName }}</span>
        <div class="island-progress">
          <div class="progress-bar-bg">
            <div class="progress-bar-fg" :style="{ width: percent + '%' }"></div>
          </div>
          <span class="progress-text">{{ percent }}%</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  visible: Boolean,
  docName: String,
  percent: Number
})

const shortName = computed(() => {
  if (!props.docName) return ''
  return props.docName.length > 10 ? props.docName.slice(0, 8) + '...' : props.docName
})
</script>

<style scoped>
.dynamic-island {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  max-width: 320px;
  height: 44px;
  background: rgba(255,255,255,0.95);
  border-radius: 22px;
  box-shadow: 0 2px 16px 0 rgba(60,60,120,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 0 24px;
  border: 1.5px solid #e5e7eb;
  transition: box-shadow 0.2s, background 0.2s;
  pointer-events: none;
}
.island-content {
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
}
.island-title {
  font-size: 15px;
  color: #6366f1;
  font-weight: 600;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.island-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-bar-bg {
  width: 60px;
  height: 7px;
  background: #e0e7ff;
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fg {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(.4,0,.6,1);
}
.progress-text {
  font-size: 13px;
  color: #6366f1;
  font-weight: 500;
  min-width: 32px;
  text-align: right;
}
.island-fade-enter-active, .island-fade-leave-active {
  transition: opacity 0.25s;
}
.island-fade-enter-from, .island-fade-leave-to {
  opacity: 0;
}
</style> 