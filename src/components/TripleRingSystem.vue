<template>
  <div class="triple-ring-system">
    <!-- 背景装饰层 -->
    <div class="cosmic-background">
      <div class="cosmic-grid"></div>
      <div class="floating-particles"></div>
    </div>
    
    <!-- 三层可移动图层系统 -->
    <div class="three-layer-container" :class="{ 'centered-mode': layoutMode === 'centered' }">
      
      <!-- 简洁的卡片布局 -->
      <div v-if="layoutMode === 'centered'" class="centered-cards-layout">
        
        <!-- 六边形交互圆圈 -->
        <div class="hexagon-circle-container">
          <div class="hexagon-circle" :class="{ 'expanded': circleState.isExpanded }">
            
            <!-- 6个三角形区域 -->
            <div 
              v-for="(segment, index) in circleSegments" 
              :key="segment.id"
              class="triangle-segment"
              :class="[segment.type, { 'active': segment.isOpen }]"
              :style="getSegmentStyle(segment, index)"
              @click="toggleSegment(index)"
            >
              <!-- 三角形内容覆盖层 -->
              <div class="segment-content">
                <component :is="segment.icon" :size="12" class="segment-icon" />
                <div class="segment-title">{{ segment.title }}</div>
                <div class="segment-description">{{ segment.description || '详细描述' }}</div>
              </div>
            </div>
            
            <!-- 中心圆形区域 -->
            <div class="center-circle" @click="toggleAllSegments">
              <div class="center-content">
                <div class="center-title">计划系统</div>
                <div class="center-subtitle">{{ activeSegmentsCount }}/6</div>
              </div>
            </div>
            
          </div>
        </div>
        
        <!-- 展开的内容面板 - 全屏覆盖显示 -->
        <div v-if="circleState.isExpanded" class="expanded-content-overlay" @click="collapseCircle">
          <div class="expanded-content-panel" @click.stop>
            <div class="panel-header">
              <div class="header-icon">
                <component :is="getActiveSegmentIcon()" :size="24" />
              </div>
              <h2 class="panel-title">{{ getActiveSegmentTitle() }}</h2>
              <button class="close-btn" @click="collapseCircle">
                <X :size="18" />
              </button>
            </div>
            
            <!-- 可滚动的内容区域 -->
            <div class="panel-content-scroll">
              <div class="panel-content">
                <div v-if="getActiveSegment()" class="active-segment-data">
                  <!-- 详细信息卡片 -->
                  <div class="segment-summary">
                    <div class="summary-stats">
                      <div class="stat-item">
                        <div class="stat-value">{{ getActiveSegmentCount() }}</div>
                        <div class="stat-label">项目总数</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ getCompletionRate() }}%</div>
                        <div class="stat-label">完成进度</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ getPriorityCount() }}</div>
                        <div class="stat-label">重要项目</div>
                      </div>
                    </div>
                    <div class="summary-description">
                      <p>{{ getActiveSegmentDescription() }}</p>
                    </div>
                  </div>
                  
                  <!-- 内容网格 -->
                  <div class="content-grid">
                    <div 
                      v-for="(item, index) in getActiveSegmentData()" 
                      :key="`active-${index}`"
                      class="content-item"
                      :class="{ 'priority': item.priority, 'completed': item.completed }"
                    >
                      <div class="item-icon">
                        <component :is="item.icon || getDefaultIcon(item)" :size="20" />
                      </div>
                      <div class="item-content">
                        <div class="item-value">{{ item.value }}</div>
                        <div class="item-label">{{ item.label }}</div>
                        <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
                        <div v-if="item.progress" class="item-progress">
                          <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
                          </div>
                          <span class="progress-text">{{ item.progress }}%</span>
                        </div>
                      </div>
                      <div class="item-status" v-if="item.status">
                        <span class="status-badge" :class="item.status">{{ getStatusText(item.status) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 分类标签 -->
                  <div class="content-categories">
                    <h3>相关分类</h3>
                    <div class="category-tags">
                      <span 
                        v-for="(tag, index) in getCategoryTags()" 
                        :key="`tag-${index}`"
                        class="category-tag"
                        :style="{ '--tag-color': tag.color }"
                      >
                        <component :is="tag.icon" :size="14" />
                        {{ tag.name }}
                      </span>
                    </div>
                  </div>
                  
                </div>
                <div v-else class="no-active-segment">
                  <div class="empty-state">
                    <CircleSlash :size="48" />
                    <h3>请选择一个区域</h3>
                    <p>点击圆圈中的任意区域查看详细内容</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- 原有的卡片布局（正常模式） -->
      
      <!-- 第一层：核心愿景层 (左上区域) -->
      <div v-show="layoutMode === 'normal'" class="layer-one" :class="{ 
        'centered': layoutMode === 'centered',
        'focused': focusedLayer === 'vision',
        'unfocused': layoutMode === 'centered' && focusedLayer !== 'vision'
      }">
        <div class="layer-header">
          <Globe class="layer-icon" />
          <h3 class="layer-title">人生愿景</h3>
        </div>
        <div class="cards-container">
          <div 
            class="vision-card" 
            v-for="(item, index) in visionData" 
            :key="'vision-' + index"
            :class="{ 'hovered': hoveredElement === item }"
            :style="{ '--appear-delay': index * 0.1 + 's' }"
            @click="handleElementClick(item, 'vision', $event)"
            @mouseenter="handleElementHover(item, true)"
            @mouseleave="handleElementHover(item, false)"
          >
            <div class="card-content">
              <div class="data-core">{{ item.value }}</div>
              <div class="data-label">{{ item.label }}</div>
              <div class="data-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 第二层：执行计划层 (右侧区域) -->
      <div v-show="layoutMode === 'normal'" class="layer-two" :class="{ 
        'centered': layoutMode === 'centered',
        'focused': focusedLayer === 'plan',
        'unfocused': layoutMode === 'centered' && focusedLayer !== 'plan'
      }">
        <div class="layer-header">
          <Building2 class="layer-icon" />
          <h3 class="layer-title">执行计划</h3>
        </div>
        <div class="cards-container">
          <div 
            class="plan-card" 
            v-for="(item, index) in planData" 
            :key="'plan-' + index"
            :class="{ 'hovered': hoveredElement === item }"
            :style="{ '--appear-delay': index * 0.08 + 's' }"
            @click="handleElementClick(item, 'plan', $event)"
            @mouseenter="handleElementHover(item, true)"
            @mouseleave="handleElementHover(item, false)"
          >
            <div class="card-content">
              <div class="data-core">{{ item.value }}</div>
              <div class="data-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 第三层：行动步骤层 (下方区域) -->
      <div v-show="layoutMode === 'normal'" class="layer-three" :class="{ 
        'centered': layoutMode === 'centered',
        'focused': focusedLayer === 'action',
        'unfocused': layoutMode === 'centered' && focusedLayer !== 'action'
      }">
        <div class="layer-header">
          <Zap class="layer-icon" />
          <h3 class="layer-title">行动步骤</h3>
        </div>
        <div class="cards-container">
          <div 
            class="action-card" 
            v-for="(item, index) in actionData" 
            :key="'action-' + index"
            :class="{ 'hovered': hoveredElement === item }"
            :style="{ '--appear-delay': index * 0.06 + 's' }"
            @click="handleElementClick(item, 'action', $event)"
            @mouseenter="handleElementHover(item, true)"
            @mouseleave="handleElementHover(item, false)"
          >
            <div class="card-content">
              <div class="data-core">{{ item.value }}</div>
              <div class="data-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- 中心多面体图标 -->
    <div class="polyhedron-icon" @click="handlePolyhedronClick($event)">
      <div class="polyhedron-container" :class="{ 'clicked': layoutMode === 'centered' }">
        <svg class="polyhedron-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <!-- 多面体的面 -->
          <g class="polyhedron-faces">
            <!-- 前面 -->
            <polygon points="20,8 30,18 20,32 10,18" class="face front" fill="rgba(59, 130, 246, 0.3)" stroke="rgba(59, 130, 246, 0.8)" stroke-width="0.5"/>
            <!-- 左面 -->
            <polygon points="10,18 20,8 15,5 8,15" class="face left" fill="rgba(16, 185, 129, 0.3)" stroke="rgba(16, 185, 129, 0.8)" stroke-width="0.5"/>
            <!-- 右面 -->
            <polygon points="30,18 32,15 25,5 20,8" class="face right" fill="rgba(147, 51, 234, 0.3)" stroke="rgba(147, 51, 234, 0.8)" stroke-width="0.5"/>
            <!-- 顶面 -->
            <polygon points="15,5 20,8 25,5" class="face top" fill="rgba(255, 165, 0, 0.4)" stroke="rgba(255, 165, 0, 0.9)" stroke-width="0.5"/>
            <!-- 底面 -->
            <polygon points="8,15 10,18 20,32 12,28" class="face bottom-left" fill="rgba(239, 68, 68, 0.3)" stroke="rgba(239, 68, 68, 0.8)" stroke-width="0.5"/>
            <polygon points="32,15 30,18 20,32 28,28" class="face bottom-right" fill="rgba(245, 101, 101, 0.3)" stroke="rgba(245, 101, 101, 0.8)" stroke-width="0.5"/>
          </g>
          
          
          <!-- 光效 -->
          <circle cx="20" cy="20" r="15" class="glow-ring" fill="none" stroke="rgba(59, 130, 246, 0.2)" stroke-width="0.5" opacity="0.6"/>
        </svg>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, reactive } from 'vue'
import { Globe, Building2, Zap } from 'lucide-vue-next'
// 导入更多 Lucide 图标
import { 
  Target, TrendingUp, Users, Lightbulb, Rocket, Star, 
  BarChart3, Zap as ZapIcon, Settings, Globe as GlobeIcon,
  Brain, Award, MapPin, Briefcase, Gem, Palette,
  CheckCircle, Play, RotateCcw, TrendingUp as Growth,
  Map, Crown, ArrowRight, Sparkles, Heart, Shield,
  X, CircleSlash, Calendar, Clock, DollarSign, BookOpen,
  Car, Home, GraduationCap, Dumbbell, Coffee, Camera,
  Music, Gamepad2, Plane, ShoppingBag, Utensils, Laptop
} from 'lucide-vue-next'

// 基础响应式状态 - 必须在最前面定义
const selectedLevel = ref('vision')

// 内容容器引用
const contentContainer = ref(null)

// 保留引用以避免其他地方的错误
const visibleItems = ref([])
const animationState = reactive({
  currentIndex: 0,
  isAnimating: false,
  timer: null
})

// 六边形圆圈系统 - 初始化占位
let circleSegments = ref([])

const circleState = reactive({
  isExpanded: false,
  activeSegment: null
})

// 计算三角形区域样式
const getSegmentStyle = (segment, index) => {
  // 计算更亮的颜色
  const brighterColor = segment.color.replace(/[\d.]+\)$/, '1)')
  
  return {
    '--segment-color': segment.color,
    '--segment-color-bright': brighterColor,
    opacity: segment.isOpen ? 1 : 0.9,
    zIndex: segment.isOpen ? 3 : 2
  }
}

// 切换区域状态
const toggleSegment = (index) => {
  const segment = circleSegments.value[index]
  segment.isOpen = !segment.isOpen
  
  if (segment.isOpen) {
    circleState.activeSegment = segment.id
    circleState.isExpanded = true
  } else if (circleState.activeSegment === segment.id) {
    circleState.activeSegment = null
    circleState.isExpanded = false
  }
}

// 切换所有区域
const toggleAllSegments = () => {
  const allOpen = circleSegments.value.every(s => s.isOpen)
  circleSegments.value.forEach(segment => {
    segment.isOpen = !allOpen
  })
  
  if (!allOpen) {
    circleState.isExpanded = true
    circleState.activeSegment = 'all'
  } else {
    circleState.isExpanded = false
    circleState.activeSegment = null
  }
}

// 收起圆圈
const collapseCircle = () => {
  circleState.isExpanded = false
  circleState.activeSegment = null
  circleSegments.value.forEach(segment => {
    segment.isOpen = false
  })
}

// 计算活跃区域数量
const activeSegmentsCount = computed(() => {
  return circleSegments.value.filter(s => s.isOpen).length
})

// 获取活跃区域标题
const getActiveSegmentTitle = () => {
  if (circleState.activeSegment === 'all') {
    return '全部计划内容'
  }
  const segment = circleSegments.value.find(s => s.id === circleState.activeSegment)
  return segment ? segment.title + '详细信息' : '计划详情'
}

// 获取活跃区域
const getActiveSegment = () => {
  return circleSegments.value.find(s => s.id === circleState.activeSegment)
}

// 获取活跃区域数据
const getActiveSegmentData = () => {
  const segment = getActiveSegment()
  if (!segment) return []
  
  switch (segment.id) {
    case 'vision':
      return enhancedVisionData.value
    case 'plan':
      return enhancedPlanData.value
    case 'action':
      return enhancedActionData.value
    case 'skill':
      return skillData.value
    case 'health':
      return healthData.value
    case 'relationship':
      return relationshipData.value
    case 'all':
      return [...enhancedVisionData.value.slice(0, 2), ...enhancedPlanData.value.slice(0, 2), ...enhancedActionData.value.slice(0, 2)]
    default:
      return [
        { value: '待完善', label: segment.title + '数据', icon: Settings, status: 'pending' },
        { value: '开发中', label: '功能规划', icon: Rocket, status: 'in-progress' }
      ]
  }
}

// 获取活跃区域图标
const getActiveSegmentIcon = () => {
  const segment = getActiveSegment()
  return segment ? segment.icon : Settings
}

// 获取活跃区域描述
const getActiveSegmentDescription = () => {
  const segment = getActiveSegment()
  if (!segment) return ''
  return segment.description || '这里是详细描述信息'
}

// 获取活跃区域数量
const getActiveSegmentCount = () => {
  return getActiveSegmentData().length
}

// 获取完成率
const getCompletionRate = () => {
  const data = getActiveSegmentData()
  if (!data.length) return 0
  const completed = data.filter(item => item.completed || item.status === 'completed').length
  return Math.round((completed / data.length) * 100)
}

// 获取重要项目数量
const getPriorityCount = () => {
  const data = getActiveSegmentData()
  return data.filter(item => item.priority).length
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待开始',
    'paused': '暂停中',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取默认图标
const getDefaultIcon = (item) => {
  if (item.type === 'vision') return Target
  if (item.type === 'plan') return Calendar
  if (item.type === 'action') return Play
  return CheckCircle
}

// 获取分类标签
const getCategoryTags = () => {
  const segment = getActiveSegment()
  if (!segment) return []
  
  const tagMap = {
    vision: [
      { name: '创业目标', icon: Target, color: '#3B82F6' },
      { name: '个人发展', icon: TrendingUp, color: '#8B5CF6' },
      { name: '生活品质', icon: Crown, color: '#F59E0B' }
    ],
    plan: [
      { name: '产品开发', icon: Rocket, color: '#10B981' },
      { name: '商业计划', icon: Briefcase, color: '#F59E0B' },
      { name: '资源整合', icon: Users, color: '#6366F1' }
    ],
    action: [
      { name: '技术学习', icon: Laptop, color: '#EF4444' },
      { name: '用户调研', icon: Users, color: '#10B981' },
      { name: '产品迭代', icon: RotateCcw, color: '#8B5CF6' }
    ],
    skill: [
      { name: '技术能力', icon: TrendingUp, color: '#10B981' },
      { name: '产品设计', icon: Palette, color: '#3B82F6' },
      { name: '商务沟通', icon: Users, color: '#F59E0B' }
    ],
    health: [
      { name: '运动习惯', icon: Dumbbell, color: '#EF4444' },
      { name: '作息规律', icon: Clock, color: '#10B981' },
      { name: '健康管理', icon: Heart, color: '#F59E0B' }
    ],
    relationship: [
      { name: '家庭时间', icon: Home, color: '#8B5CF6' },
      { name: '朋友圈子', icon: Users, color: '#3B82F6' },
      { name: '人脉网络', icon: Globe, color: '#EF4444' }
    ]
  }
  
  return tagMap[segment.id] || []
}

// 启动动画循环 - 现在只是占位函数
const startAnimation = () => {
  console.log('简洁布局已激活')
}

// 停止动画循环 - 现在只是占位函数
const stopAnimation = () => {
  console.log('简洁布局已停用')
}
const hoveredElement = ref(null)
const interactionEnabled = ref(true)
const screenSize = ref('app')
const layoutMode = ref('normal') // 默认为正常布局模式：normal / centered
const focusedLayer = ref('vision') // 当前聚焦的层级：vision / plan / action

// 性能优化配置
const animationConfig = ref({
  reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  enableGPUAcceleration: true,
  maxAnimations: 12
})

// APP样式配置
const appConfig = {
  fixedLayout: true,
  optimizedForApp: true
}

// 宇宙状态管理
const cosmicState = ref({
  isInitialized: false,
  animationsEnabled: true,
  currentFocus: null
})

// 数据管理工具函数
const createDataWithIds = (data) => {
  return data.map((item, index) => ({
    ...item,
    id: `${item.value}_${index}`,
    category: 'default'
  }))
}

// 第一层数据 - 人生愿景 (大卡片，只保疙4个核心内容)
const visionData = computed(() => createDataWithIds([
  { value: '创业', label: '成功创业者', desc: '打造属于自己的事业王国' },
  { value: '清华', label: '儿子清华梦', desc: '给孩子最好的教育机会' },
  { value: '自驾', label: '游遍中国', desc: '体验祖国大好河山' },
  { value: '自由', label: '财富自由', desc: '获得经济独立和时间自由' }
]))

// 增强版愿景数据 - 用于展开面板
const enhancedVisionData = computed(() => createDataWithIds([
  { 
    value: '创业成功', 
    label: '建立自己的事业', 
    desc: '通过创新和努力，建立一个有影响力的企业，实现商业价值和社会价值的统一',
    icon: Rocket,
    progress: 25,
    status: 'in-progress',
    priority: true,
    type: 'vision'
  },
  { 
    value: '教育投资', 
    label: '孩子进入清华', 
    desc: '为孩子提供最优质的教育资源，培养其学术能力和综合素质',
    icon: GraduationCap,
    progress: 60,
    status: 'in-progress',
    priority: true,
    type: 'vision'
  },
  { 
    value: '旅行梦想', 
    label: '自驾游遍中国', 
    desc: '与家人一起走遍祖国的大好河山，感受不同地域的文化和风景',
    icon: Car,
    progress: 15,
    status: 'pending',
    priority: false,
    type: 'vision'
  },
  { 
    value: '财富自由', 
    label: '实现经济独立', 
    desc: '通过投资理财和事业发展，获得足够的被动收入，实现时间和财务自由',
    icon: DollarSign,
    progress: 35,
    status: 'in-progress',
    priority: true,
    type: 'vision'
  },
  { 
    value: '健康长寿', 
    label: '保持身心健康', 
    desc: '注重身体锻炼和心理健康，追求高质量的生活方式',
    icon: Heart,
    progress: 70,
    status: 'in-progress',
    priority: true,
    type: 'vision'
  },
  { 
    value: '社会贡献', 
    label: '回馈社会价值', 
    desc: '在实现个人目标的同时，为社会创造价值，帮助更多的人',
    icon: Users,
    progress: 20,
    status: 'pending',
    priority: false,
    type: 'vision'
  }
]))

// 第二层数据 - 执行计划 (中等卡片，6个内容)
const planData = computed(() => createDataWithIds([
  { value: '领域', label: '选择创业领域' },
  { value: '教育', label: '制定教育方案' },
  { value: '路线', label: '设计旅游路线' },
  { value: '资金', label: '资金筹备计划' },
  { value: '团队', label: '组建核心团队' },
  { value: '时间', label: '时间管理规划' }
]))

// 增强版计划数据
const enhancedPlanData = computed(() => createDataWithIds([
  { 
    value: '市场调研', 
    label: '选择创业领域', 
    desc: '深入分析市场机会，确定最适合的创业方向和商业模式',
    icon: BarChart3,
    progress: 80,
    status: 'in-progress',
    priority: true,
    type: 'plan'
  },
  { 
    value: '教育规划', 
    label: '制定学习方案', 
    desc: '为孩子制定完整的教育路径，包括学科规划和素质培养',
    icon: BookOpen,
    progress: 65,
    status: 'in-progress',
    priority: true,
    type: 'plan'
  },
  { 
    value: '旅行计划', 
    label: '设计自驾路线', 
    desc: '规划详细的全国自驾游路线，包括时间安排和预算控制',
    icon: Map,
    progress: 30,
    status: 'pending',
    priority: false,
    type: 'plan'
  },
  { 
    value: '资金管理', 
    label: '财务规划方案', 
    desc: '制定投资理财策略，合理配置资产，实现财富增值',
    icon: DollarSign,
    progress: 45,
    status: 'in-progress',
    priority: true,
    type: 'plan'
  },
  { 
    value: '团队建设', 
    label: '核心团队组建', 
    desc: '寻找和培养关键人才，建立高效的工作团队',
    icon: Users,
    progress: 25,
    status: 'pending',
    priority: true,
    type: 'plan'
  },
  { 
    value: '时间规划', 
    label: '效率提升系统', 
    desc: '建立科学的时间管理体系，平衡工作与生活',
    icon: Clock,
    progress: 55,
    status: 'in-progress',
    priority: true,
    type: 'plan'
  },
  { 
    value: '技能提升', 
    label: '能力发展计划', 
    desc: '持续学习新技能，提升专业能力和领导力',
    icon: TrendingUp,
    progress: 40,
    status: 'in-progress',
    priority: false,
    type: 'plan'
  },
  { 
    value: '风险管控', 
    label: '风险防范体系', 
    desc: '建立完善的风险识别和应对机制，确保目标实现',
    icon: Shield,
    progress: 20,
    status: 'pending',
    priority: false,
    type: 'plan'
  }
]))

// 第三层数据 - 行动步骤 (小卡片)
const actionData = computed(() => createDataWithIds([
  { value: '调研', label: '市场调研' },
  { value: '补习', label: '报名补习班' },
  { value: '房车', label: '购买装备' },
  { value: '存钱', label: '开始储蓄' },
  { value: '网络', label: '建立人脉网络' },
  { value: '学习', label: '持续学习提升' },
  { value: '计划', label: '制定每日计划' },
  { value: '检查', label: '定期进度检查' },
  { value: '体检', label: '定期健康体检' },
  { value: '运动', label: '每日运动打卡' },
  { value: '阅读', label: '专业书籍阅读' },
  { value: '复习', label: '知识点复习' }
]))

// 增强版行动数据
const enhancedActionData = computed(() => createDataWithIds([
  { 
    value: '行业分析', 
    label: '深度市场调研', 
    desc: '每周花5小时研究目标行业的发展趋势和竞争格局',
    icon: BarChart3,
    progress: 75,
    status: 'in-progress',
    completed: false,
    priority: true,
    type: 'action'
  },
  { 
    value: '学科辅导', 
    label: '报名优质补习班', 
    desc: '为孩子选择最适合的数学和英语辅导课程',
    icon: GraduationCap,
    progress: 100,
    status: 'completed',
    completed: true,
    priority: true,
    type: 'action'
  },
  { 
    value: '装备采购', 
    label: '购买旅行装备', 
    desc: '购买房车或改装车辆，准备长途旅行必需品',
    icon: Car,
    progress: 20,
    status: 'pending',
    completed: false,
    priority: false,
    type: 'action'
  },
  { 
    value: '储蓄计划', 
    label: '建立应急基金', 
    desc: '每月固定储蓄，建立6个月生活费的应急资金',
    icon: DollarSign,
    progress: 60,
    status: 'in-progress',
    completed: false,
    priority: true,
    type: 'action'
  },
  { 
    value: '社交拓展', 
    label: '扩展人脉网络', 
    desc: '每月参加2-3次行业活动，主动结识同行和潜在合作伙伴',
    icon: Users,
    progress: 40,
    status: 'in-progress',
    completed: false,
    priority: true,
    type: 'action'
  },
  { 
    value: '技能学习', 
    label: '持续能力提升', 
    desc: '每天学习1小时新技能，每月完成一门在线课程',
    icon: BookOpen,
    progress: 85,
    status: 'in-progress',
    completed: false,
    priority: true,
    type: 'action'
  },
  { 
    value: '日程管理', 
    label: '制定每日计划', 
    desc: '使用时间管理工具，规划每日重要任务和优先级',
    icon: Calendar,
    progress: 90,
    status: 'in-progress',
    completed: false,
    priority: true,
    type: 'action'
  },
  { 
    value: '进度跟踪', 
    label: '定期目标检视', 
    desc: '每周回顾目标进展，每月调整计划和策略',
    icon: CheckCircle,
    progress: 70,
    status: 'in-progress',
    completed: false,
    priority: true,
    type: 'action'
  },
  { 
    value: '健康检查', 
    label: '定期体检监测', 
    desc: '每年进行全面体检，每季度检查关键健康指标',
    icon: Heart,
    progress: 100,
    status: 'completed',
    completed: true,
    priority: true,
    type: 'action'
  },
  { 
    value: '运动习惯', 
    label: '每日运动打卡', 
    desc: '每天至少运动30分钟，保持良好的身体状态',
    icon: Dumbbell,
    progress: 80,
    status: 'in-progress',
    completed: false,
    priority: true,
    type: 'action'
  },
  { 
    value: '知识积累', 
    label: '专业书籍阅读', 
    desc: '每月阅读2-3本专业相关书籍，做好读书笔记',
    icon: BookOpen,
    progress: 65,
    status: 'in-progress',
    completed: false,
    priority: false,
    type: 'action'
  },
  { 
    value: '复习巩固', 
    label: '定期知识复习', 
    desc: '每周复习重要知识点，建立个人知识管理系统',
    icon: RotateCcw,
    progress: 50,
    status: 'in-progress',
    completed: false,
    priority: false,
    type: 'action'
  }
]))

// 技能数据
const skillData = computed(() => createDataWithIds([
  { 
    value: '编程技能', 
    label: 'Python & AI', 
    desc: '学习Python编程和人工智能相关技术',
    icon: Laptop,
    progress: 70,
    status: 'in-progress',
    priority: true,
    type: 'skill'
  },
  { 
    value: '投资理财', 
    label: '金融知识', 
    desc: '学习股票、基金、房地产等投资知识',
    icon: DollarSign,
    progress: 55,
    status: 'in-progress',
    priority: true,
    type: 'skill'
  },
  { 
    value: '领导管理', 
    label: '团队管理', 
    desc: '提升团队领导和项目管理能力',
    icon: Users,
    progress: 40,
    status: 'pending',
    priority: true,
    type: 'skill'
  },
  { 
    value: '外语能力', 
    label: '英语提升', 
    desc: '提高英语口语和商务英语水平',
    icon: Globe,
    progress: 60,
    status: 'in-progress',
    priority: false,
    type: 'skill'
  },
  { 
    value: '营销推广', 
    label: '数字营销', 
    desc: '学习现代营销策略和数字化推广方法',
    icon: TrendingUp,
    progress: 35,
    status: 'pending',
    priority: false,
    type: 'skill'
  },
  { 
    value: '创新思维', 
    label: '设计思维', 
    desc: '培养创新思维和问题解决能力',
    icon: Lightbulb,
    progress: 45,
    status: 'pending',
    priority: false,
    type: 'skill'
  }
]))

// 健康数据
const healthData = computed(() => createDataWithIds([
  { 
    value: '体重管理', 
    label: '保持理想体重', 
    desc: '通过合理饮食和运动维持健康体重',
    icon: Dumbbell,
    progress: 75,
    status: 'in-progress',
    priority: true,
    type: 'health'
  },
  { 
    value: '心血管健康', 
    label: '心脏功能', 
    desc: '定期检查心血管健康，保持良好的心脏功能',
    icon: Heart,
    progress: 85,
    status: 'in-progress',
    priority: true,
    type: 'health'
  },
  { 
    value: '睡眠质量', 
    label: '充足睡眠', 
    desc: '保证每天7-8小时高质量睡眠',
    icon: Clock,
    progress: 60,
    status: 'in-progress',
    priority: true,
    type: 'health'
  },
  { 
    value: '营养均衡', 
    label: '健康饮食', 
    desc: '保持营养均衡的饮食习惯',
    icon: Utensils,
    progress: 70,
    status: 'in-progress',
    priority: true,
    type: 'health'
  },
  { 
    value: '心理健康', 
    label: '情绪管理', 
    desc: '学习压力管理和情绪调节技巧',
    icon: Brain,
    progress: 50,
    status: 'pending',
    priority: false,
    type: 'health'
  },
  { 
    value: '定期体检', 
    label: '健康监测', 
    desc: '按时进行各项健康检查',
    icon: CheckCircle,
    progress: 100,
    status: 'completed',
    priority: true,
    type: 'health'
  }
]))

// 关系数据
const relationshipData = computed(() => createDataWithIds([
  { 
    value: '家庭关系', 
    label: '家庭和谐', 
    desc: '夫妻关系·亲子互动',
    icon: Home,
    progress: 85,
    status: 'in-progress',
    priority: true,
    type: 'relationship'
  },
  { 
    value: '朋友圈子', 
    label: '友谊维护', 
    desc: '老友联系·新友结识',
    icon: Users,
    progress: 70,
    status: 'in-progress',
    priority: true,
    type: 'relationship'
  },
  { 
    value: '职业网络', 
    label: '商业人脉', 
    desc: '商业关系·价值网络',
    icon: Briefcase,
    progress: 45,
    status: 'pending',
    priority: true,
    type: 'relationship'
  },
  { 
    value: '社区参与', 
    label: '社会关系', 
    desc: '社区活动·社会责任',
    icon: Globe,
    progress: 30,
    status: 'pending',
    priority: false,
    type: 'relationship'
  }
]))

// 层级切换处理函数
const handleLayerSwitch = () => {
  if (!interactionEnabled.value) return
  
  // 循环切换聚焦层级，但最后一次切换返回正常模式
  const layers = ['vision', 'plan', 'action']
  const currentIndex = layers.indexOf(focusedLayer.value)
  const nextIndex = (currentIndex + 1) % layers.length
  
  if (currentIndex === layers.length - 1) {
    // 如果是最后一个层级，返回正常模式
    layoutMode.value = 'normal'
    focusedLayer.value = 'vision' // 重置为第一层
    console.log(`🔄 返回正常布局模式`)
  } else {
    focusedLayer.value = layers[nextIndex]
    console.log(`🎯 切换到 ${focusedLayer.value} 层级`)
  }
}

// 多面体图标点击处理函数 - 在两种布局模式间来回切换
const handlePolyhedronClick = (event) => {
  // 阻止事件冒泡和默认行为
  event?.preventDefault?.()
  event?.stopPropagation?.()
  
  if (!interactionEnabled.value) return
  
  if (layoutMode.value === 'normal') {
    // 从正常布局切换到围绕式布局
    layoutMode.value = 'centered'
    console.log(`🔄 切换到围绕式布局模式`)
  } else {
    // 从围绕式布局切换回正常布局
    layoutMode.value = 'normal'
    focusedLayer.value = 'vision' // 重置聚焦层级
    console.log(`🔄 切换到正常布局模式`)
  }
}

// 交互处理函数
const handleElementClick = (element, layer, event) => {
  // 阻止事件冒泡
  event?.preventDefault?.()
  event?.stopPropagation?.()
  
  if (!interactionEnabled.value) return
  
  const layerNames = {
    vision: '人生愿景',
    plan: '执行计划', 
    action: '行动步骤'
  }
  
  // 在围绕模式下，点击卡片只切换聚焦层级
  if (layoutMode.value === 'centered') {
    // 切换聚焦层级
    focusedLayer.value = layer
    console.log(`🎯 点击卡片，聚焦到 ${layerNames[layer]} 层级`)
  } else {
    console.log(`🎆 正常模式 - ${layerNames[layer]}: ${element.label} - ${element.value}`)
  }
  
  selectedLevel.value = layer
}

// 新增：圆环层级点击处理
const handleLayerClick = (layer, event) => {
  event?.preventDefault?.()
  event?.stopPropagation?.()
  
  if (!interactionEnabled.value) return
  
  focusedLayer.value = layer
  selectedLevel.value = layer
  
  const layerNames = {
    vision: '人生愿景',
    plan: '执行计划', 
    action: '行动步骤'
  }
  
  console.log(`🎯 点击圆环，聚焦到 ${layerNames[layer]} 层级`)
}

// 计算螺旋路径
const spiralPaths = computed(() => {
  const centerX = 250
  const centerY = 250
  
  // 生成螺旋路径的函数
  const generateSpiralPath = (startRadius, endRadius, turns, startAngle = 0, endAngle = 720) => {
    let path = ''
    const steps = 150 // 路径精度
    const angleRange = endAngle - startAngle
    const radiusRange = endRadius - startRadius
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps
      const angle = (startAngle + angleRange * progress) * Math.PI / 180
      const radius = startRadius + radiusRange * progress
      
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      if (i === 0) {
        path += `M ${x} ${y}`
      } else {
        path += ` L ${x} ${y}`
      }
    }
    
    return path
  }
  
  return {
    // 内层螺旋：文字间距大，需要更多空间
    inner: generateSpiralPath(30, 70, 2.4, 45, 909), // 起始角度45度，转2.4圈
    
    // 中层螺旋：中等内容，适中长度
    middle: generateSpiralPath(65, 105, 2.8, 0, 1008), // 起始角度0度，转2.8圈  
    
    // 外层螺旋：最多内容，最长路径
    outer: generateSpiralPath(100, 140, 3.2, -45, 1152) // 起始角度-45度，转3.2圈
  }
})

// 原有的半径计算（保留用于其他功能）
const innerRadius = computed(() => 40)
const middleRadius = computed(() => 70) 
const outerRadius = computed(() => 100)


const handleElementHover = (element, isHovering) => {
  hoveredElement.value = isHovering ? element : null
  
  if (isHovering) {
    // 悬停时显示提示信息
    const tips = {
      '创业': '🚀 打造属于自己的事业王国',
      '清华': '🎓 给孩子最好的教育机会',
      '自驾': '🚗 体验祖国大好河山',
      '自由': '💰 获得经济独立和时间自由',
      '健康': '💪 保持全家人身体健康',
      '影响': '⭐ 在行业中建立威望和影响力',
      '领域': '🎯 选择有前景的赛道',
      '教育': '📚 科学规划学习路径',
      '路线': '🗺️ 设计完美的旅行计划',
      '资金': '💹 合理分配财务资源',
      '团队': '👥 寻找合适的合伙人',
      '时间': '⏰ 平衡工作与生活',
      '风险': '🛡️ 建立完善的风险防控体系',
      '调研': '🔍 深入了解市场需求',
      '补习': '📝 提高学习成绩',
      '房车': '🏠 准备旅行装备',
      '存钱': '💵 建立稳定的资金池',
      '网络': '🌐 扩展社交和业务圈子',
      '学习': '📖 保持知识和技能更新',
      '计划': '📅 合理安排日常任务',
      '检查': '✅ 跟踪目标完成情况'
    }
    
    const tip = tips[element.value]
    if (tip) {
      console.log(tip)
    }
  }
}

// 监听器 - 在所有依赖项定义后
watch(selectedLevel, (newRing, oldRing) => {
  if (oldRing) {
    console.log(`从 ${oldRing} 切换到 ${newRing} 环`)
  }
})

watch(hoveredElement, (newElement) => {
  cosmicState.value.currentFocus = newElement
})

// 简化的布局检测 - 性能优化版本
const checkOverlap = () => {
  if (!cosmicState.value.isInitialized) return true
  
  // 只在围绕模式下进行简单检查
  if (layoutMode.value === 'centered') {
    console.log(`✅ 围绕式布局检测通过`)
  } else {
    console.log(`✅ 正常布局检测通过`)
  }
  
  return true
}

// 双层卡片布局算法 - 简化版本
const getCardPosition = computed(() => {
  return {
    // 内层卡片均匀分布
    getInnerPosition: (index, total) => {
      return {
        angle: (360 / total * index),
        radius: 200 // 固定内层半径
      }
    },
    
    // 外层卡片均匀分布
    getOuterPosition: (index, total) => {
      return {
        angle: (360 / total * index),
        radius: 300 // 固定外层半径
      }
    }
  }
})

// APP样式兼容处理
const handleResize = () => {
  // APP固定布局，无需响应式调整
  if (appConfig.fixedLayout) {
    console.log('APP界面初始化完成')
  }
}

// 性能监控 - 优化版本
const performanceMonitor = {
  animationFrame: null,
  startTime: 0,
  
  start() {
    this.startTime = performance.now()
  },
  
  measure(label) {
    const duration = performance.now() - this.startTime
    if (duration > 16) { // 超过一帧的时间
      console.warn(`${label} 耗时: ${duration.toFixed(2)}ms`)
    }
    this.startTime = performance.now() // 重置计时器
  }
}

// 生命周期
onMounted(() => {
  performanceMonitor.start()
  
  // APP初始化
  handleResize()
  
  // 初始化系统状态
  cosmicState.value.isInitialized = true
  selectedLevel.value = 'vision'
  
  // 初始化六边形圆圈系统
  circleSegments.value = [
    {
      id: 'vision',
      title: '愿景',
      icon: Globe,
      type: 'vision',
      isOpen: false,
      count: visionData.value.length,
      angle: 0,
      color: 'rgba(59, 130, 246, 0.8)',
      description: '设定长期目标，明确人生方向与价值追求'
    },
    {
      id: 'skill',
      title: '技能',
      icon: ZapIcon,
      type: 'skill', 
      isOpen: false,
      count: '8',
      angle: 60,
      color: 'rgba(16, 185, 129, 0.8)',
      description: '持续学习新技能，提升专业能力与竞争力'
    },
    {
      id: 'plan',
      title: '计划',
      icon: Building2,
      type: 'plan',
      isOpen: false,
      count: planData.value.length,
      angle: 120,
      color: 'rgba(245, 158, 11, 0.8)',
      description: '制定详细方案，分步骤实现各项目标'
    },
    {
      id: 'health',
      title: '健康',
      icon: Heart,
      type: 'health',
      isOpen: false,
      count: '6',
      angle: 180,
      color: 'rgba(239, 68, 68, 0.8)',
      description: '保持身体健康，维护心理平衡与生活品质'
    },
    {
      id: 'action',
      title: '行动',
      icon: Zap,
      type: 'action',
      isOpen: false,
      count: actionData.value.length,
      angle: 240,
      color: 'rgba(147, 51, 234, 0.8)',
      description: '每日执行任务，将计划转化为实际行动'
    },
    {
      id: 'relationship',
      title: '关系',
      icon: Users,
      type: 'relationship',
      isOpen: false,
      count: '4',
      angle: 300,
      color: 'rgba(255, 165, 0, 0.8)',
      description: '人际关系·社交网络'
    }
  ]
  
  performanceMonitor.measure('基础初始化')
  
  // 仅在centered模式下启动内容动画循环
  if (layoutMode.value === 'centered') {
    startAnimation()
  }
  
  // 动画初始化
  if (!animationConfig.value.reduceMotion) {
    // 立即启用交互，不等待动画
    cosmicState.value.animationsEnabled = true
    interactionEnabled.value = true
    
    performanceMonitor.measure('动画初始化')
    
    // 延迟检测重叠，避免阻塞交互
    setTimeout(() => {
      checkOverlap()
    }, 100) // 减少延迟时间
  } else {
    interactionEnabled.value = true
    // 无动画模式下也减少检测延迟
    setTimeout(() => checkOverlap(), 50)
  }
})

onUnmounted(() => {
  // 停止内容动画循环
  stopAnimation()
  
  // 停止自动光圈模式
  stopAutoAperture()
  
  // 清理动画帧
  if (performanceMonitor.animationFrame) {
    cancelAnimationFrame(performanceMonitor.animationFrame)
  }
  
  // 重置状态
  cosmicState.value = {
    isInitialized: false,
    animationsEnabled: false,
    currentFocus: null
  }
  
  interactionEnabled.value = false
  hoveredElement.value = null
})

// 监听布局模式变化，控制动画
watch(layoutMode, (newMode) => {
  if (newMode === 'centered') {
    startAnimation()
  } else {
    stopAnimation()
  }
})
</script>

<style lang="scss" scoped>
.triple-ring-system {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: visible;
  will-change: transform;
  transform: translateZ(0);
  
  // APP优化
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  
  // 背景装饰层
  .cosmic-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    .cosmic-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridFlow 20s linear infinite;
      will-change: transform;
      
      // APP性能优化
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    
    .floating-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        radial-gradient(1px 1px at 25px 35px, rgba(255, 255, 255, 0.06), transparent),
        radial-gradient(1px 1px at 45px 75px, rgba(16, 185, 129, 0.06), transparent),
        radial-gradient(1px 1px at 95px 45px, rgba(59, 130, 246, 0.06), transparent);
      background-repeat: repeat;
      background-size: 200px 150px;
      animation: particleFloat 20s ease-in-out infinite;
    }
  }
  
  // 三层图层系统主容器
  .three-layer-container {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
    
    // APP触摸优化
    touch-action: manipulation;
    -webkit-touch-callout: none;
    
    // 中心模式下确保居中显示
    &.centered-mode {
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: visible;
    }
  }
  
  // 第一层：核心愿景层 (左上区域 40%宽 50%高)
  .layer-one {
    position: absolute;
    top: 1rem;
    left: 1rem;
    width: calc(50vw - 1rem);
    height: calc(50vh - 1rem);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform: translateZ(0);
    
    
    .layer-header {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 2;
      
      .layer-icon {
        width: 1.8rem;
        height: 1.8rem;
        color: rgba(255, 165, 0, 0.9);
        filter: drop-shadow(0 0 8px rgba(255, 165, 0, 0.4));
      }
      
      .layer-title {
        font-size: 1rem;
        font-weight: 700;
        color: rgba(255, 165, 0, 0.95);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        margin: 0;
      }
    }
    
    .cards-container {
      position: absolute;
      top: 3rem;
      left: 0.3rem;
      right: 0.3rem;
      bottom: 0.3rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 0.5rem;
      padding: 0.3rem;
      
      .vision-card {
        background: rgba(255, 165, 0, 0.1);
        border: 1px solid rgba(255, 165, 0, 0.3);
        border-radius: 0.8rem;
        padding: 0.5rem;
        backdrop-filter: blur(8px);
        cursor: pointer;
        transition: all 0.3s ease;
        animation: cardSlideIn 0.8s ease-out;
        animation-delay: var(--appear-delay);
        animation-fill-mode: both;
        
        &:hover {
          background: rgba(255, 165, 0, 0.2);
          border-color: rgba(255, 165, 0, 0.6);
          transform: scale(1.05) translateZ(0);
          box-shadow: 0 8px 25px rgba(255, 165, 0, 0.25);
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          height: 100%;
          
          .data-core {
            font-size: 1rem;
            font-weight: 700;
            color: rgba(255, 165, 0, 0.95);
            margin-bottom: 0.3rem;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }
          
          .data-label {
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.3;
            font-weight: 500;
            margin-bottom: 0.2rem;
          }
          
          .data-desc {
            font-size: 0.5rem;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
        
        &.hovered {
          transform: scale(1.08) translateZ(0);
          box-shadow: 0 10px 30px rgba(255, 165, 0, 0.35);
        }
      }
    }
  }
  
  // 第二层：执行计划层 (右侧区域 50%宽 50%高)
  .layer-two {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: calc(50vw - 1rem);
    height: calc(50vh - 1rem);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform: translateZ(0);
    
    
    .layer-header {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 2;
      
      .layer-icon {
        width: 1.6rem;
        height: 1.6rem;
        color: rgba(147, 51, 234, 0.9);
        filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
      }
      
      .layer-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: rgba(147, 51, 234, 0.95);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        margin: 0;
      }
    }
    
    .cards-container {
      position: absolute;
      top: 3rem;
      left: 0.3rem;
      right: 0.3rem;
      bottom: 0.3rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0.5rem;
      padding: 0.2rem;
      
      .plan-card {
        background: rgba(147, 51, 234, 0.1);
        border: 1px solid rgba(147, 51, 234, 0.3);
        border-radius: 0.5rem;
        padding: 0.3rem;
        backdrop-filter: blur(6px);
        cursor: pointer;
        transition: all 0.3s ease;
        animation: cardSlideIn 0.6s ease-out;
        animation-delay: var(--appear-delay);
        animation-fill-mode: both;
        
        &:hover {
          background: rgba(147, 51, 234, 0.2);
          border-color: rgba(147, 51, 234, 0.6);
          transform: scale(1.08) translateZ(0);
          box-shadow: 0 6px 20px rgba(147, 51, 234, 0.25);
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          height: 100%;
          
          .data-core {
            font-size: 0.7rem;
            font-weight: 600;
            color: rgba(147, 51, 234, 0.95);
            margin-bottom: 0.15rem;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          }
          
          .data-label {
            font-size: 0.45rem;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.2;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 100%;
          }
        }
        
        &.hovered {
          transform: scale(1.12) translateZ(0);
          box-shadow: 0 8px 25px rgba(147, 51, 234, 0.35);
        }
      }
    }
  }
  
  // 第三层：行动步骤层 (下方区域 100%宽 40%高，底部留出6rem)
  .layer-three {
    position: absolute;
    bottom: 5.5rem;
    left: 1rem;
    right: 1rem;
    width: calc(100vw - 2rem);
    height: 40vh;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform: translateZ(0);
    
    
    .layer-header {
      position: absolute;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 2;
      
      .layer-icon {
        width: 1.4rem;
        height: 1.4rem;
        color: rgba(16, 185, 129, 0.9);
        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
      }
      
      .layer-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: rgba(16, 185, 129, 0.95);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        margin: 0;
      }
    }
    
    .cards-container {
      position: absolute;
      top: 3rem;
      left: 0.5rem;
      right: 0.5rem;
      bottom: 0.5rem;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 0.4rem;
      padding: 0.3rem;
      
      .action-card {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 0.5rem;
        padding: 0.3rem;
        backdrop-filter: blur(4px);
        cursor: pointer;
        transition: all 0.3s ease;
        animation: cardSlideIn 0.5s ease-out;
        animation-delay: var(--appear-delay);
        animation-fill-mode: both;
        
        &:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.6);
          transform: scale(1.1) translateZ(0);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          height: 100%;
          
          .data-core {
            font-size: 0.7rem;
            font-weight: 600;
            color: rgba(16, 185, 129, 0.95);
            margin-bottom: 0.15rem;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          }
          
          .data-label {
            font-size: 0.45rem;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.2;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 100%;
          }
        }
        
        &.hovered {
          transform: scale(1.15) translateZ(0);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        }
      }
    }
  }
  
}

// 动画系统
@keyframes gridFlow {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(50px, 50px, 0);
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  33% {
    transform: translate3d(5px, -10px, 0);
  }
  66% {
    transform: translate3d(-10px, 5px, 0);
  }
}

// 中心呼吸动画
// 已移除呼吸动画

@keyframes iconGlow {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
  }
}

// 已移除环形呼吸动画

// 卡片滑入动画
@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 描述文字淡入动画
@keyframes fadeInDesc {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// 背景连接线效果
.triple-ring-system::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg, rgba(255, 165, 0, 0.03) 0%, transparent 40%),
    linear-gradient(45deg, rgba(147, 51, 234, 0.03) 30%, transparent 70%),
    linear-gradient(225deg, rgba(16, 185, 129, 0.03) 60%, transparent 100%);
  pointer-events: none;
  z-index: 1;
  animation: connectionFlow 15s ease-in-out infinite;
}

@keyframes connectionFlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

// 多面体图标 - 支持两种位置状态
.polyhedron-icon {
  position: absolute;
  // 默认右上角位置
  top: 10px;
  right: 10px;
  width: 60px;
  height: 60px;
  z-index: 50;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  pointer-events: auto;
  
  // 移动端触摸优化
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  touch-action: manipulation;
  user-select: none;
  
  // 围绕模式下居中
  .three-layer-container.centered-mode & {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    z-index: 100;
  }
  
  .polyhedron-container {
    position: relative;
    width: 100%;
    height: 100%;
    animation: polyhedronBreathe 3s ease-in-out infinite;
    transform: translateZ(0);
    transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &.clicked {
      transform: scale(1.1) rotate(180deg) translateZ(0);
      filter: brightness(1.3) saturate(1.2);
    }
    
    // 围绕模式下的特殊样式
    .three-layer-container.centered-mode & {
      filter: brightness(1.4) drop-shadow(0 0 25px rgba(59, 130, 246, 0.8));
      background: radial-gradient(circle at center, 
        rgba(59, 130, 246, 0.1) 0%, 
        rgba(147, 51, 234, 0.05) 50%, 
        transparent 70%
      );
      border-radius: 50%;
      box-shadow: 
        0 0 20px rgba(59, 130, 246, 0.6),
        0 0 40px rgba(147, 51, 234, 0.4),
        inset 0 0 10px rgba(255, 255, 255, 0.1);
    }
    
    .polyhedron-svg {
      width: 100%;
      height: 100%;
      animation: polyhedronRotate 8s linear infinite;
      transform-origin: center;
      
      .polyhedron-faces {
        transform-origin: center;
        
        .face {
          transition: all 0.3s ease;
          animation: faceGlow 4s ease-in-out infinite;
          
          &.front {
            animation-delay: 0s;
          }
          
          &.left {
            animation-delay: 0.5s;
          }
          
          &.right {
            animation-delay: 1s;
          }
          
          &.top {
            animation-delay: 1.5s;
          }
          
          &.bottom-left {
            animation-delay: 2s;
          }
          
          &.bottom-right {
            animation-delay: 2.5s;
          }
        }
      }
      
      
      .glow-ring {
        animation: ringPulse 3s ease-in-out infinite;
      }
    }
  }
  
  &:hover {
    .polyhedron-container {
      animation-play-state: paused;
      transform: scale(1.15) translateZ(0);
      filter: brightness(1.4) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
      
      &.clicked {
        transform: scale(1.25) rotate(180deg) translateZ(0);
      }
      
      // 围绕模式下的hover效果
      .three-layer-container.centered-mode & {
        transform: scale(1.2) translateZ(0);
        filter: brightness(1.5) drop-shadow(0 0 25px rgba(59, 130, 246, 1));
      }
    }
  }
}

// 多面体动画
@keyframes polyhedronBreathe {
  0%, 100% {
    transform: scale(1) rotateX(0deg) rotateY(0deg);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05) rotateX(5deg) rotateY(5deg);
    filter: brightness(1.2);
  }
}

// 光环脉冲动画
@keyframes pulsingRing {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
    filter: brightness(1);
  }
  33% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.02);
    filter: brightness(1.3) hue-rotate(30deg);
  }
  66% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(0.98);
    filter: brightness(1.1) hue-rotate(-15deg);
  }
}

// 旋转渐变动画
@keyframes rotatingGradient {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

// 卡片悬浮动画
@keyframes cardFloat {
  0%, 100% {
    transform: translateY(0px) scale(var(--rotation, 1)) rotate(var(--rotation, 0deg));
  }
  25% {
    transform: translateY(-3px) scale(var(--rotation, 1)) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: translateY(-1px) scale(var(--rotation, 1)) rotate(var(--rotation, 0deg));
  }
  75% {
    transform: translateY(-4px) scale(var(--rotation, 1)) rotate(var(--rotation, 0deg));
  }
}

// 文字悬浮动画
@keyframes textFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  33% {
    transform: translateY(-2px);
  }
  66% {
    transform: translateY(2px);
  }
}

// 文字发光动画
@keyframes textGlow {
  0%, 100% {
    filter: brightness(1) saturate(1);
    text-shadow: 
      0 0 10px currentColor,
      0 0 20px currentColor,
      0 2px 4px rgba(0, 0, 0, 0.3);
  }
  50% {
    filter: brightness(1.3) saturate(1.2);
    text-shadow: 
      0 0 15px currentColor,
      0 0 30px currentColor,
      0 0 45px currentColor,
      0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

// 连接线脉冲动画
@keyframes connectionPulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(0, -50%) rotate(var(--rotation, 0deg)) scaleX(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(0, -50%) rotate(var(--rotation, 0deg)) scaleX(1.1);
    filter: brightness(1.5);
  }
}

// 粒子轨道动画
@keyframes particleOrbit {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateX(var(--middle-radius)) rotate(0deg);
    opacity: 0.8;
  }
  25% {
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) translateX(var(--middle-radius)) rotate(180deg);
    opacity: 0.6;
  }
  75% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) translateX(var(--middle-radius)) rotate(360deg);
    opacity: 0.8;
  }
}

// 聚焦层光晕动画
@keyframes focusedLayerGlow {
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(147, 51, 234, 0.6));
  }
}

// 聚焦卡片脉冲动画
@keyframes focusedCardPulse {
  0%, 100% {
    filter: brightness(1.2) saturate(1.1);
    box-shadow: 
      0 12px 35px rgba(59, 130, 246, 0.5), 
      0 0 20px rgba(147, 51, 234, 0.3);
  }
  50% {
    filter: brightness(1.4) saturate(1.3);
    box-shadow: 
      0 15px 45px rgba(59, 130, 246, 0.7), 
      0 0 30px rgba(147, 51, 234, 0.5),
      inset 0 0 10px rgba(255, 255, 255, 0.1);
  }
}

// 聚焦文字脉冲动画
@keyframes focusedTextPulse {
  0%, 100% {
    transform: scale(var(--focused-scale, 3)) translateY(0px);
    filter: brightness(1.4) saturate(1.3);
  }
  50% {
    transform: scale(calc(var(--focused-scale, 3) * 1.1)) translateY(-2px);
    filter: brightness(1.6) saturate(1.5) hue-rotate(10deg);
  }
}

// 光环脉冲动画
@keyframes ringPulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

@keyframes polyhedronRotate {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

@keyframes faceGlow {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}


@keyframes ringPulse {
  0%, 100% {
    opacity: 0.3;
    stroke-width: 0.5;
  }
  50% {
    opacity: 0.8;
    stroke-width: 1;
  }
}

// 圆环光晕动画
@keyframes ringGlow {
  0%, 100% {
    opacity: 0.2;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
}

// 卡片呼吸动画（保持旋转的同时缩放）
@keyframes cardBreathe {
  0%, 100% {
    transform: scale(1) rotate(var(--rotation, 0deg));
    opacity: 0.85;
    filter: brightness(1);
  }
  50% {
    transform: scale(1.08) rotate(var(--rotation, 0deg));
    opacity: 1;
    filter: brightness(1.15);
  }
}

// 螺旋背景发光动画
@keyframes spiralGlow {
  0%, 100% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  33% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.1) rotate(120deg);
  }
  66% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(0.9) rotate(240deg);
  }
}

// 反向旋转背景动画
@keyframes spiralGlowReverse {
  0% {
    transform: translate(-50%, -50%) rotate(360deg);
    opacity: 0.15;
  }
  100% {
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 0.35;
  }
}

// 螺旋文字漂浮动画
@keyframes spiralTextFloat {
  0%, 100% {
    opacity: 0.85;
    filter: brightness(1) saturate(1);
  }
  25% {
    opacity: 0.95;
    filter: brightness(1.1) saturate(1.1);
  }
  50% {
    opacity: 1;
    filter: brightness(1.2) saturate(1.2);
  }
  75% {
    opacity: 0.9;
    filter: brightness(1.05) saturate(1.05);
  }
}

// 螺旋容器旋转待机动画
@keyframes spiralContainerRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 内层粒子螺旋轨道动画
@keyframes spiralParticleInner {
  0% {
    offset-distance: 0%;
    opacity: 0;
    transform: scale(0.5);
  }
  10%, 90% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
    transform: scale(0.5);
  }
}

// 中层粒子螺旋轨道动画  
@keyframes spiralParticleMiddle {
  0% {
    offset-distance: 0%;
    opacity: 0;
    transform: scale(0.5);
  }
  8%, 92% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
    transform: scale(0.5);
  }
}

// 外层粒子螺旋轨道动画
@keyframes spiralParticleOuter {
  0% {
    offset-distance: 0%;
    opacity: 0;
    transform: scale(0.5);
  }
  6%, 94% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
    transform: scale(0.5);
  }
}

// 文字追踪光效动画
@keyframes textTrackingGlow {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1) rotate(0deg);
  }
  25% {
    opacity: 0.4;
    transform: scale(1.1) rotate(90deg);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9) rotate(180deg);
  }
  75% {
    opacity: 0.3;
    transform: scale(1.05) rotate(270deg);
  }
}

// 标题文字闪烁动画
@keyframes titleSparkle {
  0%, 100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  20%, 80% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
    transform: translateX(100%);
  }
}

// 螺旋整体呼吸动画
// 已移除螺旋呼吸动画

// 已移除聚焦状态呼吸动画

// 波浪流动动画
@keyframes waveFlow {
  0%, 100% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(20px);
  }
}

// 文字上浮消失出现动画 - 波浪形
@keyframes floatUpDisappearWave {
  0% {
    opacity: 0;
    transform: 
      translateX(calc(var(--wave-index) * 10px))
      translateY(calc(sin(var(--wave-index) * 0.5) * 15px + 30px)) 
      scale(0.8);
  }
  25% {
    opacity: 1;
    transform: 
      translateX(calc(var(--wave-index) * 10px))
      translateY(calc(sin(var(--wave-index) * 0.5) * 15px)) 
      scale(1);
  }
  75% {
    opacity: 1;
    transform: 
      translateX(calc(var(--wave-index) * 10px))
      translateY(calc(sin(var(--wave-index) * 0.5) * 15px - 10px)) 
      scale(1.05);
  }
  100% {
    opacity: 0;
    transform: 
      translateX(calc(var(--wave-index) * 10px))
      translateY(calc(sin(var(--wave-index) * 0.5) * 15px - 40px)) 
      scale(0.9);
  }
}

// 文字上浮消失出现动画 - 六边形
@keyframes floatUpDisappearHex {
  0% {
    opacity: 0;
    transform: 
      translate(-50%, -50%)
      rotate(calc(var(--vertex-index) * 60deg))
      translateY(calc(-75px + 30px));
  }
  25% {
    opacity: 1;
    transform: 
      translate(-50%, -50%)
      rotate(calc(var(--vertex-index) * 60deg))
      translateY(-75px);
  }
  75% {
    opacity: 1;
    transform: 
      translate(-50%, -50%)
      rotate(calc(var(--vertex-index) * 60deg))
      translateY(calc(-75px - 10px));
  }
  100% {
    opacity: 0;
    transform: 
      translate(-50%, -50%)
      rotate(calc(var(--vertex-index) * 60deg))
      translateY(calc(-75px - 40px));
  }
}

// 文字上浮消失出现动画 - 螺旋形
@keyframes floatUpDisappearSpiral {
  0% {
    opacity: 0;
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--spiral-progress) * 360deg * 2))
      translateY(calc(-30px - var(--spiral-progress) * 90px + 30px));
  }
  25% {
    opacity: 1;
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--spiral-progress) * 360deg * 2))
      translateY(calc(-30px - var(--spiral-progress) * 90px));
  }
  75% {
    opacity: 1;
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--spiral-progress) * 360deg * 2))
      translateY(calc(-30px - var(--spiral-progress) * 90px - 10px));
  }
  100% {
    opacity: 0;
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--spiral-progress) * 360deg * 2))
      translateY(calc(-30px - var(--spiral-progress) * 90px - 40px));
  }
}

// CSS动画已移除，改用JavaScript控制

// 波浪元素浮动
@keyframes waveFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.1);
  }
}

// 六边形旋转
@keyframes hexagonRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 螺旋旋转
@keyframes spiralRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 色彩波浪旋转动画
@keyframes colorWaveRotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translate(-50%, -50%) rotate(90deg) scale(1.1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) scale(0.9);
    opacity: 0.7;
  }
  75% {
    transform: translate(-50%, -50%) rotate(270deg) scale(1.05);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
    opacity: 0.3;
  }
}

// 极光闪烁动画
@keyframes auroraShimmer {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    filter: hue-rotate(0deg);
  }
  25% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
    filter: hue-rotate(30deg);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(0.95) rotate(-3deg);
    filter: hue-rotate(-20deg);
  }
  75% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.05) rotate(2deg);
    filter: hue-rotate(45deg);
  }
}

// 围绕式布局样式 - 螺旋状文字布局
.three-layer-container.centered-mode {
  overflow: visible;
  
  // 螺旋文字布局容器
  .spiral-text-layout {
    position: relative;
    width: 300px;
    height: 300px;
    pointer-events: none;
    overflow: visible;
    
    // 摄像机光圈容器
    .aperture-container {
      position: relative;
      width: 400px;
      height: 400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      
      // 光圈叶片容器 - 重新设计居中布局
      .aperture-blades {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 400px;
        height: 400px;
        transform: translate(-50%, -50%);
        
        // 单个光圈叶片 - 真正的移动叶片
        .aperture-blade {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 90px;
          height: 140px;
          transform-origin: center center;
          cursor: pointer;
          transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
          
          // 叶片形状：模拟真实相机光圈叶片
          background: linear-gradient(135deg, 
            var(--blade-color-light) 0%,
            var(--blade-color-dark) 60%,
            rgba(0, 0, 0, 0.2) 100%);
          
          // 叶片形状：六边形光圈叶片
          clip-path: polygon(30% 0%, 70% 0%, 100% 25%, 85% 100%, 15% 100%, 0% 25%);
          border-radius: 6px;
          
          // 叶片立体效果
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.5),
            inset 0 3px 8px rgba(255, 255, 255, 0.3),
            inset 0 -3px 8px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(var(--blade-glow), 0.4);
          
          // 叶片内容 - 居中布局优化
          .blade-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
            text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
            font-weight: 500;
            
            .blade-number {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 4px;
              opacity: 0.9;
              letter-spacing: 1px;
            }
            
            .blade-icon {
              margin: 3px 0;
              opacity: 0.9;
              filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
            }
            
            .blade-title {
              font-size: 10px;
              font-weight: 600;
              opacity: 0.95;
              line-height: 1.1;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              letter-spacing: 0.5px;
              margin-top: 4px;
            }
          }
          
          // 悬停效果
          &:hover {
            box-shadow: 
              0 10px 35px rgba(0, 0, 0, 0.7),
              inset 0 4px 10px rgba(255, 255, 255, 0.4),
              inset 0 -4px 10px rgba(0, 0, 0, 0.4),
              0 0 30px rgba(var(--blade-glow), 0.6);
            filter: brightness(1.1);
          }
        }
        
      }
      
      // 中心六边形开口指示器
      .aperture-opening {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, 
          rgba(0, 0, 0, 0.8) 0%,
          rgba(0, 0, 0, 0.9) 100%);
        border: 2px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(15px);
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        
        // 中心内容显示区域
        .aperture-center-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: white;
          opacity: 0.95;
          
          .center-info {
            .aperture-value {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 4px;
              text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
              letter-spacing: 1px;
            }
            
            .aperture-desc {
              font-size: 10px;
              font-weight: 500;
              opacity: 0.8;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }
        }
        
        // 六边形光晕效果
        &::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(45deg, 
            rgba(79, 70, 229, 0.3),
            rgba(16, 185, 129, 0.3),
            rgba(245, 158, 11, 0.3));
          clip-path: inherit;
          filter: blur(4px);
          z-index: -1;
        }
      }
      
      // 光圈值显示
      .aperture-display {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10;
        
        .f-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }
        
        .f-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      }
      
      // 光圈控制环
      .aperture-control-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 240px;
        height: 240px;
        
        .f-stop-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center 120px;
          cursor: pointer;
          
          .marker-dot {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            border: 2px solid rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }
          
          .marker-label {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.8);
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
          }
          
          &.active .marker-dot {
            background: #4f46e5;
            border-color: #4f46e5;
            transform: scale(1.5);
            box-shadow: 0 0 8px rgba(79, 70, 229, 0.6);
          }
          
          &.active .marker-label {
            color: #4f46e5;
            font-weight: bold;
          }
          
          &:hover .marker-dot {
            transform: scale(1.2);
            background: rgba(79, 70, 229, 0.8);
          }
        }
      }
      
      // 自动控制按钮
      .auto-controls {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        
        .auto-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &.active {
            background: #4f46e5;
            color: white;
            border-color: #4f46e5;
          }
          
          &:hover {
            background: rgba(79, 70, 229, 0.8);
            color: white;
            transform: scale(1.05);
          }
        }
      }
      
      // 聚焦状态效果
      &.vision-focused {
        filter: brightness(1.2) contrast(1.1);
        
        .inner-wave {
          transform: translate(-50%, -50%) scale(1.3);
          z-index: 10;
        }
        
        .middle-hexagon, .outer-spiral {
          opacity: 0.4;
          filter: blur(2px);
        }
      }
      
      &.plan-focused {
        filter: brightness(1.15) contrast(1.05) hue-rotate(30deg);
        
        .middle-hexagon {
          transform: translate(-50%, -50%) scale(1.2) rotate(15deg);
          z-index: 10;
        }
        
        .inner-wave, .outer-spiral {
          opacity: 0.4;
          filter: blur(2px);
        }
      }
      
      &.action-focused {
        filter: brightness(1.1) contrast(1.02) hue-rotate(-15deg);
        
        .outer-spiral {
          transform: translate(-50%, -50%) scale(1.2);
          z-index: 10;
        }
        
        .inner-wave, .middle-hexagon {
          opacity: 0.4;
          filter: blur(2px);
        }
      }
      
      // 通用形状容器
      .text-shape {
        position: absolute;
        top: 50%;
        left: 50%;
        cursor: pointer;
        pointer-events: auto;
        transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        
        &:hover {
          transform: translate(-50%, -50%) scale(1.1) !important;
        }
      }
      
      // 内层：波浪形
      .wave-shape {
        width: 160px;
        height: 80px;
        transform: translate(-50%, -50%);
        
        .wave-text {
          position: relative;
          width: 100%;
          height: 100%;
          animation: none;
          
          .wave-segment {
            position: absolute;
            font-size: 13px;
            font-weight: 600;
            color: rgba(59, 130, 246, 0.9);
            text-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
            animation: floatUpDisappearWave 4s ease-in-out infinite;
            animation-delay: calc(var(--wave-index) * 0.3s);
            
            .title-span {
              color: rgba(147, 51, 234, 1);
              text-shadow: 0 0 12px rgba(147, 51, 234, 0.8);
              font-weight: 700;
            }
          }
        }
      }
      
      // 中层：六边形
      .hexagon-shape {
        width: 200px;
        height: 200px;
        transform: translate(-50%, -50%);
        
        .hexagon-text {
          position: relative;
          width: 100%;
          height: 100%;
          animation: none;
          
          .hex-vertex {
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            animation: floatUpDisappearHex 5s ease-in-out infinite;
            animation-delay: calc(var(--vertex-index) * 0.4s);
            text-align: center;
            
            .vertex-label {
              display: block;
              font-size: 11px;
              font-weight: 700;
              color: rgba(16, 185, 129, 1);
              text-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
              margin-bottom: 2px;
            }
            
            .vertex-content {
              display: block;
              font-size: 8px;
              color: rgba(255, 165, 0, 0.9);
              text-shadow: 0 0 6px rgba(255, 165, 0, 0.6);
              white-space: nowrap;
            }
          }
        }
      }
      
      // 外层：螺旋形
      .spiral-shape {
        width: 280px;
        height: 280px;
        transform: translate(-50%, -50%);
        
        .spiral-text {
          position: relative;
          width: 100%;
          height: 100%;
          animation: none;
          
          .spiral-node {
            position: absolute;
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            animation: floatUpDisappearSpiral 6s ease-in-out infinite;
            animation-delay: calc(var(--spiral-progress) * 2s);
            font-size: 9px;
            font-weight: 600;
            color: rgba(255, 165, 0, 0.9);
            text-shadow: 0 0 6px rgba(255, 165, 0, 0.6);
            white-space: nowrap;
            
            .title-span {
              color: rgba(239, 68, 68, 1);
              text-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
              font-weight: 700;
            }
          }
        }
      }
    }
    
    // 螺旋背景效果
    .spiral-background {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: -1;
      
      .spiral-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        opacity: 0.3;
        animation: spiralGlow 12s ease-in-out infinite;
        
        &.spiral-glow-1 {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          animation-delay: 0s;
        }
        
        &.spiral-glow-2 {
          width: 160px;
          height: 160px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
          animation: spiralGlowReverse 80s linear infinite;
          animation-delay: 2s;
        }
        
        &.spiral-glow-3 {
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(255, 165, 0, 0.2) 0%, transparent 70%);
          animation-delay: 4s;
        }
        
        // 动态色彩波浪
        .color-wave {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          pointer-events: none;
          mix-blend-mode: overlay;
          
          &.color-wave-1 {
            width: 300px;
            height: 300px;
            background: conic-gradient(
              from 0deg,
              rgba(59, 130, 246, 0.15) 0deg,
              rgba(147, 51, 234, 0.15) 120deg,
              rgba(16, 185, 129, 0.15) 240deg,
              rgba(59, 130, 246, 0.15) 360deg
            );
            animation: colorWaveRotate 25s linear infinite;
            transform: translate(-50%, -50%);
          }
          
          &.color-wave-2 {
            width: 400px;
            height: 400px;
            background: conic-gradient(
              from 180deg,
              rgba(255, 165, 0, 0.1) 0deg,
              rgba(239, 68, 68, 0.1) 90deg,
              rgba(16, 185, 129, 0.1) 180deg,
              rgba(147, 51, 234, 0.1) 270deg,
              rgba(255, 165, 0, 0.1) 360deg
            );
            animation: colorWaveRotate 35s linear infinite reverse;
            transform: translate(-50%, -50%);
          }
        }
        
        // 极光层
        .aurora-layer {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 600px;
          height: 600px;
          background: radial-gradient(
            ellipse at center,
            transparent 20%,
            rgba(59, 130, 246, 0.05) 40%,
            rgba(147, 51, 234, 0.08) 60%,
            rgba(16, 185, 129, 0.06) 80%,
            transparent 100%
          );
          transform: translate(-50%, -50%);
          animation: auroraShimmer 20s ease-in-out infinite;
          pointer-events: none;
          mix-blend-mode: soft-light;
        }
      }
    }
    
    // 螺旋粒子轨道效果
    .spiral-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      
      .particle-trail {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        opacity: 0.8;
        filter: blur(0.5px);
        
        // 内层粒子轨道
        &.particle-trail-inner {
          background: radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(147, 51, 234, 0.6) 100%);
          animation: spiralParticleInner 8s linear infinite;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
          
          &:nth-child(1) { animation-delay: 0s; }
          &:nth-child(2) { animation-delay: 2.7s; }
          &:nth-child(3) { animation-delay: 5.3s; }
        }
        
        // 中层粒子轨道
        &.particle-trail-middle {
          background: radial-gradient(circle, rgba(16, 185, 129, 1) 0%, rgba(255, 165, 0, 0.6) 100%);
          animation: spiralParticleMiddle 10s linear infinite;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
          
          &:nth-child(1) { animation-delay: 0s; }
          &:nth-child(2) { animation-delay: 2.5s; }
          &:nth-child(3) { animation-delay: 5s; }
          &:nth-child(4) { animation-delay: 7.5s; }
        }
        
        // 外层粒子轨道
        &.particle-trail-outer {
          background: radial-gradient(circle, rgba(255, 165, 0, 1) 0%, rgba(239, 68, 68, 0.6) 100%);
          animation: spiralParticleOuter 12s linear infinite;
          box-shadow: 0 0 8px rgba(255, 165, 0, 0.8);
          
          &:nth-child(1) { animation-delay: 0s; }
          &:nth-child(2) { animation-delay: 2.4s; }
          &:nth-child(3) { animation-delay: 4.8s; }
          &:nth-child(4) { animation-delay: 7.2s; }
          &:nth-child(5) { animation-delay: 9.6s; }
        }
      }
    }
  }
  
  // 动态光环背景系统
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    animation: pulsingRing 6s ease-in-out infinite;
  }
  
  &::before {
    width: calc(var(--inner-radius) * 2 + 40px);
    height: calc(var(--inner-radius) * 2 + 40px);
    background: radial-gradient(circle at center, 
      transparent 85%, 
      rgba(59, 130, 246, 0.15) 90%, 
      rgba(147, 51, 234, 0.25) 95%, 
      transparent 100%
    );
    box-shadow: 
      0 0 30px rgba(59, 130, 246, 0.4),
      inset 0 0 20px rgba(147, 51, 234, 0.3);
    animation-delay: 0s;
  }
  
  &::after {
    width: calc(var(--middle-radius) * 2 + 60px);
    height: calc(var(--middle-radius) * 2 + 60px);
    background: radial-gradient(circle at center, 
      transparent 80%, 
      rgba(16, 185, 129, 0.2) 85%, 
      rgba(245, 101, 101, 0.3) 92%, 
      transparent 100%
    );
    box-shadow: 
      0 0 40px rgba(16, 185, 129, 0.5),
      inset 0 0 30px rgba(245, 101, 101, 0.4);
    animation-delay: 2s;
  }
  
  // 外圈旋转光环
  .outer-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--outer-radius) * 2 + 80px);
    height: calc(var(--outer-radius) * 2 + 80px);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: conic-gradient(
      from 0deg,
      rgba(255, 165, 0, 0.1) 0deg,
      rgba(239, 68, 68, 0.2) 120deg,
      rgba(147, 51, 234, 0.15) 240deg,
      rgba(255, 165, 0, 0.1) 360deg
    );
    animation: rotatingGradient 20s linear infinite, pulsingRing 8s ease-in-out infinite;
    pointer-events: none;
    z-index: 5;
    opacity: 0.8;
  }

  // 连接线系统
  .connection-lines {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 8;
    
    .connection-line {
      position: absolute;
      top: 50%;
      left: 50%;
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(59, 130, 246, 0.6) 20%,
        rgba(147, 51, 234, 0.8) 50%,
        rgba(16, 185, 129, 0.6) 80%,
        transparent 100%
      );
      transform-origin: left center;
      animation: connectionPulse 4s ease-in-out infinite;
      box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
      
      &.line-1 {
        width: var(--inner-radius);
        transform: translate(0, -50%) rotate(0deg);
        animation-delay: 0s;
      }
      
      &.line-2 {
        width: var(--middle-radius);
        transform: translate(0, -50%) rotate(90deg);
        animation-delay: 1s;
      }
      
      &.line-3 {
        width: var(--inner-radius);
        transform: translate(0, -50%) rotate(180deg);
        animation-delay: 2s;
      }
      
      &.line-4 {
        width: var(--outer-radius);
        transform: translate(0, -50%) rotate(270deg);
        animation-delay: 3s;
      }
    }
  }

  // 能量粒子系统
  .energy-particles {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 15;
    
    .particle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, 
        rgba(59, 130, 246, 0.9) 0%, 
        rgba(147, 51, 234, 0.6) 50%, 
        transparent 100%
      );
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: particleOrbit 15s linear infinite;
      animation-delay: var(--particle-delay);
      box-shadow: 0 0 6px rgba(59, 130, 246, 0.8);
      
      &:nth-child(odd) {
        background: radial-gradient(circle, 
          rgba(16, 185, 129, 0.9) 0%, 
          rgba(255, 165, 0, 0.6) 50%, 
          transparent 100%
        );
        box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
        animation-duration: 18s;
        animation-direction: reverse;
      }
      
      &:nth-child(3n) {
        background: radial-gradient(circle, 
          rgba(245, 101, 101, 0.9) 0%, 
          rgba(147, 51, 234, 0.6) 50%, 
          transparent 100%
        );
        box-shadow: 0 0 6px rgba(245, 101, 101, 0.8);
        animation-duration: 12s;
      }
    }
  }

  // 第一层：内圈 - 4个卡片圆形分布
  .layer-one.centered {
    // 相对于容器定位
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 20;
    
    .layer-header {
      display: none; // 圆形分布时隐藏标题
    }
    
    .cards-container {
      position: relative;
      width: 100%;
      height: 100%;
      
      .vision-card {
        position: absolute;
        pointer-events: auto;
        transform-origin: center;
        transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        // 围绕式布局下的纯文字样式
        background: none;
        border: none;
        box-shadow: none;
        backdrop-filter: none;
        padding: 0;
        width: auto;
        height: auto;
        
        // 文字样式
        font-size: 0.9rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 
          0 0 10px rgba(59, 130, 246, 0.6),
          0 0 20px rgba(147, 51, 234, 0.4),
          0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 0.5px;
        line-height: 1.2;
        text-align: center;
        white-space: nowrap;
        
        // 文字悬浮动画
        animation: textFloat 8s ease-in-out infinite, textGlow 4s ease-in-out infinite;
        
        // 圆形分布：内圈半径，文字沿圆形路径排列
        &:nth-child(1) {
          // 上方 (0度)
          top: calc(var(--center-y) - var(--inner-radius) - 10px);
          left: 50%;
          transform: translateX(-50%);
          --rotation: -5deg;
          animation-delay: 0s;
        }
        
        &:nth-child(2) {
          // 右方 (90度)
          top: 50%;
          left: calc(var(--center-x) + var(--inner-radius) + 10px);
          transform: translateY(-50%);
          --rotation: 3deg;
          animation-delay: 0.5s;
        }
        
        &:nth-child(3) {
          // 下方 (180度)
          top: calc(var(--center-y) + var(--inner-radius) + 10px);
          left: 50%;
          transform: translateX(-50%);
          --rotation: 2deg;
          animation-delay: 1s;
        }
        
        &:nth-child(4) {
          // 左方 (270度)
          top: 50%;
          left: calc(var(--center-x) - var(--inner-radius) - 10px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: -3deg;
          animation-delay: 1.5s;
        }
        
        .card-content {
          .data-core {
            font-size: 0.9rem;
            margin-bottom: 0.2rem;
          }
          
          .data-label {
            font-size: 0.6rem;
            margin-bottom: 0.15rem;
          }
          
          .data-desc {
            font-size: 0.45rem;
            -webkit-line-clamp: 2;
          }
        }
      }
    }
    
    // 聚焦状态 - 文字放大发光
    &.focused {
      z-index: 50 !important;
      animation: focusedLayerGlow 3s ease-in-out infinite;
      
      .vision-card {
        font-size: 1.2rem !important;
        font-weight: 700 !important;
        color: rgba(255, 255, 255, 1) !important;
        
        &:nth-child(1) { 
          transform: scale(var(--focused-scale));
          text-shadow: 
            0 0 20px rgba(59, 130, 246, 1),
            0 0 40px rgba(147, 51, 234, 0.8),
            0 0 60px rgba(59, 130, 246, 0.6),
            0 4px 8px rgba(0, 0, 0, 0.4);
          animation: textFloat 8s ease-in-out infinite, focusedTextPulse 2s ease-in-out infinite;
        }
        &:nth-child(2) { 
          transform: scale(var(--focused-scale));
          text-shadow: 
            0 0 20px rgba(59, 130, 246, 1),
            0 0 40px rgba(147, 51, 234, 0.8),
            0 0 60px rgba(59, 130, 246, 0.6),
            0 4px 8px rgba(0, 0, 0, 0.4);
          animation: textFloat 8s ease-in-out infinite, focusedTextPulse 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        &:nth-child(3) { 
          transform: scale(var(--focused-scale));
          text-shadow: 
            0 0 20px rgba(59, 130, 246, 1),
            0 0 40px rgba(147, 51, 234, 0.8),
            0 0 60px rgba(59, 130, 246, 0.6),
            0 4px 8px rgba(0, 0, 0, 0.4);
          animation: textFloat 8s ease-in-out infinite, focusedTextPulse 2s ease-in-out infinite;
          animation-delay: 1s;
        }
        &:nth-child(4) { 
          transform: scale(var(--focused-scale));
          text-shadow: 
            0 0 20px rgba(59, 130, 246, 1),
            0 0 40px rgba(147, 51, 234, 0.8),
            0 0 60px rgba(59, 130, 246, 0.6),
            0 4px 8px rgba(0, 0, 0, 0.4);
          animation: textFloat 8s ease-in-out infinite, focusedTextPulse 2s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        opacity: 1;
        filter: brightness(1.4) saturate(1.3);
      }
    }
    
    // 非聚焦状态缩小并降低透明度（保持旋转）
    &.unfocused {
      z-index: 10;
      
      .vision-card {
        &:nth-child(1) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(2) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(3) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(4) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        opacity: 0.6;
        filter: blur(0.8px);
      }
    }
  }
  
  // 第二层：中圈 - 6个卡片圆形分布
  .layer-two.centered {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 19;
    
    .layer-header {
      display: none; // 圆形分布时隐藏标题
    }
    
    .cards-container {
      position: relative;
      width: 100%;
      height: 100%;
      
      .plan-card {
        position: absolute;
        pointer-events: auto;
        transform-origin: center;
        transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        // 围绕式布局下的纯文字样式
        background: none;
        border: none;
        box-shadow: none;
        backdrop-filter: none;
        padding: 0;
        width: auto;
        height: auto;
        
        // 文字样式 - 中圈绿橙色调
        font-size: 0.85rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.85);
        text-shadow: 
          0 0 10px rgba(16, 185, 129, 0.7),
          0 0 20px rgba(255, 165, 0, 0.5),
          0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 0.4px;
        line-height: 1.1;
        text-align: center;
        white-space: nowrap;
        
        // 文字悬浮动画
        animation: textFloat 9s ease-in-out infinite, textGlow 5s ease-in-out infinite;
        
        // 圆形分布：中圈半径，文字沿圆形路径均匀分布
        &:nth-child(1) {
          // 上方 (0度)
          top: calc(var(--center-y) - var(--middle-radius) - 8px);
          left: 50%;
          transform: translateX(-50%);
          --rotation: 4deg;
          animation-delay: 0s;
        }
        
        &:nth-child(2) {
          // 右上 (60度)
          top: calc(var(--center-y) - var(--middle-radius) * 0.5);
          left: calc(var(--center-x) + var(--middle-radius) * 0.866 + 8px);
          transform: translateY(-50%);
          --rotation: -2deg;
          animation-delay: 0.3s;
        }
        
        &:nth-child(3) {
          // 右下 (120度)
          top: calc(var(--center-y) + var(--middle-radius) * 0.5);
          left: calc(var(--center-x) + var(--middle-radius) * 0.866 + 8px);
          transform: translateY(-50%);
          --rotation: -4deg;
          animation-delay: 0.6s;
        }
        
        &:nth-child(4) {
          // 下方 (180度)
          top: calc(var(--center-y) + var(--middle-radius) + 8px);
          left: 50%;
          transform: translateX(-50%);
          --rotation: 6deg;
          animation-delay: 0.9s;
        }
        
        &:nth-child(5) {
          // 左下 (240度)
          top: calc(var(--center-y) + var(--middle-radius) * 0.5);
          left: calc(var(--center-x) - var(--middle-radius) * 0.866 - 8px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: 1deg;
          animation-delay: 1.2s;
        }
        
        &:nth-child(6) {
          // 左上 (300度)
          top: calc(var(--center-y) - var(--middle-radius) * 0.5);
          left: calc(var(--center-x) - var(--middle-radius) * 0.866 - 8px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: -5deg;
          animation-delay: 1.5s;
        }
        
        .card-content {
          .data-core {
            font-size: 0.8rem;
            margin-bottom: 0.15rem;
          }
          
          .data-label {
            font-size: 0.55rem;
          }
        }
      }
    }
    
    // 聚焦状态放大（保持旋转）
    &.focused {
      z-index: 50 !important;
      
      .plan-card {
        &:nth-child(1) { transform: scale(var(--focused-scale)) rotate(var(--rotation)); }
        &:nth-child(2) { transform: scale(var(--focused-scale)) rotate(var(--rotation)); }
        &:nth-child(3) { transform: scale(var(--focused-scale)) rotate(var(--rotation)); }
        &:nth-child(4) { transform: scale(var(--focused-scale)) rotate(var(--rotation)); }
        &:nth-child(5) { transform: scale(var(--focused-scale)) rotate(var(--rotation)); }
        &:nth-child(6) { transform: scale(var(--focused-scale)) rotate(var(--rotation)); }
        opacity: 1;
        filter: none;
      }
    }
    
    // 非聚焦状态缩小并降低透明度（保持旋转）
    &.unfocused {
      z-index: 10;
      
      .plan-card {
        &:nth-child(1) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(2) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(3) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(4) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(5) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        &:nth-child(6) { transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); }
        opacity: 0.6;
        filter: blur(0.8px);
      }
    }
  }
  
  // 第三层：外圈 - 12个卡片圆形分布
  .layer-three.centered {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 18;
    
    .layer-header {
      display: none; // 圆形分布时隐藏标题
    }
    
    .cards-container {
      position: relative;
      width: 100%;
      height: 100%;
      
      .action-card {
        position: absolute;
        pointer-events: auto;
        transform-origin: center;
        transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        // 围绕式布局下的纯文字样式
        background: none;
        border: none;
        box-shadow: none;
        backdrop-filter: none;
        padding: 0;
        width: auto;
        height: auto;
        
        // 文字样式 - 外圈红黄色调
        font-size: 0.8rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 
          0 0 8px rgba(255, 165, 0, 0.8),
          0 0 16px rgba(239, 68, 68, 0.6),
          0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 0.3px;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        
        // 文字悬浮动画
        animation: textFloat 10s ease-in-out infinite, textGlow 6s ease-in-out infinite;
        
        // 圆形分布：外圈文字沿圆形路径分布
        &:nth-child(1) { 
          // 0度 - 上方
          top: calc(var(--center-y) - var(--outer-radius) - 6px);
          left: 50%;
          transform: translateX(-50%);
          --rotation: 3deg; animation-delay: 0s; 
        }
        &:nth-child(2) { 
          // 30度 - 右上
          top: calc(var(--center-y) - var(--outer-radius) * 0.866);
          left: calc(var(--center-x) + var(--outer-radius) * 0.5 + 6px);
          transform: translateY(-50%);
          --rotation: -2deg; animation-delay: 0.2s; 
        }
        &:nth-child(3) { 
          // 60度
          top: calc(var(--center-y) - var(--outer-radius) * 0.5);
          left: calc(var(--center-x) + var(--outer-radius) * 0.866 + 6px);
          transform: translateY(-50%);
          --rotation: 4deg; animation-delay: 0.4s; 
        }
        &:nth-child(4) { 
          // 90度 - 右方
          top: 50%;
          left: calc(var(--center-x) + var(--outer-radius) + 6px);
          transform: translateY(-50%);
          --rotation: -3deg; animation-delay: 0.6s; 
        }
        &:nth-child(5) { 
          // 120度
          top: calc(var(--center-y) + var(--outer-radius) * 0.5);
          left: calc(var(--center-x) + var(--outer-radius) * 0.866 + 6px);
          transform: translateY(-50%);
          --rotation: -4deg; animation-delay: 0.8s; 
        }
        &:nth-child(6) { 
          // 150度
          top: calc(var(--center-y) + var(--outer-radius) * 0.866);
          left: calc(var(--center-x) + var(--outer-radius) * 0.5 + 6px);
          transform: translateY(-50%);
          --rotation: 2deg; animation-delay: 1s; 
        }
        &:nth-child(7) { 
          // 180度 - 下方
          top: calc(var(--center-y) + var(--outer-radius) + 6px);
          left: 50%;
          transform: translateX(-50%);
          --rotation: -1deg; animation-delay: 1.2s; 
        }
        &:nth-child(8) { 
          // 210度
          top: calc(var(--center-y) + var(--outer-radius) * 0.866);
          left: calc(var(--center-x) - var(--outer-radius) * 0.5 - 6px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: 5deg; animation-delay: 1.4s; 
        }
        &:nth-child(9) { 
          // 240度
          top: calc(var(--center-y) + var(--outer-radius) * 0.5);
          left: calc(var(--center-x) - var(--outer-radius) * 0.866 - 6px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: 1deg; animation-delay: 1.6s; 
        }
        &:nth-child(10) { 
          // 270度 - 左方
          top: 50%;
          left: calc(var(--center-x) - var(--outer-radius) - 6px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: -3deg; animation-delay: 1.8s; 
        }
        &:nth-child(11) { 
          // 300度
          top: calc(var(--center-y) - var(--outer-radius) * 0.5);
          left: calc(var(--center-x) - var(--outer-radius) * 0.866 - 6px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: 3deg; animation-delay: 2s; 
        }
        &:nth-child(12) { 
          // 330度
          top: calc(var(--center-y) - var(--outer-radius) * 0.866);
          left: calc(var(--center-x) - var(--outer-radius) * 0.5 - 6px);
          transform: translateY(-50%) translateX(-100%);
          --rotation: -2deg; animation-delay: 2.2s; 
        }
        
        .card-content {
          .data-core {
            font-size: 0.65rem;
            margin-bottom: 0.1rem;
          }
          
          .data-label {
            font-size: 0.45rem;
          }
        }
      }
    }
    
    // 聚焦状态放大（保持旋转）
    &.focused {
      z-index: 50 !important;
      
      .action-card {
        &:nth-child(1), &:nth-child(2), &:nth-child(3), &:nth-child(4),
        &:nth-child(5), &:nth-child(6), &:nth-child(7), &:nth-child(8),
        &:nth-child(9), &:nth-child(10), &:nth-child(11), &:nth-child(12) { 
          transform: scale(var(--focused-scale)) rotate(var(--rotation)); 
        }
        opacity: 1;
        filter: none;
      }
    }
    
    // 非聚焦状态缩小并降低透明度（保持旋转）
    &.unfocused {
      z-index: 10;
      
      .action-card {
        &:nth-child(1), &:nth-child(2), &:nth-child(3), &:nth-child(4),
        &:nth-child(5), &:nth-child(6), &:nth-child(7), &:nth-child(8),
        &:nth-child(9), &:nth-child(10), &:nth-child(11), &:nth-child(12) { 
          transform: scale(var(--unfocused-scale)) rotate(var(--rotation)); 
        }
        opacity: 0.6;
        filter: blur(0.8px);
      }
    }
  }
  
  // 围绕式布局的header样式调整
  .layer-one.centered .layer-header,
  .layer-two.centered .layer-header,
  .layer-three.centered .layer-header {
    position: relative;
    top: 0;
    left: 0;
    right: auto;
    transform: none;
    margin-bottom: 0.3rem;
    
    .layer-icon {
      width: 0.8rem;
      height: 0.8rem;
    }
    
    .layer-title {
      font-size: 0.5rem;
    }
  }
  
  // 小屏幕适配 - 缩小圆形分布半径
  @media (max-width: 768px) {
    --inner-radius: 110px;
    --middle-radius: 160px; 
    --outer-radius: 210px;
    
    .layer-one.centered .vision-card,
    .layer-two.centered .plan-card,
    .layer-three.centered .action-card {
      width: 60px;
      height: 42px;
      font-size: 0.6rem;
      padding: 0.3rem;
    }
  }
  
  // 极小屏幕适配 - 进一步缩小半径
  @media (max-width: 480px) {
    --inner-radius: 90px;
    --middle-radius: 130px;
    --outer-radius: 170px;
    
    .layer-one.centered .vision-card,
    .layer-two.centered .plan-card,
    .layer-three.centered .action-card {
      width: 50px;
      height: 35px;
      font-size: 0.55rem;
      padding: 0.25rem;
    }
  }
}

// 简洁卡片布局样式
.centered-cards-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  padding: 20px;
  
  // 六边形圆圈容器
  .hexagon-circle-container {
    position: relative;
    
    .hexagon-circle {
      position: relative;
      width: 500px;
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.5s ease;
      border-radius: 50%;
      overflow: hidden;
      animation: slowRotate 60s linear infinite;
      
      &.expanded {
        transform: scale(1.05);
      }
      
      // 圆形扇形区域 - 真正的圆形切片
      .triangle-segment {
        position: absolute;
        width: 340px;
        height: 340px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        z-index: 2;
        transform-origin: 50% 50%;
        
        // 使用圆形背景和clip-path创建扇形
        background: var(--segment-color, rgba(59, 130, 246, 0.8));
        border-radius: 50%;
        
        // 使用mask创建完美的60度扇形，形成真正的圆形而非六角形
        mask: conic-gradient(from 0deg, transparent 0deg, black 60deg, transparent 60deg);
        -webkit-mask: conic-gradient(from 0deg, transparent 0deg, black 60deg, transparent 60deg);
        
        &.active {
          filter: brightness(1.2) saturate(1.3);
          z-index: 3;
          transform: scale(1.05);
        }
        
        &:hover {
          filter: brightness(1.1);
        }
        
        // 扇形内容 - 固定位置显示
        .segment-content {
          position: absolute;
          top: 8%;
          left: 60%;
          width: 72px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          padding: 8px;
          box-sizing: border-box;
          transform: rotateZ(53deg);
          text-align: right;
          
          .segment-icon {
            margin-bottom: 2px;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
            width: 12px;
            height: 12px;
            flex-shrink: 0;
          }
          
          .segment-title {
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 2px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
            letter-spacing: 0.3px;
            flex-shrink: 0;
            white-space: nowrap;
          }
          
          
          .segment-description {
            font-size: 0.25rem;
            font-weight: 400;
            opacity: 0.9;
            line-height: 1.0;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
            max-width: 100%;
            word-wrap: break-word;
            text-align: center;
            white-space: normal;
          }
        }
        
        // 6个扇形区域的圆形排列 - 每个60度旋转，内容固定位置
        &:nth-child(1) { 
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(0deg);
        }
        &:nth-child(2) { 
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(60deg);
        }
        &:nth-child(3) { 
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(120deg);
        }
        &:nth-child(4) { 
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(180deg);
        }
        &:nth-child(5) { 
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(240deg);
        }
        &:nth-child(6) { 
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(300deg);
        }
        
        &.active {
          &:nth-child(1) { 
            transform: translate(-50%, -50%) rotate(0deg) scale(1.05);
          }
          &:nth-child(2) { 
            transform: translate(-50%, -50%) rotate(60deg) scale(1.05);
          }
          &:nth-child(3) { 
            transform: translate(-50%, -50%) rotate(120deg) scale(1.05);
          }
          &:nth-child(4) { 
            transform: translate(-50%, -50%) rotate(180deg) scale(1.05);
          }
          &:nth-child(5) { 
            transform: translate(-50%, -50%) rotate(240deg) scale(1.05);
          }
          &:nth-child(6) { 
            transform: translate(-50%, -50%) rotate(300deg) scale(1.05);
          }
        }
      }
      
      // 中心圆形区域
      .center-circle {
        position: absolute;
        width: 64px;
        height: 64px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.2) 0%, 
          rgba(255, 255, 255, 0.1) 100%);
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(20px);
        transition: all 0.3s ease;
        z-index: 5;
        
        // 添加内部光晕
        &::before {
          content: '';
          position: absolute;
          width: 90%;
          height: 90%;
          background: radial-gradient(circle, 
            rgba(255, 255, 255, 0.15) 0%, 
            transparent 70%);
          border-radius: 50%;
        }
        
        &:hover {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.25) 0%, 
            rgba(255, 255, 255, 0.15) 100%);
          border-color: rgba(255, 255, 255, 0.6);
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .center-content {
          text-align: center;
          color: white;
          z-index: 1;
          position: relative;
          animation: centerCounterRotate 60s linear infinite;
          
          .center-title {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 4px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          .center-subtitle {
            font-size: 10px;
            opacity: 0.9;
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 8px;
            border-radius: 10px;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  // 全屏展开覆盖层
  .expanded-content-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: overlayFadeIn 0.3s ease-out;
  }
  
  // 展开的内容面板
  .expanded-content-panel {
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    margin-bottom: 5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    overflow: hidden;
    animation: panelSlideIn 0.4s ease-out;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      .header-icon {
        color: rgba(59, 130, 246, 0.9);
        filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
      }
      
      .panel-title {
        color: white;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        flex: 1;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .close-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
      }
    }
    
    // 可滚动内容区域
    .panel-content-scroll {
      max-height: calc(80vh - 80px);
      overflow-y: auto;
      padding: 12px;
      
      // 美化滚动条
      &::-webkit-scrollbar {
        width: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        
        &:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      }
    }
    
    .panel-content {
      // 区域摘要统计
      .segment-summary {
        margin-bottom: 12px;
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
          
          .stat-item {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            transition: all 0.2s ease;
            
            &:hover {
              background: rgba(0, 0, 0, 0.4);
              border-color: rgba(255, 255, 255, 0.2);
              transform: translateY(-2px);
            }
            
            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: white;
              margin-bottom: 4px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .stat-label {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.7);
              font-weight: 500;
            }
          }
        }
        
        .summary-description {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px;
          
          p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
          }
        }
      }
      
      .active-segment-data {
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
          
          .content-item {
            position: relative;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 10px;
            transition: all 0.2s ease;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            
            &:hover {
              background: rgba(0, 0, 0, 0.3);
              border-color: rgba(255, 255, 255, 0.2);
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }
            
            &.priority {
              border-color: rgba(245, 158, 11, 0.4);
              background: rgba(245, 158, 11, 0.05);
              
              &::before {
                content: '';
                position: absolute;
                top: 16px;
                right: 16px;
                width: 8px;
                height: 8px;
                background: rgba(245, 158, 11, 0.8);
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
              }
            }
            
            &.completed {
              opacity: 0.7;
              
              .item-content .item-value {
                text-decoration: line-through;
                color: rgba(16, 185, 129, 0.8);
              }
            }
            
            .item-icon {
              color: rgba(59, 130, 246, 0.8);
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
              flex-shrink: 0;
              margin-top: 1px;
            }
            
            .item-content {
              flex: 1;
              
              .item-value {
                font-size: 14px;
                font-weight: 600;
                color: white;
                margin-bottom: 4px;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
              }
              
              .item-label {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 4px;
                font-weight: 500;
              }
              
              .item-desc {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.6);
                line-height: 1.3;
                margin-bottom: 6px;
              }
              
              .item-progress {
                display: flex;
                align-items: center;
                gap: 6px;
                
                .progress-bar {
                  flex: 1;
                  height: 4px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 3px;
                  overflow: hidden;
                  
                  .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, 
                      rgba(59, 130, 246, 0.8) 0%, 
                      rgba(16, 185, 129, 0.8) 100%);
                    border-radius: 3px;
                    transition: width 0.3s ease;
                  }
                }
                
                .progress-text {
                  font-size: 11px;
                  color: rgba(255, 255, 255, 0.6);
                  font-weight: 600;
                  min-width: 24px;
                }
              }
            }
            
            .item-status {
              .status-badge {
                padding: 2px 8px;
                border-radius: 8px;
                font-size: 9px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                
                &.completed {
                  background: rgba(16, 185, 129, 0.2);
                  color: rgba(16, 185, 129, 0.9);
                  border: 1px solid rgba(16, 185, 129, 0.3);
                }
                
                &.in-progress {
                  background: rgba(59, 130, 246, 0.2);
                  color: rgba(59, 130, 246, 0.9);
                  border: 1px solid rgba(59, 130, 246, 0.3);
                }
                
                &.pending {
                  background: rgba(245, 158, 11, 0.2);
                  color: rgba(245, 158, 11, 0.9);
                  border: 1px solid rgba(245, 158, 11, 0.3);
                }
                
                &.paused {
                  background: rgba(239, 68, 68, 0.2);
                  color: rgba(239, 68, 68, 0.9);
                  border: 1px solid rgba(239, 68, 68, 0.3);
                }
              }
            }
          }
        }
        
        // 分类标签区域
        .content-categories {
          h3 {
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }
          
          .category-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            
            .category-tag {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 16px;
              background: rgba(0, 0, 0, 0.3);
              border: 1px solid var(--tag-color, rgba(255, 255, 255, 0.2));
              border-radius: 20px;
              color: white;
              font-size: 12px;
              font-weight: 500;
              transition: all 0.2s ease;
              
              &:hover {
                background: rgba(0, 0, 0, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              }
            }
          }
        }
      }
      
      .no-active-segment {
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px 12px;
          color: rgba(255, 255, 255, 0.6);
          
          svg {
            margin-bottom: 12px;
            opacity: 0.5;
          }
          
          h3 {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: rgba(255, 255, 255, 0.8);
          }
          
          p {
            font-size: 16px;
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    }
  }
  
  // 面板动画
  @keyframes overlayFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes panelSlideIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

// 缓慢旋转动画
@keyframes slowRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 中心内容反向旋转动画（保持固定）
@keyframes centerCounterRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

  
  // 响应式设计
  @media (max-width: 768px) {
    padding: 15px;
    
    .hexagon-circle-container .hexagon-circle {
      width: 420px;
      height: 420px;
      
      .triangle-segment {
        width: 290px;
        height: 290px;
        
        .segment-content {
          top: 8%;
          left: 60%;
          width: 72px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          padding: 8px;
          box-sizing: border-box;
          transform: rotateZ(53deg);
          text-align: right;
          color: #fff;
          
          .segment-icon {
            margin-bottom: 3px;
            width: 10px;
            height: 10px;
            flex-shrink: 0;
          }
          
          .segment-title {
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 3px;
            letter-spacing: 0.3px;
            flex-shrink: 0;
            white-space: nowrap;
          }
          
          
          .segment-description {
            font-size: 0.3rem;
            font-weight: 400;
            opacity: 0.8;
            line-height: 1.0;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
            max-width: 90%;
            word-wrap: break-word;
            text-align: center;
          }
        }
      }
    }
    
    .expanded-content-panel {
      padding: 12px;
      
      .panel-header .panel-title {
        font-size: 16px;
      }
      
      .panel-content .active-segment-data .content-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  }
  
  .main-content-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 20px;
    max-width: 680px;
    width: 90%;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    .card-header {
      text-align: center;
      margin-bottom: 40px;
      
      .card-title {
        font-size: 36px;
        font-weight: 700;
        color: white;
        margin: 0 0 12px 0;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
      }
      
      .card-subtitle {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-weight: 300;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
    }
    
    .content-sections {
      display: grid;
      gap: 8px;
      
      .section {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 16px;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          
          .section-icon {
            color: rgba(59, 130, 246, 0.8);
            filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.4));
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: white;
            margin: 0;
          }
        }
        
        .section-content {
          .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 8px;
            
            .content-item {
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              padding: 16px;
              text-align: center;
              transition: all 0.2s ease;
              
              &:hover {
                background: rgba(0, 0, 0, 0.3);
                border-color: rgba(255, 255, 255, 0.2);
                transform: scale(1.02);
              }
              
              .item-value {
                font-size: 18px;
                font-weight: 700;
                color: white;
                margin-bottom: 8px;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
              }
              
              .item-label {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
                font-weight: 400;
              }
            }
          }
        }
        
        // 不同部分的特色颜色
        &.vision-section .section-icon {
          color: rgba(59, 130, 246, 0.8);
        }
        
        &.plan-section .section-icon {
          color: rgba(16, 185, 129, 0.8);
        }
        
        &.action-section .section-icon {
          color: rgba(245, 158, 11, 0.8);
        }
      }
    }
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    padding: 20px;
    
    .main-content-card {
      padding: 16px;
      
      .card-header .card-title {
        font-size: 20px;
      }
      
      .content-sections {
        gap: 12px;
        
        .section {
          padding: 12px;
          
          .section-content .content-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      }
    }
  }
}
</style>