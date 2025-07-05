// AI Agent 服务类
export class AIAgent {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || '/api/chat',
      model: config.model || 'gpt-3.5-turbo',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      systemPrompt: config.systemPrompt || this.getDefaultSystemPrompt(),
      ...config
    }
    
    this.tools = new Map()
    this.conversationHistory = []
    this.isProcessing = false
    this.callbacks = {
      onMessage: null,
      onToolCall: null,
      onError: null,
      onComplete: null
    }
  }

  // 默认系统提示词
  getDefaultSystemPrompt() {
    return `你是一个友好的AI助手，可以与用户进行自然对话。

请用中文回复，语气要友好、自然。你可以：
1. 回答用户的问题
2. 提供建议和帮助
3. 进行日常对话
4. 帮助用户解决问题

当用户表达想要制定计划时（比如旅行、会议、礼物、或其他安排），请：
1. 简短回应用户的计划需求
2. 直接回复："我来为您创建一个详细的计划。正在跳转到计划页面..."
3. 不要询问更多细节，直接跳转

请保持回复简洁，不要询问用户更多信息。`
  }

  // 注册工具
  registerTool(name, tool) {
    this.tools.set(name, {
      name,
      description: tool.description,
      parameters: tool.parameters,
      execute: tool.execute
    })
  }

  // 设置回调函数
  setCallback(event, callback) {
    this.callbacks[event] = callback
  }

  // 发送消息（包含用户消息添加）
  async sendMessage(message, options = {}) {
    if (this.isProcessing) {
      throw new Error('Agent is currently processing another request')
    }

    this.isProcessing = true
    
    try {
      // 添加用户消息到历史记录
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })

      // 触发消息回调
      if (this.callbacks.onMessage) {
        this.callbacks.onMessage({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        })
      }

      await this.processMessage(message)
      
    } catch (error) {
      console.error('Agent error:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(error)
      }
      throw error
    } finally {
      this.isProcessing = false
    }
  }
  
  // 处理消息（不添加用户消息，用于已经添加过用户消息的情况）
  async processMessage(message) {
    // 如果历史记录中没有这条消息，添加它
    const lastMessage = this.conversationHistory[this.conversationHistory.length - 1]
    if (!lastMessage || lastMessage.content !== message || lastMessage.role !== 'user') {
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })
    }

    // 构建请求数据
    const requestData = {
      model: this.config.model,
      messages: [
        { role: 'system', content: this.config.systemPrompt },
        ...this.conversationHistory
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      tools: this.getToolsSchema(),
      tool_choice: 'auto'
    }

    // 发送请求
    const response = await this.callAIAPI(requestData)
    
    // 处理响应
    await this.handleResponse(response)
  }

  // 调用 AI API
  async callAIAPI(requestData) {
    // 使用配置的 API 调用函数
    const { getAPICall } = await import('@/config/aiConfig.js')
    const apiCall = getAPICall()
    
    return await apiCall(requestData)
  }

  // 处理 AI 响应
  async handleResponse(response) {
    const message = response.choices[0].message
    
    // 清理消息内容，移除工具调用相关的文本
    const cleanedContent = this.cleanMessageContent(message.content)
    
    // 添加助手消息到历史记录（使用清理后的内容）
    this.conversationHistory.push({
      role: 'assistant',
      content: cleanedContent,
      timestamp: new Date().toISOString()
    })

    // 触发消息回调（使用清理后的内容）
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        role: 'assistant',
        content: cleanedContent,
        timestamp: new Date().toISOString()
      })
    }

    // 先触发完成回调，让UI有时间显示AI回复
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(message)
    }

    // 延迟处理工具调用和跳转，确保AI回复先显示
    setTimeout(async () => {
      // 处理工具调用（但不显示给用户）
      if (message.tool_calls && message.tool_calls.length > 0) {
        await this.handleToolCalls(message.tool_calls)
      }

      // 检测是否需要跳转到计划页面
      if (this.shouldRedirectToPlan(cleanedContent)) {
        this.redirectToPlan()
      }
    }, 2000) // 2秒后处理跳转，确保AI回复完全显示
  }

  // 清理消息内容，移除工具调用相关的文本
  cleanMessageContent(content) {
    if (!content) return content
    
    // 移除工具调用相关的文本
    let cleaned = content
    
    // 移除 "工具调用:" 及其后面的内容
    const toolCallIndex = cleaned.indexOf('工具调用:')
    if (toolCallIndex !== -1) {
      cleaned = cleaned.substring(0, toolCallIndex).trim()
    }
    
    // 移除 "太好了！我已经为您创建了" 及其后面的内容（通常是工具调用结果）
    const createIndex = cleaned.indexOf('太好了！我已经为您创建了')
    if (createIndex !== -1) {
      cleaned = cleaned.substring(0, createIndex).trim()
    }
    
    // 移除 "基于您的回答" 及其后面的内容（通常是后续询问）
    const basedIndex = cleaned.indexOf('基于您的回答')
    if (basedIndex !== -1) {
      cleaned = cleaned.substring(0, basedIndex).trim()
    }
    
    // 移除 "如果您想查看" 及其后面的内容
    const viewIndex = cleaned.indexOf('如果您想查看')
    if (viewIndex !== -1) {
      cleaned = cleaned.substring(0, viewIndex).trim()
    }
    
    return cleaned
  }

  // 检测是否需要跳转到计划页面
  shouldRedirectToPlan(content) {
    const planKeywords = ['跳转到计划页面', '创建计划', '计划页面']
    return planKeywords.some(keyword => content.includes(keyword))
  }

  // 跳转到计划页面
  redirectToPlan() {
    // 延迟跳转，让用户看到AI的回复
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // 将对话历史作为参数传递到计划页面
        const conversationHistory = this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }))
        
        // 使用 window.location 进行跳转
        const url = new URL(window.location)
        url.pathname = '/plan'
        url.searchParams.set('conversation', JSON.stringify(conversationHistory))
        window.location.href = url.toString()
      }
    }, 3000) // 3秒后跳转，确保AI回复完全显示
  }

  // 处理工具调用
  async handleToolCalls(toolCalls) {
    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function
      
      if (this.tools.has(name)) {
        try {
          // 触发工具调用回调
          if (this.callbacks.onToolCall) {
            this.callbacks.onToolCall({
              name,
              arguments: JSON.parse(args),
              id: toolCall.id
            })
          }

          const tool = this.tools.get(name)
          const result = await tool.execute(JSON.parse(args))
          
          console.log(`工具 ${name} 执行结果:`, result)
          
          // 工具调用的结果不显示给用户，只在后台处理
          // 如果需要跳转，工具内部会处理
          
        } catch (error) {
          console.error(`工具 ${name} 执行失败:`, error)
          if (this.callbacks.onError) {
            this.callbacks.onError(error)
          }
        }
      }
    }
  }

  // 获取工具模式
  getToolsSchema() {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }))
  }

  // 清除对话历史
  clearHistory() {
    this.conversationHistory = []
  }

  // 获取对话历史
  getHistory() {
    return [...this.conversationHistory]
  }

  // 设置系统提示词
  setSystemPrompt(prompt) {
    this.config.systemPrompt = prompt
  }

  // 获取当前状态
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      historyLength: this.conversationHistory.length,
      availableTools: Array.from(this.tools.keys())
    }
  }
}

// 默认工具定义（将在 AgentStore 中被实际的工具覆盖）
export const defaultTools = {} 