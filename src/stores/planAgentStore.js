import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { PlanAgent } from '../services/planAgent.js'
import { ProjectStorage } from '../utils/storage.js'

export const usePlanAgentStore = defineStore('planAgent', () => {
  // Agent 实例
  const agent = ref(null)
  
  // Agent 状态
  const isProcessing = ref(false)
  const isInitialized = ref(false)
  const error = ref(null)
  
  // 用于触发组件更新的版本号
  const updateVersion = ref(0)
  
  // 初始化 Agent
  const initializeAgent = (config = {}) => {
    if (agent.value) {
      return agent.value
    }
    
    // 创建 PlanAgent 实例，使用新的对话专用提示词
    agent.value = new PlanAgent({
      systemPrompt: `你是一个智能的计划对话助手，专门帮助用户通过对话方式完善和优化他们的计划。

**你的核心功能：**
1. **智能对话理解**：准确理解用户在对话中表达的需求、想法和建议
2. **计划优化建议**：基于对话内容，提供具体的计划改进和补充建议
3. **上下文感知**：记住对话历史，保持对话的连贯性和逻辑性
4. **主动引导**：在合适的时候主动询问细节，帮助用户完善计划

**对话风格：**
- 使用自然、友好的中文对话
- 保持专业但不过于正式的语气
- 适时使用表情符号增加亲和力
- 根据用户的语言风格调整回复方式

**回复原则：**
- 直接回答用户的问题，不要绕弯子
- 提供具体、可操作的建议
- 在回复中体现对用户需求的理解
- 鼓励用户继续分享更多信息

**特殊功能：**
- 当用户提到新的计划元素时，主动建议相关的卡片类型
- 帮助用户梳理思路，整理计划要点
- 提供实用的建议和技巧
- 在对话中保持积极正面的态度

**注意事项：**
- 不要询问用户是否要查看计划，专注于对话本身
- 避免过于冗长的回复，保持简洁明了
- 根据用户的反馈调整建议方向
- 始终保持耐心和专业的服务态度

请以自然、友好的方式与用户对话，帮助他们通过交流完善自己的计划。`,
      ...config
    })
    
    // 设置回调函数
    agent.value.setCallback('onMessage', (message) => {
      console.log('[planAgentStore] onMessage 回调:', message)
      
      // 如果是AI回复，更新当前项目的对话历史
      if (message.role === 'assistant') {
        const currentProjectId = ProjectStorage.getCurrentProjectId()
        console.log('[planAgentStore] 当前项目ID:', currentProjectId)
        if (currentProjectId) {
          const project = ProjectStorage.getProject(currentProjectId)
          console.log('[planAgentStore] 获取到的项目:', project)
          if (project && project.conversationHistory) {
            // 找到对应的loading消息并更新
            const loadingMsg = project.conversationHistory.find(msg => 
              msg.role === 'assistant' && msg.status === 'loading'
            )
            console.log('[planAgentStore] 找到的loading消息:', loadingMsg)
            if (loadingMsg) {
              loadingMsg.content = message.content
              loadingMsg.status = 'done'
              console.log('[planAgentStore] 更新项目对话历史:', loadingMsg)
              ProjectStorage.saveProject(project)
              
              // 触发组件更新
              updateVersion.value++
            }
          }
        }
      }
    })
    
    agent.value.setCallback('onError', (err) => {
      error.value = err
      isProcessing.value = false
    })
    
    agent.value.setCallback('onComplete', (message) => {
      isProcessing.value = false
    })
    
    isInitialized.value = true
    return agent.value
  }
  
  // 发送消息
  const sendMessage = async (message, projectId = null, usePlanInputPrompt = true) => {
    if (!agent.value) {
      initializeAgent()
    }
    
    error.value = null
    isProcessing.value = true
    
    try {
      await agent.value.sendMessage(message, projectId, usePlanInputPrompt)
    } catch (err) {
      error.value = err
      console.error('PlanAgent 发送消息失败:', err)
      isProcessing.value = false
    }
  }
  
  // 清除错误
  const clearError = () => {
    error.value = null
  }
  
  // 获取 Agent 状态
  const getAgentStatus = () => {
    return {
      isProcessing: isProcessing.value,
      isInitialized: isInitialized.value,
      error: error.value
    }
  }

  return {
    // 状态
    isProcessing,
    isInitialized,
    error,
    updateVersion,
    
    // 方法
    initializeAgent,
    sendMessage,
    clearError,
    getAgentStatus
  }
})