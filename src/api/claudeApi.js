/**
 * Claude API 服务
 * 用于调用 Anthropic Claude API
 */

const CLAUDE_API_CONFIG = {
  baseURL: '/api/claude',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK'
  },
  defaultModel: 'claude-sonnet-4-20250514',
  maxTokens: 64000
}

class ClaudeApiService {
  constructor() {
    this.config = CLAUDE_API_CONFIG
  }

  /**
   * 发送消息到 Claude API
   * @param {Object} options - 请求选项
   * @param {string} options.system - 系统提示词
   * @param {Array} options.messages - 消息数组
   * @param {string} options.model - 模型名称（可选）
   * @param {number} options.maxTokens - 最大token数（可选）
   * @returns {Promise<Object>} API响应
   */
  async sendMessage(options) {
    try {
      const {
        system = '',
        messages = [],
        model = this.config.defaultModel,
        maxTokens = this.config.maxTokens
      } = options

      const requestBody = {
        model,
        max_tokens: maxTokens,
        system,
        messages
      }

      console.log('🚀 发送 Claude API 请求:', {
        model,
        maxTokens,
        system: system.substring(0, 50) + '...',
        messageCount: messages.length
      })

      const response = await fetch(this.config.baseURL, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Claude API 请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Claude API 响应成功')
      
      return {
        success: true,
        data,
        status: response.status
      }

    } catch (error) {
      console.error('❌ Claude API 请求失败:', error)
      return {
        success: false,
        error: error.message,
        status: error.status || 500
      }
    }
  }

  /**
   * 简单的对话方法
   * @param {string} message - 用户消息
   * @param {string} systemPrompt - 系统提示词（可选）
   * @returns {Promise<Object>} 响应结果
   */
  async chat(message, systemPrompt = '') {
    return this.sendMessage({
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    })
  }

  /**
   * 多轮对话方法
   * @param {Array} conversationHistory - 对话历史
   * @param {string} systemPrompt - 系统提示词（可选）
   * @returns {Promise<Object>} 响应结果
   */
  async multiTurnChat(conversationHistory, systemPrompt = '') {
    return this.sendMessage({
      system: systemPrompt,
      messages: conversationHistory
    })
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig)
  }

  /**
   * 获取当前配置
   * @returns {Object} 当前配置
   */
  getConfig() {
    return { ...this.config }
  }
}

// 创建单例实例
const claudeApiService = new ClaudeApiService()

export default claudeApiService 