/**
 * AI数据处理工具
 * 专门用于处理AI返回的JSON数据，包括解析和保存summary
 */

import aiDataStorage from './aiDataStorage.js'

class AIDataProcessor {
  /**
   * 处理AI回复内容，解析JSON并保存summary
   * @param {string} aiContent - AI的完整回复内容
   * @param {string} type - 数据类型 ('longTerm' | 'shortTerm')
   * @returns {Object} 处理结果
   */
  static async processAIResponse(aiContent, type = 'longTerm') {
    try {
      console.log('AI完整回复内容:', aiContent)
      let parsedData = null

      // 先删除<think></think>标签中的内容
      const cleanContent = aiContent.replace(/<think>[\s\S]*?<\/think>/g, '')

      // 使用更精确的正则表达式匹配JSON内容
      const startMatch = cleanContent.match(/<START>\s*(\{[\s\S]*?\})\s*<END>/)
      if (startMatch) {
        const jsonContent = startMatch[1].trim()
        try {
          parsedData = JSON.parse(jsonContent)
          console.log('结构化数据 parsedData', parsedData)
          
          // 处理summary数据
          if (parsedData.summary) {
            console.log('summary数据:', parsedData.summary)
            await this.saveSummary(parsedData.summary, type)
          }
          
          return {
            success: true,
            data: parsedData,
            message: 'AI回复处理成功'
          }
        } catch (error) {
          console.error('解析JSON失败:', error)
          return {
            success: false,
            error: 'JSON解析失败',
            message: error.message
          }
        }
      } else {
        // 如果没有找到完整的JSON对象，尝试匹配只有summary的格式
        const summaryMatch = cleanContent.match(/<START>\s*"summary":\s*(\{[\s\S]*?\})\s*<END>/)
        console.log('summaryMatch', summaryMatch)
        if (summaryMatch) {
          let summaryContent = summaryMatch[1].trim()
          console.log('summaryContent', summaryContent)
          
          // 清理JSON内容，移除末尾的多余字符
          summaryContent = summaryContent.replace(/\}\s*\}\s*$/, '}')
          
          try {
            const summaryData = JSON.parse(summaryContent)
            console.log('summary结构化数据:', summaryData)
            parsedData = { summary: summaryData }
            
            // 处理summary数据
            console.log('summary数据:', parsedData.summary)
            await this.saveSummary(parsedData.summary, type)
            
            return {
              success: true,
              data: parsedData,
              message: 'summary处理成功'
            }
          } catch (error) {
            console.error('解析summary JSON失败:', error)
            console.log('清理后的summaryContent:', summaryContent)
            return {
              success: false,
              error: 'summary JSON解析失败',
              message: error.message
            }
          }
        } else {
          console.log('未找到JSON内容')
          return {
            success: false,
            error: '未找到JSON内容',
            message: 'AI回复中未找到有效的JSON数据'
          }
        }
      }
    } catch (error) {
      console.error('处理AI回复失败:', error)
      return {
        success: false,
        error: '处理失败',
        message: error.message
      }
    }
  }

  /**
   * 保存summary数据
   * @param {Object} summary - summary数据对象
   * @param {string} type - 数据类型 ('longTerm' | 'shortTerm')
   * @returns {Object} 保存结果
   */
  static async saveSummary(summary, type = 'longTerm') {
    try {
      if (type === 'longTerm') {
        const result = await aiDataStorage.updateSummary(summary)
        if (result.success) {
          console.log('长期数据summary更新成功:', result.message)
        } else {
          console.error('长期数据summary更新失败:', result.message)
        }
        return result
      } else if (type === 'shortTerm') {
        const result = await aiDataStorage.updateShortTermSummary(summary)
        if (result.success) {
          console.log('短期记忆summary更新成功:', result.message)
        } else {
          console.error('短期记忆summary更新失败:', result.message)
        }
        return result
      } else {
        return {
          success: false,
          message: '不支持的数据类型'
        }
      }
    } catch (error) {
      console.error('保存summary时发生错误:', error)
      return {
        success: false,
        message: `保存失败: ${error.message}`
      }
    }
  }

  /**
   * 处理AI回复中的长期数据和短期记忆
   * @param {Object} parsedData - 解析后的AI数据
   * @returns {Object} 处理结果
   */
  static async processMemoryData(parsedData) {
    try {
      const results = {
        longTerm: null,
        shortTerm: null
      }

      // 处理长期数据
      if (parsedData.longTermData && parsedData.longTermData.trim()) {
        try {
          const timestamp = new Date().toISOString()
          const key = `ai_long_term_${timestamp}`
          const result = await aiDataStorage.saveLongTermData(key, parsedData.longTermData)
          results.longTerm = result
          if (result.success) {
            console.log('长期数据保存成功:', result.message)
          } else {
            console.error('长期数据保存失败:', result.message)
          }
        } catch (error) {
          console.error('保存长期数据时发生错误:', error)
          results.longTerm = { success: false, message: error.message }
        }
      }

      // 处理短期记忆
      if (parsedData.shortTermMemory && parsedData.shortTermMemory.trim()) {
        try {
          const timestamp = new Date().toISOString()
          const key = `ai_short_term_${timestamp}`
          const result = await aiDataStorage.saveShortTermData(key, parsedData.shortTermMemory)
          results.shortTerm = result
          if (result.success) {
            console.log('短期记忆保存成功:', result.message)
          } else {
            console.error('短期记忆保存失败:', result.message)
          }
        } catch (error) {
          console.error('保存短期记忆时发生错误:', error)
          results.shortTerm = { success: false, message: error.message }
        }
      }

      return {
        success: true,
        results
      }
    } catch (error) {
      console.error('处理记忆数据失败:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}

export default AIDataProcessor 