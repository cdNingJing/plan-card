<template>
  <div class="time-space-loom" ref="loomContainer">
    <!-- 中央控制核心 -->
    <div class="loom-core" :style="coreStyle">
      <div class="core-ring" v-for="ring in 2" :key="ring" 
           :class="`ring-${ring}`"
           :style="getRingStyle(ring)">
        <div class="ring-glow"></div>
      </div>
      
      <!-- 核心图标 -->
      <div class="core-icon" @click="toggleLoom">
        <component :is="isActive ? Zap : Play" :size="32" />
        <div class="core-pulse" v-if="weavingActive"></div>
      </div>
    </div>

    <!-- 简化的交织点 -->
    <div class="intersection-points" v-if="isActive">
      <div v-for="point in allPoints" :key="point.id"
           class="intersection-point"
           :style="getPointStyle(point)"
           @click="selectPoint(point)">
        <component :is="point.icon" :size="18" />
        <div class="point-pulse" v-if="point.active"></div>
      </div>
    </div>

    <!-- 简化的详情卡片 -->
    <div class="detail-card" v-if="selectedPoint">
      <div class="card-header">
        <component :is="selectedPoint.icon" :size="20" />
        <span class="card-title">{{ selectedPoint.title }}</span>
        <button class="close-btn" @click="selectedPoint = null">×</button>
      </div>
      <div class="card-body">
        <div class="progress-info">
          <span class="progress-label">进度</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="`width: ${selectedPoint.energy}%`"></div>
          </div>
          <span class="progress-value">{{ selectedPoint.energy }}%</span>
        </div>
      </div>
    </div>

    <!-- 简化的控制面板 -->
    <div class="control-panel" v-if="isActive">
      <div class="dimension-tabs">
        <button v-for="dim in dimensions" :key="dim.id"
                class="tab-button"
                :class="{ active: selectedDimension === dim.id }"
                @click="selectDimension(dim.id)">
          <component :is="dim.icon" :size="14" />
          <span>{{ dim.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { 
  Play, Zap, Heart, Briefcase, Users, Target, 
  Clock, Sparkles, Brain, Compass, Star, Home
} from 'lucide-vue-next'
// import QuantumContextPanel from './QuantumContextPanel.vue' // 移除未使用的导入

// 核心状态
const loomContainer = ref(null)
const isActive = ref(false)
// const showCards = ref(false) // 移除未使用的变量
const weavingActive = ref(false)
const selectedDimension = ref('family')
const selectedPoint = ref(null)
// 简化状态管理

// 动画控制
const animationFrame = ref(null)
const rotationAngle = ref(0)
const pulsePhase = ref(0)
const simpleHover = ref(null)

// 时间线程数据（保持原有内容）
const timeThreads = ref([
  {
    id: 'past',
    type: 'past',
    color: 'rgba(156, 163, 175, 0.6)',
    angle: -20,
    points: [
      { id: 'p1', icon: Heart, x: 25, y: 35, active: false, dimension: 'family', title: '家庭基础', energy: 90 },
      { id: 'p2', icon: Briefcase, x: 30, y: 65, active: false, dimension: 'career', title: '职业起步', energy: 75 }
    ]
  },
  {
    id: 'present',
    type: 'present', 
    color: 'rgba(34, 197, 94, 0.8)',
    angle: 0,
    points: [
      { id: 'pr1', icon: Target, x: 50, y: 20, active: true, dimension: 'career', title: '升职准备', energy: 75 },
      { id: 'pr2', icon: Users, x: 45, y: 50, active: true, dimension: 'social', title: '人脉建设', energy: 60 },
      { id: 'pr3', icon: Sparkles, x: 55, y: 75, active: true, dimension: 'personal', title: '技能提升', energy: 85 }
    ]
  },
  {
    id: 'future',
    type: 'future',
    color: 'rgba(59, 130, 246, 0.6)',
    angle: 20,
    points: [
      { id: 'f1', icon: Star, x: 75, y: 30, active: false, dimension: 'career', title: '创业梦想', energy: 45 },
      { id: 'f2', icon: Compass, x: 70, y: 60, active: false, dimension: 'personal', title: '人生目标', energy: 35 }
    ]
  }
])

// 维度线程数据（保持原有内容）
const dimensions = ref([
  { id: 'family', name: '家庭', icon: Heart, color: 'rgba(239, 68, 68, 0.7)', angle: 30 },
  { id: 'career', name: '事业', icon: Briefcase, color: 'rgba(245, 158, 11, 0.7)', angle: 90 }, 
  { id: 'social', name: '社交', icon: Users, color: 'rgba(34, 197, 94, 0.7)', angle: 150 },
  { id: 'personal', name: '个人', icon: Sparkles, color: 'rgba(168, 85, 247, 0.7)', angle: 210 }
])

// 所有交织点
const allPoints = computed(() => {
  return timeThreads.value.flatMap(thread => thread.points)
})

// 当前维度的点
const currentDimensionPoints = computed(() => {
  if (!selectedDimension.value) return allPoints.value
  return allPoints.value.filter(point => point.dimension === selectedDimension.value)
})

// 样式计算
const coreStyle = computed(() => ({
  transform: `rotate(${rotationAngle.value * 0.3}deg) scale(${isActive.value ? 1.05 : 1})`,
  filter: `brightness(${isActive.value ? 1.1 : 1})`
}))

const getRingStyle = (ringIndex) => {
  const scale = 1 + (ringIndex - 1) * 0.2
  return {
    transform: `scale(${scale}) rotate(${rotationAngle.value * 0.5}deg)`,
    animationDelay: `${ringIndex * 0.3}s`
  }
}

// 移除了复杂的线条样式计算

const getPointStyle = (point) => {
  const pulse = point.active ? Math.sin(pulsePhase.value) * 0.05 + 1 : 1
  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
    transform: `scale(${pulse}) translate(-50%, -50%)`,
    boxShadow: point.active ? `0 0 10px #10B981` : 'none'
  }
}

// 移除了卡片样式计算

// 交互方法
const toggleLoom = () => {
  isActive.value = !isActive.value
  if (isActive.value) {
    startWeaving()
  } else {
    stopWeaving()
    selectedPoint.value = null
  }
}

const selectDimension = (dimId) => {
  selectedDimension.value = dimId
  weavingActive.value = true
  setTimeout(() => { weavingActive.value = false }, 1500)
}

const selectPoint = (point) => {
  selectedPoint.value = selectedPoint.value === point ? null : point
  point.active = !point.active
}

// 移除了简化交互函数

// 移除了卡片交互函数

const startWeaving = () => {
  weavingActive.value = true
  animate()
}

const stopWeaving = () => {
  weavingActive.value = false
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
}

const animate = () => {
  rotationAngle.value += 0.1
  pulsePhase.value += 0.03
  animationFrame.value = requestAnimationFrame(animate)
}

// 简化的系统管理

onMounted(() => {
  // 初始化动画
  setTimeout(toggleLoom, 800)
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
})
</script>

<style scoped>
.time-space-loom {
  position: relative;
  width: 100%;
  height: 100vh;
  background: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  overflow: hidden;
  cursor: grab;
  transform-origin: center;
}

.time-space-loom:active {
  cursor: grabbing;
}

/* 中央核心 */
.loom-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.core-ring {
  position: absolute;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s ease-out;
}

.core-ring.ring-1 {
  width: 60px;
  height: 60px;
  border-color: rgba(34, 197, 94, 0.6);
}

.core-ring.ring-2 {
  width: 80px; 
  height: 80px;
  border-color: rgba(59, 130, 246, 0.5);
}

.core-ring.ring-3 {
  width: 100px;
  height: 100px;
  border-color: rgba(168, 85, 247, 0.4);
}

.ring-glow {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  animation: ringPulse 5s ease-in-out infinite;
}

.core-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 50%;
  color: #3B82F6;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.core-icon:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}

.core-pulse {
  position: absolute;
  inset: -15px;
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  animation: corePulse 1.5s ease-out infinite;
}

/* 时间线程 */
.time-threads {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.thread-line {
  position: absolute;
  width: 100%;
  height: 2px;
  top: 50%;
  left: 0;
  transform-origin: center;
  transition: all 0.5s ease-out;
  animation: threadFlow 10s linear infinite;
}

.thread-glow {
  position: absolute;
  inset: -2px;
  background: inherit;
  filter: blur(4px);
  opacity: 0.5;
}

/* 维度线 */
.dimension-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.dimension-line {
  position: absolute;
  width: 100%;
  height: 1px;
  top: 50%;
  left: 0;
  transform-origin: center;
  transition: all 0.5s ease-out;
}

.dimension-label {
  position: absolute;
  right: 20px;
  top: -10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 500;
  pointer-events: auto;
}

.dimension-glow {
  position: absolute;
  inset: -3px;
  background: inherit;
  filter: blur(6px);
  opacity: 0.3;
}

/* 交织点 */
.intersection-point {
  position: absolute;
  width: 24px;
  height: 24px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3B82F6;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.intersection-point:hover {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
}

.point-pulse {
  position: absolute;
  inset: -10px;
  border: 2px solid #10B981;
  border-radius: 50%;
  animation: pointPulse 4s ease-out infinite;
}

/* 移除了point-ripple样式 */

/* 量子卡片 */
.quantum-cards {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.quantum-card {
  position: absolute;
  width: 120px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
  animation: cardFloat 10s ease-in-out infinite;
}

.quantum-card:hover {
  transform: translate(-50%, -50%) scale(1.05) !important;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.card-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75rem;
  font-weight: 500;
}

.card-energy {
  height: 2px;
  background: linear-gradient(90deg, #10B981, #3B82F6);
  border-radius: 1px;
  transition: width 0.6s ease;
}

.card-quantum-field {
  position: absolute;
  inset: -5px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.quantum-card:hover .card-quantum-field {
  opacity: 1;
  animation: quantumField 2.5s ease-in-out infinite;
}

/* 移除了card-focus-ring样式 */

/* 状态指示器 */
.loom-status {
  position: absolute;
  bottom: 30px;
  left: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  max-width: 200px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(156, 163, 175, 0.6);
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #10B981;
  box-shadow: 0 0 10px #10B981;
  animation: dotPulse 3s ease-in-out infinite;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
}

.dimension-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
}

.dim-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dim-button:hover, .dim-button.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3B82F6;
  color: #3B82F6;
  transform: scale(1.1);
}

/* 动画定义 */
@keyframes ringPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.02); }
}

/* 移除了threadFlow动画 */

@keyframes pointPulse {
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
  100% { opacity: 0.8; transform: scale(1); }
}

/* 移除了cardFloat动画 */

/* 移除了quantumField动画 */

/* 移除了dotPulse动画 */

@keyframes corePulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
}

@keyframes slideInUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .loom-core {
    width: 100px;
    height: 100px;
  }
  
  .core-ring.ring-1 { width: 50px; height: 50px; }
  .core-ring.ring-2 { width: 70px; height: 70px; }
  
  .intersection-point {
    width: 24px;
    height: 24px;
  }
  
  .detail-card {
    bottom: 20px;
    right: 20px;
    width: 250px;
  }
  
  .control-panel {
    top: 20px;
    padding: 6px;
  }
  
  .tab-button {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
}
</style>