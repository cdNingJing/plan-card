<template>
  <div 
    ref="containerRef"
    class="planet-orbit-container" 
    :style="containerStyle"
  >
    <!-- 主星球 -->
    <div class="main-planet" :style="mainPlanetStyle">
      <!-- 主星球标签 -->
        <div v-if="size !== 0" class="main-planet-label">
          {{ title }}
        </div>
      <div class="planet-core"></div>
      <div class="planet-atmosphere"></div>
      <div class="planet-glow"></div>
      <div class="planet-craters"></div>
      <div class="planet-rings"></div>
    </div>
    
    <!-- 轨道线 -->
    <div class="orbit-lines">
      <div 
        v-for="(orbit, index) in orbits" 
        :key="`orbit-${index}`"
        class="orbit-line"
        :style="getOrbitStyle(orbit)"
      ></div>
    </div>
    
    <!-- 小星球 -->
    <div 
      v-for="(planet, index) in planets" 
      :key="`planet-${index}`"
      class="orbiting-planet"
      :style="getPlanetStyle(planet, index)"
    >
             <div class="planet-body" :style="getPlanetBodyStyle(planet)">
         <div class="planet-surface"></div>
         <div class="planet-highlights"></div>
                             <!-- 星球内部文字 -->
           <div 
             v-if="size !== 0"
             class="planet-inner-label" 
             :style="{ fontSize: getPlanetStyle(planet, index).fontSize }"
           >
             {{ getPlanetLabel(index) }}
           </div>
       </div>
      <div class="planet-trail" :style="getTrailStyle(planet)"></div>
    </div>
    
    <!-- 背景星星 -->
    <div class="background-stars">
      <div 
        v-for="(star, index) in backgroundStars" 
        :key="`star-${index}`"
        class="star"
        :style="getStarStyle(star)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  size: {
    type: Number,
    default: 0 // 0 表示自动计算
  },
  planetCount: {
    type: Number,
    default: 5
  },
  orbitCount: {
    type: Number,
    default: 3
  },
  animationSpeed: {
    type: Number,
    default: 1
  },
  showOrbits: {
    type: Boolean,
    default: true
  },
  showStars: {
    type: Boolean,
    default: true
  },
  responsive: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: '梦想星球'
  }
})

// 响应式数据
const animationFrame = ref(null)
const currentTime = ref(0)
const containerRef = ref(null)
const containerWidth = ref(0)

// 计算属性
const actualSize = computed(() => {
  if (props.size > 0) {
    return props.size
  }
  
  // 基于容器宽度计算合适的尺寸
  if (containerWidth.value > 0) {
    // 在大屏幕上使用较大的尺寸，小屏幕上使用较小的尺寸
    if (containerWidth.value >= 1200) {
      return Math.min(containerWidth.value * 0.4, 500)
    } else if (containerWidth.value >= 768) {
      return Math.min(containerWidth.value * 0.5, 400)
    } else if (containerWidth.value >= 480) {
      return Math.min(containerWidth.value * 0.6, 300)
    } else {
      return Math.min(containerWidth.value * 0.7, 250)
    }
  }
  
  // 默认尺寸
  return 400
})

const containerStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`
}))

const mainPlanetStyle = computed(() => ({
  width: `${actualSize.value * 0.2}px`, // 放大主星球
  height: `${actualSize.value * 0.2}px`
}))

// 轨道配置
const orbits = computed(() => {
  const orbitList = []
  for (let i = 0; i < props.orbitCount; i++) {
    // 根据size值调整轨道速度
    const baseSpeed = props.size === 0 ? 2.5 : 0.1 // size为0时适度提高基础速度
    const speedIncrement = props.size === 0 ? 0.6 : 0.05 // size为0时适度增加速度差异
    
    orbitList.push({
      radius: (actualSize.value * 0.25) + (i * actualSize.value * 0.1),
      speed: baseSpeed + (i * speedIncrement), // 根据size调整速度
      opacity: 0.3 - (i * 0.05)
    })
  }
  return orbitList
})

// 小星球配置
const planets = computed(() => {
  const planetList = []
  for (let i = 0; i < props.planetCount; i++) {
    planetList.push({
      orbitIndex: i % props.orbitCount,
      orbitOffset: (i / props.planetCount) * Math.PI * 2,
      size: 0.05 + (Math.random() * 0.05), // 缩小球体尺寸
      color: getRandomPlanetColor(),
      trailLength: 20 + Math.random() * 30
    })
  }
  return planetList
})

// 背景星星
const backgroundStars = computed(() => {
  if (!props.showStars) return []
  
  const stars = []
  // 根据size值调整星星数量和颜色
  const baseStarCount = props.size === 0 ? 20 : 50 // size为0时减少星星数量
  const starCount = baseStarCount + Math.random() * (props.size === 0 ? 15 : 30)
  
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * actualSize.value,
      y: Math.random() * actualSize.value,
      size: 1 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 1 + Math.random() * 2,
      color: props.size === 0 ? '#888888' : '#ffffff' // size为0时使用灰色
    })
  }
  return stars
})

// 方法
const getOrbitStyle = (orbit) => ({
  width: `${orbit.radius * 2}px`,
  height: `${orbit.radius * 2}px`,
  left: `${(actualSize.value - orbit.radius * 2) / 2}px`,
  top: `${(actualSize.value - orbit.radius * 2) / 2}px`,
  opacity: orbit.opacity
})

const getPlanetStyle = (planet, index) => {
  const orbit = orbits.value[planet.orbitIndex]
  const angle = (currentTime.value * orbit.speed * props.animationSpeed) + planet.orbitOffset
  const x = Math.cos(angle) * orbit.radius
  const y = Math.sin(angle) * orbit.radius
  
  // 根据轨道半径计算缩放比例：轨道半径越小（越接近中心），缩放越大
  const orbitRadius = orbit.radius
  const maxOrbitRadius = Math.max(...orbits.value.map(o => o.radius))
  const minOrbitRadius = Math.min(...orbits.value.map(o => o.radius))
  
  // 计算轨道半径的归一化比例（0-1之间，0表示最外层，1表示最内层）
  const radiusRatio = 1 - ((orbitRadius - minOrbitRadius) / (maxOrbitRadius - minOrbitRadius))
  
  // 根据轨道半径计算缩放比例：越接近中心（轨道半径越小），缩放越大
  const scaleFactor = 0.6 + (radiusRatio * 2.0) // 0.6 到 2.6 的缩放范围，更大的差异
  
  const scaledSize = planet.size * scaleFactor
  
  // 基于星球实际尺寸计算合适的文字大小
  const planetDiameter = scaledSize * actualSize.value
  const fontSize = Math.max(0.25, Math.min(planetDiameter * 0.1, 1.0)) // 文字大小为星球直径的10%，但不超过1.0rem
  
  return {
    left: `${(actualSize.value / 2) + x - (scaledSize * actualSize.value / 2)}px`,
    top: `${(actualSize.value / 2) + y - (scaledSize * actualSize.value / 2)}px`,
    width: `${scaledSize * actualSize.value}px`,
    height: `${scaledSize * actualSize.value}px`,
    zIndex: 10 + index,
    fontSize: `${fontSize}rem`
  }
}

const getPlanetBodyStyle = (planet) => ({
  backgroundColor: planet.color,
  width: '100%',
  height: '100%'
})

const getTrailStyle = (planet) => {
  const orbit = orbits.value[planet.orbitIndex]
  const angle = (currentTime.value * orbit.speed * props.animationSpeed) + planet.orbitOffset
  const trailAngle = angle - (planet.trailLength / 100)
  
  return {
    background: `conic-gradient(from ${trailAngle}rad, transparent, ${planet.color}20, transparent)`,
    width: `${orbit.radius * 2}px`,
    height: `${orbit.radius * 2}px`,
    left: `${(actualSize.value - orbit.radius * 2) / 2}px`,
    top: `${(actualSize.value - orbit.radius * 2) / 2}px`
  }
}

const getStarStyle = (star) => ({
  left: `${star.x}px`,
  top: `${star.y}px`,
  width: `${star.size}px`,
  height: `${star.size}px`,
  opacity: star.opacity,
  backgroundColor: star.color,
  animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite alternate`
})

const getRandomPlanetColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#FF8C42', '#7B68EE', '#20B2AA', '#FF69B4', '#32CD32'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 获取星球标签文字
const getPlanetLabel = (index) => {
  const labels = [
    '健康', '财富', '事业', '学习', '关系',
    '梦想', '成长', '成功', '幸福', '自由'
  ]
  return labels[index % labels.length]
}



// 动画循环
const animate = () => {
  currentTime.value += 0.016 // 约60fps
  animationFrame.value = requestAnimationFrame(animate)
}

// 尺寸监听和更新
const updateContainerSize = () => {
  if (containerRef.value && props.responsive) {
    const rect = containerRef.value.getBoundingClientRect()
    const parentWidth = rect.width || window.innerWidth
    containerWidth.value = parentWidth
  }
}

// 生命周期
onMounted(() => {
  animate()
  
  // 初始化尺寸
  updateContainerSize()
  
  // 监听窗口大小变化
  if (props.responsive) {
    window.addEventListener('resize', updateContainerSize)
    
    // 使用 ResizeObserver 监听容器尺寸变化
    if (containerRef.value) {
      const resizeObserver = new ResizeObserver(() => {
        updateContainerSize()
      })
      resizeObserver.observe(containerRef.value)
    }
  }
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  
  // 清理事件监听器
  if (props.responsive) {
    window.removeEventListener('resize', updateContainerSize)
  }
})
</script>

<style lang="scss" scoped>
.planet-orbit-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0c1445 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 0 40px rgba(74, 144, 226, 0.3),
    inset 0 0 40px rgba(74, 144, 226, 0.15);
  animation: planetContainerGlow 1s ease-in-out infinite;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
}



// 主星球样式
.main-planet {
  position: absolute;
  z-index: 20;
  
  .main-planet-label {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(74, 144, 226, 0.95);
    color: rgba(255, 255, 255, 1);
    padding: 0.75rem 1.5rem;
    border-radius: 1.25rem;
    font-size: 1.1rem;
    font-weight: 800;
    text-align: center;
    white-space: nowrap;
    backdrop-filter: blur(20px);
    border: 3px solid rgba(255, 255, 255, 0.4);
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.5),
      0 0 40px rgba(74, 144, 226, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    pointer-events: none;
    z-index: 25;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    
    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid rgba(74, 144, 226, 0.95);
    }
  }
  
  .planet-core {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: 
      radial-gradient(circle at 30% 30%, #4A90E2, #357ABD),
      radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    box-shadow: 
      inset -3px -3px 12px rgba(0, 0, 0, 0.4),
      inset 3px 3px 12px rgba(255, 255, 255, 0.3),
      0 0 20px rgba(74, 144, 226, 0.4);
  }
  
  .planet-atmosphere {
    position: absolute;
    width: 120%;
    height: 120%;
    left: -10%;
    top: -10%;
    border-radius: 50%;
    background: 
      radial-gradient(circle, rgba(74, 144, 226, 0.4) 0%, transparent 60%),
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 40%);
    animation: atmosphere-pulse 4s ease-in-out infinite;
  }
  
  .planet-glow {
    position: absolute;
    width: 150%;
    height: 150%;
    left: -25%;
    top: -25%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(74, 144, 226, 0.15) 0%, transparent 70%);
    animation: glow-pulse 6s ease-in-out infinite;
  }
  
  .planet-craters {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: 
      radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.3) 0%, transparent 8%),
      radial-gradient(circle at 75% 35%, rgba(0, 0, 0, 0.2) 0%, transparent 6%),
      radial-gradient(circle at 45% 75%, rgba(0, 0, 0, 0.25) 0%, transparent 7%);
    pointer-events: none;
  }
  
  .planet-rings {
    position: absolute;
    width: 140%;
    height: 140%;
    left: -20%;
    top: -20%;
    border-radius: 50%;
    background: 
      conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.1) 30deg, transparent 60deg, rgba(255, 255, 255, 0.05) 90deg, transparent 120deg, rgba(255, 255, 255, 0.08) 150deg, transparent 180deg, rgba(255, 255, 255, 0.06) 210deg, transparent 240deg, rgba(255, 255, 255, 0.09) 270deg, transparent 300deg, rgba(255, 255, 255, 0.07) 330deg, transparent 360deg);
    opacity: 0.6;
    animation: ringsRotate 20s linear infinite;
  }
}

// 轨道线样式
.orbit-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  
  .orbit-line {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    pointer-events: none;
  }
}

// 小星球样式
.orbiting-planet {
  position: absolute;
  z-index: 10;
  
  .planet-inner-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    z-index: 5;
    mix-blend-mode: overlay;
    transition: all 0.3s ease;
    max-width: 85%;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
    padding: 0 2px;
  }
  
  .planet-body {
    position: absolute;
    border-radius: 50%;
    box-shadow: 
      0 0 15px rgba(255, 255, 255, 0.4),
      inset -2px -2px 6px rgba(0, 0, 0, 0.4),
      inset 2px 2px 6px rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    overflow: hidden;
    
    // 移除hover效果和呼吸效果
    
    .planet-surface {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: 
        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 40%),
        radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.3) 0%, transparent 40%);
      pointer-events: none;
    }
    
    .planet-highlights {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: 
        radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.4) 0%, transparent 30%),
        radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.2) 0%, transparent 30%);
      pointer-events: none;
    }
  }
  
  .planet-trail {
    position: absolute;
    border-radius: 50%;
    opacity: 0.3;
    pointer-events: none;
  }
}

// 背景星星样式
.background-stars {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .star {
    position: absolute;
    border-radius: 50%;
    box-shadow: 0 0 4px currentColor;
  }
}

// 动画关键帧
@keyframes atmosphere-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.1);
  }
}

@keyframes twinkle {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}



@keyframes ringsRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes planetContainerGlow {
  0%, 100% {
    box-shadow: 
      0 0 40px rgba(74, 144, 226, 0.3),
      inset 0 0 40px rgba(74, 144, 226, 0.15);
  }
  50% {
    box-shadow: 
      0 0 60px rgba(74, 144, 226, 0.5),
      inset 0 0 60px rgba(74, 144, 226, 0.25);
  }
}



// 响应式设计
@media (max-width: 768px) {
  .planet-orbit-container {
    padding: 1rem;
  }
}
</style>