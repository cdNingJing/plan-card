<template>
  <div class="main-content-area">
    <!-- 新的主要内容区域 -->
    <div class="content-showcase">
      <div
        class="dreams-container"
        :style="{ transform: `translateX(${cardsTranslateX}px)` }"
      >
        <div
          v-for="(dream, dreamIndex) in dreams"
          :key="`dream-${dream.id}`"
          class="dream-workspace"
          :class="{ 'active': dreamIndex === activeDreamIndex }"
        >
          
          
          <!-- 四象限任务组 -->
          <div class="quadrant-matrix">
            <div
              v-for="(card, cardIndex) in dream.cards"
              :key="`card-${dreamIndex}-${cardIndex}`"
              class="quadrant-card"
              :class="`quadrant-${card.quadrant}`"
            >
              
              <div class="quadrant-content">
                <div class="task-list">
                  <div
                    v-for="(task, taskIndex) in card.tasks"
                    :key="`task-${dreamIndex}-${cardIndex}-${taskIndex}`"
                    class="task-item"
                    :class="{ 'completed': task.completed }"
                  >
                    <div class="task-content">
                      <div class="task-title">{{ task.title }}</div>
                      <div class="task-description">{{ task.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Flame, Star, Zap, FileText, Target, TrendingUp, Clock, Users } from 'lucide-vue-next'

const props = defineProps({
  dreams: {
    type: Array,
    required: true
  },
  activeDreamIndex: {
    type: Number,
    required: true
  },
  cardsTranslateX: {
    type: Number,
    required: true
  }
})

// 展开相关功能已移除

// 切换任务完成状态
const toggleTask = (dreamIndex, cardIndex, taskIndex) => {
  // 这里可以添加任务状态切换逻辑
  console.log(`Toggle task: ${dreamIndex}-${cardIndex}-${taskIndex}`)
}

// 获取梦想进度百分比
const getProgressPercentage = (dream) => {
  const totalTasks = dream.cards.reduce((sum, card) => sum + card.tasks.length, 0)
  const completedTasks = dream.cards.reduce((sum, card) => 
    sum + card.tasks.filter(task => task.completed).length, 0)
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
}

// 获取紧急任务数量
const getUrgentTasksCount = (dream) => {
  return dream.cards
    .filter(card => card.quadrant.includes('urgent'))
    .reduce((sum, card) => sum + card.tasks.length, 0)
}

// 获取重要任务数量
const getImportantTasksCount = (dream) => {
  return dream.cards
    .filter(card => card.quadrant.includes('important'))
    .reduce((sum, card) => sum + card.tasks.length, 0)
}

// 获取总任务数量
const getTotalTasksCount = (dream) => {
  return dream.cards.reduce((sum, card) => sum + card.tasks.length, 0)
}

// 获取优先级样式类
const getPriorityClass = (quadrant) => {
  const classMap = {
    'important-urgent': 'priority-critical',
    'important-not-urgent': 'priority-high',
    'not-important-urgent': 'priority-medium',
    'not-important-not-urgent': 'priority-low'
  }
  return classMap[quadrant] || 'priority-low'
}

// 获取优先级图标
const getPriorityIcon = (quadrant) => {
  const iconMap = {
    'important-urgent': Flame,
    'important-not-urgent': Star,
    'not-important-urgent': Zap,
    'not-important-not-urgent': FileText
  }
  return iconMap[quadrant] || FileText
}

</script>

<style lang="scss" scoped>

.main-content-area {
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 4rem;
  overflow: hidden;
  
  // 添加细微的纹理
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.01) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.01) 0%, transparent 50%);
    pointer-events: none;
  }

  .content-showcase {
    width: 100%;
    height: 100%;
    
    .dreams-container {
      display: flex;
      width: 500%;
      height: 100%;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      
      .dream-workspace {
        width: 20%;
        height: 100%;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        opacity: 0.4;
        transition: opacity 0.3s ease;
        
        &.active {
          opacity: 1;
        }
        
        
        // 四象限矩阵 - 立体网格设计
        .quadrant-matrix {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 0.5rem;
          background: transparent;
          border-radius: 0.75rem;
          padding: 0;
          min-height: 0;
          height: 100%;
          overflow: hidden;
          
          // 全局立体阴影
          filter: drop-shadow(0 0.125rem 0.125rem rgba(0, 0, 0, 0.08));
          
          .quadrant-card {
            background: linear-gradient(135deg, #fafafa 0%, #eeeeee 100%);
            padding: 0.75rem;
            cursor: default;
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            display: flex;
            flex-direction: column;
            position: relative;
            border-radius: 0.75rem;
            overflow: hidden;
            min-height: 0;
            
            // 高端立体效果
            box-shadow: var(--inset-medium), 
                        0 1px 3px rgba(0, 0, 0, 0.03), 
                        0 0 0 1px rgba(184, 184, 184, 0.02);
            
            // 光泽覆盖层
            &::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 40%;
              background: var(--gloss-light);
              border-radius: 12px 12px 0 0;
              pointer-events: none;
              opacity: 0.6;
            }
            
            &:hover {
              transform: translateY(-0.125rem);
              box-shadow: var(--inset-light),
                          0 2px 4px rgba(0, 0, 0, 0.04),
                          0 0 0 2px rgba(184, 184, 184, 0.03);
              
              &::before {
                opacity: 0.8;
                background: var(--gloss-medium);
              }
            }
            
            
            // 四象限标识 - 对比背景设计
            &.quadrant-important-urgent {
              background: radial-gradient(circle at top left, #f4f4f4 0%, #fafafa 70%, #eeeeee 100%);
            }
            
            &.quadrant-important-not-urgent {
              background: radial-gradient(circle at top right, #f4f4f4 0%, #fafafa 70%, #eeeeee 100%);
            }
            
            &.quadrant-not-important-urgent {
              background: radial-gradient(circle at bottom left, #f4f4f4 0%, #fafafa 70%, #eeeeee 100%);
            }
            
            &.quadrant-not-important-not-urgent {
              background: radial-gradient(circle at bottom right, #f4f4f4 0%, #fafafa 70%, #eeeeee 100%);
            }
            
            
            .quadrant-content {
              flex: 1;
              position: relative;
              z-index: 2;
              min-height: 0;
              display: flex;
              flex-direction: column;
              
              .task-list {
                flex: 1;
                overflow-y: auto;
                min-height: 0;
                
                // 隐藏滚动条
                &::-webkit-scrollbar {
                  width: 2px;
                }
                
                &::-webkit-scrollbar-track {
                  background: transparent;
                }
                
                &::-webkit-scrollbar-thumb {
                  background: var(--border-medium);
                  border-radius: 1px;
                }
                
                .task-item {
                  display: flex;
                  align-items: flex-start;
                  gap: 0.5rem;
                  padding: 0.5rem 0;
                  
                  &:last-child {
                    border-bottom: none;
                  }
                  
                  &.completed {
                    opacity: 0.5;
                    
                    .task-title {
                      text-decoration: line-through;
                    }
                  }
                  
                  
                  .task-content {
                    flex: 1;
                    min-width: 0;
                    
                    .task-title {
                      font-size: 0.75rem;
                      font-weight: 700;
                      color: var(--text-primary);
                      margin-bottom: 0.25rem;
                      line-height: 1.3;
                      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
                    }
                    
                    .task-description {
                      font-size: 0.65rem;
                      color: var(--text-secondary);
                      line-height: 1.4;
                      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
                    }
                  }
                }
              }
            }
            
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-height: 700px) {
  .main-content-area {
    .dreams-container {
      .dream-workspace {
        padding: 0.5rem;
        gap: 0.5rem;
        
        .dream-overview {
          padding: 0.5rem;
        }
        
        .quadrant-matrix {
          gap: 0.375rem;
          
          .quadrant-card {
            padding: 0.5rem;
            
            .quadrant-header {
              margin-bottom: 0.5rem;
            }
            
            .task-list {
              .task-item {
                padding: 0.375rem 0;
                
                .task-content {
                  .task-title {
                    font-size: 0.7rem;
                  }
                  
                  .task-description {
                    font-size: 0.6rem;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 380px) {
  .main-content-area {
    .dreams-container {
      .dream-workspace {
        padding: 0.5rem;
        gap: 0.5rem;
        
        .dream-overview {
          .overview-stats {
            gap: 1rem;
            
            .stat-item {
              font-size: 0.8rem;
            }
          }
        }
        
        .quadrant-matrix {
          .quadrant-card {
            padding: 0.5rem;
            
            .task-list {
              .task-item {
                .task-content {
                  .task-title {
                    font-size: 0.65rem;
                  }
                  
                  .task-description {
                    font-size: 0.55rem;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>