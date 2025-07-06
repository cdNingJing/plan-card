import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { AIAgent, defaultTools } from '@/services/aiAgent.js'
import { useCardStore } from './cardStore.js'

export const useAgentStore = defineStore('agent', () => {
  // Agent 实例
  const agent = ref(null)
  
  // 对话历史
  const messages = reactive([])
  
  // Agent 状态
  const isProcessing = ref(false)
  const isInitialized = ref(false)
  const error = ref(null)
  
  // 工具调用历史
  const toolCalls = reactive([])
  
  // 初始化 Agent
  const initializeAgent = (config = {}) => {
    if (agent.value) {
      return agent.value
    }
    
    const cardStore = useCardStore()
    
    // 创建 Agent 实例
    agent.value = new AIAgent({
      systemPrompt: `你是一个智能的计划助手，专门帮助用户规划和管理各种任务。你的主要职责包括：

1. **场景识别与卡片规划**：根据用户描述，智能分析属于哪种场景（旅行、礼物、会议），并规划需要展示的卡片类型
2. **理解用户需求**：仔细分析用户的描述，识别他们的真实意图和需求
3. **智能工具调用**：根据用户需求选择合适的工具来完成任务
4. **创建计划卡片**：为不同类型的需求创建相应的功能卡片
5. **提供专业建议**：基于用户的具体情况给出个性化的建议

**场景识别规则：**
请根据用户的描述，判断其需求属于以下哪种场景之一：
- **旅行场景 (travel)**：包含旅行、旅游、出行、游玩、度假、机票、酒店、景点等关键词
- **购物场景 (gift)**：包含购物、搜索、购买、商品、推荐、比价、商品搜索等关键词  
- **会议场景 (meeting)**：包含会议、开会、讨论、提醒、参与者、日程等关键词
- **通用场景 (general)**：其他类型的计划、安排、规划等需求

**卡片规划规则：**
每个场景必须包含以下卡片类型：
- **旅行场景**：basic-info, flight, hotel, itinerary, packing
- **购物场景**：basic-info, shop, selected-products, profile, tips 
- **会议场景**：basic-info, meeting, participants, reminder, feedback, attachments
- **通用场景**：basic-info, suggestions, resources

**可用工具说明：**
- createPlanCard: 创建计划卡片（支持旅行、礼物、会议、通用四种类型）
- viewPlanCards: 查看已创建的计划详情（仅当用户明确要求查看时使用）
- searchInfo: 搜索相关信息
- generateSuggestions: 生成建议

**工具使用规则：**
- 当用户提到旅行、旅游、出行等需求时，使用 createPlanCard 工具，type 设为 'travel'
- 当用户提到购物、搜索、购买、商品搜索等需求时，使用 createPlanCard 工具，type 设为 'gift'  
- 当用户提到会议、开会、讨论等需求时，使用 createPlanCard 工具，type 设为 'meeting'
- 当用户提到其他计划、安排、规划等需求时，使用 createPlanCard 工具，type 设为 'general'
- 只有当用户明确说要"查看"、"打开"、"进入"计划页面时，才使用 viewPlanCards 工具

**重要提醒：**
- 创建计划后，不要自动跳转到计划页面
- 继续在对话中与用户交流，询问是否需要调整或补充
- 让用户主动选择是否查看详细计划
- 保持对话的连续性和自然性
- **重要**：请先完整回复用户的问题，然后再使用工具。确保用户能看到你的完整回答。

**场景分析格式：**
当用户首次描述需求时，请在回复中包含场景分析结果，使用以下格式：

<SCENE_ANALYSIS_START>
{
  "scene": "travel|gift|meeting|general",
  "title": "本次计划的简明标题",
  "cards": ["basic-info", "flight", "hotel", ...],
  "entities": {
    "departure": "出发地",
    "destination": "目的地", 
    "startDate": "开始日期 (YYYY-MM-DD)",
    "endDate": "结束日期 (YYYY-MM-DD)",
    "travelers": 人数,
    "travelType": "旅行类型 (business|leisure)",
    "budget": "预算金额",
    "companions": ["同行人1", "同行人2"],
    "duration": 天数,
    "purpose": "旅行目的"
  }
}
<SCENE_ANALYSIS_END>

**字段说明：**
- 必需字段：scene, title, cards
- 可选字段：entities 中的所有字段都可以为空或省略
- 空值处理：如果某个字段无法确定，请设置为空字符串 "" 或空数组 []
- 默认值：travelers默认为1，duration默认为1

**重要格式要求：**
- 必须使用 <SCENE_ANALYSIS_START> 和 <SCENE_ANALYSIS_END> 标记包围JSON内容
- 所有字符串值必须用双引号包围
- 数字值（如travelers、duration）不要用引号包围
- 数组值必须用方括号包围，元素用逗号分隔
- 每个字段后必须有逗号，最后一个字段除外
- 确保JSON格式完全正确，可以被JSON.parse()解析
- 特别注意：空字符串值也要用双引号包围，如 "budget": ""

**正确示例：**

**旅行场景示例：**
<SCENE_ANALYSIS_START>
{
  "scene": "travel",
  "title": "成都到纽约7天之旅",
  "cards": ["basic-info", "flight", "hotel", "itinerary", "packing"],
  "entities": {
    "departure": "成都",
    "destination": "纽约",
    "startDate": "2025-07-10",
    "endDate": "2025-07-17",
    "travelers": 2,
    "travelType": "leisure",
    "budget": "",
    "companions": ["朋友"],
    "duration": 7,
    "purpose": "旅游"
  }
}
<SCENE_ANALYSIS_END>

**购物场景示例：**
<SCENE_ANALYSIS_START>
{
  "scene": "gift",
  "title": "妈妈的园艺礼物",
  "cards": ["basic-info", "shop", "selected-products", "profile", "tips"],
  "entities": {
    "recipient": "妈妈",
    "occasion": "母亲节",
    "budget": "500元以内",
    "interests": "园艺",
    "searchQuery": "园艺礼物 预算500元以内",
    "query": "园艺礼物",
    "sort_by": "price_low_to_high",
    "limit": 10,
    "exclude_sponsored": true,
    "detail": 3
  }
}
<SCENE_ANALYSIS_END>

**实体信息提取规则：**

**旅行场景字段：**
- departure: 从"从...前往"、"from...to"等表达中提取出发地，无法确定时设为空字符串
- destination: 从"前往..."、"to..."等表达中提取目的地，只保留标准地名，无法确定时设为空字符串
- startDate: 从日期表达中提取开始日期，格式为YYYY-MM-DD，无法确定时设为空字符串
- endDate: 从日期表达中提取结束日期，格式为YYYY-MM-DD，无法确定时设为空字符串
- travelers: 从人数表达中提取数字，如"独自旅行"=1，"3人"=3，"多人"=2，无法确定时默认为1
- travelType: 根据关键词判断，"商务"=business，"旅游/度假"=leisure，无法确定时设为空字符串
- budget: 从预算表达中提取预算范围，返回下拉框选项的 value 值（如 "low"、"medium"、"high"），如果没有则为空字符串""
- companions: 从同行人表达中提取，如"和朋友"=["朋友"]，"和家人"=["家人"]，无法确定时设为空数组[]
- duration: 从天数表达中提取数字，如"住5天"=5，"一周"=7，无法确定时默认为1
- purpose: 从描述中提取旅行目的，如"购物"、"考察"、"度假"，无法确定时设为空字符串

**购物场景字段：**
- searchQuery: 从用户描述中提取完整的搜索需求文本，包含关键词、排序、数量等所有搜索条件
- query: 从搜索需求中提取单个关键词，如"搜索iphone"提取"iphone"
- querys: 从搜索需求中提取多个关键词，如"搜索samsung和iphone"提取"samsung, iphone"
- sort_by: 从搜索需求中提取排序方式，如"按价格从低到高"提取"price_low_to_high"
- limit: 从搜索需求中提取结果数量，如"返回10个"提取10
- page: 从搜索需求中提取页码，如"第2页"提取2
- exclude_sponsored: 从搜索需求中提取是否排除广告，如"排除广告"提取true
- detail: 从搜索需求中提取获取详情数量，如"获取3个详情"提取3

请确保 title 字段为本次计划的简明标题，便于用户区分不同项目。

请以友好、专业的方式与用户交流，主动理解用户的需求，并及时使用合适的工具来帮助用户完成任务。`,
      ...config
    })
    
    // 不再注册模拟的默认工具，只使用真实的集成工具
    
    // 注册简化的计划创建工具
    agent.value.registerTool('createPlanCard', {
      description: '创建计划卡片并跳转到计划页面',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '计划标题'
          },
          description: {
            type: 'string',
            description: '计划描述'
          },
          type: {
            type: 'string',
            enum: ['travel', 'gift', 'meeting', 'general'],
            description: '计划类型'
          }
        },
        required: ['title', 'description', 'type']
      },
      execute: async (args) => {
        try {
          // 直接跳转到计划页面，传递计划信息
          const planData = {
            title: args.title,
            description: args.description,
            type: args.type
          }
          // 恢复跳转逻辑，加入详细打印
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location)
              url.pathname = '/plan'
              url.searchParams.set('planData', JSON.stringify(planData))
              console.log('[createPlanCard] 跳转到:', url.toString())
              console.log('[createPlanCard] planData:', planData)
              console.log('[createPlanCard] 跳转前 window.location.href:', window.location.href)
              window.location.href = url.toString()
              setTimeout(() => {
                console.log('[createPlanCard] 跳转后 window.location.href:', window.location.href)
              }, 500)
            }
          }, 1000)
          return {
            success: true,
            message: '正在为您创建计划，即将跳转到计划页面...'
          }
        } catch (error) {
          console.error('创建计划失败:', error)
          return {
            success: false,
            message: '创建计划失败，请重试'
          }
        }
      }
    })
    
    // 设置回调函数
    agent.value.setCallback('onMessage', (message) => {
      console.log('[agentStore] onMessage 回调:', message)
      
      // 直接添加到messages数组
      messages.push({
        id: Date.now() + Math.random(),
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        isStreaming: false
      })
      
      if (message.role === 'assistant' && message.toolResult) {
        messages[messages.length - 1].toolResult = message.toolResult
      }
   
    })
    
    agent.value.setCallback('onToolCall', (toolCall) => {
      toolCalls.push({
        id: toolCall.id,
        name: toolCall.name,
        arguments: toolCall.arguments,
        timestamp: new Date().toISOString()
      })
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
  
  // 立即添加用户消息到显示历史
  const addUserMessage = (content) => {
    messages.push({
      id: Date.now() + Math.random(),
      role: 'user',
      content: content,
      timestamp: new Date().toISOString(),
      isStreaming: false
    })
  }
  
  // 立即添加助手消息到显示历史
  const addAssistantMessage = (content) => {
    messages.push({
      id: Date.now() + Math.random(),
      role: 'assistant',
      content: content,
      timestamp: new Date().toISOString(),
      isStreaming: false
    })
  }
  
  // 发送消息（不添加到显示历史，因为已经通过addUserMessage添加了）
  const sendMessage = async (message) => {
    if (!agent.value) {
      initializeAgent()
    }
    
    error.value = null
    isProcessing.value = true
    
    try {
      // 直接调用 Agent 的内部处理，跳过重复的消息添加
      await agent.value.processMessage(message)
    } catch (err) {
      error.value = err
      console.error('发送消息失败:', err)
      isProcessing.value = false
    }
  }
  
  // 清除对话历史
  const clearHistory = () => {
    messages.splice(0, messages.length)
    toolCalls.splice(0, toolCalls.length)
    
    if (agent.value) {
      agent.value.clearHistory()
    }
    
    error.value = null
  }
  
  // 获取对话历史
  const getMessages = () => {
    return messages
  }
  
  // 获取工具调用历史
  const getToolCalls = () => {
    return toolCalls
  }
  
  // 重试最后一条消息
  const retryLastMessage = async () => {
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()
    
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content)
    }
  }
  
  // 设置自定义 AI API 调用函数
  const setCustomAPICall = (apiCallFunction) => {
    if (agent.value) {
      agent.value.callAIAPI = apiCallFunction
    }
  }
  
  // 添加自定义工具
  const addTool = (name, tool) => {
    if (agent.value) {
      agent.value.registerTool(name, tool)
    }
  }
  
  // 获取 Agent 状态
  const getAgentStatus = () => {
    return {
      isProcessing: isProcessing.value,
      isInitialized: isInitialized.value,
      error: error.value,
      messageCount: messages.length,
      toolCallCount: toolCalls.length
    }
  }
  
  // 暂时移除卡片生成相关逻辑，专注于对话功能

  return {
    // 状态
    messages,
    isProcessing,
    isInitialized,
    error,
    toolCalls,
    
    // 方法
    initializeAgent,
    sendMessage,
    addUserMessage,
    addAssistantMessage,
    clearHistory,
    getMessages,
    getToolCalls,
    retryLastMessage,
    setCustomAPICall,
    addTool,
    getAgentStatus
  }
}) 