/**
 * AI 配置文件
 * 管理 AI 相关的配置参数
 */

import { getScenarioSystemPrompt } from './scenarios.js'

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
    maxTokensForHistory: 3000, // 为历史记录预留的最大token数量
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
 * @param {string} scenarioName - 场景名称，默认为 'basic'
 * @param {string} dataText - 数据文本（可选）
 * @returns {Object} 对话配置对象
 */
export function getConversationConfig(scenarioName = 'basic', dataText = '') {
  return {
    ...AI_CONFIG.conversation,
    systemPrompt: getScenarioSystemPrompt(scenarioName, dataText)
  }
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
      defaultTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    }
  })
}

export default AI_CONFIG 