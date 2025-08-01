<template>
  <div class="exam-countdown-card">
    <div class="countdown-info">
      <div class="exam-name">{{ examName }}</div>
      <div class="countdown-display">
        <div class="days-left">{{ daysLeft }}</div>
        <div class="days-label">天</div>
      </div>
      <div class="exam-date">{{ examDate }}</div>
    </div>
    <div class="countdown-icon">
      <CalendarDays :size="20" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CalendarDays } from 'lucide-vue-next'

export default {
  name: 'ExamCountdownCard',
  components: {
    CalendarDays
  },
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
    const examName = ref('高考')
    const targetDate = ref(new Date('2024-06-07'))
    const currentTime = ref(new Date())
    let timeInterval = null
    
    const daysLeft = computed(() => {
      const diffTime = targetDate.value - currentTime.value
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    })
    
    const examDate = computed(() => {
      return targetDate.value.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    })
    
    const loadExamData = () => {
      if (props.data.name) {
        examName.value = props.data.name
      }
      if (props.data.date) {
        targetDate.value = new Date(props.data.date)
      }
    }
    
    const updateTime = () => {
      currentTime.value = new Date()
    }
    
    onMounted(() => {
      loadExamData()
      updateTime()
      // 每小时更新一次
      timeInterval = setInterval(updateTime, 3600000)
    })
    
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })
    
    return {
      examName,
      daysLeft,
      examDate
    }
  }
}
</script>

<style lang="scss" scoped>
.exam-countdown-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  .countdown-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .exam-name {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }
    
    .countdown-display {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-bottom: 0.25rem;
      
      .days-left {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
      }
      
      .days-label {
        font-size: 0.875rem;
        opacity: 0.8;
      }
    }
    
    .exam-date {
      font-size: 0.75rem;
      opacity: 0.7;
    }
  }
  
  .countdown-icon {
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
  .exam-countdown-card {
    padding: 0.75rem;
    
    .countdown-info {
      .exam-name {
        font-size: 0.75rem;
      }
      
      .countdown-display {
        .days-left {
          font-size: 1.25rem;
        }
        
        .days-label {
          font-size: 0.75rem;
        }
      }
      
      .exam-date {
        font-size: 0.625rem;
      }
    }
  }
}
</style>