import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlanStore = defineStore('plan', () => {
  // 状态
  const plans = ref([
    {
      id: 1,
      title: '学习 Vue 3',
      description: '深入学习 Vue 3 的组合式 API 和新特性',
      status: 'progress',
      priority: 'high',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: '掌握 Pinia',
      description: '学习 Pinia 状态管理库的使用方法',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString()
    }
  ])

  const nextId = ref(3)

  // 计算属性
  const completedPlans = computed(() => 
    plans.value.filter(plan => plan.status === 'completed')
  )

  const todoPlans = computed(() => 
    plans.value.filter(plan => plan.status === 'todo')
  )

  const inProgressPlans = computed(() => 
    plans.value.filter(plan => plan.status === 'progress')
  )

  const totalPlans = computed(() => plans.value.length)

  // 方法
  const addPlan = (planData) => {
    const newPlan = {
      id: nextId.value++,
      ...planData,
      createdAt: new Date().toISOString()
    }
    plans.value.push(newPlan)
  }

  const updatePlan = (id, updates) => {
    const index = plans.value.findIndex(plan => plan.id === id)
    if (index !== -1) {
      plans.value[index] = { ...plans.value[index], ...updates }
    }
  }

  const deletePlan = (id) => {
    const index = plans.value.findIndex(plan => plan.id === id)
    if (index !== -1) {
      plans.value.splice(index, 1)
    }
  }

  const togglePlanStatus = (id) => {
    const plan = plans.value.find(p => p.id === id)
    if (plan) {
      const statusMap = {
        'todo': 'progress',
        'progress': 'completed',
        'completed': 'todo'
      }
      plan.status = statusMap[plan.status]
    }
  }

  return {
    // 状态
    plans,
    
    // 计算属性
    completedPlans,
    todoPlans,
    inProgressPlans,
    totalPlans,
    
    // 方法
    addPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
  }
}) 