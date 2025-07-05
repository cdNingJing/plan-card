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

export default router 