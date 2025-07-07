<template>
  <div class="communication-card">
    <div class="communication-overview">
      <div class="overview-header">
        <h4>通讯管理</h4>
        <div class="communication-status">
          <span class="status-badge pending" v-if="pendingTasks.length > 0">
            {{ pendingTasks.length }}个待处理
          </span>
        </div>
      </div>

      <!-- 邮件管理 -->
      <div class="email-section">
        <div class="section-header">
          <Mail :size="16" />
          <span>邮件管理</span>
        </div>
        
        <div class="email-tasks">
          <div v-for="task in data.emailTasks" :key="task.id" class="email-task">
            <div class="task-header">
              <div class="task-type">
                <span class="type-badge" :class="task.type">{{ task.typeText }}</span>
              </div>
              <div class="task-status">
                <span class="status" :class="task.status">{{ task.statusText }}</span>
              </div>
            </div>
            
            <div class="task-content">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-details">
                <span class="recipient">收件人: {{ task.recipient }}</span>
                <span class="priority" v-if="task.priority">优先级: {{ task.priority }}</span>
              </div>
              <div class="task-preview" v-if="task.preview">
                <span class="preview-text">{{ task.preview }}</span>
              </div>
            </div>
            
            <div class="task-actions">
              <button 
                class="action-btn primary" 
                @click="handleEmailAction(task.id, 'send')"
                v-if="task.status === 'draft'"
              >
                <Send :size="14" />
                发送
              </button>
              <button 
                class="action-btn secondary" 
                @click="handleEmailAction(task.id, 'edit')"
                v-if="task.status === 'draft'"
              >
                <Edit :size="14" />
                编辑
              </button>
              <button 
                class="action-btn secondary" 
                @click="handleEmailAction(task.id, 'view')"
                v-if="task.status === 'sent'"
              >
                <Eye :size="14" />
                查看
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知管理 -->
      <div class="notification-section">
        <div class="section-header">
          <Bell :size="16" />
          <span>通知管理</span>
        </div>
        
        <div class="notification-tasks">
          <div v-for="notification in data.notifications" :key="notification.id" class="notification-task">
            <div class="notification-header">
              <div class="notification-type">
                <span class="type-badge" :class="notification.type">{{ notification.typeText }}</span>
              </div>
              <div class="notification-time">
                <span class="time">{{ notification.scheduledTime }}</span>
              </div>
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-details">
                <span class="recipient">接收人: {{ notification.recipient }}</span>
                <span class="method">方式: {{ notification.method }}</span>
              </div>
              <div class="notification-message" v-if="notification.message">
                <span class="message-text">{{ notification.message }}</span>
              </div>
            </div>
            
            <div class="notification-actions">
              <button 
                class="action-btn primary" 
                @click="handleNotificationAction(notification.id, 'send')"
                v-if="notification.status === 'pending'"
              >
                <Send :size="14" />
                立即发送
              </button>
              <button 
                class="action-btn secondary" 
                @click="handleNotificationAction(notification.id, 'edit')"
                v-if="notification.status === 'pending'"
              >
                <Edit :size="14" />
                编辑
              </button>
              <button 
                class="action-btn danger" 
                @click="handleNotificationAction(notification.id, 'cancel')"
                v-if="notification.status === 'pending'"
              >
                <X :size="14" />
                取消
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 自动回复设置 -->
      <div class="auto-reply-section">
        <div class="section-header">
          <Settings :size="16" />
          <span>自动回复设置</span>
        </div>
        
        <div class="auto-reply-content">
          <div class="auto-reply-status">
            <div class="status-toggle">
              <input 
                type="checkbox" 
                :id="'auto-reply-toggle'" 
                :checked="data.autoReply.enabled"
                @change="toggleAutoReply"
              />
              <label :for="'auto-reply-toggle'">
                {{ data.autoReply.enabled ? '已启用' : '已禁用' }}
              </label>
            </div>
          </div>
          
          <div class="auto-reply-message" v-if="data.autoReply.enabled">
            <div class="message-preview">
              <span class="preview-label">自动回复内容:</span>
              <span class="preview-text">{{ data.autoReply.message }}</span>
            </div>
            <button class="action-btn secondary" @click="editAutoReply">
              <Edit :size="14" />
              编辑内容
            </button>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <div class="section-header">
          <Zap :size="16" />
          <span>快速操作</span>
        </div>
        
        <div class="action-buttons">
          <button class="quick-action-btn" @click="createEmailTask('conflict')">
            <Mail :size="16" />
            草拟冲突调整邮件
          </button>
          <button class="quick-action-btn" @click="createEmailTask('notification')">
            <Bell :size="16" />
            发送出差通知
          </button>
          <button class="quick-action-btn" @click="createEmailTask('client')">
            <Users :size="16" />
            联系客户确认
          </button>
          <button class="quick-action-btn" @click="setupAutoReply">
            <Settings :size="16" />
            设置自动回复
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Mail, 
  Bell, 
  Settings, 
  Send, 
  Edit, 
  Eye, 
  X, 
  Zap, 
  Users 
} from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      emailTasks: [],
      notifications: [],
      autoReply: {
        enabled: false,
        message: ''
      }
    })
  }
})

const emit = defineEmits(['update'])

const pendingTasks = computed(() => {
  return props.data.emailTasks.filter(task => task.status === 'draft').length +
         props.data.notifications.filter(notification => notification.status === 'pending').length
})

const handleEmailAction = (taskId, action) => {
  emit('update', {
    ...props.data,
    action: 'email',
    taskId,
    action
  })
}

const handleNotificationAction = (notificationId, action) => {
  emit('update', {
    ...props.data,
    action: 'notification',
    notificationId,
    action
  })
}

const toggleAutoReply = () => {
  const updatedAutoReply = {
    ...props.data.autoReply,
    enabled: !props.data.autoReply.enabled
  }
  
  emit('update', {
    ...props.data,
    autoReply: updatedAutoReply
  })
}

const editAutoReply = () => {
  emit('update', {
    ...props.data,
    action: 'editAutoReply'
  })
}

const createEmailTask = (type) => {
  emit('update', {
    ...props.data,
    action: 'createEmailTask',
    type
  })
}

const setupAutoReply = () => {
  emit('update', {
    ...props.data,
    action: 'setupAutoReply'
  })
}
</script>

<style scoped>
.communication-card {
  padding: 20px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E5E5;
}

.communication-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.overview-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.communication-status {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #FEF3C7;
  color: #D97706;
  border: 1px solid #FCD34D;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333333;
}

.email-tasks,
.notification-tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-task,
.notification-task {
  padding: 16px;
  background: #F8F9FA;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
}

.task-header,
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.type-badge.conflict {
  background: #FEF2F2;
  color: #DC2626;
}

.type-badge.notification {
  background: #F0F9FF;
  color: #0369A1;
}

.type-badge.client {
  background: #F0FDF4;
  color: #16A34A;
}

.status {
  font-size: 0.875rem;
  font-weight: 500;
}

.status.draft {
  color: #D97706;
}

.status.sent {
  color: #16A34A;
}

.status.pending {
  color: #0369A1;
}

.task-content,
.notification-content {
  margin-bottom: 12px;
}

.task-title,
.notification-title {
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.task-details,
.notification-details {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 8px;
}

.task-preview,
.notification-message {
  font-size: 0.875rem;
  color: #666666;
  font-style: italic;
}

.task-actions,
.notification-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #0369A1;
  color: #FFFFFF;
  border-color: #0369A1;
}

.action-btn.primary:hover {
  background: #075985;
}

.action-btn.secondary {
  background: #FFFFFF;
  color: #666666;
}

.action-btn.secondary:hover {
  background: #F8F9FA;
}

.action-btn.danger {
  background: #FFFFFF;
  color: #DC2626;
  border-color: #FECACA;
}

.action-btn.danger:hover {
  background: #FEF2F2;
}

.auto-reply-content {
  padding: 16px;
  background: #F8F9FA;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
}

.auto-reply-status {
  margin-bottom: 12px;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #0369A1;
}

.status-toggle label {
  font-size: 0.875rem;
  color: #333333;
  cursor: pointer;
}

.auto-reply-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.message-preview {
  flex: 1;
}

.preview-label {
  font-size: 0.875rem;
  color: #666666;
  margin-right: 8px;
}

.preview-text {
  font-size: 0.875rem;
  color: #333333;
}

.quick-actions {
  margin-top: 8px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: #F8F9FA;
  border-color: #CCCCCC;
}
</style> 