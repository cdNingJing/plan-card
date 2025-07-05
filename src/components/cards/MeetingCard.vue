<template>
  <div class="meeting-card">
    <div class="meeting-header">
      <div class="meeting-info">
        <h3 class="meeting-title">{{ meeting.title }}</h3>
        <div class="meeting-time">
          <Calendar :size="16" />
          <span>{{ meeting.date }} {{ meeting.time }}</span>
        </div>
        <div class="meeting-location" v-if="meeting.location">
          <MapPin :size="16" />
          <span>{{ meeting.location }}</span>
        </div>
      </div>
      
      <div class="meeting-status">
        <span class="status-badge" :class="meeting.status">
          {{ getStatusText(meeting.status) }}
        </span>
      </div>
    </div>

    <div class="meeting-participants" v-if="meeting.participants && meeting.participants.length > 0">
      <h4>参与者</h4>
      <div class="participants-list">
        <div 
          v-for="participant in meeting.participants" 
          :key="participant.id"
          class="participant-item"
        >
          <div class="participant-avatar">
            <User :size="16" />
          </div>
          <div class="participant-info">
            <span class="participant-name">{{ participant.name }}</span>
            <span class="participant-role">{{ participant.role }}</span>
          </div>
          <div class="participant-status">
            <span class="status-dot" :class="participant.status"></span>
            <span class="status-text">{{ getParticipantStatusText(participant.status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="meeting-agenda" v-if="meeting.agenda && meeting.agenda.length > 0">
      <h4>会议议程</h4>
      <div class="agenda-list">
        <div 
          v-for="(item, index) in meeting.agenda" 
          :key="index"
          class="agenda-item"
        >
          <div class="agenda-time">{{ item.time }}</div>
          <div class="agenda-content">
            <div class="agenda-title">{{ item.title }}</div>
            <div class="agenda-description" v-if="item.description">{{ item.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="meeting-reminders" v-if="fullscreen">
      <h4>提醒设置</h4>
      <div class="reminder-options">
        <div class="reminder-item">
          <input 
            type="checkbox" 
            id="reminder-15min" 
            v-model="reminders.fifteenMin"
            @change="updateReminders"
          >
          <label for="reminder-15min">会议前15分钟提醒</label>
        </div>
        <div class="reminder-item">
          <input 
            type="checkbox" 
            id="reminder-1hour" 
            v-model="reminders.oneHour"
            @change="updateReminders"
          >
          <label for="reminder-1hour">会议前1小时提醒</label>
        </div>
        <div class="reminder-item">
          <input 
            type="checkbox" 
            id="reminder-1day" 
            v-model="reminders.oneDay"
            @change="updateReminders"
          >
          <label for="reminder-1day">会议前1天提醒</label>
        </div>
      </div>
    </div>

    <div class="meeting-attachments" v-if="meeting.attachments && meeting.attachments.length > 0">
      <h4>会议附件</h4>
      <div class="attachments-list">
        <div 
          v-for="attachment in meeting.attachments" 
          :key="attachment.id"
          class="attachment-item"
        >
          <FileText :size="16" />
          <span class="attachment-name">{{ attachment.name }}</span>
          <span class="attachment-size">{{ attachment.size }}</span>
          <button class="attachment-download" @click="downloadAttachment(attachment)">
            <Download :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div class="meeting-notes" v-if="fullscreen">
      <h4>会议笔记</h4>
      <textarea 
        v-model="notes"
        placeholder="在此记录会议要点..."
        class="notes-textarea"
        @input="updateNotes"
      ></textarea>
    </div>

    <div class="meeting-actions">
      <button 
        class="action-btn secondary" 
        @click="joinMeeting"
        v-if="meeting.meetingLink"
      >
        <Video :size="16" />
        加入会议
      </button>
      <button 
        class="action-btn secondary" 
        @click="addToCalendar"
      >
        <Calendar :size="16" />
        添加到日历
      </button>
      <button 
        class="action-btn primary" 
        @click="toggleReminder"
      >
        <Bell :size="16" />
        {{ reminderEnabled ? '关闭提醒' : '开启提醒' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Calendar, MapPin, User, FileText, Download, Video, Bell } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])

// 默认会议数据
const meeting = reactive({
  title: '项目进度讨论会',
  date: '2024-01-15',
  time: '15:00-16:00',
  location: '会议室A',
  status: 'scheduled',
  meetingLink: 'https://meet.example.com/abc-123',
  participants: [
    {
      id: 1,
      name: '张三',
      role: '项目经理',
      status: 'accepted'
    },
    {
      id: 2,
      name: '李四',
      role: '开发工程师',
      status: 'pending'
    },
    {
      id: 3,
      name: '王五',
      role: '设计师',
      status: 'accepted'
    }
  ],
  agenda: [
    {
      time: '15:00-15:10',
      title: '项目进展汇报',
      description: '各部门汇报当前进展情况'
    },
    {
      time: '15:10-15:30',
      title: '问题讨论',
      description: '讨论遇到的技术难题和解决方案'
    },
    {
      time: '15:30-15:50',
      title: '下阶段计划',
      description: '制定下一阶段的工作计划'
    },
    {
      time: '15:50-16:00',
      title: '总结与行动项',
      description: '会议总结和后续行动项分配'
    }
  ],
  attachments: [
    {
      id: 1,
      name: '项目进度报告.pdf',
      size: '2.3MB'
    },
    {
      id: 2,
      name: '技术方案.docx',
      size: '1.8MB'
    }
  ]
})

const reminders = reactive({
  fifteenMin: true,
  oneHour: false,
  oneDay: false
})

const notes = ref('')
const reminderEnabled = ref(true)

const getStatusText = (status) => {
  const statusMap = {
    scheduled: '已安排',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}

const getParticipantStatusText = (status) => {
  const statusMap = {
    accepted: '已接受',
    pending: '待回复',
    declined: '已拒绝'
  }
  return statusMap[status] || '未知'
}

const updateReminders = () => {
  emit('update', {
    reminders: { ...reminders },
    action: 'updateReminders'
  })
}

const updateNotes = () => {
  emit('update', {
    notes: notes.value,
    action: 'updateNotes'
  })
}

const joinMeeting = () => {
  if (meeting.meetingLink) {
    window.open(meeting.meetingLink, '_blank')
  }
  emit('update', {
    action: 'joinMeeting',
    meetingId: meeting.id
  })
}

const addToCalendar = () => {
  // 创建日历事件
  const event = {
    title: meeting.title,
    start: `${meeting.date} ${meeting.time.split('-')[0]}`,
    end: `${meeting.date} ${meeting.time.split('-')[1]}`,
    location: meeting.location
  }
  
  console.log('添加到日历:', event)
  emit('update', {
    action: 'addToCalendar',
    event
  })
}

const toggleReminder = () => {
  reminderEnabled.value = !reminderEnabled.value
  emit('update', {
    action: 'toggleReminder',
    enabled: reminderEnabled.value
  })
}

const downloadAttachment = (attachment) => {
  console.log('下载附件:', attachment)
  emit('update', {
    action: 'downloadAttachment',
    attachment
  })
}

// 监听props变化
watch(() => props.data, (newData) => {
  if (newData.meeting) {
    Object.assign(meeting, newData.meeting)
  }
  if (newData.reminders) {
    Object.assign(reminders, newData.reminders)
  }
  if (newData.notes) {
    notes.value = newData.notes
  }
}, { deep: true })
</script>

<style scoped>
.meeting-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.meeting-info {
  flex: 1;
}

.meeting-title {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.meeting-time,
.meeting-location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 0.875rem;
  color: #666666;
}

.meeting-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.scheduled {
  background: #E3F2FD;
  color: #1976D2;
}

.status-badge.ongoing {
  background: #E8F5E8;
  color: #4CAF50;
}

.status-badge.completed {
  background: #F3E5F5;
  color: #9C27B0;
}

.status-badge.cancelled {
  background: #FFEBEE;
  color: #F44336;
}

.meeting-participants h4,
.meeting-agenda h4,
.meeting-reminders h4,
.meeting-attachments h4,
.meeting-notes h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
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
  padding: 8px;
  background: #F8F9FA;
  border-radius: 6px;
}

.participant-avatar {
  width: 32px;
  height: 32px;
  background: #E5E5E5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
}

.participant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.participant-name {
  font-weight: 500;
  color: #333333;
}

.participant-role {
  font-size: 0.75rem;
  color: #666666;
}

.participant-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.accepted {
  background: #4CAF50;
}

.status-dot.pending {
  background: #FF9800;
}

.status-dot.declined {
  background: #F44336;
}

.status-text {
  font-size: 0.75rem;
  color: #666666;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agenda-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;
}

.agenda-time {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
  min-width: 80px;
}

.agenda-content {
  flex: 1;
}

.agenda-title {
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}

.agenda-description {
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.4;
}

.reminder-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reminder-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.reminder-item label {
  font-size: 0.875rem;
  color: #333333;
  cursor: pointer;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #F8F9FA;
  border-radius: 6px;
}

.attachment-name {
  flex: 1;
  font-size: 0.875rem;
  color: #333333;
}

.attachment-size {
  font-size: 0.75rem;
  color: #666666;
}

.attachment-download {
  padding: 4px;
  border: none;
  background: none;
  color: #666666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.attachment-download:hover {
  background: #E5E5E5;
  color: #333333;
}

.notes-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.notes-textarea:focus {
  outline: none;
  border-color: #333333;
}

.meeting-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

.action-btn.primary:hover {
  background: #222222;
}

.action-btn.secondary {
  background: #FFFFFF;
  color: #666666;
}

.action-btn.secondary:hover {
  background: #F8F9FA;
  color: #333333;
}

</style> 