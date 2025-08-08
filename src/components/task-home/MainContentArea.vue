<template>
  <div class="main-content-area">
    <!-- 内容区域 -->
    <div class="content-container">
      <swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :space-between="0"
        :centered-slides="true"
        :initial-slide="activeDreamIndex"
        :allow-touch-move="true"
        :resistance="false"
        :resistance-ratio="0"
        :watch-slides-progress="true"
        :watch-overflow="true"
        :grab-cursor="true"
        :keyboard="true"
        :mousewheel="false"
        :css-mode="false"
        :loop="false"
        :autoplay="false"
        :effect="'slide'"
        :speed="300"
        :direction="'horizontal'"
        :breakpoints="{
          320: {
            slidesPerView: 1,
            spaceBetween: 0
          }
        }"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        @slide-change-transition-start="onSlideChangeTransitionStart"
        @slide-change-transition-end="onSlideChangeTransitionEnd"
        class="dreams-swiper"
      >
        <swiper-slide
          v-for="(dream, dreamIndex) in dreams"
          :key="`dream-${dream.id}`"
          class="dream-workspace-slide"
          :class="{ 'active': dreamIndex === activeDreamIndex }"
          :data-dream-index="dreamIndex"
          :data-dream-title="dream.title"
        >
          <DreamCardContent :dream="dream" />
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { 
  Navigation, 
  Pagination, 
  Scrollbar, 
  A11y, 
  Keyboard,
  Mousewheel,
  Virtual
} from 'swiper/modules'
import DreamCardContent from './DreamCardContent.vue'

// 不使用 Swiper 样式，只使用 JavaScript 功能

const props = defineProps({
  dreams: {
    type: Array,
    required: true
  },
  activeDreamIndex: {
    type: Number,
    required: true
  },

})

const emit = defineEmits(['update:activeDreamIndex'])

// Swiper 实例
const swiperInstance = ref(null)

// Swiper 模块
const swiperModules = [
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Keyboard,
  Mousewheel,
  Virtual
]

// Swiper 事件处理
const onSwiper = (swiper) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper) => {
  const newIndex = swiper.activeIndex
  // 更新父组件的 activeDreamIndex
  emit('update:activeDreamIndex', newIndex)
}

const onSlideChangeTransitionStart = (swiper) => {
  // 切换动画开始
}

const onSlideChangeTransitionEnd = (swiper) => {
  // 切换动画结束
}

// 监听 activeDreamIndex 变化，同步 Swiper
watch(() => props.activeDreamIndex, (newIndex) => {
  if (swiperInstance.value && swiperInstance.value.activeIndex !== newIndex) {
    swiperInstance.value.slideTo(newIndex, 300)
  }
}, { immediate: true })

// 监听 dreams 数组变化
watch(() => props.dreams, (newDreams) => {
  // 如果 Swiper 已初始化，更新其配置
  if (swiperInstance.value) {
    nextTick(() => {
      swiperInstance.value.update()
    })
  }
}, { deep: true })

// 组件挂载后的处理
onMounted(() => {
  // 组件挂载完成
})

</script>

<style lang="scss" scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.main-content-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  
  .content-container {
    width: 100%;
    height: 100%;
    padding: 0;
    overflow: hidden;
    
    .dreams-swiper {
      width: 100%;
      height: 100%;
      
      :deep(.swiper-wrapper) {
        align-items: stretch;
      }
      
      :deep(.swiper-slide) {
        height: auto;
        display: flex;
        flex-direction: column;
      }
      
      .dream-workspace-slide {
        width: 100%;
        height: 100%;
        opacity: 0.4;
        transition: opacity 0.3s ease;
        padding: 0 1rem;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
        padding-top: 4rem;
        padding-bottom: 2.5rem;
        
        // 隐藏滚动条
        &::-webkit-scrollbar {
          display: none;
        }
        
        -ms-overflow-style: none;
        scrollbar-width: none;
        
        &.active {
          opacity: 1;
        }
        
        &.swiper-slide-active {
          opacity: 1;
        }
        
        &.swiper-slide-prev,
        &.swiper-slide-next {
          opacity: 0.4;
        }
      }
    }
  }
}

// 自定义 Swiper 样式，覆盖默认样式
:deep(.swiper) {
  // 重置 Swiper 默认样式
  --swiper-theme-color: transparent;
  --swiper-navigation-size: 0;
  --swiper-navigation-color: transparent;
  --swiper-pagination-color: transparent;
  --swiper-pagination-bullet-size: 0;
  --swiper-pagination-bullet-horizontal-gap: 0;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  display: none !important; // 隐藏导航按钮
}

:deep(.swiper-pagination) {
  display: none !important; // 隐藏分页器
}

:deep(.swiper-scrollbar) {
  display: none !important; // 隐藏滚动条
}

:deep(.swiper-wrapper) {
  // 自定义 wrapper 样式
  display: flex;
  width: 100%;
  height: 100%;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.swiper-slide) {
  // 自定义 slide 样式
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  position: relative;
  transition-property: transform;
}
</style>