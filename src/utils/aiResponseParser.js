/**
 * AI响应解析工具
 * 处理AI返回的内容，提取JSON数据
 */

/**
 * 解析AI返回的内容
 * @param {string} content - AI返回的原始内容
 * @returns {object|null} 解析后的数据对象，如果解析失败返回null
 */
export function parseAIResponse(content) {
  if (!content || typeof content !== 'string') {
    console.error('parseAIResponse: 无效的content参数')
    return null
  }

  try {
    // 第一步：先删除<think></think>标签中的内容
    const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, '')
    console.log('原始AI回复:', content)
    console.log('清理后内容:', cleanContent)

    let parsedData = null

    // 第二步：使用更精确的正则表达式匹配JSON内容
    const startMatch = cleanContent.match(/<START>\s*(\{[\s\S]*?\})\s*<END>/)
    console.log('JSON匹配结果:', startMatch)

    if (startMatch) {
      const jsonContent = startMatch[1].trim()
      console.log('提取的JSON内容:', jsonContent)
      try {
        parsedData = JSON.parse(jsonContent)
        console.log('解析后的数据:', parsedData)
        return parsedData
      } catch (jsonParseError) {
        console.error('JSON解析失败:', jsonParseError)
        console.error('尝试解析的JSON内容:', jsonContent)
      }
    } else {
      // 第三步：如果没有找到<START><END>格式，尝试直接匹配JSON结构
      console.log('未找到<START><END>格式，尝试直接匹配JSON结构')
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonContent = jsonMatch[0].trim()
        console.log('直接匹配的JSON内容:', jsonContent)
        try {
          parsedData = JSON.parse(jsonContent)
          console.log('解析后的数据:', parsedData)
          return parsedData
        } catch (jsonParseError) {
          console.error('直接JSON解析失败:', jsonParseError)
          console.error('尝试解析的JSON内容:', jsonContent)
          
          // 第四步：如果JSON解析失败，尝试提取answer字段
          console.log('JSON解析失败，尝试提取answer字段')
          const answerMatch = cleanContent.match(/"answer":\s*"([^"]*(?:\\.[^"]*)*)"\s*[,}]/)
          if (answerMatch) {
            const answerContent = answerMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
            console.log('提取的answer内容:', answerContent)
            return {
              answer: answerContent,
              extractedInfo: [],
              relevantDocuments: [],
              availableServices: []
            }
          }
        }
      } else {
        // 第五步：如果没有找到JSON格式，返回原始内容
        console.log('未找到JSON格式，返回原始内容')
        return {
          answer: cleanContent,
          extractedInfo: [],
          relevantDocuments: [],
          availableServices: []
        }
      }
    }

    // 如果所有解析都失败，返回原始内容
    return {
      answer: cleanContent,
      extractedInfo: [],
      relevantDocuments: [],
      availableServices: []
    }

  } catch (parseError) {
    console.error('解析AI回复失败:', parseError)
    // 解析失败时返回原始内容
    return {
      answer: content,
      extractedInfo: [],
      relevantDocuments: [],
      availableServices: []
    }
  }
} 