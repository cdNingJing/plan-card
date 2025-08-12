<template>
  <div class="simple-time-loom">
    <!-- 友好的标题 -->
    <div class="friendly-header">
      <h2 class="main-title">我的小小规划师</h2>
      <p class="subtitle">点击中间的按钮开始吧！</p>
    </div>

    <!-- 简化的中心圆圈 -->
    <div class="center-circle" @click="startPlanning">
      <div class="circle-content">
        <component :is="isActive ? Heart : Play" :size="40" />
        <span class="circle-text">{{ isActive ? '正在规划' : '开始规划' }}</span>
      </div>
      <div class="circle-glow" v-if="isActive"></div>
    </div>

    <!-- 简单的四个生活区域 -->
    <div class="life-areas" v-if="isActive">
      <div v-for="area in lifeAreas" :key="area.id"
           class="life-area"
           :class="{ active: selectedArea === area.id }"
           :style="getAreaStyle(area)"
           @click="selectArea(area)">
        
        <div class="area-icon">
          <component :is="area.icon" :size="24" />
        </div>
        
        <div class="area-info">
          <h3 class="area-name">{{ area.name }}</h3>
          <p class="area-desc">{{ area.description }}</p>
          
          <!-- 简单的进度条 -->
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="`width: ${area.progress}%`"></div>
            </div>
            <span class="progress-text">{{ area.progress }}%</span>
          </div>
        </div>

        <!-- 小星星装饰 -->
        <div class="area-stars">
          <div v-for="star in area.stars" :key="star" class="star"></div>
        </div>
      </div>
    </div>

    <!-- 简单的任务卡片 -->
    <div class="simple-tasks" v-if="selectedArea">
      <h4 class="tasks-title">{{ getSelectedAreaName() }} 的小任务</h4>
      <div class="task-list">
        <div v-for="task in currentTasks" :key="task.id"
             class="task-card"
             :class="{ completed: task.completed }"
             @click="toggleTask(task)">
          
          <div class="task-icon">
            <component :is="task.completed ? CheckCircle : Clock" :size="16" />
          </div>
          
          <div class="task-content">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-time">{{ task.time }}</span>
          </div>
          
          <div class="task-reward" v-if="task.completed">
            ⭐
          </div>
        </div>
      </div>
    </div>

    <!-- 鼓励话语 -->
    <div class="encouragement" v-if="isActive">
      <div class="encouragement-bubble">
        <span class="encouragement-text">{{ currentEncouragement }}</span>
        <div class="bubble-tail"></div>
      </div>
    </div>

    <!-- 简单的底部说明 -->
    <div class="simple-guide">
      <div class="guide-item">
        <span class="guide-icon">👆</span>
        <span class="guide-text">点击开始规划</span>
      </div>
      <div class="guide-item">
        <span class="guide-icon">🎯</span>
        <span class="guide-text">选择生活区域</span>
      </div>
      <div class="guide-item">
        <span class="guide-icon">✅</span>
        <span class="guide-text">完成小任务</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Play, Heart, Home, Book, Users, Gamepad2,
  CheckCircle, Clock
} from 'lucide-vue-next'

// 简化的状态管理
const isActive = ref(false)
const selectedArea = ref(null)
const encouragementIndex = ref(0)
const encouragementTimer = ref(null)

// 简单易懂的生活区域
const lifeAreas = ref([
  {
    id: 'family',
    name: '家庭时光',
    description: '和家人在一起的美好时间',
    icon: Home,
    progress: 75,
    stars: 3,
    color: '#FF6B6B',
    position: { top: '20%', left: '15%' },
    tasks: [
      { id: 'f1', name: '帮妈妈做家务', time: '30分钟', completed: true },
      { id: 'f2', name: '陪爷爷奶奶聊天', time: '1小时', completed: false },
      { id: 'f3', name: '和弟弟妹妹玩游戏', time: '45分钟', completed: false }
    ]
  },
  {
    id: 'study',
    name: '学习成长',
    description: '每天进步一点点',
    icon: Book,
    progress: 60,
    stars: 2,
    color: '#4ECDC4',
    position: { top: '20%', right: '15%' },
    tasks: [
      { id: 's1', name: '完成今天的作业', time: '2小时', completed: true },
      { id: 's2', name: '阅读课外书', time: '30分钟', completed: false },
      { id: 's3', name: '练习写字', time: '20分钟', completed: true }
    ]
  },
  {
    id: 'friends',
    name: '朋友圈子',
    description: '和小伙伴们快乐玩耍',
    icon: Users,
    progress: 45,
    stars: 2,
    color: '#45B7D1',
    position: { bottom: '25%', left: '15%' },
    tasks: [
      { id: 'fr1', name: '约朋友一起踢球', time: '1小时', completed: false },
      { id: 'fr2', name: '给好朋友写信', time: '30分钟', completed: true },
      { id: 'fr3', name: '邀请朋友来家里玩', time: '2小时', completed: false }
    ]
  },
  {
    id: 'hobby',
    name: '兴趣爱好',
    description: '做自己喜欢的事情',
    icon: Gamepad2,
    progress: 80,
    stars: 4,
    color: '#96CEB4',
    position: { bottom: '25%', right: '15%' },
    tasks: [
      { id: 'h1', name: '画一幅美丽的画', time: '1小时', completed: true },
      { id: 'h2', name: '学习新的魔术', time: '45分钟', completed: true },
      { id: 'h3', name: '制作手工作品', time: '1.5小时', completed: false }
    ]
  }
])

// 鼓励话语
const encouragements = [
  '你做得真棒！继续加油！',
  '每个小任务都让你更棒！',
  '你是最棒的小规划师！',
  '坚持就是胜利！',
  '你的努力会有收获！'
]

// 计算属性
const currentTasks = computed(() => {
  if (!selectedArea.value) return []
  const area = lifeAreas.value.find(a => a.id === selectedArea.value)
  return area ? area.tasks : []
})

const currentEncouragement = computed(() => {
  return encouragements[encouragementIndex.value]
})

// 方法
const startPlanning = () => {
  isActive.value = !isActive.value
  if (isActive.value) {
    startEncouragementCycle()
  } else {
    selectedArea.value = null
    stopEncouragementCycle()
  }
}

const selectArea = (area) => {
  selectedArea.value = area.id
}

const getSelectedAreaName = () => {
  const area = lifeAreas.value.find(a => a.id === selectedArea.value)
  return area ? area.name : ''
}

const getAreaStyle = (area) => {
  return {
    ...area.position,
    '--area-color': area.color,
    transform: selectedArea.value === area.id ? 'scale(1.1)' : 'scale(1)'
  }
}

const toggleTask = (task) => {
  task.completed = !task.completed
  
  // 更新区域进度
  updateAreaProgress()
  
  // 如果任务完成，显示奖励效果
  if (task.completed) {
    showTaskReward()
  }
}

const updateAreaProgress = () => {
  const area = lifeAreas.value.find(a => a.id === selectedArea.value)
  if (area) {
    const completedTasks = area.tasks.filter(t => t.completed).length
    area.progress = Math.round((completedTasks / area.tasks.length) * 100)
  }
}

const showTaskReward = () => {
  // 简单的奖励反馈
  console.log('恭喜完成任务！获得一颗小星星⭐')
}

const startEncouragementCycle = () => {
  encouragementTimer.value = setInterval(() => {
    encouragementIndex.value = (encouragementIndex.value + 1) % encouragements.length
  }, 4000)
}

const stopEncouragementCycle = () => {
  if (encouragementTimer.value) {
    clearInterval(encouragementTimer.value)
  }
}

onUnmounted(() => {
  stopEncouragementCycle()
})
</script>

<style scoped>
.simple-time-loom {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 友好标题 */
.friendly-header {
  text-align: center;
  margin-bottom: 30px;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 5px 0 0 0;
}

/* 中心圆圈 */
.center-circle {
  position: relative;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  margin-bottom: 40px;
}

.center-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.circle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #667eea;
}

.circle-text {
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.circle-glow {
  position: absolute;
  inset: -10px;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: simpleGlow 2s ease-in-out infinite;
}

/* 生活区域 */
.life-areas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.life-area {
  position: absolute;
  width: 200px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid transparent;
}

.life-area:hover {
  transform: scale(1.02) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.life-area.active {
  border-color: var(--area-color);
  box-shadow: 0 8px 25px var(--area-color);
}

.area-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--area-color);
  border-radius: 50%;
  color: white;
  margin-bottom: 10px;
}

.area-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: #333;
}

.area-desc {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--area-color);
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: #333;
}

.area-stars {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 2px;
}

.star {
  width: 8px;
  height: 8px;
  background: #FFD700;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

/* 任务卡片 */
.simple-tasks {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.tasks-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #333;
  text-align: center;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.task-card:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.task-card.completed {
  background: #d4edda;
  border-color: #28a745;
}

.task-icon {
  color: #667eea;
  flex-shrink: 0;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}

.task-time {
  font-size: 0.7rem;
  color: #666;
}

.task-reward {
  font-size: 1.2rem;
  animation: bounce 0.5s ease;
}

/* 鼓励话语 */
.encouragement {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
}

.encouragement-bubble {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.encouragement-text {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.bubble-tail {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.9);
}

/* 简单指南 */
.simple-guide {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  font-size: 0.75rem;
}

.guide-icon {
  font-size: 1rem;
}

.guide-text {
  color: #333;
  font-weight: 500;
}

/* 动画 */
@keyframes simpleGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes bounce {
  0%, 20%, 60%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  80% { transform: translateY(-4px); }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .life-area {
    width: 160px;
    padding: 12px;
  }
  
  .simple-tasks {
    bottom: 15px;
    left: 15px;
    right: 15px;
  }
  
  .main-title {
    font-size: 1.5rem;
  }
  
  .center-circle {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .life-area {
    width: 140px;
    padding: 10px;
  }
  
  .area-name {
    font-size: 0.9rem;
  }
  
  .area-desc {
    font-size: 0.7rem;
  }
}
</style>