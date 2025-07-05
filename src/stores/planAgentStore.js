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
    
    // 创建 PlanAgent 实例
    agent.value = new PlanAgent({
      systemPrompt: `你是一个专业的计划助手，专门帮助用户完善和优化他们的计划。

你的主要职责包括：
1. **理解用户需求**：仔细分析用户对现有计划的补充、修改或完善需求
2. **提供专业建议**：基于用户的具体情况给出个性化的建议和方案
3. **智能分析**：根据对话上下文，分析用户可能需要的新卡片或功能
4. **保持对话连贯性**：确保对话的自然流畅，理解用户的意图

**对话规则：**
- 用中文回复，语气友好、专业
- 根据用户的输入，智能分析是否需要生成新的计划卡片
- 如果用户提到新的需求或信息，主动建议相应的卡片类型
- 保持对话的连续性和自然性
- 不要询问用户是否要查看计划，专注于帮助完善计划内容

**卡片生成规则：**
当用户提供新的信息或需求时，请在回复中包含分析结果，格式如下：
{
  "scene": "travel|gift|meeting|general",
  "title": "新增功能的标题",
  "cards": ["card-type1", "card-type2", ...]
}

**可用卡片类型：**
- **旅行场景**：basic-info, flight, hotel, itinerary, packing, budget, tips
- **礼物场景**：basic-info, profile, gift, budget, tips, delivery
- **会议场景**：basic-info, meeting, participants, reminder, feedback, attachments
- **通用场景**：basic-info, suggestions, resources, timeline, checklist

请以友好、专业的方式与用户交流，主动理解用户的需求，并提供有价值的建议。`,
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
  const sendMessage = async (message, projectId = null) => {
    if (!agent.value) {
      initializeAgent()
    }
    
    error.value = null
    isProcessing.value = true
    
    try {
      await agent.value.sendMessage(message, projectId)
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