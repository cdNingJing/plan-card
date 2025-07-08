/**
 * AI数据存储工具
 * 专门用于处理AI返回的长期数据和短期记忆
 * 直接使用data文件夹中的JSON文件，通过后端API操作
 */

import aiLongTermData from '@/data/long-term/ai-long-term-data.json'
import aiShortTermMemory from '@/data/short-term/ai-short-term-memory.json'

class AIDataStorage {
  constructor() {
    this.longTermData = { ...aiLongTermData }
    this.shortTermData = { ...aiShortTermMemory }
    this.apiBaseUrl = 'http://localhost:3001/api'
  }

  /**
   * 保存长期数据
   * @param {string} key - 数据键名
   * @param {string} value - 数据值
   * @returns {Object} 保存结果
   */
  async saveLongTermData(key, value) {
    try {
      if (!key || !value) {
        return { success: false, message: '请输入键名和值！' }
      }

      // 调用后端API保存数据
      const response = await fetch(`${this.apiBaseUrl}/ai-long-term-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value })
      })

      const result = await response.json()

      if (result.success) {
        // 更新本地缓存
        this.longTermData = result.data
        console.log('长期数据已保存到文件:', key, value)
        return { 
          success: true, 
          message: '长期数据保存成功！',
          data: this.longTermData
        }
      } else {
        return { success: false, message: result.error || '保存失败' }
      }
    } catch (error) {
      console.error('保存长期数据失败:', error)
      return { success: false, message: `保存失败: ${error.message}` }
    }
  }

  /**
   * 保存短期记忆
   * @param {string} key - 数据键名
   * @param {string} value - 数据值
   * @returns {Object} 保存结果
   */
  async saveShortTermData(key, value) {
    try {
      if (!key || !value) {
        return { success: false, message: '请输入键名和值！' }
      }
      // 调用后端API保存数据
      const response = await fetch(`${this.apiBaseUrl}/ai-short-term-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value })
      })
      const result = await response.json()
      if (result.success) {
        this.shortTermData = result.data
        console.log('短期记忆已保存到文件:', key, value)
        return {
          success: true,
          message: '短期记忆保存成功！',
          data: this.shortTermData
        }
      } else {
        return { success: false, message: result.error || '保存失败' }
      }
    } catch (error) {
      console.error('保存短期记忆失败:', error)
      return { success: false, message: `保存失败: ${error.message}` }
    }
  }

  /**
   * 获取长期数据
   * @returns {Object} 长期数据
   */
  async getLongTermData() {
    try {
      // 从后端API获取最新数据
      const response = await fetch(`${this.apiBaseUrl}/ai-long-term-data`)
      const result = await response.json()
      
      if (result.success) {
        this.longTermData = result.data
        return this.longTermData
      } else {
        console.error('获取长期数据失败:', result.error)
        return this.longTermData // 返回本地缓存
      }
    } catch (error) {
      console.error('获取长期数据失败:', error)
      return this.longTermData // 返回本地缓存
    }
  }

  /**
   * 获取短期数据
   * @returns {Object} 短期数据
   */
  async getShortTermData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-short-term-memory`)
      const result = await response.json()
      if (result.success) {
        this.shortTermData = result.data
        return this.shortTermData
      } else {
        console.error('获取短期记忆失败:', result.error)
        return this.shortTermData
      }
    } catch (error) {
      console.error('获取短期记忆失败:', error)
      return this.shortTermData
    }
  }

  /**
   * 获取长期数据记录
   * @param {number} limit - 限制数量
   * @returns {Array} 记录列表
   */
  async getLongTermRecords(limit = 10) {
    try {
      const data = await this.getLongTermData()
      const entries = data.ai_long_term_data.data_entries
      return Object.entries(entries)
        .slice(0, limit)
        .map(([key, data]) => ({
          key,
          value: data.value,
          time: data.timestamp
        }))
    } catch (error) {
      console.error('获取长期数据记录失败:', error)
      return []
    }
  }

  /**
   * 获取短期数据记录
   * @param {number} limit - 限制数量
   * @returns {Array} 记录列表
   */
  async getShortTermRecords(limit = 10) {
    try {
      const data = await this.getShortTermData()
      const entries = data.ai_short_term_memory.data_entries
      return Object.entries(entries)
        .slice(0, limit)
        .map(([key, data]) => ({
          key,
          value: data.value,
          time: data.timestamp
        }))
    } catch (error) {
      console.error('获取短期记忆记录失败:', error)
      return []
    }
  }

  /**
   * 初始化数据
   */
  async init() {
    try {
      // 从后端API获取最新数据
      await this.getLongTermData()

      // 尝试从localStorage加载短期数据缓存
      const cachedShortTerm = localStorage.getItem('ai_short_term_memory')
      if (cachedShortTerm) {
        this.shortTermData = JSON.parse(cachedShortTerm)
      }

      console.log('AI数据存储初始化完成')
    } catch (error) {
      console.error('AI数据存储初始化失败:', error)
    }
  }

  /**
   * 导出长期数据
   * @returns {Object} 导出结果
   */
  async exportLongTermData() {
    try {
      const data = await this.getLongTermData()
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-long-term-data_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return { success: true, message: '长期数据导出成功！' }
    } catch (error) {
      console.error('导出长期数据失败:', error)
      return { success: false, message: `导出失败: ${error.message}` }
    }
  }

  /**
   * 导出短期数据
   * @returns {Object} 导出结果
   */
  async exportShortTermData() {
    try {
      const dataStr = JSON.stringify(this.shortTermData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-short-term-memory_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return { success: true, message: '短期数据导出成功！' }
    } catch (error) {
      console.error('导出短期数据失败:', error)
      return { success: false, message: `导出失败: ${error.message}` }
    }
  }

  /**
   * 清空长期数据
   * @returns {Object} 清空结果
   */
  async clearLongTermData() {
    try {
      // 调用后端API清空数据
      const response = await fetch(`${this.apiBaseUrl}/ai-long-term-data`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // 更新本地缓存
        this.longTermData = result.data
        return { 
          success: true, 
          message: '长期数据已清空！',
          data: this.longTermData
        }
      } else {
        return { success: false, message: result.error || '清空失败' }
      }
    } catch (error) {
      console.error('清空长期数据失败:', error)
      return { success: false, message: `清空失败: ${error.message}` }
    }
  }

  /**
   * 清空短期数据
   * @returns {Object} 清空结果
   */
  async clearShortTermData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-short-term-memory`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        this.shortTermData = result.data
        return {
          success: true,
          message: '短期数据已清空！',
          data: this.shortTermData
        }
      } else {
        return { success: false, message: result.error || '清空失败' }
      }
    } catch (error) {
      console.error('清空短期记忆失败:', error)
      return { success: false, message: `清空失败: ${error.message}` }
    }
  }

  /**
   * 删除指定的长期数据
   * @param {string} key - 要删除的数据键名
   * @returns {Object} 删除结果
   */
  async deleteLongTermData(key) {
    try {
      if (!key) {
        return { success: false, message: '请输入要删除的键名！' }
      }

      // 调用后端API删除数据
      const response = await fetch(`${this.apiBaseUrl}/ai-long-term-data/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // 更新本地缓存
        this.longTermData = result.data
        return { 
          success: true, 
          message: '长期数据删除成功！',
          data: this.longTermData
        }
      } else {
        return { success: false, message: result.error || '删除失败' }
      }
    } catch (error) {
      console.error('删除长期数据失败:', error)
      return { success: false, message: `删除失败: ${error.message}` }
    }
  }

  /**
   * 删除指定的短期记忆
   * @param {string} key - 要删除的数据键名
   * @returns {Object} 删除结果
   */
  async deleteShortTermData(key) {
    try {
      if (!key) {
        return { success: false, message: '请输入要删除的键名！' }
      }
      const response = await fetch(`${this.apiBaseUrl}/ai-short-term-memory/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        this.shortTermData = result.data
        return {
          success: true,
          message: '短期记忆删除成功！',
          data: this.shortTermData
        }
      } else {
        return { success: false, message: result.error || '删除失败' }
      }
    } catch (error) {
      console.error('删除短期记忆失败:', error)
      return { success: false, message: `删除失败: ${error.message}` }
    }
  }
}

export default new AIDataStorage() 