<template>
  <div class="meeting-summary-card">
    <div class="meeting-summary-header">
      <div class="meeting-summary-icon">
        <FileText :size="20" />
      </div>
      <div class="meeting-summary-title">
        <h4>会议邀请函</h4>
        <p>基于您输入的信息生成的会议邀请文档</p>
      </div>
    </div>

    <div class="meeting-summary-content">
      <!-- 会议邀请文档 -->
      <div class="meeting-document">
        <div class="document-header">
          <h3 class="document-title">{{ formattedMeetingInfo.title }}</h3>
          <div class="document-subtitle">会议邀请函</div>
        </div>
        
        <div class="document-body">
          <div class="document-section">
            <h4>会议时间</h4>
            <p>{{ formattedMeetingInfo.dateTime }}</p>
          </div>
          
          <div class="document-section">
            <h4>会议地点</h4>
            <p>{{ formattedMeetingInfo.location }}</p>
          </div>
          
          <div class="document-section">
            <h4>会议时长</h4>
            <p>{{ formattedMeetingInfo.duration }}</p>
          </div>
          
          <div class="document-section">
            <h4>参会人员</h4>
            <div class="participants-list">
              <div 
                v-for="(participant, index) in formattedMeetingInfo.participants" 
                :key="index"
                class="participant-item"
              >
                <Mail :size="14" />
                <span>{{ participant }}</span>
              </div>
            </div>
          </div>
          
          <div class="document-section" v-if="formattedMeetingInfo.description">
            <h4>会议详情</h4>
            <p>{{ formattedMeetingInfo.description }}</p>
          </div>
          
          <div class="document-footer">
            <p class="footer-note">
              此邀请函将发送给所有参会人员，请确认信息无误后点击发送。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="meeting-summary-actions">
      <button 
        class="meeting-action-btn primary"
        @click="sendMeetingReminder"
        :disabled="sending || !canSend"
      >
        <Send :size="16" />
        {{ sending ? '发送中...' : '发送会议邀请' }}
      </button>
    </div>

    <!-- 发送状态提示 -->
    <div v-if="sendStatus" class="meeting-send-status" :class="sendStatus.type">
      <div class="status-icon">
        <CheckCircle v-if="sendStatus.type === 'success'" :size="16" />
        <AlertCircle v-else-if="sendStatus.type === 'error'" :size="16" />
        <Loader v-else :size="16" />
      </div>
      <span class="status-message">{{ sendStatus.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { FileText, Mail, Send, CheckCircle, AlertCircle, Loader } from 'lucide-vue-next'
import { sendMeetingReminder as sendMeetingReminderApi } from '@/api/meetingApi.js'
import { useUserInfoStore } from '@/stores/userInfoStore.js'
import { MeetingStorage } from '@/utils/meetingStorage.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'next'])

const userInfoStore = useUserInfoStore()

const sending = ref(false)
const sendStatus = ref(null)

// 获取会议信息
const meetingInfo = computed(() => {
  return userInfoStore.getScenarioInfo('meeting') || {}
})

// 格式化会议信息用于文档显示
const formattedMeetingInfo = computed(() => {
  const info = meetingInfo.value
  
  // 处理参会人员
  let participants = []
  if (info.participants) {
    // 如果是字符串，按换行符分割
    if (typeof info.participants === 'string') {
      participants = info.participants.split('\n').filter(p => p.trim())
    } else if (Array.isArray(info.participants)) {
      participants = info.participants
    }
  }
  
  // 格式化日期时间
  const dateTime = info.meetingDate 
    ? (info.startTime ? `${info.meetingDate} ${info.startTime}` : info.meetingDate)
    : '未设置'
  
  // 格式化时长
  const duration = info.duration 
    ? `${info.duration} 小时`
    : '未设置'
  
  return {
    title: info.meetingTitle || '未设置会议主题',
    dateTime: dateTime,
    location: info.location || '未设置地点',
    duration: duration,
    participants: participants,
    description: info.description || ''
  }
})

// 检查是否可以发送
const canSend = computed(() => {
  const info = meetingInfo.value
  // 只要有会议主题、日期和参会人员就可以发送，具体时间不是必选项
  return info.meetingTitle && info.meetingDate && info.participants
})

// 发送会议提醒
const sendMeetingReminder = async () => {
  if (!canSend.value || sending.value) return

  sending.value = true
  sendStatus.value = {
    type: 'loading',
    message: '正在发送会议提醒...'
  }

  try {
    const result = await sendMeetingReminderApi(meetingInfo.value)
    
    if (result.success) {
      sendStatus.value = {
        type: 'success',
        message: result.message || '会议邀请发送成功！'
      }
      
      // 保存会议记录到本地存储
      const meetingRecord = {
        meetingTitle: meetingInfo.value.meetingTitle,
        meetingDate: meetingInfo.value.meetingDate,
        startTime: meetingInfo.value.startTime,
        duration: meetingInfo.value.duration,
        location: meetingInfo.value.location,
        participants: meetingInfo.value.participants,
        attendeesCount: result.data?.attendeesCount || 0,
        sendResult: result
      }
      
      const savedMeeting = MeetingStorage.addMeeting(meetingRecord)
      console.log('[MeetingSummaryCard] 会议记录已保存:', savedMeeting)
      
      // 通知父组件发送成功，可以进入下一个卡片
      emit('update', {
        action: 'meetingReminderSent',
        success: true,
        meetingInfo: meetingInfo.value,
        result: result,
        savedMeeting: savedMeeting
      })
      
      // 延迟进入下一个卡片
      setTimeout(() => {
        emit('next')
      }, 3000)
    } else {
      throw new Error(result.message || '发送失败')
    }
  } catch (error) {
    console.error('发送会议提醒失败:', error)
    sendStatus.value = {
      type: 'error',
      message: `发送失败: ${error.message}`
    }
    
    emit('update', {
      action: 'meetingReminderFailed',
      error: error.message
    })
  } finally {
    sending.value = false
  }
}

// 移除编辑功能，只保留发送功能

// 监听props变化
watch(() => props.data, (newData) => {
  if (newData.action === 'reset') {
    sendStatus.value = null
  }
}, { deep: true })

// 监听会议信息变化，确保实时更新
watch(() => meetingInfo.value, (newInfo) => {
  console.log('[MeetingSummaryCard] 会议信息已更新:', newInfo)
}, { deep: true })
</script>

<style scoped>
.meeting-summary-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(49,130,206,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.meeting-summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  border-bottom: 1px solid #E2E8F0;
}

.meeting-summary-icon {
  width: 40px;
  height: 40px;
  background: #4A5568;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.meeting-summary-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D3748;
}

.meeting-summary-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #718096;
}

.meeting-summary-content {
  padding: 20px;
  flex: 1;
}

.meeting-document {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.document-header {
  background: linear-gradient(135deg, #4A5568 0%, #2D3748 100%);
  color: #FFFFFF;
  padding: 24px;
  text-align: center;
}

.document-title {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #FFFFFF;
}

.document-subtitle {
  font-size: 0.875rem;
  color: #CBD5E0;
  font-weight: 500;
}

.document-body {
  padding: 24px;
}

.document-section {
  margin-bottom: 20px;
}

.document-section:last-child {
  margin-bottom: 0;
}

.document-section h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.document-section p {
  margin: 0;
  font-size: 0.875rem;
  color: #4A5568;
  line-height: 1.5;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F7FAFC;
  border-radius: 6px;
  border: 1px solid #E2E8F0;
  font-size: 0.875rem;
  color: #4A5568;
}

.participant-item svg {
  color: #718096;
  flex-shrink: 0;
}

.document-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}

.footer-note {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
  text-align: center;
  margin: 0;
}

.meeting-summary-actions {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #F7FAFC;
  border-top: 1px solid #E2E8F0;
}

.meeting-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 32px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
}

.meeting-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.meeting-action-btn.primary {
  background: #4A5568;
  color: #FFFFFF;
  border-color: #4A5568;
}

.meeting-action-btn.primary:hover:not(:disabled) {
  background: #2D3748;
  border-color: #2D3748;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.meeting-send-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #E2E8F0;
  font-size: 0.875rem;
}

.meeting-send-status.success {
  background: #F0FFF4;
  color: #22543D;
}

.meeting-send-status.error {
  background: #FFF5F5;
  color: #742A2A;
}

.meeting-send-status.loading {
  background: #F0F9FF;
  color: #1E40AF;
}

.status-icon {
  flex-shrink: 0;
}

.status-message {
  flex: 1;
}
</style> 