/**
 * 向量化处理服务
 * 负责文档预处理、向量生成和相似度匹配
 */

// 简单的文本向量化（模拟）
class SimpleVectorizer {
  constructor() {
    this.wordVectors = new Map()
    this.documentVectors = new Map()
    this.initializeWordVectors()
  }

  // 初始化词汇向量（模拟）
  initializeWordVectors() {
    const commonWords = [
      '喜欢', '吃', '食物', '菜', '肉', '鱼', '蔬菜', '水果', '饮料',
      '妈妈', '爸爸', '家人', '孩子', '孙子', '朋友',
      '健康', '血压', '糖尿病', '过敏', '药物',
      '烹饪', '做饭', '早餐', '午餐', '晚餐',
      '购物', '超市', '菜市场', '价格', '省钱',
      '活动', '散步', '广场舞', '看电视', '聊天',
      '性格', '细心', '节俭', '勤劳', '传统'
    ]

    commonWords.forEach((word, index) => {
      // 生成简单的随机向量（实际应用中应该使用预训练模型）
      const vector = new Array(50).fill(0).map(() => Math.random() - 0.5)
      this.wordVectors.set(word, vector)
    })
  }

  // 文本分词（简单实现）
  tokenize(text) {
    return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/).filter(word => word.length > 0)
  }

  // 计算文本向量
  getTextVector(text) {
    const tokens = this.tokenize(text)
    const vector = new Array(50).fill(0)
    let validTokens = 0

    tokens.forEach(token => {
      if (this.wordVectors.has(token)) {
        const wordVector = this.wordVectors.get(token)
        for (let i = 0; i < vector.length; i++) {
          vector[i] += wordVector[i]
        }
        validTokens++
      }
    })

    // 归一化
    if (validTokens > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= validTokens
      }
    }

    return vector
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
}

// 文档向量化服务
class DocumentVectorService {
  constructor() {
    this.vectorizer = new SimpleVectorizer()
    this.documents = new Map()
    this.documentVectors = new Map()
    this.fieldVectors = new Map()
  }

  // 加载文档
  async loadDocument(docId, documentData) {
    this.documents.set(docId, documentData)
    await this.processDocument(docId, documentData)
  }

  // 处理文档，生成字段级向量
  async processDocument(docId, documentData) {
    const fieldVectors = new Map()
    
    // 递归处理文档的所有字段
    this.extractFields(documentData, '', fieldVectors)
    
    this.fieldVectors.set(docId, fieldVectors)
    
    // 生成整个文档的向量
    const allText = JSON.stringify(documentData)
    const docVector = this.vectorizer.getTextVector(allText)
    this.documentVectors.set(docId, docVector)
    
    console.log(`📄 文档 ${docId} 向量化完成，包含 ${fieldVectors.size} 个字段`)
  }

  // 递归提取文档字段
  extractFields(obj, prefix, fieldVectors) {
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'string') {
        // 字符串字段直接向量化
        const vector = this.vectorizer.getTextVector(value)
        fieldVectors.set(fieldPath, {
          value,
          vector,
          type: 'string'
        })
      } else if (Array.isArray(value)) {
        // 数组字段，将每个元素转换为字符串后向量化
        const arrayText = value.join(' ')
        const vector = this.vectorizer.getTextVector(arrayText)
        fieldVectors.set(fieldPath, {
          value,
          vector,
          type: 'array'
        })
      } else if (typeof value === 'object' && value !== null) {
        // 对象字段，递归处理
        this.extractFields(value, fieldPath, fieldVectors)
      } else {
        // 其他类型（数字、布尔值等）
        const stringValue = String(value)
        const vector = this.vectorizer.getTextVector(stringValue)
        fieldVectors.set(fieldPath, {
          value,
          vector,
          type: typeof value
        })
      }
    }
  }

  // 查询相关字段
  async queryFields(query, docId, topK = 5) {
    const queryVector = this.vectorizer.getTextVector(query)
    const fieldVectors = this.fieldVectors.get(docId)
    
    if (!fieldVectors) {
      console.warn(`⚠️ 文档 ${docId} 未找到字段向量`)
      return []
    }

    const similarities = []
    
    for (const [fieldPath, fieldData] of fieldVectors) {
      const similarity = this.vectorizer.cosineSimilarity(queryVector, fieldData.vector)
      similarities.push({
        fieldPath,
        value: fieldData.value,
        type: fieldData.type,
        similarity
      })
    }

    // 按相似度排序，返回topK个结果
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  // 查询多个文档
  async queryMultipleDocuments(query, docIds, topK = 5) {
    const allResults = []
    
    for (const docId of docIds) {
      const results = await this.queryFields(query, docId, topK)
      allResults.push({
        docId,
        results
      })
    }

    return allResults
  }

  // 获取字段值
  getFieldValue(docId, fieldPath) {
    const fieldVectors = this.fieldVectors.get(docId)
    if (!fieldVectors || !fieldVectors.has(fieldPath)) {
      return null
    }
    return fieldVectors.get(fieldPath).value
  }

  // 获取文档信息
  getDocumentInfo(docId) {
    return this.documents.get(docId)
  }

  // 列出所有文档
  listDocuments() {
    return Array.from(this.documents.keys())
  }
}

// 创建单例实例
const vectorService = new DocumentVectorService()

export default vectorService 