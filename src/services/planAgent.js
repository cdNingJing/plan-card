// 计划页面专用的 AI Agent 服务类
import { CardModificationPromptService } from './cardModificationPromptService.js'

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
    // 获取当前时间信息
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    return `你是一个专业的计划助手，专门帮助用户完善和优化他们的计划。

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

  // 新的系统提示词 - 专门针对PlanInput组件的对话功能
  getPlanInputSystemPrompt(scenario = 'travel') {
    const promptService = new CardModificationPromptService()
    
    // 获取当前时间信息
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    const basePrompt = `你是一个智能的计划对话助手，专门帮助用户通过对话方式完善和优化他们的计划。

**当前时间信息：**
- 当前日期：${currentDate} (${currentYear}年${currentMonth}月${currentDay}日)
- 当前时间：${currentTime} (${currentHour}:${currentMinute.toString().padStart(2, '0')})
- 当前年份：${currentYear}
- 当前月份：${currentMonth}
- 当前日期：${currentDay}

**时间处理规则：**
- 当用户说"明天"时，指的是 ${new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]}
- 当用户说"后天"时，指的是 ${new Date(now.getTime() + 2*24*60*60*1000).toISOString().split('T')[0]}
- 当用户说"下周"时，指的是从 ${new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0]} 开始的一周
- 当用户提到具体日期但没有年份时，默认使用当前年份 ${currentYear}
- 当用户提到"推迟到明天"时，应该将时间调整为明天 ${new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]}

**你的核心功能：**
1. **智能对话理解**：准确理解用户在对话中表达的需求、想法和建议
2. **计划优化建议**：基于对话内容，提供具体的计划改进和补充建议
3. **上下文感知**：记住对话历史，保持对话的连贯性和逻辑性
4. **主动引导**：在合适的时候主动询问细节，帮助用户完善计划
5. **卡片信息修改**：理解用户对现有卡片信息的修改需求，并提供修改建议

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
- 智能识别用户想要修改的具体内容

**会议主题识别规则（仅适用于会议场景）：**
- 当用户说"开会"时，如果上下文中有具体内容（如"小组开会"、"项目开会"），提取"小组"、"项目"等作为会议主题
- 当用户说"讨论"时，提取讨论的具体内容作为会议主题
- 当用户说"分享"时，提取分享的具体内容作为会议主题
- 当用户说"汇报"时，提取汇报的具体内容作为会议主题
- 如果用户没有明确说明会议主题，但提到了参会人员（如"小组成员"），可以推断为"小组会议"
- 如果用户没有明确说明会议主题，但提到了地点或项目，可以推断为相应的主题
- 示例："7月10号通过小组成员在成都开会" → 会议主题：小组会议

**注意事项：**
- 不要询问用户是否要查看计划，专注于对话本身
- 避免过于冗长的回复，保持简洁明了
- 根据用户的反馈调整建议方向
- 始终保持耐心和专业的服务态度
- 在修改卡片信息时，确认用户的具体需求

请以自然、友好的方式与用户对话，帮助他们通过交流完善和修改自己的计划。`
    const modificationPrompt = promptService.generateModificationPrompt(scenario)
    return basePrompt + '\n\n' + modificationPrompt
  }

  // 设置回调函数
  setCallback(event, callback) {
    this.callbacks[event] = callback
  }

  // 发送消息
  async sendMessage(message, projectId = null, usePlanInputPrompt = false, scenario = 'travel') {
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

      // 选择使用哪个系统提示词
      const systemPrompt = usePlanInputPrompt 
        ? this.getPlanInputSystemPrompt(scenario) 
        : this.config.systemPrompt

      // 构建请求数据，包含历史对话
      const requestData = {
        model: this.config.model,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      }

      console.log('[PlanAgent] 发送请求，包含历史对话:', {
        historyLength: conversationHistory.length,
        messages: requestData.messages,
        usePlanInputPrompt: usePlanInputPrompt
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