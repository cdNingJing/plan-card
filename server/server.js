const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件配置
app.use(cors())
app.use(express.json())

// 邮件配置
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// 生成邮件模板
function generateEmailTemplate(meetingInfo) {
  const { title, date, time, location, duration, attendees } = meetingInfo
  
  const formattedDate = new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const durationText = duration ? ` (${duration}分钟)` : ''
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
        会议邀请: ${title}
      </h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">会议详情</h3>
        
        <div style="margin: 15px 0;">
          <strong>📅 日期:</strong> ${formattedDate}
        </div>
        
        ${time ? `
        <div style="margin: 15px 0;">
          <strong>⏰ 时间:</strong> ${time}${durationText}
        </div>
        ` : ''}
        
        ${location ? `
        <div style="margin: 15px 0;">
          <strong>📍 地点:</strong> ${location}
        </div>
        ` : ''}
        
        <div style="margin: 15px 0;">
          <strong>👥 参会人员:</strong> ${attendees.length}人
        </div>
      </div>
      
      <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; border-left: 4px solid #4caf50;">
        <p style="margin: 0; color: #2e7d32;">
          <strong>温馨提示:</strong> 请提前5分钟进入会议，确保设备正常工作。
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>此邮件由会议提醒系统自动发送，如有疑问请联系会议组织者。</p>
      </div>
    </div>
  `
}

// 发送会议邮件
async function sendMeetingEmail(meetingInfo) {
  const { title, date, time, attendees, location, duration } = meetingInfo
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: attendees.join(','),
    subject: `会议邀请: ${title}`,
    html: generateEmailTemplate(meetingInfo)
  }
  
  return transporter.sendMail(mailOptions)
}

// 会议延期 API
app.post('/api/meeting-postpone', async (req, res) => {
  try {
    const { eventId, originalDate, originalTime, newDate, newTime, title } = req.body
    
    console.log('[Meeting Postpone] 处理会议延期:', {
      eventId,
      originalDate,
      originalTime,
      newDate,
      newTime,
      title
    })
    
    // 模拟日历更新
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    res.json({
      success: true,
      message: '会议延期处理成功',
      data: {
        eventId,
        originalDate,
        originalTime,
        newDate,
        newTime,
        title,
        updatedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Meeting Postpone] 延期失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '会议延期失败'
    })
  }
})

// 日历更新 API
app.post('/api/calendar-update', async (req, res) => {
  try {
    const { eventId, originalDate, originalTime, newDate, newTime, title } = req.body
    
    console.log('[Calendar Update] 更新日历事件:', {
      eventId,
      originalDate,
      originalTime,
      newDate,
      newTime,
      title
    })
    
    // 模拟日历更新
    await new Promise(resolve => setTimeout(resolve, 800))
    
    res.json({
      success: true,
      message: '日历事件已更新',
      data: {
        eventId,
        originalDate,
        originalTime,
        newDate,
        newTime,
        title,
        updatedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Calendar Update] 更新失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '日历更新失败'
    })
  }
})

// 会议延期通知 API
app.post('/api/meeting-postponement-notification', async (req, res) => {
  try {
    const { title, originalDate, originalTime, newDate, newTime, location, attendees, reason } = req.body
    
    console.log('[Postponement Notification] 发送延期通知:', {
      title,
      originalDate,
      originalTime,
      newDate,
      newTime,
      location,
      attendeesCount: attendees?.length || 0,
      reason
    })
    
    // 生成延期通知邮件内容
    const emailContent = generatePostponementEmailTemplate({
      title,
      originalDate,
      originalTime,
      newDate,
      newTime,
      location,
      reason
    })
    
    // 模拟发送邮件
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    res.json({
      success: true,
      message: `延期通知已发送给 ${attendees?.length || 0} 位参与者`,
      data: {
        title,
        originalDate,
        originalTime,
        newDate,
        newTime,
        attendeesCount: attendees?.length || 0,
        sentAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Postponement Notification] 发送失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '延期通知发送失败'
    })
  }
})

// 生成延期通知邮件模板
function generatePostponementEmailTemplate(meetingInfo) {
  const { title, originalDate, originalTime, newDate, newTime, location, reason } = meetingInfo
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">会议延期通知</h2>
      <p>您好，</p>
      <p>很抱歉通知您，原定于 <strong>${originalDate} ${originalTime}</strong> 的会议 <strong>"${title}"</strong> 需要延期。</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">新的会议时间</h3>
        <p><strong>日期：</strong>${newDate}</p>
        <p><strong>时间：</strong>${newTime}</p>
        ${location ? `<p><strong>地点：</strong>${location}</p>` : ''}
        ${reason ? `<p><strong>延期原因：</strong>${reason}</p>` : ''}
      </div>
      
      <p>请您及时更新您的日程安排。如有任何问题，请随时联系会议组织者。</p>
      
      <p>感谢您的理解与配合！</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        此邮件由智能会议管理系统自动发送，请勿直接回复。
      </p>
    </div>
  `
}

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Meeting reminder server is running',
    timestamp: new Date().toISOString()
  })
})

// 会议提醒 API
app.post('/api/meeting-reminder', async (req, res) => {
  try {
    const { title, date, time, attendees, location, duration } = req.body
    
    // 验证必填字段
    if (!title || !date || !attendees || !Array.isArray(attendees) || attendees.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段: title, date, attendees'
      })
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = attendees.filter(email => !emailRegex.test(email))
    
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        error: `无效的邮箱地址: ${invalidEmails.join(', ')}`
      })
    }
    
    console.log('[Meeting Reminder] 发送会议提醒:', {
      title,
      date,
      time,
      attendees: attendees.length,
      location,
      duration
    })
    
    // 发送邮件
    await sendMeetingEmail({
      title,
      date,
      time: time || '',
      attendees,
      location: location || '',
      duration: duration || '60'
    })
    
    console.log('[Meeting Reminder] 邮件发送成功')
    
    res.json({
      success: true,
      message: `会议提醒已发送给 ${attendees.length} 位参与者`,
      data: {
        title,
        date,
        time,
        attendeesCount: attendees.length,
        sentAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Meeting Reminder] 发送失败:', error)
    
    res.status(500).json({
      success: false,
      error: error.message || '邮件发送失败，请稍后重试'
    })
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err)
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  })
})

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Meeting reminder server running on port ${PORT}`)
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app 