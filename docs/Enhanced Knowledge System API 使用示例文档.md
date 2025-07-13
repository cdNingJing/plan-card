# Enhanced Knowledge System API 使用示例文档

## 基本信息
- **Base URL**: `http://54.68.80.214`
- **Token**: `DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK`
- **Collection 名称**: `demo-collection`

本文档通过 curl 命令演示从创建集合、上传内容到搜索查询的一整套操作流程。

## 🛠 环境准备

你可以直接将以下命令粘贴到终端中运行。建议将变量保存为本地 shell 环境变量：

```bash
export BASE_URL=http://54.68.80.214
export TOKEN=DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK
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

## ✅ 步骤 2：上传文本内容

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

## ✅ 步骤 3：查看集合统计信息

```bash
curl -X GET $BASE_URL/content/demo-collection/stats \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ 步骤 4：执行搜索查询

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

## ✅ 步骤 5：获取搜索建议

```bash
curl -G $BASE_URL/search/suggestions \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "query=人工智能" \
  --data-urlencode "limit=3"
```

## ✅ 步骤 6：列出当前集合

```bash
curl -X GET $BASE_URL/collections \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ 步骤 7：删除集合（可选）

```bash
curl -X DELETE $BASE_URL/collections/demo-collection \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ 步骤 8：系统健康检查

```bash
curl $BASE_URL/health
```