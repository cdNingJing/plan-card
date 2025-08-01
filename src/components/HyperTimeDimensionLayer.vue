<template>
  <div class="hyper-time-dimension" :class="{ 
    'transitioning': isTransitioning,
    'slide-left': slideDirection === 'left',
    'slide-right': slideDirection === 'right'
  }">
    <!-- 星空背景层 -->
    <div class="starry-background" ref="starryBackground">
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="star"
        :class="[`star-${star.type}`, { 'twinkling': star.twinkling }]"
        :style="{
          left: star.x + '%',
          top: star.y + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          backgroundColor: star.color,
          boxShadow: star.glow,
          '--twinkle-delay': star.delay + 's',
          '--twinkle-duration': star.duration + 's',
          '--move-x': Math.cos(star.moveAngle * Math.PI / 180) * star.moveDistance + 'px',
          '--move-y': Math.sin(star.moveAngle * Math.PI / 180) * star.moveDistance + 'px',
          '--move-duration': star.moveDuration + 's',
          '--move-delay': star.moveDelay + 's'
        }"
      ></div>
    </div>
    
    <!-- 关闭按钮 -->
    <div class="close-header">
      <button class="close-button" @click="handleClose">
        <ChevronDown :size="24" />
      </button>
      <div class="header-content">
        <h2 class="dimension-title">{{ dream?.title }} - 超时间视图</h2>
        <div class="card-indicator">
          <span class="card-position">{{ currentIndex + 1 }}/{{ totalCards }}</span>
        </div>
      </div>
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
          <div class="history-header">
            <div class="header-left">
              <h3>历史轨迹</h3>
              <div class="progress-summary">
                <span class="completed-count">{{ getCompletedEventsCount() }}</span>
                <span class="separator">/</span>
                <span class="total-count">{{ historyEvents.length }}</span>
                <span class="progress-label">项已完成</span>
              </div>
            </div>
            <div class="timeline-stats">
              <div class="stat-item">
                <CheckCircle :size="16" class="stat-icon completed" />
                <span>{{ getCompletedEventsCount() }}项完成</span>
              </div>
              <div class="stat-item">
                <Clock :size="16" class="stat-icon current" />
                <span>{{ getCurrentEventsCount() }}项进行中</span>
              </div>
            </div>
          </div>
          
          <div class="timeline">
            <div 
              v-for="(event, index) in historyEvents"
              :key="event.id || index"
              class="timeline-item"
              :class="[
                `status-${event.status}`,
                { 'is-last': index === historyEvents.length - 1 }
              ]"
            >
              <div class="timeline-marker">
                <div class="marker-dot" :class="`status-${event.status}`">
                  <CheckCircle v-if="event.status === 'completed'" :size="14" />
                  <Clock v-else-if="event.status === 'current'" :size="14" />
                  <Circle v-else :size="14" />
                </div>
                <div v-if="index < historyEvents.length - 1" class="connecting-line"></div>
              </div>
              
              <div class="timeline-content">
                <div class="event-header">
                  <div class="event-date">{{ formatEventDate(event.date) }}</div>
                  <div class="event-status" :class="`status-${event.status}`">
                    {{ getEventStatusText(event.status) }}
                  </div>
                </div>
                
                <div class="event-body">
                  <h4 class="event-title">{{ event.title }}</h4>
                  <p class="event-description">{{ event.description }}</p>
                </div>
                
                <div class="event-footer">
                  <div class="time-elapsed">
                    {{ getTimeElapsed(event.date) }}
                  </div>
                  <div v-if="event.impact" class="event-impact">
                    <TrendingUp :size="12" />
                    <span>{{ event.impact }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 历史洞察 -->
          <div class="history-insights">
            <h4>历史洞察</h4>
            <div class="insights-grid">
              <div class="insight-card completion">
                <div class="insight-icon">
                  <BarChart3 :size="20" />
                </div>
                <div class="insight-content">
                  <div class="insight-value">{{ getCompletionRate() }}%</div>
                  <div class="insight-label">完成率</div>
                </div>
              </div>
              
              <div class="insight-card interval">
                <div class="insight-icon">
                  <Calendar :size="20" />
                </div>
                <div class="insight-content">
                  <div class="insight-value">{{ getAverageInterval() }}天</div>
                  <div class="insight-label">平均间隔</div>
                </div>
              </div>
              
              <div class="insight-card trend">
                <div class="insight-icon">
                  <TrendingUp :size="20" />
                </div>
                <div class="insight-content">
                  <div class="insight-value">{{ getMomentumTrend() }}</div>
                  <div class="insight-label">执行趋势</div>
                </div>
              </div>
              
              <div class="insight-card consistency">
                <div class="insight-icon">
                  <Target :size="20" />
                </div>
                <div class="insight-content">
                  <div class="insight-value">{{ getConsistencyScore() }}%</div>
                  <div class="insight-label">一致性</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 现状分析 -->
        <div v-if="activeTab === 'analysis'" class="analysis-section">
          <h3>现状分析 - 当前状态管理</h3>
          <!-- 总体进展概览 -->
          <div class="progress-overview">
            <div class="progress-circle-container">
              <div class="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    stroke-width="3"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#4caf50"
                    stroke-width="3"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div class="progress-text">{{ dream?.progress || 0 }}%</div>
              </div>
              <div class="progress-info">
                <div class="progress-label">总体完成度</div>
                <div class="progress-subtitle">{{ getCurrentStage() }}</div>
              </div>
            </div>
          </div>
          
          <!-- 三大维度管理 -->
          <div class="state-management">
            <!-- 可提供资源 -->
            <div class="state-card resources">
              <div class="card-header">
                <div class="header-title">
                  <Briefcase :size="16" class="header-icon" />
                  <h4>可提供资源</h4>
                </div>
                <button class="add-btn" @click="addResource">
                  <Plus :size="14" />
                </button>
              </div>
              <div class="items-list">
                <div 
                  v-for="(resource, index) in currentResources" 
                  :key="`resource-${index}`"
                  class="state-item"
                >
                  <div class="item-content">
                    <span class="item-type">{{ resource.type }}</span>
                    <span class="item-value">{{ resource.value }}</span>
                    <span class="item-status" :class="resource.status">{{ getStatusText(resource.status) }}</span>
                  </div>
                  <button class="edit-btn" @click="editResource(index)">
                    <Edit3 :size="12" />
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 能做到的事 -->
            <div class="state-card capabilities">
              <div class="card-header">
                <div class="header-title">
                  <Zap :size="16" class="header-icon" />
                  <h4>能做到的事</h4>
                </div>
                <button class="add-btn" @click="addCapability">
                  <Plus :size="14" />
                </button>
              </div>
              <div class="items-list">
                <div 
                  v-for="(capability, index) in currentCapabilities" 
                  :key="`capability-${index}`"
                  class="state-item"
                >
                  <div class="item-content">
                    <span class="item-title">{{ capability.skill }}</span>
                    <div class="skill-level">
                      <div class="level-bar">
                        <div 
                          class="level-fill" 
                          :style="{ width: capability.level + '%' }"
                        ></div>
                      </div>
                      <span class="level-text">{{ capability.level }}%</span>
                    </div>
                  </div>
                  <button class="edit-btn" @click="editCapability(index)">
                    <Edit3 :size="12" />
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 想要实现的目标 -->
            <div class="state-card goals">
              <div class="card-header">
                <div class="header-title">
                  <Target :size="16" class="header-icon" />
                  <h4>想要实现</h4>
                </div>
                <button class="add-btn" @click="addGoal">
                  <Plus :size="14" />
                </button>
              </div>
              <div class="items-list">
                <div 
                  v-for="(goal, index) in currentGoals" 
                  :key="`goal-${index}`"
                  class="state-item"
                >
                  <div class="item-content">
                    <span class="item-title">{{ goal.target }}</span>
                    <span class="item-priority" :class="goal.priority">{{ getPriorityText(goal.priority) }}</span>
                    <span class="item-timeline">{{ goal.timeline }}</span>
                  </div>
                  <button class="edit-btn" @click="editGoal(index)">
                    <Edit3 :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 影响分析 -->
          <div class="impact-analysis">
            <h4>状态对未来计划的影响</h4>
            <div class="impact-grid">
              <div class="impact-item positive">
                <div class="impact-icon">
                  <TrendingUp :size="20" />
                </div>
                <div class="impact-content">
                  <div class="impact-title">积极因素</div>
                  <ul class="impact-list">
                    <li v-for="factor in getPositiveFactors()" :key="factor">{{ factor }}</li>
                  </ul>
                </div>
              </div>
              <div class="impact-item neutral">
                <div class="impact-icon">
                  <Scale :size="20" />
                </div>
                <div class="impact-content">
                  <div class="impact-title">需关注点</div>
                  <ul class="impact-list">
                    <li v-for="factor in getNeutralFactors()" :key="factor">{{ factor }}</li>
                  </ul>
                </div>
              </div>
              <div class="impact-item negative">
                <div class="impact-icon">
                  <AlertTriangle :size="20" />
                </div>
                <div class="impact-content">
                  <div class="impact-title">风险因素</div>
                  <ul class="impact-list">
                    <li v-for="factor in getNegativeFactors()" :key="factor">{{ factor }}</li>
                  </ul>
                </div>
              </div>
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
                <div class="milestone-probability" :class="getProbabilityClass(milestone.probability)">
                  <span class="probability-label">实现概率:</span>
                  <span class="probability-value">{{ milestone.probability }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 多维关联 -->
        <div v-if="activeTab === 'connections'" class="connections-section">
          <h3>多维关联</h3>
          <div class="connection-map">
            <!-- SVG 连接线和效果 -->
            <svg class="connection-lines" viewBox="0 0 400 300">
              <defs>
                <!-- 渐变定义 -->
                <linearGradient :id="`gradient-${index}`" v-for="(connection, index) in connections" :key="`grad-${index}`">
                  <stop offset="0%" :stop-color="getConnectionColor(connection.type)" stop-opacity="0.2"/>
                  <stop offset="50%" :stop-color="getConnectionColor(connection.type)" stop-opacity="0.8"/>
                  <stop offset="100%" stop-color="rgba(102, 126, 234, 0.9)" stop-opacity="1"/>
                </linearGradient>
                
                <!-- 箭头标记 -->
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgba(102, 126, 234, 0.8)" />
                </marker>
                
                <!-- 发光滤镜 -->
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <!-- 主连接线 -->
              <line 
                v-for="(connection, index) in connections"
                :key="`line-${index}`"
                :x1="getLineStart(index).x"
                :y1="getLineStart(index).y"
                x2="200"
                y2="150"
                :stroke="`url(#gradient-${index})`"
                stroke-width="3"
                class="connection-line main-line"
                marker-end="url(#arrowhead)"
                filter="url(#glow)"
                :style="{ 
                  animationDelay: index * 0.3 + 's',
                  '--connection-strength': connection.strength + '%'
                }"
              />
              
              <!-- 数据流动粒子 -->
              <circle 
                v-for="(connection, index) in connections"
                :key="`particle-${index}`"
                r="2"
                :fill="getConnectionColor(connection.type)"
                class="data-particle"
                :style="{ 
                  animationDelay: index * 0.3 + 0.5 + 's',
                  '--start-x': getLineStart(index).x + 'px',
                  '--start-y': getLineStart(index).y + 'px'
                }"
              >
                <animateMotion 
                  :dur="(4 - connection.strength / 30) + 's'"
                  repeatCount="indefinite">
                  <mpath :href="`#path-${index}`"/>
                </animateMotion>
              </circle>
              
              <!-- 隐藏路径用于粒子动画 -->
              <path 
                v-for="(connection, index) in connections"
                :key="`path-${index}`"
                :id="`path-${index}`"
                :d="`M ${getLineStart(index).x} ${getLineStart(index).y} L 200 150`"
                fill="none"
                stroke="none"
              />
              
              <!-- 强度指示器 -->
              <text 
                v-for="(connection, index) in connections"
                :key="`strength-${index}`"
                :x="(getLineStart(index).x + 200) / 2"
                :y="(getLineStart(index).y + 150) / 2 - 5"
                text-anchor="middle"
                fill="rgba(255, 255, 255, 0.7)"
                font-size="10"
                class="strength-indicator"
              >
                {{ connection.strength }}%
              </text>
            </svg>
            
            <!-- 中心节点 -->
            <div class="central-node">
              <div class="node-circle main-node">
                {{ dream?.title }}
              </div>
            </div>
            
            <!-- 外围节点 -->
            <div class="connected-nodes">
              <div 
                v-for="(connection, index) in connections"
                :key="index"
                class="connection-item"
                :class="`position-${index + 1}`"
              >
                <div class="node-circle" :class="getConnectionClass(connection.type)">
                  <span class="connection-label">{{ connection.type }}</span>
                </div>
                <div class="connection-info">
                  <div class="connection-strength">{{ connection.strength }}%</div>
                  <div class="connection-description">{{ connection.description }}</div>
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
import { ref, computed, watch, onMounted } from 'vue'
import {
  ChevronDown,
  Clock,
  BarChart3,
  TrendingUp,
  Share2,
  Briefcase,
  Zap,
  Target,
  Plus,
  Edit3,
  Scale,
  AlertTriangle,
  CheckCircle,
  Circle,
  Calendar
} from 'lucide-vue-next'

export default {
  name: 'HyperTimeDimensionLayer',
  components: {
    ChevronDown,
    Clock,
    BarChart3,
    TrendingUp,
    Share2,
    Briefcase,
    Zap,
    Target,
    Plus,
    Edit3,
    Scale,
    AlertTriangle,
    CheckCircle,
    Circle,
    Calendar
  },
  props: {
    dream: {
      type: Object,
      default: null
    },
    currentIndex: {
      type: Number,
      default: 0
    },
    totalCards: {
      type: Number,
      default: 0
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const activeTab = ref('analysis')
    const isTransitioning = ref(false)
    const slideDirection = ref('')
    const starryBackground = ref(null)
    const stars = ref([])
    
    // 当前状态数据
    const currentResources = ref([
      { type: '时间', value: '每天2小时', status: 'available' },
      { type: '资金', value: '月预算5000元', status: 'limited' },
      { type: '人脉', value: '教育行业朋友', status: 'available' },
      { type: '学习资料', value: '在线课程账号', status: 'available' },
      { type: '专业指导', value: '缺乏专业导师', status: 'scarce' },
      { type: '实践机会', value: '缺少实际应用场景', status: 'scarce' }
    ])
    
    const currentCapabilities = ref([
      { skill: '时间管理', level: 75 },
      { skill: '学习指导', level: 85 },
      { skill: '财务规划', level: 60 },
      { skill: '沟通协调', level: 80 },
      { skill: '项目管理', level: 70 },
      { skill: '压力管理', level: 45 },
      { skill: '网络营销', level: 35 }
    ])
    
    const currentGoals = ref([
      { target: '提升孩子SAT成绩到1550+', priority: 'high', timeline: '6个月内' },
      { target: '建立完整学习计划', priority: 'high', timeline: '1个月内' },
      { target: '联系哈佛校友mentor', priority: 'medium', timeline: '3个月内' },
      { target: '准备申请文书', priority: 'medium', timeline: '9个月内' }
    ])
    
    const timelineTabs = [
      { key: 'history', label: '历史', icon: Clock },
      { key: 'analysis', label: '现状', icon: BarChart3 },
      { key: 'future', label: '未来', icon: TrendingUp },
      { key: 'connections', label: '关联', icon: Share2 }
    ]
    
    // 历史事件数据（从dream.hyperTimeData获取）
    const historyEvents = computed(() => {
      return props.dream?.hyperTimeData?.history || []
    })
    
    // 分析数据（从dream.hyperTimeData获取）
    const analysisData = computed(() => {
      return props.dream?.hyperTimeData?.analysis || {
        strengths: [],
        challenges: [],
        keyFactors: []
      }
    })
    
    // 未来里程碑数据（从dream.hyperTimeData获取）
    const futureMilestones = computed(() => {
      const milestones = props.dream?.hyperTimeData?.future || []
      
      // 为每个里程碑计算实现概率
      return milestones.map(milestone => {
        const probability = calculateMilestoneProbability(milestone)
        return {
          ...milestone,
          probability: probability.toFixed(2) // 保留两位小数
        }
      })
    })
    
    // 根据概率值获取样式类名
    const getProbabilityClass = (probability) => {
      const prob = parseFloat(probability)
      if (prob >= 80) return 'high-probability'
      if (prob >= 60) return 'medium-probability'
      if (prob >= 40) return 'low-probability'
      return 'very-low-probability'
    }
    
    // 历史轨迹相关方法
    const getCompletedEventsCount = () => {
      return historyEvents.value.filter(event => event.status === 'completed').length
    }
    
    const getCurrentEventsCount = () => {
      return historyEvents.value.filter(event => event.status === 'current').length
    }
    
    const formatEventDate = (dateStr) => {
      const date = new Date(dateStr)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
      return `${Math.floor(diffDays / 365)}年前`
    }
    
    const getTimeElapsed = (dateStr) => {
      const date = new Date(dateStr)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return '未来事件'
      if (diffDays === 0) return '今日'
      if (diffDays < 30) return `${diffDays}天前`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
      return `${Math.floor(diffDays / 365)}年前`
    }
    
    const getEventStatusText = (status) => {
      const statusMap = {
        'completed': '已完成',
        'current': '进行中',
        'pending': '计划中',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    }
    
    const getCompletionRate = () => {
      const total = historyEvents.value.length
      if (total === 0) return 0
      const completed = getCompletedEventsCount()
      return Math.round((completed / total) * 100)
    }
    
    const getAverageInterval = () => {
      const events = historyEvents.value
        .filter(e => e.date && e.status === 'completed')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      
      if (events.length < 2) return '-'
      
      let totalDays = 0
      for (let i = 1; i < events.length; i++) {
        const prevDate = new Date(events[i - 1].date)
        const currDate = new Date(events[i].date)
        totalDays += (currDate - prevDate) / (1000 * 60 * 60 * 24)
      }
      
      return Math.round(totalDays / (events.length - 1))
    }
    
    const getMomentumTrend = () => {
      const recentEvents = historyEvents.value
        .filter(e => e.date && e.status === 'completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
      
      if (recentEvents.length < 2) return '稳定'
      
      const now = new Date()
      const recent = recentEvents.slice(0, Math.ceil(recentEvents.length / 2))
      const older = recentEvents.slice(Math.ceil(recentEvents.length / 2))
      
      const recentAvgDays = recent.reduce((sum, e) => {
        return sum + (now - new Date(e.date)) / (1000 * 60 * 60 * 24)
      }, 0) / recent.length
      
      const olderAvgDays = older.reduce((sum, e) => {
        return sum + (now - new Date(e.date)) / (1000 * 60 * 60 * 24)
      }, 0) / older.length
      
      if (recentAvgDays < olderAvgDays * 0.8) return '加速'
      if (recentAvgDays > olderAvgDays * 1.2) return '放缓'
      return '稳定'
    }
    
    const getConsistencyScore = () => {
      const completedEvents = historyEvents.value
        .filter(e => e.date && e.status === 'completed')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      
      if (completedEvents.length < 3) return 70 // 默认分数
      
      // 计算时间间隔的标准差来衡量一致性
      const intervals = []
      for (let i = 1; i < completedEvents.length; i++) {
        const prevDate = new Date(completedEvents[i - 1].date)
        const currDate = new Date(completedEvents[i].date)
        const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24)
        intervals.push(daysDiff)
      }
      
      if (intervals.length === 0) return 70
      
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
      const standardDeviation = Math.sqrt(variance)
      
      // 计算一致性分数：标准差越小，一致性越高
      const consistencyRatio = avgInterval > 0 ? (avgInterval - standardDeviation) / avgInterval : 0
      const score = Math.max(20, Math.min(95, Math.round(consistencyRatio * 100)))
      
      return score
    }
    
    // 计算里程碑实现概率的方法
    const calculateMilestoneProbability = (milestone) => {
      let baseProbability = 70 // 基础概率70%
      
      // 根据优先级调整
      if (milestone.priority === 'critical') {
        baseProbability += 15
      } else if (milestone.priority === 'high') {
        baseProbability += 10
      } else if (milestone.priority === 'medium') {
        baseProbability += 0
      } else if (milestone.priority === 'low') {
        baseProbability -= 10
      }
      
      // 根据当前整体进度调整
      const currentProgress = props.dream?.progress || 0
      if (currentProgress > 70) {
        baseProbability += 10
      } else if (currentProgress > 50) {
        baseProbability += 5
      } else if (currentProgress < 30) {
        baseProbability -= 15
      }
      
      // 根据时间距离调整
      if (milestone.date) {
        const now = new Date()
        const milestoneDate = new Date(milestone.date)
        const monthsAway = (milestoneDate - now) / (1000 * 60 * 60 * 24 * 30)
        
        if (monthsAway < 3) {
          baseProbability += 5 // 近期目标更容易实现
        } else if (monthsAway > 18) {
          baseProbability -= 10 // 远期目标不确定性更高
        }
      }
      
      // 根据当前资源状态调整
      const availableResources = currentResources.value.filter(r => r.status === 'available').length
      const totalResources = currentResources.value.length
      const resourceRatio = availableResources / totalResources
      
      if (resourceRatio > 0.7) {
        baseProbability += 8
      } else if (resourceRatio < 0.5) {
        baseProbability -= 12
      }
      
      // 根据能力水平调整
      const averageSkillLevel = currentCapabilities.value.reduce((sum, c) => sum + c.level, 0) / currentCapabilities.value.length
      if (averageSkillLevel > 75) {
        baseProbability += 8
      } else if (averageSkillLevel < 60) {
        baseProbability -= 10
      }
      
      // 根据历史完成情况调整
      const historyEvents = props.dream?.hyperTimeData?.history || []
      const completedEvents = historyEvents.filter(h => h.status === 'completed')
      const completionRate = historyEvents.length > 0 ? completedEvents.length / historyEvents.length : 0.5
      
      if (completionRate > 0.8) {
        baseProbability += 10
      } else if (completionRate < 0.5) {
        baseProbability -= 8
      }
      
      // 根据里程碑类型调整
      const title = milestone.title?.toLowerCase() || ''
      if (title.includes('申请') || title.includes('考试')) {
        baseProbability -= 5 // 考试申请类不确定性较高
      } else if (title.includes('学习') || title.includes('准备')) {
        baseProbability += 5 // 学习准备类相对可控
      }
      
      // 确保概率在合理范围内
      return Math.max(10, Math.min(95, baseProbability))
    }
    
    // 关联数据（从dream.hyperTimeData获取）
    const connections = computed(() => {
      return props.dream?.hyperTimeData?.connections || []
    })
    
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
    
    // 根据连接类型获取CSS类名
    const getConnectionClass = (type) => {
      const typeMap = {
        '健康管理': 'health',
        '家庭和谐': 'family',
        '财务规划': 'finance',
        '学习成长': 'education',
        '人际网络': 'network',
        '家庭支持': 'family',
        '工作效率': 'career',
        '家庭活动': 'family',
        '心理状态': 'health',
        '职业发展': 'career',
        '教育规划': 'education',
        '退休规划': 'finance',
        '孩子教育': 'education',
        '事业发展': 'career'
      }
      return typeMap[type] || 'default'
    }
    
    // 获取连接线起始位置
    const getLineStart = (index) => {
      const positions = [
        { x: 80, y: 60 },   // 左上角
        { x: 320, y: 60 },  // 右上角
        { x: 80, y: 240 },  // 左下角
        { x: 320, y: 240 }  // 右下角
      ]
      return positions[index] || positions[0]
    }
    
    // 获取连接类型对应的颜色
    const getConnectionColor = (type) => {
      const colorMap = {
        '健康管理': '#4caf50',
        '家庭和谐': '#e91e63',
        '财务规划': '#ffc107',
        '学习成长': '#3f51b5',
        '人际网络': '#9c27b0',
        '家庭支持': '#e91e63',
        '工作效率': '#795548',
        '家庭活动': '#e91e63',
        '心理状态': '#4caf50',
        '职业发展': '#795548',
        '教育规划': '#3f51b5',
        '退休规划': '#ffc107',
        '孩子教育': '#3f51b5',
        '事业发展': '#795548'
      }
      return colorMap[type] || '#9e9e9e'
    }
    
    // 状态管理相关方法
    const getCurrentStage = () => {
      const progress = props.dream?.progress || 0
      if (progress < 25) return '起步阶段'
      if (progress < 50) return '发展阶段'
      if (progress < 75) return '加速阶段'
      return '冲刺阶段'
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        'available': '充足',
        'limited': '有限',
        'scarce': '稀缺',
        'pending': '待定'
      }
      return statusMap[status] || status
    }
    
    const getPriorityText = (priority) => {
      const priorityMap = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
      }
      return priorityMap[priority] || priority
    }
    
    // 添加和编辑功能
    const addResource = () => {
      // TODO: 打开资源添加弹窗
      console.log('Add resource')
    }
    
    const editResource = (index) => {
      // TODO: 打开资源编辑弹窗
      console.log('Edit resource', index)
    }
    
    const addCapability = () => {
      // TODO: 打开能力添加弹窗
      console.log('Add capability')
    }
    
    const editCapability = (index) => {
      // TODO: 打开能力编辑弹窗
      console.log('Edit capability', index)
    }
    
    const addGoal = () => {
      // TODO: 打开目标添加弹窗
      console.log('Add goal')
    }
    
    const editGoal = (index) => {
      // TODO: 打开目标编辑弹窗
      console.log('Edit goal', index)
    }
    
    // 影响分析方法
    const getPositiveFactors = () => {
      const factors = []
      
      // 基于资源分析
      const availableResources = currentResources.value.filter(r => r.status === 'available')
      if (availableResources.length >= 3) {
        factors.push('多项核心资源充足，执行基础扎实')
      }
      
      if (availableResources.some(r => r.type === '时间')) {
        factors.push('时间资源相对充裕，可持续投入')
      }
      
      // 基于能力分析
      const highSkills = currentCapabilities.value.filter(c => c.level >= 80)
      const averageSkillLevel = currentCapabilities.value.reduce((sum, c) => sum + c.level, 0) / currentCapabilities.value.length
      
      if (highSkills.length > 0) {
        factors.push(`${highSkills[0].skill}等关键能力突出，优势明显`)
      }
      
      if (averageSkillLevel >= 75) {
        factors.push('整体能力水平较高，综合实力强')
      }
      
      // 基于进度分析
      const progress = props.dream?.progress || 0
      if (progress > 70) {
        factors.push('目标进展顺利，已完成大部分里程碑')
      } else if (progress > 50) {
        factors.push('当前进展良好，保持积极势头')
      }
      
      // 基于目标设定分析
      const clearGoals = currentGoals.value.filter(g => g.timeline && g.priority)
      if (clearGoals.length >= 3) {
        factors.push('目标规划清晰，执行路径明确')
      }
      
      // 基于历史表现分析
      const completedEvents = props.dream?.hyperTimeData?.history?.filter(h => h.status === 'completed') || []
      if (completedEvents.length >= 3) {
        factors.push('历史执行力强，按计划完成率高')
      }
      
      // 基于外部环境分析
      const dreamTitle = props.dream?.title || ''
      if (dreamTitle.includes('健康')) {
        factors.push('健康管理意识强，为其他目标提供基础保障')
      }
      
      if (dreamTitle.includes('家庭')) {
        factors.push('家庭关系和谐，后方支持稳固')
      }
      
      // 基于时间窗口分析
      const deadline = props.dream?.deadline
      if (deadline) {
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const monthsLeft = (deadlineDate - now) / (1000 * 60 * 60 * 24 * 30)
        
        if (monthsLeft > 12 && progress > 30) {
          factors.push('时间充裕且起步良好，有充分调优空间')
        }
      }
      
      return factors.length > 0 ? factors : ['基础条件已具备，可以开始行动']
    }
    
    const getNeutralFactors = () => {
      const factors = []
      
      // 基于资源分析
      const limitedResources = currentResources.value.filter(r => r.status === 'limited')
      if (limitedResources.length > 0) {
        factors.push(`${limitedResources[0].type}资源需要优化配置和使用效率`)
      }
      
      const totalResources = currentResources.value.length
      const availableResources = currentResources.value.filter(r => r.status === 'available').length
      if (availableResources / totalResources < 0.7) {
        factors.push('资源配置需要重新评估和调整')
      }
      
      // 基于能力分析
      const mediumSkills = currentCapabilities.value.filter(c => c.level >= 60 && c.level < 80)
      const lowSkills = currentCapabilities.value.filter(c => c.level < 60)
      
      if (mediumSkills.length > 0) {
        factors.push(`${mediumSkills[0].skill}等能力接近临界点，需重点突破`)
      }
      
      if (lowSkills.length > 1) {
        factors.push('多项技能需要同步提升，需制定学习计划')
      }
      
      // 基于目标分析
      const highPriorityGoals = currentGoals.value.filter(g => g.priority === 'high')
      const mediumPriorityGoals = currentGoals.value.filter(g => g.priority === 'medium')
      
      if (highPriorityGoals.length > 2) {
        factors.push('高优先级目标较多，建议重新评估优先级')
      }
      
      if (mediumPriorityGoals.length > 3) {
        factors.push('中等优先级任务过多，可能分散注意力')
      }
      
      // 基于时间分配分析
      const shortTermGoals = currentGoals.value.filter(g => 
        g.timeline.includes('1个月') || g.timeline.includes('2个月') || g.timeline.includes('3个月')
      )
      if (shortTermGoals.length > 2) {
        factors.push('短期目标密集，需要合理安排时间节奏')
      }
      
      // 基于进度分析
      const progress = props.dream?.progress || 0
      if (progress >= 40 && progress <= 60) {
        factors.push('当前处于关键推进期，需要保持稳定节奏')
      }
      
      // 基于外部环境分析
      const dreamTitle = props.dream?.title || ''
      if (dreamTitle.includes('考试') || dreamTitle.includes('学习')) {
        factors.push('学习进度需要定期评估，及时调整策略')
      }
      
      if (dreamTitle.includes('投资') || dreamTitle.includes('理财')) {
        factors.push('市场波动较大，需要密切关注风险管控')
      }
      
      // 基于季节性因素
      const currentMonth = new Date().getMonth() + 1
      if (currentMonth >= 6 && currentMonth <= 8) {
        factors.push('暑期时间窗口，可考虑加快某些目标推进')
      } else if (currentMonth >= 11 || currentMonth <= 2) {
        factors.push('年末年初时期，需要平衡多项规划')
      }
      
      // 基于依赖关系分析
      const connections = props.dream?.hyperTimeData?.connections || []
      if (connections.length > 3) {
        factors.push('目标关联度较高，需要统筹考虑影响因素')
      }
      
      return factors.length > 0 ? factors : ['整体状态平衡，保持现有节奏']
    }
    
    const getNegativeFactors = () => {
      const factors = []
      
      // 基于资源分析
      const scarceResources = currentResources.value.filter(r => r.status === 'scarce')
      const limitedResources = currentResources.value.filter(r => r.status === 'limited')
      
      if (scarceResources.length > 0) {
        factors.push(`${scarceResources[0].type}资源严重不足，影响执行效率`)
      }
      
      if (limitedResources.length >= 2) {
        factors.push('多项关键资源受限，存在瓶颈风险')
      }
      
      // 基于能力分析
      const weakSkills = currentCapabilities.value.filter(c => c.level < 60)
      const criticalSkills = ['时间管理', '学习指导', '项目管理']
      
      if (weakSkills.length > 0) {
        const weakCritical = weakSkills.find(s => criticalSkills.includes(s.skill))
        if (weakCritical) {
          factors.push(`${weakCritical.skill}能力不足，可能影响目标达成`)
        } else {
          factors.push(`${weakSkills[0].skill}等技能有待加强`)
        }
      }
      
      // 基于进度分析
      const progress = props.dream?.progress || 0
      const dreamTitle = props.dream?.title || ''
      
      if (progress < 30) {
        factors.push('当前进展缓慢，距离目标差距较大')
      }
      
      // 基于目标分析
      const highPriorityGoals = currentGoals.value.filter(g => g.priority === 'high')
      const urgentGoals = currentGoals.value.filter(g => g.timeline.includes('1个月') || g.timeline.includes('2个月'))
      
      if (highPriorityGoals.length > 3) {
        factors.push('高优先级目标过多，精力分散风险')
      }
      
      if (urgentGoals.length > 2) {
        factors.push('短期内任务密集，时间压力较大')
      }
      
      // 基于外部环境分析
      if (dreamTitle.includes('哈佛') || dreamTitle.includes('名校')) {
        factors.push('竞争激烈，录取率极低，存在失败风险')
        factors.push('标准化考试要求高，需持续高强度准备')
      }
      
      if (dreamTitle.includes('事业') || dreamTitle.includes('晋升')) {
        factors.push('职场竞争激烈，晋升机会有限')
        factors.push('市场环境变化快，技能更新压力大')
      }
      
      if (dreamTitle.includes('财务') || dreamTitle.includes('投资')) {
        factors.push('市场波动风险，投资收益不确定')
        factors.push('通胀压力持续，购买力下降风险')
      }
      
      // 基于时间分析
      const deadline = props.dream?.deadline
      if (deadline) {
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const monthsLeft = (deadlineDate - now) / (1000 * 60 * 60 * 24 * 30)
        
        if (monthsLeft < 6 && progress < 70) {
          factors.push('时间紧迫，进度不足，存在无法按期完成风险')
        }
      }
      
      // 如果没有发现明显风险，返回潜在风险提醒
      if (factors.length === 0) {
        factors.push('需要持续关注执行过程中的变化')
        factors.push('建立风险预警机制，及时调整策略')
      }
      
      return factors
    }
    
    // 生成星星
    const generateStars = () => {
      const starColors = [
        'rgba(255, 255, 255, 0.6)', // 更淡的白色
        'rgba(255, 235, 205, 0.5)', // 更淡的黄
        'rgba(173, 216, 230, 0.4)', // 更淡的蓝
        'rgba(255, 182, 193, 0.4)', // 更淡的粉
        'rgba(221, 160, 221, 0.4)', // 更淡的紫
        'rgba(240, 230, 140, 0.4)', // 更淡的卡其色
        'rgba(152, 251, 152, 0.3)', // 更淡的绿
        'rgba(255, 215, 0, 0.5)',   // 更淡的金色
      ]
      
      const starTypes = ['bright', 'medium', 'small', 'tiny']
      const newStars = []
      
      // 生成不同类型的星星
      for (let i = 0; i < 150; i++) {
        const type = starTypes[Math.floor(Math.random() * starTypes.length)]
        const color = starColors[Math.floor(Math.random() * starColors.length)]
        
        let size, opacity, glowIntensity
        switch (type) {
          case 'bright':
            size = Math.random() * 3 + 2 // 2-5px
            opacity = Math.random() * 0.4 + 0.6 // 0.6-1.0
            glowIntensity = Math.random() * 8 + 4 // 4-12px
            break
          case 'medium':
            size = Math.random() * 2 + 1.5 // 1.5-3.5px
            opacity = Math.random() * 0.3 + 0.4 // 0.4-0.7
            glowIntensity = Math.random() * 4 + 2 // 2-6px
            break
          case 'small':
            size = Math.random() * 1.5 + 1 // 1-2.5px
            opacity = Math.random() * 0.3 + 0.3 // 0.3-0.6
            glowIntensity = Math.random() * 2 + 1 // 1-3px
            break
          case 'tiny':
            size = Math.random() * 1 + 0.5 // 0.5-1.5px
            opacity = Math.random() * 0.2 + 0.2 // 0.2-0.4
            glowIntensity = 0 // 无光晕
            break
        }
        
        // 生成移动方向和距离
        const moveAngle = Math.random() * 360 // 0-360度随机方向
        const moveDistance = Math.random() * 30 + 10 // 10-40px移动距离
        const moveDuration = Math.random() * 15 + 10 // 10-25秒移动周期
        
        const star = {
          id: i,
          type,
          x: Math.random() * 100, // 0-100%
          y: Math.random() * 100, // 0-100%
          size,
          color: color,
          opacity,
          glow: glowIntensity > 0 ? `0 0 ${glowIntensity}px ${color}` : 'none',
          delay: Math.random() * 5, // 0-5秒延迟
          duration: Math.random() * 4 + 2, // 2-6秒动画周期
          twinkling: Math.random() > 0.3, // 70% 的星星会闪烁
          // 移动属性
          moveAngle,
          moveDistance,
          moveDuration,
          moveDelay: Math.random() * 8 // 0-8秒移动延迟
        }
        
        newStars.push(star)
      }
      
      stars.value = newStars
    }
    
    // 监听梦想变化，重置到历史标签并触发过渡动画
    watch(() => props.currentIndex, (newIndex, oldIndex) => {
      if (oldIndex !== undefined && newIndex !== oldIndex) {
        // 确定滑动方向
        const totalCards = props.totalCards
        let direction = ''
        
        if (newIndex > oldIndex) {
          // 判断是否是循环的情况
          if (newIndex - oldIndex === totalCards - 1) {
            direction = 'left' // 从最后一个回到第一个，应该是左滑效果
          } else {
            direction = 'right' // 正常右滑
          }
        } else {
          // 判断是否是循环的情况
          if (oldIndex - newIndex === totalCards - 1) {
            direction = 'right' // 从第一个回到最后一个，应该是右滑效果
          } else {
            direction = 'left' // 正常左滑
          }
        }
        
        slideDirection.value = direction
        isTransitioning.value = true
        
        // 过渡动画结束后重置状态
        setTimeout(() => {
          isTransitioning.value = false
          slideDirection.value = ''
        }, 300)
      }
      activeTab.value = 'analysis'
    })
    
    // 监听梦想变化，重置到历史标签
    watch(() => props.dream, () => {
      activeTab.value = 'analysis'
    })
    
    // 初始化星星
    onMounted(() => {
      generateStars()
    })
    
    return {
      activeTab,
      timelineTabs,
      historyEvents,
      analysisData,
      futureMilestones,
      connections,
      circumference,
      progressOffset,
      switchTab,
      handleClose,
      getConnectionClass,
      getLineStart,
      getConnectionColor,
      // 新状态管理数据
      currentResources,
      currentCapabilities,
      currentGoals,
      // 状态管理方法
      getCurrentStage,
      getStatusText,
      getPriorityText,
      addResource,
      editResource,
      addCapability,
      editCapability,
      addGoal,
      editGoal,
      getPositiveFactors,
      getNeutralFactors,
      getNegativeFactors,
      calculateMilestoneProbability,
      getProbabilityClass,
      // 历史轨迹方法
      getCompletedEventsCount,
      getCurrentEventsCount,
      formatEventDate,
      getTimeElapsed,
      getEventStatusText,
      getCompletionRate,
      getAverageInterval,
      getMomentumTrend,
      getConsistencyScore,
      // 原有数据
      isTransitioning,
      slideDirection,
      starryBackground,
      stars
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
  
  // 禁用移动端点击高亮和双击缩放
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  touch-action: manipulation;
  
  // 左右滑动过渡动画
  &.transitioning {
    .dimension-content {
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    &.slide-left .dimension-content {
      animation: slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    &.slide-right .dimension-content {
      animation: slideInFromRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
  }
  
  .close-header {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .close-button {
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e0e0e0;
      cursor: pointer;
      margin-right: 1rem;
      padding: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        transform: scale(1.05);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    .header-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .dimension-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        opacity: 0.9;
      }
      
      .card-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.7;
        margin-bottom: 0.5rem;
        
        .swipe-hint {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          
          .swipe-arrow {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.6);
            font-weight: bold;
          }
          
          &.left {
            animation: pulse-left 2s ease-in-out infinite;
          }
          
          &.right {
            animation: pulse-right 2s ease-in-out infinite;
          }
        }
        
        .card-position {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          min-width: 2rem;
          text-align: center;
        }
      }
      
      .swipe-instruction {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
        opacity: 0.8;
        animation: fade-in-out 3s ease-in-out infinite;
      }
    }
  }
  
  .dimension-content {
    position: relative;
    z-index: 10;
    height: calc(100% - 4rem - 4rem); // 减去头部和底部输入框
    display: flex;
    flex-direction: column;
    padding-bottom: 1rem;
    
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
      .history-section {
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          
          .header-left {
            h3 {
              margin: 0 0 0.5rem 0;
              font-size: 1.125rem;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.9);
            }
            
            .progress-summary {
              display: flex;
              align-items: baseline;
              gap: 0.25rem;
              
              .completed-count {
                font-size: 1.5rem;
                font-weight: 700;
                color: #4caf50;
              }
              
              .separator {
                font-size: 1.25rem;
                color: rgba(255, 255, 255, 0.5);
              }
              
              .total-count {
                font-size: 1.25rem;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.7);
              }
              
              .progress-label {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.6);
                margin-left: 0.25rem;
              }
            }
          }
          
          .timeline-stats {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            
            .stat-item {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.8);
              
              .stat-icon {
                &.completed { color: #4caf50; }
                &.current { color: #ff9800; }
              }
            }
          }
        }
        
        .timeline {
          position: relative;
          
          .timeline-item {
            display: flex;
            margin-bottom: 1.5rem;
            position: relative;
            
            &.is-last .timeline-marker .connecting-line {
              display: none;
            }
            
            .timeline-marker {
              position: relative;
              margin-right: 1rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              
              .marker-dot {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                z-index: 2;
                
                &.status-completed {
                  background: rgba(76, 175, 80, 0.2);
                  border: 2px solid #4caf50;
                  color: #4caf50;
                }
                
                &.status-current {
                  background: rgba(255, 152, 0, 0.2);
                  border: 2px solid #ff9800;
                  color: #ff9800;
                  animation: pulse-current 2s ease-in-out infinite;
                }
                
                &.status-pending {
                  background: rgba(255, 255, 255, 0.1);
                  border: 2px solid rgba(255, 255, 255, 0.3);
                  color: rgba(255, 255, 255, 0.6);
                }
              }
              
              .connecting-line {
                width: 2px;
                flex: 1;
                background: linear-gradient(to bottom, 
                  rgba(102, 126, 234, 0.4) 0%, 
                  rgba(102, 126, 234, 0.2) 50%,
                  rgba(102, 126, 234, 0.1) 100%
                );
                min-height: 2rem;
                margin-top: 0.5rem;
              }
            }
            
            .timeline-content {
              flex: 1;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 0.75rem;
              padding: 1rem;
              border: 1px solid rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              
              .event-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
                
                .event-date {
                  font-size: 0.75rem;
                  color: rgba(255, 255, 255, 0.7);
                  font-weight: 500;
                }
                
                .event-status {
                  font-size: 0.625rem;
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.75rem;
                  font-weight: 500;
                  
                  &.status-completed {
                    background: rgba(76, 175, 80, 0.2);
                    color: #4caf50;
                  }
                  
                  &.status-current {
                    background: rgba(255, 152, 0, 0.2);
                    color: #ff9800;
                  }
                  
                  &.status-pending {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.6);
                  }
                }
              }
              
              .event-body {
                margin-bottom: 0.75rem;
                
                .event-title {
                  margin: 0 0 0.5rem 0;
                  font-size: 0.875rem;
                  font-weight: 600;
                  color: rgba(255, 255, 255, 0.9);
                  line-height: 1.3;
                }
                
                .event-description {
                  margin: 0;
                  font-size: 0.75rem;
                  color: rgba(255, 255, 255, 0.7);
                  line-height: 1.4;
                }
              }
              
              .event-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                .time-elapsed {
                  font-size: 0.625rem;
                  color: rgba(255, 255, 255, 0.5);
                }
                
                .event-impact {
                  display: flex;
                  align-items: center;
                  gap: 0.25rem;
                  font-size: 0.625rem;
                  color: #4caf50;
                  
                  svg {
                    opacity: 0.8;
                  }
                }
              }
            }
            
            &.status-completed .timeline-content {
              border-left: 3px solid #4caf50;
            }
            
            &.status-current .timeline-content {
              border-left: 3px solid #ff9800;
              box-shadow: 0 0 1rem rgba(255, 152, 0, 0.2);
            }
          }
        }
        
        .history-insights {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          
          h4 {
            margin: 0 0 1rem 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
          }
          
          .insights-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            
            .insight-card {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 0.75rem;
              padding: 0.875rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: 0.5rem;
              border: 1px solid rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              transition: all 0.3s ease;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
              }
              
              .insight-icon {
                width: 2.25rem;
                height: 2.25rem;
                border-radius: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 0.25rem;
              }
              
              .insight-content {
                .insight-value {
                  font-size: 1.125rem;
                  font-weight: 700;
                  line-height: 1;
                  margin-bottom: 0.25rem;
                }
                
                .insight-label {
                  font-size: 0.5625rem;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  opacity: 0.8;
                }
              }
              
              // 不同卡片的颜色主题
              &.completion {
                border-left: 3px solid #4caf50;
                
                .insight-icon {
                  background: rgba(76, 175, 80, 0.2);
                  color: #4caf50;
                }
                
                .insight-content {
                  .insight-value { color: #4caf50; }
                  .insight-label { color: rgba(76, 175, 80, 0.8); }
                }
              }
              
              &.interval {
                border-left: 3px solid #2196f3;
                
                .insight-icon {
                  background: rgba(33, 150, 243, 0.2);
                  color: #2196f3;
                }
                
                .insight-content {
                  .insight-value { color: #2196f3; }
                  .insight-label { color: rgba(33, 150, 243, 0.8); }
                }
              }
              
              &.trend {
                border-left: 3px solid #ff9800;
                
                .insight-icon {
                  background: rgba(255, 152, 0, 0.2);
                  color: #ff9800;
                }
                
                .insight-content {
                  .insight-value { color: #ff9800; }
                  .insight-label { color: rgba(255, 152, 0, 0.8); }
                }
              }
              
              &.consistency {
                border-left: 3px solid #9c27b0;
                
                .insight-icon {
                  background: rgba(156, 39, 176, 0.2);
                  color: #9c27b0;
                }
                
                .insight-content {
                  .insight-value { color: #9c27b0; }
                  .insight-label { color: rgba(156, 39, 176, 0.8); }
                }
              }
            }
          }
        }
      }
      
      // 现状分析样式
      .analysis-section {
        .progress-overview {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          
          .progress-circle-container {
            display: flex;
            align-items: center;
            gap: 1rem;
            
            .progress-circle {
              position: relative;
              width: 4rem;
              height: 4rem;
              
              svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
              }
              
              .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1rem;
                font-weight: 700;
                color: #4caf50;
              }
            }
            
            .progress-info {
              .progress-label {
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 0.25rem;
                color: rgba(255, 255, 255, 0.9);
              }
              
              .progress-subtitle {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.7);
              }
            }
          }
        }
        
        .state-management {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
          
          .state-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            padding: 1rem;
            backdrop-filter: blur(10px);
            
            .card-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 1rem;
              
              .header-title {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                
                .header-icon {
                  color: rgba(255, 255, 255, 0.8);
                }
                
                h4 {
                  margin: 0;
                  font-size: 0.875rem;
                  font-weight: 600;
                  color: rgba(255, 255, 255, 0.9);
                }
              }
              
              .add-btn {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                
                &:hover {
                  background: rgba(255, 255, 255, 0.2);
                  border-color: rgba(255, 255, 255, 0.4);
                }
              }
            }
            
            .items-list {
              .state-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 0.5rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
                
                &:last-child {
                  margin-bottom: 0;
                }
                
                .item-content {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 0.25rem;
                  
                  .item-type, .item-title {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                  }
                  
                  .item-value, .item-timeline {
                    font-size: 0.625rem;
                    color: rgba(255, 255, 255, 0.7);
                  }
                  
                  .item-status {
                    font-size: 0.625rem;
                    padding: 0.125rem 0.5rem;
                    border-radius: 0.75rem;
                    font-weight: 500;
                    
                    &.available { 
                      background: rgba(76, 175, 80, 0.2); 
                      color: #4caf50; 
                    }
                    &.limited { 
                      background: rgba(255, 152, 0, 0.2); 
                      color: #ff9800; 
                    }
                    &.scarce { 
                      background: rgba(244, 67, 54, 0.2); 
                      color: #f44336; 
                    }
                  }
                  
                  .item-priority {
                    font-size: 0.625rem;
                    padding: 0.125rem 0.5rem;
                    border-radius: 0.75rem;
                    font-weight: 500;
                    
                    &.high { 
                      background: rgba(244, 67, 54, 0.2); 
                      color: #f44336; 
                    }
                    &.medium { 
                      background: rgba(255, 152, 0, 0.2); 
                      color: #ff9800; 
                    }
                    &.low { 
                      background: rgba(76, 175, 80, 0.2); 
                      color: #4caf50; 
                    }
                  }
                  
                  .skill-level {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.25rem;
                    
                    .level-bar {
                      flex: 1;
                      height: 0.25rem;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 0.125rem;
                      overflow: hidden;
                      
                      .level-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #4caf50, #8bc34a);
                        border-radius: 0.125rem;
                        transition: width 0.3s ease;
                      }
                    }
                    
                    .level-text {
                      font-size: 0.625rem;
                      color: #4caf50;
                      font-weight: 600;
                      min-width: 2rem;
                    }
                  }
                }
                
                .edit-btn {
                  width: 1.5rem;
                  height: 1.5rem;
                  border-radius: 0.25rem;
                  border: none;
                  background: rgba(255, 255, 255, 0.1);
                  color: rgba(255, 255, 255, 0.6);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  
                  &:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.8);
                  }
                }
              }
            }
            
            &.resources {
              border-left: 3px solid #2196f3;
            }
            
            &.capabilities {
              border-left: 3px solid #4caf50;
            }
            
            &.goals {
              border-left: 3px solid #ff9800;
            }
          }
        }
        
        .impact-analysis {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          padding: 1.5rem;
          
          h4 {
            margin: 0 0 1rem 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
          }
          
          .impact-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            
            .impact-item {
              display: flex;
              align-items: flex-start;
              gap: 0.75rem;
              padding: 1rem;
              border-radius: 0.5rem;
              
              .impact-icon {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              
              .impact-content {
                flex: 1;
                
                .impact-title {
                  font-size: 0.75rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                }
                
                .impact-list {
                  list-style: none;
                  padding: 0;
                  margin: 0;
                  
                  li {
                    font-size: 0.625rem;
                    padding: 0.25rem 0;
                    color: rgba(255, 255, 255, 0.8);
                    
                    &:before {
                      content: '• ';
                      margin-right: 0.25rem;
                    }
                  }
                }
              }
              
              &.positive {
                background: rgba(76, 175, 80, 0.1);
                border: 1px solid rgba(76, 175, 80, 0.2);
                
                .impact-icon {
                  background: rgba(76, 175, 80, 0.2);
                  color: #4caf50;
                }
                
                .impact-title {
                  color: #4caf50;
                }
              }
              
              &.neutral {
                background: rgba(255, 152, 0, 0.1);
                border: 1px solid rgba(255, 152, 0, 0.2);
                
                .impact-icon {
                  background: rgba(255, 152, 0, 0.2);
                  color: #ff9800;
                }
                
                .impact-title {
                  color: #ff9800;
                }
              }
              
              &.negative {
                background: rgba(244, 67, 54, 0.1);
                border: 1px solid rgba(244, 67, 54, 0.2);
                
                .impact-icon {
                  background: rgba(244, 67, 54, 0.2);
                  color: #f44336;
                }
                
                .impact-title {
                  color: #f44336;
                }
              }
            }
          }
        }
      }
      
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
            margin: 0 0 1rem 0;
            
            li {
              padding: 0.25rem 0.5rem;
              margin-bottom: 0.25rem;
              font-size: 0.75rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 0.5rem;
              opacity: 0.8;
            }
          }
          
          .strengths-challenges {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            
            .strengths, .challenges {
              h5 {
                margin: 0 0 0.5rem 0;
                font-size: 0.75rem;
                font-weight: 600;
                opacity: 0.9;
              }
              
              ul {
                list-style: none;
                padding: 0;
                margin: 0;
                
                li {
                  font-size: 0.625rem;
                  padding: 0.125rem 0.375rem;
                  margin-bottom: 0.125rem;
                  border-radius: 0.375rem;
                  line-height: 1.3;
                }
              }
            }
            
            .strengths {
              h5 { color: #4caf50; }
              ul li {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
              }
            }
            
            .challenges {
              h5 { color: #ff9800; }
              ul li {
                background: rgba(255, 152, 0, 0.2);
                color: #ff9800;
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
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 0.75rem;
              margin-top: 0.5rem;
              
              .probability-label {
                color: rgba(255, 255, 255, 0.7);
              }
              
              .probability-value {
                font-weight: 600;
                padding: 0.125rem 0.5rem;
                border-radius: 0.75rem;
                font-size: 0.6875rem;
              }
              
              &.high-probability .probability-value {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
              }
              
              &.medium-probability .probability-value {
                background: rgba(255, 193, 7, 0.2);
                color: #ffc107;
              }
              
              &.low-probability .probability-value {
                background: rgba(255, 152, 0, 0.2);
                color: #ff9800;
              }
              
              &.very-low-probability .probability-value {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
              }
            }
          }
        }
      }
      
      // 多维关联样式
      .connections-section {
        h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          text-align: center;
          color: rgba(255, 255, 255, 0.9);
        }
      }
      
      .connection-map {
        position: relative;
        min-height: 25rem;
        padding: 2rem;
        
        .connection-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          
          .main-line {
            animation: line-intensity 4s ease-in-out infinite;
            stroke-dasharray: 5 3;
            stroke-dashoffset: 0;
            
            &:hover {
              stroke-width: 4;
              filter: url(#glow) brightness(1.2);
            }
          }
          
          .data-particle {
            opacity: 0.8;
            filter: drop-shadow(0 0 3px currentColor);
          }
          
          .strength-indicator {
            font-family: 'Arial', sans-serif;
            font-weight: 600;
            opacity: 0.8;
            animation: fade-in-out 3s ease-in-out infinite;
          }
        }
        
        .central-node {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          
          .main-node {
            width: 5rem;
            height: 5rem;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%);
            border: 3px solid #667eea;
            box-shadow: 0 0 1rem rgba(102, 126, 234, 0.4);
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.5rem;
          }
        }
        
        .connected-nodes {
          .connection-item {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 3;
            
            &.position-1 { 
              top: 15%; 
              left: 10%; 
            }
            
            &.position-2 { 
              top: 15%; 
              right: 10%; 
            }
            
            &.position-3 { 
              bottom: 15%; 
              left: 10%; 
            }
            
            &.position-4 { 
              bottom: 15%; 
              right: 10%; 
            }
            
            .connection-info {
              margin-top: 0.5rem;
              text-align: center;
              
              .connection-strength {
                font-size: 0.75rem;
                font-weight: 600;
                color: #4caf50;
                margin-bottom: 0.25rem;
              }
              
              .connection-description {
                font-size: 0.625rem;
                color: rgba(255, 255, 255, 0.7);
                max-width: 6rem;
                line-height: 1.3;
              }
            }
          }
        }
        
        .node-circle {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          text-align: center;
          line-height: 1.2;
          color: #fff;
          position: relative;
          z-index: 3;
          backdrop-filter: blur(10px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
          
          .connection-label {
            padding: 0.25rem;
            font-weight: 500;
          }
          
          &.health { 
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(76, 175, 80, 0.6) 100%);
            border: 2px solid #4caf50; 
            box-shadow: 0 0 1rem rgba(76, 175, 80, 0.3);
          }
          &.finance { 
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(255, 193, 7, 0.6) 100%);
            border: 2px solid #ffc107; 
            box-shadow: 0 0 1rem rgba(255, 193, 7, 0.3);
          }
          &.family { 
            background: linear-gradient(135deg, rgba(233, 30, 99, 0.4) 0%, rgba(233, 30, 99, 0.6) 100%);
            border: 2px solid #e91e63; 
            box-shadow: 0 0 1rem rgba(233, 30, 99, 0.3);
          }
          &.career { 
            background: linear-gradient(135deg, rgba(121, 85, 72, 0.4) 0%, rgba(121, 85, 72, 0.6) 100%);
            border: 2px solid #795548; 
            box-shadow: 0 0 1rem rgba(121, 85, 72, 0.3);
          }
          &.education { 
            background: linear-gradient(135deg, rgba(63, 81, 181, 0.4) 0%, rgba(63, 81, 181, 0.6) 100%);
            border: 2px solid #3f51b5; 
            box-shadow: 0 0 1rem rgba(63, 81, 181, 0.3);
          }
          &.network { 
            background: linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(156, 39, 176, 0.6) 100%);
            border: 2px solid #9c27b0; 
            box-shadow: 0 0 1rem rgba(156, 39, 176, 0.3);
          }
          &.default { 
            background: linear-gradient(135deg, rgba(158, 158, 158, 0.4) 0%, rgba(158, 158, 158, 0.6) 100%);
            border: 2px solid #9e9e9e; 
            box-shadow: 0 0 1rem rgba(158, 158, 158, 0.3);
          }
        }
      }
    }
  }
}


@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100%);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromRight {
  0% {
    transform: translateX(100%);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

// 星空背景样式
.starry-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  
  .star {
    position: absolute;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: transform, opacity;
    
    // 所有星星都有移动动画
    animation: star-move linear infinite;
    animation-duration: var(--move-duration);
    animation-delay: var(--move-delay);
    
    &.twinkling {
      // 同时应用移动和闪烁动画
      animation: 
        star-move linear infinite,
        star-twinkle ease-in-out infinite alternate;
      animation-duration: 
        var(--move-duration),
        var(--twinkle-duration);
      animation-delay: 
        var(--move-delay),
        var(--twinkle-delay);
    }
    
    // 不同类型星星的基础样式
    &.star-bright {
      filter: brightness(1.2);
    }
    
    &.star-medium {
      filter: brightness(1.0);
    }
    
    &.star-small {
      filter: brightness(0.8);
    }
    
    &.star-tiny {
      filter: brightness(0.6);
    }
  }
}

// 星星移动动画 - 循环往返运动
@keyframes star-move {
  0% { 
    transform: translate(-50%, -50%);
  }
  25% { 
    transform: translate(calc(-50% + var(--move-x) * 0.5), calc(-50% + var(--move-y) * 0.5));
  }
  50% { 
    transform: translate(calc(-50% + var(--move-x)), calc(-50% + var(--move-y)));
  }
  75% { 
    transform: translate(calc(-50% + var(--move-x) * 0.5), calc(-50% + var(--move-y) * 0.5));
  }
  100% { 
    transform: translate(-50%, -50%);
  }
}

// 星星闪烁动画
@keyframes star-twinkle {
  0% { 
    opacity: 0.2;
    filter: brightness(0.6) blur(0px);
  }
  25% { 
    opacity: 0.8;
    filter: brightness(1.2) blur(0.5px);
  }
  50% { 
    opacity: 1;
    filter: brightness(1.4) blur(1px);
  }
  75% { 
    opacity: 0.6;
    filter: brightness(0.9) blur(0.3px);
  }
  100% { 
    opacity: 0.3;
    filter: brightness(0.7) blur(0px);
  }
}

// 左滑提示动画
@keyframes pulse-left {
  0%, 100% { 
    transform: translateX(0);
    opacity: 0.6;
  }
  50% { 
    transform: translateX(-3px);
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }
}

// 右滑提示动画
@keyframes pulse-right {
  0%, 100% { 
    transform: translateX(0);
    opacity: 0.6;
  }
  50% { 
    transform: translateX(3px);
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }
}

// 提示文字淡入淡出
@keyframes fade-in-out {
  0%, 100% { 
    opacity: 0.3;
  }
  50% { 
    opacity: 0.8;
  }
}

// 连接线强度动画
@keyframes line-intensity {
  0%, 100% { 
    opacity: 0.4;
    stroke-width: 2;
  }
  50% { 
    opacity: 0.9;
    stroke-width: 4;
  }
}

// 虚线流动效果
@keyframes dash-flow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 8;
  }
}

// 当前事件脉搏动画
@keyframes pulse-current {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(255, 152, 0, 0);
  }
}
</style>