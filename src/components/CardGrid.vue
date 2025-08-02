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
import NotesCard from './cards/NotesCard.vue'
import MessagesCard from './cards/MessagesCard.vue'
import PhotosCard from './cards/PhotosCard.vue'
import MusicCard from './cards/MusicCard.vue'
import SettingsCard from './cards/SettingsCard.vue'
import CalculatorCard from './cards/CalculatorCard.vue'
import MapCard from './cards/MapCard.vue'
import BrowserCard from './cards/BrowserCard.vue'

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
    ExerciseRecordCard,
    NotesCard,
    MessagesCard,
    PhotosCard,
    MusicCard,
    SettingsCard,
    CalculatorCard,
    MapCard,
    BrowserCard
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
        'exercise-record': 'ExerciseRecordCard',
        'notes': 'NotesCard',
        'messages': 'MessagesCard',
        'photos': 'PhotosCard',
        'music': 'MusicCard',
        'settings': 'SettingsCard',
        'calculator': 'CalculatorCard',
        'map': 'MapCard',
        'browser': 'BrowserCard'
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
      
      // 新增的app风格卡片样式
      &.card-notes {
        background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
        color: #2d3748;
        box-shadow: 0 0.25rem 1.5rem rgba(255, 234, 167, 0.3);
      }
      
      &.card-messages {
        background: linear-gradient(135deg, #55a3ff 0%, #003d82 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(85, 163, 255, 0.3);
      }
      
      &.card-photos {
        background: linear-gradient(135deg, #ff9a56 0%, #ffad56 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(255, 154, 86, 0.3);
      }
      
      &.card-music {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(102, 126, 234, 0.3);
      }
      
      &.card-settings {
        background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(116, 185, 255, 0.3);
      }
      
      &.card-calculator {
        background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(253, 121, 168, 0.3);
      }
      
      &.card-map {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(46, 204, 113, 0.3);
      }
      
      &.card-browser {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        box-shadow: 0 0.25rem 1.5rem rgba(52, 152, 219, 0.3);
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