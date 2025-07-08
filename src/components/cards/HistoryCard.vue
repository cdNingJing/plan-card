<template>
  <div class="history-card-root">
    <!-- 固定头部 -->
    <div class="history-header">
      <div class="header-title">
        <span class="title-text">聊天记录</span>
      </div>
      <button 
        @click="clearHistory" 
        class="clear-btn"
        title="清空所有聊天记录"
      >
        <span class="clear-text">清空</span>
      </button>
    </div>
    
    <!-- 自动发送开关 -->
    <!-- <div class="auto-send-toggle">
      <button 
        @click="toggleAutoSend" 
        :class="['toggle-btn', { active: isAutoSendEnabled }]"
      >
        {{ isAutoSendEnabled ? '关闭自动发送' : '开启自动发送' }}
      </button>
    </div> -->
    
    <!-- 可滚动的内容区域 -->
    <div class="history-content" ref="historyContainerRef">
      <div v-for="message in messages" :key="message.id" :class="['history-bubble', message.type]">
        <span class="bubble-content">{{ message.content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'

const props = defineProps({ messages: Array })
const historyStore = useHistoryStore()

const historyContainerRef = ref(null)
const isAutoSendEnabled = ref(false)
let autoSendInterval = null

const mockMessages = [
  '你好！我是你的智能助手，有什么可以帮助你的吗？',
  '今天天气不错，适合出去走走呢！',
  '我注意到你最近很活跃，继续保持！',
  '有什么新的想法或问题想讨论吗？',
  '我随时都在这里为你服务！',
  '今天过得怎么样？',
  '有什么有趣的事情想分享吗？',
  '我很好奇你的想法，能告诉我更多吗？'
]

const toggleAutoSend = () => {
  isAutoSendEnabled.value = !isAutoSendEnabled.value
  
  if (isAutoSendEnabled.value) {
    startAutoSend()
  } else {
    stopAutoSend()
  }
}

const startAutoSend = () => {
  autoSendInterval = setInterval(() => {
    const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
    historyStore.addMessage({
      id: Date.now() + Math.random(),
      content: randomMessage,
      type: 'bot'
    })
  }, 5000) // 每5秒发送一条
}

const stopAutoSend = () => {
  if (autoSendInterval) {
    clearInterval(autoSendInterval)
    autoSendInterval = null
  }
}

// 清空历史对话
const clearHistory = () => {
  if (confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
    historyStore.clearMessages()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (historyContainerRef.value) {
      historyContainerRef.value.scrollTop = historyContainerRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  // 主动加载历史数据
  historyStore.loadMessages();
  console.log('加载到的历史消息:', historyStore.messages);

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
});

onUnmounted(() => {
  stopAutoSend()
})
</script>

<style scoped>
.history-card-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
}

/* 固定头部样式 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 12px 0;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  margin-bottom: 8px;
  flex-shrink: 0;
  background: inherit;
  z-index: 10;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 14px;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.clear-btn:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px 0 rgba(220, 38, 38, 0.15);
}

.clear-btn:active {
  transform: translateY(0);
}

.clear-icon {
  font-size: 16px;
}

.clear-text {
  font-size: 13px;
}

/* 可滚动的内容区域 */
.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  min-height: 0;
}

.auto-send-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.history-bubble {
  max-width: 80%;
  padding: 12px 18px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.6;
  word-break: break-all;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 120, 0.06);
  background: #f3f4f6;
  color: #333;
  align-self: flex-start;
  transition: background 0.2s, color 0.2s;
}

.history-bubble.user {
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  align-self: flex-end;
}

.history-bubble.bot {
  background: #f3f4f6;
  color: #333;
  align-self: flex-start;
}

.bubble-content {
  display: block;
  white-space: pre-wrap;
}
</style> 