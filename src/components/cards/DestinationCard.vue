<template>
  <div class="destination-card">
    <div class="destination-info">
      <div class="info-item">
        <label>目的地</label>
        <select v-model="localData.destination" @change="handleUpdate">
          <option value="东京">东京</option>
          <option value="大阪">大阪</option>
          <option value="北京">北京</option>
          <option value="上海">上海</option>
          <option value="广州">广州</option>
        </select>
      </div>
      
      <div class="info-item">
        <label>停留时间</label>
        <div class="duration-input">
          <input 
            type="number" 
            v-model="localData.duration" 
            min="1" 
            max="30"
            @change="handleUpdate"
          />
          <span>天</span>
        </div>
      </div>
      
      <div class="info-item">
        <label>出发地</label>
        <input 
          type="text" 
          v-model="localData.departure"
          @change="handleUpdate"
        />
      </div>
    </div>
    
    <div class="travel-mode">
      <label>旅行模式</label>
      <div class="mode-options">
        <button 
          v-for="mode in travelModes" 
          :key="mode.value"
          :class="['mode-btn', { active: localData.mode === mode.value }]"
          @click="selectMode(mode.value)"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

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
  destination: props.data.destination || '东京',
  duration: props.data.duration || 5,
  departure: props.data.departure || '成都',
  mode: props.data.mode || 'normal'
})

const travelModes = [
  { value: 'budget', label: '穷游' },
  { value: 'normal', label: '常规' },
  { value: 'luxury', label: '豪华' }
]

const selectMode = (mode) => {
  localData.mode = mode
  handleUpdate()
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
.destination-card {
  space-y: 20px;
}

.destination-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
}

.info-item input,
.info-item select {
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #FFFFFF;
  transition: border-color 0.2s;
}

.info-item input:focus,
.info-item select:focus {
  outline: none;
  border-color: #333333;
}

.duration-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-input input {
  flex: 1;
  min-width: 60px;
}

.duration-input span {
  font-size: 0.875rem;
  color: #666666;
}

.travel-mode label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
  margin-bottom: 8px;
}

.mode-options {
  display: flex;
  gap: 8px;
}

.mode-btn {
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  background: #FFFFFF;
  color: #666666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #F8F9FA;
}

.mode-btn.active {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

@media (max-width: 480px) {
  .destination-info {
    grid-template-columns: 1fr;
  }
  
  .mode-options {
    flex-direction: column;
  }
}
</style> 