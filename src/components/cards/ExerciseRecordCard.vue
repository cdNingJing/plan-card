<template>
  <div class="exercise-record-card">
    <div class="exercise-info">
      <div class="exercise-type">{{ exerciseType }}</div>
      <div class="exercise-data">
        <div class="primary-metric">
          <span class="value">{{ primaryValue }}</span>
          <span class="unit">{{ primaryUnit }}</span>
        </div>
        <div class="secondary-metric">{{ secondaryMetric }}</div>
      </div>
      <div class="exercise-date">{{ exerciseDate }}</div>
    </div>
    <div class="exercise-icon">
      <component :is="exerciseIcon" :size="20" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Activity, Waves, Bike, Dumbbell, User, Footprints } from 'lucide-vue-next'

export default {
  name: 'ExerciseRecordCard',
  components: {
    Activity,
    Waves,
    Bike,
    Dumbbell,
    User,
    Footprints
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
    const exerciseType = ref('跑步')
    const primaryValue = ref(5.2)
    const primaryUnit = ref('公里')
    const duration = ref(28) // 分钟
    const calories = ref(245)
    const date = ref(new Date())
    
    const secondaryMetric = computed(() => {
      return `${duration.value}分钟 · ${calories.value}卡路里`
    })
    
    const exerciseDate = computed(() => {
      return date.value.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    })
    
    const exerciseIcon = computed(() => {
      const iconMap = {
        '跑步': 'Activity',
        '游泳': 'Waves',
        '骑行': 'Bike',
        '健身': 'Dumbbell',
        '瑜伽': 'User',
        '步行': 'Footprints'
      }
      return iconMap[exerciseType.value] || 'Activity'
    })
    
    const loadExerciseData = () => {
      if (props.data.type) {
        exerciseType.value = props.data.type
      }
      if (props.data.distance !== undefined) {
        primaryValue.value = props.data.distance
        primaryUnit.value = props.data.distanceUnit || '公里'
      }
      if (props.data.duration) {
        duration.value = props.data.duration
      }
      if (props.data.calories) {
        calories.value = props.data.calories
      }
      if (props.data.date) {
        date.value = new Date(props.data.date)
      }
    }
    
    onMounted(() => {
      loadExerciseData()
    })
    
    return {
      exerciseType,
      primaryValue,
      primaryUnit,
      secondaryMetric,
      exerciseDate,
      exerciseIcon
    }
  }
}
</script>

<style lang="scss" scoped>
.exercise-record-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  .exercise-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .exercise-type {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }
    
    .exercise-data {
      margin-bottom: 0.5rem;
      
      .primary-metric {
        display: flex;
        align-items: baseline;
        gap: 0.25rem;
        margin-bottom: 0.25rem;
        
        .value {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1;
        }
        
        .unit {
          font-size: 0.75rem;
          opacity: 0.8;
        }
      }
      
      .secondary-metric {
        font-size: 0.75rem;
        opacity: 0.7;
      }
    }
    
    .exercise-date {
      font-size: 0.625rem;
      opacity: 0.6;
    }
  }
  
  .exercise-icon {
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
  .exercise-record-card {
    padding: 0.75rem;
    
    .exercise-info {
      .exercise-type {
        font-size: 0.75rem;
      }
      
      .exercise-data {
        .primary-metric {
          .value {
            font-size: 1rem;
          }
          
          .unit {
            font-size: 0.625rem;
          }
        }
        
        .secondary-metric {
          font-size: 0.625rem;
        }
      }
      
      .exercise-date {
        font-size: 0.5rem;
      }
    }
  }
}
</style>