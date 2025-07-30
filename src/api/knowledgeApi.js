/**
 * Enhanced Knowledge System API
 * 基于 FE_API_GUIDE_v1.md 的最新API文档实现
 */

const BASE_URL = 'http://54.68.80.214';
// yue 环境
// const TOKEN = 'f04d823b1122ce4bd87f9911e64093aa3269c5ef'
// 测试环境 ning
const TOKEN = 'b781774904fb97b75f393cc6caec05869a511cad'
// huang
// const TOKEN = '28abe80c479c91d957f6af8df0c981f65bbcba27'

class KnowledgeApi {
  constructor() {
    this.baseUrl = BASE_URL;
    this.token = TOKEN;
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // ==================== 1. System Endpoints ====================

  /**
   * GET / - 获取系统基本信息
   * @returns {Promise<Object>}
   */
  async getSystemInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`获取系统信息失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取系统信息时出错:', error);
      throw error;
    }
  }

  /**
   * GET /health - 系统健康检查
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`健康检查失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('健康检查时出错:', error);
      throw error;
    }
  }

  // ==================== 2. Content Management Endpoints ====================

  /**
   * POST /content - 上传内容
   * @param {string|Object} content - 内容（文本、JSON对象或结构化数据）
   * @param {string} contentType - 内容类型：text, json, document, structured
   * @param {Object} metadata - 元数据
   * @param {string} collectionName - 集合名称
   * @param {boolean} enableGraphStorage - 是否启用图存储
   * @param {boolean} enableReasoning - 是否启用推理
   * @returns {Promise<Object>}
   */
  async uploadContent(content, contentType = 'text', metadata = {}, collectionName = null, enableGraphStorage = true, enableReasoning = false) {
    try {
      // 验证必需参数
      if (!content) {
        throw new Error('内容不能为空');
      }

      if (!contentType || !['text', 'json', 'document', 'structured'].includes(contentType)) {
        throw new Error('内容类型必须是: text, json, document, structured 之一');
      }

      // 构建请求体，与API文档完全匹配
      const requestBody = {
        content: content,
        content_type: contentType,
        metadata: metadata || {},
        enable_graph_storage: enableGraphStorage,
        enable_reasoning: enableReasoning
      };

      // 如果指定了集合名称，添加到请求体中
      if (collectionName) {
        requestBody.collection_name = collectionName;
      }

      console.log('上传内容请求:', {
        url: `${this.baseUrl}/content`,
        method: 'POST',
        headers: this.headers,
        body: requestBody
      });

      const response = await fetch(`${this.baseUrl}/content`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('上传内容响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`上传内容失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('上传内容成功:', result);
      return result;
    } catch (error) {
      console.error('上传内容时出错:', error);
      throw error;
    }
  }

  /**
   * 上传文本内容（便捷方法）
   * @param {string} content - 文本内容
   * @param {string} collectionName - 集合名称
   * @param {Object} metadata - 元数据
   * @param {boolean} enableGraphStorage - 是否启用图存储
   * @param {boolean} enableReasoning - 是否启用推理
   * @returns {Promise<Object>}
   */
  async uploadTextContent(content, collectionName = null, metadata = {}, enableGraphStorage = true, enableReasoning = false) {
    return this.uploadContent(content, 'text', metadata, collectionName, enableGraphStorage, enableReasoning);
  }

  /**
   * 上传JSON内容（便捷方法）
   * @param {Object} content - JSON内容
   * @param {string} collectionName - 集合名称
   * @param {Object} metadata - 元数据
   * @param {boolean} enableGraphStorage - 是否启用图存储
   * @param {boolean} enableReasoning - 是否启用推理
   * @returns {Promise<Object>}
   */
  async uploadJsonContent(content, collectionName = null, metadata = {}, enableGraphStorage = true, enableReasoning = false) {
    return this.uploadContent(content, 'json', metadata, collectionName, enableGraphStorage, enableReasoning);
  }

  /**
   * 上传文档内容（便捷方法）
   * @param {string} content - 文档内容
   * @param {string} collectionName - 集合名称
   * @param {Object} metadata - 元数据
   * @param {boolean} enableGraphStorage - 是否启用图存储
   * @param {boolean} enableReasoning - 是否启用推理
   * @returns {Promise<Object>}
   */
  async uploadDocumentContent(content, collectionName = null, metadata = {}, enableGraphStorage = true, enableReasoning = false) {
    return this.uploadContent(content, 'document', metadata, collectionName, enableGraphStorage, enableReasoning);
  }

  /**
   * 上传结构化内容（便捷方法）
   * @param {Object} content - 结构化数据
   * @param {string} collectionName - 集合名称
   * @param {Object} metadata - 元数据
   * @param {boolean} enableGraphStorage - 是否启用图存储
   * @param {boolean} enableReasoning - 是否启用推理
   * @returns {Promise<Object>}
   */
  async uploadStructuredContent(content, collectionName = null, metadata = {}, enableGraphStorage = true, enableReasoning = false) {
    return this.uploadContent(content, 'structured', metadata, collectionName, enableGraphStorage, enableReasoning);
  }

  /**
   * GET /content/{collection_name}/stats - 获取集合统计信息
   * @param {string} collectionName - 集合名称
   * @returns {Promise<Object>}
   */
  async getCollectionStats(collectionName) {
    try {
      const response = await fetch(`${this.baseUrl}/content/${collectionName}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取统计信息失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取统计信息时出错:', error);
      throw error;
    }
  }

  // ==================== 3. Search Endpoints ====================

  /**
   * POST /search - 增强搜索
   * @param {string} query - 搜索查询
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>}
   */
  async search(query, options = {}) {
    try {
      const {
        limit = 10,
        collectionName = null,
        filters = {},
        includeGraphContext = true,
        includeReranking = true,
        includeReasoning = true,
        scoreThreshold = 0
      } = options;

      const requestBody = {
        query: query,
        limit: limit,
        filters: filters,
        include_graph_context: includeGraphContext,
        include_reranking: includeReranking,
        include_reasoning: includeReasoning,
        score_threshold: scoreThreshold
      };

      if (collectionName) {
        requestBody.collection_name = collectionName;
      }

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('搜索时出错:', error);
      throw error;
    }
  }

  /**
   * POST /search/rerank - 高级重排序搜索
   * @param {string} query - 搜索查询
   * @param {Object} options - 重排序选项
   * @returns {Promise<Object>}
   */
  async rerankSearch(query, options = {}) {
    try {
      const {
        limit = 10,
        collectionName = null,
        includeExplanation = true,
        rerankingStrategy = 'cerebras_llm'
      } = options;

      // 构建请求体，与curl命令完全匹配
      const requestBody = {
        query: query,
        limit: limit,
        include_explanation: includeExplanation,
        reranking_strategy: rerankingStrategy
      };

      // 如果指定了集合名称，添加到请求体中
      if (collectionName) {
        requestBody.collection_name = collectionName;
      }

      console.log('重排序搜索请求:', {
        url: `${this.baseUrl}/search/rerank`,
        method: 'POST',
        headers: this.headers,
        body: requestBody
      });

      const response = await fetch(`${this.baseUrl}/search/rerank`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('重排序搜索响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`重排序搜索失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('重排序搜索结果:', result);
      return result;
    } catch (error) {
      console.error('重排序搜索时出错:', error);
      throw error;
    }
  }

  /**
   * GET /search/suggestions - 获取搜索建议
   * @param {string} query - 查询词
   * @param {number} limit - 建议数量
   * @returns {Promise<Object>}
   */
  async getSearchSuggestions(query, limit = 10) {
    try {
      const params = new URLSearchParams({
        query: query,
        limit: limit.toString()
      });

      const response = await fetch(`${this.baseUrl}/search/suggestions?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取搜索建议失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取搜索建议时出错:', error);
      throw error;
    }
  }

  // ==================== 4. Content Management ====================

  /**
   * GET /content/{collection_name}/chunk/{chunk_id} - 获取块详情
   * @param {string} collectionName - 集合名称
   * @param {string} chunkId - 块ID
   * @returns {Promise<Object>}
   */
  async getChunkDetails(collectionName, chunkId) {
    try {
      const response = await fetch(`${this.baseUrl}/content/${collectionName}/chunk/${chunkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取块详情失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取块详情时出错:', error);
      throw error;
    }
  }

  /**
   * DELETE /content/{collection_name}/chunk/{chunk_id} - 删除块
   * @param {string} collectionName - 集合名称
   * @param {string} chunkId - 块ID
   * @returns {Promise<Object>}
   */
  async deleteChunk(collectionName, chunkId) {
    try {
      const response = await fetch(`${this.baseUrl}/content/${collectionName}/chunk/${chunkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`删除块失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('删除块时出错:', error);
      throw error;
    }
  }

  /**
   * PUT /content/{collection_name}/chunk/{chunk_id} - 编辑块
   * @param {string} collectionName - 集合名称
   * @param {string} chunkId - 块ID
   * @param {string} newContent - 新内容
   * @param {Object} newMetadata - 新元数据
   * @returns {Promise<Object>}
   */
  async editChunk(collectionName, chunkId, newContent, newMetadata = {}) {
    try {
      // 根据错误信息，API期望在请求体中包含所有字段
      const requestBody = {
        collection_name: collectionName,
        chunk_id: chunkId,
        new_content: newContent,
        new_metadata: newMetadata
      };
      // 调试日志
      console.log('编辑块请求:', {
        url: `${this.baseUrl}/content/${collectionName}/chunk/${chunkId}`,
        method: 'PUT',
        body: requestBody
      });
      const response = await fetch(`${this.baseUrl}/content/${collectionName}/chunk/${chunkId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('编辑块响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`编辑块失败: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('编辑块时出错:', error);
      throw error;
    }
  }

  /**
   * GET /content/operations/history - 获取操作历史
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>}
   */
  async getOperationHistory(options = {}) {
    try {
      const { operationType = '', limit = 50 } = options;
      const params = new URLSearchParams();
      
      if (operationType) {
        params.append('operation_type', operationType);
      }
      if (limit) {
        params.append('limit', limit.toString());
      }

      const response = await fetch(`${this.baseUrl}/content/operations/history?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取操作历史失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取操作历史时出错:', error);
      throw error;
    }
  }

  // ==================== 5. Collection Management Endpoints ====================

  /**
   * POST /collections - 创建集合
   * @param {string} collectionName - 集合名称
   * @param {number} vectorSize - 向量大小
   * @param {string} description - 集合描述
   * @returns {Promise<Object>}
   */
  async createCollection(collectionName, vectorSize = 1536, description = '') {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          collection_name: collectionName,
          vector_size: vectorSize,
          description: description
        })
      });

      if (!response.ok) {
        throw new Error(`创建集合失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('创建集合时出错:', error);
      throw error;
    }
  }

  /**
   * GET /collections - 列出集合
   * @returns {Promise<Object>}
   */
  async listCollections() {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取集合列表失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取集合列表时出错:', error);
      throw error;
    }
  }

  /**
   * DELETE /collections/{collection_name} - 删除集合
   * @param {string} collectionName - 集合名称
   * @returns {Promise<Object>}
   */
  async deleteCollection(collectionName) {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`删除集合失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('删除集合时出错:', error);
      throw error;
    }
  }

  // ==================== 便捷方法和工具函数 ====================

  /**
   * 测试API连接
   * @returns {Promise<Object>}
   */
  async testConnection() {
    try {
      const [health, systemInfo] = await Promise.all([
        this.healthCheck(),
        this.getSystemInfo()
      ]);

      return {
        connected: true,
        health,
        systemInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取API使用统计
   * @returns {Promise<Object>}
   */
  async getApiUsageStats() {
    try {
      const health = await this.healthCheck();
      return {
        totalRequests: health.system_metrics?.total_requests || 0,
        activeConnections: health.system_metrics?.active_connections || 0,
        memoryUsage: health.system_metrics?.memory_usage || 'N/A',
        activeUsers: health.active_users || 0,
        totalCollections: health.total_collections || 0,
        uptime: health.uptime || 'N/A'
      };
    } catch (error) {
      console.error('获取API使用统计时出错:', error);
      throw error;
    }
  }

  /**
   * 检查集合是否存在
   * @param {string} collectionName - 集合名称
   * @returns {Promise<boolean>}
   */
  async collectionExists(collectionName) {
    try {
      await this.getCollectionStats(collectionName);
      return true;
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取用户统计信息
   * @returns {Promise<Object>}
   */
  async getUserStats() {
    try {
      const collections = await this.listCollections();
      const stats = {
        totalCollections: collections.collections?.length || 0,
        collections: []
      };

      for (const collectionName of collections.collections || []) {
        try {
          const collectionStats = await this.getCollectionStats(collectionName);
          stats.collections.push({
            name: collectionName,
            stats: collectionStats.statistics
          });
        } catch (error) {
          console.warn(`获取集合 ${collectionName} 统计信息失败:`, error);
        }
      }

      return stats;
    } catch (error) {
      console.error('获取用户统计信息时出错:', error);
      throw error;
    }
  }
}

// 创建默认实例
const knowledgeApi = new KnowledgeApi();

// 导出默认实例和类
export default knowledgeApi;
export { KnowledgeApi }; 