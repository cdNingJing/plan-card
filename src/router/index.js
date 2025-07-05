import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PlanView from '@/views/PlanView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/plan',
    name: 'Plan',
    component: PlanView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置全局 router 引用，供 Agent 使用
window.router = router

export default router 