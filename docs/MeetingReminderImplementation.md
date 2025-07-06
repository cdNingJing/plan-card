# 会议确认提醒功能 - 完整实现方案

## 推荐方案：基于现有 Vue.js 项目的 Node.js 后端

基于你们当前的技术栈（Vue.js + Node.js），推荐使用 **Node.js + Express + Nodemailer** 的简单方案。

## 核心架构

```
用户输入 → 基础信息卡片 → 会议确认卡片 → Node.js API → 邮件服务 → 用户邮箱 → 成功反馈
```

## 卡片流程设计

### 1. 基础信息卡片 (basic-info)
- **功能**: 收集会议基本信息
- **字段**: 会议主题、日期、时间、参会人员邮箱、地点、时长
- **状态**: 用户输入阶段

### 2. 会议信息整合卡片 (meeting-summary)
- **功能**: 显示所有收集的信息，提供发送按钮
- **内容**: 
  - 会议基本信息展示
  - 参会人员列表
  - 会议详情和提醒设置
  - "编辑信息"和"发送会议提醒"按钮
  - 发送状态反馈
- **状态**: 确认和执行阶段

### 3. 会议执行结果卡片 (meeting-result)
- **功能**: 显示操作执行后的信息汇总
- **内容**: 
  - 发送结果统计
  - 会议信息回顾
  - 参会人员发送状态
  - 后续操作建议
  - "创建新会议"和"查看详情"按钮
- **状态**: 结果展示阶段

## 最小实现清单

### 1. 后端 API (Node.js + Express)

```javascript
// server.js
const express = require('express')
const nodemailer = require('nodemailer')
const app = express()

// 邮件配置
const transporter = nodemailer.createTransporter({
  service: 'gmail', // 或使用其他邮件服务
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// 会议提醒 API
app.post('/api/meeting-reminder', async (req, res) => {
  const { title, date, time, attendees, location, duration } = req.body
  
  try {
    // 发送会议邀请邮件
    await sendMeetingEmail({
      title,
      date,
      time,
      attendees,
      location,
      duration
    })
    
    res.json({ success: true, message: '会议提醒已发送' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 发送邮件函数
async function sendMeetingEmail(meetingInfo) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: meetingInfo.attendees.join(','),
    subject: `会议邀请: ${meetingInfo.title}`,
    html: generateEmailTemplate(meetingInfo)
  }
  
  return transporter.sendMail(mailOptions)
}
```

### 2. 前端集成 (Vue.js)

```javascript
// 会议确认卡片组件
// src/components/cards/MeetingConfirmCard.vue

// API 调用
async function sendMeetingReminder(meetingData) {
  const response = await fetch('/api/meeting-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meetingData)
  })
  return response.json()
}
```

## 依赖包

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "nodemailer": "^6.9.0",
    "cors": "^2.8.5"
  }
}
```

## 实现步骤

1. **安装依赖** - `npm install express nodemailer cors`
2. **创建 API 路由** - 处理会议提醒请求
3. **配置邮件服务** - 使用 Gmail 或其他邮件服务
4. **前端集成** - 在现有卡片系统中添加会议确认卡片
5. **测试验证** - 发送测试邮件确认功能

## 优势

- **技术栈一致** - 与现有项目完全兼容
- **实现简单** - 只需要一个 API 端点
- **稳定可靠** - 使用成熟的邮件服务
- **易于维护** - 代码结构清晰简单
- **用户体验好** - 清晰的流程和状态反馈

## 后续扩展

- 添加日历事件创建
- 支持更多邮件模板
- 增加提醒时间设置
- 集成第三方日历服务 