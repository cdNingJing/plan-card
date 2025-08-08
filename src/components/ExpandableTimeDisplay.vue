<template>
  <div class="expandable-time-display" :class="{ expanded: props.isExpanded }" @click="handleClick">
    <!-- 收起状态：圆形时钟 -->
    <div class="circular-clock" v-if="!props.isExpanded">
      <div class="clock-face">
        <div class="clock-center"></div>
        <div class="hour-hand" :style="{ transform: `translate(-50%, -100%) rotate(${hourRotation}deg)` }"></div>
        <div class="minute-hand" :style="{ transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)` }"></div>
        <div class="second-hand" :style="{ transform: `translate(-50%, -100%) rotate(${secondRotation}deg)` }"></div>
        <!-- 时钟刻度 -->
        <div v-for="i in 12" :key="i" 
             class="clock-mark" 
             :style="{ transform: `rotate(${i * 30}deg)` }">
          <div class="mark-line"></div>
        </div>
      </div>
    </div>
    
    <!-- 展开状态：时间轴 -->
    <div class="timeline-display" v-if="props.isExpanded">
      <div class="ruler-container">
        <!-- 尺子主体 -->
        <div class="ruler-track">
          <!-- 刻度线容器 -->
          <div class="ruler-marks">
            <!-- 只生成可见区域的刻度线 -->
            <div v-for="tick in getVisibleTicks()" :key="tick.index" 
                 class="ruler-mark" 
                 :class="tick.class"
                 :style="{ left: `${tick.position}px`, ...tick.style }">
              <!-- 显示时间标签 -->
              <span v-if="tick.label" :class="tick.labelClass">{{ tick.label }}</span>
            </div>
          </div>
          
          <!-- 中心指针 -->
          <div class="center-pointer">
            <div class="gradient-pointer"></div>
          </div>
          
          <!-- 左侧灰色蒙版 -->
          <div class="gray-mask"></div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 接收父组件的展开状态
const props = defineProps({
  isExpanded: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['click'])

// 处理点击事件
const handleClick = () => {
  emit('click')
}

// 时钟相关状态
const currentTime = ref('')
const hourRotation = ref(0)
const minuteRotation = ref(0)
const secondRotation = ref(0)

// 更新时钟
const updateClock = () => {
  const now = new Date()
  const hours = now.getHours() % 12
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  
  // 计算指针角度
  hourRotation.value = (hours * 30) + (minutes * 0.5)
  minuteRotation.value = minutes * 6
  secondRotation.value = seconds * 6
  
  // 格式化数字时间
  const timeString = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentTime.value = timeString
}

// 获取过去的时间
const getPastTime = (index) => {
  const now = new Date()
  const pastTime = new Date(now.getTime() - (12 - index) * 60 * 60 * 1000)
  return pastTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取未来的时间
const getFutureTime = (index) => {
  const now = new Date()
  const futureTime = new Date(now.getTime() + index * 60 * 60 * 1000)
  return futureTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 基准线颜色数组（简化为4色渐变）
const baselineColors = [
  '#ff6b6b', // 红色
  '#4ecdc4', // 青色
  '#feca57', // 黄色
  '#45b7d1'  // 蓝色
]

// 根据位置计算对应的基准线颜色
const getColorAtPosition = (position, viewportWidth) => {
  // 基于可视区域计算位置百分比，而不是总宽度
  const percentage = Math.max(0, Math.min(1, position / viewportWidth))
  const colorIndex = percentage * (baselineColors.length - 1)
  const lowerIndex = Math.floor(colorIndex)
  const upperIndex = Math.ceil(colorIndex)
  const t = colorIndex - lowerIndex
  
  if (lowerIndex === upperIndex || !baselineColors[upperIndex]) {
    return baselineColors[lowerIndex] || baselineColors[0]
  }
  
  // 在两个颜色之间插值
  const lowerColor = hexToRgb(baselineColors[lowerIndex])
  const upperColor = hexToRgb(baselineColors[upperIndex])
  
  if (!lowerColor || !upperColor) {
    return baselineColors[lowerIndex] || baselineColors[0]
  }
  
  const r = Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * t)
  const g = Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * t)
  const b = Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * t)
  
  return `rgb(${r}, ${g}, ${b})`
}

// 十六进制颜色转RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// 时钟风格刻度渲染（120个刻度用于无缝循环）
const getVisibleTicks = () => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 400
  
  const ticks = []
  const tickSpacing = 12 // 每个刻度间隔12px（增大间距）
  
  // 生成120个刻度（两个完整的60刻度周期）用于无缝循环
  for (let i = 0; i < 120; i++) {
    const position = i * tickSpacing
    
    // 只显示可见区域附近的刻度（扩大范围以支持动画）
    if (position < -200 || position > viewportWidth + 800) continue
    
    // 计算此刻度在可视区域中的相对位置，对应基准线渐变
    // 考虑动画效果，需要计算实际显示位置
    const actualPosition = position % viewportWidth // 模拟循环位置
    const tickColor = getColorAtPosition(actualPosition, viewportWidth)
    const tickColorTransparent = tickColor.replace('rgb(', 'rgba(').replace(')', ', 0.7)')
    
    const tick = {
      index: i,
      position: position,
      class: getClockTickClass(i % 60),
      label: null,
      labelClass: null,
      style: {
        '--tick-color': tickColor,
        '--tick-color-transparent': tickColorTransparent
      }
    }
    
    // 只在12个主要位置显示英文数字单词，每60个刻度重复一次
    if (i % 5 === 0) {
      const clockPosition = Math.floor((i % 60) / 5) // 0, 1, 2, ..., 11
      // 英文数字单词数组（1-12）
      const numberWords = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven']
      tick.label = numberWords[clockPosition % 12]
      tick.labelClass = 'clock-number'
    }
    
    ticks.push(tick)
  }
  
  return ticks
}

// 获取时钟风格刻度类型
const getClockTickClass = (index) => {
  if (index % 5 === 0) {
    return 'main-tick' // 主刻度（对应1-12位置）
  } else {
    return 'minor-tick' // 次刻度（其他位置）
  }
}

// 获取当前小时（12小时制）
const getCurrentHour = () => {
  const now = new Date()
  const hour24 = now.getHours()
  const hour12 = hour24 % 12
  return hour12 === 0 ? 12 : hour12
}

// 动画循环
let clockInterval = null

// 生命周期
onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
})
</script>

<style lang="scss" scoped>
.expandable-time-display {
  width: 100%;
  position: relative;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 收起状态样式
  .circular-clock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    
    .clock-face {
      position: relative;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      
      .clock-center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      }
      
      .hour-hand {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 20px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 1px;
        transform-origin: 50% 100%;
        z-index: 8;
      }
      
      .minute-hand {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1px;
        height: 25px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 1px;
        transform-origin: 50% 100%;
        z-index: 7;
      }
      
      .second-hand {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1px;
        height: 28px;
        background: rgba(74, 144, 226, 0.9);
        border-radius: 1px;
        transform-origin: 50% 100%;
        z-index: 6;
      }
      
      .clock-mark {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-origin: center center;
        
        .mark-line {
          position: absolute;
          top: 2px;
          left: 50%;
          width: 2px;
          height: 12px;
          background: rgba(255, 255, 255, 0.6);
          transform: translateX(-50%);
        }
      }
    }
  }
  
  // 展开状态样式 - 尺子样式
  .timeline-display {
    width: 100%;
    height: auto;
    margin: 0 auto;
    transform: scale(0.7); // 整体缩小到70%
    
    .ruler-container {
      position: relative;
      padding: 1.5rem 0; // 减小内边距
      width: 100%;
      min-height: 60px; // 减小最小高度
      overflow: hidden;
      
      .ruler-track {
        position: relative;
        width: 100%;
        height: 50px; // 减小高度
        overflow: visible;
        
        // 底部基准线（简化4色渐变）
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, 
            #ff6b6b, // 红色
            #4ecdc4, // 青色
            #feca57, // 黄色
            #45b7d1  // 蓝色
          );
        }
        
        .ruler-marks {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          animation: tickMove 60s linear infinite;
          
          .ruler-mark {
            position: absolute;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            
            &::after {
              content: '';
              align-self: center;
            }
            
            // 主刻度 - 使用CSS自定义属性接收动态颜色
            &.main-tick::after {
              width: 1px;
              height: 25px;
              background: var(--tick-color, #ff6b6b); // 使用CSS变量，默认红色
            }
            
            // 次刻度 - 使用CSS自定义属性接收动态颜色（半透明）
            &.minor-tick::after {
              width: 1px;
              height: 12px;
              background: var(--tick-color-transparent, rgba(255, 107, 107, 0.7)); // 使用CSS变量，默认半透明红色
            }
            
            .clock-number {
              position: absolute;
              top: 100%;
              margin-top: 3px;
              color: var(--tick-color, #ff6b6b); // 使用对应位置的颜色
              font-size: 0.45rem;
              font-weight: 600;
              transform: translateX(-50%);
              left: 50%;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
              white-space: nowrap;
              letter-spacing: -0.5px;
            }
          }
        }
        
        // 中心指针
        .center-pointer {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          
          .gradient-pointer {
            width: 2px;
            height: 70px;
            background: linear-gradient(
              to bottom,
              transparent 0%,
              rgba(74, 144, 226, 0.3) 10%,
              rgba(74, 144, 226, 0.8) 25%,
              rgba(74, 144, 226, 1) 50%,
              rgba(74, 144, 226, 0.8) 75%,
              rgba(74, 144, 226, 0.3) 90%,
              transparent 100%
            );
            border-radius: 2px;
            position: relative;
            
            // 添加发光效果
            &::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 8px;
              height: 20px;
              background: rgba(74, 144, 226, 0.4);
              border-radius: 4px;
              transform: translate(-50%, -50%);
              filter: blur(2px);
              z-index: -1;
            }
          }
        }
        
        // 左侧灰色蒙版（将经过中心指针的刻度变为灰色）
        .gray-mask {
          position: absolute;
          top: 22px;
          left: 0;
          width: 50%; // 覆盖左半边
          height: 42px;
          background: transparent;
          backdrop-filter: grayscale(100%) brightness(0.8); // 使用滤镜将颜色变为灰色并调暗
          z-index: 5;
          pointer-events: none; // 不影响交互
          
          // 备选方案：如果backdrop-filter不够明显，使用伪元素叠加
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3); // 半透明黑色叠加
            mix-blend-mode: multiply;
          }
        }
      }
    }
  }
  
  // 展开动画
  &.expanded {
    .circular-clock {
      transform: scale(0.8);
      opacity: 0;
    }
    
    .timeline-display {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

// 刻度从右到左移动动画（无缝循环）
@keyframes tickMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-720px); // 60个刻度 × 12px间距 = 720px，然后无缝重置
  }
}
</style>