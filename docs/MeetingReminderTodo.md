# 会议提醒功能 - 最小 MVP TODO 清单

## 项目概述
基于现有 Vue.js + Node.js 技术栈，实现最简会议确认提醒功能。

## 核心功能流程
**用户输入 → 基础信息卡片 → 会议信息整合卡片 → 模拟发送邮件 → 执行结果卡片**

## 模拟发送说明
- 前端模拟发送到指定邮箱: 1310569600@qq.com
- 无需配置真实邮件服务
- 包含1.5秒模拟延迟，提供真实体验

## 第一阶段：后端 API（1天）✅

### 1. 项目初始化 ✅
- [x] 创建 `server/` 目录
- [x] 初始化 `package.json`
- [x] 安装依赖：`npm install express nodemailer cors`
- [x] 创建 `.env` 文件

### 2. 基础服务器 ✅
- [x] 创建 `server.js` 主文件
- [x] 配置 Express 中间件
- [x] 设置环境变量读取

### 3. 邮件服务 ✅
- [x] 配置 Nodemailer（Gmail SMTP）
- [x] 创建简单的邮件模板
- [x] 实现邮件发送函数

### 4. 会议提醒 API ✅
- [x] 创建 `/api/meeting-reminder` POST 端点
- [x] 接收会议信息（标题、日期、时间、邮箱、地点、时长）
- [x] 发送邮件
- [x] 返回成功/失败响应

## 第二阶段：前端集成（1天）✅

### 5. 会议卡片组件开发 ✅
- [x] 创建 `src/components/cards/MeetingSummaryCard.vue`（会议信息整合卡片）
- [x] 创建 `src/components/cards/MeetingResultCard.vue`（执行结果卡片）
- [x] 实现会议信息整合显示和发送功能
- [x] 实现执行结果统计和后续操作
- [x] 集成到卡片系统

### 6. 卡片系统集成 ✅
- [x] 在 `cardStore.js` 中添加 `meeting-summary` 和 `meeting-result` 卡片类型
- [x] 在 `SmartCard.vue` 中注册新的会议卡片组件
- [x] 更新会议场景的卡片组合（改为3个卡片：basic-info, meeting-summary, meeting-result）

### 7. API集成 ✅
- [x] 创建 `src/api/meetingApi.js` 调用后端
- [x] 更新会议确认卡片使用新API
- [x] 添加基础样式和状态反馈
- [x] 实现模拟发送到指定邮箱

## 第三阶段：测试和优化（0.5天）

### 8. 功能测试
- [ ] 测试基础信息卡片数据传递
- [ ] 测试会议确认卡片显示
- [ ] 测试邮件发送功能
- [ ] 测试错误处理

### 9. 用户体验优化
- [ ] 优化加载状态显示
- [ ] 完善错误提示信息
- [ ] 测试不同数据格式的处理

## 文件结构

```
project/
├── server/
│   ├── server.js          # 主服务器文件 ✅
│   ├── package.json       # 依赖配置 ✅
│   ├── env.example        # 环境变量示例 ✅
│   └── README.md          # 服务器说明 ✅
├── src/
│   ├── components/cards/
│   │   ├── BasicInfoCard.vue      # 基础信息卡片 (已有)
│   │   └── MeetingConfirmCard.vue # 会议确认卡片 (新增) ✅
│   ├── api/
│   │   └── meetingApi.js          # API 调用 (新增) ✅
│   ├── stores/
│   │   └── cardStore.js           # 卡片类型配置 (已更新) ✅
│   └── components/
│       └── SmartCard.vue          # 卡片容器 (已更新) ✅
```

## 最小实现清单

### 后端（server.js）✅
```javascript
const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')

const app = express()
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

// 会议提醒 API
app.post('/api/meeting-reminder', async (req, res) => {
  const { title, date, time, attendees, location, duration } = req.body
  
  try {
    await sendMeetingEmail({ title, date, time, attendees, location, duration })
    res.json({ success: true, message: '会议提醒已发送' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3001, () => console.log('Server running on port 3001'))
```

### 前端（MeetingConfirmCard.vue）✅
- [x] 会议信息摘要展示
- [x] 发送按钮和状态管理
- [x] API 调用和错误处理
- [x] 成功/失败状态反馈

## 时间估算

- **后端开发**: 1天 ✅
- **前端集成**: 1天 ✅  
- **测试优化**: 0.5天
- **总计**: 2.5天

## 优先级

1. **高优先级**: 后端 API + 基础邮件发送 ✅
2. **中优先级**: 前端卡片集成 ✅
3. **低优先级**: 样式优化和错误处理

## 成功标准

- [x] 用户可以在基础信息卡片输入会议信息
- [x] 会议确认卡片正确显示信息摘要
- [x] 点击发送按钮成功调用API
- [x] 显示清晰的发送状态反馈
- [ ] 错误情况有适当的提示信息

## 模拟发送配置

### 前端模拟发送
- 无需配置邮件服务
- 自动发送到: 1310569600@qq.com
- 包含1.5秒模拟延迟

### 真实邮件配置（可选）
如需真实发送邮件，请配置：

```bash
# 复制示例文件
cp env.example .env

# 编辑配置
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=3001
NODE_ENV=development
```

### Gmail 配置步骤
1. 开启两步验证
2. 生成应用专用密码
3. 将密码填入 `EMAIL_PASS`

## 测试步骤

### 1. 启动服务器
```bash
cd server
npm start
```

### 2. 测试健康检查
```bash
curl http://localhost:3001/api/health
```

### 3. 测试会议提醒API
```bash
curl -X POST http://localhost:3001/api/meeting-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试会议",
    "date": "2024-01-15",
    "time": "14:00",
    "attendees": ["test@example.com"],
    "location": "测试会议室",
    "duration": "60"
  }'
```

### 4. 前端测试
- 输入会议信息
- 查看会议确认卡片
- 点击发送按钮
- 检查邮箱是否收到

## 后续扩展（可选）

- 添加日历事件创建
- 支持更多邮件模板
- 增加提醒时间设置
- 集成第三方日历服务 