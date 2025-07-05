import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/plan',
    name: 'plan',
    component: () => import('../views/PlanView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 