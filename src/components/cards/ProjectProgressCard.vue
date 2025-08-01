<template>
  <div class="project-progress-card">
    <div class="progress-info">
      <div class="project-name">{{ projectName }}</div>
      <div class="progress-display">
        <div class="progress-percentage">{{ Math.round(progress) }}%</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
      <div class="project-status">{{ projectStatus }}</div>
    </div>
    <div class="progress-icon">
      <i class="icon-briefcase"></i>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'ProjectProgressCard',
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
    const projectName = ref('新产品开发')
    const progress = ref(68)
    const totalTasks = ref(25)
    const completedTasks = ref(17)
    const dueDate = ref('2024-12-31')
    
    const projectStatus = computed(() => {
      const days = Math.ceil((new Date(dueDate.value) - new Date()) / (1000 * 60 * 60 * 24))
      return days > 0 ? `还有${days}天截止` : '已截止'
    })
    
    const loadProjectData = () => {
      if (props.data.name) {
        projectName.value = props.data.name
      }
      if (props.data.progress !== undefined) {
        progress.value = props.data.progress
      }
      if (props.data.totalTasks) {
        totalTasks.value = props.data.totalTasks
      }
      if (props.data.completedTasks) {
        completedTasks.value = props.data.completedTasks
      }
      if (props.data.dueDate) {
        dueDate.value = props.data.dueDate
      }
      
      // 如果提供了任务信息，重新计算进度
      if (props.data.totalTasks && props.data.completedTasks) {
        progress.value = (completedTasks.value / totalTasks.value) * 100
      }
    }
    
    onMounted(() => {
      loadProjectData()
    })
    
    return {
      projectName,
      progress,
      projectStatus
    }
  }
}
</script>

<style lang="scss" scoped>
.project-progress-card {
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
    
    .project-name {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      opacity: 0.9;
      color: #2d3436;
    }
    
    .progress-display {
      margin-bottom: 0.5rem;
      
      .progress-percentage {
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 0.25rem;
        color: #2d3436;
      }
      
      .progress-bar {
        width: 100%;
        height: 0.25rem;
        background: rgba(45, 52, 54, 0.2);
        border-radius: 0.125rem;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: #2d3436;
          border-radius: 0.125rem;
          transition: width 0.3s ease;
        }
      }
    }
    
    .project-status {
      font-size: 0.75rem;
      opacity: 0.7;
      color: #2d3436;
    }
  }
  
  .progress-icon {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    opacity: 0.6;
    color: #2d3436;
    
    i {
      font-size: 1rem;
    }
  }
}

// 响应式调整
@media (max-width: 375px) {
  .project-progress-card {
    padding: 0.75rem;
    
    .progress-info {
      width: calc(100% - 1.5rem);
      
      .project-name {
        font-size: 0.75rem;
      }
      
      .progress-display {
        .progress-percentage {
          font-size: 1rem;
        }
      }
      
      .project-status {
        font-size: 0.625rem;
      }
    }
  }
}
</style>