/**
 * AI 配置文件
 * 管理 AI 相关的配置参数
 */

import aiLongTermData from '@/data/long-term/ai-long-term-data.json'

function summaryToMarkdown(data, level = 2) {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    return data.map(item => `- ${summaryToMarkdown(item, level + 1)}`).join('\n')
  }
  if (typeof data === 'object' && data !== null) {
    let md = ''
    for (const key in data) {
      md += `${'#'.repeat(level)} ${key}\n`;
      md += summaryToMarkdown(data[key], level + 1) + '\n'
    }
    return md
  }
  return ''
}

const summary = aiLongTermData.ai_long_term_data?.summary
const summaryMarkdown = summary ? summaryToMarkdown(summary, 2) : ''

export const AI_CONFIG = {
  // API 配置
  api: {
    baseURL: '', // 使用相对路径，通过Vite代理
    endpoint: '/api/ai',
    model: 'deepseek-r1-distill-llama-70b',
    apiKey: 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK'
  },

  // 模型配置
  model: {
    name: 'deepseek-r1-distill-llama-70b',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0
  },

  // 对话配置
  conversation: {
    maxHistoryLength: 10,
    systemPrompt: `你是一个富有创意和洞察力的AI助手，请用中文回答问题。当前时间：${new Date().toLocaleString('zh-CN')}。

【用户长期档案总结】
${summaryMarkdown}

你的任务是：
1. 分析用户问题的深层含义和关键信息
2. 提供专业、实用且富有创意的回答
3. 提取可以长期保存的重要信息
4. 识别当前对话中的短期需求和意图

**重要：请严格按照以下格式返回回答，必须包含<START>和<END>标记！**

<START>
{
  "answer": "你的专业回答，包含实用的建议和天马行空的创意想法",
  "longTermData": "提取用户关系、偏好、重要信息等需要长期保存的数据，如：用户关系状态、个人偏好、重要日期等",
  "shortTermMemory": "提取当前对话中的短期需求、意图、行动计划等，如：购买需求、时间安排、具体目标等"
}
<END>

**注意：每次回答都必须以<START>开始，以<END>结束，这是最重要的格式要求！**

示例分析：
用户说："我有一个女朋友，我想给他买一个礼物"
- 长期数据：用户有女朋友关系，需要记录这个重要关系
- 短期记忆：用户有购买礼物的需求，需要推荐和计划
- 回答：提供实用建议 + 天马行空的创意礼物想法`,
    defaultTimeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // 缓存配置
  cache: {
    enabled: true,
    maxCacheSize: 100,
    cacheExpiration: 3600000, // 1小时
    cacheKey: 'ai_conversation_cache'
  },

  // 错误处理配置
  errorHandling: {
    showUserFriendlyErrors: true,
    logErrors: true,
    fallbackResponse: '抱歉，我现在无法回答您的问题，请稍后再试。'
  },

  // 功能开关
  features: {
    streaming: false,
    voiceInput: false,
    imageGeneration: false,
    codeCompletion: true,
    translation: true
  }
}

/**
 * 获取配置值
 * @param {string} path - 配置路径，如 'api.baseURL'
 * @returns {*} 配置值
 */
export function getConfig(path) {
  const keys = path.split('.')
  let value = AI_CONFIG
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }
  
  return value
}

/**
 * 设置配置值
 * @param {string} path - 配置路径
 * @param {*} value - 配置值
 */
export function setConfig(path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  let current = AI_CONFIG
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
}

/**
 * 获取API配置
 * @returns {Object} API配置对象
 */
export function getApiConfig() {
  return AI_CONFIG.api
}

/**
 * 获取模型配置
 * @returns {Object} 模型配置对象
 */
export function getModelConfig() {
  return AI_CONFIG.model
}

/**
 * 获取对话配置
 * @returns {Object} 对话配置对象
 */
export function getConversationConfig() {
  return AI_CONFIG.conversation
}

/**
 * 验证配置
 * @returns {Object} 验证结果
 */
export function validateConfig() {
  const errors = []
  
  if (!AI_CONFIG.api.baseURL) {
    errors.push('API baseURL 未配置')
  }
  
  if (!AI_CONFIG.api.apiKey) {
    errors.push('API Key 未配置')
  }
  
  if (!AI_CONFIG.model.name) {
    errors.push('模型名称未配置')
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  }
}

/**
 * 重置配置到默认值
 */
export function resetConfig() {
  // 这里可以重新加载默认配置
  Object.assign(AI_CONFIG, {
    api: {
      baseURL: '', // 使用相对路径，通过Vite代理
      endpoint: '/api/ai',
      model: 'deepseek-r1-distill-llama-70b',
      apiKey: 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK'
    },
    model: {
      name: 'deepseek-r1-distill-llama-70b',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    conversation: {
      maxHistoryLength: 10,
      systemPrompt: `你是一个富有创意和洞察力的AI助手，请用中文回答问题。当前时间：${new Date().toLocaleString('zh-CN')}。

【用户长期档案总结】
${summaryMarkdown}

你的任务是：
1. 分析用户问题的深层含义和关键信息
2. 提供专业、实用且富有创意的回答
3. 提取可以长期保存的重要信息
4. 识别当前对话中的短期需求和意图

**重要：请严格按照以下格式返回回答，必须包含<START>和<END>标记！**

<START>
{
  "answer": "你的专业回答，包含实用的建议和天马行空的创意想法",
  "longTermData": "提取用户关系、偏好、重要信息等需要长期保存的数据，如：用户关系状态、个人偏好、重要日期等",
  "shortTermMemory": "提取当前对话中的短期需求、意图、行动计划等，如：购买需求、时间安排、具体目标等"
}
<END>

**注意：每次回答都必须以<START>开始，以<END>结束，这是最重要的格式要求！**

示例分析：
用户说："我有一个女朋友，我想给他买一个礼物"
- 长期数据：用户有女朋友关系，需要记录这个重要关系
- 短期记忆：用户有购买礼物的需求，需要推荐和计划
- 回答：提供实用建议 + 天马行空的创意礼物想法`,
      defaultTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    }
  })
}

export default AI_CONFIG 