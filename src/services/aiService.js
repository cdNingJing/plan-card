/**
 * AI 服务类
 * 提供高级 AI 功能封装
 */

import aiApiService from '@/api/aiApi.js'
import { AI_CONFIG, getConfig, getConversationConfig } from '@/config/aiConfig.js'
import configManager from '@/config/configManager.js'
import { parseAIResponse } from '@/utils/aiResponseParser.js'

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

      // 提取标准 OpenAI 参数，排除自定义参数
      const { conversationHistory, ...openAIOptions } = options

      // 发送请求
      const response = await aiApiService.chatCompletion(messages, {
        max_tokens: getConfig('model.maxTokens'),
        temperature: getConfig('model.temperature'),
        top_p: getConfig('model.topP'),
        frequency_penalty: getConfig('model.frequencyPenalty'),
        presence_penalty: getConfig('model.presencePenalty'),
        ...openAIOptions
      })

      if (response.success) {
        // 只添加用户消息到对话历史，AI回复由调用方处理
        this.addToHistory('user', message)

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
   * 简单场景调用 - 无需上下文，只需指定场景
   * @param {string} message - 用户消息或系统提示词
   * @param {string} scenario - 场景名称 ('basic', 'longTerm', 'shortTerm', 'dynamicIsland')
   * @param {string|Object} dataTextOrOptions - 数据文本或选项参数
   * @param {Object} options - 可选参数
   * @param {boolean} isSystemPrompt - 是否为系统提示词，默认为false
   * @returns {Promise} AI回复
   */
  async sendMessageWithScenario(message, scenario, dataTextOrOptions = '', options = {}, isSystemPrompt = false) {
    if (this.isProcessing) {
      return {
        success: false,
        message: '正在处理中，请稍候...'
      }
    }

    this.isProcessing = true

    try {
      // 处理参数：如果第三个参数是对象，则它是options，否则是dataText
      let dataText = ''
      let finalOptions = { ...options }
      
      if (typeof dataTextOrOptions === 'string') {
        dataText = dataTextOrOptions
      } else if (typeof dataTextOrOptions === 'object') {
        finalOptions = { ...dataTextOrOptions, ...options }
      }

      // 构建缓存键，包含场景信息
      const cacheKey = this.generateCacheKey(message, { ...finalOptions, scenario })
      
      // 检查缓存
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

      // 构建消息数组，指定场景和数据文本
      const messages = this.buildMessages(message, { ...finalOptions, scenario, dataText, isSystemPrompt })

      // 提取标准 OpenAI 参数，排除自定义参数
      const { conversationHistory, scenario: scenarioParam, dataText: dataTextParam, isSystemPrompt: isSystemPromptParam, ...openAIOptions } = finalOptions

      // 发送请求
      const response = await aiApiService.chatCompletion(messages, {
        max_tokens: getConfig('model.maxTokens'),
        temperature: getConfig('model.temperature'),
        top_p: getConfig('model.topP'),
        frequency_penalty: getConfig('model.frequencyPenalty'),
        presence_penalty: getConfig('model.presencePenalty'),
        ...openAIOptions
      })

      if (response.success) {
        // 缓存响应
        if (getConfig('cache.enabled')) {
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          })
        }

        return {
          success: true,
          data: response.data,
          message: 'AI回复成功',
          content: response.data.choices[0].message.content,
          scenario: scenario
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
   * @param {string} message - 用户消息或系统提示词
   * @param {Object} options - 选项
   * @returns {Array} 消息数组
   */
  buildMessages(message, options = {}) {
    const messages = []

    // 检查是否为系统提示词模式
    const isSystemPrompt = options.isSystemPrompt || false
    
    if (isSystemPrompt) {
      // 直接使用传入的消息作为系统提示词
      messages.push({
        role: 'system',
        content: message
      })
    } else {
      // 获取当前场景的systemPrompt，传递dataText参数
      const currentScenario = options.scenario || configManager.getCurrentScenario()
      const dataText = options.dataText || ''
      const conversationConfig = getConversationConfig(currentScenario, dataText)
      
      // 添加系统提示
      if (conversationConfig.systemPrompt) {
        messages.push({
          role: 'system',
          content: conversationConfig.systemPrompt
        })
      }
    }

    // 智能历史截断
    const historyToInclude = this.getOptimizedHistory(options)
    
    // 添加对话历史（如果存在）
    if (historyToInclude.length > 0) {
      messages.push(...historyToInclude)
    }

    // 添加当前消息
    messages.push({
      role: 'user',
      content: message
    })

    console.log('构建的消息数组:', messages.length, '条消息')
    return messages
  }

  /**
   * 获取优化后的对话历史
   * @param {Object} options - 选项
   * @returns {Array} 优化后的历史记录
   */
  getOptimizedHistory(options = {}) {
    let historyToInclude = []
    
    // 优先使用传入的历史上下文，否则使用内部存储的历史
    if (options.conversationHistory && Array.isArray(options.conversationHistory)) {
      historyToInclude = options.conversationHistory
      console.log('使用传入的历史上下文:', historyToInclude.length, '条消息')
    } else {
      const maxHistory = getConfig('conversation.maxHistoryLength')
      historyToInclude = this.conversationHistory.slice(-maxHistory * 2)
      console.log('使用内部存储的历史:', historyToInclude.length, '条消息')
    }
    
    // 过滤掉空消息
    historyToInclude = historyToInclude.filter(msg => 
      msg && msg.content && msg.content.trim().length > 0
    )

    // 估算当前token数量
    const estimatedTokens = this.estimateTokens(historyToInclude)
    const maxTokens = getConfig('model.maxTokens')
    const maxHistoryTokens = getConfig('conversation.maxTokensForHistory')
    const reservedTokens = 1000 // 为systemPrompt和当前消息预留token
    
    console.log('估算token数量:', estimatedTokens, '最大token:', maxTokens)

    // 如果token数量过多，进行智能截断
    const availableTokens = Math.min(maxTokens - reservedTokens, maxHistoryTokens)
    if (estimatedTokens > availableTokens) {
      historyToInclude = this.truncateHistory(historyToInclude, availableTokens)
      console.log('历史已截断，保留消息数:', historyToInclude.length)
    }

    return historyToInclude
  }

  /**
   * 估算token数量（简单估算）
   * @param {Array} messages - 消息数组
   * @returns {number} 估算的token数量
   */
  estimateTokens(messages) {
    let totalTokens = 0
    for (const message of messages) {
      // 简单估算：中文字符约1.5个token，英文字符约0.75个token
      const content = message.content || ''
      const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
      const englishChars = content.length - chineseChars
      totalTokens += Math.ceil(chineseChars * 1.5 + englishChars * 0.75)
    }
    return totalTokens
  }

  /**
   * 智能截断历史记录
   * @param {Array} history - 历史记录
   * @param {number} maxTokens - 最大token数量
   * @returns {Array} 截断后的历史记录
   */
  truncateHistory(history, maxTokens) {
    // 优先保留最近的对话
    const truncatedHistory = []
    let currentTokens = 0
    
    // 从最新的消息开始，向前添加
    for (let i = history.length - 1; i >= 0; i--) {
      const message = history[i]
      const messageTokens = this.estimateTokens([message])
      
      if (currentTokens + messageTokens <= maxTokens) {
        truncatedHistory.unshift(message)
        currentTokens += messageTokens
      } else {
        break
      }
    }
    
    return truncatedHistory
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
   * 清理过长的对话历史
   * @param {number} maxMessages - 最大消息数量
   */
  trimHistory(maxMessages = 20) {
    if (this.conversationHistory.length > maxMessages) {
      this.conversationHistory = this.conversationHistory.slice(-maxMessages)
      console.log('对话历史已清理，保留消息数:', this.conversationHistory.length)
    }
  }

  /**
   * 获取历史统计信息
   * @returns {Object} 历史统计信息
   */
  getHistoryStats() {
    const estimatedTokens = this.estimateTokens(this.conversationHistory)
    return {
      messageCount: this.conversationHistory.length,
      estimatedTokens: estimatedTokens,
      maxTokens: getConfig('model.maxTokens'),
      maxHistoryTokens: getConfig('conversation.maxTokensForHistory')
    }
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
   * 文档相关查询 - 专门处理文档内容的AI查询
   * @param {string} userQuestion - 用户问题
   * @param {Array} documentNames - 相关文档名称数组
   * @returns {Promise} AI回复
   */
  async queryWithDocuments(userQuestion, documentNames) {
    if (this.isProcessing) {
      return {
        success: false,
        message: '正在处理中，请稍候...'
      }
    }

    this.isProcessing = true

    try {
      // 先调用文档扫描
      const documentScanStore = await import('@/stores/documentScanStore.js')
      const { useDocumentScanStore } = documentScanStore
      const scanStore = useDocumentScanStore()
      
      // 根据文档名称映射到文档ID
      const documentService = await import('@/services/documentService.js')
      const documents = documentService.default.getAllDocuments()
      
      // 将文档名称转换为文档ID
      const documentIds = documentNames.map(name => {
        const doc = documents.find(d => d.name === name)
        console.log(`📄 文档名称: ${name} -> ID: ${doc ? doc.id : '未找到'}`)
        return doc ? doc.id : null
      }).filter(id => id !== null)
      
      console.log('📋 最终要扫描的文档ID:', documentIds)
      
      // 调用文档扫描
      if (documentIds.length > 0) {
        console.log('🔍 开始扫描相关文档:', documentIds)
        scanStore.startPartialScan(documentIds)
      }
      
      // 等待一小段时间让扫描完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 构建文档内容文本
      let documentsContent = ''
      for (const docName of documentNames) {
        const doc = documents.find(d => d.name === docName)
        if (doc) {
          documentsContent += `\n\n文档：${doc.name}\n描述：${doc.description}\n内容：${doc.content}\n`
        }
      }

      // 构建系统提示词
      const systemPrompt = `你是一个专业的文档分析助手。请根据提供的文档内容回答用户的问题。

用户问题：${userQuestion}

相关文档内容：
${documentsContent}

要求：
1. 仔细分析文档内容，找到与用户问题相关的信息
2. 基于文档中的具体信息回答用户问题
3. 如果文档中有相关信息，请直接使用文档中的信息
4. 回答要准确、具体、有用
5. 如果文档中没有相关信息，请说明并建议用户提供更多信息
6. 在extractedInfo字段中先总结文档中与用户问题直接相关的关键信息要点
7. 在answer字段中引用extractedInfo中的信息，形成完整的回答
###**特别注意：数据返回必须以<START>开始，以<END>结束，这是最重要的格式要求！**

<START>{
  "extractedInfo": ["与用户问题直接相关的关键信息1", "关键信息2", "关键信息3"],
  "answer": "基于extractedInfo中的信息，形成完整的回答内容，引用并解释这些关键信息"
}<END>

**格式要求说明：**
- extractedInfo 字段：先总结文档中与用户问题直接相关的关键信息要点数组，只提取能回答用户问题的信息
- answer 字段：基于extractedInfo中的信息，形成完整的回答，引用并解释这些关键信息
- 如果没有相关信息，对应字段返回空数组[]
请用中文回答，保持友好和专业的语调。`

      // 构建消息数组
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userQuestion
        }
      ]

      // 发送请求
      const response = await aiApiService.chatCompletion(messages, {
        max_tokens: getConfig('model.maxTokens'),
        temperature: getConfig('model.temperature'),
        top_p: getConfig('model.topP'),
        frequency_penalty: getConfig('model.frequencyPenalty'),
        presence_penalty: getConfig('model.presencePenalty')
      })

      if (response.success) {
        // 解析AI回复
        const aiContent = response.data.choices[0].message.content
        
        // 使用公共方法解析AI响应
        const parsedData = parseAIResponse(aiContent)
        
        if (parsedData && parsedData.answer) {
          return {
            success: true,
            data: response.data,
            message: '文档查询成功',
            content: parsedData.answer,
            parsedData: parsedData
          }
        } else {
          // 如果解析失败，返回原始内容
          return {
            success: true,
            data: response.data,
            message: '文档查询成功',
            content: parsedData ? parsedData.answer : aiContent
          }
        }
      } else {
        return {
          success: false,
          message: getConfig('errorHandling.fallbackResponse'),
          error: response.error
        }
      }
    } catch (error) {
      console.error('文档查询错误:', error)
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