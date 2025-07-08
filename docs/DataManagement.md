# 数据管理文档

## 概述

本项目使用本地存储工具类 `LocalStorageManager` 来管理两种类型的数据：
- **长期数据**：用户偏好设置、配置信息等持久化数据
- **短期数据**：会话数据、临时缓存等临时性数据

## 文件结构

```
src/
├── utils/
│   └── localStorage.js          # 本地存储工具类
├── data/                        # 数据文件夹
│   ├── long-term/              # 长期数据文件夹
│   │   ├── user-preferences.json
│   │   ├── app-config.json
│   │   └── README.md
│   └── short-term/             # 短期数据文件夹
│       ├── session-data.json
│       ├── cache-data.json
│       └── README.md
└── docs/
    └── DataManagement.md       # 本文档
```

## 长期数据 (Long-term Data)

### 用途
- 用户偏好设置
- 应用程序配置
- 用户账户信息
- 历史记录
- 其他需要持久保存的数据

### 文件命名规范
- 使用 kebab-case 命名
- 以 `long-term-` 开头
- 例如：`long-term-user-preferences.json`

### 数据结构示例

```json
{
  "user_preferences": {
    "theme": "dark",
    "language": "zh-CN",
    "notifications": true,
    "auto_save": true
  },
  "app_config": {
    "version": "1.0.0",
    "last_update": "2024-01-01T00:00:00.000Z",
    "features": {
      "chat_enabled": true,
      "file_upload": true
    }
  },
  "user_profile": {
    "name": "用户名",
    "email": "user@example.com",
    "avatar": "avatar.jpg"
  }
}
```

## 短期数据 (Short-term Data)

### 用途
- 会话数据
- 临时缓存
- 当前操作状态
- 临时计算结果
- 其他临时性数据

### 文件命名规范
- 使用 kebab-case 命名
- 以 `short-term-` 开头
- 例如：`short-term-session-data.json`

### 数据结构示例

```json
{
  "session_data": {
    "session_id": "abc123",
    "login_time": "2024-01-01T10:00:00.000Z",
    "current_page": "/profile",
    "last_activity": "2024-01-01T10:30:00.000Z"
  },
  "cache_data": {
    "api_responses": {
      "user_info": {
        "data": {...},
        "timestamp": "2024-01-01T10:00:00.000Z",
        "expires": "2024-01-01T11:00:00.000Z"
      }
    }
  },
  "temp_data": {
    "current_operation": "editing",
    "draft_content": "...",
    "unsaved_changes": true
  }
}
```

## 最佳实践

### 1. 数据分类
- 明确区分长期数据和短期数据
- 长期数据应该是用户主动设置或重要的配置信息
- 短期数据应该是可以随时清除的临时信息

### 2. 错误处理
```javascript
try {
  const result = await localStorageManager.saveLongTermData('key', 'value')
  if (result.success) {
    console.log('保存成功:', result.message)
  } else {
    console.error('保存失败:', result.message)
  }
} catch (error) {
  console.error('操作异常:', error)
}
```

### 3. 数据备份
- 定期导出重要数据
- 在应用更新前备份用户数据
- 提供数据恢复功能

### 4. 性能优化
- 避免频繁的文件操作
- 合理使用缓存机制
- 及时清理过期的短期数据

## 注意事项

1. **浏览器兼容性**：需要支持 File System Access API 的现代浏览器
2. **文件权限**：用户需要授权文件访问权限
3. **数据安全**：敏感数据应该进行加密处理
4. **存储限制**：注意浏览器的存储限制
5. **错误恢复**：提供数据丢失时的恢复机制

## 故障排除

### 常见问题

1. **文件句柄丢失**
   - 重新选择文件
   - 检查浏览器权限设置

2. **数据解析错误**
   - 检查 JSON 格式是否正确
   - 验证数据结构

3. **权限问题**
   - 确保用户已授权文件访问
   - 检查浏览器安全设置

### 调试方法

```javascript
// 启用调试模式
localStorageManager.debug = true

// 查看当前状态
console.log('长期数据:', localStorageManager.longTermData)
console.log('短期数据:', localStorageManager.shortTermData)
console.log('长期记录:', localStorageManager.longTermRecords)
console.log('短期记录:', localStorageManager.shortTermRecords)
``` 