<template>
  <div class="study-progress-card">
    <div class="progress-info">
      <div class="subject-name">{{ subjectName }}</div>
      <div class="progress-display">
        <div class="progress-percentage">{{ Math.round(progress) }}%</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
      <div class="study-status">{{ studyStatus }}</div>
    </div>
    <div class="progress-icon">
      <BookOpen :size="20" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { BookOpen } from 'lucide-vue-next'

export default {
  name: 'StudyProgressCard',
  components: {
    BookOpen
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
    const subjectName = ref('数学')
    const progress = ref(75)
    const totalChapters = ref(12)
    const completedChapters = ref(9)
    
    const studyStatus = computed(() => {
      return `已完成 ${completedChapters.value}/${totalChapters.value} 章`
    })
    
    const loadStudyData = () => {
      if (props.data.subject) {
        subjectName.value = props.data.subject
      }
      if (props.data.progress !== undefined) {
        progress.value = props.data.progress
      }
      if (props.data.totalChapters) {
        totalChapters.value = props.data.totalChapters
      }
      if (props.data.completedChapters) {
        completedChapters.value = props.data.completedChapters
      }
      
      // 如果提供了章节信息，重新计算进度
      if (props.data.totalChapters && props.data.completedChapters) {
        progress.value = (completedChapters.value / totalChapters.value) * 100
      }
    }
    
    onMounted(() => {
      loadStudyData()
    })
    
    return {
      subjectName,
      progress,
      studyStatus
    }
  }
}
</script>

<style lang="scss" scoped>
.study-progress-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  .progress-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: calc(100% - 2rem);
    
    .subject-name {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }
    
    .progress-display {
      margin-bottom: 0.5rem;
      
      .progress-percentage {
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 0.25rem;
      }
      
      .progress-bar {
        width: 100%;
        height: 0.25rem;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 0.125rem;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 0.125rem;
          transition: width 0.3s ease;
        }
      }
    }
    
    .study-status {
      font-size: 0.75rem;
      opacity: 0.7;
    }
  }
  
  .progress-icon {
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
  .study-progress-card {
    padding: 0.75rem;
    
    .progress-info {
      width: calc(100% - 1.5rem);
      
      .subject-name {
        font-size: 0.75rem;
      }
      
      .progress-display {
        .progress-percentage {
          font-size: 1rem;
        }
      }
      
      .study-status {
        font-size: 0.625rem;
      }
    }
  }
}
</style>