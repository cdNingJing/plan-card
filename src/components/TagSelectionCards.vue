<template>
  <div ref="containerRef" class="falling-tags-container">
    
    <!-- 右上角倒计时 -->
    <div v-if="totalCountdown > 0" class="corner-countdown">
      <div class="countdown-circle">
        <svg class="countdown-svg" viewBox="0 0 40 40">
          <circle 
            class="countdown-bg" 
            cx="20" 
            cy="20" 
            r="18"
          />
          <circle 
            class="countdown-progress" 
            cx="20" 
            cy="20" 
            r="18"
            :style="{ strokeDashoffset: progressOffset }"
          />
        </svg>
        <div class="countdown-text">{{ remainingTime }}</div>
      </div>
    </div>

    <!-- 右上角轻量级加载指示器 -->
    <div v-if="isGeneratingTags" class="loading-indicator">
      <div class="indicator-spinner"></div>
      <span class="indicator-text">生成中</span>
    </div>

    <!-- JS控制的掉落标签卡片 -->
    <div class="falling-area">
      <div 
        v-for="tag in tags" 
        :key="tag.id"
        class="falling-card js-animated"
        :class="{ 
          'dropped': droppedTags.includes(tag.id),
          'collected': selectedTags.includes(tag.id),
          'phase-hidden': tag.phase === 'hidden',
          'phase-fast-fall': tag.phase === 'fast_fall',
          'phase-parachute-open': tag.phase === 'parachute_open',
          'phase-slow-drift': tag.phase === 'slow_drift',
          'phase-fade-out': tag.phase === 'fade_out',
          'phase-complete': tag.phase === 'complete'
        }"
        :style="{
          left: `${tag.position.x}%`,
          top: `${tag.position.y}px`,
          opacity: tag.transform.opacity,
          transform: `scale(${tag.transform.scale}) rotate(${tag.transform.rotation + tag.driftOffset.rotation}deg) translateX(${tag.driftOffset.x}px) translateY(${tag.driftOffset.y}px)`,
          display: tag.phase === 'hidden' ? 'none' : 'flex'
        }"
        @click="collectTag(tag)"
      >
        <svg 
          class="parachute-icon js-controlled" 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          fill="none"
        >
          <!-- 收起状态的伞包 -->
          <g 
            class="parachute-closed"
            :style="{
              opacity: tag.parachute.closed.opacity,
              transform: `scale(${tag.parachute.closed.scale}) rotate(${tag.parachute.closed.rotation}deg)`
            }"
          >
            <rect x="13" y="4" width="6" height="8" rx="3" fill="#6b7280" opacity="0.7"/>
            <path d="M14 12L14 22" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M16 12L16 22" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
          </g>
          
          <!-- 展开状态的降落伞 -->
          <g 
            class="parachute-open"
            :style="{ 
              opacity: tag.parachute.open.opacity,
              transform: `scale(${tag.parachute.open.scale}) rotate(${tag.parachute.open.rotation}deg)`,
              transformOrigin: '16px 12px'
            }"
          >
            <!-- 伞面主体 -->
            <path d="M6 12C6 7 10.5 3 16 3C21.5 3 26 7 26 12" stroke="#6b7280" stroke-width="2" stroke-linecap="round" fill="none"/>
            <!-- 伞面分割线 -->
            <path d="M10 10C11.5 8.5 13.5 7.5 16 7.5C18.5 7.5 20.5 8.5 22 10" stroke="#6b7280" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
            <path d="M8 11.5C9.5 10.5 12 9.5 16 9.5C20 9.5 22.5 10.5 24 11.5" stroke="#6b7280" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
            <!-- 伞绳 -->
            <path d="M8 12L13 20" stroke="#6b7280" stroke-width="1" stroke-linecap="round"/>
            <path d="M12 11L14.5 20" stroke="#6b7280" stroke-width="1" stroke-linecap="round"/>
            <path d="M16 11L16 20" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M20 11L17.5 20" stroke="#6b7280" stroke-width="1" stroke-linecap="round"/>
            <path d="M24 12L19 20" stroke="#6b7280" stroke-width="1" stroke-linecap="round"/>
          </g>
          
          <!-- 载重点 -->
          <circle class="payload" cx="16" cy="22" r="1.5" fill="#6b7280"/>
        </svg>
        <div class="card-content">
          <div class="card-title">{{ tag.title }}</div>
        </div>
      </div>
    </div>

    <!-- 选中的标签和问题显示区域 -->
    <div v-if="(selectedTags.length > 0 || defaultSelectedTags.length > 0) && !isGeneratingTags" class="selected-tags-area">
      <!-- 选中的标签 -->
      <div class="selected-tags-container">
        <!-- 默认选择的标签 -->
        <div 
          v-for="defaultTag in defaultSelectedTags" 
          :key="'default-' + defaultTag.id"
          class="selected-tag default-tag"
          :title="'已有技能/习惯（自动选择）'"
        >
          {{ defaultTag.title }}
        </div>
        <!-- 手动选择的标签 -->
        <template v-for="tagId in selectedTags.filter(id => !defaultSelectedTags.some(dt => dt.id === id))" :key="'selected-' + tagId">
          <div 
            v-if="getTagById(tagId)?.title"
            class="selected-tag manual-tag"
          >
            {{ getTagById(tagId).title }}
          </div>
        </template>
      </div>
      
      <!-- 问题按钮 -->
      <button @click="proceedToNext" class="question-button">
        <div class="question-button-content">
          <div class="question-text">{{ query }}</div>
          <div class="proceed-hint">点击进入下一步 →</div>
        </div>
      </button>
    </div>

    <!-- 用户问题显示区域 -->
    <div v-if="!selectedTags.length && !defaultSelectedTags.length" class="user-question-area">
      <!-- <div class="question-label">当前分析问题：</div> -->
      <div class="question-content">{{ query }}</div>
      
      <!-- 加载状态提示 -->
      <div v-if="isGeneratingTags" class="loading-status">
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <div class="loading-message">正在分析您的问题并生成个性化发展目标</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'

const props = defineProps({
  query: {
    type: String,
    required: true
  },
  dynamicTags: {
    type: Object,
    default: () => ({})
  },
  aiGeneratedData: {
    type: Object,
    default: null
  },
  isGeneratingTags: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['complete', 'timeout', 'tags-generated'])

// 动画状态枚举
const ANIMATION_PHASES = {
  HIDDEN: 'hidden',
  FAST_FALL: 'fast_fall',
  PARACHUTE_OPEN: 'parachute_open',
  SLOW_DRIFT: 'slow_drift',
  FADE_OUT: 'fade_out',
  COMPLETE: 'complete'
}


// 检查位置是否与现有卡片重叠（包括正在动画中的卡片）
const checkCollision = (x, existingTags, buffer = 80) => {
  // 检查已生成的卡片
  for (const tag of existingTags) {
    if (tag.position && tag.position.x !== undefined) {
      const distance = Math.abs(x - tag.position.x)
      const minDistance = (CARD_CONFIG.width + buffer) / getContainerDimensions().width * 100
      if (distance < minDistance) {
        return true
      }
    }
  }
  
  // 检查正在下落的卡片
  if (tags.value && tags.value.length > 0) {
    for (const tag of tags.value) {
      if (tag.position && tag.position.x !== undefined && droppedTags.value.includes(tag.id)) {
        const distance = Math.abs(x - tag.position.x)
        const minDistance = (CARD_CONFIG.width + buffer) / getContainerDimensions().width * 100
        if (distance < minDistance) {
          return true
        }
      }
    }
  }
  
  return false
}

// 生成无重叠的随机位置
const generateRandomPosition = (existingTags = []) => {
  const positions = calculatePositions()
  let attempts = 0
  const maxAttempts = 50
  
  while (attempts < maxAttempts) {
    const randomPercent = positions.min_x_percent + 
      Math.random() * (positions.max_x_percent - positions.min_x_percent)
    
    const safePercent = Math.max(positions.min_x_percent, Math.min(randomPercent, positions.max_x_percent))
    
    // 检查是否与现有卡片重叠
    if (!checkCollision(safePercent, existingTags)) {
      return safePercent
    }
    
    attempts++
  }
  
  // 如果尝试多次仍然重叠，返回一个基于索引的固定位置
  const fallbackIndex = existingTags.length % 4
  const spacing = (positions.max_x_percent - positions.min_x_percent) / 4
  return positions.min_x_percent + fallbackIndex * spacing
}



// 生成卡片数据
const generateTags = (tagData) => {
  if (!tagData || !Array.isArray(tagData) || tagData.length === 0) {
    console.log('没有提供有效的标签数据，不生成卡片')
    return []
  }
  
  const positions = calculatePositions()
  const generatedTags = []
  
  // 逐个生成卡片，确保每个位置都不重叠
  tagData.forEach(tag => {
    const newTag = {
      ...tag,
      // 动画相关状态
      phase: ANIMATION_PHASES.HIDDEN,
      position: {
        x: generateRandomPosition(generatedTags),
        y: positions.start_y
      },
      transform: {
        scale: 0.9,
        rotation: 0,
        opacity: 0
      },
      parachute: {
        closed: { opacity: 1, scale: 1, rotation: 0 },
        open: { opacity: 0, scale: 0.3, rotation: 0 }
      },
      animationFrameId: null,
      driftOffset: { x: 0, y: 0, rotation: 0 }
    }
    
    generatedTags.push(newTag)
  })
  
  console.log('生成了', generatedTags.length, '个卡片')
  return generatedTags
}

// 开始卡片动画
const startCardAnimations = () => {
  if (!tags.value || tags.value.length === 0) {
    console.log('没有卡片可以开始动画')
    return
  }
  
  // 计算倒计时：第一张卡片立即开始 + 后续卡片间隔时间 + 最后一张卡片的完整动画时间
  const cardInterval = 2 // 每张卡片间隔2秒
  const animationDuration = 6 // 每个卡片动画持续6秒
  totalCountdown.value = (tags.value.length - 1) * cardInterval + animationDuration + 2 // +2秒缓冲
  remainingTime.value = totalCountdown.value
  
  // 开始倒计时
  startCountdown()
  
  // 立即显示并启动第一张卡片
  if (tags.value.length > 0) {
    const firstTag = tags.value[0]
    firstTag.phase = ANIMATION_PHASES.FAST_FALL
    firstTag.transform.opacity = 1
    firstTag.transform.scale = 1
    droppedTags.value.push(firstTag.id)
    startCardAnimation(firstTag)
  }
  
  // 启动后续卡片的定时掉落
  startCardDropping()
  
  console.log('开始卡片动画，总共', tags.value.length, '张卡片')
}

// 更新卡片内容
const updateTagsContent = (personalizedData) => {
  console.log('updateTagsContent 收到数据:', personalizedData)
  
  if (personalizedData && (personalizedData.developmentGoals || personalizedData.existingSkills)) {
    // 1. 处理 AI 返回的已有技能/习惯（自动选择）
    if (personalizedData.existingSkills && personalizedData.existingSkills.length > 0) {
      // 清空之前的默认选择
      defaultSelectedTags.value = []
      
      personalizedData.existingSkills.forEach(skill => {
        // 生成唯一ID
        const skillId = Date.now() + Math.random()
        defaultSelectedTags.value.push({
          id: skillId,
          title: skill.title,
          isDefault: true
        })
        // 自动添加到选中列表
        selectedTags.value.push(skillId)
      })
      console.log('AI 分析的已有技能/习惯（自动选择）:', defaultSelectedTags.value)
    }
    
    // 2. 根据发展目标生成卡片
    if (personalizedData.developmentGoals && personalizedData.developmentGoals.length > 0) {
      const developmentGoals = personalizedData.developmentGoals
      
      // 为每个目标创建一个卡片数据
      const cardData = developmentGoals.map((goal, index) => ({
        id: index + 1,
        title: goal.title,
        isDefault: goal.isDefault || false
      }))
      
      // 生成卡片
      tags.value = generateTags(cardData)
      
      // 生成标签映射
      const tagTitles = {}
      cardData.forEach((card) => {
        tagTitles[card.id] = card.title
      })
      
      // 发送标签数据给父组件
      emit('tags-generated', tagTitles)
      
      console.log('AI 分析的发展目标（显示卡片）:', developmentGoals)
      console.log('发送给父组件的标签映射:', tagTitles)
      
      // 开始卡片动画
      startCardAnimations()
    } else {
      console.log('没有收到 developmentGoals 数据')
    }
  }
}

const tags = ref([])
const selectedTags = ref([])  
const droppedTags = ref([])
const defaultSelectedTags = ref([]) // 存储默认选择的标签

// 倒计时相关
const totalCountdown = ref(0)
const remainingTime = ref(0)
const countdownTimer = ref(null)
const dropTimer = ref(null)

// 计算倒计时进度
const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 18
  if (totalCountdown.value === 0) return 0
  const progress = (totalCountdown.value - remainingTime.value) / totalCountdown.value
  return circumference * progress
})

// 缓动函数
const easeInQuart = (t) => t * t * t * t
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// 容器引用
const containerRef = ref(null)

// 获取容器尺寸
const getContainerDimensions = () => {
  const container = containerRef.value || document.querySelector('.falling-tags-container')
  if (container) {
    return {
      width: container.clientWidth,
      height: container.clientHeight
    }
  }
  // 如果容器还没有渲染，回退到窗口尺寸
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// 卡片相关常量
const CARD_CONFIG = {
  width: 240,
  height: 160,
  parachute_height: 24,
  screen_padding: 100
}

// 计算关键位置
const calculatePositions = () => {
  const container = getContainerDimensions()
  
  return {
    // 起始位置（只溢出50px，让卡片顶部刚好可见）
    start_y: -130,
    // 降落伞展开位置（容器高度的1/4处）
    parachute_open_y: container.height * 0.25,
    // 底部安全区域（避免与收集区域重叠）
    bottom_safe_y: container.height - 180,
    // 可用宽度范围
    min_x_percent: (CARD_CONFIG.screen_padding / container.width) * 100,
    max_x_percent: ((container.width - CARD_CONFIG.screen_padding - CARD_CONFIG.width) / container.width) * 100
  }
}

// 单个卡片的动画控制器
class CardAnimator {
  constructor(tag, onComplete) {
    this.tag = tag
    this.onComplete = onComplete
    this.startTime = Date.now()
    
    // 动态计算位置
    this.positions = calculatePositions()
    
    // 动态计算时间 - 基于实际距离，总时长约6秒
    const fallDistance = this.positions.parachute_open_y - this.positions.start_y
    const driftDistance = this.positions.bottom_safe_y - this.positions.parachute_open_y
    
    this.phaseDurations = {
      [ANIMATION_PHASES.FAST_FALL]: Math.max(1500, fallDistance * 6),    // 基于距离计算快速下落时间
      [ANIMATION_PHASES.PARACHUTE_OPEN]: 300,   // 0.3秒打开降落伞
      [ANIMATION_PHASES.SLOW_DRIFT]: Math.max(3500, driftDistance * 12), // 基于距离计算漂流时间
      [ANIMATION_PHASES.FADE_OUT]: 700        // 0.7秒消失
    }
    
    this.currentPhaseStart = 0
    this.driftStartTime = 0
  }

  updatePhase(newPhase) {
    if (this.tag.phase !== newPhase) {
      this.tag.phase = newPhase
      this.currentPhaseStart = Date.now()
      
      if (newPhase === ANIMATION_PHASES.SLOW_DRIFT) {
        this.driftStartTime = Date.now()
      }
    }
  }

  animate() {
    const now = Date.now()
    const totalElapsed = now - this.startTime
    
    // 根据总时间确定当前阶段
    if (totalElapsed < this.phaseDurations[ANIMATION_PHASES.FAST_FALL]) {
      this.updatePhase(ANIMATION_PHASES.FAST_FALL)
      this.animateFastFall(now)
    } else if (totalElapsed < this.phaseDurations[ANIMATION_PHASES.FAST_FALL] + this.phaseDurations[ANIMATION_PHASES.PARACHUTE_OPEN]) {
      this.updatePhase(ANIMATION_PHASES.PARACHUTE_OPEN)
      this.animateParachuteOpen(now)
    } else if (totalElapsed < this.phaseDurations[ANIMATION_PHASES.FAST_FALL] + this.phaseDurations[ANIMATION_PHASES.PARACHUTE_OPEN] + this.phaseDurations[ANIMATION_PHASES.SLOW_DRIFT]) {
      this.updatePhase(ANIMATION_PHASES.SLOW_DRIFT)
      this.animateSlowDrift(now)
    } else if (totalElapsed < Object.values(this.phaseDurations).reduce((a, b) => a + b, 0)) {
      this.updatePhase(ANIMATION_PHASES.FADE_OUT)
      this.animateFadeOut(now)
    } else {
      this.updatePhase(ANIMATION_PHASES.COMPLETE)
      this.onComplete()
      return false
    }
    
    return true
  }

  animateFastFall(now) {
    const progress = Math.min((now - this.startTime) / this.phaseDurations[ANIMATION_PHASES.FAST_FALL], 1)
    const easedProgress = easeInQuart(progress)
    
    // 从起始位置快速下落到降落伞展开位置
    const fallDistance = this.positions.parachute_open_y - this.positions.start_y
    this.tag.position.y = this.positions.start_y + fallDistance * easedProgress
    
    this.tag.transform.opacity = Math.min(progress * 2, 1)
    this.tag.transform.scale = 0.9 + 0.1 * progress
    
    // 伞包在快速下落时微微摆动
    this.tag.parachute.closed.scale = 1 + Math.sin(progress * Math.PI * 4) * 0.05
    this.tag.parachute.closed.rotation = Math.sin(progress * Math.PI * 6) * 2
  }

  animateParachuteOpen(now) {
    const progress = (now - this.currentPhaseStart) / this.phaseDurations[ANIMATION_PHASES.PARACHUTE_OPEN]
    
    // 降落伞打开动画
    this.tag.parachute.closed.opacity = 1 - progress
    this.tag.parachute.closed.scale = 1 - progress * 0.5
    
    this.tag.parachute.open.opacity = progress
    this.tag.parachute.open.scale = 0.3 + progress * 0.7
    
    // 卡片有轻微的减速反弹
    const bounceProgress = easeOutQuart(progress)
    this.tag.transform.scale = 1 + bounceProgress * 0.05
    
    // 在降落伞展开位置轻微下降
    this.tag.position.y = this.positions.parachute_open_y + bounceProgress * 20
  }

  animateSlowDrift(now) {
    const progress = (now - this.currentPhaseStart) / this.phaseDurations[ANIMATION_PHASES.SLOW_DRIFT]
    const driftTime = (now - this.driftStartTime) / 1000
    
    // 从降落伞展开位置匀速下降到底部安全区域
    const driftDistance = this.positions.bottom_safe_y - this.positions.parachute_open_y - 20
    this.tag.position.y = this.positions.parachute_open_y + 20 + driftDistance * progress
    
    // 左右漂移
    this.tag.driftOffset.x = Math.sin(driftTime * 0.8) * 15 + Math.cos(driftTime * 0.3) * 8
    this.tag.driftOffset.rotation = Math.sin(driftTime * 0.6) * 1.5
    
    // 降落伞摆动
    this.tag.parachute.open.rotation = Math.sin(driftTime * 0.7) * 3
    
    this.tag.transform.scale = 1
  }

  animateFadeOut(now) {
    const progress = (now - this.currentPhaseStart) / this.phaseDurations[ANIMATION_PHASES.FADE_OUT]
    
    this.tag.transform.opacity = 1 - easeInOutCubic(progress)
    this.tag.transform.scale = 1 - progress * 0.2
    
    // 继续缓慢下降到底部安全区域
    this.tag.position.y = this.positions.bottom_safe_y + progress * 40
  }
}

// 动画管理器
const cardAnimators = ref(new Map())

// 启动单个卡片动画
const startCardAnimation = (tag) => {
  const animator = new CardAnimator(tag, () => {
    // 动画完成回调
    cardAnimators.value.delete(tag.id)
  })
  
  cardAnimators.value.set(tag.id, animator)
  
  const animate = () => {
    const animator = cardAnimators.value.get(tag.id)
    if (animator && animator.animate()) {
      tag.animationFrameId = requestAnimationFrame(animate)
    }
  }
  
  animate()
}

// 方法
const collectTag = (tag) => {
  // 检查卡片是否已经完成掉落动画或处于消失状态
  if (tag.phase === ANIMATION_PHASES.FADE_OUT || 
      tag.phase === ANIMATION_PHASES.COMPLETE || 
      tag.transform.opacity <= 0.1) {
    return // 阻止已完成掉落的卡片被点击
  }
  
  if (!selectedTags.value.includes(tag.id)) {
    selectedTags.value.push(tag.id)
  }
}

const getTagById = (id) => {
  return tags.value.find(tag => tag.id === id)
}

const proceedToNext = () => {
  const totalSelections = selectedTags.value.length + defaultSelectedTags.value.length
  
  if (totalSelections > 0) {
    clearTimers()
    
    // 组合所有选择的标签信息
    const allSelectedTags = {
      manualSelected: selectedTags.value.filter(tagId => 
        !defaultSelectedTags.value.some(defaultTag => defaultTag.id === tagId)
      ),
      autoSelected: defaultSelectedTags.value,
      totalCount: totalSelections
    }
    
    console.log('发送完整选择结果:', allSelectedTags)
    emit('complete', allSelectedTags)
  }
}

const startCountdown = () => {
  countdownTimer.value = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearTimers()
      
      // 组合所有选择的标签信息（包括超时时的选择）
      const allSelectedTags = {
        manualSelected: selectedTags.value.filter(tagId => 
          !defaultSelectedTags.value.some(defaultTag => defaultTag.id === tagId)
        ),
        autoSelected: defaultSelectedTags.value,
        totalCount: selectedTags.value.length + defaultSelectedTags.value.length
      }
      
      emit('timeout', allSelectedTags)
    }
  }, 1000)
}

const startCardDropping = () => {
  let index = 1 // 从第二张卡片开始，因为第一张已经启动了
  const cardInterval = 2000 // 每张卡片间隔2秒，避免重叠
  
  const dropNextCard = () => {
    if (index >= tags.value.length || remainingTime.value <= 0) {
      return
    }
    
    const tag = tags.value[index]
    droppedTags.value.push(tag.id)
    
    // 启动该卡片的JS动画
    nextTick(() => {
      startCardAnimation(tag)
    })
    
    index++
    
    // 安排下一张卡片
    if (index < tags.value.length) {
      dropTimer.value = setTimeout(dropNextCard, cardInterval)
    }
  }
  
  // 2秒后开始第二张卡片
  if (tags.value.length > 1) {
    dropTimer.value = setTimeout(dropNextCard, cardInterval)
  }
}

const clearTimers = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  if (dropTimer.value) {
    clearTimeout(dropTimer.value)
    dropTimer.value = null
  }
  
  // 清理所有动画
  tags.value.forEach(tag => {
    if (tag.animationFrameId) {
      cancelAnimationFrame(tag.animationFrameId)
    }
  })
  cardAnimators.value.clear()
}

// 窗口大小变化处理
const handleResize = () => {
  // 重新计算所有还在动画中的卡片的位置参数
  cardAnimators.value.forEach(animator => {
    animator.positions = calculatePositions()
  })
}

// 初始化组件
const initializeComponent = async () => {
  // 初始化时不生成任何卡片，等待AI数据加载完成
  tags.value = []
  selectedTags.value = []
  droppedTags.value = []
  defaultSelectedTags.value = []
  
  // 重置倒计时
  totalCountdown.value = 0
  remainingTime.value = 0
  
  console.log('组件初始化完成，等待AI数据加载...')
}

// 生命周期
onMounted(() => {
  // 等待DOM完全渲染后再初始化
  nextTick(() => {
    initializeComponent()
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearTimers()
  window.removeEventListener('resize', handleResize)
})

// 监听AI生成的数据
watch(() => props.aiGeneratedData, (newData) => {
  if (newData) {
    console.log('收到父组件传来的AI数据:', newData)
    updateTagsContent(newData)
  } else if (newData === null) {
    console.log('AI数据被重置')
    // 重置状态
    tags.value = []
    selectedTags.value = []
    droppedTags.value = []
    defaultSelectedTags.value = []
    totalCountdown.value = 0
    remainingTime.value = 0
    clearTimers()
  }
}, { deep: true })

// 监听loading状态
watch(() => props.isGeneratingTags, (isLoading) => {
  console.log('Loading状态变化:', isLoading)
  if (!isLoading && !tags.value.length && (!props.aiGeneratedData || !props.aiGeneratedData.developmentGoals)) {
    console.log('AI加载完成但没有有效数据')
  }
})
</script>

<style scoped>
.falling-tags-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: #fafafa;
  overflow: hidden;
  z-index: 1000;
}

/* 右上角轻量级加载指示器 */
.loading-indicator {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 24px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1002;
}

.indicator-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.indicator-text {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

/* 底部加载状态 */
.loading-status {
  margin-top: 20px;
  text-align: center;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 12px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
  animation: dotPulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

/* 右上角倒计时 */
.corner-countdown {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1001;
  pointer-events: none;
}

.countdown-circle {
  position: relative;
  width: 60px;
  height: 60px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.countdown-bg {
  fill: none;
  stroke: #f0f0f0;
  stroke-width: 2;
}

.countdown-progress {
  fill: none;
  stroke: #2563eb;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 113;
  transition: stroke-dashoffset 1s linear;
}

.countdown-text {
  font-size: 16px;
  font-weight: 600;
  color: #2563eb;
  z-index: 1;
}

/* 掉落区域 */
.falling-area {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* JS控制的掉落卡片 */
.falling-card.js-animated {
  position: absolute;
  width: 240px;
  background: #ffffff;
  border: 3px solid #e5e5e5;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  will-change: transform, opacity, top, left;
}

.falling-card.collected {
  animation: collectAnimation 0.6s ease-out forwards;
  z-index: 200;
}

.parachute-icon.js-controlled {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  color: #6b7280;
}

.card-content {
  padding: 6px 16px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #111111;
  line-height: 1.3;
  letter-spacing: -0.01em;
  text-align: center;
}

.falling-card:hover:not(.collected):not(.phase-fade-out):not(.phase-complete) {
  border-color: #2563eb;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.3);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 完成掉落动画的卡片样式 */
.falling-card.phase-fade-out,
.falling-card.phase-complete {
  pointer-events: none;
  cursor: default;
}

.falling-card.phase-complete {
  display: none !important;
}

/* 选中标签和问题显示区域 */
.selected-tags-area {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 12px;
  padding: 16px 20px;
  z-index: 10;
  max-width: 600px;
  width: calc(100% - 40px);
}

.selected-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.selected-tag {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  animation: slideInUp 0.3s ease-out;
}

.selected-tag.default-tag {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #6b7280;
  position: relative;
}

.selected-tag.default-tag::after {
  content: '✓';
  position: absolute;
  right: -8px;
  top: -8px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.selected-tag.manual-tag {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.question-button {
  width: 100%;
  background: #111111;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-button:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.question-button-content {
  text-align: left;
}

.question-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
}

.proceed-hint {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 400;
}

/* JS动画替代了复杂的CSS关键帧动画 */

@keyframes collectAnimation {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  30% {
    transform: scale(1.2);
    opacity: 0.9;
  }
  70% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideInUp {
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 用户问题显示区域 */
.user-question-area {
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
  max-width: 600px;
  width: calc(100% - 40px);
}

.question-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
}

.question-content {
  font-size: 14px;
  color: #111111;
  font-weight: 500;
  line-height: 1.4;
}

/* 所有复杂动画现在由JavaScript精确控制 */

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-indicator {
    top: 16px;
    right: 16px;
    padding: 6px 12px;
  }
  
  .indicator-spinner {
    width: 14px;
    height: 14px;
  }
  
  .indicator-text {
    font-size: 11px;
  }
  
  .loading-message {
    font-size: 12px;
  }
  
  .corner-countdown {
    top: 16px;
    right: 16px;
  }
  
  .countdown-circle {
    width: 50px;
    height: 50px;
  }
  
  .countdown-text {
    font-size: 14px;
  }
  
  .falling-card {
    width: 200px;
    height: 140px;
  }
  
  .card-content {
    padding: 4px 12px;
    gap: 4px;
  }
  
  .card-title {
    font-size: 20px;
  }
  
  .card-description {
    font-size: 17px;
  }
  
  .parachute-icon {
    top: -20px;
  }
  
  .selected-tags-area,
  .user-question-area {
    bottom: 16px;
    width: calc(100% - 32px);
    padding: 14px 16px;
  }
  
  .selected-tags-container {
    margin-bottom: 10px;
  }
  
  .selected-tag {
    font-size: 12px;
    padding: 5px 10px;
  }
  
  .question-text {
    font-size: 13px;
  }
  
  .proceed-hint {
    font-size: 11px;
  }
  
  .question-label {
    font-size: 11px;
  }
  
  .question-content {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .loading-indicator {
    top: 12px;
    right: 12px;
    padding: 5px 10px;
  }
  
  .indicator-spinner {
    width: 12px;
    height: 12px;
  }
  
  .indicator-text {
    font-size: 10px;
  }
  
  .loading-message {
    font-size: 11px;
  }
  
  .loading-status {
    padding: 12px;
  }
  
  .corner-countdown {
    top: 12px;
    right: 12px;
  }
  
  .countdown-circle {
    width: 44px;
    height: 44px;
  }
  
  .countdown-text {
    font-size: 12px;
  }
  
  .falling-card {
    width: 180px;
    height: 130px;
  }
  
  .card-content {
    padding: 3px 10px;
    gap: 3px;
  }
  
  .card-title {
    font-size: 18px;
  }
  
  .card-description {
    font-size: 16px;
    line-height: 1.3;
  }
  
  .parachute-icon {
    top: -18px;
  }
  
  .selected-tags-area,
  .user-question-area {
    bottom: 12px;
    width: calc(100% - 24px);
    padding: 12px 14px;
  }
  
  .selected-tags-container {
    margin-bottom: 8px;
  }
  
  .selected-tag {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .question-text {
    font-size: 12px;
  }
  
  .proceed-hint {
    font-size: 10px;
  }
  
  .question-label {
    font-size: 10px;
  }
  
  .question-content {
    font-size: 12px;
  }
}

</style>