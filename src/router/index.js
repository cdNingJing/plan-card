import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NewHomeView from '@/views/NewHomeView.vue'
import TaskHomeView from '@/views/TaskHomeView.vue'
import PlanView from '@/views/PlanView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ChatView from '@/views/ChatView.vue'
import PlannerView from '@/views/PlannerView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AboutView from '@/views/AboutView.vue'
import MetadataView from '@/views/MetadataView.vue'
import GroupChatView from '@/views/GroupChatView.vue'
import UnderstandingSystemView from '@/views/UnderstandingSystemView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/new-home',
    name: 'NewHome',
    component: NewHomeView,
    meta: {
      title: '新首页',
      keepAlive: true
    }
  },
  {
    path: '/task-home',
    name: 'TaskHome',
    component: TaskHomeView,
    meta: {
      title: '任务向首页',
      keepAlive: true
    }
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
  },
  {
    path: '/group-chat',
    name: 'GroupChat',
    component: GroupChatView
  },
  {
    path: '/understanding-system',
    name: 'UnderstandingSystem',
    component: UnderstandingSystemView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置全局 router 引用，供 Agent 使用
window.router = router

export default router 