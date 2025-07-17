# Enhanced Knowledge System API 使用示例文档

## 基本信息
- **Base URL**: `http://54.68.80.214`
- **Token**: `DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK`
- **Collection 名称**: `demo-collection`

本文档通过 curl 命令演示从创建集合、上传内容到搜索查询的一整套操作流程。

## 🔐 认证说明

所有端点（除了根端点和健康检查）都需要 Bearer token 认证：

```bash
Authorization: Bearer your_api_token_here
Content-Type: application/json
```

**注意**: Token 至少需要10个字符。系统会根据你的 token 生成用户 ID。

## 🛠 环境准备

你可以直接将以下命令粘贴到终端中运行。建议将变量保存为本地 shell 环境变量：

```bash
export BASE_URL=http://54.68.80.214
export TOKEN=DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK
```

## 📋 基础系统端点

### 系统信息获取

```bash
curl $BASE_URL/
```

**响应示例**:
```json
{
  "service": "Enhanced Knowledge System API",
  "version": "1.0.0",
  "status": "operational",
  "documentation": "/docs",
  "health_check": "/health"
}
```

### 系统健康检查

```bash
curl $BASE_URL/health
```

**响应示例**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "2:30:45",
  "database_status": {
    "qdrant": "healthy",
    "neo4j": "healthy"
  },
  "active_users": 3,
  "total_collections": 5,
  "system_metrics": {
    "total_requests": 127,
    "active_connections": 5,
    "memory_usage": "N/A"
  }
}
```

## ✅ 步骤 1：创建集合

```bash
curl -X POST $BASE_URL/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection_name": "demo-collection",
    "vector_size": 1536,
    "description": "这是一个用于演示的知识集合"
  }'
```

**参数说明**:
- `collection_name` (必需): 集合名称
- `vector_size` (可选): 向量维度大小 (默认: 1536)
- `description` (可选): 集合描述

## ✅ 步骤 2：上传内容

### 2.1 上传文本内容

```bash
curl -X POST $BASE_URL/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "人工智能正在迅速改变医疗行业，例如通过帮助医生更早诊断疾病。",
    "content_type": "text",
    "metadata": {
      "title": "AI在医疗中的应用",
      "source": "测试文章",
      "author": "张三"
    },
    "collection_name": "demo-collection",
    "enable_graph_storage": true,
    "enable_reasoning": false
  }'
```

### 2.2 上传JSON内容

```bash
curl -X POST $BASE_URL/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "name": "机器学习模型",
      "type": "神经网络",
      "accuracy": 0.95,
      "parameters": {
        "layers": 3,
        "neurons": [128, 64, 32]
      }
    },
    "content_type": "json",
    "metadata": {
      "model_version": "1.0",
      "created_by": "数据科学家"
    },
    "collection_name": "demo-collection"
  }'
```

**参数说明**:
- `content` (必需): 要处理的内容 - 可以是字符串、对象或数组
- `content_type` (必需): 内容类型 - `text`, `json`, `document`, `structured` 之一
- `metadata` (可选): 额外的元数据对象
- `collection_name` (可选): 目标集合名称 (默认为用户特定集合)
- `enable_graph_storage` (可选): 启用 Neo4j 图存储 (默认: true)
- `enable_reasoning` (可选): 启用推理功能 (默认: false)

## ✅ 步骤 3：查看集合统计信息

```bash
curl -X GET $BASE_URL/content/demo-collection/stats \
  -H "Authorization: Bearer $TOKEN"
```

**响应示例**:
```json
{
  "collection_name": "demo-collection",
  "user_id": "user_1234",
  "statistics": {
    "total_chunks": 156,
    "total_entities": 423,
    "last_updated": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## ✅ 步骤 4：执行搜索查询

### 4.1 基础搜索

```bash
curl -X POST $BASE_URL/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "人工智能 医疗",
    "limit": 5,
    "collection_name": "demo-collection",
    "include_graph_context": true
  }'
```

### 4.2 高级搜索（带过滤器和重排序）

```bash
curl -X POST $BASE_URL/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "机器学习 神经网络 深度学习",
    "limit": 15,
    "collection_name": "demo-collection",
    "filters": {
      "category": "研究",
      "year": "2024"
    },
    "include_graph_context": true,
    "include_reranking": true,
    "include_reasoning": true,
    "score_threshold": 0.8
  }'
```

**搜索参数说明**:
- `query` (必需): 搜索查询文本
- `limit` (可选): 最大结果数 (1-100, 默认: 10)
- `collection_name` (可选): 目标集合 (默认为用户的集合)
- `filters` (可选): 额外的元数据过滤器
- `include_graph_context` (可选): 包含图上下文扩展 (默认: true)
- `include_reranking` (可选): 应用 Cerebras LLM 重排序 (默认: true)
- `include_reasoning` (可选): 生成推理合成 (默认: true)
- `score_threshold` (可选): 最小相关性分数 (0.0-1.0, 默认: 0.0)

### 4.3 高级重排序搜索

```bash
curl -X POST $BASE_URL/search/rerank \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI模型性能优化",
    "limit": 5,
    "include_explanation": true,
    "reranking_strategy": "cerebras_llm"
  }'
```

## ✅ 步骤 5：获取搜索建议

```bash
curl -G $BASE_URL/search/suggestions \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "query=人工智能" \
  --data-urlencode "limit=3"
```

## ✅ 步骤 6：内容管理操作

### 6.1 获取块详情

```bash
curl -X GET $BASE_URL/content/demo-collection/chunk/{chunk_id} \
  -H "Authorization: Bearer $TOKEN"
```

### 6.2 编辑块内容

```bash
curl -X PUT $BASE_URL/content/demo-collection/chunk/{chunk_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_content": "更新后的AI性能指标显示96%的准确率，改进了TensorFlow部署...",
    "new_metadata": {
      "version": "2.0",
      "last_updated": "2024-01-15T10:30:00Z",
      "editor": "user_123"
    }
  }'
```

### 6.3 删除块

```bash
curl -X DELETE $BASE_URL/content/demo-collection/chunk/{chunk_id} \
  -H "Authorization: Bearer $TOKEN"
```

### 6.4 查看操作历史

```bash
curl -X GET $BASE_URL/content/operations/history \
  -H "Authorization: Bearer $TOKEN"
```

**带过滤器的操作历史**:
```bash
curl -G $BASE_URL/content/operations/history \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "operation_type=edit" \
  --data-urlencode "limit=10"
```

## ✅ 步骤 7：集合管理

### 7.1 列出当前集合

```bash
curl -X GET $BASE_URL/collections \
  -H "Authorization: Bearer $TOKEN"
```

### 7.2 删除集合（可选）

```bash
curl -X DELETE $BASE_URL/collections/demo-collection \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ 步骤 8：系统健康检查

```bash
curl $BASE_URL/health
```

## 🚨 错误处理

### 常见错误响应

**401 未授权**:
```json
{
  "error": "HTTPException",
  "message": "Invalid authentication token",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**400 错误请求**:
```json
{
  "error": "ValidationError",
  "message": "content_type must be one of: ['text', 'json', 'document', 'structured']",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**404 未找到**:
```json
{
  "error": "HTTPException",
  "message": "Collection not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**500 内部服务器错误**:
```json
{
  "error": "InternalServerError",
  "message": "Internal server error",
  "details": {
    "error_type": "DatabaseConnectionError"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## ⚡ 性能优化建议

### 搜索性能优化
- **启用重排序**: 设置 `include_reranking: true` 获得更好结果
- **批量查询**: 处理多个搜索以提高吞吐量
- **图上下文**: 使用 `include_graph_context: true` 获得更丰富的结果
- **合理限制**: 保持 `limit` 在20以下以获得最佳重排序性能

### 重排序性能指标
- **准确性提升**: 相比纯向量搜索，相关性分数提高15-25%
- **处理速度**: 典型重排序操作0.8-1.5秒
- **吞吐量**: 根据批次大小，每秒10-25个结果
- **模型**: 使用 Llama-4-Scout-17b-16e-Instruct 进行智能重排序

## 📊 速率限制

- **内容摄取**: 每小时100个请求/用户
- **搜索操作**: 每小时1000个请求/用户
- **内容管理**: 每小时200个请求/用户 (编辑/删除操作)
- **管理操作**: 每小时50个请求/用户

## 🔧 Postman 设置

### 环境变量
创建 Postman 环境，设置以下变量：

```
base_url: http://54.68.80.214
auth_token: DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK
```

### 全局请求头
在 Postman 集合中设置以下请求头：

```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

### 快速测试序列

1. **健康检查**: `GET {{base_url}}/health`
2. **创建集合**: `POST {{base_url}}/collections`
3. **添加内容**: `POST {{base_url}}/content`
4. **搜索内容**: `POST {{base_url}}/search`
5. **获取块详情**: `GET {{base_url}}/content/{collection_name}/chunk/{chunk_id}`
6. **删除块**: `DELETE {{base_url}}/content/{collection_name}/chunk/{chunk_id}`
7. **查看操作历史**: `GET {{base_url}}/content/operations/history`
8. **列出集合**: `GET {{base_url}}/collections`

## 📝 搜索管道阶段

1. **向量搜索**: OpenAI 嵌入查找语义相似内容
2. **图扩展**: Neo4j 提供实体关系和上下文
3. **Cerebras 重排序**: LLM 智能重新排序结果以获得相关性
4. **推理合成**: 可选的分析和洞察生成

## 📈 监控和调试

- **请求ID**: 使用响应中的 `request_id` 跟踪性能
- **处理时间**: 监控响应中的 `processing_time` 字段
- **功能使用**: 检查 `capabilities_used` 查看哪些功能处于活动状态
- **重排序信息**: 查看 `reranking_info` 获取详细的重排序统计信息

## 📚 附加说明

- 系统使用 OpenAI 嵌入进行向量搜索
- 通过 Cerebras LLM 重排序增强相关性
- 所有内容都通过向量 (Qdrant) 和图 (Neo4j) 数据库处理
- 强制执行用户隔离 - 用户只能访问自己的集合
- 所有时间戳都是 UTC ISO 格式
- 生成请求ID用于跟踪和调试
- API 支持同步和异步处理

对于交互式API文档，请访问: `http://54.68.80.214/docs`