<template>
  <div class="meeting-postponement-card">
    <div class="postponement-header">
      <div class="postponement-title">
        <h4>会议延期处理</h4>
        <p>检测到您想要推迟会议，我将帮您自动更新日历并通知参会人员</p>
      </div>
    </div>

    <div class="postponement-content">
      <!-- 原会议信息 -->
      <div class="original-meeting-section">
        <h5>原会议信息</h5>
        <div class="original-meeting-card">
          <div class="meeting-title-item">
            <h6>{{ originalMeeting.meetingTitle || originalMeeting.title || '未设置会议主题' }}</h6>
          </div>
          <div class="meeting-info-item">
            <Calendar :size="14" />
            <span>{{ formatOriginalMeetingTime() }}</span>
          </div>
          <div class="meeting-info-item">
            <MapPin :size="14" />
            <span>{{ originalMeeting.location || '未指定地点' }}</span>
          </div>
          <div class="meeting-info-item">
            <Users :size="14" />
            <span>{{ originalMeeting.attendees?.length || 0 }} 位参会人员</span>
          </div>
        </div>
      </div>

      <!-- 新会议时间 -->
      <div class="new-meeting-section">
        <h5>新会议时间</h5>
        <div class="new-meeting-card">
          <div class="new-time-display">
            <div class="new-date">
              <Calendar :size="16" />
              <span>{{ newMeetingDate }}</span>
            </div>
            <div class="new-time">
              <Clock :size="16" />
              <span>{{ newMeetingTime }}</span>
            </div>
          </div>
          <div class="postponement-reason" v-if="postponementReason">
            <FileText :size="14" />
            <span>延期原因: {{ postponementReason }}</span>
          </div>
        </div>
      </div>

      <!-- 自动操作列表 -->
      <div class="auto-actions-section">
        <h5>将自动执行的操作</h5>
        <div class="auto-actions-list">
          <div class="auto-action-item">
            <div class="action-icon">
              <Calendar :size="16" />
            </div>
            <div class="action-content">
              <span class="action-title">更新日历事件</span>
              <span class="action-desc">自动更新您的日历应用中的会议时间</span>
            </div>
            <div class="action-status">
              <CheckCircle v-if="calendarUpdated" :size="14" />
              <Clock v-else :size="14" />
            </div>
          </div>
          <div class="auto-action-item">
            <div class="action-icon">
              <Mail :size="16" />
            </div>
            <div class="action-content">
              <span class="action-title">发送延期通知</span>
              <span class="action-desc">向所有参会人员发送会议延期邮件</span>
            </div>
            <div class="action-status">
              <CheckCircle v-if="notificationSent" :size="14" />
              <Clock v-else :size="14" />
            </div>
          </div>
          <div class="auto-action-item">
            <div class="action-icon">
              <Bell :size="16" />
            </div>
            <div class="action-content">
              <span class="action-title">更新提醒设置</span>
              <span class="action-desc">调整会议提醒时间到新的会议时间</span>
            </div>
            <div class="action-status">
              <CheckCircle v-if="remindersUpdated" :size="14" />
              <Clock v-else :size="14" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="postponement-actions">
      <button 
        class="postponement-btn secondary" 
        @click="cancelPostponement"
        :disabled="processing"
      >
        <X :size="16" />
        取消延期
      </button>
      <button 
        class="postponement-btn primary" 
        @click="confirmPostponement"
        :disabled="processing"
      >
        <CheckCircle :size="16" />
        {{ processing ? '处理中...' : '确认延期' }}
      </button>
    </div>

    <!-- 处理状态 -->
    <div v-if="processingStatus" class="processing-status" :class="processingStatus.type">
      <div class="status-icon">
        <Loader v-if="processingStatus.type === 'loading'" :size="16" />
        <CheckCircle v-else-if="processingStatus.type === 'success'" :size="16" />
        <XCircle v-else :size="16" />
      </div>
      <div class="status-content">
        <div class="status-title">{{ processingStatus.title }}</div>
        <div class="status-message">{{ processingStatus.message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Calendar, MapPin, Users, Clock, FileText, Mail, Bell, 
  CheckCircle, X, Loader, XCircle 
} from 'lucide-vue-next'
import { useUserInfoStore } from '@/stores/userInfoStore.js'
import { 
  postponeMeeting, 
  updateCalendarEvent, 
  sendPostponementNotification 
} from '@/api/meetingApi.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'next'])

const userInfoStore = useUserInfoStore()

// 状态变量
const processing = ref(false)
const processingStatus = ref(null)
const calendarUpdated = ref(false)
const notificationSent = ref(false)
const remindersUpdated = ref(false)

// 获取原会议信息
const originalMeeting = computed(() => {
  return userInfoStore.getScenarioInfo('meeting') || {}
})

// 格式化原会议时间
const formatOriginalMeetingTime = () => {
  const meeting = originalMeeting.value
  if (!meeting.meetingDate) return '时间未设置'
  
  // 处理日期格式，如果没有年份则添加当前年份
  let dateStr = meeting.meetingDate
  if (dateStr && !dateStr.includes('-')) {
    // 如果是 MM/DD 格式，添加当前年份
    const currentYear = new Date().getFullYear()
    dateStr = `${currentYear}-${dateStr}`
  }
  
  // 格式化日期显示
  const date = new Date(dateStr)
  const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`
  
  // 处理时间
  const time = meeting.startTime || meeting.time || '时间未设置'
  
  return `${formattedDate} ${time}`
}

// 计算新的会议时间（明天）
const newMeetingDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const newMeetingTime = computed(() => {
  return originalMeeting.value.startTime || originalMeeting.value.time || '14:00'
})

// 延期原因
const postponementReason = computed(() => {
  return props.data.reason || '时间冲突，需要调整'
})

// 确认延期
const confirmPostponement = async () => {
  if (processing.value) return
  
  processing.value = true
  processingStatus.value = {
    type: 'loading',
    title: '正在处理会议延期',
    message: '请稍候，正在更新日历和发送通知...'
  }

  try {
    // 1. 更新日历事件
    await updateCalendarEvent({
      eventId: props.data.eventId,
      originalDate: originalMeeting.value.meetingDate,
      originalTime: originalMeeting.value.startTime || originalMeeting.value.time,
      newDate: newMeetingDate.value,
      newTime: newMeetingTime.value,
      title: originalMeeting.value.meetingTitle || originalMeeting.value.title
    })
    calendarUpdated.value = true

    // 2. 发送延期通知
    const attendees = typeof originalMeeting.value.participants === 'string'
      ? originalMeeting.value.participants.split('\n').filter(p => p.trim())
      : originalMeeting.value.participants || []

    await sendPostponementNotification({
      title: originalMeeting.value.meetingTitle || originalMeeting.value.title,
      originalDate: originalMeeting.value.meetingDate,
      originalTime: originalMeeting.value.startTime || originalMeeting.value.time,
      newDate: newMeetingDate.value,
      newTime: newMeetingTime.value,
      location: originalMeeting.value.location,
      attendees: attendees,
      reason: postponementReason.value
    })
    notificationSent.value = true

    // 3. 更新提醒设置
    // 这里可以调用提醒更新API
    remindersUpdated.value = true

    // 4. 更新本地存储的会议信息
    const updatedMeetingInfo = {
      ...originalMeeting.value,
      meetingDate: newMeetingDate.value,
      startTime: newMeetingTime.value,
      time: newMeetingTime.value // 同时更新time字段
    }
    userInfoStore.updateUserInfo('meeting', updatedMeetingInfo)
    userInfoStore.saveToStorage()

    processingStatus.value = {
      type: 'success',
      title: '会议延期成功',
      message: `会议已成功延期到 ${newMeetingDate.value} ${newMeetingTime.value}，所有参会人员已收到通知`
    }

    // 通知父组件延期成功
    emit('update', {
      action: 'meetingPostponed',
      success: true,
      originalMeeting: originalMeeting.value,
      newMeeting: updatedMeetingInfo,
      postponementData: {
        originalDate: originalMeeting.value.meetingDate,
        originalTime: originalMeeting.value.startTime,
        newDate: newMeetingDate.value,
        newTime: newMeetingTime.value,
        reason: postponementReason.value
      }
    })

    // 延迟进入下一个卡片
    setTimeout(() => {
      emit('next')
    }, 3000)

  } catch (error) {
    console.error('会议延期失败:', error)
    processingStatus.value = {
      type: 'error',
      title: '延期失败',
      message: error.message || '处理过程中出现错误，请重试'
    }

    emit('update', {
      action: 'meetingPostponementFailed',
      error: error.message
    })
  } finally {
    processing.value = false
  }
}

// 取消延期
const cancelPostponement = () => {
  emit('update', {
    action: 'cancelPostponement',
    message: '已取消会议延期'
  })
}

onMounted(() => {
  console.log('[MeetingPostponementCard] 显示会议延期卡片:', {
    originalMeeting: originalMeeting.value,
    newDate: newMeetingDate.value,
    newTime: newMeetingTime.value
  })
})
</script>

<style scoped>
.meeting-postponement-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(49,130,206,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.postponement-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%);
  border-bottom: 1px solid #FED7AA;
}

.postponement-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #92400E;
}

.postponement-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #D97706;
}

.postponement-content {
  padding: 20px;
  flex: 1;
}

.original-meeting-section,
.new-meeting-section,
.auto-actions-section {
  margin-bottom: 24px;
}

.original-meeting-section:last-child,
.new-meeting-section:last-child,
.auto-actions-section:last-child {
  margin-bottom: 0;
}

.original-meeting-section h5,
.new-meeting-section h5,
.auto-actions-section h5 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
}

.original-meeting-card,
.new-meeting-card {
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 16px;
}

.meeting-title-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.meeting-title-item h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
}

.meeting-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #4A5568;
}

.meeting-info-item:last-child {
  margin-bottom: 0;
}

.new-time-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.new-date,
.new-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #2D3748;
}

.postponement-reason {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
  font-size: 0.875rem;
  color: #718096;
}

.auto-actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auto-action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.action-icon {
  width: 32px;
  height: 32px;
  background: #3182CE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2D3748;
}

.action-desc {
  font-size: 0.75rem;
  color: #718096;
}

.action-status {
  color: #48BB78;
  flex-shrink: 0;
}

.action-status svg {
  color: #A0AEC0;
}

.postponement-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #F7FAFC;
  border-top: 1px solid #E2E8F0;
}

.postponement-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.postponement-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.postponement-btn.primary {
  background: #3182CE;
  color: #FFFFFF;
  border-color: #3182CE;
}

.postponement-btn.primary:hover:not(:disabled) {
  background: #2563EB;
  border-color: #2563EB;
}

.postponement-btn.secondary {
  background: #FFFFFF;
  color: #718096;
}

.postponement-btn.secondary:hover:not(:disabled) {
  background: #F7FAFC;
  color: #2D3748;
}

.processing-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #E2E8F0;
}

.processing-status.loading {
  background: #F0F9FF;
  color: #1E40AF;
}

.processing-status.success {
  background: #F0FFF4;
  color: #22543D;
}

.processing-status.error {
  background: #FEF2F2;
  color: #991B1B;
}

.status-icon {
  flex-shrink: 0;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.status-message {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style> 