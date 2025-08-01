<template>
  <div class="calendar-card">
    <div class="calendar-header">
      <div class="current-date">
        <div class="month">{{ currentMonth }}</div>
        <div class="day">{{ currentDay }}</div>
      </div>
    </div>
    
    <div class="calendar-info">
      <div v-if="todayEvents.length > 0" class="today-events">
        <div class="event-count">{{ todayEvents.length }}个日程</div>
      </div>
      <div v-else class="no-events">
        <div class="no-events-text">今日无安排</div>
      </div>
    </div>
    
    <div class="calendar-icon">
      <Calendar :size="20" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Calendar } from 'lucide-vue-next'

export default {
  name: 'CalendarCard',
  components: {
    Calendar
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
    const today = ref(new Date())
    const todayEvents = ref([])
    
    const currentMonth = computed(() => {
      return today.value.toLocaleDateString('zh-CN', { month: 'short' })
    })
    
    const currentDay = computed(() => {
      return today.value.getDate()
    })
    
    const loadCalendarData = () => {
      // TODO: 从API或存储加载今日日程
      if (props.data.events) {
        todayEvents.value = props.data.events
      } else {
        // 模拟数据
        todayEvents.value = [
          { id: 1, title: '团队会议', time: '10:00' },
          { id: 2, title: '项目评审', time: '14:30' }
        ]
      }
    }
    
    onMounted(() => {
      loadCalendarData()
      // 每分钟更新时间
      setInterval(() => {
        today.value = new Date()
      }, 60000)
    })
    
    return {
      today,
      todayEvents,
      currentMonth,
      currentDay
    }
  }
}
</script>

<style lang="scss" scoped>
.calendar-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  .calendar-header {
    .current-date {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      
      .month {
        font-size: 0.75rem;
        opacity: 0.8;
        font-weight: 500;
      }
      
      .day {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
      }
    }
  }
  
  .calendar-info {
    flex: 1;
    display: flex;
    align-items: center;
    
    .today-events,
    .no-events {
      .event-count,
      .no-events-text {
        font-size: 0.75rem;
        opacity: 0.7;
      }
      
      .event-count {
        color: #4caf50;
        font-weight: 500;
      }
    }
  }
  
  .calendar-icon {
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
  .calendar-card {
    padding: 0.75rem;
    
    .calendar-header {
      .current-date {
        .month {
          font-size: 0.625rem;
        }
        
        .day {
          font-size: 1.25rem;
        }
      }
    }
    
    .calendar-info {
      .today-events,
      .no-events {
        .event-count,
        .no-events-text {
          font-size: 0.625rem;
        }
      }
    }
  }
}
</style>