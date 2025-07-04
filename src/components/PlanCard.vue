<template>
  <div class="plan-card">
    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-number">{{ planStore.totalPlans }}</span>
        <span class="stat-label">总计划</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ planStore.todoPlans.length }}</span>
        <span class="stat-label">待办</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ planStore.inProgressPlans.length }}</span>
        <span class="stat-label">进行中</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ planStore.completedPlans.length }}</span>
        <span class="stat-label">已完成</span>
      </div>
    </div>

    <!-- 添加计划表单 -->
    <div class="add-plan-form">
      <h3>✨ 添加新计划</h3>
      <form @submit.prevent="addNewPlan">
        <div class="form-group">
          <input 
            v-model="newPlan.title" 
            type="text" 
            placeholder="计划标题"
            required
          />
        </div>
        <div class="form-group">
          <textarea 
            v-model="newPlan.description" 
            placeholder="计划描述"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <select v-model="newPlan.priority">
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
        </div>
        <button type="submit" class="add-btn">添加计划</button>
      </form>
    </div>

    <!-- 计划列表 -->
    <div class="plans-list">
      <h3>📝 我的计划</h3>
      <div class="plans-grid">
        <div 
          v-for="plan in planStore.plans" 
          :key="plan.id"
          class="plan-item"
          :class="[`status-${plan.status}`, `priority-${plan.priority}`]"
        >
          <div class="plan-header">
            <h4>{{ plan.title }}</h4>
            <div class="plan-actions">
              <button 
                @click="planStore.togglePlanStatus(plan.id)"
                class="status-btn"
                :title="getStatusButtonTitle(plan.status)"
              >
                {{ getStatusIcon(plan.status) }}
              </button>
              <button 
                @click="planStore.deletePlan(plan.id)"
                class="delete-btn"
                title="删除计划"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <p class="plan-description">{{ plan.description }}</p>
          
          <div class="plan-meta">
            <span class="priority-badge">{{ getPriorityText(plan.priority) }}</span>
            <span class="status-badge">{{ getStatusText(plan.status) }}</span>
          </div>
          
          <div class="plan-date">
            创建于: {{ formatDate(plan.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlanStore } from '../stores/planStore'

const planStore = usePlanStore()

const newPlan = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium'
})

const addNewPlan = () => {
  if (newPlan.value.title.trim()) {
    planStore.addPlan({
      title: newPlan.value.title,
      description: newPlan.value.description,
      status: newPlan.value.status,
      priority: newPlan.value.priority
    })
    
    // 重置表单
    newPlan.value = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium'
    }
  }
}

const getStatusIcon = (status) => {
  const icons = {
    'todo': '⏳',
    'progress': '🔄',
    'completed': '✅'
  }
  return icons[status] || '⏳'
}

const getStatusText = (status) => {
  const texts = {
    'todo': '待办',
    'progress': '进行中',
    'completed': '已完成'
  }
  return texts[status] || '待办'
}

const getPriorityText = (priority) => {
  const texts = {
    'low': '低优先级',
    'medium': '中优先级',
    'high': '高优先级'
  }
  return texts[priority] || '中优先级'
}

const getStatusButtonTitle = (status) => {
  const titles = {
    'todo': '标记为进行中',
    'progress': '标记为已完成',
    'completed': '标记为待办'
  }
  return titles[status] || '切换状态'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.plan-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.add-plan-form {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.add-plan-form h3 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: transform 0.2s;
}

.add-btn:hover {
  transform: translateY(-2px);
}

.plans-list h3 {
  margin-bottom: 20px;
  color: #333;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.plan-item {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  position: relative;
}

.plan-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.plan-item.status-completed {
  border-color: #4caf50;
  background: #f8fff8;
}

.plan-item.status-progress {
  border-color: #ff9800;
  background: #fff8f0;
}

.plan-item.priority-high {
  border-left: 4px solid #f44336;
}

.plan-item.priority-medium {
  border-left: 4px solid #ff9800;
}

.plan-item.priority-low {
  border-left: 4px solid #4caf50;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.plan-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.plan-actions {
  display: flex;
  gap: 8px;
}

.status-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.status-btn:hover,
.delete-btn:hover {
  background: #f0f0f0;
}

.plan-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.plan-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.priority-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge {
  background: #f3e5f5;
  color: #7b1fa2;
}

.plan-date {
  font-size: 0.8rem;
  color: #999;
}

@media (max-width: 768px) {
  .plan-card {
    padding: 20px;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style> 