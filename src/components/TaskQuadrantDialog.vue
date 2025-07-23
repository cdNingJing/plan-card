<template>
  <div v-if="visible" class="task-quadrant-dialog-overlay">
    <div class="task-quadrant-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <h3>任务四象限分类</h3>
          <div class="task-stats">
            <span class="stat-item">总任务: {{ taskStatistics.totalTasks }}</span>
            <span class="stat-item">高优先级: {{ taskStatistics.highPriorityTasks }}</span>
          </div>
          <div class="test-buttons">
            <button class="test-btn add-test-btn" @click="addTestTask" title="添加测试任务">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              添加
            </button>
            <button class="test-btn edit-test-btn" @click="editTestTask" title="编辑测试任务">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
              </svg>
              编辑
            </button>
            <button class="test-btn delete-test-btn" @click="deleteTestTask" title="删除测试任务">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
              </svg>
              删除
            </button>
            <button class="test-btn query-test-btn" @click="queryTestTasks" title="查询测试任务">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
              </svg>
              查询
            </button>
          </div>
        </div>
        <div class="header-actions">
          <button 
            v-if="tasks.length > 0"
            class="clear-data-btn" 
            @click="clearAllTasks"
            title="清空所有任务数据"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
            </svg>
          </button>
          
          <button 
            class="scroll-top-btn" 
            @click="scrollToTop"
            title="滚动到顶部"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="currentColor"/>
            </svg>
          </button>
          
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
      </div>
      <div class="dialog-content">
        <div v-if="tasks.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" fill="currentColor"/>
          </svg>
          <h4>暂无任务</h4>
          <p>当前没有待分类的任务，请先通过对话生成任务</p>
        </div>
        <div v-else class="quadrant-container">
          <!-- 重要且紧急 -->
          <div v-if="getTasksByQuadrant('important-urgent').length > 0" class="quadrant important-urgent">
            <div class="quadrant-header">
              <h4>重要且紧急</h4>
              <button class="add-task-btn" @click="showAddTaskDialog('important-urgent')" title="添加任务">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="task-list">
              <div 
                v-for="(task, index) in getTasksByQuadrant('important-urgent')" 
                :key="task.id || index"
                class="task-item"
              >
                <div class="task-content" @click="editTask(task)">
                  <span class="task-text">{{ getTaskContent(task) }}</span>
                  <div v-if="getTaskReason(task)" class="task-reason">{{ getTaskReason(task) }}</div>
                  <div class="task-analysis">
                    <span class="importance-badge" :class="getTaskImportance(task)">重要性: {{ getImportanceText(getTaskImportance(task)) }}</span>
                    <span class="urgency-badge" :class="getTaskUrgency(task)">紧急性: {{ getUrgencyText(getTaskUrgency(task)) }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <button 
                    class="edit-task-btn" 
                    @click="editTask(task)"
                    title="编辑任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button 
                    class="delete-task-btn" 
                    @click="deleteTask(task.id)"
                    title="删除此任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 重要不紧急 -->
          <div v-if="getTasksByQuadrant('important-not-urgent').length > 0" class="quadrant important-not-urgent">
            <div class="quadrant-header">
              <h4>重要不紧急</h4>
              <button class="add-task-btn" @click="showAddTaskDialog('important-not-urgent')" title="添加任务">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="task-list">
              <div 
                v-for="(task, index) in getTasksByQuadrant('important-not-urgent')" 
                :key="task.id || index"
                class="task-item"
              >
                <div class="task-content" @click="editTask(task)">
                  <span class="task-text">{{ getTaskContent(task) }}</span>
                  <div v-if="getTaskReason(task)" class="task-reason">{{ getTaskReason(task) }}</div>
                  <div class="task-analysis">
                    <span class="importance-badge" :class="getTaskImportance(task)">重要性: {{ getImportanceText(getTaskImportance(task)) }}</span>
                    <span class="urgency-badge" :class="getTaskUrgency(task)">紧急性: {{ getUrgencyText(getTaskUrgency(task)) }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <button 
                    class="edit-task-btn" 
                    @click="editTask(task)"
                    title="编辑任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button 
                    class="delete-task-btn" 
                    @click="deleteTask(task.id)"
                    title="删除此任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 紧急不重要 -->
          <div v-if="getTasksByQuadrant('urgent-not-important').length > 0" class="quadrant urgent-not-important">
            <div class="quadrant-header">
              <h4>紧急不重要</h4>
              <button class="add-task-btn" @click="showAddTaskDialog('urgent-not-important')" title="添加任务">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="task-list">
              <div 
                v-for="(task, index) in getTasksByQuadrant('urgent-not-important')" 
                :key="task.id || index"
                class="task-item"
              >
                <div class="task-content" @click="editTask(task)">
                  <span class="task-text">{{ getTaskContent(task) }}</span>
                  <div v-if="getTaskReason(task)" class="task-reason">{{ getTaskReason(task) }}</div>
                  <div class="task-analysis">
                    <span class="importance-badge" :class="getTaskImportance(task)">重要性: {{ getImportanceText(getTaskImportance(task)) }}</span>
                    <span class="urgency-badge" :class="getTaskUrgency(task)">紧急性: {{ getUrgencyText(getTaskUrgency(task)) }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <button 
                    class="edit-task-btn" 
                    @click="editTask(task)"
                    title="编辑任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button 
                    class="delete-task-btn" 
                    @click="deleteTask(task.id)"
                    title="删除此任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 不重要不紧急 -->
          <div v-if="getTasksByQuadrant('not-important-not-urgent').length > 0" class="quadrant not-important-not-urgent">
            <div class="quadrant-header">
              <h4>不重要不紧急</h4>
              <button class="add-task-btn" @click="showAddTaskDialog('not-important-not-urgent')" title="添加任务">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="task-list">
              <div 
                v-for="(task, index) in getTasksByQuadrant('not-important-not-urgent')" 
                :key="task.id || index"
                class="task-item"
              >
                <div class="task-content" @click="editTask(task)">
                  <span class="task-text">{{ getTaskContent(task) }}</span>
                  <div v-if="getTaskReason(task)" class="task-reason">{{ getTaskReason(task) }}</div>
                  <div class="task-analysis">
                    <span class="importance-badge" :class="getTaskImportance(task)">重要性: {{ getImportanceText(getTaskImportance(task)) }}</span>
                    <span class="urgency-badge" :class="getTaskUrgency(task)">紧急性: {{ getUrgencyText(getTaskUrgency(task)) }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <button 
                    class="edit-task-btn" 
                    @click="editTask(task)"
                    title="编辑任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button 
                    class="delete-task-btn" 
                    @click="deleteTask(task.id)"
                    title="删除此任务"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 任务编辑对话框 -->
    <div v-if="showEditDialog" class="edit-dialog-overlay" @click="closeEditDialog">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3>{{ isEditing ? '编辑任务' : '添加任务' }}</h3>
          <button class="close-btn" @click="closeEditDialog">×</button>
        </div>
        <div class="edit-dialog-content">
          <div class="form-group">
            <label>任务内容:</label>
            <textarea 
              v-model="editForm.content" 
              placeholder="请输入任务内容"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>任务原因:</label>
            <textarea 
              v-model="editForm.reason" 
              placeholder="请输入任务原因（可选）"
              rows="2"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>重要性:</label>
              <select v-model="editForm.importance">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div class="form-group">
              <label>紧急性:</label>
              <select v-model="editForm.urgency">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>所属象限:</label>
            <select v-model="editForm.quadrant">
              <option value="important-urgent">重要且紧急</option>
              <option value="important-not-urgent">重要不紧急</option>
              <option value="urgent-not-important">紧急不重要</option>
              <option value="not-important-not-urgent">不重要不紧急</option>
            </select>
          </div>
        </div>
        <div class="edit-dialog-actions">
          <button class="cancel-btn" @click="closeEditDialog">取消</button>
          <button class="save-btn" @click="saveTask">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskQuadrantDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tasks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showEditDialog: false,
      isEditing: false,
      editingTaskId: null,
      editForm: {
        content: '',
        reason: '',
        importance: 'medium',
        urgency: 'medium',
        quadrant: 'not-important-not-urgent'
      }
    }
  },
  computed: {
    taskStatistics() {
      return {
        totalTasks: this.tasks.length,
        highPriorityTasks: this.tasks.filter(task => 
          this.getTaskImportance(task) === 'high' || this.getTaskUrgency(task) === 'high'
        ).length
      }
    }
  },
  methods: {
    // 获取指定象限的任务
    getTasksByQuadrant(quadrant) {
      return this.tasks.filter(task => task.quadrant === quadrant)
    },
    
    // 获取重要性文本
    getImportanceText(importance) {
      const texts = {
        'high': '高',
        'medium': '中',
        'low': '低'
      }
      return texts[importance] || '中'
    },
    
    // 获取紧急性文本
    getUrgencyText(urgency) {
      const texts = {
        'high': '高',
        'medium': '中',
        'low': '低'
      }
      return texts[urgency] || '中'
    },
    
    // 获取任务内容（兼容不同格式）
    getTaskContent(task) {
      if (typeof task === 'string') return task
      if (task.content) return task.content
      if (task.task) return task.task
      return '未知任务'
    },
    
    // 获取任务原因（兼容不同格式）
    getTaskReason(task) {
      if (typeof task === 'string') return ''
      return task.reason || ''
    },
    
    // 获取任务重要性（兼容不同格式）
    getTaskImportance(task) {
      if (typeof task === 'string') return 'medium'
      return task.importance || 'medium'
    },
    
    // 获取任务紧急性（兼容不同格式）
    getTaskUrgency(task) {
      if (typeof task === 'string') return 'medium'
      return task.urgency || 'medium'
    },
    
    // 删除任务
    deleteTask(taskId) {
      this.$emit('delete-task', taskId)
    },
    
    // 清空所有任务数据
    clearAllTasks() {
      if (confirm('确定要清空所有任务数据吗？此操作不可撤销，所有任务将被永久删除。')) {
        this.$emit('clear-all-tasks')
      }
    },
    
    // 关闭对话框
    closeDialog() {
      this.$emit('close')
    },
    
    // 滚动到顶部
    scrollToTop() {
      const container = document.querySelector('.quadrant-container')
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    },
    
    // 显示添加任务对话框
    showAddTaskDialog(quadrant) {
      this.isEditing = false
      this.editingTaskId = null
      this.editForm = {
        content: '',
        reason: '',
        importance: 'medium',
        urgency: 'medium',
        quadrant: quadrant
      }
      this.showEditDialog = true
    },
    
    // 编辑任务
    editTask(task) {
      this.isEditing = true
      this.editingTaskId = task.id
      this.editForm = {
        content: this.getTaskContent(task),
        reason: this.getTaskReason(task),
        importance: this.getTaskImportance(task),
        urgency: this.getTaskUrgency(task),
        quadrant: task.quadrant || 'not-important-not-urgent'
      }
      this.showEditDialog = true
    },
    
    // 关闭编辑对话框
    closeEditDialog() {
      this.showEditDialog = false
      this.editForm = {
        content: '',
        reason: '',
        importance: 'medium',
        urgency: 'medium',
        quadrant: 'not-important-not-urgent'
      }
    },
    
    // 保存任务
    saveTask() {
      if (!this.editForm.content.trim()) {
        alert('请输入任务内容')
        return
      }
      
      const taskData = {
        id: this.isEditing ? this.editingTaskId : Date.now().toString(),
        content: this.editForm.content.trim(),
        reason: this.editForm.reason.trim(),
        importance: this.editForm.importance,
        urgency: this.editForm.urgency,
        quadrant: this.editForm.quadrant,
        createdAt: this.isEditing ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      if (this.isEditing) {
        this.$emit('update-task', taskData)
      } else {
        this.$emit('add-task', taskData)
      }
      
      this.closeEditDialog()
    },
    
    // 测试功能方法
    addTestTask() {
      const testTask = {
        id: 'test-' + Date.now(),
        content: '测试任务 - ' + new Date().toLocaleTimeString(),
        reason: '这是一个测试任务，用于验证添加功能',
        importance: 'high',
        urgency: 'high',
        quadrant: 'important-urgent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.$emit('add-task', testTask)
      console.log('添加测试任务:', testTask)
    },
    
    editTestTask() {
      if (this.tasks.length === 0) {
        alert('没有任务可以编辑，请先添加一些任务')
        return
      }
      
      const firstTask = this.tasks[0]
      this.editTask(firstTask)
      console.log('编辑测试任务:', firstTask)
    },
    
    deleteTestTask() {
      if (this.tasks.length === 0) {
        alert('没有任务可以删除，请先添加一些任务')
        return
      }
      
      const firstTaskId = this.tasks[0].id
      this.$emit('delete-task', firstTaskId)
      console.log('删除测试任务:', firstTaskId)
    },
    
    queryTestTasks() {
      console.log('查询所有任务:', this.tasks)
      console.log('任务统计:', this.taskStatistics)
      
      const quadrants = ['important-urgent', 'important-not-urgent', 'urgent-not-important', 'not-important-not-urgent']
      quadrants.forEach(quadrant => {
        const tasks = this.getTasksByQuadrant(quadrant)
        console.log(`${quadrant} 象限任务:`, tasks)
      })
      
      alert(`当前共有 ${this.taskStatistics.totalTasks} 个任务，其中 ${this.taskStatistics.highPriorityTasks} 个高优先级任务`)
    }
  }
}
</script>

<style scoped>
.task-quadrant-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 350px;
  height: 100vh;
  z-index: 1001;
  background: transparent;
  pointer-events: none;
}

.task-quadrant-dialog {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

.quadrant-container {
  display: block;
  padding: 8px;
  overflow-y: auto;
  height: 100%;
}

.quadrant {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  background: #f8f9fa;
  font-size: 10px;
  min-height: fit-content;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
}

.quadrant h4 {
  margin: 0 0 6px 0;
  font-size: 10px;
  font-weight: 600;
  color: #333;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
}

.important-urgent {
  border-color: #dc3545;
}

.important-urgent h4 {
  background: #dc3545;
  color: white;
}

.important-not-urgent {
  border-color: #28a745;
}

.important-not-urgent h4 {
  background: #28a745;
  color: white;
}

.urgent-not-important {
  border-color: #ffc107;
}

.urgent-not-important h4 {
  background: #ffc107;
  color: #333;
}

.not-important-not-urgent {
  border-color: #6c757d;
}

.not-important-not-urgent h4 {
  background: #6c757d;
  color: white;
}

/* 对话框头部固定样式 */
.dialog-header {
  background: white;
  z-index: 10;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px;
  margin: 0;
  border-radius: 16px 16px 0 0;
  height: 30%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-content h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.task-stats {
  font-size: 8px;
  margin-bottom: 4px;
}

.stat-item {
  color: #666;
  font-weight: 500;
  margin-right: 8px;
}

.test-buttons {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.test-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  color: #333;
}

.test-btn:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.add-test-btn {
  border-color: #28a745;
  color: #28a745;
}

.add-test-btn:hover {
  background: #d4edda;
  border-color: #28a745;
}

.edit-test-btn {
  border-color: #ffc107;
  color: #856404;
}

.edit-test-btn:hover {
  background: #fff3cd;
  border-color: #ffc107;
}

.delete-test-btn {
  border-color: #dc3545;
  color: #dc3545;
}

.delete-test-btn:hover {
  background: #f8d7da;
  border-color: #dc3545;
}

.query-test-btn {
  border-color: #17a2b8;
  color: #17a2b8;
}

.query-test-btn:hover {
  background: #d1ecf1;
  border-color: #17a2b8;
}

.header-actions {
  text-align: right;
  margin-top: auto;
}

.clear-data-btn,
.scroll-top-btn,
.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: 4px;
}

.clear-data-btn:hover,
.scroll-top-btn:hover {
  background: #f8f9fa;
}

.close-btn {
  font-size: 16px;
  font-weight: bold;
  color: #666;
  position: absolute;
  top: 16px;
  right: 20px;
}

.close-btn:hover {
  color: #333;
  background: #f8f9fa;
}

.dialog-content {
  overflow: hidden;
  height: 70%;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #666;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-state svg {
  color: #ccc;
  margin-bottom: 8px;
}

.empty-state h4 {
  margin: 8px 0 4px 0;
  font-size: 10px;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 8px;
  line-height: 1.2;
}

/* 自定义滚动条样式 */
.quadrant-container::-webkit-scrollbar {
  width: 6px;
}

.quadrant-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.quadrant-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.quadrant-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox滚动条样式 */
.quadrant-container {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

/* 任务列表滚动条样式 */
.task-list::-webkit-scrollbar {
  width: 4px;
}

.task-list::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 2px;
}

.task-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.task-list {
  scrollbar-width: thin;
  scrollbar-color: #dee2e6 #f8f9fa;
}

.task-list {
  overflow-y: auto;
  min-height: 50px;
  height: 100%;
}

.task-item {
  padding: 4px 6px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
  font-size: 9px;
  margin-bottom: 4px;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-content {
  margin-bottom: 4px;
}

.task-text {
  font-size: 9px;
  color: #333;
  line-height: 1.2;
  font-weight: 500;
}

.task-reason {
  font-size: 8px;
  color: #666;
  line-height: 1.1;
  font-style: italic;
}

.task-analysis {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.importance-badge,
.urgency-badge {
  font-size: 7px;
  padding: 1px 3px;
  border-radius: 2px;
  font-weight: 500;
}

.importance-badge.high,
.urgency-badge.high {
  background: #dc3545;
  color: white;
}

.importance-badge.medium,
.urgency-badge.medium {
  background: #ffc107;
  color: #333;
}

.importance-badge.low,
.urgency-badge.low {
  background: #6c757d;
  color: white;
}

.delete-task-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0.6;
}

.delete-task-btn:hover {
  background: #ffebee;
  opacity: 1;
}

.delete-task-btn svg {
  color: #dc3545;
  width: 12px;
  height: 12px;
}

/* 象限头部样式 */
.quadrant-header {
  margin-bottom: 6px;
  position: relative;
}

.add-task-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  opacity: 0.6;
  position: absolute;
  top: 0;
  right: 0;
}

.add-task-btn:hover {
  background: #e8f5e8;
  opacity: 1;
}

.add-task-btn svg {
  color: #28a745;
  width: 12px;
  height: 12px;
}

/* 任务操作按钮组 */
.task-actions {
  text-align: right;
}

.edit-task-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  opacity: 0.6;
  margin-right: 4px;
}

.edit-task-btn:hover {
  background: #e3f2fd;
  opacity: 1;
}

.edit-task-btn svg {
  color: #2196f3;
  width: 10px;
  height: 10px;
}

/* 编辑对话框样式 */
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.edit-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
}

.edit-dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.edit-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: inline-block;
}

.edit-dialog-content {
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  resize: vertical;
}

.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.form-row {
  margin-bottom: 16px;
}

.form-row .form-group {
  display: inline-block;
  width: 48%;
  margin-right: 2%;
}

.edit-dialog-actions {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}

.cancel-btn,
.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 8px;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.save-btn:hover {
  background: #1976d2;
}
</style> 