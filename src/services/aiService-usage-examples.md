# AI服务使用示例

## 新的简单场景调用方法

### 方法签名
```javascript
async sendMessageWithScenario(message, scenario, options = {})
```

### 参数说明
- `message` (string): 用户消息
- `scenario` (string): 场景名称，可选值：
  - `'basic'`: 基础对话场景
  - `'longTerm'`: 长期记忆场景
  - `'shortTerm'`: 短期记忆场景
  - `'dynamicIsland'`: 灵动岛场景
- `options` (object): 可选参数

### 使用示例

#### 1. 基础对话场景
```javascript
import aiService from '@/services/aiService.js'

// 简单调用，无需上下文
const response = await aiService.sendMessageWithScenario('你好', 'basic')

if (response.success) {
  console.log('AI回复:', response.content)
} else {
  console.error('调用失败:', response.error)
}
```

#### 2. 长期记忆场景
```javascript
// 用于长期记忆管理
const response = await aiService.sendMessageWithScenario(
  '我想记录一下我的旅行偏好', 
  'longTerm'
)
```

#### 3. 短期记忆场景
```javascript
// 用于短期计划管理
const response = await aiService.sendMessageWithScenario(
  '我想去西安旅游', 
  'shortTerm'
)
```

#### 4. 灵动岛场景
```javascript
// 用于灵动岛界面
const response = await aiService.sendMessageWithScenario(
  '显示当前状态', 
  'dynamicIsland'
)
```

### 在ProfileView.vue中的使用

```javascript
// 替换原有的复杂调用
// const response = await aiService.sendMessage(value, {
//   conversationHistory: historyContext
// })

// 使用新的简单调用
const response = await aiService.sendMessageWithScenario(value, 'basic')

// 或者根据具体需求选择场景
// const response = await aiService.sendMessageWithScenario(value, 'longTerm')
// const response = await aiService.sendMessageWithScenario(value, 'shortTerm')
// const response = await aiService.sendMessageWithScenario(value, 'dynamicIsland')
```

### 优势

1. **简单易用**：只需传入消息和场景名称
2. **无需上下文**：不需要管理对话历史
3. **场景化**：不同场景使用不同的提示词
4. **缓存支持**：自动缓存相同场景的请求
5. **错误处理**：完整的错误处理机制

### 返回格式

```javascript
{
  success: true,
  data: { /* API原始响应 */ },
  message: 'AI回复成功',
  content: 'AI的回复内容',
  scenario: 'basic', // 使用的场景
  cached: false // 是否来自缓存
}
```

### 错误处理

```javascript
{
  success: false,
  message: '错误信息',
  error: '详细错误'
}
``` 