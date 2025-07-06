// 卡片修改提示词服务 - 根据场景动态生成修改指令
import { getBasicInfoFields } from '@/config/basicInfoFields.js'

export class CardModificationPromptService {
  constructor() {
    this.scenarioModificationPatterns = {
      travel: {
        fieldPatterns: {
          departure: {
            patterns: [
              /(?:出发地|从).*?([北京|上海|广州|深圳|成都|杭州|南京|武汉|西安|重庆|天津|苏州|青岛|大连|厦门|宁波|无锡|长沙|郑州|济南|哈尔滨|沈阳|长春|石家庄|太原|呼和浩特|合肥|福州|南昌|南宁|海口|贵阳|昆明|拉萨|西宁|银川|乌鲁木齐|东京|大阪|京都|名古屋|横滨|神户|札幌|福冈|仙台|广岛|新潟|金泽|奈良|冲绳|首尔|釜山|大邱|仁川|光州|大田|济州|新加坡|曼谷|清迈|普吉岛|芭提雅|吉隆坡|槟城|马六甲|雅加达|巴厘岛|泗水|万隆|河内|胡志明市|岘港|芽庄|金边|暹粒|万象|琅勃拉邦|仰光|曼德勒|蒲甘|达卡|加德满都|博卡拉|新德里|孟买|班加罗尔|海得拉巴|金奈|加尔各答|斋浦尔|阿格拉|瓦拉纳西|科钦|果阿|马尼拉|宿务|长滩岛|巴拉望|马卡蒂|达沃]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:出发地|出发城市).*?([^，。！？\s]+)/
            ],
            examples: ['出发地成都', '从成都出发', '出发地改为北京']
          },
          destination: {
            patterns: [
              /(?:目的地|去|到).*?([北京|上海|广州|深圳|成都|杭州|南京|武汉|西安|重庆|天津|苏州|青岛|大连|厦门|宁波|无锡|长沙|郑州|济南|哈尔滨|沈阳|长春|石家庄|太原|呼和浩特|合肥|福州|南昌|南宁|海口|贵阳|昆明|拉萨|西宁|银川|乌鲁木齐|东京|大阪|京都|名古屋|横滨|神户|札幌|福冈|仙台|广岛|新潟|金泽|奈良|冲绳|首尔|釜山|大邱|仁川|光州|大田|济州|新加坡|曼谷|清迈|普吉岛|芭提雅|吉隆坡|槟城|马六甲|雅加达|巴厘岛|泗水|万隆|河内|胡志明市|岘港|芽庄|金边|暹粒|万象|琅勃拉邦|仰光|曼德勒|蒲甘|达卡|加德满都|博卡拉|新德里|孟买|班加罗尔|海得拉巴|金奈|加尔各答|斋浦尔|阿格拉|瓦拉纳西|科钦|果阿|马尼拉|宿务|长滩岛|巴拉望|马卡蒂|达沃]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:目的地|地点|城市).*?([^，。！？\s]+)/
            ],
            examples: ['目的地东京', '去东京', '目的地改为北京']
          },
          startDate: {
            patterns: [
              /(?:出发日期|出发时间|几号出发|什么时候出发).*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日号]?)/,
              /(\d{1,2}月\d{1,2}号?出发)/,
              /(?:修改|更改|更新|改为|改成).*?(?:出发日期|出发时间).*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日号]?)/
            ],
            examples: ['7月6号出发', '出发日期2025-07-06', '2025年7月6日出发'],
            formatConverter: this.convertDateFormat
          },
          endDate: {
            patterns: [
              /(?:返程日期|回来时间|几号回来|什么时候回来).*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日号]?)/,
              /(\d{1,2}月\d{1,2}号?回来)/,
              /(?:修改|更改|更新|改为|改成).*?(?:返程日期|回来时间).*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日号]?)/
            ],
            examples: ['7月10号回来', '返程日期2025-07-10', '2025年7月10日回来'],
            formatConverter: this.convertDateFormat
          },
          travelers: {
            patterns: [
              /(?:出行人数|人数|几个人|多少人).*?(\d+[人位个])/,
              /(?:修改|更改|更新|改为|改成).*?(?:出行人数|人数).*?(\d+[人位个])/
            ],
            examples: ['4人', '出行人数4人', '人数改为2位']
          },
          budget: {
            patterns: [
              /(?:预算|费用).*?(\d+)(?:元|块|块钱)?/,
              /(?:经济型|舒适型|豪华型)(?:预算|费用)/,
              /(?:修改|更改|更新|改为|改成).*?(?:预算|费用).*?(\d+)(?:元|块|块钱)?/
            ],
            examples: ['预算5000元', '舒适型预算', '经济型预算'],
            valueMapper: this.mapBudgetValue
          }
        }
      },
      gift: {
        fieldPatterns: {
          recipient: {
            patterns: [
              /(?:收礼人|给谁|送给谁|买给).*?([^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:收礼人|给谁).*?([^，。！？\s]+)/
            ],
            examples: ['妈妈', '爸爸', '女朋友', '同事', '给妈妈买礼物']
          },
          occasion: {
            patterns: [
              /(?:送礼场合|什么场合|什么时候送|节日).*?([^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:送礼场合|场合).*?([^，。！？\s]+)/
            ],
            examples: ['生日', '母亲节', '结婚纪念日', '新年', '圣诞节']
          },
          budget: {
            patterns: [
              /(?:预算|多少钱|价格|费用).*?(\d+)(?:元|块|块钱)?/,
              /(?:预算|价格).*?(不限|随意|都可以)/,
              /(?:修改|更改|更新|改为|改成).*?(?:预算|价格).*?(\d+)(?:元|块|块钱)?/
            ],
            examples: ['预算500元', '500元以内', '预算不限', '价格随意']
          },
          interests: {
            patterns: [
              /(?:兴趣爱好|喜欢什么|爱好|兴趣).*?([^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:兴趣爱好|兴趣).*?([^，。！？\s]+)/
            ],
            examples: ['园艺', '阅读', '运动', '美食', '科技']
          },
          searchQuery: {
            patterns: [
              /(?:搜索需求|搜索条件|搜索要求|查找需求|具体需求).*?([^，。！？\n]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:搜索需求|搜索条件).*?([^，。！？\n]+)/
            ],
            examples: ['想要母亲节礼物推荐，预算500元以内', '想要一款性价比高的手机，预算在3000元左右'],
            textParser: this.parseSearchQuery
          }
        }
      },
      meeting: {
        fieldPatterns: {
          meetingTitle: {
            patterns: [
              /(?:会议主题|主题|什么会议).*?([^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:会议主题|主题).*?([^，。！？\s]+)/,
              /(?:开会|会议|讨论|分享|汇报).*?([^，。！？\s]+)/,
              /([^，。！？\s]+)(?:会议|讨论|分享|汇报)/
            ],
            examples: ['项目讨论', '周会', '技术分享', '开会', '小组讨论', '项目汇报']
          },
          meetingDate: {
            patterns: [
              /(?:会议日期|几号开会|什么时候开会).*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日号]?)/,
              /(\d{1,2}月\d{1,2}号?开会)/,
              /(?:修改|更改|更新|改为|改成).*?(?:会议日期).*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日号]?)/
            ],
            examples: ['7月6号开会', '会议日期2025-07-06', '2025年7月6日开会'],
            formatConverter: this.convertDateFormat
          },
          startTime: {
            patterns: [
              /(?:开始时间|几点开始|什么时候开始).*?(\d{1,2}:\d{2})/,
              /(?:修改|更改|更新|改为|改成).*?(?:开始时间).*?(\d{1,2}:\d{2})/
            ],
            examples: ['9:00开始', '开始时间14:30', '下午2点半开始']
          },
          participants: {
            patterns: [
              /(?:参会人员|参与者|谁参加).*?([^，。！？\s]+@[^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:参会人员|参与者).*?([^，。！？\s]+@[^，。！？\s]+)/
            ],
            examples: ['zhang@example.com', '参会人员li@company.com']
          },
          duration: {
            patterns: [
              /(?:会议时长|多长时间|多久).*?(30分钟|1小时|2小时|半天)/,
              /(?:修改|更改|更新|改为|改成).*?(?:会议时长).*?(30分钟|1小时|2小时|半天)/
            ],
            examples: ['30分钟', '1小时', '2小时', '半天'],
            valueMapper: this.mapDurationValue
          },
          location: {
            patterns: [
              /(?:会议地点|地点|在哪里).*?([^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:会议地点|地点).*?([^，。！？\s]+)/
            ],
            examples: ['会议室A', '线上会议', 'zoom链接']
          }
        }
      }
    }
  }

  // 根据场景生成卡片修改指令的AI提示词
  generateModificationPrompt(scenario = 'travel') {
    const scenarioConfig = getBasicInfoFields(scenario)
    const fieldPatterns = this.scenarioModificationPatterns[scenario]?.fieldPatterns || {}
    
    // 获取当前时间信息
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    let prompt = `**当前时间信息：**
- 当前日期：${currentDate} (${currentYear}年${currentMonth}月${currentDay}日)
- 当前时间：${currentTime}
- 当前年份：${currentYear}

**时间处理规则：**
- 当用户说"明天"时，指的是 ${new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]}
- 当用户说"后天"时，指的是 ${new Date(now.getTime() + 2*24*60*60*1000).toISOString().split('T')[0]}
- 当用户说"下周"时，指的是从 ${new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0]} 开始的一周
- 当用户提到具体日期但没有年份时，默认使用当前年份 ${currentYear}
- 当用户提到"推迟到明天"时，应该将时间调整为明天 ${new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]}

**卡片修改能力：**
当用户提到要修改${scenarioConfig.title}时，请在回复中包含修改指令，格式如下：

**修改指令格式：**
{
  "action": "update_card",
  "target": "basic-info",
  "updates": {
    "field_name": "new_value"
  },
  "message": "已为您更新相关信息"
}

**${scenarioConfig.title}字段说明：**
`

    // 为每个字段生成说明
    scenarioConfig.fields.forEach(field => {
      const fieldPattern = fieldPatterns[field.key]
      if (fieldPattern) {
        prompt += `- **${field.label} (${field.key})**：${field.description || '请填写相关信息'}\n`
        if (fieldPattern.examples) {
          prompt += `  示例：${fieldPattern.examples.join('、')}\n`
        }
        if (field.type === 'select' && field.options) {
          prompt += `  可选值：${field.options.map(opt => `${opt.value}(${opt.label})`).join('、')}\n`
        }
        prompt += '\n'
      }
    })

    prompt += `**智能识别规则：**
`

    // 为每个字段生成识别规则
    Object.entries(fieldPatterns).forEach(([fieldKey, pattern]) => {
      const field = scenarioConfig.fields.find(f => f.key === fieldKey)
      if (field) {
        prompt += `- **${field.label}**：\n`
        if (pattern.examples) {
          prompt += `  当用户说"${pattern.examples.join('"、"')}"时，识别为修改${fieldKey}字段\n`
        }
        if (pattern.valueMapper) {
          prompt += `  数值映射：${this.getMappingDescription(fieldKey, scenario)}\n`
        }
        if (pattern.formatConverter) {
          prompt += `  格式转换：自动转换为标准格式\n`
        }
        prompt += '\n'
      }
    })

    // 为会议场景添加特殊识别规则
    if (scenario === 'meeting') {
      prompt += `**会议主题识别特殊规则：**
- 当用户说"开会"时，如果上下文中有具体内容（如"小组开会"、"项目开会"），提取"小组"、"项目"等作为会议主题
- 当用户说"讨论"时，提取讨论的具体内容作为会议主题
- 当用户说"分享"时，提取分享的具体内容作为会议主题
- 当用户说"汇报"时，提取汇报的具体内容作为会议主题
- 如果用户没有明确说明会议主题，但提到了参会人员（如"小组成员"），可以推断为"小组会议"
- 如果用户没有明确说明会议主题，但提到了地点或项目，可以推断为相应的主题

**示例：**
- "7月10号通过小组成员在成都开会" → 会议主题：小组会议
- "明天下午讨论项目进度" → 会议主题：项目进度讨论
- "下周技术分享" → 会议主题：技术分享
- "月底汇报工作" → 会议主题：工作汇报

`
    }

    prompt += `**重要说明：**
- 基础信息卡片（basic-info）的数据存储在formData字段中
- 所有字段都应该更新到formData中
- 日期格式请使用 YYYY-MM-DD 格式（HTML date input的标准格式）
- 时间格式请使用 HH:MM 格式
- 根据字段类型选择合适的值格式

**示例修改指令：**
`

    // 生成示例修改指令
    const exampleUpdates = {}
    scenarioConfig.fields.forEach(field => {
      const fieldPattern = fieldPatterns[field.key]
      if (fieldPattern && fieldPattern.examples && fieldPattern.examples.length > 0) {
        let exampleValue = fieldPattern.examples[0]
        if (fieldPattern.valueMapper) {
          exampleValue = fieldPattern.valueMapper(exampleValue)
        }
        if (fieldPattern.formatConverter) {
          exampleValue = fieldPattern.formatConverter(exampleValue)
        }
        exampleUpdates[field.key] = exampleValue
      }
    })

    prompt += `{
  "action": "update_card",
  "target": "basic-info",
  "updates": ${JSON.stringify(exampleUpdates, null, 2)},
  "message": "已为您更新${scenarioConfig.title}"
}`

    return prompt
  }

  // 日期格式转换
  convertDateFormat(dateStr) {
    // 处理各种日期格式，转换为 YYYY-MM-DD
    const patterns = [
      /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日号]?/, // 2025年7月6日
      /(\d{1,2})月(\d{1,2})号?/, // 7月6号
      /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/ // 2025/07/06
    ]

    for (const pattern of patterns) {
      const match = dateStr.match(pattern)
      if (match) {
        let year, month, day
        if (match.length === 4) {
          year = match[1]
          month = match[2].padStart(2, '0')
          day = match[3].padStart(2, '0')
        } else if (match.length === 3) {
          year = new Date().getFullYear()
          month = match[1].padStart(2, '0')
          day = match[2].padStart(2, '0')
        }
        return `${year}-${month}-${day}`
      }
    }
    return dateStr
  }

  // 预算值映射
  mapBudgetValue(value) {
    if (typeof value === 'string') {
      if (value.includes('经济') || value.includes('3000以内')) return 'budget'
      if (value.includes('舒适') || value.includes('3000-8000')) return 'comfort'
      if (value.includes('豪华') || value.includes('8000以上')) return 'luxury'
      
      // 数字映射
      const numMatch = value.match(/(\d+)/)
      if (numMatch) {
        const num = parseInt(numMatch[1])
        if (num <= 3000) return 'budget'
        if (num <= 8000) return 'comfort'
        return 'luxury'
      }
    }
    return value
  }

  // 场合值映射
  mapOccasionValue(value) {
    const mapping = {
      '生日': 'birthday',
      '节日': 'holiday',
      '纪念日': 'anniversary',
      '日常表达': 'just-because'
    }
    return mapping[value] || value
  }

  // 兴趣值映射
  mapInterestValue(value) {
    const mapping = {
      '园艺': 'gardening',
      '烹饪': 'cooking',
      '阅读': 'reading',
      '运动': 'sports',
      '科技': 'tech',
      '时尚': 'fashion'
    }
    return mapping[value] || value
  }

  // 时长值映射
  mapDurationValue(value) {
    const mapping = {
      '30分钟': '30',
      '1小时': '60',
      '2小时': '120',
      '半天': '240'
    }
    return mapping[value] || value
  }

  // 映射排序方式值
  mapSortByValue(value) {
    const sortMap = {
      '最新': 'most_recent',
      '最新到货': 'most_recent',
      '价格从低到高': 'price_low_to_high',
      '价格低到高': 'price_low_to_high',
      '价格从高到低': 'price_high_to_low',
      '价格高到低': 'price_high_to_low',
      '精选': 'featured',
      '精选优先': 'featured',
      '评价': 'average_review',
      '平均评价': 'average_review'
    }
    return sortMap[value] || value
  }

  // 映射布尔值
  mapBooleanValue(value) {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const positiveWords = ['是', '要', '需要', '排除', '过滤', '不要', '不显示']
      const negativeWords = ['否', '不要', '不需要', '不排除', '不过滤', '显示']
      
      const lowerValue = value.toLowerCase()
      if (positiveWords.some(word => lowerValue.includes(word))) return true
      if (negativeWords.some(word => lowerValue.includes(word))) return false
    }
    return true // 默认值
  }

  // 解析搜索查询文本
  parseSearchQuery(text) {
    const result = {}
    
    // 解析单个关键词
    const singleQueryMatch = text.match(/搜索关键词[：:]\s*([^，。！？\n]+)/)
    if (singleQueryMatch) {
      result.query = singleQueryMatch[1].trim()
    }
    
    // 解析多关键词
    const multiQueryMatch = text.match(/多关键词[：:]\s*([^，。！？\n]+)/)
    if (multiQueryMatch) {
      result.querys = multiQueryMatch[1].trim()
    }
    
    // 解析排序方式
    const sortMatch = text.match(/排序方式[：:]\s*(按.*?排序|最新|价格.*?低.*?高|价格.*?高.*?低|精选|评价)/)
    if (sortMatch) {
      result.sort_by = this.mapSortByValue(sortMatch[1])
    }
    
    // 解析结果数量
    const limitMatch = text.match(/结果数量[：:]\s*(\d+)/)
    if (limitMatch) {
      result.limit = parseInt(limitMatch[1])
    }
    
    // 解析页码
    const pageMatch = text.match(/页码[：:]\s*(\d+)/)
    if (pageMatch) {
      result.page = parseInt(pageMatch[1])
    }
    
    // 解析排除广告
    const excludeMatch = text.match(/排除广告[：:]\s*(是|否|要|不要)/)
    if (excludeMatch) {
      result.exclude_sponsored = this.mapBooleanValue(excludeMatch[1])
    }
    
    // 解析获取详情
    const detailMatch = text.match(/获取详情[：:]\s*(\d+)/)
    if (detailMatch) {
      result.detail = parseInt(detailMatch[1])
    }
    
    // 如果没有找到结构化信息，尝试从自然语言中提取
    if (Object.keys(result).length === 0) {
      // 提取关键词
      const keywordMatch = text.match(/搜索|查找|买|购买.*?([^，。！？\n]+)/)
      if (keywordMatch) {
        result.query = keywordMatch[1].trim()
      }
      
      // 提取排序
      const sortNaturalMatch = text.match(/按(.*?)排序/)
      if (sortNaturalMatch) {
        result.sort_by = this.mapSortByValue(sortNaturalMatch[1])
      }
      
      // 提取数量
      const countMatch = text.match(/返回(\d+)个|显示(\d+)个/)
      if (countMatch) {
        result.limit = parseInt(countMatch[1] || countMatch[2])
      }
    }
    
    return result
  }

  // 获取映射描述
  getMappingDescription(fieldKey, scenario) {
    const descriptions = {
      budget: {
        travel: '≤3000元→budget, 3001-8000元→comfort, >8000元→luxury',
        gift: '直接使用用户输入的文本值'
      },
      occasion: '直接使用用户输入的文本值',
      interests: '直接使用用户输入的文本值',
      duration: '30分钟→30, 1小时→60, 2小时→120, 半天→240',
      sort_by: '最新→most_recent, 价格从低到高→price_low_to_high, 价格从高到低→price_high_to_low, 精选→featured, 评价→average_review',
      exclude_sponsored: '是/排除/过滤→true, 否/不排除/不过滤→false',
      searchQuery: '解析文本中的搜索条件，提取关键词、排序、数量等参数'
    }
    return descriptions[fieldKey]?.[scenario] || descriptions[fieldKey] || '直接使用原值'
  }
} 