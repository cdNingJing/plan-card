import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    }
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
    if (input.includes('旅行') || input.includes('去') || input.includes('玩')) {
      context.intent = 'travel'
      context.category = 'travel'
    } else if (input.includes('礼物') || input.includes('送')) {
      context.intent = 'gift'
      context.category = 'gift'
    } else if (input.includes('会议') || input.includes('提醒')) {
      context.intent = 'meeting'
      context.category = 'meeting'
    }

    // 实体提取
    const destinations = ['东京', '大阪', '北京', '上海', '成都', '广州']
    const budgetMatch = input.match(/(\d+)元/)
    const timeMatch = input.match(/(\d+)天/)
    const dateMatch = input.match(/(明天|今天|后天)/)

    destinations.forEach(dest => {
      if (input.includes(dest)) {
        context.entities.destination = dest
      }
    })

    if (budgetMatch) {
      context.entities.budget = parseInt(budgetMatch[1])
    }

    if (timeMatch) {
      context.entities.duration = parseInt(timeMatch[1])
    }

    if (dateMatch) {
      context.entities.date = dateMatch[1]
    }

    // 关键词提取
    const keywords = input.split(/[，。！？\s]+/).filter(word => word.length > 1)
    context.keywords = keywords

    return context
  }

  const generateCards = (context) => {
    const cards = []
    const categoryCards = Object.entries(cardTypes)
      .filter(([_, type]) => type.category === context.category)
      .sort(([_, a], [__, b]) => a.priority - b.priority)

    categoryCards.forEach(([id, type]) => {
      if (type.optional && Math.random() > 0.7) return // 可选卡片随机生成

      const card = {
        id: `${id}_${Date.now()}`,
        type: id,
        title: type.name,
        icon: type.icon,
        state: type.defaultState,
        data: generateCardData(id, context),
        linkage: type.linkage || [],
        writeOperation: type.writeOperation || false
      }

      cards.push(card)
      cardStates.value[card.id] = type.defaultState
    })

    return cards
  }

  const generateCardData = (cardType, context) => {
    switch (cardType) {
      case 'destination':
        return {
          destination: context.entities.destination || '东京',
          duration: context.entities.duration || 5,
          departure: '成都'
        }
      case 'flight':
        return {
          recommendations: [
            { airline: '国航', price: '¥2,800', time: '14:30-19:45' },
            { airline: '东航', price: '¥3,200', time: '09:15-14:30' }
          ]
        }
      case 'hotel':
        return {
          recommendations: [
            { name: '新宿王子酒店', price: '¥680/晚', rating: 4.5 },
            { name: '银座丽思卡尔顿', price: '¥1,200/晚', rating: 4.8 }
          ]
        }
      case 'gift':
        return {
          recommendations: [
            { name: '园艺工具套装', price: '¥299', description: '专业园艺剪刀、手套、铲子' },
            { name: '智能植物生长灯', price: '¥458', description: 'LED全光谱，定时控制' }
          ]
        }
      case 'budget':
        return {
          current: context.entities.budget || 500,
          min: 100,
          max: 2000
        }
      case 'meeting':
        return {
          title: '项目对接会议',
          time: '明天下午3点',
          duration: '1小时'
        }
      default:
        return {}
    }
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
    const newCards = generateCards(context)
    activeCards.value = newCards

    return newCards
  }

  const updateCardState = (cardId, newState) => {
    cardStates.value[cardId] = newState
  }

  const updateCardData = (cardId, newData) => {
    const card = activeCards.value.find(c => c.id === cardId)
    if (card) {
      card.data = { ...card.data, ...newData }
      // 触发联动更新
      triggerLinkage(card)
    }
  }

  const triggerLinkage = (sourceCard) => {
    // 找到需要联动的卡片
    activeCards.value.forEach(card => {
      if (card.linkage.includes(sourceCard.type)) {
        // 更新联动卡片的数据
        const updatedData = generateCardData(card.type, {
          ...currentContext.value,
          entities: {
            ...currentContext.value.entities,
            ...sourceCard.data
          }
        })
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
    
    // 计算属性
    visibleCards,
    expandedCards,
    
    // 配置
    cardTypes,
    
    // 方法
    processInput,
    updateCardState,
    updateCardData,
    triggerLinkage,
    clearCards
  }
}) 