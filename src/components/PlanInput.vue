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
          <h3 class="panel-title">计划对话历史</h3>
          <div class="ai-status" :class="{ 'connected': planAgentStore.isInitialized, 'processing': planAgentStore.isProcessing }">
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
            <p class="empty-hint">开始补充或完善您的计划</p>
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
                  <span>{{ parseAIContent(item.content) }}</span>
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
import { ref, nextTick, onMounted, onUnmounted, computed, watch } from 'vue'
import { usePlanAgentStore } from '@/stores/planAgentStore.js'
import { useCardStore } from '@/stores/cardStore.js'
import { useProjectCardStore } from '@/stores/projectCardStore.js'
import { ProjectStorage } from '../utils/storage.js'
import { CardModificationService } from '../services/cardModificationService.js'
import { 
  Maximize2, 
  Minimize2, 
  Trash2,
  MessageCircle, 
  Send
} from 'lucide-vue-next'

const props = defineProps({
  projectId: { type: String, required: true },
  placeholder: { type: String, default: '继续补充、完善或修改您的计划...' },
  scenario: { type: String, default: 'travel' }
})

const planAgentStore = usePlanAgentStore()
const cardStore = useCardStore()
const projectCardStore = useProjectCardStore()
const cardModificationService = new CardModificationService()
const inputValue = ref('')
const currentState = ref('default')
const inputRef = ref(null)
const inputPanel = ref(null)
const chatHistoryRef = ref(null)
const isFocused = ref(false)
const historyVersion = ref(0)

// 解析AI回复内容的函数
const parseAIContent = (content) => {
  if (typeof content === 'string') {
    return content
  }
  
  if (typeof content === 'object' && content !== null) {
    // 如果是数组，提取文本内容
    if (Array.isArray(content)) {
      return content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('')
    }
    
    // 如果是对象，尝试提取文本内容
    if (content.content && Array.isArray(content.content)) {
      return content.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('')
    }
    
    // 如果是其他对象，尝试转换为字符串
    try {
      return JSON.stringify(content)
    } catch (e) {
      return String(content)
    }
  }
  
  return String(content)
}

const chatHistory = computed(() => {
  historyVersion.value // 强制刷新
  planAgentStore.updateVersion // 监听 planAgentStore 的更新
  const project = ProjectStorage.getProject(props.projectId)
  console.log('[PlanInput] chatHistory computed, 项目:', project)
  if (!project || !project.conversationHistory) return []
  console.log('[PlanInput] chatHistory computed, 返回对话历史:', project.conversationHistory)
  return project.conversationHistory
})

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
const handleInputBlur = () => { isFocused.value = false }
const expand = () => {
  currentState.value = 'expanded'
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus()
    scrollToBottom()
    if (inputValue.value.trim()) handleSubmit()
  })
}
const collapse = () => {
  currentState.value = 'default'
  if (inputRef.value) inputRef.value.blur()
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
  const project = ProjectStorage.getProject(props.projectId)
  if (project) {
    project.conversationHistory = []
    saveProjectAndTrigger(project)
  }
}

const handleOverlayClick = () => {
  if (!inputValue.value.trim()) collapse()
}
function saveProjectAndTrigger(project) {
  console.log('[PlanInput] saveProjectAndTrigger', project ? JSON.parse(JSON.stringify(project)) : '项目为空')
  console.log('[PlanInput] 保存前的 historyVersion:', historyVersion.value)
  ProjectStorage.saveProject(project)
  historyVersion.value++
  console.log('[PlanInput] 保存后的 historyVersion:', historyVersion.value)
}
function sendUserMessage(input) {
  const project = ProjectStorage.getProject(props.projectId)
  console.log('[PlanInput] sendUserMessage, 当前项目:', project ? JSON.parse(JSON.stringify(project)) : '项目不存在')
  if (!project) return
  
  // 设置当前项目ID，确保AI回复能正确关联到项目
  ProjectStorage.setCurrentProjectId(props.projectId)
  
  // 解析用户输入中的修改意图
  const modifications = cardModificationService.parseModificationIntent(input)
  if (modifications.length > 0) {
    console.log('[PlanInput] 检测到用户修改意图:', modifications)
    
    // 如果有明确的修改意图，可以在这里预处理
    // 例如：如果用户说"修改目的地为北京"，可以提前准备相关的上下文信息
  }
  
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
  console.log('[PlanInput] 新增消息后 conversationHistory:', project.conversationHistory.length, '条消息')
  console.log('[PlanInput] 新增的AI消息ID:', aiMsg.id)
  saveProjectAndTrigger(project)
}
const handleSubmit = async () => {
  if (inputValue.value.trim()) {
    const input = inputValue.value.trim()
    inputValue.value = ''
    sendUserMessage(input)
    nextTick(() => { scrollToBottom() })
    try {
      await planAgentStore.sendMessage(input, props.projectId, true, props.scenario) // 使用新的对话专用提示词
    } catch (error) {
      // 错误处理略
      console.warn('[PlanInput] planAgentStore.sendMessage error', error)
    }
    nextTick(() => { scrollToBottom() })
  }
}

// 监听AI回复并生成卡片
const processAIResponse = (aiText) => {
  console.log('[PlanInput] processAIResponse 开始:', aiText)
  console.log('[PlanInput] AI回复内容长度:', aiText?.length)
  console.log('[PlanInput] AI回复内容前200字符:', aiText?.substring(0, 200))
  
  const project = ProjectStorage.getProject(props.projectId)
  if (!project) {
    console.warn('[PlanInput] 项目不存在')
    return
  }

  // 首先尝试解析AI回复中的卡片修改指令
  const modification = cardModificationService.parseAIResponse(aiText)
  console.log('[PlanInput] 解析的修改指令:', modification)
  
  if (modification && modification.action === 'update_card') {
    console.log('[PlanInput] 检测到卡片修改指令:', modification)
    
    // 执行卡片修改
    const result = cardModificationService.executeModification(project, modification)
    console.log('[PlanInput] 卡片修改执行结果:', result)
    
    if (result.success) {
      console.log('[PlanInput] 卡片修改成功:', result)
      
      // 保存修改后的项目
      ProjectStorage.saveProject(project)
      console.log('[PlanInput] 项目已保存到存储')
      
      // 触发卡片更新 - 通过emit事件通知父组件
      if (result.updatedCards && result.updatedCards.length > 0) {
        console.log('[PlanInput] 准备更新卡片数量:', result.updatedCards.length)
        
        result.updatedCards.forEach((card, index) => {
          console.log(`[PlanInput] 处理第${index + 1}个卡片:`, card)
          
          // 对于basic-info卡片，需要特殊处理formData
          if (card.type === 'basic-info' && card.data.formData) {
            // 将formData作为更新数据传递给父组件
            const updateData = {
              formData: card.data.formData,
              ...card.data // 包含其他字段如title等
            }
            console.log('[PlanInput] 发送basic-info卡片更新:', updateData)
            projectCardStore.updateCardData(card.id, updateData)
          } else {
            // 其他卡片直接更新整个data
            console.log('[PlanInput] 发送其他卡片更新:', card.data)
            projectCardStore.updateCardData(card.id, card.data)
          }
        })
      } else {
        console.warn('[PlanInput] 没有需要更新的卡片')
      }
      
      // 添加修改确认消息到对话历史
      const confirmMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        role: 'assistant',
        content: result.message || modification.message || '已为您更新了相关信息',
        timestamp: new Date().toISOString(),
        status: 'done'
      }
      
      if (!project.conversationHistory) project.conversationHistory = []
      project.conversationHistory.push(confirmMsg)
      ProjectStorage.saveProject(project)
      console.log('[PlanInput] 确认消息已添加到对话历史')
      
      // 触发组件更新
      historyVersion.value++
      console.log('[PlanInput] 历史版本已更新:', historyVersion.value)
      return // 如果成功修改了卡片，就不需要生成新卡片了
    } else {
      console.warn('[PlanInput] 卡片修改失败:', result.message)
    }
  } else {
    console.log('[PlanInput] 未检测到卡片修改指令，继续处理新卡片生成')
  }

  // 获取最新的用户输入
  let userInput = project.description
  if (project.conversationHistory) {
    const lastUserMsg = project.conversationHistory
      .filter(msg => msg.role === 'user')
      .pop()
    if (lastUserMsg) {
      userInput = lastUserMsg.content
    }
  }
  
  // 生成新卡片
  const newCards = cardStore.generateCards(userInput, aiText)
  if (newCards.length > 0) {
    // 将新卡片添加到项目中
    if (!project.cards) project.cards = []
    project.cards = [...project.cards, ...newCards]
    ProjectStorage.saveProject(project)
    console.log('[PlanInput] 根据AI回复生成新卡片:', newCards.length, '张卡片')
  }
}
// 监听对话历史变化，处理AI回复
watch(chatHistory, (newHistory, oldHistory) => {
  console.log('[PlanInput] chatHistory 变化:', {
    newLength: newHistory?.length || 0,
    oldLength: oldHistory?.length || 0,
    newHistory: newHistory,
    oldHistory: oldHistory
  })
  
  // 检查是否有新消息添加
  if (newHistory && oldHistory && newHistory.length > oldHistory.length) {
    // 检查是否有新的AI回复完成
    const newMessages = newHistory.slice(oldHistory.length)
    console.log('[PlanInput] 新消息:', newMessages)
    
    const completedAIResponse = newMessages.find(msg => 
      msg.role === 'assistant' && msg.status === 'done'
    )
    
    if (completedAIResponse) {
      console.log('[PlanInput] 检测到新AI回复完成:', completedAIResponse)
      const parsedContent = parseAIContent(completedAIResponse.content)
      console.log('[PlanInput] 解析后的内容:', parsedContent)
      processAIResponse(parsedContent)
      
      // AI 回复完成后自动滚动到底部
      nextTick(() => { scrollToBottom() })
    }
  }
  
  // 检查是否有现有消息状态从loading变为done
  if (newHistory && oldHistory && newHistory.length === oldHistory.length) {
    console.log('[PlanInput] 检查消息状态变化')
    
    // 找到状态从loading变为done的AI消息
    for (let i = 0; i < newHistory.length; i++) {
      const newMsg = newHistory[i]
      const oldMsg = oldHistory[i]
      
      if (newMsg && oldMsg && 
          newMsg.role === 'assistant' && 
          newMsg.status === 'done' && 
          oldMsg.status === 'loading') {
        
        console.log('[PlanInput] 检测到AI消息状态变化:', {
          old: oldMsg,
          new: newMsg
        })
        
        // 添加延迟确保AI回复完全加载
        setTimeout(() => {
          const parsedContent = parseAIContent(newMsg.content)
          console.log('[PlanInput] 延迟解析后的内容:', parsedContent)
          processAIResponse(parsedContent)
          
          // AI 回复完成后自动滚动到底部
          nextTick(() => { scrollToBottom() })
        }, 100) // 延迟100ms确保内容完全加载
        
        break
      }
    }
  }
}, { deep: true })

// 点击外部区域处理
const handleClickOutside = (event) => {
  if (inputPanel.value && !inputPanel.value.contains(event.target)) {
    if (!inputValue.value.trim() && !isFocused.value) {
      collapse()
    }
  }
}

// 测试卡片修改功能
const testCardModification = () => {
  console.log('[PlanInput] 开始测试卡片修改功能')
  
  const project = ProjectStorage.getProject(props.projectId)
  if (!project) {
    console.warn('[PlanInput] 测试失败：项目不存在')
    return
  }
  
  console.log('[PlanInput] 项目卡片:', project.cards)
  
  // 查找basic-info卡片
  const basicInfoCard = project.cards.find(card => card.type === 'basic-info')
  if (!basicInfoCard) {
    console.warn('[PlanInput] 测试失败：未找到basic-info卡片')
    return
  }
  
  console.log('[PlanInput] 找到basic-info卡片:', basicInfoCard)
  console.log('[PlanInput] 当前projectCardStore状态:', {
    projectCards: projectCardStore.projectCards,
    updateVersion: projectCardStore.updateVersion
  })
  
  // 直接使用projectCardStore更新卡片数据
  const updateData = {
    formData: {
      destination: '北京',
      title: '北京五日游',
      duration: 5,
      budget: 5000
    }
  }
  
  console.log('[PlanInput] 准备更新卡片数据:', updateData)
  const success = projectCardStore.updateCardData(basicInfoCard.id, updateData)
  
  if (success) {
    console.log('[PlanInput] 卡片更新成功')
    console.log('[PlanInput] 更新后的projectCardStore状态:', {
      projectCards: projectCardStore.projectCards,
      updateVersion: projectCardStore.updateVersion
    })
    
    // 保存到项目
    basicInfoCard.data = { ...basicInfoCard.data, ...updateData }
    ProjectStorage.saveProject(project)
    
    console.log('[PlanInput] 测试完成，请检查BasicInfoCard是否更新')
  } else {
    console.warn('[PlanInput] 卡片更新失败')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  const project = ProjectStorage.getProject(props.projectId)
  console.log('[PlanInput] onMounted, 当前项目:', project ? JSON.parse(JSON.stringify(project)) : '项目不存在')
  
  // 初始化计划页面专用的 agent
  planAgentStore.initializeAgent()
  
  nextTick(() => { scrollToBottom() })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
defineExpose({
  setValue: (value) => { inputValue.value = value },
  getValue: () => inputValue.value,
  handleSubmit,
  expand,
  collapse,
  toggleFullscreen,
  clearHistory,
  testCardModification
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

.panel-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333333;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #CCCCCC;
  transition: all 0.3s;
}

.ai-status.connected .status-dot {
  background: #4CAF50;
}

.ai-status.processing .status-dot {
  background: #FF9800;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
  color: #D32F2F;
  font-size: 0.875rem;
}
</style>