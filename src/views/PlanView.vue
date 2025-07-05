<template>
  <div class="plan-view">
    <!-- 顶部导航 -->
    <header class="plan-header">
      <div class="header-content">
        <button @click="goBack" class="back-button">
          <ArrowLeft :size="20" />
          返回
        </button>
        <h1 class="plan-title">{{ planTitle }}</h1>
        <button @click="clearPlan" class="clear-button">
          <Trash2 :size="20" />
          清空
        </button>
      </div>
    </header>
    
    <!-- 卡片展示区域 -->
    <main class="plan-content">
      <div class="cards-container">
        <div 
          v-for="card in cards" 
          :key="card.id"
          class="card-wrapper"
        >
          <SmartCard 
            :card="card"
            @update="handleCardUpdate"
          />
        </div>
      </div>
    </main>
    
    <!-- 底部输入组件 -->
    <BottomInput 
      placeholder="继续添加需求或修改计划..."
      @submit="handleNewInput"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Trash2 } from 'lucide-vue-next'
import SmartCard from '../components/SmartCard.vue'
import BottomInput from '../components/BottomInput.vue'

const route = useRoute()
const router = useRouter()

const userInput = ref('')
const cards = ref([])

const planTitle = computed(() => {
  if (userInput.value.length > 30) {
    return userInput.value.substring(0, 30) + '...'
  }
  return userInput.value || '我的计划'
})

// 模拟数据生成函数
const generateMockCards = (input) => {
  const mockCards = []
  
  if (input.includes('东京') || input.includes('旅行') || input.includes('玩')) {
    // 旅行类卡片
    mockCards.push(
      {
        id: 'destination-1',
        type: 'destination',
        title: '目的地规划',
        status: 'expanded',
        priority: 1,
        data: {
          destination: '东京',
          duration: '5天',
          travelers: 2,
          travelMode: 'leisure'
        }
      },
      {
        id: 'flight-1',
        type: 'flight',
        title: '航班推荐',
        status: 'collapsed',
        priority: 2,
        data: {
          from: '上海',
          to: '东京',
          date: '2024-02-15',
          passengers: 2
        }
      },
      {
        id: 'hotel-1',
        type: 'hotel',
        title: '酒店推荐',
        status: 'collapsed',
        priority: 3,
        data: {
          location: '东京',
          checkIn: '2024-02-15',
          checkOut: '2024-02-20',
          guests: 2
        }
      },
      {
        id: 'generic-1',
        type: 'generic',
        title: '行程安排',
        status: 'collapsed',
        priority: 4,
        data: {
          title: '东京5日游行程',
          content: '第1天：浅草寺、晴空塔\n第2天：银座购物、东京塔\n第3天：新宿、涩谷\n第4天：迪士尼乐园\n第5天：自由活动',
          type: 'itinerary'
        }
      }
    )
  } else if (input.includes('礼物') || input.includes('送')) {
    // 礼物类卡片
    mockCards.push(
      {
        id: 'generic-2',
        type: 'generic',
        title: '收礼人画像',
        status: 'expanded',
        priority: 1,
        data: {
          title: '妈妈的兴趣画像',
          content: '年龄：50-60岁\n兴趣：园艺、种花\n性格：细心、温柔\n预算：500元以内',
          type: 'profile'
        }
      },
      {
        id: 'gift-1',
        type: 'gift',
        title: '礼物推荐',
        status: 'collapsed',
        priority: 2,
        data: {
          category: '园艺用品',
          budget: 500,
          recipient: '妈妈'
        }
      },
      {
        id: 'budget-1',
        type: 'budget',
        title: '预算筛选',
        status: 'collapsed',
        priority: 3,
        data: {
          maxBudget: 500,
          category: '园艺礼品'
        }
      }
    )
  } else if (input.includes('会议') || input.includes('提醒')) {
    // 会议类卡片
    mockCards.push(
      {
        id: 'meeting-1',
        type: 'meeting',
        title: '会议详情',
        status: 'expanded',
        priority: 1,
        data: {
          meeting: {
            title: '项目进度讨论会',
            date: '2024-01-16',
            time: '15:00-16:00',
            location: '会议室A',
            status: 'scheduled'
          }
        }
      },
      {
        id: 'generic-3',
        type: 'generic',
        title: '提醒设置',
        status: 'collapsed',
        priority: 2,
        data: {
          title: '会议提醒',
          content: '✓ 会议前15分钟提醒\n✓ 会议前1小时提醒\n○ 会议前1天提醒',
          type: 'reminder'
        }
      },
      {
        id: 'generic-4',
        type: 'generic',
        title: '参与者确认',
        status: 'collapsed',
        priority: 3,
        data: {
          title: '邀请状态',
          content: '张三 - 已确认\n李四 - 待回复\n王五 - 已确认',
          type: 'participants'
        }
      }
    )
  } else {
    // 默认卡片
    mockCards.push({
      id: 'generic-default',
      type: 'generic',
      title: '智能分析结果',
      status: 'expanded',
      priority: 1,
      data: {
        title: '需求分析',
        content: `您的需求：${input}\n\n我们正在为您准备相关的计划卡片...`,
        type: 'analysis'
      }
    })
  }
  
  return mockCards
}

const handleCardUpdate = (cardId, updateData) => {
  console.log('Card updated:', cardId, updateData)
}

const handleNewInput = (input) => {
  // 生成新的卡片并添加到现有卡片中
  const newCards = generateMockCards(input)
  
  // 为新卡片生成唯一ID
  const maxId = cards.value.length > 0 ? Math.max(...cards.value.map(c => parseInt(c.id.split('-')[1]) || 0)) : 0
  newCards.forEach((card, index) => {
    card.id = `${card.type}-${maxId + index + 1}`
  })
  
  // 添加到现有卡片中
  cards.value.push(...newCards)
  
  // 更新URL参数
  const allInputs = [userInput.value, input].filter(Boolean).join('; ')
  router.replace({
    name: 'plan',
    query: { input: allInputs }
  })
}

const goBack = () => {
  router.push('/')
}

const clearPlan = () => {
  cards.value = []
  router.push('/')
}

onMounted(() => {
  userInput.value = route.query.input || ''
  if (userInput.value) {
    cards.value = generateMockCards(userInput.value)
  }
})
</script>

<style scoped>
.plan-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFFFFF;
  overflow: hidden; /* 防止整体滚动 */
}

.plan-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
  padding: 8px 12px;
  z-index: 50;
  box-sizing: border-box;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 100%;
}

.back-button,
.clear-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.back-button:hover,
.clear-button:hover {
  background: #E5E5E5;
  color: #333333;
}

.plan-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  margin: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-content {
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 60px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}

.cards-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-wrapper {
  min-height: 150px;
}

/* 桌面端样式 */
@media (min-width: 769px) {
  .plan-header {
    height: 72px;
    padding: 16px 24px;
  }
  
  .header-content {
    gap: 16px;
  }
  
  .back-button,
  .clear-button {
    gap: 8px;
    padding: 8px 16px;
    font-size: 0.875rem;
  }
  
  .plan-title {
    font-size: 1.5rem;
  }
  
  .plan-content {
    top: 72px;
    bottom: 68px;
    padding: 32px 24px;
  }
  
  .cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
  }
  
  .card-wrapper {
    min-height: 200px;
  }
}

/* 平板端样式 */
@media (max-width: 768px) and (min-width: 481px) {
  .plan-header {
    height: 64px;
    padding: 10px 16px;
  }
  
  .plan-title {
    font-size: 1.25rem;
  }
  
  .plan-content {
    top: 64px;
    bottom: 64px;
    padding: 16px;
  }
  
  .cards-container {
    gap: 16px;
  }
}

/* 手机端样式 */
@media (max-width: 480px) {
  .plan-header {
    height: 52px;
    padding: 6px 12px;
  }
  
  .header-content {
    gap: 6px;
  }
  
  .back-button,
  .clear-button {
    gap: 2px;
    padding: 4px 8px;
    font-size: 0.7rem;
  }
  
  .back-button svg,
  .clear-button svg {
    width: 16px;
    height: 16px;
  }
  
  .plan-title {
    font-size: 0.9rem;
  }
  
  .plan-content {
    top: 52px;
    bottom: 60px;
    padding: 8px;
  }
  
  .cards-container {
    gap: 8px;
  }
  
  .card-wrapper {
    min-height: 120px;
  }
}
</style> 