// 会议记录存储服务
export class MeetingStorage {
  static STORAGE_KEY = 'plan_card_meeting_history'

  // 获取所有会议记录
  static getAllMeetings() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[MeetingStorage] 获取会议记录失败:', error)
      return []
    }
  }

  // 添加新的会议记录
  static addMeeting(meetingData) {
    try {
      const meetings = this.getAllMeetings()
      const newMeeting = {
        id: 'meeting_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        ...meetingData,
        sentAt: new Date().toISOString(),
        status: 'sent'
      }
      
      meetings.unshift(newMeeting) // 添加到开头，最新的在前面
      
      // 限制保存的记录数量，最多保存50条
      if (meetings.length > 50) {
        meetings.splice(50)
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meetings))
      console.log('[MeetingStorage] 会议记录已保存:', newMeeting)
      
      return newMeeting
    } catch (error) {
      console.error('[MeetingStorage] 保存会议记录失败:', error)
      return null
    }
  }

  // 更新会议记录
  static updateMeeting(meetingId, updates) {
    try {
      const meetings = this.getAllMeetings()
      const index = meetings.findIndex(meeting => meeting.id === meetingId)
      
      if (index !== -1) {
        meetings[index] = {
          ...meetings[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meetings))
        console.log('[MeetingStorage] 会议记录已更新:', meetings[index])
        
        return meetings[index]
      }
      
      return null
    } catch (error) {
      console.error('[MeetingStorage] 更新会议记录失败:', error)
      return null
    }
  }

  // 删除会议记录
  static deleteMeeting(meetingId) {
    try {
      const meetings = this.getAllMeetings()
      const filteredMeetings = meetings.filter(meeting => meeting.id !== meetingId)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredMeetings))
      console.log('[MeetingStorage] 会议记录已删除:', meetingId)
      
      return true
    } catch (error) {
      console.error('[MeetingStorage] 删除会议记录失败:', error)
      return false
    }
  }

  // 获取单个会议记录
  static getMeeting(meetingId) {
    try {
      const meetings = this.getAllMeetings()
      return meetings.find(meeting => meeting.id === meetingId) || null
    } catch (error) {
      console.error('[MeetingStorage] 获取单个会议记录失败:', error)
      return null
    }
  }

  // 清空所有会议记录
  static clearAllMeetings() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('[MeetingStorage] 所有会议记录已清空')
      return true
    } catch (error) {
      console.error('[MeetingStorage] 清空会议记录失败:', error)
      return false
    }
  }

  // 获取最近的会议记录
  static getRecentMeetings(limit = 10) {
    try {
      const meetings = this.getAllMeetings()
      return meetings.slice(0, limit)
    } catch (error) {
      console.error('[MeetingStorage] 获取最近会议记录失败:', error)
      return []
    }
  }

  // 搜索会议记录
  static searchMeetings(keyword) {
    try {
      const meetings = this.getAllMeetings()
      const lowerKeyword = keyword.toLowerCase()
      
      return meetings.filter(meeting => 
        meeting.meetingTitle?.toLowerCase().includes(lowerKeyword) ||
        meeting.location?.toLowerCase().includes(lowerKeyword) ||
        meeting.participants?.toLowerCase().includes(lowerKeyword)
      )
    } catch (error) {
      console.error('[MeetingStorage] 搜索会议记录失败:', error)
      return []
    }
  }
} 