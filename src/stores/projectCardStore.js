import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectCardStore = defineStore('projectCard', () => {
  // 当前项目的卡片数据
  const projectCards = ref([])
  
  // 当前项目ID
  const currentProjectId = ref('')
  
  // 卡片数据更新版本号，用于强制刷新
  const updateVersion = ref(0)
  
  // 计算属性：获取指定类型的卡片
  const getCardsByType = computed(() => (type) => {
    return projectCards.value.filter(card => card.type === type)
  })
  
  // 计算属性：获取指定ID的卡片
  const getCardById = computed(() => (id) => {
    return projectCards.value.find(card => card.id === id)
  })
  
  // 设置项目卡片数据
  const setProjectCards = (projectId, cards) => {
    currentProjectId.value = projectId
    projectCards.value = cards || []
    updateVersion.value++
    console.log('[ProjectCardStore] 设置项目卡片:', projectId, cards?.length || 0)
  }
  
  // 更新指定卡片的数据
  const updateCardData = (cardId, newData) => {
    console.log('[ProjectCardStore] updateCardData 开始:', { cardId, newData })
    console.log('[ProjectCardStore] 当前projectCards:', projectCards.value)
    
    const cardIndex = projectCards.value.findIndex(card => card.id === cardId)
    console.log('[ProjectCardStore] 找到卡片索引:', cardIndex)
    
    if (cardIndex !== -1) {
      console.log('[ProjectCardStore] 更新前的卡片数据:', projectCards.value[cardIndex])
      
      // 更新卡片数据
      projectCards.value[cardIndex].data = { 
        ...projectCards.value[cardIndex].data, 
        ...newData 
      }
      
      // 如果newData包含isCompleted，则更新卡片的isCompleted状态
      if (newData.hasOwnProperty('isCompleted')) {
        projectCards.value[cardIndex].isCompleted = newData.isCompleted
      }
      
      console.log('[ProjectCardStore] 更新后的卡片数据:', projectCards.value[cardIndex])
      
      // 增加更新版本号，触发响应式更新
      const oldVersion = updateVersion.value
      updateVersion.value++
      console.log('[ProjectCardStore] 版本号更新:', { oldVersion, newVersion: updateVersion.value })
      
      console.log('[ProjectCardStore] 卡片更新完成:', projectCards.value[cardIndex])
      return true
    } else {
      console.warn('[ProjectCardStore] 未找到卡片:', cardId)
      console.warn('[ProjectCardStore] 当前所有卡片ID:', projectCards.value.map(card => card.id))
      return false
    }
  }
  
  // 更新指定类型卡片的数据
  const updateCardsByType = (type, newData) => {
    const cards = projectCards.value.filter(card => card.type === type)
    let updated = false
    
    cards.forEach(card => {
      if (updateCardData(card.id, newData)) {
        updated = true
      }
    })
    
    return updated
  }
  
  // 获取当前项目ID
  const getCurrentProjectId = () => currentProjectId.value
  
  // 清空数据
  const clear = () => {
    projectCards.value = []
    currentProjectId.value = ''
    updateVersion.value++
  }
  
  return {
    // 状态
    projectCards,
    currentProjectId,
    updateVersion,
    
    // 计算属性
    getCardsByType,
    getCardById,
    
    // 方法
    setProjectCards,
    updateCardData,
    updateCardsByType,
    getCurrentProjectId,
    clear
  }
}) 