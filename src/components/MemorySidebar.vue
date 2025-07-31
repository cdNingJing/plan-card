<template>
  <!-- 背景遮罩层 -->
  <div v-if="isOpen" class="sidebar-overlay" @click="closeSidebar"></div>
  
  <!-- 侧边栏面板 -->
  <div class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <!-- 头部 -->
    <div class="sidebar-header">
      <div class="header-content">
        <h3>用户流程系统</h3>
        <span class="doc-count">{{ memories.length }} 个文档</span>
      </div>
      <button @click="closeSidebar" class="close-btn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-wrapper">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/>
          <path d="m11 11 2 2" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索文档..."
          class="search-input"
        />
      </div>
    </div>
    
    <!-- 文档列表 -->
    <div class="document-list">
      <div v-if="filteredMemories.length === 0" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">📄</div>
          <p class="empty-title">{{ searchQuery ? '未找到匹配文档' : '暂无文档' }}</p>
          <p class="empty-subtitle">{{ searchQuery ? '尝试其他关键词' : '在下方创建您的第一个文档' }}</p>
        </div>
      </div>
      
      <div 
        v-for="memory in filteredMemories" 
        :key="memory.id"
        class="document-item"
        :class="{ 'editing': editingId === memory.id }"
      >
        <!-- 查看模式 -->
        <div v-if="editingId !== memory.id" class="document-view">
          <div class="document-header">
            <svg class="doc-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 1.5h5l2 2v7a1 1 0 01-1 1h-6a1 1 0 01-1-1v-8a1 1 0 011-1z" stroke="currentColor" stroke-width="1" fill="none"/>
              <path d="M7.5 1.5v2h2" stroke="currentColor" stroke-width="1" fill="none"/>
            </svg>
            <span class="document-title">{{ getDocumentTitle(memory.content) }}</span>
            <div class="document-actions">
              <button @click="startEdit(memory)" class="action-btn" title="编辑">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z" stroke="currentColor" stroke-width="1"/>
                </svg>
              </button>
              <button @click="deleteMemory(memory.id)" class="action-btn delete" title="删除">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 3h9M4.5 3V1.5a1 1 0 011-1h1a1 1 0 011 1V3M10 3v7.5a1 1 0 01-1 1h-6a1 1 0 01-1-1V3" stroke="currentColor" stroke-width="1"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="document-preview">{{ getDocumentPreview(memory.content) }}</div>
          <div class="document-meta">
            <span class="document-date">{{ formatDate(memory.timestamp) }}</span>
          </div>
        </div>
        
        <!-- 编辑模式 -->
        <div v-else class="document-edit">
          <textarea 
            v-model="editingContent"
            ref="editTextarea"
            class="edit-textarea"
            placeholder="输入文档内容..."
            @keydown.ctrl.enter="saveEdit"
            @keydown.escape="cancelEdit"
          ></textarea>
          <div class="edit-actions">
            <button @click="saveEdit" class="save-btn">保存</button>
            <button @click="cancelEdit" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部添加区域 -->
    <div class="add-section">
      <div v-if="!isAddingNew" class="add-trigger" @click="startAddNew">
        <svg class="add-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>新建文档</span>
      </div>
      
      <div v-else class="new-document-form">
        <textarea 
          v-model="newDocumentContent"
          ref="newDocTextarea"
          class="new-doc-textarea"
          placeholder="开始输入您的文档内容..."
          rows="3"
          @keydown.ctrl.enter="saveNewDocument"
          @keydown.escape="cancelAddNew"
        ></textarea>
        <div class="form-actions">
          <button @click="saveNewDocument" class="save-btn" :disabled="!newDocumentContent.trim()">
            创建
          </button>
          <button @click="cancelAddNew" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  memories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'add-memory', 'edit-memory', 'delete-memory', 'update-memory'])

// 响应式数据
const searchQuery = ref('')
const editingId = ref(null)
const editingContent = ref('')
const editTextarea = ref(null)
const isAddingNew = ref(false)
const newDocumentContent = ref('')
const newDocTextarea = ref(null)

// 计算属性
const filteredMemories = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.memories.slice().reverse() // 最新的在前面
  }
  
  return props.memories
    .filter(memory => 
      memory.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .reverse()
})

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return props.memories.filter(memory => 
    new Date(memory.timestamp).toDateString() === today
  ).length
})

// 方法
const closeSidebar = () => {
  // 如果正在编辑，先取消编辑
  if (editingId.value) {
    cancelEdit()
  }
  emit('close')
}

const addMemory = () => {
  emit('add-memory')
}

const startAddNew = async () => {
  isAddingNew.value = true
  await nextTick()
  if (newDocTextarea.value) {
    newDocTextarea.value.focus()
  }
}

const saveNewDocument = () => {
  if (newDocumentContent.value.trim()) {
    const newMemory = {
      id: Date.now(),
      content: newDocumentContent.value.trim(),
      timestamp: new Date()
    }
    emit('add-memory', newMemory)
    newDocumentContent.value = ''
    isAddingNew.value = false
  }
}

const cancelAddNew = () => {
  newDocumentContent.value = ''
  isAddingNew.value = false
}

const startEdit = async (memory) => {
  editingId.value = memory.id
  editingContent.value = memory.content
  
  await nextTick()
  if (editTextarea.value) {
    editTextarea.value.focus()
    editTextarea.value.select()
  }
}

const saveEdit = () => {
  if (editingContent.value.trim()) {
    const memory = props.memories.find(m => m.id === editingId.value)
    if (memory) {
      emit('update-memory', {
        id: editingId.value,
        content: editingContent.value.trim()
      })
    }
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingId.value = null
  editingContent.value = ''
}

const deleteMemory = (id) => {
  if (confirm('确定要删除这个文档吗？此操作不可撤销。')) {
    emit('delete-memory', id)
  }
}

const getDocumentTitle = (content) => {
  if (!content) return '无标题'
  const firstLine = content.split('\n')[0].trim()
  return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine || '无标题'
}

const getDocumentPreview = (content) => {
  if (!content) return ''
  const lines = content.split('\n').filter(line => line.trim())
  const preview = lines.slice(0, 2).join(' ')
  return preview.length > 80 ? preview.substring(0, 80) + '...' : preview
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
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

// 监听侧边栏关闭，清除搜索
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
    cancelEdit()
    cancelAddNew()
  }
})
</script>

<style scoped>
/* 背景遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 侧边栏面板 */
.sidebar {
  position: fixed;
  top: 0;
  left: -360px;
  width: 360px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e5e5;
  z-index: 1000;
  transition: left 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
}

.sidebar-open {
  left: 0;
}

/* 头部 */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
}

.header-content {
  flex: 1;
}

.header-content h3 {
  margin: 0 0 4px 0;
  color: #111111;
  font-size: 16px;
  font-weight: 600;
  margin-left: 40px;
  letter-spacing: -0.01em;
}

.doc-count {
  font-size: 13px;
  color: #6b7280;
  font-weight: 400;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #111111;
}

/* 搜索栏 */
.search-section {
  padding: 0 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  background: #fafafa;
  color: #111111;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

/* 文档列表 */
.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  padding: 0 24px;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.empty-subtitle {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.4;
}

/* 文档项 */
.document-item {
  margin: 0 8px 2px;
  border-radius: 6px;
  transition: all 0.15s ease;
  overflow: hidden;
}

.document-item:hover {
  background: #f9f9f9;
}

.document-item.editing {
  background: #f0f7ff;
  border: 1px solid #e0f2fe;
}

/* 文档查看模式 */
.document-view {
  padding: 12px 16px;
  cursor: pointer;
}

.document-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.doc-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.document-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #111111;
  line-height: 1.3;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.document-item:hover .document-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

.document-preview {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.document-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.document-date {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

/* 文档编辑模式 */
.document-edit {
  padding: 12px 16px;
}

.edit-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #ffffff;
  color: #111111;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 12px;
  box-sizing: border-box;
  line-height: 1.5;
}

.edit-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.edit-textarea::placeholder {
  color: #9ca3af;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.save-btn, .cancel-btn {
  padding: 6px 12px;
  border-radius: 5px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.save-btn {
  background: #111111;
  color: #ffffff;
}

.save-btn:hover:not(:disabled) {
  background: #000000;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

/* 底部添加区域 */
.add-section {
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.add-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #6b7280;
  font-size: 14px;
  font-weight: 400;
}

.add-trigger:hover {
  border-color: #d1d5db;
  background: #f9f9f9;
  color: #374151;
}

.add-icon {
  color: inherit;
}

.new-document-form {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
}

.new-doc-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #ffffff;
  color: #111111;
  resize: vertical;
  margin-bottom: 12px;
  box-sizing: border-box;
  line-height: 1.5;
}

.new-doc-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.new-doc-textarea::placeholder {
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 滚动条样式 */
.document-list::-webkit-scrollbar {
  width: 4px;
}

.document-list::-webkit-scrollbar-track {
  background: transparent;
}

.document-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.document-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .sidebar {
    width: 100vw;
    left: -100vw;
  }
  
  .sidebar-open {
    left: 0;
  }
  
  .sidebar-header {
    padding: 20px 20px 16px;
  }
  
  .search-section {
    padding: 0 20px 16px;
  }
  
  .add-section {
    padding: 16px 20px 20px;
  }
}
</style>