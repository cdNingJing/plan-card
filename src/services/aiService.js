/**
 * AI 服务类
 * 提供高级 AI 功能封装
 */

import aiApiService from '@/api/aiApi.js'
import { AI_CONFIG, getConfig } from '@/config/aiConfig.js'

class AIService {
  constructor() {
    this.conversationHistory = []
    this.isProcessing = false
    this.cache = new Map()
  }

  /**
   * 发送消息并获取回复
   * @param {string} message - 用户消息
   * @param {Object} options - 选项
   * @returns {Promise} AI回复
   */
  async sendMessage(message, options = {}) {
    if (this.isProcessing) {
      return {
        success: false,
        message: '正在处理中，请稍候...'
      }
    }

    this.isProcessing = true

    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(message, options)
      if (getConfig('cache.enabled') && this.cache.has(cacheKey)) {
        const cachedResponse = this.cache.get(cacheKey)
        if (Date.now() - cachedResponse.timestamp < getConfig('cache.cacheExpiration')) {
          this.isProcessing = false
          return {
            success: true,
            data: cachedResponse.data,
            message: '从缓存获取回复',
            cached: true
          }
        }
      }

      // 构建消息数组
      const messages = this.buildMessages(message, options)

      // 发送请求
      const response = await aiApiService.chatCompletion(messages, {
        max_tokens: getConfig('model.maxTokens'),
        temperature: getConfig('model.temperature'),
        top_p: getConfig('model.topP'),
        frequency_penalty: getConfig('model.frequencyPenalty'),
        presence_penalty: getConfig('model.presencePenalty'),
        ...options
      })

      if (response.success) {
        // 添加到对话历史
        this.addToHistory('user', message)
        this.addToHistory('assistant', response.data.choices[0].message.content)

        // 缓存响应
        if (getConfig('cache.enabled')) {
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          })
        }

        // 保存到本地存储
        await this.saveConversationToStorage()

        return {
          success: true,
          data: response.data,
          message: 'AI回复成功',
          content: response.data.choices[0].message.content
        }
      } else {
        return {
          success: false,
          message: getConfig('errorHandling.fallbackResponse'),
          error: response.error
        }
      }
    } catch (error) {
      console.error('AI服务错误:', error)
      return {
        success: false,
        message: getConfig('errorHandling.fallbackResponse'),
        error: error.message
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 构建消息数组
   * @param {string} message - 用户消息
   * @param {Object} options - 选项
   * @returns {Array} 消息数组
   */
  buildMessages(message, options = {}) {
    const messages = []

    // 添加系统提示
    if (getConfig('conversation.systemPrompt')) {
      messages.push({
        role: 'system',
        content: getConfig('conversation.systemPrompt')
      })
    }

    // 添加对话历史
    const maxHistory = getConfig('conversation.maxHistoryLength')
    const historyToInclude = this.conversationHistory.slice(-maxHistory * 2)
    messages.push(...historyToInclude)

    // 添加当前消息
    messages.push({
      role: 'user',
      content: message
    })

    return messages
  }

  /**
   * 添加到对话历史
   * @param {string} role - 角色
   * @param {string} content - 内容
   */
  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    })

    // 限制历史长度
    const maxHistory = getConfig('conversation.maxHistoryLength') * 2
    if (this.conversationHistory.length > maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-maxHistory)
    }
  }

  /**
   * 清空对话历史
   */
  clearHistory() {
    this.conversationHistory = []
    this.cache.clear()
    this.saveConversationToStorage()
  }

  /**
   * 获取对话历史
   * @returns {Array} 对话历史
   */
  getHistory() {
    return [...this.conversationHistory]
  }

  /**
   * 设置对话历史
   * @param {Array} history - 对话历史
   */
  setHistory(history) {
    this.conversationHistory = [...history]
  }

  /**
   * 生成缓存键
   * @param {string} message - 消息
   * @param {Object} options - 选项
   * @returns {string} 缓存键
   */
  generateCacheKey(message, options = {}) {
    const keyData = {
      message,
      model: getConfig('model.name'),
      temperature: getConfig('model.temperature'),
      ...options
    }
    return JSON.stringify(keyData)
  }

  /**
   * 保存对话到本地存储
   */
  async saveConversationToStorage() {
    try {
      // 实现保存对话到本地存储的逻辑
    } catch (error) {
      console.error('保存对话历史失败:', error)
    }
  }

  /**
   * 从本地存储加载对话
   */
  async loadConversationFromStorage() {
    try {
      // 实现从本地存储加载对话的逻辑
    } catch (error) {
      console.error('加载对话历史失败:', error)
    }
  }

  /**
   * 获取模型信息
   * @returns {Object} 模型信息
   */
  getModelInfo() {
    return aiApiService.getModelInfo()
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    aiApiService.updateConfig(newConfig)
  }

  /**
   * 检查API连接
   * @returns {Promise} 连接状态
   */
  async checkConnection() {
    try {
      const response = await aiApiService.sendMessage('测试连接')
      return {
        success: response.success,
        message: response.success ? '连接正常' : '连接失败',
        error: response.error
      }
    } catch (error) {
      return {
        success: false,
        message: '连接失败',
        error: error.message
      }
    }
  }

  /**
   * 获取处理状态
   * @returns {boolean} 是否正在处理
   */
  getProcessingStatus() {
    return this.isProcessing
  }

  /**
   * 获取缓存统计
   * @returns {Object} 缓存统计信息
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: getConfig('cache.maxCacheSize'),
      enabled: getConfig('cache.enabled')
    }
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now()
    const expiration = getConfig('cache.cacheExpiration')
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > expiration) {
        this.cache.delete(key)
      }
    }
  }
}

// 创建单例实例
const aiService = new AIService()

// 初始化时加载对话历史
aiService.loadConversationFromStorage()

export default aiService
export { AIService } 