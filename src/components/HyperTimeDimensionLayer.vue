<template>
  <div class="hyper-time-dimension" v-if="isExpanded">
    <!-- 关闭按钮 -->
    <div class="close-header">
      <button class="close-button" @click="handleClose">
        <ChevronDown :size="24" />
      </button>
      <h2 class="dimension-title">{{ dream?.title }} - 超时间视图</h2>
    </div>
    
    <!-- 内容滚动区域 -->
    <div class="dimension-content">
      <!-- 时间轴导航 -->
      <div class="timeline-nav">
        <button 
          v-for="tab in timelineTabs"
          :key="tab.key"
          class="timeline-tab"
          :class="{ 'active': activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
        </button>
      </div>
      
      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 历史轨迹 -->
        <div v-if="activeTab === 'history'" class="history-section">
          <h3>历史轨迹</h3>
          <div class="timeline">
            <div 
              v-for="event in historyEvents"
              :key="event.id"
              class="timeline-item"
            >
              <div class="timeline-date">{{ event.date }}</div>
              <div class="timeline-content">
                <h4>{{ event.title }}</h4>
                <p>{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 现状分析 -->
        <div v-if="activeTab === 'analysis'" class="analysis-section">
          <h3>现状分析</h3>
          <div class="analysis-grid">
            <div class="analysis-card">
              <h4>当前进展</h4>
              <div class="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#333"
                    stroke-width="2"
                    opacity="0.3"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#4caf50"
                    stroke-width="2"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div class="progress-text">{{ dream?.progress || 0 }}%</div>
              </div>
            </div>
            
            <div class="analysis-card">
              <h4>影响因素</h4>
              <ul class="factor-list">
                <li v-for="factor in influenceFactors" :key="factor.id">
                  <span class="factor-name">{{ factor.name }}</span>
                  <span class="factor-impact" :class="factor.type">{{ factor.impact }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 未来展望 -->
        <div v-if="activeTab === 'future'" class="future-section">
          <h3>未来规划</h3>
          <div class="future-timeline">
            <div 
              v-for="milestone in futureMilestones"
              :key="milestone.id"
              class="milestone-item"
            >
              <div class="milestone-date">{{ milestone.date }}</div>
              <div class="milestone-content">
                <h4>{{ milestone.title }}</h4>
                <p>{{ milestone.description }}</p>
                <div class="milestone-probability">
                  实现概率: {{ milestone.probability }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 多维关联 -->
        <div v-if="activeTab === 'connections'" class="connections-section">
          <h3>多维关联</h3>
          <div class="connection-map">
            <div class="central-node">
              <div class="node-circle main-node">
                {{ dream?.title }}
              </div>
            </div>
            <div class="connected-nodes">
              <div 
                v-for="connection in connections"
                :key="connection.id"
                class="connection-item"
              >
                <div class="connection-line"></div>
                <div class="node-circle" :class="connection.type">
                  {{ connection.title }}
                </div>
                <div class="connection-strength">
                  {{ connection.strength }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  ChevronDown,
  Clock,
  BarChart3,
  TrendingUp,
  Share2
} from 'lucide-vue-next'

export default {
  name: 'HyperTimeDimensionLayer',
  components: {
    ChevronDown,
    Clock,
    BarChart3,
    TrendingUp,
    Share2
  },
  props: {
    dream: {
      type: Object,
      default: null
    },
    isExpanded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const activeTab = ref('history')
    
    const timelineTabs = [
      { key: 'history', label: '历史', icon: Clock },
      { key: 'analysis', label: '现状', icon: BarChart3 },
      { key: 'future', label: '未来', icon: TrendingUp },
      { key: 'connections', label: '关联', icon: Share2 }
    ]
    
    // 模拟数据
    const historyEvents = ref([
      {
        id: 1,
        date: '2024-01-15',
        title: '制定初步计划',
        description: '开始为这个梦想制定详细的实施计划'
      },
      {
        id: 2,
        date: '2024-03-20',
        title: '第一个里程碑',
        description: '完成了第一阶段的目标设定'
      },
      {
        id: 3,
        date: '2024-06-10',
        title: '中期调整',
        description: '根据实际情况调整了策略和时间安排'
      }
    ])
    
    const influenceFactors = ref([
      { id: 1, name: '时间投入', impact: '高', type: 'positive' },
      { id: 2, name: '资源支持', impact: '中', type: 'positive' },
      { id: 3, name: '外部环境', impact: '低', type: 'negative' }
    ])
    
    const futureMilestones = ref([
      {
        id: 1,
        date: '2024-12-31',
        title: '年度目标完成',
        description: '完成本年度设定的所有关键指标',
        probability: 85
      },
      {
        id: 2,
        date: '2025-06-30',
        title: '中期目标达成',
        description: '实现中期规划的重要节点',
        probability: 70
      },
      {
        id: 3,
        date: '2026-12-31',
        title: '最终目标实现',
        description: '完全实现这个梦想的终极目标',
        probability: 60
      }
    ])
    
    const connections = ref([
      { id: 1, title: '健康管理', type: 'health', strength: 75 },
      { id: 2, title: '财务规划', type: 'finance', strength: 60 },
      { id: 3, title: '家庭关系', type: 'family', strength: 90 },
      { id: 4, title: '职业发展', type: 'career', strength: 45 }
    ])
    
    // 进度圆环计算
    const circumference = computed(() => 2 * Math.PI * 45)
    const progressOffset = computed(() => {
      const progress = props.dream?.progress || 0
      return circumference.value - (progress / 100) * circumference.value
    })
    
    const switchTab = (tabKey) => {
      activeTab.value = tabKey
    }
    
    const handleClose = () => {
      emit('close')
    }
    
    // 监听梦想变化，重置到历史标签
    watch(() => props.dream, () => {
      activeTab.value = 'history'
    })
    
    return {
      activeTab,
      timelineTabs,
      historyEvents,
      influenceFactors,
      futureMilestones,
      connections,
      circumference,
      progressOffset,
      switchTab,
      handleClose
    }
  }
}
</script>

<style lang="scss" scoped>
.hyper-time-dimension {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e0e0;
  overflow: hidden;
  
  .close-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .close-button {
      background: none;
      border: none;
      color: #e0e0e0;
      font-size: 1.5rem;
      cursor: pointer;
      margin-right: 1rem;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    
    .dimension-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      opacity: 0.9;
    }
  }
  
  .dimension-content {
    height: calc(100% - 4rem - 4rem); // 减去头部和底部输入框
    display: flex;
    flex-direction: column;
    
    .timeline-nav {
      display: flex;
      padding: 1rem;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      .timeline-tab {
        flex: 1;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 1rem;
        color: #e0e0e0;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        
        &.active {
          background: rgba(102, 126, 234, 0.3);
          color: #fff;
        }
        
        &:hover:not(.active) {
          background: rgba(255, 255, 255, 0.15);
        }
      }
    }
    
    .content-area {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      
      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        opacity: 0.9;
      }
      
      // 历史轨迹样式
      .timeline {
        .timeline-item {
          display: flex;
          margin-bottom: 1.5rem;
          padding-left: 1rem;
          border-left: 2px solid rgba(102, 126, 234, 0.3);
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            left: -0.375rem;
            top: 0.25rem;
            width: 0.5rem;
            height: 0.5rem;
            background: #667eea;
            border-radius: 50%;
          }
          
          .timeline-date {
            min-width: 5rem;
            font-size: 0.75rem;
            opacity: 0.7;
            margin-right: 1rem;
          }
          
          .timeline-content {
            flex: 1;
            
            h4 {
              margin: 0 0 0.25rem 0;
              font-size: 0.875rem;
              font-weight: 600;
            }
            
            p {
              margin: 0;
              font-size: 0.75rem;
              opacity: 0.8;
              line-height: 1.4;
            }
          }
        }
      }
      
      // 现状分析样式
      .analysis-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        
        .analysis-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          
          h4 {
            margin: 0 0 1rem 0;
            font-size: 0.875rem;
            font-weight: 600;
          }
          
          .progress-circle {
            position: relative;
            width: 4rem;
            height: 4rem;
            margin: 0 auto;
            
            svg {
              width: 100%;
              height: 100%;
            }
            
            .progress-text {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 0.875rem;
              font-weight: 600;
            }
          }
          
          .factor-list {
            list-style: none;
            padding: 0;
            margin: 0;
            
            li {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.25rem 0;
              font-size: 0.75rem;
              
              .factor-name {
                opacity: 0.8;
              }
              
              .factor-impact {
                padding: 0.125rem 0.5rem;
                border-radius: 0.75rem;
                font-size: 0.625rem;
                
                &.positive {
                  background: rgba(76, 175, 80, 0.3);
                  color: #4caf50;
                }
                
                &.negative {
                  background: rgba(244, 67, 54, 0.3);
                  color: #f44336;
                }
              }
            }
          }
        }
      }
      
      // 未来展望样式
      .future-timeline {
        .milestone-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
          
          .milestone-date {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-bottom: 0.5rem;
          }
          
          .milestone-content {
            h4 {
              margin: 0 0 0.25rem 0;
              font-size: 0.875rem;
              font-weight: 600;
            }
            
            p {
              margin: 0 0 0.5rem 0;
              font-size: 0.75rem;
              opacity: 0.8;
              line-height: 1.4;
            }
            
            .milestone-probability {
              font-size: 0.75rem;
              color: #4caf50;
            }
          }
        }
      }
      
      // 多维关联样式
      .connection-map {
        position: relative;
        min-height: 20rem;
        
        .central-node {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          
          .main-node {
            background: rgba(102, 126, 234, 0.3);
            border: 2px solid #667eea;
          }
        }
        
        .connected-nodes {
          .connection-item {
            position: absolute;
            
            &:nth-child(1) { top: 10%; left: 20%; }
            &:nth-child(2) { top: 20%; right: 15%; }
            &:nth-child(3) { bottom: 20%; left: 15%; }
            &:nth-child(4) { bottom: 10%; right: 20%; }
            
            .connection-line {
              position: absolute;
              width: 1px;
              height: 2rem;
              background: rgba(255, 255, 255, 0.2);
              top: 50%;
              left: 50%;
              transform-origin: bottom;
            }
            
            .connection-strength {
              font-size: 0.625rem;
              text-align: center;
              margin-top: 0.25rem;
              opacity: 0.7;
            }
          }
        }
        
        .node-circle {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          text-align: center;
          line-height: 1.2;
          color: #fff;
          
          &.health { background: rgba(76, 175, 80, 0.3); border: 2px solid #4caf50; }
          &.finance { background: rgba(255, 193, 7, 0.3); border: 2px solid #ffc107; }
          &.family { background: rgba(233, 30, 99, 0.3); border: 2px solid #e91e63; }
          &.career { background: rgba(121, 85, 72, 0.3); border: 2px solid #795548; }
        }
      }
    }
  }
}
</style>