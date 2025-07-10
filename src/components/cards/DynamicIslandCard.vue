<template>
  <div class="dynamic-island-card" v-if="showCard">
    <div class="available-tools-section">
      <span class="section-title">计划</span>
      <span class="section-desc">根据您的旅行时间和兴趣，建议制定详细行程表，优先推荐兵马俑、古城墙、大雁塔等经典景点，配合地道的陕西美食体验。</span>
      <div class="tools-grid">
        <div 
          v-for="tool in AVAILABLE_TOOLS" 
          :key="tool.title"
          class="tool-item"
        >
          <div class="tool-title">{{ tool.title }}</div>
          <div class="tool-description">{{ tool.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AVAILABLE_TOOLS } from '@/config/infoDenseConfig.js'

const showCard = ref(false)

// 显示卡片
const showCardWithAnimation = () => {
  showCard.value = true
}

defineExpose({
  showCardWithAnimation
})

onMounted(() => {
  setTimeout(() => {
    showCardWithAnimation()
  }, 100)
})
</script>

<style scoped>
.dynamic-island-card {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 20px;
  padding: 20px;
  margin: 0;
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: slideIn 0.5s ease forwards;
  display: flex;
  flex-direction: column;
  height: 100%;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.available-tools-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  display: block;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0;
}

.section-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 12px;
  display: block;
  position: sticky;
  top: 32px;
  z-index: 1;
  background: inherit;
  padding-bottom: 4px;
}

.tools-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tool-item {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.tool-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.tool-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.tool-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}
</style> 