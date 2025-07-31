<template>
  <div class="mobile-grid-possibilities">
    <!-- 可拖拽卡片区域 -->
    <div class="draggable-area">
      <div 
        ref="cardsContainer"
        class="cards-container"
      >
        <div 
          v-for="(element, index) in relationshipCards"
          :key="element.id"
          class="relationship-card"
          :class="{ 
            'highlighted': element.highlighted,
            'switching': element.switching,
            'timeline-running': isTimelineRunning,
            'drop-target': element.dropTarget
          }"
          :style="{
            backgroundColor: element.color,
            animationDelay: `${index * 100}ms`
          }"
          @mousedown="handleMouseDown($event, index)"
        >
            <div class="card-icon">
              <component :is="element.icon" v-if="element.icon" />
            </div>
            <div class="card-content">
              <div class="card-title">{{ element.title }}</div>
              <div class="card-subtitle" v-if="element.subtitle">阶段 {{ index + 1 }}</div>
              <div class="card-description">{{ element.description }}</div>
            </div>
            <div class="card-connection-indicator" v-if="element.connected">
              <div class="connection-dot"></div>
            </div>
        </div>
      </div>
    </div>

    <!-- 底部问题显示区域 -->
    <div class="bottom-question-area">
      <div class="question-content">{{ currentQuery }}</div>
      <div class="timeline-progress" v-if="timelineSteps.length > 0">
        <div class="progress-text">
          步骤 {{ currentTimelineStep + 1 }}/{{ timelineSteps.length }}: {{ getCurrentStepDescription() }}
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: ((currentTimelineStep + 1) / timelineSteps.length * 100) + '%' }"
          ></div>
        </div>
      </div>
      <button 
        v-if="connectedCards.length > 0"
        @click="handleComplete"
        class="complete-button"
      >
        分析关联 ({{ connectedCards.length }} 个连接) →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { 
  ArrowUpDown, 
  GitBranch, 
  Zap, 
  Target, 
  Users, 
  TrendingUp, 
  RotateCcw, 
  Lightbulb,
  Brain,
  Heart,
  Eye,
  Compass
} from 'lucide-vue-next'

const props = defineProps({
  possibilities: {
    type: Array,
    default: () => []
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  selectedTags: {
    type: Array,
    default: () => []
  },
  currentQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['generate-solutions'])

// 卡片数据
const relationshipCards = ref([])
const cardsContainer = ref(null)

// 时间线演示状态
const timelineTimer = ref(null)
const timelineSteps = ref([])
const currentTimelineStep = ref(-1)
const isTimelineRunning = ref(false)
const timelineInterval = 2500 // 2.5秒执行一步

// 网格背景
const gridCells = computed(() => {
  // 创建网格点阵，6x8 = 48个点
  return 48
})

// 原生拖拽状态
const dragState = ref({
  isDragging: false,
  draggedElement: null,
  draggedIndex: -1,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
  targetIndex: -1,
  placeholder: null
})

// 连接的卡片
const connectedCards = computed(() => {
  return relationshipCards.value.filter(card => card.connected)
})

// 基于用户问题和选中标签生成关联卡片
const generateRelationshipCards = () => {
  if (!props.selectedTags || props.selectedTags.length === 0) return

  const cards = []
  
  // Notion风格的灰度色彩方案
  const colors = [
    '#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#ebebeb', '#e6e6e6',
    '#e1e1e1', '#dcdcdc', '#d7d7d7', '#d2d2d2', '#cdcdcd', '#c8c8c8'
  ]
  
  // 使用Lucide图标
  const iconComponents = [
    ArrowUpDown, GitBranch, Zap, Target, Users, TrendingUp, 
    RotateCcw, Lightbulb, Brain, Heart, Eye, Compass
  ]

  // 基于用户选择的标签和问题生成关联关系
  const relationshipTemplates = [
    { type: 'cause', template: '因果关系', strength: 'strong', icon: ArrowUpDown },
    { type: 'effect', template: '影响关系', strength: 'medium', icon: GitBranch },
    { type: 'correlation', template: '相关关系', strength: 'weak', icon: Zap },
    { type: 'enhancement', template: '增强关系', strength: 'strong', icon: TrendingUp },
    { type: 'conflict', template: '冲突关系', strength: 'medium', icon: RotateCcw },
    { type: 'support', template: '支持关系', strength: 'strong', icon: Heart },
    { type: 'trigger', template: '触发关系', strength: 'medium', icon: Target },
    { type: 'balance', template: '平衡关系', strength: 'weak', icon: Compass }
  ]

  // 基于用户标签动态生成行动模板
  const generateActionTemplate = (tag, index) => {
    const iconComponents = [Heart, Zap, Target, Users, Lightbulb, Compass, RotateCcw, TrendingUp, Eye, Brain]
    
    return {
      title: tag.title, // 直接使用用户选择的标签标题
      description: `针对"${tag.title}"制定具体的行动方案和实施计划`,
      icon: iconComponents[index % iconComponents.length],
      type: 'dynamic'
    }
  }

  // 按选择顺序生成对应的行动卡片
  props.selectedTags.forEach((tag, index) => {
    const template = generateActionTemplate(tag, index)
    
    cards.push({
      id: `action-${tag.id}`,
      title: template.title,
      subtitle: `阶段 ${index + 1}`,
      description: template.description,
      color: colors[index % colors.length],
      icon: template.icon,
      actionType: template.type,
      priority: index + 1, // 按选择顺序设置优先级
      tags: [tag],
      connected: false,
      highlighted: false,
      switching: false,
      dropTarget: false,
      position: index
    })
  })


  relationshipCards.value = cards
}

// 原生拖拽事件处理
const handleMouseDown = (event, index) => {
  // 用户开始拖拽时暂停时间线
  stopTimeline()
  
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  
  dragState.value = {
    isDragging: true,
    draggedElement: card,
    draggedIndex: index,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    targetIndex: -1,
    placeholder: null
  }
  
  // 设置拖拽样式
  card.classList.add('dragging')
  card.style.position = 'fixed'
  card.style.zIndex = '1000'
  card.style.pointerEvents = 'none'
  card.style.left = rect.left + 'px'
  card.style.top = rect.top + 'px'
  card.style.width = rect.width + 'px'
  
  // 创建占位符
  createPlaceholder(index)
  
  // 添加全局事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  event.preventDefault()
}

const handleMouseMove = (event) => {
  if (!dragState.value.isDragging) return
  
  const { draggedElement, offsetX, offsetY } = dragState.value
  
  // 更新拖拽元素位置
  draggedElement.style.left = (event.clientX - offsetX) + 'px'
  draggedElement.style.top = (event.clientY - offsetY) + 'px'
  
  // 检测拖拽目标
  detectDropTarget(event)
}

const handleMouseUp = (event) => {
  if (!dragState.value.isDragging) return
  
  const { draggedElement, draggedIndex, targetIndex } = dragState.value
  
  // 移除拖拽样式
  draggedElement.classList.remove('dragging')
  draggedElement.style.position = ''
  draggedElement.style.zIndex = ''
  draggedElement.style.pointerEvents = ''
  draggedElement.style.left = ''
  draggedElement.style.top = ''
  draggedElement.style.width = ''
  
  // 移除占位符
  removePlaceholder()
  
  // 如果有有效目标，执行交换
  if (targetIndex >= 0 && targetIndex !== draggedIndex) {
    swapCards(draggedIndex, targetIndex)
    checkCardConnections(targetIndex)
  }
  
  // 清理状态
  dragState.value = {
    isDragging: false,
    draggedElement: null,
    draggedIndex: -1,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    targetIndex: -1,
    placeholder: null
  }
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  // 清除高亮状态
  setTimeout(() => {
    relationshipCards.value.forEach(card => {
      if (!card.connected) {
        card.highlighted = false
      }
    })
  }, 200)
}

// 创建占位符
const createPlaceholder = (index) => {
  const placeholder = document.createElement('div')
  placeholder.className = 'drag-placeholder'
  placeholder.style.height = '120px'
  placeholder.style.margin = '8px'
  placeholder.style.border = '2px dashed #d1d5db'
  placeholder.style.borderRadius = '8px'
  placeholder.style.background = '#f9fafb'
  placeholder.style.opacity = '0.5'
  
  const container = cardsContainer.value
  const cards = container.children
  
  if (index < cards.length) {
    container.insertBefore(placeholder, cards[index])
  } else {
    container.appendChild(placeholder)
  }
  
  dragState.value.placeholder = placeholder
}

// 移除占位符
const removePlaceholder = () => {
  if (dragState.value.placeholder) {
    dragState.value.placeholder.remove()
    dragState.value.placeholder = null
  }
}

// 检测放置目标
const detectDropTarget = (event) => {
  const container = cardsContainer.value
  const cards = [...container.children].filter(el => !el.classList.contains('drag-placeholder') && !el.classList.contains('dragging'))
  
  let targetIndex = -1
  let minDistance = Infinity
  
  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distance = Math.sqrt(
      Math.pow(event.clientX - centerX, 2) + 
      Math.pow(event.clientY - centerY, 2)
    )
    
    if (distance < minDistance && distance < 100) {
      minDistance = distance
      targetIndex = index
    }
  })
  
  // 更新目标索引
  if (targetIndex !== dragState.value.targetIndex) {
    // 清除之前的高亮
    relationshipCards.value.forEach(card => {
      card.dropTarget = false
    })
    
    // 设置新目标
    if (targetIndex >= 0) {
      relationshipCards.value[targetIndex].dropTarget = true
    }
    
    dragState.value.targetIndex = targetIndex
  }
}

// 交换卡片
const swapCards = (fromIndex, toIndex) => {
  const cards = [...relationshipCards.value]
  const temp = cards[fromIndex]
  cards[fromIndex] = cards[toIndex]
  cards[toIndex] = temp
  relationshipCards.value = cards
}

// 检查卡片连接
const checkCardConnections = (newIndex) => {
  const movedCard = relationshipCards.value[newIndex]
  
  // 检查与相邻卡片的距离，判断是否建立连接
  const adjacentIndices = [newIndex - 1, newIndex + 1].filter(i => 
    i >= 0 && i < relationshipCards.value.length && i !== newIndex
  )
  
  adjacentIndices.forEach(index => {
    const adjacentCard = relationshipCards.value[index]
    
    // 检查标签重叠度来判断是否应该连接
    const commonTags = movedCard.tags.filter(tag1 => 
      adjacentCard.tags.some(tag2 => tag2.id === tag1.id)
    )
    
    if (commonTags.length > 0) {
      movedCard.connected = true
      adjacentCard.connected = true
      movedCard.highlighted = true
      adjacentCard.highlighted = true
    }
  })
}

const handleComplete = () => {
  emit('generate-solutions')
}

// 监听props变化
watch(() => props.selectedTags, () => {
  generateRelationshipCards()
}, { immediate: true })

// 生成时间线步骤
const generateTimelineSteps = () => {
  if (!props.selectedTags || props.selectedTags.length === 0) return []
  
  const steps = []
  const tags = [...props.selectedTags]
  
  // 步骤1: 初始化 - 按选中顺序排列
  steps.push({
    type: 'initialize',
    description: '初始化卡片排列，按您选中的顺序显示',
    action: () => {
      // 已经按顺序生成，无需额外操作
    }
  })
  
  // 步骤2: 重要性排序 - 将最重要的放在前面
  if (tags.length > 1) {
    steps.push({
      type: 'prioritize',
      description: '根据重要性调整顺序，将核心问题放在前面',
      fromIndex: tags.length - 1, // 最后一个移到前面
      toIndex: 0,
      action: function() {
        swapCards(this.fromIndex, this.toIndex)
      }
    })
  }
  
  // 步骤3-N: 逻辑关联排序 - 将相关的卡片放在一起
  if (tags.length >= 3) {
    // 将第三个卡片移到第二个位置，形成逻辑组合
    steps.push({
      type: 'group',
      description: '将相关问题组合在一起，形成逻辑链条',
      fromIndex: 2,
      toIndex: 1,
      action: function() {
        swapCards(this.fromIndex, this.toIndex)
      }
    })
  }
  
  if (tags.length >= 4) {
    // 最后一步：将第四个卡片与第三个交换，完成最终排序
    steps.push({
      type: 'finalize',
      description: '完成最终排序，形成最优解决方案顺序',
      fromIndex: 3,
      toIndex: 2,
      action: function() {
        swapCards(this.fromIndex, this.toIndex)
      }
    })
  }
  
  return steps
}

// 启动时间线演示
const startTimeline = () => {
  if (timelineTimer.value || isTimelineRunning.value) return
  
  timelineSteps.value = generateTimelineSteps()
  if (timelineSteps.value.length === 0) return
  
  currentTimelineStep.value = -1
  isTimelineRunning.value = true
  
  // 第一步立即执行
  nextTimelineStep()
  
  // 后续步骤定时执行
  timelineTimer.value = setInterval(() => {
    nextTimelineStep()
  }, timelineInterval)
}

// 执行下一步
const nextTimelineStep = () => {
  currentTimelineStep.value++
  
  if (currentTimelineStep.value >= timelineSteps.value.length) {
    stopTimeline()
    // 时间线完成后自动进入解决方案页面
    setTimeout(() => {
      handleComplete()
    }, 800) // 延迟800ms让用户看到完成状态
    return
  }
  
  const step = timelineSteps.value[currentTimelineStep.value]
  if (step.action) {
    step.action()
  }
}

// 停止时间线
const stopTimeline = () => {
  if (timelineTimer.value) {
    clearInterval(timelineTimer.value)
    timelineTimer.value = null
  }
  isTimelineRunning.value = false
}

// 获取当前步骤描述
const getCurrentStepDescription = () => {
  if (currentTimelineStep.value < 0) {
    return '准备开始...'
  }
  if (currentTimelineStep.value >= timelineSteps.value.length) {
    return '排序完成，正在跳转到解决方案...'
  }
  return timelineSteps.value[currentTimelineStep.value].description
}

onMounted(() => {
  generateRelationshipCards()
  // 延迟启动时间线演示，让用户先看到初始状态
  setTimeout(() => {
    startTimeline()
  }, 1500)
})

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  stopTimeline()
})
</script>

<style scoped>
.mobile-grid-possibilities {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fafafa;
  z-index: 1000;
  overflow: hidden;
}

/* 可拖拽区域 */
.draggable-area {
  position: relative;
  height: 100%;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  z-index: 10;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  max-width: 1200px;
  width: 100%;
  padding: 20px 0 120px;
}

/* 关联卡片 - Notion风格 */
.relationship-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  animation: slideInUp 0.3s ease forwards;
  opacity: 0;
  transform: translateY(8px);
  position: relative;
  display: flex;
  gap: 12px;
}

.relationship-card:active {
  cursor: grabbing;
}

.relationship-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.relationship-card.highlighted {
  border-color: #374151;
  background: #f9fafb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 切换动画 - 去除消失效果 */
.relationship-card.switching {
  animation: cardSwitch 0.5s ease-out;
  z-index: 100;
}

.relationship-card.timeline-running {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* 原生拖拽效果 */
.relationship-card.dragging {
  transform: rotate(3deg) scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  border-color: #374151;
  opacity: 0.9;
  cursor: grabbing;
  user-select: none;
}

.relationship-card.drop-target {
  border-color: #10b981;
  background: #ecfdf5;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transform: translateY(-2px) scale(1.02);
  transition: all 0.2s ease;
}

.drag-placeholder {
  transition: all 0.2s ease;
}



/* 卡片图标 - Notion风格 */
.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
  flex-shrink: 0;
  margin-top: 2px;
}

.relationship-card.highlighted .card-icon {
  background: #374151;
  color: #ffffff;
}

/* 卡片内容区域 */
.card-content {
  flex: 1;
  min-width: 0;
}

/* 卡片标题 - Notion风格 */
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 卡片副标题 */
.card-subtitle {
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 卡片描述 - Notion风格 */
.card-description {
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 连接指示器 - Notion风格 */
.card-connection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: all 0.2s ease;
}

.relationship-card.highlighted .card-connection-indicator {
  opacity: 1;
}

.connection-dot {
  width: 8px;
  height: 8px;
  background: #374151;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.2);
  animation: pulse 2s infinite;
}


/* 动画效果 */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes cardSwitch {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 1;
  }
  30% {
    transform: translateY(-8px) scale(1.03) rotate(1deg);
    opacity: 1;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  60% {
    transform: translateY(-4px) scale(1.01) rotate(-0.5deg);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 1;
  }
}


/* 底部问题区域 */
.bottom-question-area {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 400;
  max-width: 700px;
  width: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auto-switch-button {
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.auto-switch-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.auto-switch-button.active {
  background: #374151;
  color: #ffffff;
}

.auto-switch-button.active:hover {
  background: #111827;
}

.question-content {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #111111;
}

.complete-button {
  background: #374151;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.complete-button:hover {
  background: #111827;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 时间线进度样式 */
.timeline-progress {
  flex: 1;
  margin-right: 16px;
}

.progress-text {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
  line-height: 1.4;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 动画 */
@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .draggable-area {
    padding: 12px;
  }
  
  .cards-container {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 10px;
    padding: 16px 0 100px;
  }
  
  .relationship-card {
    padding: 14px;
    gap: 10px;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
  }
  
  .card-title {
    font-size: 15px;
  }
  
  .card-subtitle {
    font-size: 14px;
  }
  
  .card-description {
    font-size: 13px;
  }
  
  .bottom-question-area {
    bottom: 16px;
    width: calc(100% - 32px);
    padding: 14px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    text-align: center;
  }
  
  .timeline-progress {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .progress-text {
    font-size: 12px;
    text-align: center;
  }
  
  .control-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .auto-switch-button {
    width: 100%;
    justify-content: center;
  }
  
  .question-content {
    font-size: 14px;
  }
  
  .complete-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .grid-dot {
    width: 6px;
    height: 6px;
  }
  
  .draggable-area {
    padding: 8px;
  }
  
  .cards-container {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 0 80px;
  }
  
  .relationship-card {
    padding: 12px;
    gap: 8px;
  }
  
  .card-icon {
    width: 32px;
    height: 32px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-subtitle {
    font-size: 13px;
  }
  
  .card-description {
    font-size: 12px;
    -webkit-line-clamp: 3;
  }
  
  .connection-dot {
    width: 6px;
    height: 6px;
  }
  
  .bottom-question-area {
    bottom: 12px;
    width: calc(100% - 24px);
    padding: 12px 14px;
    flex-direction: column;
    gap: 8px;
  }
  
  .progress-text {
    font-size: 11px;
  }
  
  .auto-switch-button {
    font-size: 12px;
    padding: 6px 10px;
  }
  
  .question-content {
    font-size: 13px;
  }
  
  .complete-button {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>