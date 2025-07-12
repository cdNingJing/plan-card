/**
 * 向量数据库服务
 * 使用前端向量数据库实现智能语义检索
 */

// 简单的TF-IDF向量化器
class TFIDFVectorizer {
  constructor() {
    this.vocabulary = new Map()
    this.idf = new Map()
    this.documents = []
    this.vectors = []
  }

  // 中文分词（简单实现）
  tokenize(text) {
    // 移除标点符号，按空格和常见分隔符分割
    return text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
  }

  // 计算词频
  calculateTF(tokens) {
    const tf = new Map()
    const total = tokens.length
    
    tokens.forEach(token => {
      tf.set(token, (tf.get(token) || 0) + 1)
    })
    
    // 归一化
    for (const [token, count] of tf) {
      tf.set(token, count / total)
    }
    
    return tf
  }

  // 计算逆文档频率
  calculateIDF(documents) {
    const docCount = documents.length
    const tokenDocCount = new Map()
    
    documents.forEach(doc => {
      const tokens = new Set(this.tokenize(doc))
      tokens.forEach(token => {
        tokenDocCount.set(token, (tokenDocCount.get(token) || 0) + 1)
      })
    })
    
    for (const [token, count] of tokenDocCount) {
      this.idf.set(token, Math.log(docCount / count))
    }
  }

  // 构建词汇表
  buildVocabulary(documents) {
    const allTokens = new Set()
    
    documents.forEach(doc => {
      const tokens = this.tokenize(doc)
      tokens.forEach(token => allTokens.add(token))
    })
    
    let index = 0
    for (const token of allTokens) {
      this.vocabulary.set(token, index++)
    }
  }

  // 训练向量化器
  fit(documents) {
    this.documents = documents
    this.buildVocabulary(documents)
    this.calculateIDF(documents)
    
    // 为每个文档生成向量
    this.vectors = documents.map(doc => this.transform([doc])[0])
  }

  // 转换文本为向量
  transform(texts) {
    const vectors = []
    
    texts.forEach(text => {
      const tokens = this.tokenize(text)
      const tf = this.calculateTF(tokens)
      const vector = new Array(this.vocabulary.size).fill(0)
      
      for (const [token, tfValue] of tf) {
        if (this.vocabulary.has(token)) {
          const index = this.vocabulary.get(token)
          const idfValue = this.idf.get(token) || 0
          vector[index] = tfValue * idfValue
        }
      }
      
      vectors.push(vector)
    })
    
    return vectors
  }
}

// 向量数据库类
class VectorDB {
  constructor() {
    this.vectorizer = new TFIDFVectorizer()
    this.documents = []
    this.vectors = []
    this.metadata = []
  }

  // 添加文档
  addDocument(text, metadata = {}) {
    this.documents.push(text)
    this.metadata.push(metadata)
  }

  // 构建索引
  buildIndex() {
    this.vectorizer.fit(this.documents)
    this.vectors = this.vectorizer.vectors
    console.log(`📊 向量数据库索引构建完成，共 ${this.documents.length} 个文档`)
  }

  // 计算余弦相似度
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
    return denominator === 0 ? 0 : dotProduct / denominator
  }

  // 搜索相似文档
  search(query, topK = 5) {
    const queryVector = this.vectorizer.transform([query])[0]
    const similarities = []

    for (let i = 0; i < this.vectors.length; i++) {
      const similarity = this.cosineSimilarity(queryVector, this.vectors[i])
      similarities.push({
        index: i,
        document: this.documents[i],
        metadata: this.metadata[i],
        similarity
      })
    }

    // 按相似度排序
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  // 获取文档
  getDocument(index) {
    return {
      text: this.documents[index],
      metadata: this.metadata[index]
    }
  }

  // 获取所有文档
  getAllDocuments() {
    return this.documents.map((doc, index) => ({
      text: doc,
      metadata: this.metadata[index]
    }))
  }
}

// 智能文档处理器
class SmartDocumentProcessor {
  constructor() {
    this.vectorDB = new VectorDB()
    this.processed = false
  }

  // 从JSON文档中提取文本片段
  extractTextSegments(jsonDoc, prefix = '') {
    const segments = []
    
    for (const [key, value] of Object.entries(jsonDoc)) {
      const currentPath = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'string') {
        segments.push({
          text: value,
          path: currentPath,
          type: 'string'
        })
      } else if (Array.isArray(value)) {
        // 数组转换为文本
        const arrayText = value.join('、')
        segments.push({
          text: arrayText,
          path: currentPath,
          type: 'array',
          originalValue: value
        })
      } else if (typeof value === 'object' && value !== null) {
        // 递归处理嵌套对象
        segments.push(...this.extractTextSegments(value, currentPath))
      } else {
        // 其他类型转换为字符串
        segments.push({
          text: String(value),
          path: currentPath,
          type: typeof value
        })
      }
    }
    
    return segments
  }

  // 处理文档
  processDocument(docId, jsonDoc) {
    console.log(`📄 处理文档: ${docId}`)
    
    const segments = this.extractTextSegments(jsonDoc)
    
    segments.forEach(segment => {
      this.vectorDB.addDocument(segment.text, {
        docId,
        path: segment.path,
        type: segment.type,
        originalValue: segment.originalValue
      })
    })
    
    console.log(`✅ 文档 ${docId} 处理完成，提取了 ${segments.length} 个文本片段`)
  }

  // 构建索引
  buildIndex() {
    this.vectorDB.buildIndex()
    this.processed = true
  }

  // 智能查询
  async query(query, options = {}) {
    if (!this.processed) {
      throw new Error('请先调用 buildIndex() 构建索引')
    }

    const {
      topK = 10,
      similarityThreshold = 0.1,
      groupByDocument = true
    } = options

    console.log(`🔍 智能查询: "${query}"`)
    
    const results = this.vectorDB.search(query, topK)
    
    // 过滤低相似度结果
    const filteredResults = results.filter(result => 
      result.similarity >= similarityThreshold
    )

    // 按文档分组
    if (groupByDocument) {
      const grouped = new Map()
      
      filteredResults.forEach(result => {
        const docId = result.metadata.docId
        if (!grouped.has(docId)) {
          grouped.set(docId, [])
        }
        grouped.get(docId).push(result)
      })

      return {
        query,
        results: Array.from(grouped.entries()).map(([docId, results]) => ({
          docId,
          results: results.sort((a, b) => b.similarity - a.similarity)
        })),
        totalResults: filteredResults.length
      }
    }

    return {
      query,
      results: filteredResults,
      totalResults: filteredResults.length
    }
  }

  // 获取文档信息
  getDocumentInfo(docId) {
    const docResults = this.vectorDB.getAllDocuments()
      .filter(doc => doc.metadata.docId === docId)
    
    if (docResults.length === 0) return null
    
    // 重建原始文档结构
    const reconstructed = {}
    docResults.forEach(doc => {
      const pathParts = doc.metadata.path.split('.')
      let current = reconstructed
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (!current[part]) {
          current[part] = {}
        }
        current = current[part]
      }
      
      const lastPart = pathParts[pathParts.length - 1]
      current[lastPart] = doc.metadata.originalValue || doc.text
    })
    
    return reconstructed
  }
}

// 创建单例实例
const vectorDBService = new SmartDocumentProcessor()

export default vectorDBService 