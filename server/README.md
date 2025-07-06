# 会议提醒服务器

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `env.example` 为 `.env` 并配置：
```bash
cp env.example .env
```

编辑 `.env` 文件：
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=3001
NODE_ENV=development
```

### 3. 配置Gmail
1. 开启Gmail两步验证
2. 生成应用专用密码
3. 将应用专用密码填入 `EMAIL_PASS`

### 4. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 接口

### 健康检查
```
GET /api/health
```

### 发送会议提醒
```
POST /api/meeting-reminder
Content-Type: application/json

{
  "title": "项目讨论会",
  "date": "2024-01-15",
  "time": "14:00",
  "attendees": ["user1@example.com", "user2@example.com"],
  "location": "会议室A",
  "duration": "60"
}
```

## 测试

使用curl测试：
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

## 邮件发送测试

### 测试邮件配置
运行测试脚本验证邮件发送功能：

```bash
node test-email.js
```

### 支持的邮箱格式
- 单个邮箱: `user@example.com`
- 多个邮箱: `user1@example.com,user2@example.com`
- 换行分隔: `user1@example.com\nuser2@example.com`

### 邮件模板
系统会自动生成包含以下信息的HTML邮件：
- 会议主题
- 日期和时间
- 会议地点
- 参会人员数量
- 温馨提示 