// 会议提醒API调用
const API_BASE_URL = 'http://localhost:3001/api'

// 真实发送会议提醒到邮箱
export async function sendMeetingReminder(meetingData) {
  try {
    console.log('[Meeting API] 开始发送会议提醒:', meetingData)
    
    // 处理参会人员数据
    let attendees = []
    if (meetingData.participants) {
      // 如果是字符串，按换行符分割
      if (typeof meetingData.participants === 'string') {
        attendees = meetingData.participants.split('\n').filter(p => p.trim())
      } else if (Array.isArray(meetingData.participants)) {
        attendees = meetingData.participants
      }
    }
    
    if (attendees.length === 0) {
      throw new Error('没有找到有效的参会人员邮箱')
    }
    
    // 调用真实API
    const response = await fetch(`${API_BASE_URL}/meeting-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: meetingData.meetingTitle,
        date: meetingData.meetingDate,
        time: meetingData.startTime,
        location: meetingData.location,
        duration: meetingData.duration,
        description: meetingData.description,
        attendees: attendees
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || '发送失败')
    }
    
    console.log('[Meeting API] 发送成功:', result)
    return {
      success: true,
      message: `会议邀请已成功发送给 ${attendees.length} 位参与者`,
      data: {
        title: meetingData.meetingTitle,
        date: meetingData.meetingDate,
        time: meetingData.startTime,
        attendeesCount: attendees.length,
        attendees: attendees,
        sentAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('[Meeting API] 发送失败:', error)
    throw new Error(`发送失败: ${error.message}`)
  }
}

// 真实API调用（备用）
export async function sendMeetingReminderReal(meetingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/meeting-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || '发送失败')
    }
    
    return result
  } catch (error) {
    console.error('[Meeting API] 发送会议提醒失败:', error)
    throw error
  }
}

// 健康检查
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error('服务器连接失败')
    }
    
    return result
  } catch (error) {
    console.error('[Meeting API] 健康检查失败:', error)
    throw error
  }
}

// 会议延期API
export async function postponeMeeting(meetingData) {
  try {
    console.log('[Meeting API] 开始处理会议延期:', meetingData)
    
    const response = await fetch(`${API_BASE_URL}/meeting-postpone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || '延期失败')
    }
    
    console.log('[Meeting API] 会议延期成功:', result)
    return {
      success: true,
      message: `会议已成功延期到 ${meetingData.newDate} ${meetingData.newTime}`,
      data: {
        originalDate: meetingData.originalDate,
        originalTime: meetingData.originalTime,
        newDate: meetingData.newDate,
        newTime: meetingData.newTime,
        attendeesCount: meetingData.attendees?.length || 0,
        postponedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('[Meeting API] 会议延期失败:', error)
    throw new Error(`延期失败: ${error.message}`)
  }
}

// 更新日历事件
export async function updateCalendarEvent(calendarData) {
  try {
    console.log('[Meeting API] 开始更新日历事件:', calendarData)
    
    const response = await fetch(`${API_BASE_URL}/calendar-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(calendarData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || '日历更新失败')
    }
    
    console.log('[Meeting API] 日历更新成功:', result)
    return {
      success: true,
      message: '日历事件已更新',
      data: result
    }
  } catch (error) {
    console.error('[Meeting API] 日历更新失败:', error)
    throw new Error(`日历更新失败: ${error.message}`)
  }
}

// 发送会议延期通知
export async function sendPostponementNotification(notificationData) {
  try {
    console.log('[Meeting API] 开始发送延期通知:', notificationData)
    
    const response = await fetch(`${API_BASE_URL}/meeting-postponement-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || '通知发送失败')
    }
    
    console.log('[Meeting API] 延期通知发送成功:', result)
    return {
      success: true,
      message: `延期通知已发送给 ${notificationData.attendees?.length || 0} 位参与者`,
      data: {
        attendeesCount: notificationData.attendees?.length || 0,
        sentAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('[Meeting API] 延期通知发送失败:', error)
    throw new Error(`通知发送失败: ${error.message}`)
  }
} 