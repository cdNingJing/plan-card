/**
 * Enhanced Knowledge System API
 * 基于 http://54.68.80.214 的知识系统API封装
 */

const BASE_URL = 'http://54.68.80.214';
const TOKEN = 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK';

class KnowledgeApi {
  constructor() {
    this.baseUrl = BASE_URL;
    this.token = TOKEN;
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * 创建集合
   * @param {string} collectionName - 集合名称
   * @param {number} vectorSize - 向量大小，默认1536
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
   * 上传文本内容
   * @param {string} content - 文本内容
   * @param {string} collectionName - 集合名称
   * @param {Object} metadata - 元数据
   * @param {boolean} enableGraphStorage - 是否启用图存储
   * @param {boolean} enableReasoning - 是否启用推理
   * @returns {Promise<Object>}
   */
  async uploadContent(content, collectionName, metadata = {}, enableGraphStorage = true, enableReasoning = false) {
    try {
      const response = await fetch(`${this.baseUrl}/content`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          content: content,
          content_type: 'text',
          metadata: metadata,
          collection_name: collectionName,
          enable_graph_storage: enableGraphStorage,
          enable_reasoning: enableReasoning
        })
      });

      if (!response.ok) {
        throw new Error(`上传内容失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('上传内容时出错:', error);
      throw error;
    }
  }

  /**
   * 获取集合统计信息
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

  /**
   * 执行搜索查询
   * @param {string} query - 搜索查询
   * @param {string} collectionName - 集合名称
   * @param {number} limit - 返回结果数量限制
   * @param {boolean} includeGraphContext - 是否包含图上下文
   * @returns {Promise<Object>}
   */
  async search(query, collectionName, limit = 5, includeGraphContext = true) {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: query,
          limit: limit,
          collection_name: collectionName,
          include_graph_context: includeGraphContext
        })
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
   * 获取搜索建议
   * @param {string} query - 查询词
   * @param {number} limit - 建议数量限制
   * @returns {Promise<Object>}
   */
  async getSearchSuggestions(query, limit = 3) {
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

  /**
   * 列出所有集合
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
   * 删除集合
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

  /**
   * 获取集合中的文档列表 - 通过搜索功能实现
   * @param {string} collectionName - 集合名称
   * @param {number} limit - 返回结果数量限制
   * @param {number} offset - 偏移量
   * @returns {Promise<Object>}
   */
  async getDocuments(collectionName, limit = 50, offset = 0) {
    try {
      // 使用搜索功能获取文档列表，搜索空字符串获取所有文档
      const response = await this.search('', collectionName, limit, true);
      
      // 转换搜索结果为文档列表格式
      return {
        documents: response.results?.map(result => ({
          id: result.id,
          content: result.content,
          metadata: result.metadata,
          created_at: new Date().toISOString(), // 搜索API可能不返回创建时间
          score: result.score
        })) || []
      };
    } catch (error) {
      console.error('获取文档列表时出错:', error);
      throw error;
    }
  }

  /**
   * 获取单个文档详情
   * @param {string} collectionName - 集合名称
   * @param {string} documentId - 文档ID
   * @returns {Promise<Object>}
   */
  async getDocument(collectionName, documentId) {
    try {
      const response = await fetch(`${this.baseUrl}/content/${collectionName}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取文档详情失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取文档详情时出错:', error);
      throw error;
    }
  }

  /**
   * 更新文档内容
   * @param {string} collectionName - 集合名称
   * @param {string} documentId - 文档ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>}
   */
  async updateDocument(collectionName, documentId, updateData) {
    try {
      const response = await fetch(`${this.baseUrl}/content/${collectionName}/documents/${documentId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`更新文档失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('更新文档时出错:', error);
      throw error;
    }
  }

  /**
   * 删除文档
   * @param {string} collectionName - 集合名称
   * @param {string} documentId - 文档ID
   * @returns {Promise<Object>}
   */
  async deleteDocument(collectionName, documentId) {
    try {
      const response = await fetch(`${this.baseUrl}/content/${collectionName}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`删除文档失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('删除文档时出错:', error);
      throw error;
    }
  }

  /**
   * 系统健康检查
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error(`健康检查失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('健康检查时出错:', error);
      throw error;
    }
  }

  /**
   * 批量上传内容
   * @param {Array} contents - 内容数组，每个元素包含content、metadata等
   * @param {string} collectionName - 集合名称
   * @returns {Promise<Array>}
   */
  async batchUploadContent(contents, collectionName) {
    const results = [];
    
    for (const content of contents) {
      try {
        const result = await this.uploadContent(
          content.content,
          collectionName,
          content.metadata || {},
          content.enableGraphStorage !== false,
          content.enableReasoning || false
        );
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * 高级搜索 - 支持多个查询条件
   * @param {Object} searchOptions - 搜索选项
   * @returns {Promise<Object>}
   */
  async advancedSearch(searchOptions) {
    const {
      query,
      collectionName,
      limit = 5,
      includeGraphContext = true,
      filters = {},
      sortBy = 'relevance'
    } = searchOptions;

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: query,
          limit: limit,
          collection_name: collectionName,
          include_graph_context: includeGraphContext,
          filters: filters,
          sort_by: sortBy
        })
      });

      if (!response.ok) {
        throw new Error(`高级搜索失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('高级搜索时出错:', error);
      throw error;
    }
  }
}

// 创建默认实例
const knowledgeApi = new KnowledgeApi();

// 导出默认实例和类
export default knowledgeApi;
export { KnowledgeApi }; 