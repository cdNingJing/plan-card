 // 计划页面专用的 AI Agent 服务类
export class PlanAgent {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || '/api/claude',
      apiKey: config.apiKey || 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK',
      model: config.model || 'claude-3-7-sonnet-20250219',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 64000,
      systemPrompt: config.systemPrompt || this.getDefaultSystemPrompt(),
      ...config
    }
    
    this.isProcessing = false
    this.callbacks = {
      onMessage: null,
      onError: null,
      onComplete: null
    }
  }

  // 默认系统提示词 - 专门针对计划页面的对话
  getDefaultSystemPrompt() {
    return `你是一个专业的计划助手，专门帮助用户完善和优化他们的计划。

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

请以友好、专业的方式与用户交流，主动理解用户的需求，并提供有价值的建议。`
  }

  // 设置回调函数
  setCallback(event, callback) {
    this.callbacks[event] = callback
  }

  // 发送消息
  async sendMessage(message, projectId = null) {
    if (this.isProcessing) {
      throw new Error('PlanAgent is currently processing another request')
    }

    this.isProcessing = true
    
    try {
      // 触发用户消息回调
      if (this.callbacks.onMessage) {
        this.callbacks.onMessage({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        })
      }

      // 获取历史对话数据
      let conversationHistory = []
      if (projectId) {
        const { ProjectStorage } = await import('../utils/storage.js')
        const project = ProjectStorage.getProject(projectId)
        if (project && project.conversationHistory) {
          // 过滤出已完成的对话消息，排除当前正在加载的消息
          conversationHistory = project.conversationHistory
            .filter(msg => msg.status === 'done')
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }))
        }
      }

      // 构建请求数据，包含历史对话
      const requestData = {
        model: this.config.model,
        system: this.config.systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      }

      console.log('[PlanAgent] 发送请求，包含历史对话:', {
        historyLength: conversationHistory.length,
        messages: requestData.messages
      })

      // 发送请求
      const response = await this.callAIAPI(requestData)
      
      // 处理响应
      await this.handleResponse(response)
      
    } catch (error) {
      console.error('PlanAgent error:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(error)
      }
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  // 调用 AI API
  async callAIAPI(requestData) {
    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API 调用失败: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }
      
      const claudeResponse = await response.json()
      console.log('[PlanAgent] Claude API 响应:', claudeResponse)
      
      return claudeResponse
      
    } catch (error) {
      console.error('PlanAgent API 调用失败:', error)
      throw error
    }
  }

  // 处理 AI 响应
  async handleResponse(response) {
    const message = response.content?.[0]?.text || '抱歉，我无法处理您的请求。'
    
    // 触发AI消息回调
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString()
      })
    }

    // 触发完成回调
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(message)
    }
  }

  // 获取状态
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      isInitialized: true
    }
  }

  // 清除历史
  clearHistory() {
    // PlanAgent 不需要维护历史，每次都是独立的对话
  }
}