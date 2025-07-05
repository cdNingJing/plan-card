import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useUserInfoStore = defineStore('userInfo', () => {
  // 用户基础信息
  const userInfo = ref({
    // 旅行信息
    travel: {
      departure: '',
      destination: '',
      startDate: '',
      endDate: '',
      travelers: '',
      budget: '',
      travelMode: 'normal'
    },
    // 礼物信息
    gift: {
      recipient: '',
      occasion: '',
      budget: '',
      preferences: '',
      relationship: ''
    },
    // 会议信息
    meeting: {
      title: '',
      date: '',
      time: '',
      duration: '',
      participants: '',
      location: ''
    }
  })

  // 当前活跃场景
  const currentScenario = ref('travel')

  // 计算属性：获取当前场景的信息
  const currentInfo = computed(() => {
    return userInfo.value[currentScenario.value] || {}
  })

  // 计算属性：获取目的地信息
  const destination = computed(() => {
    return userInfo.value.travel?.destination || ''
  })

  // 计算属性：获取出发地信息
  const departure = computed(() => {
    return userInfo.value.travel?.departure || ''
  })

  // 计算属性：获取旅行日期信息
  const travelDates = computed(() => {
    return {
      startDate: userInfo.value.travel?.startDate || '',
      endDate: userInfo.value.travel?.endDate || ''
    }
  })

  // 更新用户信息
  const updateUserInfo = (scenario, data) => {
    if (!userInfo.value[scenario]) {
      userInfo.value[scenario] = {}
    }
    
    userInfo.value[scenario] = {
      ...userInfo.value[scenario],
      ...data,
      updatedAt: new Date().toISOString()
    }

    console.log(`[UserInfoStore] 更新${scenario}场景信息:`, data)
  }

  // 更新特定字段
  const updateField = (scenario, field, value) => {
    if (!userInfo.value[scenario]) {
      userInfo.value[scenario] = {}
    }
    
    userInfo.value[scenario][field] = value
    userInfo.value[scenario].updatedAt = new Date().toISOString()

    console.log(`[UserInfoStore] 更新${scenario}场景的${field}字段:`, value)
  }

  // 设置当前场景
  const setCurrentScenario = (scenario) => {
    currentScenario.value = scenario
    console.log(`[UserInfoStore] 设置当前场景:`, scenario)
  }

  // 获取场景信息
  const getScenarioInfo = (scenario) => {
    return userInfo.value[scenario] || {}
  }

  // 清除场景信息
  const clearScenarioInfo = (scenario) => {
    if (userInfo.value[scenario]) {
      delete userInfo.value[scenario]
      console.log(`[UserInfoStore] 清除${scenario}场景信息`)
    }
  }

  // 从本地存储加载数据
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('plan_card_user_info')
      if (stored) {
        const parsed = JSON.parse(stored)
        // 只加载基础数据，不加载updatedAt等元数据
        Object.keys(parsed).forEach(scenario => {
          const { updatedAt, ...data } = parsed[scenario]
          userInfo.value[scenario] = data
        })
        console.log('[UserInfoStore] 从本地存储加载数据成功')
      }
    } catch (error) {
      console.error('[UserInfoStore] 从本地存储加载数据失败:', error)
    }
  }

  // 保存到本地存储
  const saveToStorage = () => {
    try {
      localStorage.setItem('plan_card_user_info', JSON.stringify(userInfo.value))
      console.log('[UserInfoStore] 保存到本地存储成功')
    } catch (error) {
      console.error('[UserInfoStore] 保存到本地存储失败:', error)
    }
  }

  // 监听数据变化，自动保存到本地存储
  watch(userInfo, () => {
    saveToStorage()
  }, { deep: true })

  return {
    // 状态
    userInfo,
    currentScenario,
    
    // 计算属性
    currentInfo,
    destination,
    departure,
    travelDates,
    
    // 方法
    updateUserInfo,
    updateField,
    setCurrentScenario,
    getScenarioInfo,
    clearScenarioInfo,
    loadFromStorage,
    saveToStorage
  }
}) 