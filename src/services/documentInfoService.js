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

  // 获取所有可用工具信息（支持分类）
  getAllTools() {
    return this.tools.map(tool => ({
      title: tool.title,
      description: tool.description,
      aiDescription: tool.aiDescription,
      component: tool.component,
      category: tool.category || '其他'
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

  // 根据用户需求推荐相关工具（优化版本，支持分类）
  recommendTools(userInput) {
    const recommendedTools = []
    const input = userInput.toLowerCase()
    
    // 定义关键词映射到组件
    const keywordMappings = {
      // 通用分析组件
      '偏好': ['TrendAnalysisCard'],
      '趋势': ['TrendAnalysisCard'],
      '变化': ['TrendAnalysisCard'],
      '消费': ['TrendAnalysisCard'],
      '行为': ['TrendAnalysisCard'],
      
      // 安全避雷组件
      '过敏': ['AvoidanceFilterCard', 'AllergyFreeMenuCard'],
      '恐惧': ['AvoidanceFilterCard'],
      '避雷': ['AvoidanceFilterCard'],
      '安全': ['AvoidanceFilterCard'],
      '恐高': ['AvoidanceFilterCard'],
      '花生': ['AvoidanceFilterCard', 'AllergyFreeMenuCard'],
      '海鲜': ['AvoidanceFilterCard', 'AllergyFreeMenuCard'],
      '猫毛': ['AvoidanceFilterCard'],
      
      // 心愿管理组件
      '心愿': ['WishMemoryCard'],
      '愿望': ['WishMemoryCard'],
      '梦想': ['WishMemoryCard'],
      '咖啡店': ['WishMemoryCard'],
      '环游': ['WishMemoryCard'],
      
      // 收藏推荐组件
      '收藏': ['CollectionRecommendCard'],
      '兴趣': ['CollectionRecommendCard'],
      '推荐': ['CollectionRecommendCard'],
      '手工艺品': ['CollectionRecommendCard'],
      '书籍': ['CollectionRecommendCard'],
      
      // 纪念日组件
      '纪念日': ['AnniversaryReminderCard'],
      '生日': ['AnniversaryReminderCard'],
      '提醒': ['AnniversaryReminderCard'],
      '妈妈': ['AnniversaryReminderCard'],
      '结婚': ['AnniversaryReminderCard'],
      
      // 生活习惯组件
      '习惯': ['HabitInsightCard'],
      '预测': ['HabitInsightCard'],
      '洞察': ['HabitInsightCard'],
      '作息': ['HabitInsightCard'],
      '夜猫子': ['HabitInsightCard'],
      '早睡': ['HabitInsightCard'],
      
      // 餐饮服务组件
      '菜单': ['AllergyFreeMenuCard', 'NoVegetableMenuCard'],
      '蔬菜': ['NoVegetableMenuCard'],
      '挑食': ['NoVegetableMenuCard'],
      '餐厅': ['RestaurantMatchCard', 'RestaurantBookingCard'],
      '预订': ['RestaurantBookingCard'],
      '用餐': ['RestaurantMatchCard', 'RestaurantBookingCard'],
      
      // 社交活动组件
      '派对': ['PartyThemeCard', 'PartyTimeCard', 'ShoppingListCard'],
      '聚会': ['PartyThemeCard', 'PartyTimeCard', 'ShoppingListCard'],
      '主题': ['PartyThemeCard'],
      '时间': ['PartyTimeCard'],
      '采购': ['ShoppingListCard'],
      '清单': ['ShoppingListCard'],
      '装饰': ['ShoppingListCard'],
      '礼品': ['ShoppingListCard']
    }
    
    // 根据输入匹配关键词
    for (const [keyword, components] of Object.entries(keywordMappings)) {
      if (input.includes(keyword)) {
        for (const component of components) {
          if (!recommendedTools.includes(component)) {
            recommendedTools.push(component)
          }
        }
      }
    }
    
    // 智能场景识别
    if (input.includes('生活') && input.includes('分析')) {
      recommendedTools.push('TrendAnalysisCard', 'HabitInsightCard')
    }
    
    if (input.includes('心愿') && input.includes('安全')) {
      recommendedTools.push('WishMemoryCard', 'AvoidanceFilterCard')
    }
    
    if (input.includes('派对') && input.includes('孩子')) {
      recommendedTools.push('PartyThemeCard', 'PartyTimeCard', 'ShoppingListCard')
    }
    
    if (input.includes('餐厅') && input.includes('过敏')) {
      recommendedTools.push('RestaurantMatchCard', 'AllergyFreeMenuCard')
    }
    
    return recommendedTools
  }

  // 获取文档信息的Markdown格式
  getDocumentsMarkdown() {
    return this.documents.map(doc => 
      `- ${doc.name}：${doc.description}`
    ).join('\n')
  }

  // 获取工具信息的Markdown格式（按分类组织，支持AI和用户两种描述）
  getToolsMarkdown(forAI = false) {
    const categorizedTools = {}
    
    // 按分类组织工具
    for (const tool of this.tools) {
      const category = tool.category || '其他'
      if (!categorizedTools[category]) {
        categorizedTools[category] = []
      }
      categorizedTools[category].push(tool)
    }
    
    // 生成分类化的Markdown
    let markdown = ''
    for (const [category, tools] of Object.entries(categorizedTools)) {
      markdown += `\n## ${category}\n`
      for (const tool of tools) {
        // 根据用途选择描述内容
        const description = forAI && tool.aiDescription ? tool.aiDescription : tool.description
        markdown += `- ${tool.component}：${description}\n`
      }
    }
    
    return markdown.trim()
  }
}

export default new DocumentInfoService()