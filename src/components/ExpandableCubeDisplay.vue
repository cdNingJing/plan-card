<template>
  <div class="expandable-cube-display" :class="{ 
    expanded: isExpanded,
    animating: isAnimating,
    preparing: animationPhase === 'preparing',
    revealing: animationPhase === 'revealing'
  }">
    <!-- 收起状态：3D魔方 -->
    <div class="cube-container" 
         v-if="!isExpanded && !showDetailContent" 
         ref="cubeContainerRef"
         @click="handleContainerClick"
         @mousedown="startDrag"
         @touchstart="startDrag">
      <div class="cube" 
           :style="{ transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)` }">
        <!-- 正面 -->
        <div class="cube-face front" :class="{ active: activeFace === 'front' }" 
             @click.stop="handleFaceClick('front')"
             @mousedown="startDrag"
             @touchstart="startDrag">
          <div class="face-content">
                         <div class="face-icon">
               <Calendar :size="iconSize" />
             </div>
            <div class="face-title">现在</div>
            <div class="face-subtitle">当前任务</div>
          </div>
        </div>
        
        <!-- 背面 -->
        <div class="cube-face back" :class="{ active: activeFace === 'back' }" 
             @click.stop="handleFaceClick('back')"
             @mousedown="startDrag"
             @touchstart="startDrag">
          <div class="face-content">
                         <div class="face-icon">
               <ClipboardList :size="iconSize" />
             </div>
            <div class="face-title">计划</div>
            <div class="face-subtitle">待办事项</div>
          </div>
        </div>
        
        <!-- 左面（历史） -->
        <div class="cube-face left" :class="{ active: activeFace === 'left' }" 
             @click.stop="handleFaceClick('left')"
             @mousedown="startDrag"
             @touchstart="startDrag">
          <div class="face-content">
                         <div class="face-icon">
               <BookOpen :size="iconSize" />
             </div>
            <div class="face-title">历史</div>
            <div class="face-subtitle">已完成</div>
          </div>
        </div>
        
        <!-- 右面（未来） -->
        <div class="cube-face right" :class="{ active: activeFace === 'right' }" 
             @click.stop="handleFaceClick('right')"
             @mousedown="startDrag"
             @touchstart="startDrag">
          <div class="face-content">
                         <div class="face-icon">
               <Rocket :size="iconSize" />
             </div>
            <div class="face-title">未来</div>
            <div class="face-subtitle">目标规划</div>
          </div>
        </div>
        
        <!-- 上面 -->
        <div class="cube-face top" :class="{ active: activeFace === 'top' }" 
             @click.stop="handleFaceClick('top')"
             @mousedown="startDrag"
             @touchstart="startDrag">
          <div class="face-content">
                         <div class="face-icon">
               <Star :size="iconSize" />
             </div>
            <div class="face-title">成就</div>
            <div class="face-subtitle">里程碑</div>
          </div>
        </div>
        
        <!-- 下面 -->
        <div class="cube-face bottom" :class="{ active: activeFace === 'bottom' }" 
             @click.stop="handleFaceClick('bottom')"
             @mousedown="startDrag"
             @touchstart="startDrag">
          <div class="face-content">
                         <div class="face-icon">
               <Settings :size="iconSize" />
             </div>
            <div class="face-title">设置</div>
            <div class="face-subtitle">配置选项</div>
          </div>
        </div>
      </div>
      

    </div>
    
    
    <!-- 详细内容展示区域 -->
    <div class="detail-content-container" v-if="showDetailContent">
      <!-- 关闭按钮 -->
      <div class="close-button" @click="closeDetailView">
        <div class="close-icon">
          <span></span>
          <span></span>
        </div>
      </div>
      
      <!-- Swiper内容区域 -->
      <div class="swiper-detail-container">
        
        <Swiper
          :initial-slide="currentDetailSlide"
          @slide-change="onSlideChange"
          class="detail-swiper"
        >
          <!-- 历史页面 -->
          <SwiperSlide>
            <div class="detail-content">
              <div class="history-items">
                <div v-for="item in historyItems" :key="item.id" class="expandable-item" :class="{ expanded: isItemExpanded(item.id) }">
                  <!-- 抽拉盒子头部 -->
                  <div class="item-header" @click="toggleItemExpansion(item.id)">
                    <div class="item-icon">
                      <component :is="item.icon" :size="20" />
                    </div>
                    <div class="item-summary">
                      <h4>{{ item.title }}</h4>
                      <p>{{ item.description }}</p>
                      <span class="item-time">{{ item.time }}</span>
                    </div>
                    <div class="expand-icon" :class="{ rotated: isItemExpanded(item.id) }">
                      <ChevronDown :size="20" />
                    </div>
                  </div>
                  
                  <!-- 抽拉盒子展开内容 -->
                  <div class="item-content" v-if="isItemExpanded(item.id)">
                    <div class="content-section">
                      <label>详细信息：</label>
                      <p class="details-text">{{ item.details }}</p>
                    </div>
                    
                    <div class="content-section">
                      <label>标签：</label>
                      <div class="tags-container">
                        <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
                      </div>
                    </div>
                    
                    <div class="content-section">
                      <label>备注：</label>
                      <textarea 
                        v-model="item.notes" 
                        @input="handleTextareaInput(item.id, $event.target.value)"
                        placeholder="添加备注..." 
                        class="notes-textarea">
                      </textarea>
                    </div>
                    
                    <div class="content-actions">
                      <button @click="handleItemAction(item.id, 'edit')" class="action-btn edit-btn">
                        <Edit3 :size="16" />
                        编辑
                      </button>
                      <button @click="handleItemAction(item.id, 'save')" class="action-btn save-btn">
                        <Save :size="16" />
                        保存
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
          
          <!-- 当前页面 -->
          <SwiperSlide>
            <div class="detail-content">
              <div class="current-items">
                <div v-for="task in currentTasks" :key="task.id" class="expandable-item" :class="{ expanded: isItemExpanded(task.id) }">
                  <!-- 抽拉盒子头部 -->
                  <div class="item-header" @click="toggleItemExpansion(task.id)">
                    <div class="task-priority" :class="`priority-${task.priority}`"></div>
                    <div class="item-summary">
                      <h4>{{ task.title }}</h4>
                      <div class="progress-info">
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: `${task.progress}%` }"></div>
                        </div>
                        <span class="progress-text">{{ task.progress }}%</span>
                      </div>
                    </div>
                    <div class="expand-icon" :class="{ rotated: isItemExpanded(task.id) }">
                      <ChevronDown :size="20" />
                    </div>
                  </div>
                  
                  <!-- 抽拉盒子展开内容 -->
                  <div class="item-content" v-if="isItemExpanded(task.id)">
                    <div class="content-section">
                      <label>详细信息：</label>
                      <p class="details-text">{{ task.details }}</p>
                    </div>
                    
                    <div class="content-section">
                      <label>任务状态：</label>
                      <div class="status-container">
                        <span class="status" :class="`status-${task.status}`">{{ task.statusText }}</span>
                        <span class="priority-text">优先级: {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}</span>
                      </div>
                    </div>
                    
                    <div class="content-section">
                      <label>标签：</label>
                      <div class="tags-container">
                        <span v-for="tag in task.tags" :key="tag" class="tag">{{ tag }}</span>
                      </div>
                    </div>
                    
                    <div class="content-section">
                      <label>备注：</label>
                      <textarea 
                        v-model="task.notes" 
                        @input="handleTextareaInput(task.id, $event.target.value)"
                        placeholder="添加任务备注..." 
                        class="notes-textarea">
                      </textarea>
                    </div>
                    
                    <div class="content-actions">
                      <button @click="handleItemAction(task.id, 'start')" class="action-btn start-btn">
                        开始任务
                      </button>
                      <button @click="handleItemAction(task.id, 'complete')" class="action-btn complete-btn">
                        完成
                      </button>
                      <button @click="handleItemAction(task.id, 'save')" class="action-btn save-btn">
                        <Save :size="16" />
                        保存
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
          
          <!-- 未来页面 -->
          <SwiperSlide>
            <div class="detail-content">
              <div class="future-items">
                <div v-for="goal in futureGoals" :key="goal.id" class="expandable-item" :class="{ expanded: isItemExpanded(goal.id) }">
                  <!-- 抽拉盒子头部 -->
                  <div class="item-header" @click="toggleItemExpansion(goal.id)">
                    <div class="item-icon">
                      <component :is="goal.icon" :size="20" />
                    </div>
                    <div class="item-summary">
                      <h4>{{ goal.title }}</h4>
                      <p>{{ goal.description }}</p>
                      <div class="goal-meta">
                        <span class="deadline">{{ goal.deadline }}</span>
                        <span class="progress">{{ goal.progress }}%</span>
                      </div>
                    </div>
                    <div class="expand-icon" :class="{ rotated: isItemExpanded(goal.id) }">
                      <ChevronDown :size="20" />
                    </div>
                  </div>
                  
                  <!-- 抽拉盒子展开内容 -->
                  <div class="item-content" v-if="isItemExpanded(goal.id)">
                    <div class="content-section">
                      <label>详细信息：</label>
                      <p class="details-text">{{ goal.details }}</p>
                    </div>
                    
                    <div class="content-section">
                      <label>进度追踪：</label>
                      <div class="progress-section">
                        <div class="progress-bar-large">
                          <div class="progress-fill" :style="{ width: `${goal.progress}%` }"></div>
                        </div>
                        <span class="progress-percentage">{{ goal.progress }}% 完成</span>
                      </div>
                    </div>
                    
                    <div class="content-section">
                      <label>标签：</label>
                      <div class="tags-container">
                        <span v-for="tag in goal.tags" :key="tag" class="tag">{{ tag }}</span>
                      </div>
                    </div>
                    
                    <div class="content-section">
                      <label>备注：</label>
                      <textarea 
                        v-model="goal.notes" 
                        @input="handleTextareaInput(goal.id, $event.target.value)"
                        placeholder="添加目标备注..." 
                        class="notes-textarea">
                      </textarea>
                    </div>
                    
                    <div class="content-actions">
                      <button @click="handleItemAction(goal.id, 'plan')" class="action-btn plan-btn">
                        制定计划
                      </button>
                      <button @click="handleItemAction(goal.id, 'update')" class="action-btn update-btn">
                        更新进度
                      </button>
                      <button @click="handleItemAction(goal.id, 'save')" class="action-btn save-btn">
                        <Save :size="16" />
                        保存
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar, ClipboardList, BookOpen, Rocket, Star, Settings, Check, FileText, Target, GraduationCap, Briefcase, Home, ChevronDown, Save, Edit3 } from 'lucide-vue-next'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

// 组件状态
const isExpanded = ref(false)
const activeFace = ref('front')
const currentSlide = ref(1) // 默认显示当前页面

// 简化的动画状态
const isAnimating = ref(false)
const animationPhase = ref('idle') // 'idle', 'preparing', 'revealing'
const selectedFace = ref(null)
const showDetailContent = ref(false)

// 详细页面状态
const currentDetailSlide = ref(1) // 默认显示中间页面

// 抽拉盒子展开状态管理
const expandedItems = ref(new Set())

// 图标大小 - 手机屏幕专用
const iconSize = 24

// 菱形旋转状态 - 通过拖拽控制
const cubeRotation = ref({
  x: -20,  // 初始X轴角度 - 向下倾斜20度显示顶部
  y: 35    // 初始Y轴角度 - 向右旋转35度显示三个面
})

// 拖拽状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const dragThreshold = 2 // 降低最小拖拽距离阈值，提高灵敏度
const isDragStarted = ref(false) // 是否已开始拖拽
const cubeContainerRef = ref(null)

// 幻灯片数据
const slides = [
  { name: 'history', title: '历史记录' },
  { name: 'current', title: '当前任务' },
  { name: 'future', title: '未来规划' }
]

// 历史数据
const historyItems = ref([
  {
    id: 'history_1',
    icon: Check,
    title: '完成项目规划',
    time: '2小时前',
    description: '制定了详细的项目时间表和里程碑',
    notes: '',
    tags: ['项目管理', '规划'],
    details: '详细分析了项目需求，制定了12个关键里程碑，预计项目周期为6个月。'
  },
  {
    id: 'history_2',
    icon: FileText,
    title: '撰写技术文档',
    time: '昨天',
    description: '完成了API接口文档的编写',
    notes: '',
    tags: ['技术文档', 'API'],
    details: '编写了30个API接口的详细文档，包括请求参数、响应格式和错误代码说明。'
  },
  {
    id: 'history_3',
    icon: Target,
    title: '达成月度目标',
    time: '3天前',
    description: '成功完成了本月的所有KPI指标',
    notes: '',
    tags: ['目标达成', 'KPI'],
    details: '超额完成了销售目标的110%，客户满意度达到95%，团队效率提升了20%。'
  },
  {
    id: 'history_4',
    icon: BookOpen,
    title: '学习新技术',
    time: '上周',
    description: '掌握了Vue 3的Composition API',
    notes: '',
    tags: ['学习', 'Vue3'],
    details: '系统学习了Vue 3的Composition API，完成了3个实战项目，掌握了响应式系统的核心原理。'
  }
])

// 当前任务数据
const currentTasks = ref([
  {
    id: 'current_1',
    title: '完成用户界面设计',
    priority: 'high',
    progress: 75,
    status: 'in-progress',
    statusText: '进行中',
    notes: '',
    tags: ['UI设计', '前端'],
    details: '设计用户注册、登录、主页面和个人中心的界面，采用Material Design风格。'
  },
  {
    id: 'current_2',
    title: '后端API开发',
    priority: 'medium',
    progress: 45,
    status: 'pending',
    statusText: '待开始',
    notes: '',
    tags: ['后端', 'API开发'],
    details: '开发用户管理、数据处理、文件上传等核心API接口，使用Node.js + Express框架。'
  },
  {
    id: 'current_3',
    title: '数据库优化',
    priority: 'low',
    progress: 20,
    status: 'in-progress',
    statusText: '进行中',
    notes: '',
    tags: ['数据库', '性能优化'],
    details: '优化查询性能，添加索引，重构复杂查询语句，预计提升30%查询速度。'
  }
])

// 未来目标数据
const futureGoals = ref([
  {
    id: 'future_1',
    icon: GraduationCap,
    title: '获得高级认证',
    deadline: '3个月后',
    description: '考取AWS解决方案架构师认证',
    progress: 30,
    notes: '',
    tags: ['认证', 'AWS', '学习'],
    details: '系统学习AWS云服务架构，完成在线课程和实验室练习，预计投入150小时学习时间。'
  },
  {
    id: 'future_2',
    icon: Briefcase,
    title: '晋升技术主管',
    deadline: '6个月后',
    description: '提升管理能力，带领团队完成重大项目',
    progress: 60,
    notes: '',
    tags: ['职业发展', '管理', '领导力'],
    details: '参与领导力培训，承担更多项目管理责任，建立团队文化，目标管理8-10人团队。'
  },
  {
    id: 'future_3',
    icon: Home,
    title: '购买第一套房',
    deadline: '2年后',
    description: '积累足够的首付资金',
    progress: 25,
    notes: '',
    tags: ['理财', '房产', '投资'],
    details: '制定储蓄计划，每月存储收入的40%，研究房产市场，目标首付100万元。'
  }
])

// 处理容器点击事件 - 只有在没有拖拽时才展开
const handleContainerClick = (event) => {
  console.log('🖱️ handleContainerClick called', {
    dragStarted: isDragStarted.value,
    target: event.target?.className
  })
  
  if (!isDragStarted.value) {
    console.log('✅ Container click - calling toggleExpand')
    toggleExpand()
  } else {
    console.log('⚠️ Container click ignored - drag was started')
  }
}

// 处理面点击事件 - 确保点击和拖拽分离
const handleFaceClick = (face) => {
  console.log('👆 handleFaceClick called', {
    face: face,
    isAnimating: isAnimating.value,
    dragStarted: isDragStarted.value
  })
  
  // 只有在没有动画且没有发生拖拽的情况下才处理点击
  if (!isAnimating.value && !isDragStarted.value) {
    console.log('✅ Face click accepted - starting animation')
    selectedFace.value = face
    startFaceExpansionAnimation(face)
  } else {
    console.log('⚠️ Face click ignored', {
      animating: isAnimating.value,
      dragStarted: isDragStarted.value
    })
  }
}

// 设置活动面 - 通过旋转到特定角度显示对应面
const setActiveFace = (face) => {
  activeFace.value = face
  
  // 平滑旋转到对应面
  switch (face) {
    case 'front':
      cubeRotation.value = { x: -20, y: 35 }
      break
    case 'back':
      cubeRotation.value = { x: 0, y: 180 }
      break
    case 'left':
      cubeRotation.value = { x: 0, y: -90 }
      break
    case 'right':
      cubeRotation.value = { x: 0, y: 90 }
      break
    case 'top':
      cubeRotation.value = { x: -90, y: 0 }
      break
    case 'bottom':
      cubeRotation.value = { x: 90, y: 0 }
      break
  }
}

// 简化的面展开动画 - 直接跳转到详细内容
const startFaceExpansionAnimation = (face) => {
  console.log('🎬 startFaceExpansionAnimation called', {
    face: face,
    isAnimating: isAnimating.value,
    showDetailContent: showDetailContent.value
  })
  
  if (isAnimating.value) {
    console.log('⚠️ Animation blocked - already animating')
    return
  }
  
  isAnimating.value = true
  selectedFace.value = face
  setInitialSlideFromFace(face)
  
  console.log('🎭 Animation phase: preparing')
  // 简单的淡出魔方，淡入详细内容
  animationPhase.value = 'preparing'
  
  setTimeout(() => {
    console.log('🎭 Animation phase: revealing')
    // 直接显示详细内容，跳过中间状态
    animationPhase.value = 'revealing'
    showDetailContent.value = true
    
    console.log('✅ Detail content should now be visible', {
      showDetailContent: showDetailContent.value,
      selectedFace: selectedFace.value,
      initialSlide: currentDetailSlide.value
    })
    
    // 动画完成
    setTimeout(() => {
      isAnimating.value = false
      console.log('🏁 Animation complete')
    }, 400)
  }, 300)
}

// 切换展开状态
const toggleExpand = () => {
  if (isAnimating.value) return // 动画进行中不允许切换
  
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    // 展开时重置到当前页面
    currentSlide.value = 1
  }
}

// 导航到指定幻灯片
const goToSlide = (index) => {
  currentSlide.value = index
}

// 上一张幻灯片
const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

// 下一张幻灯片
const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  }
}

// 获取面的标题
const getFaceTitle = (face) => {
  const titles = {
    front: '现在',
    back: '计划', 
    left: '历史',
    right: '未来',
    top: '成就',
    bottom: '设置'
  }
  return titles[face] || '未知'
}

// 获取面的副标题
const getFaceSubtitle = (face) => {
  const subtitles = {
    front: '当前任务',
    back: '待办事项', 
    left: '已完成',
    right: '目标规划',
    top: '里程碑',
    bottom: '配置选项'
  }
  return subtitles[face] || '未知'
}

// 获取面的图标组件
const getCurrentFaceIcon = (face) => {
  const icons = {
    front: Calendar,
    back: ClipboardList,
    left: BookOpen,
    right: Rocket,
    top: Star,
    bottom: Settings
  }
  return icons[face] || Calendar
}

// 关闭详细视图
const closeDetailView = () => {
  console.log('❌ closeDetailView called')
  showDetailContent.value = false
  isAnimating.value = false
  animationPhase.value = 'idle'
  selectedFace.value = null
  currentDetailSlide.value = 1
  console.log('✅ Detail view closed, back to cube view')
}

// 根据选择的面设置初始滑动位置
const setInitialSlideFromFace = (face) => {
  if (face === 'left') {
    currentDetailSlide.value = 0 // 历史页面
  } else if (face === 'right') {
    currentDetailSlide.value = 2 // 未来页面
  } else {
    currentDetailSlide.value = 1 // 当前页面（默认）
  }
}

// Swiper滑动变化处理
const onSlideChange = (swiper) => {
  currentDetailSlide.value = swiper.activeIndex
}

// 切换抽拉盒子展开状态
const toggleItemExpansion = (itemId) => {
  const newSet = new Set(expandedItems.value)
  if (newSet.has(itemId)) {
    newSet.delete(itemId)
  } else {
    newSet.add(itemId)
  }
  expandedItems.value = newSet
}

// 检查项目是否展开
const isItemExpanded = (itemId) => {
  return expandedItems.value.has(itemId)
}

// 处理文本域输入
const handleTextareaInput = (itemId, value) => {
  console.log(`文本域输入 - 项目${itemId}: ${value}`)
}

// 处理按钮点击
const handleItemAction = (itemId, action) => {
  console.log(`按钮点击 - 项目${itemId}: ${action}`)
}

// 重置魔方到初始状态
const resetCube = () => {
  showDetailContent.value = false
  isAnimating.value = false
  animationPhase.value = 'idle'
  selectedFace.value = null
  currentDetailSlide.value = 1
  isExpanded.value = false
  activeFace.value = 'front'
  cubeRotation.value = { x: -20, y: 35 }
  
  // 清除所有定时器，确保动画完全停止
  clearTimeout()
}

// 暴露给父组件的方法
defineExpose({
  resetCube
})

// 拖拽相关函数
const startDrag = (event) => {
  console.log('🎯 startDrag called', {
    eventType: event.type,
    target: event.target?.className,
    containerExists: !!cubeContainerRef.value,
    targetTag: event.target?.tagName
  })
  
  // 确保拖拽只在立方体容器或面内开始
  const container = cubeContainerRef.value
  if (!container || !container.contains(event.target)) {
    console.log('❌ startDrag aborted - container check failed')
    return
  }
  
  event.preventDefault()
  event.stopPropagation() // 防止事件冒泡到其他滑动处理器
  
  isDragging.value = true
  isDragStarted.value = false
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  
  dragStart.value = { x: clientX, y: clientY }
  
  console.log('✅ startDrag setup complete', {
    isDragging: isDragging.value,
    startPos: dragStart.value,
    eventType: event.type,
    threshold: dragThreshold,
    currentRotation: cubeRotation.value
  })
  
  // 添加全局事件监听 - 确保触摸事件优先级
  if (event.type === 'touchstart') {
    document.addEventListener('touchmove', handleDrag, { passive: false })
    document.addEventListener('touchend', endDrag, { passive: false })
    document.addEventListener('touchcancel', endDrag, { passive: false })
    console.log('📱 Touch event listeners added')
  } else {
    document.addEventListener('mousemove', handleDrag, { passive: false })
    document.addEventListener('mouseup', endDrag, { passive: false })
    console.log('🖱️ Mouse event listeners added')
  }
}

const handleDrag = (event) => {
  console.log('📱 handleDrag triggered', { 
    eventType: event.type, 
    isDragging: isDragging.value,
    timestamp: Date.now() 
  })
  
  if (!isDragging.value) {
    console.log('⚠️ handleDrag called but isDragging is false')
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  
  const deltaX = clientX - dragStart.value.x
  const deltaY = clientY - dragStart.value.y
  
  // 检查是否超过拖拽阈值
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  
  console.log('🔄 handleDrag processing', {
    eventType: event.type,
    currentPos: { x: clientX, y: clientY },
    delta: { x: deltaX, y: deltaY },
    distance: distance,
    threshold: dragThreshold,
    dragStarted: isDragStarted.value
  })
  
  if (distance > dragThreshold) {
    if (!isDragStarted.value) {
      console.log('🚀 Drag threshold exceeded - starting rotation')
    }
    isDragStarted.value = true
  }
  
  // 只有超过阈值才开始旋转
  if (isDragStarted.value) {
    const oldRotation = { ...cubeRotation.value }
    
    // 更新旋转角度 - 提高敏感度
    cubeRotation.value.y += deltaX * 0.8  // 从0.5增加到0.8
    cubeRotation.value.x -= deltaY * 0.8  // 从0.5增加到0.8
    
    // 限制X轴旋转范围，防止翻转过头
    cubeRotation.value.x = Math.max(-90, Math.min(90, cubeRotation.value.x))
    
    console.log('🔄 Cube rotation updated', {
      oldRotation,
      newRotation: { ...cubeRotation.value },
      deltaApplied: { x: deltaX * 0.8, y: deltaY * 0.8 }
    })
    
    dragStart.value = { x: clientX, y: clientY }
  }
}

const endDrag = (event) => {
  console.log('🛑 endDrag called', {
    eventType: event?.type,
    wasDragging: isDragging.value,
    dragStarted: isDragStarted.value
  })
  
  // 如果没有发生实际拖拽（只是touchstart+touchend），将其视为点击
  const wasClick = !isDragStarted.value && isDragging.value
  
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  isDragging.value = false
  
  // 如果是点击，立即处理
  if (wasClick) {
    console.log('🖱️ Detected as click, finding face to expand')
    // 查找被点击的面 - 可能点击的是face-content或其他子元素
    let targetElement = event?.target
    let faceElement = null
    
    // 向上查找直到找到cube-face元素
    while (targetElement && !faceElement) {
      if (targetElement.classList && targetElement.classList.contains('cube-face')) {
        faceElement = targetElement
        break
      }
      targetElement = targetElement.parentElement
    }
    
    if (faceElement) {
      const faceClasses = faceElement.className.split(' ')
      const face = faceClasses.find(cls => ['front', 'back', 'left', 'right', 'top', 'bottom'].includes(cls))
      if (face) {
        console.log('🎯 Triggering face click for:', face)
        handleFaceClick(face)
      } else {
        console.log('⚠️ Face element found but no face class identified:', faceClasses)
      }
    } else {
      console.log('⚠️ No face element found, target was:', event?.target?.className)
    }
  }
  
  // 延迟重置拖拽状态，防止立即触发点击事件
  setTimeout(() => {
    isDragStarted.value = false
    console.log('⏱️ Drag state reset after delay')
  }, 200) // 增加延迟到200ms
  
  // 移除所有可能的事件监听
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
  document.removeEventListener('touchcancel', endDrag)
  
  console.log('🧹 All drag event listeners removed')
}

// 生命周期
onMounted(() => {
  console.log('🎬 ExpandableCubeDisplay mounted', {
    cubeContainerRef: !!cubeContainerRef.value,
    initialRotation: cubeRotation.value,
    dragThreshold: dragThreshold
  })
  // 移除了自转动画
})

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
})
</script>

<style lang="scss" scoped>
.expandable-cube-display {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 简化的动画状态控制
  &.preparing {
    .cube-container {
      opacity: 0.3;
      transform: scale(0.9);
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  }
  
  // 收起状态：3D魔方
       .cube-container {
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       height: 100%;
       cursor: pointer;
       padding-bottom: 2.5rem;
       perspective: 2000px;
       touch-action: none; /* 完全控制触摸事件，防止默认滚动 */
       user-select: none;  /* 防止文本选择 */
       
       &:active {
         cursor: grabbing;
       }
    
         .cube {
       position: relative;
       width: 28vh;
       height: 28vh;
       transform-style: preserve-3d;
       transform-origin: center center;
       will-change: transform;
       user-select: none;
       cursor: grab;
       transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
       
       &:active {
         cursor: grabbing;
       }
       
       .cube-face {
         position: absolute;
         width: 28vh;
         height: 28vh;
         box-sizing: border-box;
         background: rgba(255, 255, 255, 0.06);
         backdrop-filter: blur(10px);
         box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
         display: flex;
         align-items: center;
         justify-content: center;
         cursor: pointer;
         transition: background 0.3s ease, box-shadow 0.3s ease;
         backface-visibility: hidden;
         pointer-events: auto; /* 确保面可以接收点击事件 */
        
                 &:hover {
           background: rgba(255, 255, 255, 0.12);
           box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
         }
        
                 .face-content {
           text-align: center;
           color: rgba(255, 255, 255, 0.95);
           
           .face-icon {
             margin-bottom: 0.5rem;
             color: rgba(255, 255, 255, 0.95);
           }
           
                      .face-title {
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .face-subtitle {
              font-size: 0.5rem;
              opacity: 0.9;
            }
         }
        
                 &.front {
           transform: translateZ(14vh); /* 调整为立方体边长的一半 */
         }
         
         &.back {
           transform: translateZ(-14vh) rotateY(180deg);
         }
         
         &.right {
           transform: translateX(14vh) rotateY(90deg);
         }
         
         &.left {
           transform: translateX(-14vh) rotateY(-90deg);
         }
         
         &.top {
           transform: translateY(-14vh) rotateX(90deg);
         }
         
         &.bottom {
           transform: translateY(14vh) rotateX(-90deg);
         }
      }
    }
    

  }
  
  
  // 展开状态：平面化内容
  .expanded-content {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    
    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }
      
      .close-icon {
        width: 20px;
        height: 20px;
        position: relative;
        
        span {
          position: absolute;
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 1px;
          top: 50%;
          left: 0;
          
          &:first-child {
            transform: translateY(-50%) rotate(45deg);
          }
          
          &:last-child {
            transform: translateY(-50%) rotate(-45deg);
          }
        }
      }
    }
    
    .swiper-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      
      .swiper-wrapper {
        display: flex;
        width: 300%;
        height: 100%;
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        
        .swiper-slide {
          width: 33.333%;
          height: 100%;
          padding: 2rem;
          box-sizing: border-box;
          
          .slide-header {
            display: flex;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            
            .slide-icon {
              margin-right: 1rem;
              color: rgba(255, 255, 255, 0.9);
            }
            
            .slide-title {
              font-size: 1.5rem;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.9);
            }
          }
          
          .slide-content {
            height: calc(100% - 4rem);
            overflow-y: auto;
            
            // 历史页面样式
            &.history-slide {
              .history-list {
                .history-item {
                  display: flex;
                  align-items: center;
                  padding: 1rem;
                  margin-bottom: 1rem;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 0.5rem;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  
                  .item-icon {
                    margin-right: 1rem;
                    color: rgba(255, 255, 255, 0.8);
                  }
                  
                  .item-content {
                    flex: 1;
                    
                    .item-title {
                      font-weight: 600;
                      color: rgba(255, 255, 255, 0.9);
                      margin-bottom: 0.25rem;
                    }
                    
                    .item-time {
                      font-size: 0.8rem;
                      color: rgba(255, 255, 255, 0.6);
                      margin-bottom: 0.25rem;
                    }
                    
                    .item-description {
                      font-size: 0.9rem;
                      color: rgba(255, 255, 255, 0.7);
                    }
                  }
                  
                  .item-status {
                    color: #4ade80;
                  }
                }
              }
            }
            
            // 当前任务页面样式
            &.current-slide {
              .current-tasks {
                .task-item {
                  display: flex;
                  align-items: center;
                  padding: 1rem;
                  margin-bottom: 1rem;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 0.5rem;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  
                  .task-priority {
                    width: 4px;
                    height: 40px;
                    border-radius: 2px;
                    margin-right: 1rem;
                    
                    &.priority-high {
                      background: #ef4444;
                    }
                    
                    &.priority-medium {
                      background: #f59e0b;
                    }
                    
                    &.priority-low {
                      background: #10b981;
                    }
                  }
                  
                  .task-content {
                    flex: 1;
                    
                    .task-title {
                      font-weight: 600;
                      color: rgba(255, 255, 255, 0.9);
                      margin-bottom: 0.5rem;
                    }
                    
                    .task-progress {
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      
                      .progress-bar {
                        flex: 1;
                        height: 6px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 3px;
                        overflow: hidden;
                        
                        .progress-fill {
                          height: 100%;
                          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                          transition: width 0.3s ease;
                        }
                      }
                      
                      .progress-text {
                        font-size: 0.8rem;
                        color: rgba(255, 255, 255, 0.7);
                        min-width: 40px;
                      }
                    }
                  }
                  
                  .task-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    
                    &.in-progress {
                      background: rgba(59, 130, 246, 0.2);
                      color: #60a5fa;
                    }
                    
                    &.pending {
                      background: rgba(245, 158, 11, 0.2);
                      color: #fbbf24;
                    }
                  }
                }
              }
            }
            
            // 未来目标页面样式
            &.future-slide {
              .future-goals {
                .goal-item {
                  display: flex;
                  align-items: center;
                  padding: 1rem;
                  margin-bottom: 1rem;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 0.5rem;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  
                  .goal-icon {
                    margin-right: 1rem;
                    color: rgba(255, 255, 255, 0.8);
                  }
                  
                  .goal-content {
                    flex: 1;
                    
                    .goal-title {
                      font-weight: 600;
                      color: rgba(255, 255, 255, 0.9);
                      margin-bottom: 0.25rem;
                    }
                    
                    .goal-deadline {
                      font-size: 0.8rem;
                      color: rgba(255, 255, 255, 0.6);
                      margin-bottom: 0.25rem;
                    }
                    
                    .goal-description {
                      font-size: 0.9rem;
                      color: rgba(255, 255, 255, 0.7);
                    }
                  }
                  
                  .goal-progress {
                    text-align: right;
                    
                    .goal-percentage {
                      font-size: 0.9rem;
                      font-weight: 600;
                      color: rgba(255, 255, 255, 0.9);
                      margin-bottom: 0.5rem;
                    }
                    
                    .goal-bar {
                      width: 60px;
                      height: 6px;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 3px;
                      overflow: hidden;
                      
                      .goal-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #10b981, #34d399);
                        transition: width 0.3s ease;
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
  
  // 详细内容展示区域
  .detail-content-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 9;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  // revealing状态下的内容显示
  &.revealing {
    .detail-content-container {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
    
    
    .swiper-detail-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      padding: 0;
      height: 100%;
      
      .detail-swiper {
        width: 100%;
        height: 100%;
        
        .swiper-slide {
          padding: 7rem 2rem; // 上下7rem，左右2rem
          box-sizing: border-box;
          overflow-y: auto;
          
          .detail-content {
            min-height: 100%;
            padding-bottom: 2rem;
            
            // 抽拉盒子样式
            .expandable-item {
              margin-bottom: 1rem;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 1rem;
              border: 1px solid rgba(255, 255, 255, 0.1);
              overflow: hidden;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              
              &:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.2);
              }
              
              &.expanded {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              }
              
              .item-header {
                display: flex;
                align-items: center;
                padding: 1.2rem;
                cursor: pointer;
                transition: all 0.2s ease;
                
                &:hover {
                  background: rgba(255, 255, 255, 0.03);
                }
                
                .item-icon {
                  margin-right: 1rem;
                  color: rgba(255, 255, 255, 0.8);
                  flex-shrink: 0;
                }
                
                .task-priority {
                  width: 4px;
                  height: 40px;
                  border-radius: 2px;
                  margin-right: 1rem;
                  flex-shrink: 0;
                  
                  &.priority-high {
                    background: #ef4444;
                  }
                  
                  &.priority-medium {
                    background: #f59e0b;
                  }
                  
                  &.priority-low {
                    background: #10b981;
                  }
                }
                
                .item-summary {
                  flex: 1;
                  
                  h4 {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    margin-bottom: 0.4rem;
                    font-weight: 600;
                  }
                  
                  p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                  }
                  
                  .item-time {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.75rem;
                  }
                  
                  .progress-info {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-top: 0.3rem;
                    
                    .progress-bar {
                      flex: 1;
                      height: 6px;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 3px;
                      overflow: hidden;
                      
                      .progress-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                        transition: width 0.3s ease;
                      }
                    }
                    
                    .progress-text {
                      color: rgba(255, 255, 255, 0.8);
                      font-size: 0.8rem;
                      font-weight: 600;
                      min-width: 40px;
                    }
                  }
                  
                  .goal-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 0.3rem;
                    
                    .deadline {
                      color: rgba(255, 255, 255, 0.6);
                      font-size: 0.75rem;
                    }
                    
                    .progress {
                      color: rgba(255, 255, 255, 0.8);
                      font-size: 0.8rem;
                      font-weight: 600;
                    }
                  }
                }
                
                .expand-icon {
                  color: rgba(255, 255, 255, 0.6);
                  transition: transform 0.2s ease;
                  flex-shrink: 0;
                  
                  &.rotated {
                    transform: rotate(180deg);
                  }
                }
              }
              
              .item-content {
                padding: 0 1.2rem 1.2rem 1.2rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.02);
                animation: expandContent 0.3s ease-out;
                
                .content-section {
                  margin-bottom: 1rem;
                  
                  label {
                    display: block;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                  }
                  
                  .details-text {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.85rem;
                    line-height: 1.5;
                  }
                  
                  .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    
                    .tag {
                      background: rgba(59, 130, 246, 0.2);
                      color: #60a5fa;
                      padding: 0.2rem 0.6rem;
                      border-radius: 1rem;
                      font-size: 0.7rem;
                      font-weight: 500;
                    }
                  }
                  
                  .status-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    
                    .status {
                      padding: 0.3rem 0.8rem;
                      border-radius: 1rem;
                      font-size: 0.75rem;
                      font-weight: 600;
                      
                      &.status-in-progress {
                        background: rgba(59, 130, 246, 0.2);
                        color: #60a5fa;
                      }
                      
                      &.status-pending {
                        background: rgba(245, 158, 11, 0.2);
                        color: #fbbf24;
                      }
                    }
                    
                    .priority-text {
                      color: rgba(255, 255, 255, 0.6);
                      font-size: 0.75rem;
                    }
                  }
                  
                  .progress-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    
                    .progress-bar-large {
                      flex: 1;
                      height: 8px;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 4px;
                      overflow: hidden;
                      
                      .progress-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #10b981, #34d399);
                        transition: width 0.3s ease;
                      }
                    }
                    
                    .progress-percentage {
                      color: rgba(255, 255, 255, 0.8);
                      font-size: 0.8rem;
                      font-weight: 600;
                      min-width: 70px;
                    }
                  }
                  
                  .notes-textarea {
                    width: 100%;
                    min-height: 80px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.5rem;
                    padding: 0.8rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.85rem;
                    resize: vertical;
                    outline: none;
                    transition: all 0.2s ease;
                    
                    &::placeholder {
                      color: rgba(255, 255, 255, 0.4);
                    }
                    
                    &:focus {
                      border-color: rgba(59, 130, 246, 0.5);
                      background: rgba(255, 255, 255, 0.08);
                    }
                  }
                }
                
                .content-actions {
                  display: flex;
                  gap: 0.8rem;
                  margin-top: 1.2rem;
                  
                  .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.6rem 1rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                    
                    &.edit-btn, &.save-btn {
                      background: rgba(59, 130, 246, 0.2);
                      color: #60a5fa;
                      
                      &:hover {
                        background: rgba(59, 130, 246, 0.3);
                        transform: translateY(-1px);
                      }
                    }
                    
                    &.start-btn {
                      background: rgba(16, 185, 129, 0.2);
                      color: #34d399;
                      
                      &:hover {
                        background: rgba(16, 185, 129, 0.3);
                        transform: translateY(-1px);
                      }
                    }
                    
                    &.complete-btn {
                      background: rgba(139, 92, 246, 0.2);
                      color: #a78bfa;
                      
                      &:hover {
                        background: rgba(139, 92, 246, 0.3);
                        transform: translateY(-1px);
                      }
                    }
                    
                    &.plan-btn {
                      background: rgba(245, 158, 11, 0.2);
                      color: #fbbf24;
                      
                      &:hover {
                        background: rgba(245, 158, 11, 0.3);
                        transform: translateY(-1px);
                      }
                    }
                    
                    &.update-btn {
                      background: rgba(236, 72, 153, 0.2);
                      color: #f472b6;
                      
                      &:hover {
                        background: rgba(236, 72, 153, 0.3);
                        transform: translateY(-1px);
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

// 抽拉盒子展开动画
@keyframes expandContent {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>