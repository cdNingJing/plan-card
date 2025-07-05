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

  // 新的系统提示词 - 专门针对PlanInput组件的对话功能
  getPlanInputSystemPrompt() {
    return `你是一个智能的计划对话助手，专门帮助用户通过对话方式完善和优化他们的计划。

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

**卡片修改能力：**
当用户提到要修改卡片信息时，请在回复中包含修改指令，格式如下：
{
  "action": "update_card",
  "target": "card_type_or_id",
  "updates": {
    "field_name": "new_value",
    "field_name2": "new_value2"
  },
  "message": "已为您更新了相关信息"
}

**修改指令格式说明：**
当用户提到要修改基础信息时，请使用以下格式：

**修改目的地：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "destination": "新的目的地名称",
    "title": "新的标题（可选）"
  },
  "message": "已为您更新目的地信息"
}

**修改出发地：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "departure": "新的出发地名称"
  },
  "message": "已为您更新出发地信息"
}

**修改出发日期：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "startDate": "2025-07-06"
  },
  "message": "已为您更新出发日期"
}

**修改返程日期：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "endDate": "2025-07-10"
  },
  "message": "已为您更新返程日期"
}

**修改出行人数：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "travelers": "4人"
  },
  "message": "已为您更新出行人数"
}

**修改预算范围：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "budget": "comfort"
  },
  "message": "已为您更新预算范围"
}

**修改数字预算（自动映射）：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "budget": "comfort"
  },
  "message": "已为您设置舒适型预算范围"
}



**同时修改多个字段：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "departure": "成都",
    "destination": "东京",
    "startDate": "2025-07-06",
    "endDate": "2025-07-10",
    "travelers": "4人",
    "budget": "comfort"
  },
  "message": "已为您更新基础信息"
}

**重要说明：**
- 基础信息卡片（basic-info）的数据存储在formData字段中
- 所有基础信息字段都应该更新到formData中：
  - destination: 目的地
  - departure: 出发地
  - startDate: 出发日期（格式：YYYY-MM-DD）
- endDate: 返程日期（格式：YYYY-MM-DD）
  - travelers: 出行人数（可以包含单位，如"4人"、"2位"等）
  - budget: 预算范围（使用预定义值：budget/comfort/luxury）
- 标题信息可以直接更新到卡片的title字段
- 日期格式请使用 YYYY-MM-DD 格式（HTML date input的标准格式）
- 预算字段使用以下预定义值：
  - budget: 经济型 (≤3000元)
  - comfort: 舒适型 (3000-8000元)
  - luxury: 豪华型 (>8000元)
- **预算数字自动映射：**
  - 当用户输入具体数字时，请根据金额自动选择对应的预算类型
  - 例如：用户说"预算5000元"，应该设置为"comfort"
  - 例如：用户说"预算2000元"，应该设置为"budget"
  - 例如：用户说"预算10000元"，应该设置为"luxury"

**支持的修改操作：**
- **基础信息卡片（basic-info）的所有字段：**
  - destination: 目的地
  - departure: 出发地
  - startDate: 出发日期
- endDate: 返程日期
  - travelers: 出行人数
  - budget: 预算范围
  - title: 计划标题
- 更新预算范围（budget卡片）
- 调整时间安排（meeting、itinerary卡片）
- 更新参与者信息（participants卡片）
- 更新礼物推荐（gift卡片）

**特殊功能：**
- 当用户提到新的计划元素时，主动建议相关的卡片类型
- 帮助用户梳理思路，整理计划要点
- 提供实用的建议和技巧
- 在对话中保持积极正面的态度
- 智能识别用户想要修改的具体内容

**智能识别用户修改意图：**
- 当用户说"人数改为4人"、"出行人数4人"、"4个人"时，识别为修改travelers字段
- **预算字段智能识别：**
  - 当用户说"预算5000元"、"费用不超过8000"、"预算范围5000-8000"、"舒适型预算"时，识别为修改budget字段为"comfort"
  - 当用户说"经济型预算"、"预算3000以内"、"预算2000元"时，识别为修改budget字段为"budget"
  - 当用户说"豪华型预算"、"预算8000以上"、"预算10000元"时，识别为修改budget字段为"luxury"
  - **数字预算自动映射规则：**
    - ≤3000元 → "budget" (经济型)
    - 3001-8000元 → "comfort" (舒适型)
    - >8000元 → "luxury" (豪华型)
- 当用户说"出发地成都"、"从成都出发"时，识别为修改departure字段
- 当用户说"7月6号出发"、"出发日期2025-07-06"、"2025年7月6日出发"时，识别为修改startDate字段
- 当用户说"7月10号回来"、"返程日期2025-07-10"、"2025年7月10日回来"时，识别为修改endDate字段
- **日期格式智能转换：**
  - "7月6号" → "2025-07-06"
  - "2025年7月6日" → "2025-07-06"
  - "7/6" → "2025-07-06"（假设为当前年份）
  - "2025/07/06" → "2025-07-06"
- 当用户说"目的地东京"、"去东京"时，识别为修改destination字段

**注意事项：**
- 不要询问用户是否要查看计划，专注于对话本身
- 避免过于冗长的回复，保持简洁明了
- 根据用户的反馈调整建议方向
- 始终保持耐心和专业的服务态度
- 在修改卡片信息时，确认用户的具体需求

请以自然、友好的方式与用户对话，帮助他们通过交流完善和修改自己的计划。`
  }

  // 设置回调函数
  setCallback(event, callback) {
    this.callbacks[event] = callback
  }

  // 发送消息
  async sendMessage(message, projectId = null, usePlanInputPrompt = false) {
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
        ? this.getPlanInputSystemPrompt() 
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