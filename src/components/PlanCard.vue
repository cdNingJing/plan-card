<template>
  <div class="plan-card">
    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stat-item">
        <div class="stat-icon">
          <ClipboardList :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ planStore.totalPlans }}</span>
          <span class="stat-label">总计划</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <Clock :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ planStore.todoPlans.length }}</span>
          <span class="stat-label">待办</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <Play :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ planStore.inProgressPlans.length }}</span>
          <span class="stat-label">进行中</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <CheckCircle :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ planStore.completedPlans.length }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
    </div>

    <!-- 添加计划表单 -->
    <div class="add-plan-form">
      <div class="form-header">
        <Plus :size="20" />
        <h3>添加新计划</h3>
      </div>
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
        <button type="submit" class="add-btn">
          <Plus :size="16" />
          添加计划
        </button>
      </form>
    </div>

    <!-- 计划列表 -->
    <div class="plans-list">
      <div class="list-header">
        <FileText :size="20" />
        <h3>我的计划</h3>
      </div>
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
                class="action-btn status-btn"
                :title="getStatusButtonTitle(plan.status)"
              >
                <component :is="getStatusIcon(plan.status)" :size="16" />
              </button>
              <button 
                @click="planStore.deletePlan(plan.id)"
                class="action-btn delete-btn"
                title="删除计划"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
          
          <p class="plan-description">{{ plan.description }}</p>
          
          <div class="plan-meta">
            <div class="priority-badge">
              <component :is="getPriorityIcon(plan.priority)" :size="12" />
              <span>{{ getPriorityText(plan.priority) }}</span>
            </div>
            <div class="status-badge">
              <component :is="getStatusIcon(plan.status)" :size="12" />
              <span>{{ getStatusText(plan.status) }}</span>
            </div>
          </div>
          
          <div class="plan-date">
            <Calendar :size="12" />
            <span>创建于: {{ formatDate(plan.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlanStore } from '../stores/planStore'
import { 
  ClipboardList, 
  Clock, 
  Play, 
  CheckCircle, 
  Plus, 
  FileText, 
  Trash2, 
  Calendar,
  Circle,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  Minus
} from 'lucide-vue-next'

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
    'todo': Circle,
    'progress': PlayCircle,
    'completed': CheckCircle2
  }
  return icons[status] || Circle
}

const getPriorityIcon = (priority) => {
  const icons = {
    'low': Minus,
    'medium': Minus,
    'high': ArrowUp
  }
  return icons[priority] || Minus
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
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1px;
  background: #E5E5E5;
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #FFFFFF;
  transition: background-color 0.2s;
}

.stat-item:hover {
  background: #F8F9FA;
}

.stat-icon {
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: #333333;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #666666;
  font-weight: 400;
}

.add-plan-form {
  background: #F8F9FA;
  padding: 24px;
  border-bottom: 1px solid #E5E5E5;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.form-header h3 {
  color: #333333;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  background: #FFFFFF;
  color: #333333;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #333333;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #333333;
  color: #FFFFFF;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.add-btn:hover {
  background: #222222;
  transform: translateY(-1px);
}

.plans-list {
  padding: 24px;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.list-header h3 {
  color: #333333;
  font-size: 1.25rem;
  font-weight: 600;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.plan-item {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
  position: relative;
}

.plan-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.plan-item.status-completed {
  border-color: #999999;
  background: #FAFAFA;
}

.plan-item.status-progress {
  border-color: #666666;
  background: #FFFFFF;
}

.plan-item.priority-high {
  border-left: 4px solid #333333;
}

.plan-item.priority-medium {
  border-left: 4px solid #666666;
}

.plan-item.priority-low {
  border-left: 4px solid #999999;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.plan-header h4 {
  margin: 0;
  color: #333333;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
}

.plan-actions {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #666666;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #F0F0F0;
  color: #333333;
}

.delete-btn:hover {
  color: #DC3545;
}

.plan-description {
  color: #666666;
  margin-bottom: 16px;
  line-height: 1.5;
  font-size: 0.875rem;
}

.plan-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.priority-badge,
.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #F0F0F0;
  color: #666666;
}

.plan-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #999999;
}

@media (max-width: 768px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .plan-actions {
    margin-left: 0;
  }
}
</style> 