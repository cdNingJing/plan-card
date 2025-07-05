// 卡片修改服务 - 处理通过对话修改卡片信息
export class CardModificationService {
  constructor() {
    this.modificationPatterns = {
      // 目的地修改模式
      destination: {
        patterns: [
          /(?:修改|更改|更新|改为|改成).*?(?:目的地|地点|城市|去|到).*?([北京|上海|广州|深圳|成都|杭州|南京|武汉|西安|重庆|天津|苏州|青岛|大连|厦门|宁波|无锡|长沙|郑州|济南|哈尔滨|沈阳|长春|石家庄|太原|呼和浩特|合肥|福州|南昌|南宁|海口|贵阳|昆明|拉萨|西宁|银川|乌鲁木齐|东京|大阪|京都|名古屋|横滨|神户|札幌|福冈|仙台|广岛|新潟|金泽|奈良|冲绳|首尔|釜山|大邱|仁川|光州|大田|济州|新加坡|曼谷|清迈|普吉岛|芭提雅|吉隆坡|槟城|马六甲|雅加达|巴厘岛|泗水|万隆|河内|胡志明市|岘港|芽庄|金边|暹粒|万象|琅勃拉邦|仰光|曼德勒|蒲甘|达卡|加德满都|博卡拉|新德里|孟买|班加罗尔|海得拉巴|金奈|加尔各答|斋浦尔|阿格拉|瓦拉纳西|科钦|果阿|马尼拉|宿务|长滩岛|巴拉望|马卡蒂|达沃|清迈|普吉岛|芭提雅|吉隆坡|槟城|马六甲|雅加达|巴厘岛|泗水|万隆|河内|胡志明市|岘港|芽庄|金边|暹粒|万象|琅勃拉邦|仰光|曼德勒|蒲甘|达卡|加德满都|博卡拉|新德里|孟买|班加罗尔|海得拉巴|金奈|加尔各答|斋浦尔|阿格拉|瓦拉纳西|科钦|果阿|马尼拉|宿务|长滩岛|巴拉望|马卡蒂|达沃]+)/,
          /(?:目的地|地点|城市).*?(?:改为|改成|修改为|更改为).*?([北京|上海|广州|深圳|成都|杭州|南京|武汉|西安|重庆|天津|苏州|青岛|大连|厦门|宁波|无锡|长沙|郑州|济南|哈尔滨|沈阳|长春|石家庄|太原|呼和浩特|合肥|福州|南昌|南宁|海口|贵阳|昆明|拉萨|西宁|银川|乌鲁木齐|东京|大阪|京都|名古屋|横滨|神户|札幌|福冈|仙台|广岛|新潟|金泽|奈良|冲绳|首尔|釜山|大邱|仁川|光州|大田|济州|新加坡|曼谷|清迈|普吉岛|芭提雅|吉隆坡|槟城|马六甲|雅加达|巴厘岛|泗水|万隆|河内|胡志明市|岘港|芽庄|金边|暹粒|万象|琅勃拉邦|仰光|曼德勒|蒲甘|达卡|加德满都|博卡拉|新德里|孟买|班加罗尔|海得拉巴|金奈|加尔各答|斋浦尔|阿格拉|瓦拉纳西|科钦|果阿|马尼拉|宿务|长滩岛|巴拉望|马卡蒂|达沃]+)/
        ],
        targetCard: 'basic-info',
        updateField: 'destination'
      },
      
      // 预算修改模式
      budget: {
        patterns: [
          /(?:修改|更改|更新|改为|改成).*?(?:预算|费用|价格|金额).*?(\d+)(?:元|块|块钱)?/,
          /(?:预算|费用|价格|金额).*?(?:改为|改成|修改为|更改为).*?(\d+)(?:元|块|块钱)?/,
          /(?:预算|费用|价格|金额).*?(\d+)(?:元|块|块钱)?.*?(?:以内|以下|不超过|不超)/
        ],
        targetCard: 'budget',
        updateField: 'range.max'
      },
      
      // 时间修改模式
      time: {
        patterns: [
          /(?:修改|更改|更新|改为|改成).*?(?:时间|日期|几点|什么时候).*?(\d{1,2}:\d{2})/,
          /(?:时间|日期|几点|什么时候).*?(?:改为|改成|修改为|更改为).*?(\d{1,2}:\d{2})/,
          /(?:明天|今天|后天|下周|下个月).*?(\d{1,2}:\d{2})/
        ],
        targetCard: 'meeting',
        updateField: 'time'
      },
      
      // 参与者修改模式
      participants: {
        patterns: [
          /(?:添加|增加|邀请).*?(?:参与者|参会者|人员).*?([^，。！？\s]+)/,
          /(?:参与者|参会者|人员).*?(?:添加|增加|邀请).*?([^，。！？\s]+)/,
          /(?:移除|删除|取消).*?(?:参与者|参会者|人员).*?([^，。！？\s]+)/
        ],
        targetCard: 'participants',
        updateField: 'attendees'
      }
    }
  }

  // 解析用户输入中的修改意图
  parseModificationIntent(userInput) {
    const modifications = []
    
    for (const [type, config] of Object.entries(this.modificationPatterns)) {
      for (const pattern of config.patterns) {
        const match = userInput.match(pattern)
        if (match) {
          modifications.push({
            type,
            targetCard: config.targetCard,
            updateField: config.updateField,
            value: match[1],
            originalText: match[0]
          })
        }
      }
    }
    
    return modifications
  }

  // 解析AI回复中的修改指令
  parseAIResponse(response) {
    console.log('[CardModificationService] parseAIResponse 开始:', response)
    console.log('[CardModificationService] 回复内容长度:', response?.length)
    
    try {
      // 尝试从AI回复中提取JSON格式的修改指令
      // 使用更精确的方法来提取完整的JSON对象
      const jsonStart = response.indexOf('{')
      if (jsonStart !== -1) {
        console.log('[CardModificationService] 找到JSON开始位置:', jsonStart)
        
        // 从开始位置查找匹配的结束位置
        let braceCount = 0
        let jsonEnd = -1
        
        for (let i = jsonStart; i < response.length; i++) {
          if (response[i] === '{') {
            braceCount++
          } else if (response[i] === '}') {
            braceCount--
            if (braceCount === 0) {
              jsonEnd = i
              break
            }
          }
        }
        
        if (jsonEnd !== -1) {
          const jsonString = response.substring(jsonStart, jsonEnd + 1)
          console.log('[CardModificationService] 提取的完整JSON:', jsonString)
          
          // 验证是否包含update_card指令
          if (jsonString.includes('"action"') && jsonString.includes('"update_card"')) {
            try {
              const instruction = JSON.parse(jsonString)
              console.log('[CardModificationService] 解析后的指令:', instruction)
              
              if (instruction.action === 'update_card') {
                const result = {
                  action: 'update_card',
                  target: instruction.target,
                  updates: instruction.updates,
                  message: instruction.message || '已为您更新相关信息'
                }
                console.log('[CardModificationService] 返回修改指令:', result)
                return result
              }
            } catch (parseError) {
              console.warn('[CardModificationService] JSON解析失败:', parseError)
              console.warn('[CardModificationService] 问题JSON:', jsonString)
            }
          } else {
            console.log('[CardModificationService] JSON不包含update_card指令')
          }
        } else {
          console.log('[CardModificationService] 未找到匹配的JSON结束位置')
        }
      } else {
        console.log('[CardModificationService] 未找到JSON开始位置')
      }
    } catch (error) {
      console.warn('[CardModificationService] 解析AI回复中的修改指令失败:', error)
    }
    
    console.log('[CardModificationService] 返回null')
    return null
  }

  // 执行卡片修改
  executeModification(project, modification) {
    console.log('[CardModificationService] executeModification 开始:', { project, modification })
    
    if (!project || !project.cards) {
      console.warn('[CardModificationService] 项目或卡片不存在')
      return { success: false, message: '项目或卡片不存在' }
    }

    const { target, updates } = modification
    console.log('[CardModificationService] 目标:', target, '更新:', updates)
    console.log('[CardModificationService] 项目中的卡片:', project.cards.map(card => ({ id: card.id, type: card.type, title: card.title })))
    
    // 查找目标卡片 - 修复查找逻辑
    let targetCards = []
    
    // 直接遍历所有卡片，查找匹配的类型
    for (const card of project.cards) {
      console.log('[CardModificationService] 检查卡片:', card.id, card.type, '目标:', target)
      if (card.type === target) {
        console.log('[CardModificationService] 找到匹配卡片:', card.id)
        targetCards.push(card)
      }
    }

    console.log('[CardModificationService] 找到的目标卡片:', targetCards.map(card => ({ id: card.id, type: card.type, title: card.title })))

    if (targetCards.length === 0) {
      console.warn('[CardModificationService] 未找到目标卡片:', target)
      // 即使没找到卡片，也尝试直接更新projectCardStore中的数据
      console.log('[CardModificationService] 尝试直接更新数据')
      return this.updateProjectData(project, target, updates)
    }

    // 执行更新
    let updatedCount = 0
    for (const card of targetCards) {
      console.log('[CardModificationService] 更新卡片:', card.id, card.type)
      const updated = this.updateCardData(card, updates)
      if (updated) updatedCount++
    }

    const result = {
      success: updatedCount > 0,
      message: `成功更新了 ${updatedCount} 张卡片`,
      updatedCards: targetCards
    }
    
    console.log('[CardModificationService] 执行结果:', result)
    return result
  }

  // 直接更新项目数据（当找不到卡片时使用）
  updateProjectData(project, target, updates) {
    console.log('[CardModificationService] updateProjectData:', { target, updates })
    
    // 创建或更新项目中的基础信息
    if (target === 'basic-info') {
      // 确保项目有基础信息数据
      if (!project.basicInfo) {
        project.basicInfo = {}
      }
      
      // 更新基础信息
      Object.assign(project.basicInfo, updates)
      
      // 同时更新项目标题（如果有title更新）
      if (updates.title) {
        project.title = updates.title
      }
      
      console.log('[CardModificationService] 项目基础信息已更新:', project.basicInfo)
      
      return {
        success: true,
        message: '已更新项目基础信息',
        updatedCards: [{
          id: 'project-basic-info',
          type: 'basic-info',
          data: { formData: project.basicInfo }
        }]
      }
    }
    
    return { success: false, message: '不支持的目标类型' }
  }

  // 更新卡片数据
  updateCardData(card, updates) {
    if (!card || !card.data) return false

    let hasChanges = false
    
    // 特殊处理basic-info卡片
    if (card.type === 'basic-info') {
      // 确保formData存在
      if (!card.data.formData) {
        card.data.formData = {}
      }
      
      for (const [field, value] of Object.entries(updates)) {
        if (field === 'title') {
          // 标题直接更新到卡片数据
          if (card.data[field] !== value) {
            card.data[field] = value
            hasChanges = true
          }
        } else {
          // 其他字段更新到formData
          if (card.data.formData[field] !== value) {
            card.data.formData[field] = value
            hasChanges = true
          }
        }
      }
    } else {
      // 其他卡片的正常处理
      for (const [field, value] of Object.entries(updates)) {
        if (field.includes('.')) {
          // 处理嵌套字段，如 'range.max'
          const parts = field.split('.')
          let current = card.data
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {}
            }
            current = current[parts[i]]
          }
          if (current[parts[parts.length - 1]] !== value) {
            current[parts[parts.length - 1]] = value
            hasChanges = true
          }
        } else {
          // 处理普通字段
          if (card.data[field] !== value) {
            card.data[field] = value
            hasChanges = true
          }
        }
      }
    }

    return hasChanges
  }

  // 生成修改确认消息
  generateConfirmationMessage(modification) {
    const { target, updates } = modification
    const updateTexts = []
    
    for (const [field, value] of Object.entries(updates)) {
      updateTexts.push(`${field}: ${value}`)
    }
    
    return `已为您更新了 ${target} 卡片的信息：${updateTexts.join(', ')}`
  }
} 