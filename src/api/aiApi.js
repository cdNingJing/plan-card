/**
 * AI API 调用配置
 * 使用 Cerebras 代理服务
 */

const AI_API_CONFIG = {
  baseURL: '', // 使用相对路径，通过Vite代理
  endpoint: '/api/ai',
  model: 'deepseek-r1-distill-llama-70b',
  apiKey: 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK'
}

/**
 * AI API 调用类
 */
class AIApiService {
  constructor(config = AI_API_CONFIG) {
    this.config = config
    this.baseURL = config.baseURL
    this.endpoint = config.endpoint
    this.model = config.model
    this.apiKey = config.apiKey
  }

  /**
   * 发送聊天请求
   * @param {Array} messages - 消息数组
   * @param {Object} options - 可选参数
   * @returns {Promise} API响应
   */
  async chatCompletion(messages, options = {}) {
    try {
      const requestBody = {
        model: this.model,
        messages: messages,
        ...options
      }

      console.log('AI API 请求体:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${this.baseURL}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('AI API 响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('AI API 错误响应:', errorText)
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data,
        message: '请求成功'
      }
    } catch (error) {
      console.error('AI API调用错误:', error)
      return {
        success: false,
        error: error.message,
        message: '请求失败'
      }
    }
  }

  /**
   * 发送简单消息
   * @param {string} content - 消息内容
   * @param {Object} options - 可选参数
   * @returns {Promise} API响应
   */
  async sendMessage(content, options = {}) {
    const messages = [
      {
        role: 'user',
        content: content
      }
    ]
    return this.chatCompletion(messages, options)
  }

  /**
   * 发送对话消息
   * @param {Array} conversation - 对话历史
   * @param {string} userMessage - 用户新消息
   * @param {Object} options - 可选参数
   * @returns {Promise} API响应
   */
  async sendConversation(conversation, userMessage, options = {}) {
    const messages = [
      ...conversation,
      {
        role: 'user',
        content: userMessage
      }
    ]
    return this.chatCompletion(messages, options)
  }

  /**
   * 获取模型信息
   * @returns {Object} 模型配置信息
   */
  getModelInfo() {
    return {
      model: this.model,
      baseURL: this.baseURL,
      endpoint: this.endpoint
    }
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.baseURL = this.config.baseURL
    this.endpoint = this.config.endpoint
    this.model = this.config.model
    this.apiKey = this.config.apiKey
  }
}

// 创建默认实例
const aiApiService = new AIApiService()

// 导出实例和类
export default aiApiService
export { AIApiService, AI_API_CONFIG } 