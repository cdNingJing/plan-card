# ChatView 重构说明

## 概述

`ChatView.vue` 页面已重构为两个主要组件，实现了动态场景和AI交互的分离：

1. **DynamicScene** - 动态场景组件（作为背景）
2. **AIInteraction** - AI交互组件（处理输入和推荐）

## 架构设计

### 1. DynamicScene 组件 (`src/components/DynamicScene.vue`)

**功能：**
- 模拟手机上的各种场景（群聊、个人聊天、工作聊天、家庭群等）
- 支持不同的场景配置（标题、头像、按钮显示等）
- 作为背景显示，支持模糊效果

**特性：**
- 支持多种场景类型：`group-chat`、`personal-chat`、`work-chat`、`family-chat`
- 动态配置：根据场景类型显示不同的UI元素
- 响应式设计：适配不同屏幕尺寸

**Props：**
- `sceneType`: 场景类型
- `isBlurred`: 是否显示模糊效果

**Events：**
- `go-back`: 返回按钮点击
- `ai-click`: AI按钮点击
- `toggle-ai`: 切换AI推荐
- `input-focus`: 输入框聚焦

### 2. AIInteraction 组件 (`src/components/AIInteraction.vue`)

**功能：**
- 处理AI推荐内容的显示
- 管理输入框和交互按钮
- 提供AI交互界面

**特性：**
- 推荐卡片列表
- 输入框和功能按钮
- 动画效果

**Props：**
- `recommendations`: 推荐内容数组

**Events：**
- `recommendation-click`: 推荐项点击
- `add-click`: 添加按钮点击
- `send-message`: 发送消息
- `input-focus`: 输入框聚焦
- `mic-click`: 麦克风按钮点击

### 3. 场景配置管理器 (`src/config/sceneConfig.js`)

**功能：**
- 集中管理所有场景的配置
- 提供场景数据获取和更新方法
- 支持场景类型的扩展

**主要方法：**
- `getSceneConfig(sceneType)`: 获取场景配置
- `getAvailableSceneTypes()`: 获取可用场景类型
- `getSceneData(sceneType)`: 获取场景数据
- `updateSceneMessages(sceneType, newMessage)`: 更新场景消息

## 使用流程

### 默认状态
1. 用户进入页面，显示默认的群聊场景
2. 场景切换按钮显示在右上角，允许切换不同场景

### AI交互状态
1. 点击AI按钮，场景缩小并模糊作为背景
2. AI交互组件覆盖在场景上方
3. 显示推荐内容和输入框
4. 点击外部区域或输入框聚焦时隐藏AI交互

## 场景类型

### 1. 群聊 (group-chat)
- 标题：Mom Squad
- 副标题：Messenger
- 显示所有功能按钮

### 2. 个人聊天 (personal-chat)
- 标题：Sarah
- 副标题：Online
- 隐藏点赞按钮

### 3. 工作聊天 (work-chat)
- 标题：Team Chat
- 副标题：Slack
- 隐藏通话和视频按钮

### 4. 家庭群 (family-chat)
- 标题：Family Group
- 副标题：WhatsApp
- 显示所有功能按钮

## 扩展性

### 添加新场景类型
1. 在 `src/config/sceneConfig.js` 中添加新场景配置
2. 在 `DynamicScene.vue` 中添加对应的UI逻辑（如需要）
3. 在 `ChatView.vue` 的 `getSceneDisplayName` 方法中添加显示名称

### 自定义AI推荐
1. 修改 `ChatView.vue` 中的 `aiRecommendations` 数据
2. 或通过API动态获取推荐内容

## 技术特点

- **组件化设计**：功能分离，易于维护和扩展
- **配置驱动**：场景配置集中管理，易于修改
- **响应式设计**：适配不同设备
- **动画效果**：流畅的过渡动画
- **事件驱动**：组件间通过事件通信

## 文件结构

```
src/
├── views/
│   └── ChatView.vue          # 主页面组件
├── components/
│   ├── DynamicScene.vue      # 动态场景组件
│   └── AIInteraction.vue     # AI交互组件
└── config/
    └── sceneConfig.js        # 场景配置管理器
```

## 注意事项

1. 场景切换按钮仅在非AI模式下显示
2. AI交互时会自动隐藏场景切换功能
3. 所有场景数据都是模拟数据，实际使用时需要连接真实API
4. 组件间通过事件通信，保持松耦合 