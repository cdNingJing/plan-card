<template>
  <div class="history-card-root">
    <!-- 固定头部 -->
    <div class="history-header">
      <div class="header-title">
        <span class="title-text">聊天记录</span>
      </div>
      <div class="header-actions">
        <button class="toggle-btn" @click="onToggleFull">
          {{ isFull ? '收起' : '全屏' }}
        </button>
        <button 
          @click="clearHistory" 
          class="clear-btn"
          title="清空所有聊天记录"
        >
          <span class="clear-text">清空</span>
        </button>
      </div>
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
      <div v-for="(message, index) in displayMessages" :key="message?.id || Math.random()" :class="['history-bubble', message?.type]">
        <span class="bubble-content" v-html="getHighlightedContent(message, index)"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'

const props = defineProps({ 
  messages: { 
    type: Array, 
    default: () => [] 
  },
  onToggleFull: {
    type: Function,
    default: null
  },
  isFull: {
    type: Boolean,
    default: false
  }
})
const historyStore = useHistoryStore()

const historyContainerRef = ref(null)

// 计算显示的消息，优先使用props.messages，如果没有则使用store中的消息
const displayMessages = computed(() => {
  return props.messages && props.messages.length > 0 ? props.messages : historyStore.messages
})

// 获取高亮内容的方法
const getHighlightedContent = (message, index) => {
  let content = message?.content || ''
  
  // 只对最新的bot消息应用高亮效果
  if (message?.type === 'bot' && index === displayMessages.value.length - 1) {
    const extractedInfo = historyStore.getExtractedInfo()
    console.log('📋 extractedInfo:', extractedInfo)
    
    if (extractedInfo && Array.isArray(extractedInfo) && extractedInfo.length > 0) {
      console.log('🎯 开始高亮处理，原始内容:', content)
      
      // 为每个提取的信息添加高亮标记
      extractedInfo.forEach(info => {
        const escapedInfo = info.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(${escapedInfo})`, 'gi')
        console.log(`🔍 搜索关键词: "${info}", 正则: ${regex}`)
        
        const matches = content.match(regex)
        console.log(`📌 找到匹配:`, matches)
        
        content = content.replace(regex, '<span class="highlight-info">$1</span>')
      })
      
      console.log('✨ 高亮处理后的内容:', content)
    }
  }
  
  return content
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
watch([() => props.messages, () => displayMessages.value], () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  // 主动加载历史数据
  historyStore.loadMessages();
  console.log('加载到的历史消息:', historyStore.messages);

  // 只在本地没有历史数据且store中也没有消息时发送欢迎消息
  const hasHistory = !!localStorage.getItem('chat_history');
  const hasStoreMessages = historyStore.messages && historyStore.messages.length > 0;
  
  if (!hasHistory && !hasStoreMessages) {
    historyStore.addMessage({
      id: Date.now() + Math.random(),
      content: '欢迎来到聊天室！我是你的智能助手，很高兴为你服务。',
      type: 'bot'
    });
  }

  // 初始滚动到底部
  scrollToBottom();
});


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
  padding: 0 0 12px 0;
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
  font-size: 0.85rem;
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
  font-size: 0.625rem;
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
  font-size: 0.5625rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
  border: 1px solid #bfcfff;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 0.625rem;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}
.toggle-btn:hover {
  background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%);
  border-color: #6366f1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px 0 rgba(99, 102, 241, 0.10);
}
.toggle-btn:active {
  transform: translateY(0);
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
  font-size: 0.85rem;
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
  /* white-space: pre-wrap; */
}

  /* 高亮信息样式 */
  :deep(.highlight-info) {
    color: #1e40af;
    font-weight: 600;
  }
</style> 