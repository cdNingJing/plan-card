# AI Agent 集成说明

## 概述

现在对话框已经改造成了一个完整的 AI Agent 系统，具备以下功能：

- 🤖 智能对话处理
- 🔧 工具调用系统
- 📱 卡片自动生成
- 💾 对话历史管理
- 🎯 上下文感知

## 系统架构

### 核心组件

1. **AIAgent** (`src/services/aiAgent.js`)
   - 主要的 AI 代理类
   - 处理对话逻辑和工具调用
   - 管理对话历史

2. **AgentStore** (`src/stores/agentStore.js`)
   - Vue 状态管理
   - 集成卡片系统
   - 提供响应式数据

3. **AI 配置** (`src/config/aiConfig.js`)
   - API 配置管理
   - 支持多种 AI 服务
   - 本地模拟功能

## 如何接入您的 AI 服务

### 方法一：配置 API 密钥

编辑 `src/config/aiConfig.js`：

```javascript
export const aiConfig = {
  apiUrl: 'https://api.openai.com/v1/chat/completions', // 您的 AI API 地址
  apiKey: 'your-api-key-here', // 您的 API 密钥
  model: 'gpt-3.5-turbo', // 使用的模型
  // ... 其他配置
}
```

### 方法二：自定义 API 调用函数

```javascript
import { setCustomAPICall } from '@/config/aiConfig.js'

// 定义您的自定义 API 调用函数
const myCustomAPICall = async (requestData) => {
  // 您的 API 调用逻辑
  const response = await fetch('your-api-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-token'
    },
    body: JSON.stringify(requestData)
  })
  
  return await response.json()
}

// 设置自定义函数
setCustomAPICall(myCustomAPICall)
```

### 方法三：在组件中动态设置

```javascript
// 在任何 Vue 组件中
import { useAgentStore } from '@/stores/agentStore.js'

const agentStore = useAgentStore()

// 设置自定义 API 调用
agentStore.setCustomAPICall(async (requestData) => {
  // 您的 API 逻辑
  return await yourAPICall(requestData)
})
```

## 工具系统

### 内置工具

1. **createPlanCard** - 创建计划卡片
2. **searchInfo** - 搜索信息
3. **generateSuggestions** - 生成建议
4. **navigateToCards** - 导航到卡片页面

### 添加自定义工具

```javascript
import { useAgentStore } from '@/stores/agentStore.js'

const agentStore = useAgentStore()

// 添加自定义工具
agentStore.addTool('customTool', {
  description: '自定义工具描述',
  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: '参数1描述'
      }
    },
    required: ['param1']
  },
  execute: async (args) => {
    // 工具执行逻辑
    console.log('执行自定义工具:', args)
    return {
      success: true,
      message: '工具执行成功'
    }
  }
})
```

## 使用示例

### 基本对话

用户输入："我想去东京旅行5天"
- AI 分析需求
- 调用 `createPlanCard` 工具
- 生成旅行计划卡片
- 自动导航到计划页面

### 礼物推荐

用户输入："我想给妈妈买个礼物，预算500元"
- AI 理解礼物需求
- 调用 `createPlanCard` 工具（type: 'gift'）
- 生成礼物推荐卡片

### 会议安排

用户输入："明天下午2点开会讨论项目"
- AI 识别会议需求
- 调用 `createPlanCard` 工具（type: 'meeting'）
- 生成会议安排卡片

## 当前状态

✅ **已完成功能**
- 基础 AI Agent 架构
- 工具调用系统
- 卡片系统集成
- 对话历史管理
- 本地模拟 API
- 用户头像右对齐

🔄 **使用模拟 API**
- 当前使用本地模拟 API 响应
- 支持基本的意图识别
- 自动创建相应类型的卡片

## 接下来的步骤

1. **配置您的 AI API**
   - 替换 `aiConfig.js` 中的 API 配置
   - 或提供自定义 API 调用函数

2. **测试对话功能**
   - 尝试发送不同类型的消息
   - 观察 AI 的响应和工具调用

3. **自定义工具**
   - 根据需要添加更多工具
   - 集成您的业务逻辑

4. **优化用户体验**
   - 调整系统提示词
   - 优化响应速度
   - 添加错误处理

## 技术细节

### 消息格式

```javascript
{
  role: 'user' | 'assistant',
  content: 'message content',
  timestamp: 'ISO string'
}
```

### 工具调用格式

```javascript
{
  id: 'call_123',
  type: 'function',
  function: {
    name: 'toolName',
    arguments: '{"param": "value"}'
  }
}
```

### 状态管理

- `agentStore.messages` - 对话历史
- `agentStore.isProcessing` - 处理状态
- `agentStore.error` - 错误信息
- `agentStore.toolCalls` - 工具调用历史

## 故障排除

### 常见问题

1. **API 调用失败**
   - 检查 API 密钥和地址
   - 查看浏览器控制台错误

2. **工具不执行**
   - 检查工具参数格式
   - 确认工具已正确注册

3. **对话不响应**
   - 检查 Agent 初始化状态
   - 查看网络请求状态

### 调试技巧

```javascript
// 获取 Agent 状态
const status = agentStore.getAgentStatus()
console.log('Agent 状态:', status)

// 查看工具调用历史
const toolCalls = agentStore.getToolCalls()
console.log('工具调用历史:', toolCalls)

// 查看对话历史
const messages = agentStore.getMessages()
console.log('对话历史:', messages)
```

## 支持

如果您在集成过程中遇到问题，请：

1. 检查浏览器控制台的错误信息
2. 确认 API 配置正确
3. 测试网络连接
4. 查看本文档的故障排除部分

---

现在您的对话框已经是一个功能完整的 AI Agent！🎉 