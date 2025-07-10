<template>
  <div class="dynamic-island-card" v-if="showCard">
    <div class="components-container">
      <div class="section-header">
        <span class="section-title">派对策划助手</span>
        <span class="section-desc">为您的孩子派对提供全方位的策划支持</span>
      </div>
      
      <div class="components-grid">
        <div 
          v-for="tool in activeComponents" 
          :key="tool.title"
          class="component-wrapper"
          :class="[`state-${cardStates[tool.component] || 'collapsed'}`, `type-${tool.component}`]"
        >
          <div class="component-header" @click="handleHeaderClick(tool.component)">
            <div class="card-icon-bar">
              <component :is="iconMap[tool.component]" class="card-icon" :size="18" />
            </div>
            <div class="component-title">
              <h4>{{ tool.title }}</h4>
              <p class="component-title-desc">{{ tool.description }}</p>
            </div>
            <div class="component-controls" v-if="cardStates[tool.component] === 'half'">
              <button 
                class="control-btn"
                @click.stop="toggleCardState(tool.component, 'full')"
                title="全屏"
              >
                <Maximize2 :size="12" />
              </button>
            </div>
          </div>
          <transition name="card-expand-fade">
            <div class="component-content" v-show="cardStates[tool.component] !== 'collapsed'">
              <component 
                :is="componentMap[tool.component]" 
                :tool="tool"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
    
    <!-- 全屏覆盖层 -->
    <div 
      v-if="hasFullscreenComponent" 
      class="fullscreen-overlay"
      @click="closeAllFullscreen"
    >
      <div class="fullscreen-content-only" @click.stop>
        <div class="component-header fullscreen-header-bar">
          <div class="card-icon-bar">
            <component :is="iconMap[fullscreenComponentName]" class="card-icon" :size="18" />
          </div>
          <div class="component-title">
            <h4>{{ getFullscreenComponentTitle() }}</h4>
            <p class="component-title-desc">{{ getFullscreenComponentDescription() }}</p>
          </div>
          <button class="close-fullscreen-btn" @click="closeAllFullscreen">
            <X :size="20" />
          </button>
        </div>
        <component 
          :is="componentMap[fullscreenComponentName]" 
          :tool="getFullscreenComponent()"
          :fullscreen="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { AVAILABLE_TOOLS } from '@/config/infoDenseConfig.js'
import { Maximize2, X, UtensilsCrossed, Leaf, Sparkles, CalendarClock, ListChecks } from 'lucide-vue-next'

// 导入所有工具组件
import AllergyFreeMenuCard from './AllergyFreeMenuCard.vue'
import NoVegetableMenuCard from './NoVegetableMenuCard.vue'
import PartyThemeCard from './PartyThemeCard.vue'
import PartyTimeCard from './PartyTimeCard.vue'
import ShoppingListCard from './ShoppingListCard.vue'

const showCard = ref(false)
const cardStates = ref({})

// 组件映射
const componentMap = {
  'AllergyFreeMenuCard': AllergyFreeMenuCard,
  'NoVegetableMenuCard': NoVegetableMenuCard,
  'PartyThemeCard': PartyThemeCard,
  'PartyTimeCard': PartyTimeCard,
  'ShoppingListCard': ShoppingListCard
}

// 图标映射
const iconMap = {
  'AllergyFreeMenuCard': UtensilsCrossed,
  'NoVegetableMenuCard': Leaf,
  'PartyThemeCard': Sparkles,
  'PartyTimeCard': CalendarClock,
  'ShoppingListCard': ListChecks
}

// 控制显示哪些组件的数组（可以通过props传入）
const props = defineProps({
  activeComponentNames: {
    type: Array,
    default: () => [
      'AllergyFreeMenuCard',
      'NoVegetableMenuCard', 
      'PartyThemeCard',
      'PartyTimeCard',
      'ShoppingListCard'
    ]
  }
})

// 根据activeComponentNames过滤出要显示的组件
const activeComponents = computed(() => {
  return AVAILABLE_TOOLS.filter(tool => 
    props.activeComponentNames.includes(tool.component)
  )
})

// 全屏相关计算属性
const hasFullscreenComponent = computed(() => {
  return Object.values(cardStates.value).some(state => state === 'full')
})

const fullscreenComponentName = computed(() => {
  for (const [componentName, state] of Object.entries(cardStates.value)) {
    if (state === 'full') {
      return componentName
    }
  }
  return null
})

// 切换卡片状态
const toggleCardState = (componentName, state) => {
  cardStates.value[componentName] = state
}

// 头部点击处理
const handleHeaderClick = (componentName) => {
  const currentState = cardStates.value[componentName] || 'collapsed'
  if (currentState === 'collapsed') {
    // 收起时点击展开为半屏
    cardStates.value[componentName] = 'half'
  } else if (currentState === 'half') {
    // 半屏时点击收起
    cardStates.value[componentName] = 'collapsed'
  }
}

// 关闭所有全屏
const closeAllFullscreen = () => {
  for (const componentName in cardStates.value) {
    if (cardStates.value[componentName] === 'full') {
      cardStates.value[componentName] = 'half'
    }
  }
}

// 获取全屏组件的标题
const getFullscreenComponentTitle = () => {
  const component = getFullscreenComponent()
  return component ? component.title : ''
}

// 获取全屏组件的描述
const getFullscreenComponentDescription = () => {
  const component = getFullscreenComponent()
  return component ? component.description : ''
}

// 获取全屏组件
const getFullscreenComponent = () => {
  if (!fullscreenComponentName.value) return null
  return AVAILABLE_TOOLS.find(tool => tool.component === fullscreenComponentName.value)
}

// 显示卡片
const showCardWithAnimation = () => {
  showCard.value = true
}

defineExpose({
  showCardWithAnimation
})

onMounted(() => {
  setTimeout(() => {
    showCardWithAnimation()
  }, 100)
})
</script>

<style scoped>
.dynamic-island-card {
  background: #f7f8fa;
  border-radius: 24px;
  padding: 16px 0 20px 0;
  margin: 24px;
  border: none;
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
  opacity: 0;
  transform: translateY(20px);
  animation: slideIn 0.5s cubic-bezier(.4,0,.2,1) forwards;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.components-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 18px;
}

.section-header {
  padding: 0 20px 16px 20px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: block;
}

.section-desc {
  font-size: 11px;
  color: #666;
  display: block;
}

.components-grid {
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.components-grid::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.component-wrapper {
  background: #fff;
  border-radius: 18px;
  border: none;
  box-shadow: 0 2px 16px rgba(0,0,0,0.03);
  overflow: visible;
  transition: box-shadow 0.25s, background 0.25s, border-radius 0.25s;
  display: block;
  margin-bottom: 18px;
  position: relative;
  /* min-height: 64px; 移除，避免影响布局 */
}
.component-wrapper:last-child {
  margin-bottom: 0;
}
/* 渐变竖条柔光扩散 */
.component-wrapper::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 36px;
  border-radius: 18px 0 0 18px;
  z-index: 0;
  opacity: 0.18;
  pointer-events: none;
}
.type-AllergyFreeMenuCard::before { background: linear-gradient(120deg,#b4cafe 0%,#e0e7ff 100%); }
.type-NoVegetableMenuCard::before { background: linear-gradient(120deg,#b9fbc0 0%,#d1fae5 100%); }
.type-PartyThemeCard::before { background: linear-gradient(120deg,#e0c3fc 0%,#f3e8ff 100%); }
.type-PartyTimeCard::before { background: linear-gradient(120deg,#a1c4fd 0%,#e0f2fe 100%); }
.type-ShoppingListCard::before { background: linear-gradient(120deg,#f9e79f 0%,#fef9c3 100%); }
.component-wrapper .component-header, .component-wrapper .component-content { position: relative; z-index: 1; }

.component-wrapper:hover {
  background: rgba(248,249,251,0.95);
  box-shadow: 0 8px 32px 0 rgba(120,120,180,0.10), 0 1.5px 8px rgba(0,0,0,0.04);
  backdrop-filter: blur(2.5px);
}
/* 收起态 */
.component-wrapper.state-collapsed {
  min-height: 48px;
  background: #f3f4f6;
  border-radius: 12px;
  box-shadow: none;
}
.component-wrapper.state-collapsed .component-header {
  padding: 8px 12px 8px 0;
}
.component-wrapper.state-collapsed .card-icon {
  color: #b4b4b4;
}
/* .component-wrapper.state-collapsed .component-title h4 {
  color: #444;
  font-size: 15px;
  font-weight: 600;
} */
.component-wrapper.state-collapsed .component-title-desc {
  color: #888;
  font-size: 11px;
  font-weight: 400;
}
.component-wrapper.state-collapsed::before {
  opacity: 0.32;
}
.component-wrapper.state-collapsed:hover {
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
/* 半屏态优化 */
.component-wrapper.state-half {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  overflow: visible;
}
.component-wrapper.state-half .component-header {
  /* 保持header高度不变 */
}
.component-wrapper.state-half .card-icon {
  color: #a78bfa;
  filter: drop-shadow(0 2px 8px rgba(167,139,250,0.10));
}

.component-wrapper.state-half .component-content {
  max-height: 300px;
  /* min-height: 300px; */
  overflow-y: auto;
}
.component-wrapper.state-half .component-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
/* 头部布局 */
.component-header {
  display: flex;
  align-items: center;
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  padding: 0 24px 0 0;
  border-bottom: none;
  background: transparent;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s;
}
.card-icon-bar {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
/* 全屏时卡片头部 icon 背景更明显 */
.fullscreen-header-bar .card-icon-bar {
  border-radius: 50%;
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(180,180,180,0.10);
}
.card-icon {
  color: #b4b4b4;
  filter: drop-shadow(0 1px 2px rgba(180,180,180,0.08));
  font-size: 22px;
}
.component-title h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: block;
}
.component-title-desc {
  font-size: 11px;
  color: #666;
  display: block;
}
.component-controls {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: #f4f6fa;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.control-btn:hover {
  background: #e8eaf0;
  color: #333;
}
.control-btn.active {
  background: #6366f1;
  color: #fff;
}
.component-content {
  flex: 1;
  overflow: visible;
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
  border-top: 1px solid #f3f4f6;
  padding: 20px;
  background: #fcfcfe;
  border-radius: 0 0 18px 18px;
  color: #333;
  font-size: 15px;
  line-height: 1.8;
  word-break: break-word;
}
.state-collapsed .component-content {
  display: none;
}
.state-half .component-content {
  overflow-y: visible;
}
.state-full .component-content {
  overflow-y: auto;
}
/* 展开收起动画 */
.card-expand-fade-enter-active, .card-expand-fade-leave-active {
  transition: max-height 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s cubic-bezier(.4,0,.2,1), padding 0.22s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.card-expand-fade-enter-from, .card-expand-fade-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.card-expand-fade-enter-to, .card-expand-fade-leave-from {
  max-height: 400px;
  opacity: 1;
}
/* 卡片底部分隔线 */
.component-wrapper:not(:last-child)::after {
  content: '';
  display: block;
  position: absolute;
  left: 24px;
  right: 0;
  bottom: 0;
  height: 1px;
  background: #f2f2f2;
}
/* 全屏覆盖层样式 */
.fullscreen-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  background: rgba(255,255,255,0.98);
  width: 100%;
  height: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-container {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 1200px;
  height: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideInFullscreen 0.3s ease;
}

@keyframes slideInFullscreen {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px 20px 0 0;
}

.fullscreen-title h3 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.fullscreen-title p {
  margin: 0;
  font-size: 1rem;
  color: #666;
}

.close-fullscreen-btn {
  position: absolute;
  top: 12px;
  right: 0px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #f1f3f4;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.close-fullscreen-btn:hover {
  background: #e9ecef;
  color: #333;
  transform: scale(1.1);
}

.fullscreen-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: #fff;
  border-radius: 0 0 20px 20px;
}

.fullscreen-content::-webkit-scrollbar {
  width: 6px;
}

.fullscreen-content::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 3px;
}

.fullscreen-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.fullscreen-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 展开收起动画 */
.card-expand-fade-enter-active, .card-expand-fade-leave-active {
  transition: max-height 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s cubic-bezier(.4,0,.2,1), padding 0.22s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.card-expand-fade-enter-from, .card-expand-fade-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.card-expand-fade-enter-to, .card-expand-fade-leave-from {
  max-height: 400px;
  opacity: 1;
}
.fullscreen-content-only {
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  position: relative;
}
.fullscreen-header-bar {
  background: #fff;
  border-radius: 18px 18px 0 0;
  z-index: 2;
}
</style> 