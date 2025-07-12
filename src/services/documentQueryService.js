/**
 * 文档查询服务
 * 调用后端向量数据库API进行智能查询
 */

class DocumentQueryService {
  constructor() {
    // 优先使用Python服务器，如果不可用则回退到Node.js服务器
    this.baseURL = 'http://localhost:3002/api' // Python服务器端口
    this.fallbackURL = 'http://localhost:3001/api' // Node.js服务器端口
  }

  // 智能查询文档
  async queryDocuments(query, options = {}) {
    try {
      console.log(`🔍 开始查询: "${query}"`)
      
      // 尝试Python服务器
      let response = await this.tryQuery(this.baseURL, query, options)
      
      // 如果Python服务器失败，尝试Node.js服务器
      if (!response.success && response.error) {
        console.log('⚠️ Python服务器不可用，尝试Node.js服务器...')
        response = await this.tryQuery(this.fallbackURL, query, options)
      }
      
      return response

    } catch (error) {
      console.error('❌ 文档查询失败:', error)
      return {
        success: false,
        error: error.message,
        query
      }
    }
  }

  // 尝试查询指定服务器
  async tryQuery(baseURL, query, options) {
    try {
      const response = await fetch(`${baseURL}/document-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          options: {
            topK: options.topK || 10,
            similarityThreshold: options.similarityThreshold || 0.1
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('📊 查询成功，找到', result.totalResults, '个结果')
        
        // 如果没有找到结果，返回空
        if (result.totalResults === 0) {
          return {
            success: true,
            query,
            results: [],
            totalResults: 0,
            message: '未找到相关信息'
          }
        }

        return result
      } else {
        console.error('❌ 查询失败:', result.error)
        return {
          success: false,
          error: result.error,
          query
        }
      }

    } catch (error) {
      console.error(`❌ ${baseURL} 查询失败:`, error)
      return {
        success: false,
        error: error.message,
        query
      }
    }
  }

  // 获取文档信息
  async getDocumentInfo(docId) {
    try {
      const response = await fetch(`${this.baseURL}/document-info/${docId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        console.error('❌ 获取文档信息失败:', result.error)
        return null
      }

    } catch (error) {
      console.error('❌ 获取文档信息失败:', error)
      return null
    }
  }
}

// 创建单例实例
const documentQueryService = new DocumentQueryService()

export default documentQueryService 