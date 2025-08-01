<template>
  <div class="weather-card">
    <div class="weather-info">
      <div class="temperature">{{ temperature }}°</div>
      <div class="condition">{{ condition }}</div>
      <div class="location">{{ location }}</div>
    </div>
    <div class="weather-icon">
      <i :class="weatherIcon"></i>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'WeatherCard',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    isSpecific: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const temperature = ref(22)
    const condition = ref('晴朗')
    const location = ref('北京')
    
    const weatherIcon = computed(() => {
      const iconMap = {
        '晴朗': 'icon-sun',
        '多云': 'icon-cloud',
        '阴天': 'icon-cloud',
        '雨天': 'icon-cloud-rain',
        '雪天': 'icon-cloud-snow'
      }
      return iconMap[condition.value] || 'icon-sun'
    })
    
    const loadWeatherData = async () => {
      // TODO: 实际的天气API调用
      // 这里使用模拟数据
      if (props.data.temperature !== undefined) {
        temperature.value = props.data.temperature
      }
      if (props.data.condition) {
        condition.value = props.data.condition
      }
      if (props.data.location) {
        location.value = props.data.location
      }
    }
    
    onMounted(() => {
      loadWeatherData()
    })
    
    return {
      temperature,
      condition,
      location,
      weatherIcon
    }
  }
}
</script>

<style lang="scss" scoped>
.weather-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  .weather-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .temperature {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
    }
    
    .condition {
      font-size: 0.875rem;
      opacity: 0.8;
      font-weight: 500;
      margin-bottom: 0.125rem;
    }
    
    .location {
      font-size: 0.75rem;
      opacity: 0.6;
    }
  }
  
  .weather-icon {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    opacity: 0.6;
    
    i {
      font-size: 1rem;
    }
  }
}

// 响应式调整
@media (max-width: 375px) {
  .weather-card {
    padding: 0.75rem;
    
    .weather-info {
      .temperature {
        font-size: 1.25rem;
      }
      
      .condition {
        font-size: 0.75rem;
      }
      
      .location {
        font-size: 0.625rem;
      }
    }
  }
}
</style>