/**
 * AI 配置管理器
 * 统一管理 AI 配置和场景切换
 */

import { AI_CONFIG, getConversationConfig } from './aiConfig.js'
import { getAllScenarios, getScenario } from './scenarios.js'

class ConfigManager {
  constructor() {
    this.currentScenario = 'basic'
    this.config = { ...AI_CONFIG }
  }

  /**
   * 设置当前场景
   * @param {string} scenarioName - 场景名称
   */
  setScenario(scenarioName) {
    if (getAllScenarios()[scenarioName]) {
      this.currentScenario = scenarioName
      return true
    }
    return false
  }

  /**
   * 获取当前场景
   * @returns {string} 当前场景名称
   */
  getCurrentScenario() {
    return this.currentScenario
  }

  /**
   * 获取当前场景配置
   * @returns {Object} 当前场景配置
   */
  getCurrentScenarioConfig() {
    return getScenario(this.currentScenario)
  }

  /**
   * 获取完整的AI配置（包含当前场景的systemPrompt）
   * @returns {Object} 完整的AI配置
   */
  getFullConfig() {
    return {
      ...this.config,
      conversation: getConversationConfig(this.currentScenario)
    }
  }

  /**
   * 获取API配置
   * @returns {Object} API配置
   */
  getApiConfig() {
    return this.config.api
  }

  /**
   * 获取模型配置
   * @returns {Object} 模型配置
   */
  getModelConfig() {
    return this.config.model
  }

  /**
   * 获取对话配置（包含当前场景的systemPrompt）
   * @returns {Object} 对话配置
   */
  getConversationConfig() {
    return getConversationConfig(this.currentScenario)
  }

  /**
   * 获取缓存配置
   * @returns {Object} 缓存配置
   */
  getCacheConfig() {
    return this.config.cache
  }

  /**
   * 获取错误处理配置
   * @returns {Object} 错误处理配置
   */
  getErrorHandlingConfig() {
    return this.config.errorHandling
  }

  /**
   * 获取功能开关配置
   * @returns {Object} 功能开关配置
   */
  getFeaturesConfig() {
    return this.config.features
  }

  /**
   * 获取所有可用场景
   * @returns {Object} 所有场景配置
   */
  getAllScenarios() {
    return getAllScenarios()
  }

  /**
   * 验证配置
   * @returns {Object} 验证结果
   */
  validateConfig() {
    const errors = []
    
    if (!this.config.api.baseURL) {
      errors.push('API baseURL 未配置')
    }
    
    if (!this.config.api.apiKey) {
      errors.push('API Key 未配置')
    }
    
    if (!this.config.model.name) {
      errors.push('模型名称未配置')
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig)
  }

  /**
   * 重置配置到默认值
   */
  resetConfig() {
    this.config = { ...AI_CONFIG }
    this.currentScenario = 'basic'
  }
}

// 创建单例实例
const configManager = new ConfigManager()

export default configManager 