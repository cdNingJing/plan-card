<template>
  <div class="budget-card">
    <div class="budget-display">
      <div class="current-budget">
        <span class="budget-label">当前预算</span>
        <span class="budget-amount">¥{{ localData.current }}</span>
      </div>
      
      <div class="budget-slider">
        <input 
          type="range" 
          :min="localData.min" 
          :max="localData.max" 
          v-model="localData.current"
          @input="handleUpdate"
          class="slider"
        />
        <div class="slider-labels">
          <span>¥{{ localData.min }}</span>
          <span>¥{{ localData.max }}</span>
        </div>
      </div>
    </div>
    
    <div class="budget-presets">
      <span class="presets-label">快速选择</span>
      <div class="preset-buttons">
        <button 
          v-for="preset in presets" 
          :key="preset"
          :class="['preset-btn', { active: localData.current === preset }]"
          @click="setPreset(preset)"
        >
          ¥{{ preset }}
        </button>
      </div>
    </div>
    
    <div class="budget-tips">
      <div class="tip-item">
        <span class="tip-icon">💡</span>
        <span class="tip-text">
          根据您的预算，我们为您推荐了 {{ getRecommendationCount() }} 个选项
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])

const localData = reactive({
  current: props.data.current || 500,
  min: props.data.min || 100,
  max: props.data.max || 2000
})

const presets = [200, 500, 1000, 1500]

const setPreset = (amount) => {
  localData.current = amount
  handleUpdate()
}

const getRecommendationCount = () => {
  // 根据预算计算推荐数量的简单逻辑
  if (localData.current < 300) return 3
  if (localData.current < 800) return 6
  return 10
}

const handleUpdate = () => {
  emit('update', { ...localData })
}

// 监听props变化
watch(() => props.data, (newData) => {
  Object.assign(localData, newData)
}, { deep: true })
</script>

<style scoped>
.budget-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.budget-display {
  text-align: center;
}

.current-budget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.budget-label {
  font-size: 0.875rem;
  color: #666666;
  font-weight: 500;
}

.budget-amount {
  font-size: 2rem;
  font-weight: 600;
  color: #333333;
}

.budget-slider {
  width: 100%;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E5E5E5;
  outline: none;
  appearance: none;
  margin-bottom: 8px;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333333;
  cursor: pointer;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333333;
  cursor: pointer;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #999999;
}

.budget-presets {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.presets-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
}

.preset-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 8px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  background: #FFFFFF;
  color: #666666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #F8F9FA;
}

.preset-btn.active {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

.budget-tips {
  background: #F8F9FA;
  border-radius: 6px;
  padding: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-icon {
  font-size: 1rem;
}

.tip-text {
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .preset-buttons {
    justify-content: center;
  }
  
  .budget-amount {
    font-size: 1.5rem;
  }
}
</style> 