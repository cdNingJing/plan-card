<template>
  <div class="home-view">
    <!-- 主内容 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 示例区域 -->
        <section class="examples-section">
          <h2>试试这些示例</h2>
          <div class="example-list">
            <button 
              v-for="example in examples" 
              :key="example.id"
              @click="handleExample(example.text)"
              class="example-btn"
            >
              {{ example.text }}
            </button>
          </div>
        </section>
        
        <!-- 项目列表 -->
        <section class="projects-section">
          <div class="section-header">
            <h2>我的项目</h2>
            <button 
              v-if="hasProjects"
              @click="clearAllProjects"
              class="clear-all-btn"
              title="清空所有项目"
            >
              清空全部
            </button>
          </div>
          <ProjectList ref="projectListRef" @projects-updated="handleProjectsUpdated" />
        </section>
      </div>
    </main>
    
    <!-- 底部输入组件 -->
    <BottomInput 
      ref="bottomInputRef"
      placeholder="描述您的需求，如：好友旅行规划..."
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BottomInput from '../components/BottomInput.vue'
import ProjectList from '../components/ProjectList.vue'
import { ProjectStorage, ProjectModel } from '../utils/storage.js'
import { useAgentStore } from '../stores/agentStore.js'
import { useCardStore } from '../stores/cardStore.js'

const router = useRouter()
const agentStore = useAgentStore()
const cardStore = useCardStore()
const bottomInputRef = ref(null)
const projectListRef = ref(null)
const projectCount = ref(0)

const hasProjects = computed(() => projectCount.value > 0)

const examples = ref([
  {
    id: 1,
    text: "好友旅行规划"
  },
  {
    id: 2,
    text: "母亲节礼物推荐"
  },
  {
    id: 3,
    text: "会议确认提醒"
  },
  {
    id: 4,
    text: "我明天下午临时要去纽约开客户会"
  },
  {
    id: 5,
    text: "个人画像"
  }
])

// 创建新项目并清除对话历史（已废弃，由 BottomInput 统一处理）
function createNewProject(input) {
  // 此函数已废弃，项目创建统一由 BottomInput 处理
  console.warn('createNewProject 已废弃，请使用 BottomInput 的项目创建逻辑')
  return null
}

const handleExample = (text) => {
  // 如果是个人画像，跳转到个人画像页面
  if (text === "个人画像") {
    router.push('/profile')
    return
  }
  
  // 设置输入框的值，让 BottomInput 来处理项目创建
  bottomInputRef.value.setValue(text)
  // 清空首页对话历史
  agentStore.clearHistory()
  // 展开输入框
  bottomInputRef.value.expand()
  // 聚焦到输入框并自动发送
  nextTick(() => {
    const inputRef = bottomInputRef.value.$refs?.inputRef
    if (inputRef) {
      inputRef.focus()
    }
    // 自动发送消息，让 BottomInput 创建项目
    bottomInputRef.value.handleSubmit()
  })
}

const handleProjectsUpdated = (count) => {
  projectCount.value = count
}

const clearAllProjects = () => {
  if (confirm('确定要清空所有项目吗？此操作无法撤销。')) {
    const success = ProjectStorage.clearProjects()
    if (success) {
      projectListRef.value.loadProjects()
      projectCount.value = 0
    } else {
      alert('清空失败，请重试')
    }
  }
}

// 初始化项目数量
const initProjectCount = () => {
  const projects = ProjectStorage.getProjects()
  projectCount.value = projects.length
}

// 组件挂载时初始化
onMounted(() => {
  initProjectCount()
})
</script>

<style scoped>
.home-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFFFFF;
  overflow: hidden; /* 防止整体滚动 */
}

.main-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 68px; /* 默认输入框高度 */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 12px;
}

/* 当输入框展开时，调整内容区域 */
.main-content.input-expanded {
  bottom: 50vh; /* 展开状态占用50vh */
}

.main-content.input-fullscreen {
  bottom: 100vh; /* 全屏状态完全隐藏 */
}

.content-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
  margin: 0 auto;
  padding-bottom: 20px; /* 底部留白 */
}

.examples-section {
  margin-bottom: 32px;
}

.examples-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20px;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.example-btn {
  padding: 14px 18px;
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  line-height: 1.4;
}

.example-btn:hover {
  background: #E5E5E5;
  border-color: #CCCCCC;
}

.projects-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.clear-all-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #DC2626;
}
</style> 