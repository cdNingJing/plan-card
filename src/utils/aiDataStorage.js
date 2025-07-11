/**
 * AI数据存储工具
 * 专门用于处理AI返回的长期数据和短期记忆
 * 直接使用data文件夹中的JSON文件，通过后端API操作
 */

import aiLongTermData from '@/data/long-term/ai-long-term-data.json'
import aiShortTermMemory from '@/data/short-term/ai-short-term-memory.json'
import aiService from '@/services/aiService.js'
import { parseAIResponse } from '@/utils/aiResponseParser.js'

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
        
        // 保存成功后触发总结接口
        try {
          await this.triggerLongTermSummary()
          console.log('长期数据总结已触发')
        } catch (summaryError) {
          console.error('触发长期数据总结失败:', summaryError)
        }
        
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

        // 保存成功后触发总结接口
        try {
          await this.triggerShortTermSummary()
          console.log('长期数据总结已触发')
        } catch (summaryError) {
          console.error('触发长期数据总结失败:', summaryError)
        }
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

  /**
   * 更新长期数据summary
   * @param {Object} summary - summary数据对象
   * @returns {Object} 更新结果
   */
  async updateSummary(summary) {
    try {
      if (!summary) {
        return { success: false, message: '请输入summary数据！' }
      }

      // 调用后端API更新summary
      const response = await fetch(`${this.apiBaseUrl}/ai-long-term-data/summary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary })
      })

      const result = await response.json()

      if (result.success) {
        // 更新本地缓存
        this.longTermData = result.data
        console.log('长期数据summary已更新:', summary)
        return { 
          success: true, 
          message: 'summary更新成功！',
          data: this.longTermData
        }
      } else {
        return { success: false, message: result.error || '更新失败' }
      }
    } catch (error) {
      console.error('更新summary失败:', error)
      return { success: false, message: `更新失败: ${error.message}` }
    }
  }

  /**
   * 更新短期记忆summary
   * @param {Object} summary - summary数据对象
   * @returns {Object} 更新结果
   */
  async updateShortTermSummary(summary) {
    try {
      if (!summary) {
        return { success: false, message: '请输入summary数据！' }
      }

      // 调用后端API更新summary
      const response = await fetch(`${this.apiBaseUrl}/ai-short-term-memory/summary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary })
      })

      const result = await response.json()

      if (result.success) {
        // 更新本地缓存
        this.shortTermData = result.data
        console.log('短期记忆summary已更新:', summary)
        return { 
          success: true, 
          message: 'summary更新成功！',
          data: this.shortTermData
        }
      } else {
        return { success: false, message: result.error || '更新失败' }
      }
    } catch (error) {
      console.error('更新短期记忆summary失败:', error)
      return { success: false, message: `更新失败: ${error.message}` }
    }
  }

  /**
   * 触发长期数据总结
   * @returns {Object} 总结结果
   */
  async triggerLongTermSummary() {
    try {
      // 获取最新的长期数据
      const longTermData = await this.getLongTermData()
      const dataEntries = longTermData.ai_long_term_data.data_entries || {}
      
      if (Object.keys(dataEntries).length === 0) {
        console.log('没有长期数据需要总结')
        return { success: true, message: '没有数据需要总结' }
      }

      // 调用AI接口生成总结，使用basic场景并传入自定义提示词
      const customPrompt = `请根据以下长期数据生成一个结构化的总结。请仔细分析用户提供的信息，将相关内容整理到合适的分类中。

当前长期记忆数据：
${JSON.stringify(dataEntries, null, 2)}

要求：
1. 根据用户实际提供的信息动态创建分类，不要使用固定模板
2. 每个分类下的内容要具体明确，避免宽泛的描述
3. 如果用户提到多个同类信息，应该分别列出
4. 只包含用户实际提到的信息，不要添加推测内容
5. **强制规定：只能总结用户当前data_entries中实际存在的数据，严禁编造、推测或添加不存在的信息**

请严格按照以下JSON格式返回：

<START>
{
  "summary": {
    // 根据用户信息动态创建分类，例如：
    // "用户关系": { "具体关系类型": "具体描述" },
    // "兴趣爱好": { "具体爱好": "具体描述" },
    // "行程安排": { "具体日期或计划": "具体描述" },
    // "位置信息": { "具体位置": "具体描述" },
    // 等等...
  }
}
<END>`

      const aiResponse = await aiService.sendMessageWithScenario(customPrompt, 'basic', '', {}, true)

      if (aiResponse.success) {
        // 解析AI返回的总结
        const aiContent = aiResponse.data?.choices[0]?.message?.content
        if (aiContent) {
          // 使用公共方法解析AI响应
          const parsedData = parseAIResponse(aiContent)
          
          // 尝试解析JSON格式的总结
          let summary = null
          if (parsedData && parsedData.summary) {
            summary = parsedData.summary
          } else {
            summary = parsedData ? parsedData.answer : aiContent
          }

          // 保存总结到后端
          const saveResult = await this.updateSummary(summary)
          if (saveResult.success) {
            console.log('长期数据总结已生成并保存:', summary)
            return { 
              success: true, 
              message: '总结生成并保存成功！',
              data: this.longTermData
            }
          } else {
            console.error('保存总结失败:', saveResult.message)
            return { success: false, message: saveResult.message }
          }
        } else {
          console.error('AI返回内容为空')
          return { success: false, message: 'AI返回内容为空' }
        }
      } else {
        console.error('AI总结生成失败:', aiResponse.message)
        return { success: false, message: aiResponse.message }
      }
    } catch (error) {
      console.error('触发长期数据总结失败:', error)
      return { success: false, message: `总结失败: ${error.message}` }
    }
  }

  /**
   * 触发短期记忆总结
   * @returns {Object} 总结结果
   */
  async triggerShortTermSummary() {
    try {
      // 获取最新的短期记忆数据
      const shortTermData = await this.getShortTermData()
      const dataEntries = shortTermData.ai_short_term_memory.data_entries || {}
      
      if (Object.keys(dataEntries).length === 0) {
        console.log('没有短期记忆需要总结')
        return { success: true, message: '没有数据需要总结' }
      }

      // 调用AI接口生成总结，使用basic场景并传入自定义提示词
      const customPrompt = `请根据以下短期记忆数据生成一个结构化的四象限总结。请仔细分析用户提供的信息，按照重要性和紧急性进行分类。

当前短期记忆数据：
${JSON.stringify(dataEntries, null, 2)}

要求：
1. 严格按照四象限分类：重要且紧急、重要不紧急、紧急不重要、不重要不紧急
2. 每个象限下的内容要具体明确，避免宽泛的描述
3. 重点关注短期计划、即时需求、时间安排等
4. 只包含用户实际提到的信息，不要添加推测内容
5. 为每个项目添加标记字段，标识其重要性和紧急性
6. 基于data_entries中的实际数据进行分析和分类
7. **强制规定：只能总结用户当前data_entries中实际存在的数据，严禁编造、推测或添加不存在的信息**

请严格按照以下JSON格式返回：

<START>
{
  "data_entries": 需要总结的data_entries 按照四象限分类 给每一个加上一个新的字段, 字段名为"category" 值为"重要且紧急"、"重要不紧急"、"紧急不重要"、"不重要不紧急",
  "summary": {
    "重要且紧急": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "high",
          "urgency": "high",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    },
    "重要不紧急": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "high",
          "urgency": "low",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    },
    "紧急不重要": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "low",
          "urgency": "high",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    },
    "不重要不紧急": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "low",
          "urgency": "low",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    }
  }
}
<END>`

      const aiResponse = await aiService.sendMessageWithScenario(customPrompt, 'basic', '', {}, true)

      if (aiResponse.success) {
        // 解析AI返回的总结
        const aiContent = aiResponse.data?.choices[0]?.message?.content
        if (aiContent) {
          // 使用公共方法解析AI响应
          const parsedData = parseAIResponse(aiContent)
          
          // 尝试解析JSON格式的总结
          let summary = null
          if (parsedData && parsedData.summary) {
            summary = parsedData.summary
          } else {
            summary = parsedData ? parsedData.answer : aiContent
          }

          // 保存总结到后端
          const saveResult = await this.updateShortTermSummary(summary)
          if (saveResult.success) {
            console.log('短期记忆总结已生成并保存:', summary)
            
            return { 
              success: true, 
              message: '短期记忆总结生成并保存成功！',
              data: this.shortTermData
            }
          } else {
            console.error('保存短期记忆总结失败:', saveResult.message)
            return { success: false, message: saveResult.message }
          }
        } else {
          console.error('AI返回内容为空')
          return { success: false, message: 'AI返回内容为空' }
        }
      } else {
        console.error('AI短期记忆总结生成失败:', aiResponse.message)
        return { success: false, message: aiResponse.message }
      }
    } catch (error) {
      console.error('触发短期记忆总结失败:', error)
      return { success: false, message: `短期记忆总结失败: ${error.message}` }
    }
  }
}

export default new AIDataStorage() 