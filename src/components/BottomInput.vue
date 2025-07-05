<template>
  <div 
    class="bottom-input-container"
    :class="[`state-${currentState}`]"
    @click.stop
  >
    <!-- 遮罩层 -->
    <div 
      v-if="currentState !== 'default'" 
      class="overlay"
      @click="handleOverlayClick"
    ></div>
    
    <!-- 输入容器 -->
    <div class="input-panel" ref="inputPanel">
      <!-- 头部 - 只在展开和全屏状态显示 -->
      <div v-if="currentState !== 'default'" class="panel-header">
        <div class="panel-title-section">
          <h3 class="panel-title">对话历史</h3>
          <div class="ai-status" :class="{ 'connected': agentStore.isInitialized, 'processing': agentStore.isProcessing }">
            <div class="status-dot"></div>
          </div>
        </div>
        <div class="header-actions">
          <button 
            @click="clearHistory"
            class="action-btn"
            title="清空对话"
          >
            <Trash2 :size="20" />
          </button>
          <button 
            v-if="currentState === 'expanded'"
            @click="toggleFullscreen"
            class="action-btn"
            title="全屏"
          >
            <Maximize2 :size="20" />
          </button>
          <button 
            v-if="currentState === 'fullscreen'"
            @click="toggleFullscreen"
            class="action-btn"
            title="退出全屏"
          >
            <Minimize2 :size="20" />
          </button>
        </div>
      </div>
      
      <!-- 对话历史 - 只在展开和全屏状态显示 -->
      <div v-if="currentState !== 'default'" class="chat-history-container">
        <div class="chat-history" ref="chatHistoryRef">
          <div v-if="chatHistory.length === 0" class="empty-history">
            <div class="empty-icon">
              <MessageCircle :size="48" />
            </div>
            <p>还没有对话记录</p>
            <p class="empty-hint">开始输入来创建您的第一个对话</p>
          </div>
          <div v-else class="history-list">
            <div 
              v-for="(item, index) in chatHistory" 
              :key="item.id"
              class="history-item"
            >
              <div v-if="item.role === 'user'" class="history-input">
                <span>{{ item.content }}</span>
              </div>
              <div v-else class="history-response">
                <template v-if="item.status === 'loading'">
                  <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                </template>
                <template v-else-if="item.status === 'done'">
                  <span>{{ item.content }}</span>
                </template>
                <template v-else-if="item.status === 'error'">
                  <span class="error-message">{{ item.errorMsg || '请求失败，请重试' }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-wrapper">
          <input 
            v-model="inputValue"
            type="text" 
            :placeholder="placeholder"
            @keyup.enter="handleSubmit"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            class="main-input"
            ref="inputRef"
          />
          <button 
            v-if="inputValue.trim()"
            @click="handleSubmit"
            class="send-btn"
          >
            <Send :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore } from '@/stores/agentStore.js'
// import ConfirmDialog from './ConfirmDialog.vue' // 暂时移除
import { 
  Maximize2, 
  Minimize2, 
  Trash2,
  MessageCircle, 
  User, 
  Bot, 
  Send,
  RefreshCw
} from 'lucide-vue-next'
import { ProjectStorage } from '../utils/storage.js'

const props = defineProps({
  placeholder: {
    type: String,
    default: '描述您的需求，如：我想和朋友一起去东京玩五天...'
  },
  initialValue: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const agentStore = useAgentStore()

const inputValue = ref(props.initialValue)
const currentState = ref('default') // 'default', 'expanded', 'fullscreen'
const inputRef = ref(null)
const inputPanel = ref(null)
const chatHistoryRef = ref(null)
const isFocused = ref(false)
const lastUserInput = ref('')
const aiResponseComplete = ref(false) // 跟踪AI回复是否完成
const historyVersion = ref(0)

// 使用 Agent Store 的消息历史
const chatHistory = computed(() => {
  historyVersion.value // 依赖，强制刷新
  const projectId = ProjectStorage.getCurrentProjectId()
  if (!projectId) return []
  const project = ProjectStorage.getProject(projectId)
  if (!project || !project.conversationHistory) return []
  return project.conversationHistory
})

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

const handleInputFocus = () => {
  isFocused.value = true
  if (currentState.value === 'default') {
    expand()
  }
}

const handleInputBlur = () => {
  isFocused.value = false
}

const expand = () => {
  currentState.value = 'expanded'
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
    // 展开后滚动到底部
    scrollToBottom()
    
    // 如果输入框有内容，自动提交
    if (inputValue.value.trim()) {
      handleSubmit()
    }
  })
}

const collapse = () => {
  currentState.value = 'default'
  if (inputRef.value) {
    inputRef.value.blur()
  }
}

const toggleFullscreen = () => {
  if (currentState.value === 'expanded') {
    currentState.value = 'fullscreen'
  } else if (currentState.value === 'fullscreen') {
    currentState.value = 'expanded'
  }
  
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
    // 切换状态后滚动到底部
    scrollToBottom()
  })
}

const clearHistory = () => {
  const projectId = ProjectStorage.getCurrentProjectId()
  if (projectId) {
    const project = ProjectStorage.getProject(projectId)
    if (!project) return
    project.conversationHistory = []
    saveProjectAndTrigger(project)
  } else {
    // 没有当前项目，清空所有项目的对话历史
    const projects = ProjectStorage.getProjects()
    projects.forEach(p => { p.conversationHistory = [] })
    localStorage.setItem('plan-card-projects', JSON.stringify(projects))
    historyVersion.value++
  }
}

const handleOverlayClick = () => {
  if (!inputValue.value.trim()) {
    collapse()
  }
}

function saveProjectAndTrigger(project) {
  ProjectStorage.saveProject(project)
  historyVersion.value++
}

// 发送消息
function sendUserMessage(input) {
  const projectId = ProjectStorage.getCurrentProjectId()
  if (!projectId) return
  const project = ProjectStorage.getProject(projectId)
  if (!project) return
  if (!project.conversationHistory) project.conversationHistory = []

  const userMsg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    role: 'user',
    content: input,
    timestamp: new Date().toISOString(),
    status: 'done'
  }
  project.conversationHistory.push(userMsg)

  const aiMsg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    status: 'loading'
  }
  project.conversationHistory.push(aiMsg)

  saveProjectAndTrigger(project)
}

// AI接口返回后写入AI回复
function onAIResponse(aiText) {
  const projectId = ProjectStorage.getCurrentProjectId()
  if (!projectId) return
  const project = ProjectStorage.getProject(projectId)
  if (!project || !project.conversationHistory) return
  let inserted = false
  for (let i = project.conversationHistory.length - 1; i >= 0; i--) {
    const msg = project.conversationHistory[i]
    if (msg.role === 'assistant' && msg.status === 'loading') {
      msg.content = aiText
      msg.status = 'done'
      inserted = true
      break
    }
  }
  // AI回复后，插入一条"即将为您生成计划卡片..."的assistant消息
  if (inserted) {
    const tipMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      role: 'assistant',
      content: '即将为您生成计划卡片...',
      timestamp: new Date().toISOString(),
      status: 'done'
    }
    project.conversationHistory.push(tipMsg)
  }
  saveProjectAndTrigger(project)
}

// 错误处理
function onAIError(errorMsg) {
  const projectId = ProjectStorage.getCurrentProjectId()
  if (!projectId) return
  const project = ProjectStorage.getProject(projectId)
  if (!project || !project.conversationHistory) return
  for (let i = project.conversationHistory.length - 1; i >= 0; i--) {
    const msg = project.conversationHistory[i]
    if (msg.role === 'assistant' && msg.status === 'loading') {
      msg.status = 'error'
      msg.errorMsg = errorMsg
      break
    }
  }
  saveProjectAndTrigger(project)
}

// 辅助函数：提取AI回复文本
function extractAITextFromResponse(aiMessage) {
  if (typeof aiMessage === 'string') return aiMessage
  if (typeof aiMessage?.content === 'string') return aiMessage.content
  if (Array.isArray(aiMessage?.content)) {
    const text = aiMessage.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n')
    return text
  }
  if (aiMessage?.content?.text) return aiMessage.content.text
  return ''
}

// 发送消息入口
const handleSubmit = async () => {
  if (inputValue.value.trim()) {
    const input = inputValue.value.trim()
    inputValue.value = ''
    lastUserInput.value = input
    sendUserMessage(input)
    nextTick(() => { scrollToBottom() })
    try {
      await agentStore.sendMessage(input)
    } catch (error) {
      onAIError('请求失败，请重试')
    }
    nextTick(() => { scrollToBottom() })
  }
}

// 监听AI回复
watch(
  () => agentStore.messages.length,
  (newLen, oldLen) => {
    if (newLen > oldLen) {
      const newMessage = agentStore.messages[agentStore.messages.length - 1]
      if (newMessage.role === 'assistant') {
        const aiText = extractAITextFromResponse(newMessage)
        onAIResponse(aiText)
        nextTick(() => { scrollToBottom() })
      }
    }
  }
)

// 监听AI处理状态
watch(() => agentStore.isProcessing, (isProcessing) => {
  if (!isProcessing && aiResponseComplete.value) {
    // AI处理完成且回复已显示，重置状态
    aiResponseComplete.value = false
  }
})

// 点击外部区域处理
const handleClickOutside = (event) => {
  if (inputPanel.value && !inputPanel.value.contains(event.target)) {
    if (!inputValue.value.trim() && !isFocused.value) {
      collapse()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 初始化 AI Agent
  agentStore.initializeAgent()
  
  // 组件挂载后滚动到底部并检查滚动位置
  nextTick(() => {
    scrollToBottom()
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法给父组件
defineExpose({
  setValue: (value) => {
    inputValue.value = value
  },
  getValue: () => inputValue.value,
  handleSubmit,
  expand,
  collapse,
  toggleFullscreen,
  clearHistory
})
</script>

<style scoped>
.bottom-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.state-expanded .overlay,
.state-fullscreen .overlay {
  opacity: 1;
}

.input-panel {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

/* 默认状态 */
.state-default .input-panel {
  border-radius: 0;
  border: none;
  border-top: 1px solid #E5E5E5;
  box-shadow: none;
  background: #F8F9FA;
}

/* 展开状态 */
.state-expanded .input-panel {
  height: 50vh;
  max-height: 600px;
  min-height: 400px;
}

/* 全屏状态 */
.state-fullscreen .input-panel {
  height: 100vh;
  border-radius: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #E5E5E5;
  color: #333333;
}

.chat-history-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.chat-history {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  scroll-behavior: smooth;
}

/* 自定义滚动条样式 */
.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: #F8F9FA;
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb {
  background: #CCCCCC;
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: #999999;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666666;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-history p {
  margin: 4px 0;
}

.empty-hint {
  font-size: 0.875rem;
  color: #999999;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-input,
.history-response {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  max-width: 85%;
  word-wrap: break-word;
  animation: fadeInUp 0.3s ease-out;
}

.history-input {
  background: #F0F0F0;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  flex-direction: row;
}

.history-response {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.message-avatar {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.history-input .message-avatar {
  background: #333333;
  color: #FFFFFF;
  margin-left: 10px;
  margin-right: 0;
}

.history-response .message-avatar {
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  color: #666666;
  margin-right: 10px;
  margin-left: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-content span {
  display: block;
  word-break: break-word;
}

.history-input .message-content {
  text-align: left;
}

.history-response .message-content {
  text-align: left;
}

.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.loading-dots .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #666666;
  animation: loadingDots 1.4s infinite ease-in-out;
}

.loading-dots .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 消息动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-section {
  padding: 16px 20px;
  background: #FFFFFF;
  border-top: 1px solid #E5E5E5;
  flex-shrink: 0;
}

.state-default .input-section {
  background: #F8F9FA;
  border-top: none;
  padding: 12px 16px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.main-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 16px;
  background: #FFFFFF;
  color: #333333;
  transition: all 0.2s;
  box-sizing: border-box;
}

.main-input:focus {
  outline: none;
  border-color: #333333;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
}

.main-input::placeholder {
  color: #999999;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #333333;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover {
  background: #000000;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-radius: 8px;
  background: #FFE5E5;
  border: 1px solid #FFB2B2;
}

.retry-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #333333;
}
</style> 