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
    },
    'basic-info': {
      name: '基础信息',
      icon: 'Info',
      category: 'travel',
      defaultState: 'expanded',
      priority: 1
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

  const detectScenario = (input) => {
    if (input.includes('旅行') || input.includes('去') || input.includes('玩') || input.includes('东京') || input.includes('大阪') || input.includes('北京') || input.includes('上海')) {
      return 'travel'
    } else if (input.includes('礼物') || input.includes('送')) {
      return 'gift'
    } else if (input.includes('会议') || input.includes('提醒')) {
      return 'meeting'
    }
    return 'general'
  }

  const generateCards = (input) => {
    const cards = []
    
    // 检测场景类型
    const scenario = detectScenario(input)
    
    if (scenario === 'travel') {
      // 旅行场景 - 基础信息卡片排在第一位
      cards.push({
        id: 'basic-info-travel',
        type: 'basic-info',
        title: '旅行基础信息',
        state: 'collapsed',
        data: {
          scenario: 'travel'
        }
      })
      

      
      cards.push({
        id: 'flight',
        type: 'flight',
        title: '航班推荐',
        state: 'collapsed',
        data: generateCardData('flight')
      })
      
      cards.push({
        id: 'hotel',
        type: 'hotel',
        title: '酒店推荐',
        state: 'collapsed',
        data: generateCardData('hotel')
      })
      
      cards.push({
        id: 'itinerary',
        type: 'itinerary',
        title: '行程规划',
        state: 'collapsed',
        data: generateCardData('itinerary')
      })
      
      cards.push({
        id: 'packing',
        type: 'packing',
        title: '打包清单',
        state: 'collapsed',
        data: generateCardData('packing')
      })
    } else if (scenario === 'gift') {
      // 礼物场景 - 基础信息卡片排在第一位
      cards.push({
        id: 'basic-info-gift',
        type: 'basic-info',
        title: '礼物推荐基础信息',
        state: 'collapsed',
        data: {
          scenario: 'gift'
        }
      })
      
      cards.push({
        id: 'profile',
        type: 'profile',
        title: '收礼人画像',
        state: 'collapsed',
        data: generateCardData('profile')
      })
      
      cards.push({
        id: 'gift',
        type: 'gift',
        title: '礼物推荐',
        state: 'collapsed',
        data: generateCardData('gift')
      })
      
      cards.push({
        id: 'budget',
        type: 'budget',
        title: '预算筛选',
        state: 'collapsed',
        data: generateCardData('budget')
      })
      
      cards.push({
        id: 'tips',
        type: 'tips',
        title: '贴心提示',
        state: 'collapsed',
        data: generateCardData('tips')
      })
    } else if (scenario === 'meeting') {
      // 会议场景 - 基础信息卡片排在第一位
      cards.push({
        id: 'basic-info-meeting',
        type: 'basic-info',
        title: '会议基础信息',
        state: 'collapsed',
        data: {
          scenario: 'meeting'
        }
      })
      
      cards.push({
        id: 'meeting',
        type: 'meeting',
        title: '会议详情',
        state: 'collapsed',
        data: generateCardData('meeting')
      })
      
      cards.push({
        id: 'participants',
        type: 'participants',
        title: '参与者管理',
        state: 'collapsed',
        data: generateCardData('participants')
      })
      
      cards.push({
        id: 'reminder',
        type: 'reminder',
        title: '提醒设置',
        state: 'collapsed',
        data: generateCardData('reminder')
      })
      
      cards.push({
        id: 'feedback',
        type: 'feedback',
        title: '执行反馈',
        state: 'collapsed',
        data: generateCardData('feedback')
      })
      
      cards.push({
        id: 'attachments',
        type: 'attachments',
        title: '附件管理',
        state: 'collapsed',
        data: generateCardData('attachments')
      })
    } else {
      // 通用场景 - 也包含基础信息卡片
      cards.push({
        id: 'basic-info-general',
        type: 'basic-info',
        title: '基础信息',
        state: 'collapsed',
        data: {
          scenario: 'general'
        }
      })
      
      // 通用场景的其他卡片
      cards.push({
        id: 'suggestions',
        type: 'suggestions',
        title: '建议方案',
        state: 'collapsed',
        data: generateCardData('suggestions')
      })
      
      cards.push({
        id: 'resources',
        type: 'resources',
        title: '相关资源',
        state: 'collapsed',
        data: generateCardData('resources')
      })
    }
    
    return cards
  }

  const generateCardData = (type) => {
    switch (type) {
      case 'basic-info':
        // 这里不再需要返回fields，因为会在组件中根据场景自动获取
        return {
          scenario: 'general' // 默认场景，会在具体使用时覆盖
        }

      case 'flight':
        return {
          recommendations: [
            {
              airline: '中国国际航空',
              flightNumber: 'CA183',
              departure: '成都 (CTU)',
              arrival: '东京成田 (NRT)',
              time: '08:30 - 14:15',
              price: 2580,
              stops: '直飞'
            },
            {
              airline: '四川航空',
              flightNumber: '3U8086',
              departure: '成都 (CTU)',
              arrival: '东京成田 (NRT)',
              time: '14:20 - 20:05',
              price: 2380,
              stops: '直飞'
            }
          ]
        }
      case 'hotel':
        return {
          recommendations: [
            {
              name: '东京帝国酒店',
              rating: 5,
              price: 1200,
              location: '银座',
              image: '/api/placeholder/300/200',
              amenities: ['免费WiFi', '健身房', '温泉', '商务中心'],
              description: '位于银座中心的豪华酒店'
            },
            {
              name: '新宿华盛顿酒店',
              rating: 4,
              price: 800,
              location: '新宿',
              image: '/api/placeholder/300/200',
              amenities: ['免费WiFi', '健身房', '餐厅'],
              description: '交通便利的商务酒店'
            }
          ]
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
        return {
          analysis: '根据您提供的信息，收礼人是一位热爱园艺的女性...',
          tags: ['园艺爱好者', '实用主义', '自然主义']
        }
      case 'gift':
        return {
          recommendations: [
            {
              name: '园艺工具套装',
              price: 288,
              description: '包含铲子、剪刀、手套等基础工具',
              image: '/api/placeholder/200/200',
              rating: 4.8
            }
          ]
        }
      case 'budget':
        return {
          range: { min: 200, max: 500 },
          filtered: 15
        }
      case 'tips':
        return {
          tips: ['选择实用性强的礼物', '考虑包装的精美程度']
        }
      case 'meeting':
        return {
          title: '项目进度讨论会',
          date: '2024-01-15',
          time: '15:00',
          duration: '1小时'
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
      if (card.linkage.includes(sourceCard.type)) {
        // 更新联动卡片的数据
        const updatedData = generateCardData(card.type)
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
    generateCards,
    processInput,
    updateCardState,
    updateCardData,
    triggerLinkage,
    clearCards
  }
}) 