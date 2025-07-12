# Python向量数据库服务

## 概述

这是一个基于Python的高级向量数据库服务，使用先进的NLP技术实现智能文档匹配。相比Node.js版本，Python版本具有以下优势：

- **更先进的NLP模型**：使用Sentence Transformers进行语义搜索
- **更好的中文支持**：使用jieba进行中文分词和词性标注
- **多种搜索策略**：语义向量、TF-IDF、关键词、实体、模糊搜索等
- **智能姓名识别**：专门针对姓名查询的优化
- **更高的匹配精度**：多策略融合，提高召回率和准确率

## 功能特点

### 1. 多策略搜索
- **语义向量搜索**：使用Sentence Transformers进行语义相似度计算
- **TF-IDF搜索**：传统的词频-逆文档频率搜索
- **关键词搜索**：基于关键词匹配的搜索
- **实体搜索**：专门识别人名、地名、食物等实体
- **模糊搜索**：使用fuzzywuzzy进行模糊匹配
- **姓名专门搜索**：针对姓名查询的特殊优化

### 2. 智能实体识别
- **人名识别**：李秀英、林美华等
- **食物偏好**：红烧肉、糖醋里脊等
- **活动偏好**：园艺、烹饪、广场舞等
- **健康信息**：高血压、过敏等
- **性格特点**：细心、节俭等

### 3. 中文优化
- 使用jieba进行中文分词
- 中文停用词过滤
- 中文实体词典
- 中文姓名专门处理

## 安装和启动

### 1. 安装依赖
```bash
cd server
pip install -r requirements.txt
```

### 2. 启动Python服务器
```bash
# 方法1：使用启动脚本
python start_python_server.py

# 方法2：直接启动
cd server
python python_server.py
```

### 3. 测试服务
```bash
python test_python_vector_service.py
```

## API接口

### 文档查询
```
POST /api/document-query
```

请求体：
```json
{
  "query": "妈妈的名字",
  "options": {
    "similarity_threshold": 0.15,
    "max_results": 20
  }
}
```

响应：
```json
{
  "success": true,
  "query": "妈妈的名字",
  "results": [
    {
      "docId": "doc_001",
      "document": "李秀英，1966年出生，退休教师，居住在北京",
      "metadata": {...},
      "similarity": 0.95,
      "strategies": ["name-search", "semantic-vector"]
    }
  ],
  "totalResults": 1,
  "searchStrategy": "python-professional-multi-strategy"
}
```

## 测试用例

### 姓名查询
- "妈妈的名字" → 返回包含"李秀英"的文档
- "妈妈叫什么" → 返回包含"李秀英"的文档
- "李秀英是谁" → 返回包含"李秀英"的文档

### 食物偏好查询
- "妈妈喜欢吃什么" → 返回包含食物偏好的文档
- "妈妈有什么忌口" → 返回包含忌口信息的文档

### 健康信息查询
- "妈妈的健康状况" → 返回包含健康信息的文档
- "妈妈有什么过敏" → 返回包含过敏信息的文档

### 活动偏好查询
- "妈妈有什么爱好" → 返回包含活动偏好的文档
- "妈妈每天做什么" → 返回包含日常活动的文档

## 配置选项

### 搜索选项
```python
search_options = {
    'similarity_threshold': 0.15,  # 相似度阈值
    'max_results': 20,            # 最大结果数
    'embedding_model': 'paraphrase-multilingual-MiniLM-L12-v2'  # 嵌入模型
}
```

### 实体词典
```python
entity_dict = {
    'names': ['李秀英', '林美华', 'Lin Meihua', '妈妈', '父亲', '爸爸'],
    'foods': ['红烧肉', '糖醋里脊', '清蒸鲈鱼', ...],
    'activities': ['园艺', '烹饪', '广场舞', ...],
    'places': ['北京', '海淀区', '万柳中路小区', ...],
    'health': ['高血压', '糖尿病前期', '降压药', ...],
    'personality': ['细心', '节俭', '关心家人', ...]
}
```

## 性能优化

### 1. 模型选择
- 使用轻量级的`paraphrase-multilingual-MiniLM-L12-v2`模型
- 支持多语言，特别优化中文

### 2. 缓存机制
- 文档嵌入向量预计算
- TF-IDF矩阵预构建
- 实体词典预加载

### 3. 搜索优化
- 多策略并行搜索
- 智能结果融合
- 相似度阈值过滤

## 故障排除

### 1. 依赖安装失败
```bash
# 升级pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt
```

### 2. 模型下载失败
```bash
# 手动下载模型
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"
```

### 3. 内存不足
- 减少`max_results`参数
- 提高`similarity_threshold`参数
- 使用更小的嵌入模型

## 与Node.js版本对比

| 特性 | Python版本 | Node.js版本 |
|------|------------|-------------|
| 语义搜索 | ✅ Sentence Transformers | ❌ TF-IDF简化版 |
| 中文分词 | ✅ jieba | ❌ 简单字符分割 |
| 实体识别 | ✅ 多类别实体 | ⚠️ 基础实体 |
| 模糊搜索 | ✅ fuzzywuzzy | ✅ Fuse.js |
| 姓名搜索 | ✅ 专门优化 | ⚠️ 基础支持 |
| 性能 | ✅ 高精度 | ⚠️ 中等精度 |
| 内存使用 | ⚠️ 较高 | ✅ 较低 |

## 总结

Python版本的向量数据库服务提供了更先进的NLP技术和更好的中文支持，特别适合需要高精度文档匹配的应用场景。通过多策略搜索和智能结果融合，能够准确回答各种类型的查询，包括姓名、偏好、健康信息等。 