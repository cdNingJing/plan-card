<template>
  <div class="triple-ring-system">
    <!-- 背景装饰层 -->
    <div class="cosmic-background">
      <div class="cosmic-grid"></div>
      <div class="floating-particles"></div>
    </div>
    
    <!-- 三层可移动图层系统 -->
    <div class="three-layer-container">
      
      <!-- 第一层：核心愿景层 (左上区域) -->
      <div class="layer-one">
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
            @click="handleElementClick(item, 'vision')"
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
      <div class="layer-two">
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
            @click="handleElementClick(item, 'plan')"
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
      <div class="layer-three">
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
            @click="handleElementClick(item, 'action')"
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
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Globe, Building2, Zap } from 'lucide-vue-next'

// 基础响应式状态 - 必须在最前面定义
const selectedLevel = ref('vision')
const hoveredElement = ref(null)
const interactionEnabled = ref(true)
const screenSize = ref('app')

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

// 第二层数据 - 执行计划 (中等卡片，6个内容)
const planData = computed(() => createDataWithIds([
  { value: '领域', label: '选择创业领域' },
  { value: '教育', label: '制定教育方案' },
  { value: '路线', label: '设计旅游路线' },
  { value: '资金', label: '资金筹备计划' },
  { value: '团队', label: '组建核心团队' },
  { value: '时间', label: '时间管理规划' }
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

// 交互处理函数
const handleElementClick = (element, layer) => {
  if (!interactionEnabled.value) return
  
  const layerNames = {
    vision: '人生愿景',
    plan: '执行计划',
    action: '行动步骤'
  }
  
  console.log(`🎆 ${layerNames[layer]}: ${element.label} - ${element.value}`)
  
  // 可以在这里添加更多交互逻辑，比如打开详细页面
  selectedLevel.value = layer
}


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

// 双层卡片布局检测
const checkOverlap = () => {
  if (!cosmicState.value.isInitialized) return
  
  const innerCards = document.querySelectorAll('.inner-card .card-body')
  const outerCards = document.querySelectorAll('.outer-card .card-body')
  const overlaps = []
  const minDistance = 15 // 最小安全距离(px)
  
  // 检查内层卡片重叠
  innerCards.forEach((el, i) => {
    const rect1 = el.getBoundingClientRect()
    innerCards.forEach((el2, j) => {
      if (i >= j) return
      const rect2 = el2.getBoundingClientRect()
      
      const centerX1 = rect1.left + rect1.width / 2
      const centerY1 = rect1.top + rect1.height / 2
      const centerX2 = rect2.left + rect2.width / 2
      const centerY2 = rect2.top + rect2.height / 2
      
      const distance = Math.sqrt(
        Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
      )
      
      if (distance < minDistance) {
        overlaps.push({ 
          el1: el, 
          el2: el2, 
          distance,
          type: 'inner'
        })
      }
    })
  })
  
  // 检查外层卡片重叠
  outerCards.forEach((el, i) => {
    const rect1 = el.getBoundingClientRect()
    outerCards.forEach((el2, j) => {
      if (i >= j) return
      const rect2 = el2.getBoundingClientRect()
      
      const centerX1 = rect1.left + rect1.width / 2
      const centerY1 = rect1.top + rect1.height / 2
      const centerX2 = rect2.left + rect2.width / 2
      const centerY2 = rect2.top + rect2.height / 2
      
      const distance = Math.sqrt(
        Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
      )
      
      if (distance < minDistance) {
        overlaps.push({ 
          el1: el, 
          el2: el2, 
          distance,
          type: 'outer'
        })
      }
    })
  })
  
  if (overlaps.length > 0) {
    console.warn(`🔧 双层布局检测: ${overlaps.length} 处需要调整 (内层: ${overlaps.filter(o => o.type === 'inner').length}, 外层: ${overlaps.filter(o => o.type === 'outer').length})`)
  } else {
    console.log(`✅ 双层卡片布局检测通过，无重叠问题`)
  }
  
  return overlaps.length === 0
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

// 性能监控
const performanceMonitor = {
  animationFrame: null,
  startTime: 0,
  
  start() {
    this.startTime = performance.now()
  },
  
  measure(label) {
    const duration = performance.now() - this.startTime
    if (duration > 16) { // 超过一帧的时间
      console.warn(`${label} 动画耗时: ${duration.toFixed(2)}ms`)
    }
  }
}

// 生命周期
onMounted(() => {
  // APP初始化
  handleResize()
  
  // 初始化系统状态
  cosmicState.value.isInitialized = true
  selectedLevel.value = 'vision'
  
  // 动画初始化
  if (!animationConfig.value.reduceMotion) {
    performanceMonitor.start()
    
    // 启动动画
    requestAnimationFrame(() => {
      cosmicState.value.animationsEnabled = true
      interactionEnabled.value = true
      performanceMonitor.measure('组件初始化')
      
      // 延迟检测重叠，确保DOM渲染完成
      setTimeout(() => {
        checkOverlap()
      }, 1000)
    })
  } else {
    interactionEnabled.value = true
    setTimeout(() => checkOverlap(), 500)
  }
})

onUnmounted(() => {
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
</script>

<style lang="scss" scoped>
.triple-ring-system {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
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
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1) contrast(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.2) contrast(1.1);
  }
}

@keyframes iconGlow {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
  }
}

@keyframes breatheRing {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

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
</style>