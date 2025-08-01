<template>
  <div class="dream-block-slider">
    <div 
      class="slider-container"
      ref="sliderContainer"
    >
      <div 
        class="slider-track"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <div
          v-for="(item, index) in displayDreams"
          :key="`${item.dream.id}-${item.virtualIndex}`"
          class="dream-block"
          :class="{
            'active': item.isActive,
            'left': item.position === 'left',
            'right': item.position === 'right',
            [`theme-${item.themeIndex}`]: true
          }"
          @click="handleBlockClick(item.originalIndex)"
        >
          <div class="dream-block-content">
            <div class="dream-header">
              <div class="dream-icon">
                <component :is="getDreamIcon(item.dream.id)" :size="20" />
              </div>
              <div class="dream-stats">
                <span class="progress-text">{{ item.dream.progress }}%</span>
                <span class="days-left">{{ getDaysLeft(item.dream) }} 天</span>
              </div>
            </div>
            
            <div class="dream-info">
              <h3 class="dream-title">{{ item.dream.title }}</h3>
              <p class="dream-description">{{ item.dream.description }}</p>
            </div>
            
            <div class="dream-progress">
              <div class="progress-track">
                <div 
                  class="progress-indicator"
                  :style="{ width: `${item.dream.progress}%` }"
                ></div>
              </div>
              <div class="progress-info">
                <span class="current-step">{{ getCurrentStep(item.dream) }}</span>
                <span class="total-steps">/{{ item.dream.totalSteps || 10 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { GestureHandler } from '@/utils/gestureHandler'
import {
  GraduationCap,
  Briefcase,
  Heart,
  TrendingUp,
  Home,
  Star
} from 'lucide-vue-next'

export default {
  name: 'DreamBlockSlider',
  props: {
    dreams: {
      type: Array,
      default: () => []
    }
  },
  emits: ['change', 'dream-detail'],
  setup(props, { emit }) {
    const sliderContainer = ref(null)
    const currentIndex = ref(0)
    const translateX = ref(0)
    const blockWidth = ref(0) // 动态计算的块宽度
    const blockGap = ref(20) // 块之间的间距
    const containerPadding = ref(32) // 容器左右内边距
    
    // 计算显示的梦想列表（包含首尾相连效果）
    const displayDreams = computed(() => {
      if (props.dreams.length === 0) return []
      
      const dreams = props.dreams
      const total = dreams.length
      const current = currentIndex.value
      
      // 为了实现首尾相连，我们需要显示5个块（中间一个 + 左右各两个）
      const result = []
      
      for (let i = -2; i <= 2; i++) {
        let dreamIndex = (current + i + total) % total
        let virtualIndex = current + i
        
        result.push({
          dream: dreams[dreamIndex],
          originalIndex: dreamIndex,
          virtualIndex: virtualIndex,
          isActive: i === 0,
          position: i === -1 ? 'left' : (i === 1 ? 'right' : 'other'),
          themeIndex: dreamIndex % 6 // 为每个梦想分配主题色索引（6种主题）
        })
      }
      
      return result
    })
    
    // 手势处理器
    let gestureHandler = null
    
    // 计算总宽度和居中偏移
    const totalWidth = computed(() => {
      return 5 * (blockWidth.value + blockGap.value) - blockGap.value // 5个块的总宽度
    })
    
    // 计算布局尺寸 - 确保同时显示3个块
    const calculateLayout = () => {
      if (!sliderContainer.value) return
      
      const containerWidth = sliderContainer.value.offsetWidth
      const totalGaps = blockGap.value * 2 // 3个块有2个间距
      const calculatedWidth = (containerWidth - totalGaps - containerPadding.value) / 3
      
      blockWidth.value = Math.max(calculatedWidth, 200) // 最小宽度200px
      
      // 设置CSS变量
      if (sliderContainer.value) {
        sliderContainer.value.style.setProperty('--dream-block-width', `${blockWidth.value}px`)
        sliderContainer.value.style.setProperty('--dream-block-gap', `${blockGap.value}px`)
      }
    }
    
    const centerOffset = computed(() => {
      if (!sliderContainer.value) return 0
      const containerWidth = sliderContainer.value.offsetWidth
      return (containerWidth - blockWidth.value) / 2
    })
    
    // 更新translateX位置 - 支持首尾相连
    const updateTranslateX = () => {
      calculateLayout()
      
      if (props.dreams.length === 0) return
      
      // 对于5个块的显示，中间块总是第3个（索引为2）
      // 我们要让第3个块在屏幕中心
      const containerWidth = sliderContainer.value?.offsetWidth || 0
      const centerPosition = containerWidth / 2 - blockWidth.value / 2
      
      // 计算第3个块（中间块）的位置
      const thirdBlockPosition = 2 * (blockWidth.value + blockGap.value)
      
      translateX.value = centerPosition - thirdBlockPosition
    }
    
    // 滑动到指定索引 - 支持无限循环
    const goToSlide = (index) => {
      if (props.dreams.length === 0) return
      
      // 实现无限循环
      let targetIndex = index
      if (index >= props.dreams.length) {
        targetIndex = 0 // 超过最后一个，回到第一个
      } else if (index < 0) {
        targetIndex = props.dreams.length - 1 // 小于第一个，跳到最后一个
      }
      
      currentIndex.value = targetIndex
      updateTranslateX()
      emit('change', targetIndex)
    }
    
    // 初始化手势处理
    const initGestureHandler = () => {
      if (!sliderContainer.value) return
      
      gestureHandler = new GestureHandler(sliderContainer.value, {
        swipeThreshold: blockWidth.value / 3,
        swipeVelocityThreshold: 0.3
      })
      
      // 左滑 - 下一个（无限循环）
      gestureHandler.on('swipeLeft', () => {
        goToSlide(currentIndex.value + 1)
      })
      
      // 右滑 - 上一个（无限循环）
      gestureHandler.on('swipeRight', () => {
        goToSlide(currentIndex.value - 1)
      })
      
      // 拖拽处理
      let startTranslateX = 0
      
      gestureHandler.on('dragStart', () => {
        startTranslateX = translateX.value
      })
      
      gestureHandler.on('drag', ({ deltaX }) => {
        translateX.value = startTranslateX + deltaX
      })
      
      gestureHandler.on('dragEnd', ({ deltaX, velocity }) => {
        const threshold = blockWidth.value / 3
        let newIndex = currentIndex.value
        
        // 根据拖拽距离和速度判断是否切换（无限循环）
        if (Math.abs(deltaX) > threshold || Math.abs(velocity) > 0.5) {
          if (deltaX > 0) {
            newIndex = currentIndex.value - 1 // 向右拖拽，到上一个
          } else if (deltaX < 0) {
            newIndex = currentIndex.value + 1 // 向左拖拽，到下一个
          }
        }
        
        goToSlide(newIndex)
      })
    }
    
    
    // 点击块
    const handleBlockClick = (index) => {
      if (index === currentIndex.value) {
        // 点击当前激活的块，进入梦想详情页面
        emit('dream-detail', props.dreams[index])
        return
      }
      goToSlide(index)
    }
    
    // 获取梦想图标
    const getDreamIcon = (dreamId) => {
      const iconMap = {
        1: GraduationCap,  // 孩子考哈佛
        2: Briefcase,      // 事业发展
        3: Heart,          // 健康管理
        4: TrendingUp,     // 财务自由
        5: Home            // 家庭和谐
      }
      return iconMap[dreamId] || Star
    }
    
    // 计算剩余天数
    const getDaysLeft = (dream) => {
      if (dream.deadline) {
        const now = new Date()
        const deadline = new Date(dream.deadline)
        const diffTime = deadline - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
      }
      return Math.floor(Math.random() * 365) + 30 // 模拟数据
    }
    
    // 获取当前步骤
    const getCurrentStep = (dream) => {
      const totalSteps = dream.totalSteps || 10
      return Math.floor((dream.progress / 100) * totalSteps)
    }
    
    // 窗口大小变化处理
    const handleResize = () => {
      updateTranslateX()
    }
    
    onMounted(() => {
      // 等待DOM渲染完成后计算宽度
      setTimeout(() => {
        updateTranslateX()
        initGestureHandler()
      }, 50)
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      if (gestureHandler) {
        gestureHandler.destroy()
      }
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      sliderContainer,
      currentIndex,
      translateX,
      displayDreams,
      handleBlockClick,
      goToSlide,
      getDreamIcon,
      getDaysLeft,
      getCurrentStep
    }
  }
}
</script>

<style lang="scss" scoped>
.dream-block-slider {
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #d4a574 0%, #b8956a 100%); // 暖棕色渐变
  padding: 2rem 1rem 1.5rem; // 增加左右内边距
  
  .slider-container {
    width: 100%;
    overflow: visible; // 允许阴影和放大效果显示
    position: relative;
    
    .slider-track {
      display: flex;
      align-items: center;
      padding: 0.5rem 0; // 为放大效果留出空间
      transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      will-change: transform;
      position: relative;
      width: max-content; // 宽度由内容决定
      
      .dream-block {
        width: var(--dream-block-width, 200px); // 通过JS计算的动态宽度
        height: 10rem; // 增加高度以容纳更多内容
        margin-right: var(--dream-block-gap, 20px); // 通过JS计算的动态间距
        
        &:last-child {
          margin-right: 0; // 最后一个块不需要右边距
        }
        
        border-radius: 1.5rem;
        background: linear-gradient(135deg, #fffbf7 0%, #fef7f0 100%); // 暖白色基础
        box-shadow: 
          0 0.25rem 1rem rgba(0, 0, 0, 0.06),
          0 0.125rem 0.5rem rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        transform-origin: center;
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
        border: none;
        opacity: 1;
        backdrop-filter: blur(10px);
        
        // 添加光泽效果
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          transition: left 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          pointer-events: none;
          opacity: 0;
        }
        
        &:hover::before {
          left: 100%;
          opacity: 1;
        }
        
        // 6种暖色系梦想主题渐变色
        &.theme-0 {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); // 粉红渐变 - 学习成长
          color: #8b5a3c;
        }
        
        &.theme-1 {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); // 桃橙渐变 - 事业发展
          color: #8b5a3c;
        }
        
        &.theme-2 {
          background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); // 黄橙渐变 - 健康管理
          color: #8b5a3c;
        }
        
        &.theme-3 {
          background: linear-gradient(135deg, #fd9853 0%, #feb47b 100%); // 橙黄渐变 - 财务自由
          color: #8b5a3c;
        }
        
        &.theme-4 {
          background: linear-gradient(135deg, #ffeaa7 0%, #ddd6fe 100%); // 暖黄紫渐变 - 家庭和谐
          color: #8b5a3c;
        }
        
        &.theme-5 {
          background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%); // 混粉蓝渐变 - 其他梦想
          color: #8b5a3c;
        }
        
        &.active {
          transform: scale(1.15); // 中间的块1.15倍大小
          opacity: 1; // 完全不透明
          box-shadow: 
            0 0.75rem 2.5rem rgba(0, 0, 0, 0.15),
            0 0.25rem 1rem rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          border: none;
          z-index: 3;
          backdrop-filter: blur(15px);
          
          &::before {
            opacity: 0.1;
          }
        }
        
        &.left,
        &.right {
          opacity: 0.75; // 左右两边75%透明度
          transform: scale(0.95); // 略微缩小
          filter: saturate(0.8) brightness(0.95); // 轻微去色和变暗
          z-index: 2;
          backdrop-filter: blur(8px);
          
          .dream-block-content {
            opacity: 0.9;
          }
        }
        
        // 边缘块半隐藏
        &:not(.active):not(.left):not(.right) {
          opacity: 0.4;
          transform: scale(0.85);
          z-index: 1;
          filter: saturate(0.6) brightness(0.9) blur(0.5px);
          backdrop-filter: blur(5px);
          
          .dream-block-content {
            opacity: 0.7;
          }
        }
        
        .dream-block-content {
          padding: 1rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 2;
          
          .dream-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
            
            .dream-icon {
              width: 2.5rem;
              height: 2.5rem;
              border-radius: 0.75rem;
              background: rgba(255, 255, 255, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
              box-shadow: 0 0.125rem 0.5rem rgba(139, 90, 60, 0.15);
              
              svg {
                opacity: 0.9;
                color: inherit;
              }
            }
            
            .dream-stats {
              text-align: right;
              
              .progress-text {
                display: block;
                font-size: 1.125rem;
                font-weight: 700;
                line-height: 1;
                margin-bottom: 0.125rem;
              }
              
              .days-left {
                font-size: 0.6875rem;
                opacity: 0.8;
                font-weight: 500;
              }
            }
          }
          
          .dream-info {
            flex: 1;
            min-height: 0; // 允许flex子项收缩
            
            .dream-title {
              margin: 0 0 0.25rem 0;
              font-size: 0.9375rem; // 15px
              font-weight: 600;
              line-height: 1.2;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .dream-description {
              margin: 0 0 0.5rem 0;
              font-size: 0.75rem; // 12px
              line-height: 1.3;
              opacity: 0.8;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            
            .dream-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 0.1875rem; // 3px
              margin-bottom: 0.4375rem; // 7px
              
              .tag {
                background: rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(5px);
                padding: 0.0625rem 0.375rem; // 1px 6px
                border-radius: 0.5rem;
                font-size: 0.5625rem; // 9px
                font-weight: 500;
                opacity: 0.9;
                white-space: nowrap;
                flex-shrink: 0;
                line-height: 1.2;
              }
            }
          }
          
          .dream-progress {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            
            .progress-track {
              flex: 1;
              height: 0.375rem;
              background: rgba(255, 255, 255, 0.3);
              border-radius: 0.25rem;
              overflow: hidden;
              backdrop-filter: blur(5px);
              
              .progress-indicator {
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 0.25rem;
                transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.4);
              }
            }
            
            .progress-info {
              display: flex;
              align-items: baseline;
              font-size: 0.6875rem;
              font-weight: 600;
              opacity: 0.8;
              
              .current-step {
                font-size: 0.8125rem;
              }
            }
          }
        }
        
        // 非激活状态的进度条颜色
        &:not(.active) .dream-progress .progress-indicator {
          background: #adb5bd;
        }
        
        &.left .dream-progress .progress-indicator,
        &.right .dream-progress .progress-indicator {
          background: #ced4da;
        }
      }
    }
  }
}

// 动画效果
@keyframes pulse {
  0%, 100% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(1.18);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.dream-block.active {
  animation: pulse 3s ease-in-out infinite;
}

</style>