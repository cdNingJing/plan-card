<template>
  <div class="project-list">
    <div v-if="projects.length === 0" class="empty-projects">
      <div class="empty-icon">
        <FolderOpen :size="48" />
      </div>
      <p>还没有保存的项目</p>
      <p class="empty-hint">创建您的第一个智能计划</p>
    </div>
    
    <div v-else class="projects-grid">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="project-card"
        @click="openProject(project.id)"
      >
        <div class="project-header">
          <h3 class="project-title">{{ project.title }}</h3>
          <div class="project-actions">
            <button 
              @click.stop="editProject(project)"
              class="action-btn"
              title="编辑"
            >
              <Edit3 :size="16" />
            </button>
            <button 
              @click.stop="deleteProject(project.id)"
              class="action-btn delete-btn"
              title="删除"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
        
        <p class="project-description">{{ project.description }}</p>
        
        <div class="project-meta">
          <div class="meta-item">
            <Calendar :size="14" />
            <span>{{ formatDate(project.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <Layers :size="14" />
            <span>{{ project.cardCount }} 个卡片</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 编辑项目模态框 -->
    <div v-if="editingProject" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <h3>编辑项目</h3>
        <div class="form-group">
          <label>项目标题</label>
          <input 
            v-model="editForm.title"
            type="text" 
            placeholder="输入项目标题"
            maxlength="50"
          />
        </div>
        <div class="form-group">
          <label>项目描述</label>
          <textarea 
            v-model="editForm.description"
            placeholder="输入项目描述"
            rows="3"
            maxlength="200"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="cancelEdit" class="btn-secondary">取消</button>
          <button @click="saveEdit" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  FolderOpen, 
  Edit3, 
  Trash2, 
  Calendar, 
  Layers 
} from 'lucide-vue-next'
import { ProjectStorage } from '../utils/storage.js'

const router = useRouter()
const projects = ref([])
const editingProject = ref(null)
const editForm = ref({
  title: '',
  description: ''
})

const emit = defineEmits(['projects-updated'])

// 加载项目列表
const loadProjects = () => {
  projects.value = ProjectStorage.getProjects()
  emit('projects-updated', projects.value.length)
}

// 打开项目
const openProject = (projectId) => {
  router.push({
    name: 'Plan',
    query: { projectId }
  })
}

// 编辑项目
const editProject = (project) => {
  editingProject.value = project
  editForm.value = {
    title: project.title,
    description: project.description
  }
}

// 保存编辑
const saveEdit = () => {
  if (!editForm.value.title.trim()) {
    alert('请输入项目标题')
    return
  }
  
  const success = ProjectStorage.updateProject(editingProject.value.id, {
    title: editForm.value.title.trim(),
    description: editForm.value.description.trim()
  })
  
  if (success) {
    loadProjects() // 重新加载项目列表
    cancelEdit()
  } else {
    alert('保存失败，请重试')
  }
}

// 取消编辑
const cancelEdit = () => {
  editingProject.value = null
  editForm.value = {
    title: '',
    description: ''
  }
}

// 删除项目
const deleteProject = (projectId) => {
  if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
    const success = ProjectStorage.deleteProject(projectId)
    if (success) {
      loadProjects() // 重新加载项目列表
    } else {
      alert('删除失败，请重试')
    }
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// 暴露方法给父组件
defineExpose({
  loadProjects
})

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.project-list {
  margin-top: 32px;
}

.empty-projects {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #666666;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-projects p {
  margin: 4px 0;
}

.empty-hint {
  font-size: 0.875rem;
  color: #999999;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: #CCCCCC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.project-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.project-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.project-card:hover .project-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #F0F0F0;
  color: #333333;
}

.delete-btn:hover {
  background: #FEF2F2;
  color: #DC2626;
}

.project-description {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #999999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #333333;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #333333;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary,
.btn-primary {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #F8F9FA;
  color: #666666;
}

.btn-secondary:hover {
  background: #E5E5E5;
}

.btn-primary {
  background: #333333;
  color: #FFFFFF;
}

.btn-primary:hover {
  background: #000000;
}

</style> 