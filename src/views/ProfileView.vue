<template>
  <div class="profile-chat-root">
    <div class="profile-chat-frame" :class="{ 'overview-mode': isOverviewMode }">
      <!-- 概览模式 -->
      <div v-if="isOverviewMode" class="profile-overview-container"
        @touchstart="onOverviewTouchStart"
        @touchmove="onOverviewTouchMove"
        @touchend="onOverviewTouchEnd"
        @mousedown="onOverviewTouchStart"
        @mousemove="onOverviewTouchMove"
        @mouseup="onOverviewTouchEnd"
      >
        <div class="profile-overview-header">
          <h3>{{ cards[currentCardIndex]?.label || '所有卡片' }}</h3>
          <p>向下滑动返回，左右滑动浏览</p>
        </div>
        <div class="profile-overview-cards-scrollbox">
          <div class="profile-overview-cards-horizontal no-scrollbar">
            <div
              v-for="(card, idx) in cards"
              :key="card.id"
              class="profile-overview-card-horizontal"
              @click="selectCard(idx)"
              :style="overviewCardUniformStyle"
            >
              <div class="overview-card-aspect">
                <div class="overview-card-preview-horizontal" :style="{ background: card.gradient }">
                  <div class="overview-card-scale">
                    <component :is="card.component" v-bind="card.props" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 正常模式 -->
      <template v-else>
        <!-- 卡片轮播 -->
        <div class="profile-chat-history-card-wrapper">
          <div v-if="showSideCards" class="profile-sidecard-left">
            <div class="sidecard-icon">
              <span class="arrow arrow1">‹</span>
              <span class="arrow arrow2">‹</span>
              <span class="arrow arrow3">‹</span>
            </div>
          </div>
          <div v-if="showSideCards" class="profile-sidecard-right">
            <div class="sidecard-icon">
              <span class="arrow arrow1">›</span>
              <span class="arrow arrow2">›</span>
              <span class="arrow arrow3">›</span>
            </div>
          </div>
          <div
            v-if="currentCard"
            class="profile-chat-history-card"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @mousedown="onTouchStart"
            @mousemove="onTouchMove"
            @mouseup="onTouchEnd"
          >
            <div class="profile-chat-history" ref="chatMessagesRef" :style="{ background: currentCard.gradient }">
              <component :is="currentCard.component" v-bind="currentCard.props" />
            </div>
          </div>
        </div>
        <!-- 卡片指示器 -->
        <div class="profile-card-indicator">
          <span
            v-for="(card, idx) in cards"
            :key="card.id"
            :class="['indicator-dot', { active: idx === currentCardIndex }]"
          ></span>
        </div>
        <!-- 输入框 -->
        <div class="profile-chat-inputbar" v-if="currentCard">
          <input
            v-model="inputValue"
            class="profile-chat-input"
            type="text"
            :placeholder="fixedPlaceholder"
            :style="{ background: currentCard.inputBg }"
            @keydown.enter="handleSubmit"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '@/stores/historyStore'
import HistoryCard from '@/components/cards/HistoryCard.vue'
import LongTermDataCard from '@/components/cards/LongTermDataCard.vue'
import ShortTermDataCard from '@/components/cards/ShortTermDataCard.vue'
import aiService from '@/services/aiService.js'
import aiDataStorage from '@/utils/aiDataStorage.js'

const historyStore = useHistoryStore()
const { messages, currentCardIndex: storeCurrentCardIndex } = storeToRefs(historyStore)

const inputValue = ref('')
const chatMessagesRef = ref(null)

const cards = ref([
  { id: 1, component: markRaw(HistoryCard), props: { messages }, gradient: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)', inputShadowFocus: '0 4px 18px 0 rgba(60, 60, 120, 0.18), 0 2px 0 0 #6366f1' },
  { id: 2, component: markRaw(LongTermDataCard), props: {}, gradient: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)', inputBg: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)', inputPlaceholder: '长期记忆卡片…', inputShadow: '0 2px 12px 0 rgba(16, 185, 129, 0.10), 0 1.5px 0 0 #10b981', inputShadowFocus: '0 4px 18px 0 rgba(16, 185, 129, 0.18), 0 2px 0 0 #059669' },
  { id: 3, component: markRaw(ShortTermDataCard), props: {}, gradient: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)', inputBg: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)', inputPlaceholder: '短期记忆卡片…', inputShadow: '0 2px 12px 0 rgba(245, 158, 11, 0.10), 0 1.5px 0 0 #f59e0b', inputShadowFocus: '0 4px 18px 0 rgba(245, 158, 11, 0.18), 0 2px 0 0 #d97706' },
])

// 使用 store 中的卡片索引
const currentCardIndex = computed({
  get: () => storeCurrentCardIndex.value,
  set: (value) => historyStore.setCurrentCardIndex(value)
})

const isInputFocus = ref(false)
const isOverviewMode = ref(false)
const showSideCards = ref(false)
const currentCard = computed(() => cards.value[currentCardIndex.value])

// 固定输入框 placeholder
const fixedPlaceholder = ref('输入您的问题...')

// 后台数据加载函数
const loadBackgroundData = async () => {
  try {
    // 加载长期数据
    const longTermData = await aiDataStorage.getLongTermData()
    const longTermDataCount = longTermData.ai_long_term_data.data_count || 0
    console.log('后台长期数据 data_count:', longTermDataCount)
    
    // 加载短期数据
    const shortTermData = await aiDataStorage.getShortTermData()
    const shortTermDataCount = shortTermData.ai_short_term_memory.data_count || 0
    console.log('后台短期记忆 data_count:', shortTermDataCount)
  } catch (error) {
    console.error('后台数据加载失败:', error)
  }
}

// 组件挂载时加载历史消息和卡片位置
onMounted(() => {
  // 只在本地没有历史数据时发送欢迎消息
  const hasHistory = !!localStorage.getItem('chat_history');
  if (!hasHistory) {
    historyStore.addMessage({
      id: Date.now() + Math.random(),
      content: '欢迎来到聊天室！我是你的智能助手，很高兴为你服务。',
      type: 'bot'
    });
  }
  
  // 初始滚动到底部
  scrollToBottom();
  
  // 立即加载一次后台数据
  loadBackgroundData();
  
  // 设置定时器，每30秒在后台加载一次数据
  const backgroundTimer = setInterval(loadBackgroundData, 30000);
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(backgroundTimer);
  });
});

// 组件卸载时保存消息和卡片位置
onUnmounted(() => {
  historyStore.saveMessages()
  historyStore.saveCurrentCardIndex()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 控制侧边卡片显示
let sideCardTimer = null

const startSideCardTimer = () => {
  if (sideCardTimer) {
    clearTimeout(sideCardTimer)
  }
  
  // 只在历史聊天界面（第一张卡片）且不是概览模式时启动定时器
  if (currentCardIndex.value === 0 && !isOverviewMode.value) {
    sideCardTimer = setTimeout(() => {
      showSideCards.value = true
    }, 5000) // 5秒后显示
  }
}

const hideSideCards = () => {
  showSideCards.value = false
  if (sideCardTimer) {
    clearTimeout(sideCardTimer)
    sideCardTimer = null
  }
}

const addMessage = (content, type = 'user') => {
  historyStore.addMessage({
    id: Date.now() + Math.random(),
    content,
    type
  })
  scrollToBottom()
}

const handleSubmit = async () => {
  const value = inputValue.value.trim()
  if (value) {
    // 添加用户消息
    addMessage(value, 'user')
    inputValue.value = ''
    
    // 显示加载状态
    addMessage('正在思考中...', 'bot')
    
    try {
      // 构建历史消息上下文
      const historyContext = historyStore.messages
        .filter(msg => msg.type === 'user' || msg.type === 'bot')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      
      console.log('构建的历史上下文:', historyContext)

      // 调用AI服务，传递历史上下文
      const response = await aiService.sendMessage(value, {
        conversationHistory: historyContext
      })
      
      if (response.success) {
        // 移除加载消息
        historyStore.messages.pop()
        
        // 处理AI回复
        const aiContent = response?.data?.choices[0]?.message?.content

        // 先删除<think></think>标签中的内容
        const cleanContent = aiContent.replace(/<think>[\s\S]*?<\/think>/g, '')
        let parsedData = null
        console.log('cleanContent', cleanContent)
        try {
          // 使用更精确的正则表达式匹配JSON内容
          const startMatch = cleanContent.match(/<START>\s*(\{[\s\S]*?\})\s*<END>/)
          console.log('startMatch', startMatch)

          if (startMatch) {
            const jsonContent = startMatch[1].trim()
            try {
              parsedData = JSON.parse(jsonContent)
              
              // 使用answer字段作为回答显示，并保存到历史记录
              if (parsedData.answer) {
                addMessage(parsedData.answer, 'bot')
              } else {
                // 如果没有answer字段，使用清理后的内容
                addMessage(cleanContent, 'bot')
              }
              
              // 处理长期数据和短期记忆
              if (parsedData.longTermData && parsedData.longTermData.trim()) {
                try {
                  const timestamp = new Date().toISOString()
                  const key = `ai_long_term_${timestamp}`
                  const result = await aiDataStorage.saveLongTermData(key, parsedData.longTermData)
                  if (result.success) {
                    console.log('长期数据保存成功:', result.message)
                    // 保存成功后立即加载后台数据
                    loadBackgroundData();
                  } else {
                    console.error('长期数据保存失败:', result.message)
                  }
                } catch (error) {
                  console.error('保存长期数据时发生错误:', error)
                }
              }
              
              if (parsedData.shortTermMemory && parsedData.shortTermMemory.trim()) {
                console.log('短期记忆:', parsedData.shortTermMemory)
                try {
                  const timestamp = new Date().toISOString()
                  const key = `ai_short_term_${timestamp}`
                  const result = await aiDataStorage.saveShortTermData(key, parsedData.shortTermMemory)
                  if (result.success) {
                    console.log('短期记忆保存成功:', result.message)
                    // 保存成功后立即加载后台数据
                    loadBackgroundData();
                  } else {
                    console.error('短期记忆保存失败:', result.message)
                  }
                } catch (error) {
                  console.error('保存短期记忆时发生错误:', error)
                }
              }
            } catch (jsonParseError) {
              console.error('JSON解析失败:', jsonParseError)
              // JSON解析失败时，直接显示原始内容
              addMessage(cleanContent, 'bot')
            }
          } else {
            // 如果没有找到结构化格式，直接显示原始内容
            addMessage(cleanContent, 'bot')
          }
        } catch (parseError) {
          console.error('解析AI回复失败:', parseError)
          // 解析失败时显示原始内容
          addMessage(cleanContent, 'bot')
        }
        
        console.log('AI回复成功:', response.data)
      } else {
        // 移除加载消息
        historyStore.messages.pop()
        
        // 添加错误消息
        addMessage('抱歉，我现在无法回答您的问题，请稍后再试。', 'bot')
        console.error('AI回复失败:', response.error)
      }
    } catch (error) {
      // 移除加载消息
      historyStore.messages.pop()
      
      // 添加错误消息
      addMessage('抱歉，发生了网络错误，请检查网络连接。', 'bot')
      console.error('AI服务错误:', error)
    }
    
    // 保持在当前卡片，不自动跳转到历史记录页面
    hideSideCards() // 提交后隐藏侧边卡片
  }
  // 打印全局历史消息
  console.log('历史消息：', historyStore.messages)
}

// 滑动切换卡片
let startX = 0
let startY = 0
let deltaX = 0
let deltaY = 0
let isSwiping = false

function onTouchStart(e) {
  isSwiping = true
  startX = e.touches ? e.touches[0].clientX : e.clientX
  startY = e.touches ? e.touches[0].clientY : e.clientY
}
function onTouchMove(e) {
  if (!isSwiping) return
  const x = e.touches ? e.touches[0].clientX : e.clientX
  const y = e.touches ? e.touches[0].clientY : e.clientY
  deltaX = x - startX
  deltaY = y - startY
}
function onTouchEnd() {
  if (!isSwiping) return
  
  // 检查是否为向上滑动（显示概览模式）
  if (deltaY < -80 && Math.abs(deltaY) > Math.abs(deltaX)) {
    isOverviewMode.value = true
  }
  // 检查是否为向下滑动（退出概览模式）
  else if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX)) {
    isOverviewMode.value = false
  }
  // 水平滑动切换卡片
  else if (deltaX > 60) {
    // 向左滑动，显示上一张卡片
    if (currentCardIndex.value > 0) {
      historyStore.setCurrentCardIndex(currentCardIndex.value - 1)
    } else {
      // 如果是第一张卡片，跳转到最后一张
      historyStore.setCurrentCardIndex(cards.value.length - 1)
    }
    hideSideCards() // 切换卡片时隐藏侧边卡片
  } else if (deltaX < -60) {
    // 向右滑动，显示下一张卡片
    if (currentCardIndex.value < cards.value.length - 1) {
      historyStore.setCurrentCardIndex(currentCardIndex.value + 1)
    } else {
      // 如果是最后一张卡片，跳转到第一张
      historyStore.setCurrentCardIndex(0)
    }
    hideSideCards() // 切换卡片时隐藏侧边卡片
  }
  isSwiping = false
  deltaX = 0
  deltaY = 0
}

// 选择卡片
const selectCard = (index) => {
  historyStore.setCurrentCardIndex(index)
  isOverviewMode.value = false
  hideSideCards() // 选择卡片时隐藏侧边卡片
}

// 概览模式下的手势收起
let overviewStartY = 0
let overviewDeltaY = 0
let overviewSwiping = false
function onOverviewTouchStart(e) {
  overviewSwiping = true
  overviewStartY = e.touches ? e.touches[0].clientY : e.clientY
}
function onOverviewTouchMove(e) {
  if (!overviewSwiping) return
  const y = e.touches ? e.touches[0].clientY : e.clientY
  overviewDeltaY = y - overviewStartY
}
function onOverviewTouchEnd() {
  if (!overviewSwiping) return
  if (overviewDeltaY > 60) {
    isOverviewMode.value = false
    // 退出概览模式时，如果是第一张卡片，启动侧边卡片定时器
    if (currentCardIndex.value === 0) {
      startSideCardTimer()
    }
  }
  overviewSwiping = false
  overviewDeltaY = 0
}

// 卡片label
cards.value[0].label = '聊天记录';
cards.value[1].label = '长期记忆';
cards.value[2].label = '短期记忆';

// 页面加载时启动侧边卡片定时器
startSideCardTimer()
// 等比例缩小样式
const overviewCardUniformStyle = {
  width: '160px', // 以主卡片393px宽，600px高为例，缩略图宽160px
  aspectRatio: '393/600',
  borderRadius: '20px',
  overflow: 'hidden',
  background: '#fff',
  boxShadow: '0 2px 8px 0 rgba(60,60,120,0.08)',
  transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
};
</script>

<style scoped>
.profile-chat-root {
  height: 100vh;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-chat-frame {
  width: 393px;
  height: 100vh;
  max-height: 100vh;
  border-radius: 36px;
  background: #fff;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 120, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s ease;
}

.profile-chat-frame.overview-mode {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.profile-chat-history-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: stretch;
  max-height: calc(100% - 120px);
}

.profile-sidecard-left {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  height: 32px;
  border-radius: 50%;
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-sidecard-right {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidecard-icon {
  font-size: 1.25rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  opacity: 0.8;
  display: flex;
  gap: 2px;
}

.profile-sidecard-left .sidecard-icon {
  animation: slideLeft 2s infinite;
}

.profile-sidecard-right .sidecard-icon {
  animation: slideRight 2s infinite;
}

.arrow {
  color: #6366f1;
  transition: all 0.3s ease;
}

.arrow1 {
  animation: lightEffect 2s infinite;
}

.arrow2 {
  animation: lightEffect 2s infinite 0.3s;
}

.arrow3 {
  animation: lightEffect 2s infinite 0.6s;
}

/* 右侧箭头从左到右的光效 */
.profile-sidecard-right .arrow1 {
  animation: lightEffectRight 2s infinite;
}

.profile-sidecard-right .arrow2 {
  animation: lightEffectRight 2s infinite 0.3s;
}

.profile-sidecard-right .arrow3 {
  animation: lightEffectRight 2s infinite 0.6s;
}

/* 左侧箭头从右到左的光效 */
.profile-sidecard-left .arrow1 {
  animation: lightEffect 2s infinite 0.6s;
}

.profile-sidecard-left .arrow2 {
  animation: lightEffect 2s infinite 0.3s;
}

.profile-sidecard-left .arrow3 {
  animation: lightEffect 2s infinite 0s;
}

/* 右侧箭头从左到右的光效 */
.profile-sidecard-right .arrow1 {
  animation: lightEffectRight 2s infinite 0s;
}

.profile-sidecard-right .arrow2 {
  animation: lightEffectRight 2s infinite 0.3s;
}

.profile-sidecard-right .arrow3 {
  animation: lightEffectRight 2s infinite 0.6s;
}

@keyframes lightEffect {
  0%, 100% {
    color: #6366f1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  50% {
    color: #ffffff;
    text-shadow: 0 0 8px #6366f1, 0 0 12px #6366f1;
  }
}

@keyframes lightEffectRight {
  0%, 100% {
    color: #6366f1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  50% {
    color: #ffffff;
    text-shadow: 0 0 8px #6366f1, 0 0 12px #6366f1;
  }
}

@keyframes slideLeft {
  0% {
    transform: translateX(0);
    opacity: 0.8;
  }
  50% {
    transform: translateX(-8px);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 0.8;
  }
}

@keyframes slideRight {
  0% {
    transform: translateX(0);
    opacity: 0.8;
  }
  50% {
    transform: translateX(8px);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 0.8;
  }
}

.profile-chat-history-card {
  margin: 18px 18px 0 18px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 120, 0.10);
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2;

}

.profile-chat-history {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 18px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 28px;
}

.profile-chat-inputbar {
  display: flex;
  align-items: center;
  padding: 18px 18px 18px 18px;
  gap: 12px;
  flex-shrink: 0;
}

.profile-chat-input {
  flex: 1;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #f5f7fa 60%, #e0e7ff 100%);
  padding: 18px 20px;
  font-size: 0.8125rem;
  outline: none;
  color: #222;
  box-shadow: 0 2px 12px 0 rgba(60, 60, 120, 0.10), 0 1.5px 0 0 #e5e7eb;
  transition: box-shadow 0.18s, background 0.18s;
  font-weight: 500;
}

.profile-chat-input:focus {
  background: linear-gradient(135deg, #e0e7ff 60%, #c7d2fe 100%);
  box-shadow: 0 4px 18px 0 rgba(60, 60, 120, 0.18), 0 2px 0 0 #474747;
  color: #111;
}

.profile-chat-send {
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.profile-chat-send:disabled {
  background: #e5e7eb;
  color: #aaa;
  cursor: not-allowed;
}

.profile-card-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 10px 0 0 0;
  height: 18px;
}
.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e7ff;
  transition: background 0.2s, width 0.2s;
}
.indicator-dot.active {
  width: 10px;
  height: 10px;
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
}

/* 概览模式样式 */
.profile-overview-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-overview-header {
  text-align: center;
  padding: 20px 0;
}

.profile-overview-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.profile-overview-header p {
  margin: 0;
  font-size: 0.625rem;
  color: #64748b;
}

/* 横向滚动外层盒子 */
.profile-overview-cards-scrollbox {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.profile-overview-cards-horizontal {
  display: flex;
  flex-direction: row;
  gap: 24px;
  width: fit-content;
  padding: 50px 40px 50px 40px;
  scroll-snap-type: x mandatory;
  justify-content: center;
  align-items: flex-start;
}
.profile-overview-cards-scrollbox {
  scrollbar-width: none;
}
.profile-overview-cards-scrollbox::-webkit-scrollbar {
  display: none;
}

.profile-overview-card-horizontal {
  /* 宽高比由内联style控制 */
  position: relative;
}

.overview-card-aspect {
  width: 100%;
  aspect-ratio: 393/600;
  position: relative;
  background: transparent;
}

.overview-card-preview-horizontal {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: transparent;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.overview-card-scale {
  width: 100%;
  height: 100%;
  transform: scale(0.41); /* 160/393 ≈ 0.41 */
  transform-origin: center;
}

@media (max-width: 600px) {
  .profile-chat-root, .profile-chat-frame {
    width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}
</style> 