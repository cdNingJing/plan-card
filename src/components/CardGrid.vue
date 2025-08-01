<template>
  <div class="card-grid">
    <div class="grid-container">
      <!-- 通用固定卡片 -->
      <div 
        v-for="card in displayCards"
        :key="`${card.type}-${card.id || 'default'}`"
        class="card-item"
        :class="[`card-${card.type}`, `size-${card.size || '1x1'}`]"
        @click="handleCardClick(card)"
      >
        <component 
          :is="getCardComponent(card.type)"
          :data="card.data"
          :is-specific="card.isSpecific"
          @update="handleCardUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import TimeCard from './cards/TimeCard.vue'
import WeatherCard from './cards/WeatherCard.vue'
import AlarmCard from './cards/AlarmCard.vue'
import CalendarCard from './cards/CalendarCard.vue'
import ExamCountdownCard from './cards/ExamCountdownCard.vue'
import StudyProgressCard from './cards/StudyProgressCard.vue'
import ProjectProgressCard from './cards/ProjectProgressCard.vue'
import ExerciseRecordCard from './cards/ExerciseRecordCard.vue'

export default {
  name: 'CardGrid',
  components: {
    TimeCard,
    WeatherCard,
    AlarmCard,
    CalendarCard,
    ExamCountdownCard,
    StudyProgressCard,
    ProjectProgressCard,
    ExerciseRecordCard
  },
  props: {
    activeDream: {
      type: Object,
      default: null
    },
    universalCards: {
      type: Array,
      default: () => []
    },
    specificCards: {
      type: Array,
      default: () => []
    }
  },
  emits: ['card-click', 'card-update'],
  setup(props, { emit }) {
    
    // 合并和排序显示的卡片
    const displayCards = computed(() => {
      const universal = props.universalCards.map(card => ({
        ...card,
        isSpecific: false,
        priority: card.priority || 5
      }))
      
      const specific = props.specificCards.map(card => ({
        ...card,
        isSpecific: true,
        priority: card.priority || 1
      }))
      
      // 按优先级排序，特定卡片优先级更高
      return [...specific, ...universal].sort((a, b) => a.priority - b.priority)
    })
    
    // 获取卡片组件
    const getCardComponent = (cardType) => {
      const componentMap = {
        'time': 'TimeCard',
        'weather': 'WeatherCard',
        'alarm': 'AlarmCard',
        'calendar': 'CalendarCard',
        'exam-countdown': 'ExamCountdownCard',
        'study-progress': 'StudyProgressCard',
        'project-progress': 'ProjectProgressCard',
        'exercise-record': 'ExerciseRecordCard'
      }
      
      return componentMap[cardType] || 'div'
    }
    
    // 处理卡片点击
    const handleCardClick = (card) => {
      emit('card-click', card)
    }
    
    // 处理卡片更新
    const handleCardUpdate = (cardType, data) => {
      emit('card-update', { type: cardType, data })
    }
    
    return {
      displayCards,
      getCardComponent,
      handleCardClick,
      handleCardUpdate
    }
  }
}
</script>

<style lang="scss" scoped>
.card-grid {
  width: 100%;
  height: 100%;
  
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
    grid-auto-rows: 6rem;
    gap: 0.75rem;
    padding: 0.5rem;
    
    .card-item {
      border-radius: 0.75rem;
      background: #fff;
      box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-0.125rem);
        box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: scale(0.98);
      }
      
      // 不同尺寸的卡片
      &.size-1x1 {
        grid-column: span 1;
        grid-row: span 1;
      }
      
      &.size-2x1 {
        grid-column: span 2;
        grid-row: span 1;
      }
      
      &.size-1x2 {
        grid-column: span 1;
        grid-row: span 2;
      }
      
      &.size-2x2 {
        grid-column: span 2;
        grid-row: span 2;
      }
      
      // 特定类型卡片的特殊样式 - 高级配色
      &.card-time {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(102, 126, 234, 0.3);
      }
      
      &.card-weather {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(79, 172, 254, 0.3);
      }
      
      &.card-alarm {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(250, 112, 154, 0.3);
      }
      
      &.card-calendar {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #2d3748;
        box-shadow: 0 0.25rem 1.5rem rgba(168, 237, 234, 0.3);
      }
      
      // 特定场景卡片样式 - 高级配色
      &.card-exam-countdown {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #2d3748;
        box-shadow: 0 0.25rem 1.5rem rgba(255, 154, 158, 0.3);
      }
      
      &.card-study-progress {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #2d3748;
        box-shadow: 0 0.25rem 1.5rem rgba(168, 237, 234, 0.3);
      }
      
      &.card-project-progress {
        background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
        color: #2d3748;
        box-shadow: 0 0.25rem 1.5rem rgba(210, 153, 194, 0.3);
      }
      
      &.card-exercise-record {
        background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(137, 247, 254, 0.3);
      }
    }
  }
}

// 响应式调整
@media (max-width: 375px) {
  .card-grid .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    grid-auto-rows: 5rem;
    gap: 0.5rem;
  }
}

@media (min-width: 414px) {
  .card-grid .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    grid-auto-rows: 7rem;
    gap: 1rem;
  }
}

@media (min-width: 768px) {
  .card-grid .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    grid-auto-rows: 8rem;
  }
}
</style>