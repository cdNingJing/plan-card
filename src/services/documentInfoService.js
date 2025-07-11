import documentService from '@/services/documentService.js'
import { AVAILABLE_TOOLS } from '@/config/infoDenseConfig.js'

class DocumentInfoService {
  constructor() {
    this.documents = []
    this.tools = AVAILABLE_TOOLS
    this.initializeDocuments()
  }

  // 初始化文档信息
  initializeDocuments() {
    this.documents = documentService.getAllDocuments()
  }

  // 获取所有可用文档信息
  getAllDocuments() {
    return this.documents.map(doc => ({
      name: doc.name,
      description: doc.description,
      type: doc.type,
      category: doc.category
    }))
  }

  // 获取所有可用工具信息
  getAllTools() {
    return this.tools.map(tool => ({
      title: tool.title,
      description: tool.description,
      component: tool.component
    }))
  }

  // 根据关键词搜索相关文档
  searchRelevantDocuments(keywords) {
    const relevantDocs = []
    const searchTerms = Array.isArray(keywords) ? keywords : [keywords]
    
    for (const doc of this.documents) {
      const docText = `${doc.name} ${doc.description} ${doc.content || ''}`.toLowerCase()
      
      for (const term of searchTerms) {
        if (docText.includes(term.toLowerCase())) {
          relevantDocs.push(doc.name)
          break
        }
      }
    }
    
    return relevantDocs
  }

  // 根据用户需求推荐相关工具
  recommendTools(userInput) {
    const recommendedTools = []
    const input = userInput.toLowerCase()
    
    for (const tool of this.tools) {
      const toolText = `${tool.title} ${tool.description}`.toLowerCase()
      
      // 简单的关键词匹配
      if (input.includes('过敏') || input.includes('忌口')) {
        if (tool.title.includes('过敏')) {
          recommendedTools.push(tool.title)
        }
      }
      
      if (input.includes('蔬菜') || input.includes('挑食')) {
        if (tool.title.includes('蔬菜')) {
          recommendedTools.push(tool.title)
        }
      }
      
      if (input.includes('派对') || input.includes('聚会')) {
        if (tool.title.includes('派对')) {
          recommendedTools.push(tool.title)
        }
      }
      
      if (input.includes('餐厅') || input.includes('预订')) {
        if (tool.title.includes('餐厅')) {
          recommendedTools.push(tool.title)
        }
      }
      
      if (input.includes('采购') || input.includes('清单')) {
        if (tool.title.includes('采购')) {
          recommendedTools.push(tool.title)
        }
      }
    }
    
    return recommendedTools
  }

  // 获取文档信息的Markdown格式
  getDocumentsMarkdown() {
    return this.documents.map(doc => 
      `- ${doc.name}：${doc.description}`
    ).join('\n')
  }

  // 获取工具信息的Markdown格式
  getToolsMarkdown() {
    return this.tools.map(tool => 
      `- ${tool.title}：${tool.description}`
    ).join('\n')
  }
}

export default new DocumentInfoService()