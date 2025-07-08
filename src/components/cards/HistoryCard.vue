<template>
  <div class="history-card-root" ref="historyContainerRef">
    <!-- 自动发送开关 -->
    <!-- <div class="auto-send-toggle">
      <button 
        @click="toggleAutoSend" 
        :class="['toggle-btn', { active: isAutoSendEnabled }]"
      >
        {{ isAutoSendEnabled ? '关闭自动发送' : '开启自动发送' }}
      </button>
    </div> -->
    
    <div v-for="message in messages" :key="message.id" :class="['history-bubble', message.type]">
      <span class="bubble-content">{{ message.content }}</span>
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
  // 页面加载时自动发送欢迎消息
  if (props.messages && props.messages.length === 0) {
    setTimeout(() => {
      historyStore.addMessage({
        id: Date.now() + Math.random(),
        content: '欢迎来到聊天室！我是你的智能助手，很高兴为你服务。',
        type: 'bot'
      })
    }, 1000)
  }
  
  // 初始滚动到底部
  scrollToBottom()
})

onUnmounted(() => {
  stopAutoSend()
})
</script>

<style scoped>
.history-card-root {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
  padding: 0;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.auto-send-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.toggle-btn {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  border-color: #6366f1;
}

.toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px 0 rgba(60, 60, 120, 0.15);
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