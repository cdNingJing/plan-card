import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PlanView from '@/views/PlanView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ChatView from '@/views/ChatView.vue'
import PlannerView from '@/views/PlannerView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AboutView from '@/views/AboutView.vue'
import MetadataView from '@/views/MetadataView.vue'

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
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatView
  },
  {
    path: '/planner',
    name: 'Planner',
    component: PlannerView
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  {
    path: '/metadata',
    name: 'Metadata',
    component: MetadataView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置全局 router 引用，供 Agent 使用
window.router = router

export default router 