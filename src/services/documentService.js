import { documentTypes, getIcon } from '@/config/iconLibrary.js'

// 文档服务类
class DocumentService {
  constructor() {
    this.documents = [
      // 真实文档数据
      { id: 1, name: '副业计划启动器.md', type: 'markdown', category: 'document', typeLabel: 'MD', description: '城市轻旅手册项目启动计划', content: '副业启动计划书 - 版本 1.0，项目名称：城市轻旅手册（本地生活内容服务）' },
      { id: 2, name: '像素日常记录001.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '日常生活片段记录', content: '超市收银员头发有点像我初中同桌。奇怪，居然记得那个发旋。' },
      { id: 3, name: '我的2028年生活模拟.pdf', type: 'pdf', category: 'document', typeLabel: 'PDF', description: '未来生活规划模拟文档', content: '2028年生活模拟计划书' },
      { id: 4, name: '人生回音室.pdf', type: 'pdf', category: 'document', typeLabel: 'PDF', description: '人生反思和思考记录', content: '人生回音室 - 深度思考记录' },
      { id: 5, name: '碎片化生活语录.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '生活感悟和语录收集', content: '碎片化的生活感悟和语录' },
      { id: 6, name: '梦想生活的清单.md', type: 'markdown', category: 'document', typeLabel: 'MD', description: '理想生活规划和清单', content: '梦想生活的清单 - 居住、工作、身心、关系的理想状态' },
      { id: 7, name: '我理解的自己.json', type: 'json', category: 'document', typeLabel: 'JSON', description: '个人性格和价值观分析', content: '个人性格特征、价值观、恐惧和治愈方法的JSON数据' },
      { id: 8, name: '分开的第100天.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '情感记录和反思', content: '分开第100天的情感记录和反思' },
      { id: 9, name: '年终职场总结2025.pdf', type: 'pdf', category: 'document', typeLabel: 'PDF', description: '2025年职场工作总结', content: '2025年职场工作总结和反思' }
    ]
  }

  // 获取所有文档
  getAllDocuments() {
    return this.documents
  }

  // 根据类型获取文档
  getDocumentsByType(type) {
    return this.documents.filter(doc => doc.type === type)
  }

  // 根据分类获取文档
  getDocumentsByCategory(category) {
    return this.documents.filter(doc => doc.category === category)
  }

  // 获取文档详情
  getDocumentById(id) {
    return this.documents.find(doc => doc.id === id)
  }

  // 获取文档图标
  getDocumentIcon(type, category = 'document') {
    return getIcon(type, category)
  }

  // 添加新文档
  addDocument(document) {
    const newDoc = {
      id: Date.now(),
      ...document
    }
    this.documents.push(newDoc)
    return newDoc
  }

  // 更新文档
  updateDocument(id, updates) {
    const index = this.documents.findIndex(doc => doc.id === id)
    if (index !== -1) {
      this.documents[index] = { ...this.documents[index], ...updates }
      return this.documents[index]
    }
    return null
  }

  // 删除文档
  deleteDocument(id) {
    const index = this.documents.findIndex(doc => doc.id === id)
    if (index !== -1) {
      const deleted = this.documents.splice(index, 1)[0]
      return deleted
    }
    return null
  }

  // 搜索文档
  searchDocuments(query) {
    const lowerQuery = query.toLowerCase()
    return this.documents.filter(doc => 
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.description.toLowerCase().includes(lowerQuery) ||
      doc.typeLabel.toLowerCase().includes(lowerQuery)
    )
  }

  // 获取文档统计信息
  getDocumentStats() {
    const stats = {
      total: this.documents.length,
      byCategory: {},
      byType: {}
    }

    this.documents.forEach(doc => {
      // 按分类统计
      if (!stats.byCategory[doc.category]) {
        stats.byCategory[doc.category] = 0
      }
      stats.byCategory[doc.category]++

      // 按类型统计
      if (!stats.byType[doc.type]) {
        stats.byType[doc.type] = 0
      }
      stats.byType[doc.type]++
    })

    return stats
  }

  // 获取文档类型映射
  getDocumentTypes() {
    return documentTypes
  }
}

// 创建单例实例
const documentService = new DocumentService()

export default documentService 