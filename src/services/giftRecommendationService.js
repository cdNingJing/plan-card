// 礼物推荐服务
import { getAPICall } from '@/config/aiConfig.js'

export class GiftRecommendationService {
  constructor() {
    this.apiCall = getAPICall()
  }

  /**
   * 生成礼物建议
   * @param {Object} userInfo 用户信息
   * @param {string} userInfo.recipient 收礼人
   * @param {string} userInfo.occasion 送礼场合
   * @param {string} userInfo.budget 预算范围
   * @param {string} userInfo.interests 兴趣爱好
   * @param {string} userInfo.searchQuery 具体需求
   * @returns {Promise<Array>} 礼物建议列表
   */
  async generateGiftSuggestions(userInfo) {
    try {
      const { recipient, occasion, budget, interests, searchQuery } = userInfo || {}
      
      // 构建AI提示词
      const prompt = this.buildGiftRecommendationPrompt({
        recipient,
        occasion,
        budget,
        interests,
        searchQuery
      })

      // 如果信息不足，不调用AI接口
      if (!prompt) {
        console.log('[GiftRecommendationService] 信息不足，跳过AI调用')
        return []
      }

      // 调用AI接口
      const response = await this.apiCall({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: `你是一个专业的礼物推荐专家，擅长根据收礼人的特点和需求推荐合适的礼物品类。

请根据用户提供的信息，生成3-5个礼物品类建议。每个建议应包含：
1. 礼物品类名称（如：化妆品、首饰、数码产品等，不要具体品牌）
2. 推荐理由（为什么适合这个收礼人）
3. 价格范围（根据预算给出合理建议）
4. 购买建议（在哪里购买、注意事项等）

推荐原则：
- 根据收礼人关系（妈妈、爸爸、女朋友等）推荐合适的品类
- 考虑送礼场合（生日、母亲节、结婚纪念日等）的特殊性
- 结合收礼人的兴趣爱好（园艺、阅读、运动等）
- 根据预算范围给出合理的价格建议
- 推荐实用性强、有意义的礼物品类

请用中文回复，格式要清晰易读。`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      // 解析AI响应
      const suggestions = this.parseAIResponse(response)
      return suggestions

    } catch (error) {
      console.error('[GiftRecommendationService] 生成礼物建议失败:', error)
      return []
    }
  }

  /**
   * 获取最近的节日
   */
  getUpcomingHolidays() {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    const holidays = [
      { name: '母亲节', month: 5, day: 14, description: '感恩母亲的节日' },
      { name: '父亲节', month: 6, day: 18, description: '感恩父亲的节日' },
      { name: '七夕节', month: 8, day: 22, description: '中国情人节' },
      { name: '中秋节', month: 9, day: 29, description: '团圆节日' },
      { name: '国庆节', month: 10, day: 1, description: '祖国生日' },
      { name: '圣诞节', month: 12, day: 25, description: '西方重要节日' },
      { name: '元旦', month: 1, day: 1, description: '新年第一天' },
      { name: '春节', month: 2, day: 10, description: '中国最重要的传统节日' },
      { name: '情人节', month: 2, day: 14, description: '浪漫的节日' },
      { name: '妇女节', month: 3, day: 8, description: '女性的节日' }
    ]
    
    // 计算距离当前日期的天数
    const getDaysUntil = (holiday) => {
      let holidayDate = new Date(currentYear, holiday.month - 1, holiday.day)
      
      // 如果节日已经过了，计算明年的日期
      if (holidayDate < now) {
        holidayDate = new Date(currentYear + 1, holiday.month - 1, holiday.day)
      }
      
      const diffTime = holidayDate.getTime() - now.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    
    // 计算所有节日的距离并排序
    const upcomingHolidays = holidays
      .map(holiday => ({
        ...holiday,
        daysUntil: getDaysUntil(holiday)
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3) // 取最近的3个节日
    
    return upcomingHolidays
  }

  /**
   * 构建礼物推荐提示词
   */
  buildGiftRecommendationPrompt(userInfo) {
    const { recipient, occasion, budget, interests, searchQuery } = userInfo || {}
    
    // 检查是否有足够的信息
    const hasEnoughInfo = recipient || occasion || budget || interests || searchQuery
    if (!hasEnoughInfo) {
      return null // 信息不足，不生成提示词
    }

    // 正确获取当前时间和节日
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    const upcomingHolidays = this.getUpcomingHolidays()

    let prompt = `请根据以下信息推荐合适的礼物品类：\n\n
当前时间：${currentYear}年${currentMonth}月${currentDay}日\n
${recipient ? `收礼人：${recipient}\n` : ''}${occasion ? `送礼场合：${occasion}\n` : ''}${!occasion && upcomingHolidays.length > 0 ? `送礼场合：未指定，建议考虑以下最近的节日：\n${upcomingHolidays.map((h, i) => `  ${i + 1}. ${h.name}（${h.description}，还有${h.daysUntil}天）`).join('\\n')}\n` : ''}${budget ? `预算范围：${budget}\n` : ''}${interests ? `兴趣爱好：${interests}\n` : ''}${searchQuery ? `具体需求：${searchQuery}\n` : ''}
请根据以上信息，推荐3-5个最合适的礼物品类。每个品类包含：\n1. 礼物品类名称（如：化妆品、首饰、数码产品等，不要具体品牌）\n2. 推荐理由（结合收礼人特点、场合、兴趣等）\n3. 价格范围（根据预算给出合理建议）\n4. 购买建议（在哪里购买、注意事项等）\n\n<SCENE_ANALYSIS_START>\n[
  {
    "id": 1,
    "title": "礼物品类名称",
    "reason": "推荐理由",
    "priceRange": "价格范围",
    "purchaseAdvice": "购买建议"
  }
]\n<SCENE_ANALYSIS_END>\n\n注意：请确保推荐的是礼物品类，而不是具体商品品牌。`;
    return prompt
  }

  /**
   * 解析AI响应
   */
  parseAIResponse(response) {
    try {
      const content = response.choices?.[0]?.message?.content || response.content?.[0]?.text || '';

      // 优先提取 <SCENE_ANALYSIS_START> ... <SCENE_ANALYSIS_END> 之间的内容
      const sceneMatch = content.match(/<SCENE_ANALYSIS_START>([\s\S]*?)<SCENE_ANALYSIS_END>/);
      if (sceneMatch) {
        const jsonStr = sceneMatch[1].trim();
        try {
          const suggestions = JSON.parse(jsonStr);
          return Array.isArray(suggestions)
            ? suggestions.map((suggestion, index) => ({
                id: suggestion.id || index + 1,
                title: suggestion.title || '礼物建议',
                reason: suggestion.reason || '',
                priceRange: suggestion.priceRange || '',
                purchaseAdvice: suggestion.purchaseAdvice || ''
              }))
            : [];
        } catch (e) {
          // JSON解析失败，降级为文本提取
        }
      }

      // 兼容旧的 ```json 代码块
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1];
        const suggestions = JSON.parse(jsonStr);
        return suggestions.map((suggestion, index) => ({
          id: suggestion.id || index + 1,
          title: suggestion.title || '礼物建议',
          reason: suggestion.reason || '',
          priceRange: suggestion.priceRange || '',
          purchaseAdvice: suggestion.purchaseAdvice || ''
        }));
      }

      // 如果无法解析JSON，尝试从文本中提取建议
      return this.extractSuggestionsFromText(content);

    } catch (error) {
      console.error('[GiftRecommendationService] 解析AI响应失败:', error);
      return [];
    }
  }

  /**
   * 从文本中提取建议
   */
  extractSuggestionsFromText(text) {
    const suggestions = []
    const lines = text.split('\n')
    let currentSuggestion = null
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // 检测新的建议开始
      if (trimmedLine.match(/^\d+\./) || trimmedLine.includes('礼物') || trimmedLine.includes('推荐')) {
        if (currentSuggestion) {
          suggestions.push(currentSuggestion)
        }
        currentSuggestion = {
          id: suggestions.length + 1,
          title: trimmedLine.replace(/^\d+\.\s*/, ''),
          reason: '',
          priceRange: '',
          purchaseAdvice: ''
        }
      } else if (currentSuggestion && trimmedLine) {
        // 添加到当前建议
        if (!currentSuggestion.reason) {
          currentSuggestion.reason = trimmedLine
        } else if (!currentSuggestion.priceRange && trimmedLine.includes('价格')) {
          currentSuggestion.priceRange = trimmedLine
        } else if (!currentSuggestion.purchaseAdvice && trimmedLine.includes('购买')) {
          currentSuggestion.purchaseAdvice = trimmedLine
        }
      }
    }
    
    if (currentSuggestion) {
      suggestions.push(currentSuggestion)
    }
    
    return suggestions
  }


}

// 创建单例实例
export const giftRecommendationService = new GiftRecommendationService()