<template>
  <div class="plan-view">
    <!-- 返回按钮 -->
    <button @click="goBack" class="back-button">
      <ArrowLeft :size="24" />
    </button>
    
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
          @update-state="handleCardStateUpdate"
          @update-data="handleCardDataUpdate"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import SmartCard from '../components/SmartCard.vue'
import BottomInput from '../components/BottomInput.vue'
import { ProjectStorage, ProjectModel } from '../utils/storage.js'
import { useCardStore } from '../stores/cardStore.js'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()

const userInput = ref('')
const cards = ref([])
const currentProject = ref(null)

const planTitle = computed(() => {
  if (userInput.value.length > 30) {
    return userInput.value.substring(0, 30) + '...'
  }
  return userInput.value || '我的计划'
})



// 保存项目到本地存储
const saveProject = () => {
  if (!userInput.value.trim() || cards.value.length === 0) {
    return
  }

  try {
    if (currentProject.value) {
      // 更新现有项目
      currentProject.value.update({
        description: userInput.value,
        cards: cards.value
      })
      ProjectStorage.saveProject(currentProject.value.toJSON())
    } else {
      // 创建新项目
      const project = new ProjectModel(userInput.value, cards.value)
      currentProject.value = project
      ProjectStorage.saveProject(project.toJSON())
    }
    
    console.log('项目已保存到本地存储')
  } catch (error) {
    console.error('保存项目失败:', error)
  }
}

// 加载现有项目
const loadProject = (projectId) => {
  if (projectId) {
    const project = ProjectStorage.getProject(projectId)
    if (project) {
      currentProject.value = Object.assign(new ProjectModel(''), project)
      userInput.value = project.description
      cards.value = project.cards || []
    }
  }
}

// 处理新输入
const handleNewInput = (input) => {
  const newCards = cardStore.generateCards(input)
  cards.value = [...cards.value, ...newCards]
  
  // 生成卡片后自动保存项目
  saveProject()
}

// 监听卡片变化，自动保存
watch(cards, () => {
  if (currentProject.value && cards.value.length > 0) {
    saveProject()
  }
}, { deep: true })

const handleCardStateUpdate = (cardId, newState) => {
  // 更新卡片状态
  const cardIndex = cards.value.findIndex(card => card.id === cardId)
  if (cardIndex !== -1) {
    cards.value[cardIndex].state = newState
  }
  
  // 自动保存项目
  if (currentProject.value) {
    saveProject()
  }
}

const handleCardDataUpdate = (cardId, newData) => {
  // 更新卡片数据
  const cardIndex = cards.value.findIndex(card => card.id === cardId)
  if (cardIndex !== -1) {
    cards.value[cardIndex].data = { ...cards.value[cardIndex].data, ...newData }
    
    // 如果newData包含isCompleted，则更新卡片的isCompleted状态
    if (newData.hasOwnProperty('isCompleted')) {
      cards.value[cardIndex].isCompleted = newData.isCompleted
    }
  }
  
  // 自动保存项目
  if (currentProject.value) {
    saveProject()
  }
}

const goBack = () => {
  router.push('/')
}



onMounted(() => {
  const projectId = route.query.projectId
  const input = route.query.input
  
  if (projectId) {
    // 加载现有项目
    loadProject(projectId)
  } else if (input) {
    // 新建项目
    userInput.value = input
    const newCards = cardStore.generateCards(input)
    cards.value = newCards
    
    // 生成卡片后自动保存项目
    if (newCards.length > 0) {
      saveProject()
    }
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

.back-button {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 50%;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background: #F8F9FA;
  color: #333333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.plan-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 68px; /* 默认输入框高度 */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}

/* 当输入框展开时，调整内容区域 */
.plan-content.input-expanded {
  bottom: 50vh; /* 展开状态占用50vh */
}

.plan-content.input-fullscreen {
  bottom: 100vh; /* 全屏状态完全隐藏 */
}

.cards-container {
  max-width: 1200px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style> 