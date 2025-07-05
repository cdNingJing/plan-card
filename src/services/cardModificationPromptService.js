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
              /(?:收礼人|送给|给).*?([^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:收礼人).*?([^，。！？\s]+)/
            ],
            examples: ['收礼人妈妈', '送给朋友', '给同事']
          },
          occasion: {
            patterns: [
              /(?:送礼场合|场合|什么场合|什么时候).*?(生日|节日|纪念日|日常表达)/,
              /(?:修改|更改|更新|改为|改成).*?(?:送礼场合|场合).*?(生日|节日|纪念日|日常表达)/
            ],
            examples: ['生日', '节日', '纪念日', '日常表达'],
            valueMapper: this.mapOccasionValue
          },
          budget: {
            patterns: [
              /(?:预算|费用).*?(\d+)(?:元|块|块钱)?/,
              /(?:修改|更改|更新|改为|改成).*?(?:预算|费用).*?(\d+)(?:元|块|块钱)?/
            ],
            examples: ['预算300元', '费用500元']
          },
          interests: {
            patterns: [
              /(?:兴趣|爱好|喜欢).*?(园艺|烹饪|阅读|运动|科技|时尚)/,
              /(?:修改|更改|更新|改为|改成).*?(?:兴趣|爱好).*?(园艺|烹饪|阅读|运动|科技|时尚)/
            ],
            examples: ['喜欢园艺', '爱好烹饪', '兴趣科技'],
            valueMapper: this.mapInterestValue
          }
        }
      },
      meeting: {
        fieldPatterns: {
          meetingTitle: {
            patterns: [
              /(?:会议主题|主题|什么会议).*?([^，。！？\s]+)/,
              /(?:修改|更改|更新|改为|改成).*?(?:会议主题|主题).*?([^，。！？\s]+)/
            ],
            examples: ['项目讨论', '周会', '技术分享']
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
    
    let prompt = `**卡片修改能力：**
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

  // 获取映射描述
  getMappingDescription(fieldKey, scenario) {
    const descriptions = {
      budget: {
        travel: '≤3000元→budget, 3001-8000元→comfort, >8000元→luxury',
        gift: '直接使用数字值'
      },
      occasion: '生日→birthday, 节日→holiday, 纪念日→anniversary, 日常表达→just-because',
      interests: '园艺→gardening, 烹饪→cooking, 阅读→reading, 运动→sports, 科技→tech, 时尚→fashion',
      duration: '30分钟→30, 1小时→60, 2小时→120, 半天→240'
    }
    return descriptions[fieldKey]?.[scenario] || descriptions[fieldKey] || '直接使用原值'
  }
} 