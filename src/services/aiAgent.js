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
    // 获取当前时间信息
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    return `你是一个友好的AI助手，可以与用户进行自然对话。

**当前时间信息：**
- 当前日期：${currentDate} (${currentYear}年${currentMonth}月${currentDay}日)
- 当前时间：${currentTime}
- 当前年份：${currentYear}

**时间处理规则：**
- 当用户说"明天"时，指的是 ${new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]}
- 当用户说"后天"时，指的是 ${new Date(now.getTime() + 2*24*60*60*1000).toISOString().split('T')[0]}
- 当用户说"下周"时，指的是从 ${new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0]} 开始的一周
- 当用户提到具体日期但没有年份时，默认使用当前年份 ${currentYear}
- 当用户提到"推迟到明天"时，应该将时间调整为明天 ${new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]}

**对话模式说明：**

**基础对话模式：**
当用户进行日常对话、询问一般性问题、闲聊等时，请：
1. 友好、自然地回复用户
2. 提供有用的建议和帮助
3. 保持对话的连续性和趣味性
4. 不要主动引导用户创建计划

**场景创建模式：**
当用户明确表达以下需求时，请创建相应的场景分析：

**旅行场景**：包含旅行、旅游、出行、游玩、度假、机票、酒店、景点、行程、攻略等关键词（但不包含商务相关关键词）
**商务行程场景**：包含商务、出差、客户会、商务会议、商务旅行、临时出差、紧急出差、开客户会等关键词
**礼物场景**：包含礼物、购物、购买、买、商品、比价等关键词  
**会议场景**：包含会议、开会、讨论、提醒、参与者、日程、安排、预约等关键词（但不包含商务出差相关关键词）

**重要**：只有在用户明确表达场景需求时才创建场景分析。对于"你好"、"在吗"等基础对话，不要创建场景分析。

当检测到场景需求时，请在回复中包含场景分析结果，使用以下格式：

<SCENE_ANALYSIS_START>
{
  "scene": "travel|business-travel|gift|meeting",
  "title": "本次计划的简明标题",
  "cards": ["basic-info", "flight", "hotel", ...],
  "entities": {
    // 根据场景类型填充相应字段
  },
  "summary": "精简描述当前回复内容，不超过20字"
}
<SCENE_ANALYSIS_END>

**重要原则：**
- 只有在用户明确表达场景相关需求时才创建场景
- 对于一般性对话，保持自然友好的交流
- 不要过度解读用户的意图
- 让用户主动表达他们的具体需求

请用中文回复，语气要友好、自然。`
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