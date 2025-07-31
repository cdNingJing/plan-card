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
      <div class="timeline-progress">
        <div class="progress-text">
          步骤 {{ Math.min(currentTimelineStep + 1, 5) }}/5: {{ getCurrentStepDescription() }}
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: ((Math.min(currentTimelineStep + 1, 5)) / 5 * 100) + '%' }"
          ></div>
        </div>
      </div>
      <button 
        v-if="connectedCards.length > 0"
        @click="handleComplete"
        class="complete-button"
        :class="{ 'disabled': isTimelineRunning }"
        :disabled="isTimelineRunning"
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
import aiApiService from '@/api/aiApi.js'

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

const emit = defineEmits(['generate-solutions', 'cards-order-finalized'])

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

  // 基于用户标签动态生成行动模板
  const generateActionTemplate = (tag, index) => {
    const iconComponents = [Heart, Zap, Target, Users, Lightbulb, Compass, RotateCcw, TrendingUp, Eye, Brain]
    
    // 检测当前问题的场景类型，生成对应的描述
    const query = props.currentQuery.toLowerCase()
    let scenarioDescription = `针对"${tag.title}"制定具体的行动方案和实施计划`
    
    // 根据问题场景类型生成不同的描述
    if (query.includes('5年') || query.includes('未来') || query.includes('年后')) {
      // 计划结局场景
      scenarioDescription = `${tag.title}：构建从现在到5年后的完整发展路径`
    } else if (query.includes('困住') || query.includes('难以推进') || query.includes('创业计划')) {
      // 认知突破场景
      scenarioDescription = `${tag.title}：识别并突破阻碍你前进的认知盲区`
    } else if (query.includes('观察力') || query.includes('发现') || query.includes('生活的美')) {
      // 感知扩张场景
      scenarioDescription = `${tag.title}：重新训练感知模式，发现世界的美好`
    } else if (query.includes('自律') || query.includes('果断') || query.includes('领导力')) {
      // 人格重塑场景
      scenarioDescription = `${tag.title}：通过系统化训练重塑理想人格`
    } else if (query.includes('回忆') || query.includes('出不来') || query.includes('活在')) {
      // 记忆重构场景
      scenarioDescription = `${tag.title}：重新解读过去，重构健康的自我认知`
    } else if (query.includes('共振') || query.includes('同频') || query.includes('内心')) {
      // 灵魂连接场景
      scenarioDescription = `${tag.title}：建立深度连接，寻找心灵伙伴`
    }
    
    return {
      title: tag.title,
      description: scenarioDescription,
      icon: iconComponents[index % iconComponents.length],
      type: 'scenario_based'
    }
  }

  // 按选择顺序生成对应的行动卡片
  props.selectedTags.forEach((tag, index) => {
    const template = generateActionTemplate(tag, index)
    
    cards.push({
      id: `action-${tag.id}`,
      title: template.title,
      subtitle: `维度 ${index + 1}`,
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
  // 如果时间线正在运行，禁止用户操作
  if (isTimelineRunning.value) {
    event.preventDefault()
    return
  }
  
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
  // 如果时间线正在运行，禁止触发完成操作
  if (isTimelineRunning.value) {
    return
  }
  
  // 发出最终卡片顺序
  emit('cards-order-finalized', relationshipCards.value)
  
  emit('generate-solutions')
}

// 监听props变化
watch(() => props.selectedTags, () => {
  generateRelationshipCards()
}, { immediate: true })

// AI卡片排序分析提示词
const CARD_SORTING_PROMPT = `
你是卡片排序分析系统，专门负责分析用户选择的标签，并生成合理的排序步骤。

## 核心任务
基于用户的问题和选中的标签，分析它们之间的逻辑关系和重要性层次，生成2-3个具体的排序步骤。每个步骤可以包含多个卡片移动操作。

## 分析原则
1. **重要性分析**：识别哪些标签最核心、最重要
2. **逻辑关联性**：分析标签之间的内在联系和依赖关系
3. **解决顺序**：确定处理这些问题的最佳先后顺序
4. **实际意义**：每个排序步骤都要有明确的逻辑依据
5. **批量操作**：一个步骤中可以移动多个相关的卡片

## 输出格式
请返回JSON格式的排序步骤：
{
  "steps": [
    {
      "type": "prioritize",
      "description": "排序步骤的具体描述",
      "moves": [
        {
          "fromIndex": 源位置索引,
          "toIndex": 目标位置索引,
          "reasoning": "这个移动的具体理由"
        },
        {
          "fromIndex": 另一个源位置索引,
          "toIndex": 另一个目标位置索引,
          "reasoning": "另一个移动的具体理由"
        }
      ],
      "reasoning": "这个步骤的整体排序理由"
    }
  ]
}

## 要求
- 最多生成3个步骤
- 每个步骤可以包含1-3个移动操作
- 每个移动都要有明确的逻辑理由
- fromIndex和toIndex必须是有效的数组索引
- 移动操作要考虑之前移动对索引的影响
- 描述要简洁明确，让用户理解排序的意义
- 优先考虑批量移动相关的标签，提高排序效率

## 示例场景
- 步骤1：将所有基础技能类标签移动到前面
- 步骤2：将相关的进阶技能标签组合在一起  
- 步骤3：调整最终的优先级顺序
`

// 调用AI生成时间线步骤
const generateTimelineSteps = async () => {
  if (!props.selectedTags || props.selectedTags.length <= 1) return []
  
  try {
    console.log('🤖 开始AI分析卡片排序')
    
    const tags = [...props.selectedTags]
    const tagTitles = tags.map(tag => tag.title).join('、')
    
    const prompt = `${CARD_SORTING_PROMPT}

用户问题："${props.currentQuery}"
用户选择的标签：${tagTitles}
标签总数：${tags.length}

请分析这些标签的重要性和逻辑关系，生成合理的排序步骤。标签索引从0开始到${tags.length - 1}。`

    const response = await aiApiService.sendMessage(prompt)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          
          if (parsed.steps && Array.isArray(parsed.steps)) {
            // 为每个步骤添加action函数，支持多个移动操作
            return parsed.steps.map(step => ({
              ...step,
              action: function() {
                // 支持新的moves数组格式
                if (this.moves && Array.isArray(this.moves)) {
                  // 执行多个移动操作
                  this.moves.forEach(move => {
                    if (move.fromIndex !== undefined && move.toIndex !== undefined) {
                      swapCards(move.fromIndex, move.toIndex)
                    }
                  })
                }
                // 兼容旧的单个移动格式
                else if (this.fromIndex !== undefined && this.toIndex !== undefined) {
                  swapCards(this.fromIndex, this.toIndex)
                }
              }
            }))
          }
        }
      } catch (parseError) {
        console.warn('⚠️ AI排序步骤解析失败:', parseError)
      }
    }
    
    console.warn('⚠️ AI分析失败，使用默认排序步骤')
    return generateFallbackSteps(tags.length)
    
  } catch (error) {
    console.error('❌ AI排序分析调用失败:', error)
    return generateFallbackSteps(tags.length)
  }
}

// 备用排序步骤（当AI调用失败时使用）
const generateFallbackSteps = (tagCount) => {
  const steps = []
  
  if (tagCount > 1) {
    steps.push({
      type: 'prioritize',
      description: '根据重要性调整顺序，将核心问题放在前面',
      moves: [
        {
          fromIndex: tagCount - 1,
          toIndex: 0,
          reasoning: '将最后一个标签移到最前面，通常最后选择的标签可能是最重要的'
        }
      ],
      reasoning: '优化标签的重要性顺序，确保核心问题优先处理',
      action: function() {
        if (this.moves && Array.isArray(this.moves)) {
          this.moves.forEach(move => {
            if (move.fromIndex !== undefined && move.toIndex !== undefined) {
              swapCards(move.fromIndex, move.toIndex)
            }
          })
        }
      }
    })
  }
  
  if (tagCount >= 3) {
    steps.push({
      type: 'group',
      description: '将相关问题组合在一起，形成逻辑链条',
      moves: [
        {
          fromIndex: 2,
          toIndex: 1,
          reasoning: '调整中间位置的标签，优化整体逻辑顺序'
        }
      ],
      reasoning: '建立标签之间的逻辑关联，形成处理问题的合理顺序',
      action: function() {
        if (this.moves && Array.isArray(this.moves)) {
          this.moves.forEach(move => {
            if (move.fromIndex !== undefined && move.toIndex !== undefined) {
              swapCards(move.fromIndex, move.toIndex)
            }
          })
        }
      }
    })
  }
  
  return steps
}

// 启动时间线演示
const startTimeline = async () => {
  if (timelineTimer.value || isTimelineRunning.value) return
  
  // 启动进度条显示
  currentTimelineStep.value = -1
  isTimelineRunning.value = true
  
  // 异步生成AI排序步骤
  console.log('🔄 正在生成AI排序步骤...')
  timelineSteps.value = await generateTimelineSteps()
  console.log('✅ AI排序步骤生成完成:', timelineSteps.value.length, '个步骤')
  
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
  
  // 使用默认的5步或者自定义时间线步骤的最大值
  const maxSteps = Math.max(5, timelineSteps.value.length)
  
  if (currentTimelineStep.value >= maxSteps) {
    stopTimeline()
    // 时间线完成后自动进入解决方案页面
    setTimeout(() => {
      handleComplete()
    }, 800) // 延迟800ms让用户看到完成状态
    return
  }
  
  // 如果有自定义时间线步骤且当前步骤在范围内，执行对应动作
  if (timelineSteps.value.length > 0 && currentTimelineStep.value < timelineSteps.value.length) {
    const step = timelineSteps.value[currentTimelineStep.value]
    if (step.action) {
      step.action()
    }
  }
  // 如果是默认的5步进度，不需要执行特定动作，只是更新进度条
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
  // 默认的5步进度描述
  const defaultSteps = [
    '正在AI分析标签关系...',
    '识别重要性层次...',
    '建立逻辑连接...',
    '优化排序方案...',
    '生成最终方案...'
  ]
  
  if (currentTimelineStep.value < 0) {
    return '准备开始AI分析...'
  }
  
  const stepIndex = Math.min(currentTimelineStep.value, 4) // 确保不超过数组范围
  
  // 如果有AI生成的时间线步骤，优先使用
  if (timelineSteps.value.length > 0 && currentTimelineStep.value < timelineSteps.value.length) {
    const step = timelineSteps.value[currentTimelineStep.value]
    
    // 如果有多个移动操作，显示更详细的信息
    if (step.moves && step.moves.length > 1) {
      return `${step.description} (${step.moves.length}个移动操作)`
    }
    
    // 显示AI的排序理由（如果有的话）
    return step.reasoning ? `${step.description} - ${step.reasoning}` : step.description
  }
  
  // 使用默认步骤描述
  if (currentTimelineStep.value >= 5) {
    return '分析完成，正在跳转到解决方案...'
  }
  
  return defaultSteps[stepIndex]
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
  cursor: not-allowed !important;
  pointer-events: none;
  opacity: 0.8;
  position: relative;
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

.complete-button.disabled,
.complete-button:disabled {
  background: #d1d5db !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
  opacity: 0.6;
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