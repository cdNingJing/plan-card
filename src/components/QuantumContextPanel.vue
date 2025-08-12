<template>
  <div class="quantum-context-panel" :class="{ expanded: isExpanded }" ref="panelRef">
    <!-- 折叠状态的触发器 -->
    <div class="panel-trigger" @click="togglePanel" v-if="!isExpanded">
      <div class="trigger-icon">
        <component :is="Brain" :size="20" />
      </div>
      <div class="trigger-glow"></div>
      <div class="context-hint">{{ currentContext.name }}</div>
    </div>

    <!-- 展开状态的内容面板 -->
    <div class="panel-content" v-if="isExpanded">
      <!-- 顶部标题栏 -->
      <div class="panel-header">
        <div class="header-left">
          <component :is="currentContext.icon" :size="18" />
          <span class="panel-title">情境感知</span>
        </div>
        <button class="close-btn" @click="togglePanel">
          <component :is="X" :size="16" />
        </button>
      </div>

      <!-- 当前情境显示 -->
      <div class="current-context">
        <div class="context-indicator">
          <div class="context-ring" :style="contextRingStyle"></div>
          <div class="context-core">
            <component :is="currentContext.icon" :size="24" />
          </div>
        </div>
        <div class="context-info">
          <h3 class="context-name">{{ currentContext.name }}</h3>
          <p class="context-desc">{{ currentContext.description }}</p>
          <div class="context-energy">
            <span class="energy-label">当前能量</span>
            <div class="energy-bar">
              <div class="energy-fill" :style="`width: ${currentContext.energy}%`"></div>
            </div>
            <span class="energy-value">{{ currentContext.energy }}%</span>
          </div>
        </div>
      </div>

      <!-- 情境建议 */
      <div class="context-suggestions">
        <h4 class="suggestions-title">智能建议</h4>
        <div class="suggestion-list">
          <div v-for="suggestion in currentSuggestions" :key="suggestion.id"
               class="suggestion-item" :class="suggestion.priority"
               @click="applySuggestion(suggestion)">
            <div class="suggestion-icon">
              <component :is="suggestion.icon" :size="14" />
            </div>
            <div class="suggestion-content">
              <span class="suggestion-text">{{ suggestion.text }}</span>
              <div class="suggestion-meta">
                <span class="suggestion-type">{{ suggestion.type }}</span>
                <span class="suggestion-impact">{{ suggestion.impact }}</span>
              </div>
            </div>
            <div class="suggestion-probability">
              {{ suggestion.probability }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 情境历史 -->
      <div class="context-timeline">
        <h4 class="timeline-title">时间流</h4>
        <div class="timeline-container">
          <div v-for="(event, index) in contextHistory" :key="index"
               class="timeline-event" :class="event.type">
            <div class="event-time">{{ formatTime(event.timestamp) }}</div>
            <div class="event-content">
              <component :is="event.icon" :size="12" />
              <span class="event-text">{{ event.description }}</span>
            </div>
            <div class="event-impact" :style="`opacity: ${event.impact / 100}`"></div>
          </div>
        </div>
      </div>

      <!-- 快速操作按钮 -->
      <div class="quick-actions">
        <button v-for="action in quickActions" :key="action.id"
                class="action-btn" :class="action.style"
                @click="executeAction(action)">
          <component :is="action.icon" :size="14" />
          <span>{{ action.label }}</span>
        </button>
      </div>
    </div>

    <!-- 环境感知粒子 -->
    <div class="ambient-particles" v-if="isExpanded">
      <div v-for="particle in ambientParticles" :key="particle.id"
           class="particle" :style="getParticleStyle(particle)">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { 
  Brain, X, Lightbulb, Target, Clock, Zap, 
  Sun, Moon, Coffee, Sunset, Sunrise, Activity,
  TrendingUp, AlertCircle, CheckCircle, Star
} from 'lucide-vue-next'

// 组件状态
const isExpanded = ref(false)
const panelRef = ref(null)
const animationFrame = ref(null)
const particleTime = ref(0)

// 当前时间和情境
const currentTime = ref(new Date())
const timeUpdateInterval = ref(null)

// 情境数据
const contexts = reactive([
  {
    id: 'morning',
    name: '晨曦时光',
    description: '清晨是制定计划和启动新任务的黄金时间',
    icon: Sunrise,
    color: '#F59E0B',
    energy: 85,
    timeRange: [5, 11],
    suggestions: ['morning-plan', 'energy-tasks', 'creative-work']
  },
  {
    id: 'afternoon', 
    name: '午后专注',
    description: '下午适合深度工作和重要决策',
    icon: Sun,
    color: '#EF4444',
    energy: 75,
    timeRange: [11, 17],
    suggestions: ['focus-work', 'meetings', 'progress-review']
  },
  {
    id: 'evening',
    name: '黄昏反思',
    description: '傍晚是回顾总结和规划明天的时刻',
    icon: Sunset,
    color: '#8B5CF6', 
    energy: 60,
    timeRange: [17, 21],
    suggestions: ['reflection', 'planning', 'social-time']
  },
  {
    id: 'night',
    name: '深夜沉思',
    description: '夜晚适合深度思考和长远规划',
    icon: Moon,
    color: '#3B82F6',
    energy: 45,
    timeRange: [21, 5],
    suggestions: ['deep-thinking', 'long-term-goals', 'rest']
  }
])

// 建议数据库
const suggestionDatabase = reactive({
  'morning-plan': {
    id: 'morning-plan',
    text: '制定今日三大核心任务',
    type: '规划',
    icon: Target,
    priority: 'high',
    impact: '+15% 执行力',
    probability: 92
  },
  'energy-tasks': {
    id: 'energy-tasks',
    text: '优先处理高能耗任务',
    type: '执行',
    icon: Zap,
    priority: 'medium',
    impact: '+20% 效率',
    probability: 88
  },
  'creative-work': {
    id: 'creative-work',
    text: '安排创意性工作',
    type: '创新',
    icon: Lightbulb,
    priority: 'medium',
    impact: '+25% 创造力',
    probability: 75
  },
  'focus-work': {
    id: 'focus-work',
    text: '进入深度工作模式',
    type: '专注',
    icon: Activity,
    priority: 'high',
    impact: '+30% 专注度',
    probability: 85
  },
  'reflection': {
    id: 'reflection',
    text: '回顾今日收获与不足',
    type: '反思',
    icon: CheckCircle,
    priority: 'medium',
    impact: '+10% 成长速度',
    probability: 90
  },
  'deep-thinking': {
    id: 'deep-thinking',
    text: '思考人生重要问题',
    type: '思考',
    icon: Brain,
    priority: 'low',
    impact: '+5% 智慧',
    probability: 70
  }
})

// 快速操作
const quickActions = reactive([
  { id: 'optimize', label: '优化建议', icon: TrendingUp, style: 'primary' },
  { id: 'focus', label: '专注模式', icon: Target, style: 'secondary' },
  { id: 'energy', label: '能量提升', icon: Zap, style: 'accent' },
  { id: 'insight', label: '洞察分析', icon: Star, style: 'neutral' }
])

// 情境历史
const contextHistory = ref([
  {
    timestamp: Date.now() - 3600000,
    description: '进入深度工作状态',
    type: 'focus',
    icon: Activity,
    impact: 85
  },
  {
    timestamp: Date.now() - 7200000,
    description: '完成重要任务规划',
    type: 'achievement',
    icon: CheckCircle,
    impact: 75
  },
  {
    timestamp: Date.now() - 10800000,
    description: '能量水平达到峰值',
    type: 'energy',
    icon: Zap,
    impact: 90
  }
])

// 环境粒子
const ambientParticles = ref(Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  speed: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.5 + 0.3
})))

// 计算属性
const currentContext = computed(() => {
  const hour = currentTime.value.getHours()
  return contexts.find(ctx => {
    const [start, end] = ctx.timeRange
    if (start > end) { // 跨天情况（如夜晚）
      return hour >= start || hour < end
    }
    return hour >= start && hour < end
  }) || contexts[0]
})

const currentSuggestions = computed(() => {
  return currentContext.value.suggestions.map(id => suggestionDatabase[id]).filter(Boolean)
})

const contextRingStyle = computed(() => ({
  borderColor: currentContext.value.color,
  boxShadow: `0 0 20px ${currentContext.value.color}33`
}))

// 方法
const togglePanel = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    startParticleAnimation()
  } else {
    stopParticleAnimation()
  }
}

const applySuggestion = (suggestion) => {
  console.log('应用建议:', suggestion.text)
  // 可以在这里添加具体的建议执行逻辑
}

const executeAction = (action) => {
  console.log('执行操作:', action.label)
  // 可以在这里添加具体的操作执行逻辑
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getParticleStyle = (particle) => {
  const drift = Math.sin(particleTime.value * 0.001 * particle.speed) * 10
  return {
    left: `${particle.x + drift}%`,
    top: `${particle.y}%`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    opacity: particle.opacity * Math.sin(particleTime.value * 0.002 + particle.id)
  }
}

const startParticleAnimation = () => {
  const animate = () => {
    particleTime.value += 16
    animationFrame.value = requestAnimationFrame(animate)
  }
  animate()
}

const stopParticleAnimation = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
}

const updateTime = () => {
  currentTime.value = new Date()
}

onMounted(() => {
  // 每分钟更新时间
  timeUpdateInterval.value = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timeUpdateInterval.value) {
    clearInterval(timeUpdateInterval.value)
  }
  stopParticleAnimation()
})
</script>

<style scoped>
.quantum-context-panel {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.quantum-context-panel.expanded {
  width: 320px;
  height: 500px;
}

/* 折叠状态触发器 */
.panel-trigger {
  position: relative;
  width: 60px;
  height: 60px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
}

.panel-trigger:hover {
  transform: scale(1.05);
  border-color: rgba(59, 130, 246, 0.6);
}

.trigger-icon {
  color: #3B82F6;
  transition: all 0.3s ease;
}

.trigger-glow {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  animation: triggerPulse 3s ease-in-out infinite;
}

.context-hint {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(15, 23, 42, 0.8);
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.panel-trigger:hover .context-hint {
  opacity: 1;
}

/* 展开状态面板 */
.panel-content {
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3B82F6;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(156, 163, 175, 0.2);
  border: none;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 当前情境 */
.current-context {
  padding: 20px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.context-indicator {
  position: relative;
  flex-shrink: 0;
}

.context-ring {
  width: 50px;
  height: 50px;
  border: 2px solid;
  border-radius: 50%;
  animation: contextPulse 2s ease-in-out infinite;
}

.context-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: inherit;
}

.context-info {
  flex: 1;
}

.context-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 5px 0;
}

.context-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.context-energy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
}

.energy-label {
  color: rgba(255, 255, 255, 0.6);
}

.energy-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #3B82F6);
  transition: width 0.6s ease;
}

.energy-value {
  color: #3B82F6;
  font-weight: 600;
}

/* 建议区域 */
.context-suggestions {
  padding: 0 20px 15px;
  flex: 1;
  overflow-y: auto;
}

.suggestions-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 10px 0;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.suggestion-item.high {
  border-color: rgba(239, 68, 68, 0.3);
}

.suggestion-icon {
  color: #3B82F6;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-text {
  font-size: 0.75rem;
  color: white;
  display: block;
}

.suggestion-meta {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.suggestion-type, .suggestion-impact {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
}

.suggestion-probability {
  font-size: 0.7rem;
  color: #10B981;
  font-weight: 600;
  flex-shrink: 0;
}

/* 时间流 */
.context-timeline {
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
}

.timeline-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 10px 0;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline-event {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
}

.event-time {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  width: 40px;
}

.event-content {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
}

.event-impact {
  width: 4px;
  height: 4px;
  background: #10B981;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 快速操作 */
.quick-actions {
  padding: 15px 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.action-btn.primary {
  border-color: rgba(59, 130, 246, 0.4);
  color: #3B82F6;
}

.action-btn.secondary {
  border-color: rgba(16, 185, 129, 0.4);
  color: #10B981;
}

.action-btn.accent {
  border-color: rgba(245, 158, 11, 0.4);
  color: #F59E0B;
}

.action-btn.neutral {
  border-color: rgba(156, 163, 175, 0.4);
  color: #9CA3AF;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 环境粒子 */
.ambient-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 20px;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(1px);
}

/* 动画定义 */
@keyframes triggerPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes contextPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .quantum-context-panel {
    top: 20px;
    right: 20px;
  }
  
  .quantum-context-panel.expanded {
    width: 280px;
    height: 450px;
  }
  
  .panel-trigger {
    width: 50px;
    height: 50px;
  }
  
  .current-context {
    padding: 15px;
  }
  
  .context-suggestions {
    padding: 0 15px 10px;
  }
}
</style>