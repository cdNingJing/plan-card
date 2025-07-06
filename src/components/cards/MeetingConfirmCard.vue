<template>
  <div class="meeting-confirm-card">
    <div class="confirm-header">
      <h3>会议确认</h3>
      <p>请确认会议信息，点击发送按钮将会议提醒发送给所有参与者</p>
      <div class="mock-notice">
        <span class="mock-badge">模拟模式</span>
        <span class="mock-text">邮件将发送到: 1310569600@qq.com</span>
      </div>
    </div>
    
    <div class="meeting-summary">
      <div class="summary-item">
        <span class="label">会议主题</span>
        <span class="value">{{ meetingInfo.meetingTitle }}</span>
      </div>
      
      <div class="summary-item">
        <span class="label">会议时间</span>
        <span class="value">{{ formatMeetingTime() }}</span>
      </div>
      
      <div class="summary-item">
        <span class="label">会议地点</span>
        <span class="value">{{ meetingInfo.location || '未设置' }}</span>
      </div>
      
      <div class="summary-item">
        <span class="label">参会人员</span>
        <span class="value">{{ formatParticipants() }}</span>
      </div>
    </div>
    
    <div class="confirm-actions">
      <button 
        @click="handleSendMeetingReminder"
        :disabled="sending"
        class="send-btn"
        :class="{ loading: sending }"
      >
        <span v-if="!sending">
          <Mail :size="16" />
          发送会议提醒
        </span>
        <span v-else>
          <div class="loading-spinner"></div>
          正在发送...
        </span>
      </button>
    </div>
    
    <!-- 发送状态提示 -->
    <div v-if="sendStatus" class="send-status" :class="sendStatus.type">
      <div class="status-icon">
        <CheckCircle v-if="sendStatus.type === 'success'" :size="20" />
        <XCircle v-else :size="20" />
      </div>
      <div class="status-content">
        <div class="status-title">{{ sendStatus.title }}</div>
        <div class="status-message">{{ sendStatus.message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Mail, CheckCircle, XCircle } from 'lucide-vue-next'
import { useUserInfoStore } from '@/stores/userInfoStore.js'
import { sendMeetingReminder } from '@/api/meetingApi.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const userInfoStore = useUserInfoStore()
const sending = ref(false)
const sendStatus = ref(null)

// 获取会议信息
const meetingInfo = computed(() => {
  return userInfoStore.getScenarioInfo('meeting') || {}
})

// 格式化会议时间
const formatMeetingTime = () => {
  const { meetingDate, startTime, duration } = meetingInfo.value
  
  if (!meetingDate || !startTime) {
    return '时间未设置'
  }
  
  const date = new Date(meetingDate)
  const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`
  const time = startTime
  const durationText = duration ? ` (${duration}分钟)` : ''
  
  return `${formattedDate} ${time}${durationText}`
}

// 格式化参会人员
const formatParticipants = () => {
  const { participants } = meetingInfo.value
  
  if (!participants) {
    return '未设置'
  }
  
  // 如果是字符串，按行分割
  const emails = typeof participants === 'string' 
    ? participants.split('\n').filter(email => email.trim())
    : Array.isArray(participants) ? participants : []
  
  if (emails.length === 0) {
    return '未设置'
  }
  
  return `${emails.length}人 (${emails.slice(0, 2).join(', ')}${emails.length > 2 ? '...' : ''})`
}

// 发送会议提醒
const handleSendMeetingReminder = async () => {
  if (sending.value) return
  
  // 验证必填信息
  const { meetingTitle, meetingDate, startTime, participants } = meetingInfo.value
  
  if (!meetingTitle || !meetingDate || !startTime || !participants) {
    sendStatus.value = {
      type: 'error',
      title: '信息不完整',
      message: '请先完善会议基础信息'
    }
    return
  }
  
  sending.value = true
  sendStatus.value = null
  
  try {
    // 准备发送数据
    const emailData = {
      title: meetingTitle,
      date: meetingDate,
      time: startTime,
      location: meetingInfo.value.location || '',
      duration: meetingInfo.value.duration || '60',
      attendees: typeof participants === 'string' 
        ? participants.split('\n').filter(email => email.trim())
        : participants
    }
    
    // 调用发送API
    const result = await sendMeetingReminder(emailData)
    
    if (result.success) {
      sendStatus.value = {
        type: 'success',
        title: '发送成功',
        message: `会议提醒已发送给 ${emailData.attendees.length} 位参与者，目标邮箱: 1310569600@qq.com`
      }
      
      // 通知父组件发送成功
      emit('update', {
        action: 'meetingReminderSent',
        data: emailData,
        success: true
      })
    } else {
      throw new Error(result.error || '发送失败')
    }
  } catch (error) {
    console.error('发送会议提醒失败:', error)
    sendStatus.value = {
      type: 'error',
      title: '发送失败',
      message: error.message || '网络错误，请稍后重试'
    }
    
    // 通知父组件发送失败
    emit('update', {
      action: 'meetingReminderFailed',
      error: error.message
    })
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  userInfoStore.loadFromStorage()
})
</script>

<style scoped>
.meeting-confirm-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.confirm-header {
  text-align: center;
  margin-bottom: 24px;
}

.confirm-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.confirm-header p {
  font-size: 0.9rem;
  color: #666666;
  line-height: 1.4;
}

.mock-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
}

.mock-badge {
  background: #f39c12;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.mock-text {
  font-size: 0.8rem;
  color: #856404;
}

.meeting-summary {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E5E5E5;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  font-size: 0.875rem;
  color: #666666;
  font-weight: 500;
}

.summary-item .value {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3182ce;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  background: #CBD5E0;
  cursor: not-allowed;
}

.send-btn.loading {
  background: #3182ce;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #FFFFFF;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.send-status {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.send-status.success {
  background: #E8F5E8;
  border: 1px solid #4CAF50;
}

.send-status.error {
  background: #FFEBEE;
  border: 1px solid #F44336;
}

.status-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.send-status.success .status-icon {
  color: #4CAF50;
}

.send-status.error .status-icon {
  color: #F44336;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.send-status.success .status-title {
  color: #2E7D32;
}

.send-status.error .status-title {
  color: #C62828;
}

.status-message {
  font-size: 0.875rem;
  line-height: 1.4;
}

.send-status.success .status-message {
  color: #388E3C;
}

.send-status.error .status-message {
  color: #D32F2F;
}
</style> 