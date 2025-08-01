<template>
  <div class="time-card">
    <div class="time-display">
      <div class="current-time">{{ currentTime }}</div>
      <div class="current-date">{{ currentDate }}</div>
    </div>
    <div class="time-icon">
      <i class="icon-clock"></i>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'TimeCard',
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
  setup() {
    const currentTime = ref('')
    const currentDate = ref('')
    let timeInterval = null
    
    const updateTime = () => {
      const now = new Date()
      
      // 格式化时间
      currentTime.value = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      // 格式化日期
      currentDate.value = now.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    }
    
    onMounted(() => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
    })
    
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })
    
    return {
      currentTime,
      currentDate
    }
  }
}
</script>

<style lang="scss" scoped>
.time-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  .time-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .current-time {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
    }
    
    .current-date {
      font-size: 0.875rem;
      opacity: 0.8;
      font-weight: 500;
    }
  }
  
  .time-icon {
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
  .time-card {
    padding: 0.75rem;
    
    .time-display {
      .current-time {
        font-size: 1.25rem;
      }
      
      .current-date {
        font-size: 0.75rem;
      }
    }
  }
}
</style>