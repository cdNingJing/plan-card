<template>
  <div class="meeting-result-card">
    <div class="meeting-result-header">
      <div class="meeting-result-title">
        <h4>会议发送结果</h4>
        <p>会议邀请已成功发送给所有参会人员</p>
      </div>
    </div>

    <div class="meeting-result-content">

      <!-- 历史记录 -->
      <div class="meeting-history-section" v-if="meetingHistory.length > 0">
        <div class="history-header">
          <h5>历史发送记录 ({{ meetingHistory.length }})</h5>
          <button 
            @click="clearHistory" 
            class="clear-history-btn"
          >
            <Trash2 :size="14" />
            清空记录
          </button>
        </div>
        
        <div class="meeting-history-list">
          <div 
            v-for="meeting in meetingHistory.slice(0, 3)" 
            :key="meeting.id"
            class="meeting-history-item"
          >
            <div class="meeting-history-header">
              <div class="meeting-history-title">
                <h6>{{ meeting.meetingTitle || '未设置会议主题' }}</h6>
                <span class="meeting-history-status">已发送</span>
              </div>
              <div class="meeting-history-time">
                {{ formatSendTime(meeting.sentAt) }}
              </div>
            </div>
            
            <div class="meeting-history-details">
              <div class="meeting-history-info">
                <div class="meeting-info-item">
                  <Calendar :size="14" />
                  <span>{{ formatMeetingDateTime(meeting) }}</span>
                </div>
                <div class="meeting-info-item" v-if="meeting.location">
                  <MapPin :size="14" />
                  <span>{{ meeting.location }}</span>
                </div>
                <div class="meeting-info-item">
                  <Users :size="14" />
                  <span>{{ meeting.attendeesCount || 0 }} 位参会人员</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="meeting-result-actions">
      <button class="meeting-result-btn primary" @click="viewAllHistory">
        <Eye :size="16" />
        查看全部记录
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  CheckCircle, Mail, Clock, Users, Calendar, MapPin, User, 
  FileText, Bell, Plus, Eye, Trash2, RefreshCw 
} from 'lucide-vue-next'
import { MeetingStorage } from '@/utils/meetingStorage.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'next'])

// 会议历史记录
const meetingHistory = ref([])
// 当前发送的会议信息
const currentMeeting = ref(null)

// 加载会议历史记录
const loadMeetingHistory = () => {
  meetingHistory.value = MeetingStorage.getAllMeetings()
  console.log('[MeetingResultCard] 加载会议历史记录:', meetingHistory.value.length, '条')
}

// 获取当前发送的会议信息（最新的记录）
const loadCurrentMeeting = () => {
  const allMeetings = MeetingStorage.getAllMeetings()
  if (allMeetings.length > 0) {
    currentMeeting.value = allMeetings[0] // 最新的记录
    console.log('[MeetingResultCard] 当前会议信息:', currentMeeting.value)
  }
}

// 处理参会人员邮箱列表
const participantEmails = computed(() => {
  if (!currentMeeting.value || !currentMeeting.value.participants) {
    return []
  }
  
  // 如果是字符串，按换行符分割
  if (typeof currentMeeting.value.participants === 'string') {
    return currentMeeting.value.participants.split('\n').filter(email => email.trim())
  }
  
  // 如果是数组，直接返回
  if (Array.isArray(currentMeeting.value.participants)) {
    return currentMeeting.value.participants
  }
  
  return []
})

// 格式化发送时间
const formatSendTime = (timeString) => {
  if (!timeString) return '刚刚'
  const date = new Date(timeString)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 格式化会议日期时间
const formatMeetingDateTime = (meeting) => {
  if (!meeting.meetingDate) return '时间未设置'
  
  const date = new Date(meeting.meetingDate)
  const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`
  
  if (meeting.startTime) {
    return `${formattedDate} ${meeting.startTime}`
  }
  
  return formattedDate
}

// 查看会议详情
const viewMeetingDetail = (meeting) => {
  emit('update', {
    action: 'viewMeetingDetail',
    meeting: meeting
  })
}

// 删除会议记录
const deleteMeeting = (meetingId) => {
  if (confirm('确定要删除这条会议记录吗？')) {
    const success = MeetingStorage.deleteMeeting(meetingId)
    if (success) {
      loadMeetingHistory() // 重新加载历史记录
      loadCurrentMeeting() // 重新加载当前会议信息
      console.log('[MeetingResultCard] 会议记录已删除:', meetingId)
    }
  }
}

// 清空所有记录
const clearHistory = () => {
  if (confirm('确定要清空所有会议记录吗？此操作不可恢复。')) {
    const success = MeetingStorage.clearAllMeetings()
    if (success) {
      meetingHistory.value = []
      currentMeeting.value = null
      console.log('[MeetingResultCard] 所有会议记录已清空')
    }
  }
}

// 查看全部历史记录
const viewAllHistory = () => {
  emit('update', {
    action: 'viewAllHistory',
    message: '查看全部会议记录'
  })
}

// 创建新会议
const createNewMeeting = () => {
  emit('update', {
    action: 'createNewMeeting',
    message: '开始创建新会议'
  })
}

// 定时器引用
let updateInterval = null

onMounted(() => {
  // 组件挂载时加载会议历史记录和当前会议信息
  loadMeetingHistory()
  loadCurrentMeeting()
  console.log('[MeetingResultCard] 会议结果卡片已挂载')
  
  // 监听存储变化，自动更新当前会议信息
  const checkForUpdates = () => {
    const allMeetings = MeetingStorage.getAllMeetings()
    if (allMeetings.length > 0) {
      const latestMeeting = allMeetings[0]
      if (!currentMeeting.value || currentMeeting.value.id !== latestMeeting.id) {
        console.log('[MeetingResultCard] 检测到新的会议记录，自动更新')
        loadMeetingHistory()
        loadCurrentMeeting()
      }
    }
  }
  
  // 定期检查更新（每2秒检查一次）
  updateInterval = setInterval(checkForUpdates, 2000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
})
</script>

<style scoped>
.meeting-result-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(49,130,206,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.meeting-result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 100%);
  border-bottom: 1px solid #C6F6D5;
}

.meeting-result-icon {
  width: 40px;
  height: 40px;
  background: #48BB78;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.meeting-result-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #22543D;
}

.meeting-result-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #38A169;
}

.meeting-result-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.current-meeting-section,
.attendees-section,
.meeting-history-section {
  margin-bottom: 24px;
}

.current-meeting-section:last-child,
.attendees-section:last-child,
.meeting-history-section:last-child {
  margin-bottom: 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
}

.clear-history-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  background: #FFFFFF;
  color: #718096;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-history-btn:hover {
  background: #F7FAFC;
  color: #E53E3E;
  border-color: #FEB2B2;
}

/* 当前会议卡片样式 */
.current-meeting-card {
  background: #F0FFF4;
  border: 1px solid #C6F6D5;
  border-radius: 8px;
  overflow: hidden;
}

.current-meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #E6FFFA;
  border-bottom: 1px solid #C6F6D5;
}

.current-meeting-header h6 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #22543D;
}

.current-meeting-status {
  background: #48BB78;
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.current-meeting-details {
  padding: 16px;
}

/* 参会人员列表样式 */
.attendees-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attendee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.attendee-avatar {
  width: 28px;
  height: 28px;
  background: #3182CE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.attendee-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.attendee-email {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2D3748;
}

.attendee-status {
  font-size: 0.75rem;
  color: #48BB78;
  font-weight: 500;
}

.result-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.result-summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}

.result-summary-item.success {
  background: #F0FFF4;
  border-color: #C6F6D5;
}

.result-summary-item.info {
  background: #F0F9FF;
  border-color: #BEE3F8;
}

.result-summary-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-summary-item.success .result-summary-icon {
  background: #48BB78;
  color: #FFFFFF;
}

.result-summary-item.info .result-summary-icon {
  background: #3182CE;
  color: #FFFFFF;
}

.result-summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.result-summary-label {
  font-size: 0.75rem;
  color: #718096;
}

.result-summary-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3748;
}

.meeting-review-card {
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
}

.meeting-review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #EDF2F7;
  border-bottom: 1px solid #E2E8F0;
}

.meeting-review-header h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
}

.meeting-review-status {
  background: #48BB78;
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.meeting-review-details {
  padding: 16px;
}

.meeting-review-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #4A5568;
}

.meeting-review-item:last-child {
  margin-bottom: 0;
}

.attendees-review-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attendee-review-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.attendee-review-avatar {
  width: 28px;
  height: 28px;
  background: #3182CE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.attendee-review-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.attendee-review-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2D3748;
}

.attendee-review-email {
  font-size: 0.75rem;
  color: #718096;
}

.attendee-review-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #48BB78;
  font-size: 0.75rem;
  font-weight: 500;
}

.next-actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.next-action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.next-action-item:hover {
  background: #EDF2F7;
  border-color: #CBD5E0;
}

.next-action-icon {
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

.next-action-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.next-action-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2D3748;
}

.next-action-desc {
  font-size: 0.75rem;
  color: #718096;
}

.meeting-result-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #F7FAFC;
  border-top: 1px solid #E2E8F0;
}

.meeting-result-btn {
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

.meeting-result-btn.primary {
  background: #3182CE;
  color: #FFFFFF;
  border-color: #3182CE;
}

.meeting-result-btn.primary:hover {
  background: #2563EB;
  border-color: #2563EB;
}

.meeting-result-btn.secondary {
  background: #FFFFFF;
  color: #718096;
}

.meeting-result-btn.secondary:hover {
  background: #F7FAFC;
  color: #2D3748;
}

/* 空状态样式 */
.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-history p {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.empty-hint {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* 会议历史列表样式 */
.meeting-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meeting-history-item {
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.meeting-history-item:hover {
  border-color: #CBD5E0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.meeting-history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #EDF2F7;
  border-bottom: 1px solid #E2E8F0;
}

.meeting-history-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.meeting-history-title h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
}

.meeting-history-status {
  background: #48BB78;
  color: #FFFFFF;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.meeting-history-time {
  font-size: 0.75rem;
  color: #718096;
  white-space: nowrap;
}

.meeting-history-details {
  padding: 16px;
}

.meeting-history-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.meeting-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #4A5568;
}

.meeting-history-actions {
  display: flex;
  gap: 8px;
}

.history-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  background: #FFFFFF;
  color: #718096;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.history-action-btn:hover {
  background: #F7FAFC;
  border-color: #CBD5E0;
}

.history-action-btn.delete:hover {
  background: #FED7D7;
  color: #E53E3E;
  border-color: #FEB2B2;
}
</style> 