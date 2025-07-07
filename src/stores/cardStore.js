import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBasicInfoFields } from '@/config/basicInfoFields.js'

export const useCardStore = defineStore('card', () => {
  // 当前活跃的卡片组合
  const activeCards = ref([])
  
  // 卡片状态：expanded, collapsed, fullscreen
  const cardStates = ref({})
  
  // 卡片数据
  const cardData = ref({})
  
  // 用户输入历史
  const inputHistory = ref([])
  
  // 当前解析的上下文
  const currentContext = ref({})
  
  // 当前场景和卡片配置
  const currentScene = ref('general')
  const currentCards = ref([])

  // 计算属性
  const visibleCards = computed(() => 
    activeCards.value.filter(card => !card.hidden)
  )

  const expandedCards = computed(() => 
    activeCards.value.filter(card => cardStates.value[card.id] === 'expanded')
  )

  // 卡片类型定义
  const cardTypes = {
    destination: {
      name: '目的地卡片',
      icon: 'MapPin',
      category: 'travel',
      defaultState: 'expanded',
      priority: 1
    },
    flight: {
      name: '航班推荐卡片',
      icon: 'Plane',
      category: 'travel',
      defaultState: 'collapsed',
      priority: 2
    },
    hotel: {
      name: '酒店推荐卡片',
      icon: 'Building',
      category: 'travel',
      defaultState: 'collapsed',
      priority: 3
    },
    itinerary: {
      name: '行程卡片',
      icon: 'Calendar',
      category: 'travel',
      defaultState: 'fullscreen',
      priority: 4,
      optional: true
    },
    packing: {
      name: '打包清单卡片',
      icon: 'Package',
      category: 'travel',
      defaultState: 'expanded',
      priority: 5,
      linkage: ['destination']
    },
    profile: {
      name: '画像卡片',
      icon: 'User',
      category: 'gift',
      defaultState: 'collapsed',
      priority: 1
    },
    gift: {
      name: '礼物推荐卡片',
      icon: 'Gift',
      category: 'gift',
      defaultState: 'expanded',
      priority: 2
    },
    budget: {
      name: '预算过滤卡片',
      icon: 'DollarSign',
      category: 'gift',
      defaultState: 'expanded',
      priority: 3
    },
    tips: {
      name: '附加提示卡片',
      icon: 'Lightbulb',
      category: 'gift',
      defaultState: 'collapsed',
      priority: 4
    },
    meeting: {
      name: '会议详情卡片',
      icon: 'Calendar',
      category: 'meeting',
      defaultState: 'expanded',
      priority: 1
    },
    'meeting-confirm': {
      name: '会议确认卡片',
      icon: 'CheckCircle',
      category: 'meeting',
      defaultState: 'expanded',
      priority: 2,
      linkage: ['basic-info']
    },
    participants: {
      name: '参与者卡片',
      icon: 'Users',
      category: 'meeting',
      defaultState: 'collapsed',
      priority: 2
    },
    reminder: {
      name: '提醒设置卡片',
      icon: 'Bell',
      category: 'meeting',
      defaultState: 'expanded',
      priority: 3
    },
    action: {
      name: 'Action执行反馈卡片',
      icon: 'CheckCircle',
      category: 'meeting',
      defaultState: 'expanded',
      priority: 4,
      writeOperation: true
    },
    attachment: {
      name: '附件上传卡片',
      icon: 'Paperclip',
      category: 'meeting',
      defaultState: 'collapsed',
      priority: 5,
      optional: true
    },
    'basic-info': {
      name: '基础信息',
      icon: 'Info',
      category: 'travel',
      defaultState: 'expanded',
      priority: 1
    },
    shop: {
      name: '商品搜索卡片',
      icon: 'Package',
      category: 'gift',
      defaultState: 'collapsed',
      priority: 2
    },

  }

  // 方法
  const parseUserInput = (input) => {
    const context = {
      intent: '',
      entities: {},
      category: '',
      keywords: []
    }

    // 简单的意图识别
    if (input.includes('旅行') || input.includes('去') || input.includes('玩') || /travel|trip|journey|holiday/i.test(input)) {
      context.intent = 'travel'
      context.category = 'travel'
    } else if (input.includes('礼物') || input.includes('送')) {
      context.intent = 'gift'
      context.category = 'gift'
    } else if (input.includes('会议') || input.includes('提醒')) {
      context.intent = 'meeting'
      context.category = 'meeting'
    }

    // 中文和英文地名提取
    const destinations = [
      // 中国城市
      '东京', '大阪', '北京', '上海', '成都', '广州', '深圳', '杭州', '南京', '西安', '重庆', '武汉', '香港', '台北', '新加坡', '曼谷', '首尔',
      // 英文城市名
      'newyork', 'new york', 'chengdu', 'beijing', 'shanghai', 'tokyo', 'osaka', 'guangzhou', 'shenzhen', 'hangzhou', 'nanjing', 'xian', 'chongqing', 'wuhan', 'hongkong', 'taipei', 'singapore', 'bangkok', 'seoul',
      // 美国城市
      'los angeles', 'chicago', 'miami', 'san francisco', 'washington', 'boston', 'seattle', 'dallas', 'atlanta',
      // 欧洲城市
      'london', 'paris', 'berlin', 'rome', 'madrid', 'barcelona', 'amsterdam', 'frankfurt', 'munich', 'zurich', 'vienna', 'prague', 'budapest', 'warsaw', 'stockholm', 'oslo', 'copenhagen', 'helsinki',
      // 中文欧洲城市名
      '巴黎', '伦敦', '柏林', '罗马', '马德里', '巴塞罗那', '阿姆斯特丹', '法兰克福', '慕尼黑', '苏黎世', '维也纳', '布拉格', '布达佩斯', '华沙', '斯德哥尔摩', '奥斯陆', '哥本哈根', '赫尔辛基'
    ]
    
    // 优先处理 from ... to ... 格式
    const fromToMatch = input.match(/from\s+([a-zA-Z\u4e00-\u9fa5]+)\s+to\s+([a-zA-Z\u4e00-\u9fa5]+)/i)
    if (fromToMatch) {
      context.entities.departure = fromToMatch[1]
      context.entities.destination = fromToMatch[2]
      console.log('[parseUserInput] 解析到 from-to 格式:', { departure: fromToMatch[1], destination: fromToMatch[2] })
    } else {
      // 处理中文的"从...前往..."格式
      const chineseFromToMatch = input.match(/从\s*([\u4e00-\u9fa5]+)\s*前往\s*([\u4e00-\u9fa5]+)(?=\s|，|。|！|？|$)/)
      if (chineseFromToMatch) {
        context.entities.departure = chineseFromToMatch[1]
        // 检查目的地是否在预定义的地名列表中
        const destination = chineseFromToMatch[2]
        const matchedDestination = destinations.find(dest => 
          destination.toLowerCase().includes(dest.toLowerCase())
        )
        
        if (matchedDestination) {
          // 如果找到匹配的地名，强制使用标准地名
          context.entities.destination = matchedDestination
          console.log('[parseUserInput] 强制修正目的地:', { original: destination, corrected: matchedDestination })
        } else {
          context.entities.destination = destination
        }
        
        console.log('[parseUserInput] 解析到中文 from-to 格式:', { departure: chineseFromToMatch[1], destination: context.entities.destination })
      } else {
        // 如果没有明确的 from-to 格式，再检查单个地名
        const foundDestinations = []
        destinations.forEach(dest => {
          // 使用单词边界匹配，避免部分匹配
          const regex = new RegExp(`\\b${dest.replace(/\s+/g, '\\s+')}\\b`, 'i')
          if (regex.test(input)) {
            foundDestinations.push(dest)
          }
        })
        
        // 按出现顺序分配出发地和目的地
        if (foundDestinations.length >= 2) {
          context.entities.departure = foundDestinations[0]
          context.entities.destination = foundDestinations[1]
          console.log('[parseUserInput] 解析到地名:', { departure: foundDestinations[0], destination: foundDestinations[1] })
        } else if (foundDestinations.length === 1) {
          context.entities.destination = foundDestinations[0]
          console.log('[parseUserInput] 解析到目的地:', foundDestinations[0])
        }
      }
    }

    // 日期提取（支持多种格式）
    // 1. 中文日期区间格式：2025年7月10日到7月17日
    const chineseDateRangeMatch = input.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*[到至]\s*(\d{1,2})月(\d{1,2})日/)
    if (chineseDateRangeMatch) {
      const year = chineseDateRangeMatch[1]
      const startMonth = chineseDateRangeMatch[2].padStart(2, '0')
      const startDay = chineseDateRangeMatch[3].padStart(2, '0')
      const endMonth = chineseDateRangeMatch[4].padStart(2, '0')
      const endDay = chineseDateRangeMatch[5].padStart(2, '0')
      
      context.entities.startDate = `${year}-${startMonth}-${startDay}`
      context.entities.endDate = `${year}-${endMonth}-${endDay}`
      console.log('[parseUserInput] 解析到中文日期区间格式:', { 
        startDate: context.entities.startDate, 
        endDate: context.entities.endDate 
      })
    } else {
      // 2. 中文单个日期格式：2025年8月15日
      const chineseDateMatch = input.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
      if (chineseDateMatch) {
        const year = chineseDateMatch[1]
        const month = chineseDateMatch[2].padStart(2, '0')
        const day = chineseDateMatch[3].padStart(2, '0')
        const formattedDate = `${year}-${month}-${day}`
        context.entities.startDate = formattedDate
        console.log('[parseUserInput] 解析到中文单个日期格式:', formattedDate)
      } else {
        // 3. 日期区间提取（支持 between ... and ... 或 2025/7/10-2025/7/17）
        const dateRangeMatch = input.match(/between\s*(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\s*and\s*(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/i)
        if (dateRangeMatch) {
          context.entities.startDate = formatDateForInput(dateRangeMatch[1])
          context.entities.endDate = formatDateForInput(dateRangeMatch[2])
          console.log('[parseUserInput] 解析到 between-and 日期格式:', { startDate: dateRangeMatch[1], endDate: dateRangeMatch[2] })
        } else {
          // 4. 2025/7/10-2025/7/17 格式
          const dashRange = input.match(/(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\s*[-~—]\s*(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/)
          if (dashRange) {
            context.entities.startDate = formatDateForInput(dashRange[1])
            context.entities.endDate = formatDateForInput(dashRange[2])
            console.log('[parseUserInput] 解析到 dash 日期格式:', { startDate: dashRange[1], endDate: dashRange[2] })
          } else {
            // 5. 单个日期提取（如 2025/7/11）
            const singleDateMatch = input.match(/(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/)
            if (singleDateMatch) {
              context.entities.startDate = formatDateForInput(singleDateMatch[1])
              console.log('[parseUserInput] 解析到单个日期:', singleDateMatch[1])
            }
          }
        }
      }
    }

    // 同行人提取（支持多种格式）
    // 1. 英文格式：with friends/family/xxx
    const withMatch = input.match(/with\s+([a-zA-Z\u4e00-\u9fa5\s,]+?)(?:\s+from|\s+to|\s+between|$)/i)
    if (withMatch) {
      const companions = withMatch[1].split(/,|\s/).filter(Boolean)
      context.entities.companions = companions
      // 计算总人数（包括自己）
      const totalTravelers = companions.length + 1
      context.entities.travelers = totalTravelers
      console.log('[parseUserInput] 解析到英文同行人:', { companions, travelers: totalTravelers })
    } else {
      // 2. 中文格式：与朋友、和家人、和同事、和女朋友等
      const chineseWithMatch = input.match(/[与和]\s*([\u4e00-\u9fa5]+)/)
      if (chineseWithMatch) {
        const companion = chineseWithMatch[1]
        context.entities.companions = [companion]
        // 计算总人数（包括自己）
        const totalTravelers = 2 // 与朋友 = 2人
        context.entities.travelers = totalTravelers
        console.log('[parseUserInput] 解析到中文同行人:', { companion, travelers: totalTravelers })
      }
    }
    
    // 3. 中文复合格式：与朋友和家人共4人
    const chineseComplexMatch = input.match(/[与和]\s*([\u4e00-\u9fa5]+(?:\s*和\s*[\u4e00-\u9fa5]+)*)\s*共\s*(\d+)\s*人/)
    if (chineseComplexMatch) {
      const companionsText = chineseComplexMatch[1]
      const totalPeople = parseInt(chineseComplexMatch[2])
      const companions = companionsText.split(/\s*和\s*/).filter(Boolean)
      context.entities.companions = companions
      context.entities.travelers = totalPeople
      console.log('[parseUserInput] 解析到中文复合同行人格式:', { companions, travelers: totalPeople })
    }
    
    // 4. 人数提取（数字 + 人/people/persons）- 只在没有其他人数信息时使用
    if (!context.entities.travelers) {
      const peopleMatch = input.match(/(\d+)\s*(人|people|persons?)/i)
      if (peopleMatch) {
        const peopleCount = parseInt(peopleMatch[1])
        context.entities.travelers = peopleCount
        console.log('[parseUserInput] 解析到人数:', peopleCount)
      }
    }

    // 预算
    const budgetMatch = input.match(/(\d+)元|budget\s*(\d+)/i)
    if (budgetMatch) {
      context.entities.budget = parseInt(budgetMatch[1] || budgetMatch[2])
    }

    // 天数
    const timeMatch = input.match(/(\d+)天|住\s*(\d+)\s*天|for\s*(\d+)\s*days?/i)
    if (timeMatch) {
      context.entities.duration = parseInt(timeMatch[1] || timeMatch[2] || timeMatch[3])
      console.log('[parseUserInput] 解析到天数:', context.entities.duration)
      
      // 如果有开始日期和天数，自动计算结束日期
      if (context.entities.startDate && context.entities.duration) {
        const startDate = new Date(context.entities.startDate)
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + context.entities.duration - 1) // 减1因为包含开始日期
        context.entities.endDate = endDate.toISOString().split('T')[0]
        console.log('[parseUserInput] 根据天数计算结束日期:', context.entities.endDate)
      }
    }

    // 日期关键词
    const dateMatch = input.match(/(明天|今天|后天|tomorrow|today|the day after tomorrow)/i)
    if (dateMatch) {
      context.entities.date = dateMatch[1]
    }

    // 关键词提取
    const keywords = input.split(/[，。！？\s]+/).filter(word => word.length > 1)
    context.keywords = keywords

    console.log('[parseUserInput] 解析结果:', context)
    return context
  }

  // 格式化日期为 YYYY-MM-DD 格式
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return ''
    
    // 处理 2025/7/10 或 2025-7-10 格式
    const parts = dateStr.split(/[\/-]/)
    if (parts.length === 3) {
      const year = parts[0]
      const month = parts[1].padStart(2, '0')
      const day = parts[2].padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return dateStr
  }

  // 解析AI回复中的场景分析结果
  const parseSceneAnalysis = (aiResponse) => {
    try {
      // 首先尝试从标记的JSON格式中提取场景分析
      const startMarker = '<SCENE_ANALYSIS_START>'
      const endMarker = '<SCENE_ANALYSIS_END>'
      
      const startIndex = aiResponse.indexOf(startMarker)
      const endIndex = aiResponse.indexOf(endMarker)
      
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonContent = aiResponse.substring(
          startIndex + startMarker.length,
          endIndex
        ).trim()
        
        console.log('[parseSceneAnalysis] 从标记中提取的JSON内容:', jsonContent)
        
        // 使用与 extractEntitiesFromAIResponse 相同的JSON修复逻辑
        let jsonStr = jsonContent
        
        // 修复缺少逗号的问题 - 更全面的正则表达式
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":/g, '"$1": "$2", "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":/g, '"$1": $2, "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":\s*\[/g, '"$1": "$2", "$3": [')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":\s*\[/g, '"$1": $2, "$3": [')
        
        // 修复空字符串后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":/g, '"$1": "", "$2":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":\s*\[/g, '"$1": "", "$2": [')
        
        // 修复数组后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":/g, '"$1": [$2], "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":\s*\[/g, '"$1": [$2], "$3": [')
        
        // 修复字符串值中的引号问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*}/g, '"$1": "$2"}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*}/g, '"$1": $2}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*}/g, '"$1": [$2]}')
        
        // 修复空字符串结尾的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*}/g, '"$1": ""}')
        
        console.log('[parseSceneAnalysis] 修复后JSON:', jsonStr)
        
        const analysis = JSON.parse(jsonStr)
        
        // 提取实体信息
        const entities = extractEntitiesFromAIResponse(aiResponse)
        
        return {
          scene: analysis.scene || 'general',
          cards: analysis.cards || ['basic-info'],
          title: analysis.title || '',
          entities: entities // 添加解析的实体信息
        }
      }
    } catch (error) {
      console.warn('[parseSceneAnalysis] 标记JSON解析失败，尝试传统解析:', error)
    }
    
    // 如果标记解析失败，尝试传统的JSON解析作为备选方案
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*"scene"[\s\S]*"cards"[\s\S]*\}/)
      if (jsonMatch) {
        // 使用相同的JSON修复逻辑
        let jsonStr = jsonMatch[0]
        
        console.log('[parseSceneAnalysis] 传统解析原始JSON:', jsonStr)
        
        // 修复缺少逗号的问题 - 更全面的正则表达式
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":/g, '"$1": "$2", "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":/g, '"$1": $2, "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":\s*\[/g, '"$1": "$2", "$3": [')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":\s*\[/g, '"$1": $2, "$3": [')
        
        // 修复空字符串后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":/g, '"$1": "", "$2":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":\s*\[/g, '"$1": "", "$2": [')
        
        // 修复数组后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":/g, '"$1": [$2], "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":\s*\[/g, '"$1": [$2], "$3": [')
        
        // 修复字符串值中的引号问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*}/g, '"$1": "$2"}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*}/g, '"$1": $2}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*}/g, '"$1": [$2]}')
        
        // 修复空字符串结尾的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*}/g, '"$1": ""}')
        
        console.log('[parseSceneAnalysis] 传统解析修复后JSON:', jsonStr)
        
        const analysis = JSON.parse(jsonStr)
        
        // 提取实体信息
        const entities = extractEntitiesFromAIResponse(aiResponse)
        
        return {
          scene: analysis.scene || 'general',
          cards: analysis.cards || ['basic-info'],
          title: analysis.title || '',
          entities: entities // 添加解析的实体信息
        }
      }
    } catch (error) {
      console.warn('[parseSceneAnalysis] 传统JSON解析也失败:', error)
    }
    
    // 如果解析失败，使用关键词检测作为备选方案
    const fallback = detectScenarioByKeywords(aiResponse)
    const entities = extractEntitiesFromAIResponse(aiResponse)
    return {
      ...fallback,
      entities: entities
    }
  }
  
  // 从AI回复中提取实体信息
  const extractEntitiesFromAIResponse = (aiResponse) => {
    const entities = {}
    
    // 首先尝试从标记的JSON格式中提取实体信息
    try {
      // 使用特定的开始和结束标记来提取JSON内容
      const startMarker = '<SCENE_ANALYSIS_START>'
      const endMarker = '<SCENE_ANALYSIS_END>'
      
      const startIndex = aiResponse.indexOf(startMarker)
      const endIndex = aiResponse.indexOf(endMarker)
      
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonContent = aiResponse.substring(
          startIndex + startMarker.length,
          endIndex
        ).trim()
        
        console.log('[extractEntitiesFromAIResponse] 从标记中提取的JSON内容:', jsonContent)
        
        // 尝试修复常见的JSON格式问题
        let jsonStr = jsonContent
        
        // 修复缺少逗号的问题 - 更全面的正则表达式
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":/g, '"$1": "$2", "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":/g, '"$1": $2, "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":\s*\[/g, '"$1": "$2", "$3": [')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":\s*\[/g, '"$1": $2, "$3": [')
        
        // 修复空字符串后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":/g, '"$1": "", "$2":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":\s*\[/g, '"$1": "", "$2": [')
        
        // 修复数组后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":/g, '"$1": [$2], "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":\s*\[/g, '"$1": [$2], "$3": [')
        
        // 修复字符串值中的引号问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*}/g, '"$1": "$2"}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*}/g, '"$1": $2}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*}/g, '"$1": [$2]}')
        
        // 修复空字符串结尾的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*}/g, '"$1": ""}')
        
                  console.log('[extractEntitiesFromAIResponse] 修复后JSON:', jsonStr)
        
        const analysis = JSON.parse(jsonStr)
        if (analysis.entities) {
          // 清理和验证实体数据
          const cleanedEntities = {}
          
          // 处理 travelers 字段 - 允许为空，默认为1
          if (analysis.entities.travelers !== undefined && analysis.entities.travelers !== null) {
            if (typeof analysis.entities.travelers === 'string') {
              if (analysis.entities.travelers === '多人' || analysis.entities.travelers === '') {
                cleanedEntities.travelers = 2 // 默认多人设为2
              } else if (analysis.entities.travelers.includes('人')) {
                const numMatch = analysis.entities.travelers.match(/(\d+)/)
                cleanedEntities.travelers = numMatch ? parseInt(numMatch[1]) : 1
              } else {
                cleanedEntities.travelers = parseInt(analysis.entities.travelers) || 1
              }
            } else {
              cleanedEntities.travelers = analysis.entities.travelers
            }
          } else {
            cleanedEntities.travelers = 1 // 默认值
          }
          
          // 处理其他字段 - 允许为空
          if (analysis.entities.departure !== undefined && analysis.entities.departure !== null && analysis.entities.departure !== '') {
            cleanedEntities.departure = analysis.entities.departure
          }
          
          if (analysis.entities.destination !== undefined && analysis.entities.destination !== null && analysis.entities.destination !== '') {
            cleanedEntities.destination = analysis.entities.destination
          }
          
          if (analysis.entities.startDate !== undefined && analysis.entities.startDate !== null && analysis.entities.startDate !== '') {
            cleanedEntities.startDate = analysis.entities.startDate
          }
          
          if (analysis.entities.endDate !== undefined && analysis.entities.endDate !== null && analysis.entities.endDate !== '') {
            cleanedEntities.endDate = analysis.entities.endDate
          }
          
          if (analysis.entities.travelType !== undefined && analysis.entities.travelType !== null && analysis.entities.travelType !== '') {
            cleanedEntities.travelType = analysis.entities.travelType
          }
          
          // 处理预算字段，支持下拉框选项值
          if (analysis.entities.budget !== undefined && analysis.entities.budget !== null && analysis.entities.budget !== '') {
            // 直接使用AI返回的预算值，支持 "budget"、"comfort"、"luxury" 等选项值
            cleanedEntities.budget = analysis.entities.budget
            console.log('[extractEntitiesFromAIResponse] 解析预算:', { original: analysis.entities.budget, parsed: cleanedEntities.budget })
          }
          
          if (analysis.entities.companions !== undefined && analysis.entities.companions !== null && Array.isArray(analysis.entities.companions) && analysis.entities.companions.length > 0) {
            cleanedEntities.companions = analysis.entities.companions
          }
          
          if (analysis.entities.duration !== undefined && analysis.entities.duration !== null) {
            if (typeof analysis.entities.duration === 'string') {
              if (analysis.entities.duration === '') {
                // 如果duration为空，尝试从日期计算
                if (cleanedEntities.startDate && cleanedEntities.endDate) {
                  const start = new Date(cleanedEntities.startDate)
                  const end = new Date(cleanedEntities.endDate)
                  const diffTime = Math.abs(end - start)
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  cleanedEntities.duration = diffDays
                } else {
                  cleanedEntities.duration = 1 // 默认值
                }
              } else {
                const durationMatch = analysis.entities.duration.match(/(\d+)/)
                cleanedEntities.duration = durationMatch ? parseInt(durationMatch[1]) : 1
              }
            } else {
              cleanedEntities.duration = analysis.entities.duration
            }
          } else {
            // 如果duration为空，尝试从日期计算
            if (cleanedEntities.startDate && cleanedEntities.endDate) {
              const start = new Date(cleanedEntities.startDate)
              const end = new Date(cleanedEntities.endDate)
              const diffTime = Math.abs(end - start)
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              cleanedEntities.duration = diffDays
            } else {
              cleanedEntities.duration = 1 // 默认值
            }
          }
          
          if (analysis.entities.purpose !== undefined && analysis.entities.purpose !== null && analysis.entities.purpose !== '') {
            cleanedEntities.purpose = analysis.entities.purpose
          }
          
          // 处理购物场景的字段
          if (analysis.entities.recipient !== undefined && analysis.entities.recipient !== null && analysis.entities.recipient !== '') {
            cleanedEntities.recipient = analysis.entities.recipient
          }
          
          if (analysis.entities.occasion !== undefined && analysis.entities.occasion !== null && analysis.entities.occasion !== '') {
            cleanedEntities.occasion = analysis.entities.occasion
          }
          
          if (analysis.entities.interests !== undefined && analysis.entities.interests !== null && analysis.entities.interests !== '') {
            cleanedEntities.interests = analysis.entities.interests
          }
          
          if (analysis.entities.searchQuery !== undefined && analysis.entities.searchQuery !== null && analysis.entities.searchQuery !== '') {
            cleanedEntities.searchQuery = analysis.entities.searchQuery
          }
          
          if (analysis.entities.query !== undefined && analysis.entities.query !== null && analysis.entities.query !== '') {
            cleanedEntities.query = analysis.entities.query
          }
          
          if (analysis.entities.querys !== undefined && analysis.entities.querys !== null && analysis.entities.querys !== '') {
            cleanedEntities.querys = analysis.entities.querys
          }
          
          if (analysis.entities.sort_by !== undefined && analysis.entities.sort_by !== null && analysis.entities.sort_by !== '') {
            cleanedEntities.sort_by = analysis.entities.sort_by
          }
          
          if (analysis.entities.limit !== undefined && analysis.entities.limit !== null) {
            cleanedEntities.limit = parseInt(analysis.entities.limit) || 10
          }
          
          if (analysis.entities.page !== undefined && analysis.entities.page !== null) {
            cleanedEntities.page = parseInt(analysis.entities.page) || 1
          }
          
          if (analysis.entities.exclude_sponsored !== undefined && analysis.entities.exclude_sponsored !== null) {
            cleanedEntities.exclude_sponsored = analysis.entities.exclude_sponsored
          }
          
          if (analysis.entities.detail !== undefined && analysis.entities.detail !== null) {
            cleanedEntities.detail = parseInt(analysis.entities.detail) || 0
          }
          
          // 处理会议场景的字段
          if (analysis.entities.meetingTitle !== undefined && analysis.entities.meetingTitle !== null && analysis.entities.meetingTitle !== '') {
            cleanedEntities.meetingTitle = analysis.entities.meetingTitle
          }
          
          if (analysis.entities.meetingDate !== undefined && analysis.entities.meetingDate !== null && analysis.entities.meetingDate !== '') {
            cleanedEntities.meetingDate = analysis.entities.meetingDate
          }
          
          if (analysis.entities.meetingTime !== undefined && analysis.entities.meetingTime !== null && analysis.entities.meetingTime !== '') {
            cleanedEntities.meetingTime = analysis.entities.meetingTime
          }
          
          if (analysis.entities.participants !== undefined && analysis.entities.participants !== null && Array.isArray(analysis.entities.participants) && analysis.entities.participants.length > 0) {
            cleanedEntities.participants = analysis.entities.participants
          }
          
          if (analysis.entities.meetingType !== undefined && analysis.entities.meetingType !== null && analysis.entities.meetingType !== '') {
            cleanedEntities.meetingType = analysis.entities.meetingType
          }
          
          // 通用字段处理 - 保留所有其他字段
          Object.keys(analysis.entities).forEach(key => {
            if (!cleanedEntities.hasOwnProperty(key) && analysis.entities[key] !== undefined && analysis.entities[key] !== null) {
              cleanedEntities[key] = analysis.entities[key]
            }
          })
          
          console.log('[extractEntitiesFromAIResponse] 从标记JSON中提取实体信息:', cleanedEntities)
          return cleanedEntities
        }
      }
    } catch (error) {
      console.warn('[extractEntitiesFromAIResponse] 标记JSON解析失败，尝试传统解析:', error)
    }
    
    // 如果标记解析失败，尝试传统的JSON解析作为备选方案
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*"entities"[\s\S]*\}/)
      if (jsonMatch) {
        // 使用原有的JSON修复逻辑
        let jsonStr = jsonMatch[0]
        
        console.log('[extractEntitiesFromAIResponse] 传统解析原始JSON:', jsonStr)
        
        // 修复缺少逗号的问题 - 更全面的正则表达式
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":/g, '"$1": "$2", "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":/g, '"$1": $2, "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*"(\w+)":\s*\[/g, '"$1": "$2", "$3": [')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*"(\w+)":\s*\[/g, '"$1": $2, "$3": [')
        
        // 修复空字符串后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":/g, '"$1": "", "$2":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*"(\w+)":\s*\[/g, '"$1": "", "$2": [')
        
        // 修复数组后缺少逗号的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":/g, '"$1": [$2], "$3":')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*"(\w+)":\s*\[/g, '"$1": [$2], "$3": [')
        
        // 修复字符串值中的引号问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*"([^"]*)"\s*}/g, '"$1": "$2"}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*(\d+)\s*}/g, '"$1": $2}')
        jsonStr = jsonStr.replace(/"(\w+)":\s*\[([^\]]*)\]\s*}/g, '"$1": [$2]}')
        
        // 修复空字符串结尾的问题
        jsonStr = jsonStr.replace(/"(\w+)":\s*""\s*}/g, '"$1": ""}')
        
                  console.log('[extractEntitiesFromAIResponse] 传统解析修复后JSON:', jsonStr)
        
        const analysis = JSON.parse(jsonStr)
        if (analysis.entities) {
          // 使用相同的清理逻辑
          const cleanedEntities = {}
          
          // 处理 travelers 字段 - 允许为空，默认为1
          if (analysis.entities.travelers !== undefined && analysis.entities.travelers !== null) {
            if (typeof analysis.entities.travelers === 'string') {
              if (analysis.entities.travelers === '多人' || analysis.entities.travelers === '') {
                cleanedEntities.travelers = 2 // 默认多人设为2
              } else if (analysis.entities.travelers.includes('人')) {
                const numMatch = analysis.entities.travelers.match(/(\d+)/)
                cleanedEntities.travelers = numMatch ? parseInt(numMatch[1]) : 1
              } else {
                cleanedEntities.travelers = parseInt(analysis.entities.travelers) || 1
              }
            } else {
              cleanedEntities.travelers = analysis.entities.travelers
            }
          } else {
            cleanedEntities.travelers = 1 // 默认值
          }
          
          // 处理其他字段 - 允许为空
          if (analysis.entities.departure !== undefined && analysis.entities.departure !== null && analysis.entities.departure !== '') {
            cleanedEntities.departure = analysis.entities.departure
          }
          
          if (analysis.entities.destination !== undefined && analysis.entities.destination !== null && analysis.entities.destination !== '') {
            cleanedEntities.destination = analysis.entities.destination
          }
          
          if (analysis.entities.startDate !== undefined && analysis.entities.startDate !== null && analysis.entities.startDate !== '') {
            cleanedEntities.startDate = analysis.entities.startDate
          }
          
          if (analysis.entities.endDate !== undefined && analysis.entities.endDate !== null && analysis.entities.endDate !== '') {
            cleanedEntities.endDate = analysis.entities.endDate
          }
          
          if (analysis.entities.travelType !== undefined && analysis.entities.travelType !== null && analysis.entities.travelType !== '') {
            cleanedEntities.travelType = analysis.entities.travelType
          }
          
          // 处理预算字段，支持下拉框选项值
          if (analysis.entities.budget !== undefined && analysis.entities.budget !== null && analysis.entities.budget !== '') {
            // 直接使用AI返回的预算值，支持 "budget"、"comfort"、"luxury" 等选项值
            cleanedEntities.budget = analysis.entities.budget
            console.log('[extractEntitiesFromAIResponse] 解析预算:', { original: analysis.entities.budget, parsed: cleanedEntities.budget })
          }
          
          if (analysis.entities.companions !== undefined && analysis.entities.companions !== null && Array.isArray(analysis.entities.companions) && analysis.entities.companions.length > 0) {
            cleanedEntities.companions = analysis.entities.companions
          }
          
          if (analysis.entities.duration !== undefined && analysis.entities.duration !== null) {
            if (typeof analysis.entities.duration === 'string') {
              if (analysis.entities.duration === '') {
                // 如果duration为空，尝试从日期计算
                if (cleanedEntities.startDate && cleanedEntities.endDate) {
                  const start = new Date(cleanedEntities.startDate)
                  const end = new Date(cleanedEntities.endDate)
                  const diffTime = Math.abs(end - start)
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  cleanedEntities.duration = diffDays
                } else {
                  cleanedEntities.duration = 1 // 默认值
                }
              } else {
                const durationMatch = analysis.entities.duration.match(/(\d+)/)
                cleanedEntities.duration = durationMatch ? parseInt(durationMatch[1]) : 1
              }
            } else {
              cleanedEntities.duration = analysis.entities.duration
            }
          } else {
            // 如果duration为空，尝试从日期计算
            if (cleanedEntities.startDate && cleanedEntities.endDate) {
              const start = new Date(cleanedEntities.startDate)
              const end = new Date(cleanedEntities.endDate)
              const diffTime = Math.abs(end - start)
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              cleanedEntities.duration = diffDays
            } else {
              cleanedEntities.duration = 1 // 默认值
            }
          }
          
          if (analysis.entities.purpose !== undefined && analysis.entities.purpose !== null && analysis.entities.purpose !== '') {
            cleanedEntities.purpose = analysis.entities.purpose
          }
          
          // 处理购物场景的字段
          if (analysis.entities.recipient !== undefined && analysis.entities.recipient !== null && analysis.entities.recipient !== '') {
            cleanedEntities.recipient = analysis.entities.recipient
          }
          
          if (analysis.entities.occasion !== undefined && analysis.entities.occasion !== null && analysis.entities.occasion !== '') {
            cleanedEntities.occasion = analysis.entities.occasion
          }
          
          if (analysis.entities.interests !== undefined && analysis.entities.interests !== null && analysis.entities.interests !== '') {
            cleanedEntities.interests = analysis.entities.interests
          }
          
          if (analysis.entities.searchQuery !== undefined && analysis.entities.searchQuery !== null && analysis.entities.searchQuery !== '') {
            cleanedEntities.searchQuery = analysis.entities.searchQuery
          }
          
          if (analysis.entities.query !== undefined && analysis.entities.query !== null && analysis.entities.query !== '') {
            cleanedEntities.query = analysis.entities.query
          }
          
          if (analysis.entities.querys !== undefined && analysis.entities.querys !== null && analysis.entities.querys !== '') {
            cleanedEntities.querys = analysis.entities.querys
          }
          
          if (analysis.entities.sort_by !== undefined && analysis.entities.sort_by !== null && analysis.entities.sort_by !== '') {
            cleanedEntities.sort_by = analysis.entities.sort_by
          }
          
          if (analysis.entities.limit !== undefined && analysis.entities.limit !== null) {
            cleanedEntities.limit = parseInt(analysis.entities.limit) || 10
          }
          
          if (analysis.entities.page !== undefined && analysis.entities.page !== null) {
            cleanedEntities.page = parseInt(analysis.entities.page) || 1
          }
          
          if (analysis.entities.exclude_sponsored !== undefined && analysis.entities.exclude_sponsored !== null) {
            cleanedEntities.exclude_sponsored = analysis.entities.exclude_sponsored
          }
          
          if (analysis.entities.detail !== undefined && analysis.entities.detail !== null) {
            cleanedEntities.detail = parseInt(analysis.entities.detail) || 0
          }
          
          // 处理会议场景的字段
          if (analysis.entities.meetingTitle !== undefined && analysis.entities.meetingTitle !== null && analysis.entities.meetingTitle !== '') {
            cleanedEntities.meetingTitle = analysis.entities.meetingTitle
          }
          
          if (analysis.entities.meetingDate !== undefined && analysis.entities.meetingDate !== null && analysis.entities.meetingDate !== '') {
            cleanedEntities.meetingDate = analysis.entities.meetingDate
          }
          
          if (analysis.entities.meetingTime !== undefined && analysis.entities.meetingTime !== null && analysis.entities.meetingTime !== '') {
            cleanedEntities.meetingTime = analysis.entities.meetingTime
          }
          
          if (analysis.entities.participants !== undefined && analysis.entities.participants !== null && Array.isArray(analysis.entities.participants) && analysis.entities.participants.length > 0) {
            cleanedEntities.participants = analysis.entities.participants
          }
          
          if (analysis.entities.meetingType !== undefined && analysis.entities.meetingType !== null && analysis.entities.meetingType !== '') {
            cleanedEntities.meetingType = analysis.entities.meetingType
          }
          
          // 通用字段处理 - 保留所有其他字段
          Object.keys(analysis.entities).forEach(key => {
            if (!cleanedEntities.hasOwnProperty(key) && analysis.entities[key] !== undefined && analysis.entities[key] !== null) {
              cleanedEntities[key] = analysis.entities[key]
            }
          })
          
          console.log('[extractEntitiesFromAIResponse] 从传统JSON中提取实体信息:', cleanedEntities)
          return cleanedEntities
        }
      }
    } catch (error) {
      console.warn('[extractEntitiesFromAIResponse] 传统JSON解析也失败，使用文本解析:', error)
    }
    
    // 如果JSON解析失败，使用文本解析作为备选方案
    // 提取出发地和目的地
    const fromToMatch = aiResponse.match(/从\s*([\u4e00-\u9fa5]+)\s*前往\s*([\u4e00-\u9fa5]+)/)
    if (fromToMatch) {
      entities.departure = fromToMatch[1]
      entities.destination = fromToMatch[2]
    }
    
    // 提取日期信息
    const dateRangeMatch = aiResponse.match(/(\d{1,2})月(\d{1,2})日[至到](\d{1,2})月(\d{1,2})日/)
    if (dateRangeMatch) {
      const currentYear = new Date().getFullYear()
      const startMonth = dateRangeMatch[1].padStart(2, '0')
      const startDay = dateRangeMatch[2].padStart(2, '0')
      const endMonth = dateRangeMatch[3].padStart(2, '0')
      const endDay = dateRangeMatch[4].padStart(2, '0')
      
      entities.startDate = `${currentYear}-${startMonth}-${startDay}`
      entities.endDate = `${currentYear}-${endMonth}-${endDay}`
    }
    
    // 提取人数信息
    const travelersMatch = aiResponse.match(/独自旅行|(\d+)人/)
    if (travelersMatch) {
      if (travelersMatch[0] === '独自旅行') {
        entities.travelers = 1
      } else {
        entities.travelers = parseInt(travelersMatch[1])
      }
    } else {
      entities.travelers = 1 // 默认值
    }
    
    // 提取旅行类型
    if (aiResponse.includes('商务')) {
      entities.travelType = 'business'
    } else if (aiResponse.includes('旅游') || aiResponse.includes('度假')) {
      entities.travelType = 'leisure'
    }
    
    return entities
  }
  
  const detectScenarioByKeywords = (input) => {
    // 增强礼物场景关键词识别
    if (/礼物|送|买.*礼物|购买.*礼物|给.+买礼物|给.+送礼物/.test(input)) {
      return {
        scene: 'gift',
        cards: ['basic-info', 'profile', 'gift', 'budget', 'tips'],
        entities: parseUserInput(input).entities || {}
      }
    } else if (/购物|搜索|购买|买|商品|产品|shop|purchase|buy|search/.test(input)) {
      return {
        scene: 'gift',
        cards: ['basic-info', 'shop', 'profile', 'tips'],
        entities: parseUserInput(input).entities || {}
      }
    } else if (input.includes('旅行') || input.includes('旅游') || input.includes('出行') || input.includes('游玩') || input.includes('度假') || input.includes('机票') || input.includes('酒店') || input.includes('景点')) {
      return {
        scene: 'travel',
        cards: ['basic-info', 'flight', 'hotel', 'itinerary', 'packing'],
        entities: parseUserInput(input).entities || {}
      }
    } else if (input.includes('会议') || input.includes('开会') || input.includes('讨论') || input.includes('提醒') || input.includes('参与者') || input.includes('日程')) {
      // 检查是否包含延期相关关键词
      const postponementKeywords = ['推迟', '延期', '延迟', '改期', '延后', '明天', '后天']
      const hasPostponementIntent = postponementKeywords.some(keyword => input.includes(keyword))
      
      if (hasPostponementIntent) {
        return {
          scene: 'meeting',
          cards: ['basic-info', 'meeting-postponement', 'meeting-result'],
          entities: parseUserInput(input).entities || {}
        }
      } else {
        return {
          scene: 'meeting',
          cards: ['basic-info', 'meeting-summary', 'meeting-result'],
          entities: parseUserInput(input).entities || {}
        }
      }
    }
    return {
      scene: 'general',
      cards: ['basic-info', 'suggestions', 'resources'],
      entities: parseUserInput(input).entities || {}
    }
  }
  
  const detectScenario = (input) => {
    const result = detectScenarioByKeywords(input)
    return result.scene
  }

  // 根据场景和卡片类型生成卡片
  const generateCardsByScene = (scene, cardTypes, context = {}) => {
    console.log('[generateCardsByScene] scene:', scene, 'cardTypes:', cardTypes, 'context:', context)
    const cards = []
    
    // 确保 cardTypes 是数组
    if (!Array.isArray(cardTypes)) {
      console.warn('[generateCardsByScene] cardTypes 不是数组，使用默认值:', cardTypes)
      cardTypes = ['basic-info', 'suggestions', 'resources']
    }
    
    // 确保包含基础信息卡片
    if (!cardTypes.includes('basic-info')) {
      cardTypes.unshift('basic-info')
    }
    
    cardTypes.forEach((cardType, index) => {
      const card = createCardByType(cardType, scene, index, context)
      if (card) {
        cards.push(card)
      }
    })
    
    console.log('[generateCardsByScene] 生成的 cards:', cards)
    return cards
  }
  
  // 创建指定类型的卡片
  const createCardByType = (cardType, scene, index, context = {}) => {
    const cardTitles = {
      'basic-info': {
        travel: '旅行基础信息',
        gift: '礼物推荐基础信息', 
        meeting: '会议基础信息',
        general: '基础信息'
      },
      'flight': '航班推荐',
      'hotel': '酒店推荐',
      'itinerary': '行程规划',
      'packing': '打包清单',
      'profile': '收礼人画像',
      'gift': '礼物推荐',
      'budget': '预算筛选',
      'tips': '贴心提示',
      'shop': '商品搜索',
      'meeting': '会议详情',
      'meeting-confirm': '会议确认',
      'participants': '参与者管理',
      'reminder': '提醒设置',
      'feedback': '执行反馈',
      'attachments': '附件管理',
      'suggestions': '建议方案',
      'resources': '相关资源'
    }
    
    const title = cardTitles[cardType]?.[scene] || cardTitles[cardType] || cardType
    const baseData = generateCardData(cardType, context)
    // 强制覆盖 basic-info 的 scenario 字段为当前 scene
    if (cardType === 'basic-info') {
      baseData.scenario = scene
    }
    const card = {
      id: `${cardType}-${scene}-${index}`,
      type: cardType,
      title: title,
      state: 'collapsed',
      data: baseData
    }
    console.log('[createCardByType]', cardType, 'scene:', scene, 'card:', card)
    return card
  }
  
  const generateCards = (input, aiResponse = null) => {
    console.log('[generateCards] input:', input, 'aiResponse:', aiResponse)
    let scene = 'general'
    let cardTypes = ['basic-info', 'suggestions', 'resources']
    let entities = {}
    
    // 如果有AI回复，尝试解析场景分析结果
    if (aiResponse) {
      const analysis = parseSceneAnalysis(aiResponse)
      scene = analysis.scene || 'general'
      cardTypes = Array.isArray(analysis.cards) ? analysis.cards : []
      entities = analysis.entities || {} // 使用AI解析的实体信息
      console.log('[generateCards] 使用AI解析的实体信息:', entities)
      
      // 如果AI回复中没有解析到具体的卡片类型，则不生成通用卡片
      if (!Array.isArray(analysis.cards) || analysis.cards.length === 0) {
        console.log('[generateCards] AI回复中没有具体卡片类型，不生成通用卡片')
        return []
      }
    } else {
      // 使用关键词检测作为备选方案
      const analysis = detectScenarioByKeywords(input)
      scene = analysis.scene || 'general'
      cardTypes = Array.isArray(analysis.cards) ? analysis.cards : ['basic-info', 'suggestions', 'resources']
      // 本地解析实体信息
      entities = parseUserInput(input).entities || {}
    }
    
    // 确保 cardTypes 是有效的数组
    if (!Array.isArray(cardTypes) || cardTypes.length === 0) {
      console.warn('[generateCards] cardTypes 无效，不生成卡片')
      return []
    }
    
    // 更新当前场景和卡片配置
    currentScene.value = scene
    currentCards.value = cardTypes
    
    // 使用解析的实体信息生成卡片
    const context = { entities }
    const cards = generateCardsByScene(scene, cardTypes, context)
    console.log('[generateCards] 最终生成的 cards:', cards)
    return cards
  }

  const generateCardData = (type, context = {}) => {
    const data = (() => {
      switch (type) {
        case 'basic-info':
          // 如果有 context.entities，则作为 formData
          return {
            formData: context.entities || {},
            ...context.entities
          }
        case 'flight':
          return {
            recommendations: []
          }
        case 'hotel':
          return {
            recommendations: []
          }
        case 'itinerary':
          return {
            days: [
              {
                day: 1,
                title: '抵达东京',
                activities: [
                  { time: '14:00', activity: '抵达成田机场', duration: '1小时' },
                  { time: '16:00', activity: '前往酒店办理入住', duration: '2小时' },
                  { time: '19:00', activity: '银座晚餐', duration: '2小时' }
                ]
              }
            ]
          }
        case 'packing':
          return {
            categories: [
              {
                name: '衣物',
                items: ['T恤 3件', '长裤 2条', '外套 1件', '内衣裤', '袜子']
              },
              {
                name: '电子设备',
                items: ['手机', '充电器', '相机', '移动电源']
              }
            ]
          }
        case 'profile':
          // 构建收礼人画像数据
          const recipient = context.entities?.recipient || ''
          const occasion = context.entities?.occasion || ''
          const budget = context.entities?.budget || ''
          const interests = context.entities?.interests || ''
          
          // 生成画像分析
          let analysis = '正在分析收礼人画像...'
          if (recipient) {
            analysis = `根据您提供的信息，${recipient}`
            if (interests) {
              analysis += `是一位热爱${interests}的`
            }
            if (occasion) {
              analysis += `，在${occasion}这个特殊的日子里，`
            }
            analysis += `我们为您推荐最适合的礼物。`
          }
          
          // 生成标签
          const tags = []
          if (recipient) tags.push(recipient)
          if (occasion) tags.push(occasion)
          if (interests) tags.push(interests)
          if (budget) tags.push(budget)
          if (tags.length === 0) tags.push('待完善')
          
          // 生成礼物建议
          const giftSuggestions = []
          if (interests && interests.includes('园艺')) {
            giftSuggestions.push({
              id: 1,
              title: '园艺工具套装',
              reason: '实用性强，适合园艺爱好者日常使用'
            })
            giftSuggestions.push({
              id: 2,
              title: '精美花盆组合',
              reason: '美观实用，可以种植各种植物'
            })
          } else if (interests && interests.includes('阅读')) {
            giftSuggestions.push({
              id: 1,
              title: '电子阅读器',
              reason: '便携实用，适合爱阅读的人'
            })
            giftSuggestions.push({
              id: 2,
              title: '精美书签套装',
              reason: '实用美观，阅读时的贴心伴侣'
            })
          } else {
            giftSuggestions.push({
              id: 1,
              title: '个性化定制礼物',
              reason: '根据收礼人喜好定制，更有意义'
            })
            giftSuggestions.push({
              id: 2,
              title: '实用生活用品',
              reason: '日常使用频率高，实用性强'
            })
          }
          
          return {
            recipient,
            occasion,
            budget,
            interests,
            analysis,
            tags,
            giftSuggestions
          }
        case 'gift':
          return {
            recommendations: [
              {
                name: context.entities?.interests?.includes('园艺') ? '园艺工具套装' : '精美礼物套装',
                price: context.entities?.budget ? 
                  (typeof context.entities.budget === 'string' ? 
                    parseInt(context.entities.budget.match(/\d+/)?.[0] || '300') : 
                    context.entities.budget) : 
                  288,
                description: context.entities?.interests?.includes('园艺') ? 
                  '包含铲子、剪刀、手套等基础工具' : 
                  '精选优质礼物，适合各种场合',
                image: '/api/placeholder/200/200',
                rating: 4.8
              }
            ]
          }
        case 'budget':
          return {
            range: context.entities?.budget ? 
              (typeof context.entities.budget === 'string' ? 
                { min: 50, max: parseInt(context.entities.budget.match(/\d+/)?.[0] || '500') } :
                { min: 50, max: context.entities.budget }) :
              { min: 200, max: 500 },
            filtered: 15
          }
        case 'tips':
          return {
            tips: context.entities?.interests?.includes('园艺') ? 
              ['选择实用性强的园艺工具', '考虑包装的精美程度', '注意工具的耐用性'] :
              ['选择实用性强的礼物', '考虑包装的精美程度', '注意礼物的适用性']
          }
        case 'shop':
          return {
            recommendations: [],
            searchQuery: context.entities?.searchQuery || context.entities?.query || context.entities?.querys || '',
            filters: {
              priceRange: 'any',
              rating: 'any'
            }
          }
        case 'meeting':
          return {
            title: '项目进度讨论会',
            date: '2024-01-15',
            time: '15:00',
            duration: '1小时'
          }
        case 'meeting-postponement':
          return {
            reason: context.entities?.reason || '时间冲突，需要调整',
            eventId: context.entities?.eventId || 'meeting_' + Date.now(),
            originalDate: context.entities?.originalDate || new Date().toISOString().split('T')[0],
            originalTime: context.entities?.originalTime || '14:00'
          }
        case 'meeting-confirm':
          return {
            title: '会议确认',
            description: '确认会议信息并发送提醒'
          }
        case 'participants':
          return {
            attendees: ['张三', '李四', '王五'],
            optional: ['赵六']
          }
        case 'reminder':
          return {
            settings: ['15分钟前', '1小时前'],
            method: '邮件'
          }
        case 'feedback':
          return {
            status: '待执行',
            actions: []
          }
        case 'attachments':
          return {
            files: []
          }
        case 'suggestions':
          return {
            recommendations: [
              {
                title: '建议方案一',
                description: '基于您的需求，我们推荐以下解决方案...',
                priority: 'high'
              },
              {
                title: '建议方案二',
                description: '另一种可行的解决方案是...',
                priority: 'medium'
              }
            ]
          }
        case 'resources':
          return {
            recommendations: [
              {
                title: '相关文档',
                type: 'document',
                url: '#',
                description: '详细说明文档'
              },
              {
                title: '参考链接',
                type: 'link',
                url: '#',
                description: '外部参考资源'
              }
            ]
          }
        default:
          return {}
      }
    })()
    console.log('[generateCardData]', type, 'data:', data)
    return data
  }

  const processInput = (input) => {
    // 添加到历史记录
    inputHistory.value.push({
      input,
      timestamp: new Date().toISOString()
    })

    // 解析用户输入
    const context = parseUserInput(input)
    currentContext.value = context

    // 生成卡片
    const newCards = generateCards(input)
    activeCards.value = newCards

    return newCards
  }

  const updateCardState = (cardId, newState) => {
    cardStates.value[cardId] = newState
  }

  const updateCardData = (cardId, newData) => {
    const card = activeCards.value.find(c => c.id === cardId)
    if (card) {
      // 更新卡片数据
      card.data = { ...card.data, ...newData }
      
      // 如果newData包含isCompleted，则更新卡片的isCompleted状态
      if (newData.hasOwnProperty('isCompleted')) {
        card.isCompleted = newData.isCompleted
      }
      
      // 触发联动更新
      triggerLinkage(card)
    }
  }

  const triggerLinkage = (sourceCard) => {
    // 找到需要联动的卡片
    activeCards.value.forEach(card => {
      if (card.linkage && card.linkage.includes(sourceCard.type)) {
        // 更新联动卡片的数据
        const updatedData = generateCardData(card.type, currentContext.value)
        card.data = updatedData
      }
    })
  }

  const clearCards = () => {
    activeCards.value = []
    cardStates.value = {}
    cardData.value = {}
    currentContext.value = {}
  }

  return {
    // 状态
    activeCards,
    cardStates,
    cardData,
    inputHistory,
    currentContext,
    currentScene,
    currentCards,
    
    // 计算属性
    visibleCards,
    expandedCards,
    
    // 配置
    cardTypes,
    
    // 方法
    generateCards,
    generateCardsByScene,
    parseUserInput,
    parseSceneAnalysis,
    detectScenarioByKeywords,
    processInput,
    updateCardState,
    updateCardData,
    triggerLinkage,
    clearCards
  }
}) 