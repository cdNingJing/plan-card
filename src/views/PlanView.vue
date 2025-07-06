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
    <PlanInput 
      :projectId="currentProject?.id || ''"
      placeholder="继续添加需求或修改计划..."
      :scenario="getCurrentScenario()"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Bot } from 'lucide-vue-next'
import SmartCard from '../components/SmartCard.vue'
import PlanInput from '../components/PlanInput.vue'
import { ProjectStorage, ProjectModel } from '../utils/storage.js'
import { useCardStore } from '../stores/cardStore.js'
import { useProjectCardStore } from '../stores/projectCardStore.js'
import { getBasicInfoFields, basicInfoFieldsConfig } from '../config/basicInfoFields.js'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()
const projectCardStore = useProjectCardStore()

const userInput = ref('')
const currentProject = ref(null)
const conversationHistory = ref([])
const showConversation = ref(true)

// 使用projectCardStore的卡片数据
const cards = computed(() => projectCardStore.projectCards)

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
      currentProject.value.description = userInput.value
      currentProject.value.cards = cards.value
      ProjectStorage.saveProject(currentProject.value.toJSON())
    } else {
      // 创建新项目
      const project = new ProjectModel(userInput.value, cards.value)
      currentProject.value = project
      ProjectStorage.saveProject(project.toJSON())
      
      // 更新URL添加projectId参数，避免刷新时重复创建
      const newUrl = new URL(window.location)
      newUrl.searchParams.set('projectId', project.id)
      newUrl.searchParams.delete('input') // 移除input参数
      window.history.replaceState({}, '', newUrl)
    }
    
    console.log('项目已保存到本地存储')
  } catch (error) {
    console.error('保存项目失败:', error)
  }
}

  // 加载现有项目
  const loadProject = (projectId) => {
    console.log('[PlanView] loadProject 开始，projectId:', projectId)
    if (projectId) {
      const project = ProjectStorage.getProject(projectId)
      console.log('[PlanView] 从存储中获取项目:', project ? '项目存在' : '项目不存在')
      if (project) {
        currentProject.value = Object.assign(new ProjectModel(''), project)
        userInput.value = project.description
        console.log('[PlanView] 项目已加载到 currentProject:', currentProject.value.id)
        
        // 使用projectCardStore设置卡片数据
        projectCardStore.setProjectCards(projectId, project.cards || [])
        
        // 如果项目没有卡片，根据描述和AI回复生成卡片
        if (!project.cards || project.cards.length === 0) {
          console.log('项目没有卡片，根据描述和AI回复生成卡片...')
          // 尝试从对话历史中找到AI的回复来分析场景
          let aiResponse = null
          if (project.conversationHistory && project.conversationHistory.length > 0) {
            const lastAssistantMsg = project.conversationHistory
              .filter(msg => msg.role === 'assistant' && msg.status === 'done')
              .pop()
            if (lastAssistantMsg) {
              aiResponse = lastAssistantMsg.content
            }
          }
          
          const defaultCards = cardStore.generateCards(project.description, aiResponse)
          projectCardStore.setProjectCards(projectId, defaultCards)
          // 保存生成的卡片到项目
          if (defaultCards.length > 0) {
            saveProject()
          }
        }
        
        // 加载对话历史
        conversationHistory.value = project.conversationHistory || []
        
        // 设置当前项目ID
        ProjectStorage.setCurrentProjectId(projectId)
      } else {
        console.warn('[PlanView] 项目不存在，projectId:', projectId)
      }
    } else {
      console.warn('[PlanView] projectId 为空')
    }
  }



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
  console.log('[PlanView] 收到卡片数据更新事件:', { cardId, newData })
  
  // 使用projectCardStore更新卡片数据
  const success = projectCardStore.updateCardData(cardId, newData)
  
  if (success) {
    console.log('[PlanView] 卡片数据更新成功')
    // 自动保存项目
    if (currentProject.value) {
      saveProject()
    }
  } else {
    console.warn('[PlanView] 卡片数据更新失败')
  }
}

const goBack = () => {
  router.push('/')
}

// 切换对话显示
const toggleConversation = () => {
  showConversation.value = !showConversation.value
}

// 保存对话历史到项目
const saveConversationHistory = () => {
  if (currentProject.value && conversationHistory.value.length > 0) {
    currentProject.value.conversationHistory = conversationHistory.value
    ProjectStorage.saveProject(currentProject.value.toJSON())
  }
}

// 查找已存在的项目
const findExistingProject = (input) => {
  const projects = ProjectStorage.getProjects()
  return projects.find(project => project.description === input)
}

// 获取当前场景
const getCurrentScenario = () => {
  if (!currentProject.value) return 'travel'
  
  // 从项目描述或卡片中推断场景
  const description = currentProject.value.description || ''
  const cards = currentProject.value.cards || []
  
  // 检查是否有basic-info卡片，从中获取场景信息
  const basicInfoCard = cards.find(card => card.type === 'basic-info')
  if (basicInfoCard && basicInfoCard.data && basicInfoCard.data.scenario) {
    return basicInfoCard.data.scenario
  }
  
  // 根据描述关键词推断场景
  if (description.includes('旅行') || description.includes('旅游') || description.includes('机票') || description.includes('酒店')) {
    return 'travel'
  } else if (description.includes('礼物') || description.includes('送礼') || description.includes('购买')) {
    return 'gift'
  } else if (description.includes('会议') || description.includes('开会') || description.includes('邮箱')) {
    return 'meeting'
  }
  
  // 默认返回travel场景
  return 'travel'
}

// 监听 projectId 路由参数变化，强制重新加载
watch(() => route.query.projectId, (newId) => {
  if (newId) {
    loadProject(newId)
  }
})

// 监听当前项目变化，更新卡片显示
watch(() => currentProject.value, (newProject) => {
  if (newProject) {
    projectCardStore.setProjectCards(newProject.id, newProject.cards || [])
  }
}, { deep: true })

onMounted(() => {
  // 优先处理 projectId 路由参数，确保刷新时能加载项目
  if (route.query.projectId) {
    loadProject(route.query.projectId)
    return
  }
  // 其次处理 planData 跳转
  if (route.query.planData) {
    try {
      const planData = JSON.parse(route.query.planData)
      userInput.value = planData.description || ''
      projectCardStore.setProjectCards('', [])
      if (planData.title) {
        currentProject.value = { title: planData.title, description: planData.description, cards: [] }
      }
      // 生成卡片
      if (planData.type && planData.title) {
        const scene = planData.type
        // 确保 cardTypes 是有效的数组
        let cardTypes = ['basic-info', 'suggestions', 'resources'] // 默认值
        if (projectCardStore.projectCards.length > 0) {
          cardTypes = projectCardStore.projectCards.map(c => c.type)
        }
        // 解析用户输入，获取实体信息
        const context = cardStore.parseUserInput(planData.description || '')
        const generatedCards = cardStore.generateCardsByScene(scene, cardTypes, context)
        projectCardStore.setProjectCards('', generatedCards)
        if (currentProject.value) {
          currentProject.value.cards = generatedCards
        }
      }
      return
    } catch (e) {
      console.warn('planData 解析失败', e)
    }
  }
  const projectId = ProjectStorage.getCurrentProjectId()
  if (projectId) {
    const project = ProjectStorage.getProject(projectId)
    if (project && project.conversationHistory) {
      // 移除"即将为您生成计划卡片..."的assistant消息
      const filtered = project.conversationHistory.filter(
        msg => !(msg.role === 'assistant' && msg.content === '即将为您生成计划卡片...')
      )
      if (filtered.length !== project.conversationHistory.length) {
        project.conversationHistory = filtered
        ProjectStorage.saveProject(project)
      }
    }
    // 使用AI分析结果生成卡片
    if (project) {
      // 尝试从对话历史中找到AI的回复来分析场景
      let aiResponse = null
      if (project.conversationHistory && project.conversationHistory.length > 0) {
        const lastAssistantMsg = project.conversationHistory
          .filter(msg => msg.role === 'assistant' && msg.status === 'done')
          .pop()
        if (lastAssistantMsg) {
          aiResponse = lastAssistantMsg.content
        }
      }
      
      // 使用AI分析结果生成卡片
      const allCards = cardStore.generateCards(project.description || '', aiResponse)
      project.cards = allCards
      ProjectStorage.saveProject(project)
    }
    // 打印当前已生成的所有卡片及必选字段
    console.log('[PlanView] 当前场景已生成卡片:', project.cards.map(card => ({
      type: card.type,
      title: card.title,
      state: card.state,
    })))
    loadProject(projectId)
    
    // 项目保存后，清除当前项目ID，为下次对话做准备
    ProjectStorage.setCurrentProjectId(null)
  } else if (route.query.input) {
    // 检查是否已有相同描述的项目
    const existingProject = findExistingProject(route.query.input)
    
    if (existingProject) {
      // 加载已存在的项目
      console.log('找到已存在的项目，加载中...')
      currentProject.value = Object.assign(new ProjectModel(''), existingProject)
      userInput.value = existingProject.description
      projectCardStore.setProjectCards(existingProject.id, existingProject.cards || [])
      
      // 如果项目没有卡片，根据描述和AI回复生成默认卡片
      if (!existingProject.cards || existingProject.cards.length === 0) {
        console.log('已存在项目没有卡片，根据描述和AI回复生成默认卡片...')
        // 尝试从对话历史中找到AI的回复来分析场景
        let aiResponse = null
        if (existingProject.conversationHistory && existingProject.conversationHistory.length > 0) {
          const lastAssistantMsg = existingProject.conversationHistory
            .filter(msg => msg.role === 'assistant' && msg.status === 'done')
            .pop()
          if (lastAssistantMsg) {
            aiResponse = lastAssistantMsg.content
          }
        }
        
        const defaultCards = cardStore.generateCards(existingProject.description, aiResponse)
        projectCardStore.setProjectCards(existingProject.id, defaultCards)
        // 保存生成的卡片到项目
        if (defaultCards.length > 0) {
          saveProject()
        }
      }
      
      // 更新URL添加projectId参数
      const newUrl = new URL(window.location)
      newUrl.searchParams.set('projectId', existingProject.id)
      newUrl.searchParams.delete('input')
      window.history.replaceState({}, '', newUrl)
      
      // 项目保存后，清除当前项目ID，为下次对话做准备
      ProjectStorage.setCurrentProjectId(null)
    } else {
      // 新建项目
      console.log('创建新项目...')
      userInput.value = route.query.input
      // 对于新项目，暂时没有AI回复，使用关键词检测
      const newCards = cardStore.generateCards(route.query.input)
      projectCardStore.setProjectCards('', newCards)
      
      // 生成卡片后自动保存项目
      if (newCards.length > 0) {
        saveProject()
      }
      
      // 项目保存后，清除当前项目ID，为下次对话做准备
      ProjectStorage.setCurrentProjectId(null)
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

/* 计划标题样式已移除 */

/* 对话历史区域 */
/* conversation-section 相关样式全部删除 */

.toggle-btn {
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.toggle-btn:hover {
  background: #F0F0F0;
  color: #333333;
}

.conversation-container {
  max-height: 300px;
  overflow-y: auto;
}

.conversation-list {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  max-width: 85%;
  word-wrap: break-word;
}

.conversation-item.user {
  background: #F0F0F0;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  flex-direction: row;
}

.conversation-item.assistant {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.message-avatar {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.conversation-item.user .message-avatar {
  background: #333333;
  color: #FFFFFF;
  margin-left: 10px;
  margin-right: 0;
}

.conversation-item.assistant .message-avatar {
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  color: #666666;
  margin-right: 10px;
  margin-left: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-content span {
  display: block;
  word-break: break-word;
}

.conversation-item.user .message-content {
  text-align: left;
}

.conversation-item.assistant .message-content {
  text-align: left;
}
</style> 