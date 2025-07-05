// 本地存储工具类
const STORAGE_KEY = 'plan-card-projects'

export class ProjectStorage {
  // 获取所有项目
  static getProjects() {
    try {
      const projects = localStorage.getItem(STORAGE_KEY)
      return projects ? JSON.parse(projects) : []
    } catch (error) {
      console.error('获取项目数据失败:', error)
      return []
    }
  }

  // 保存项目
  static saveProject(project) {
    try {
      const projects = this.getProjects()
      const existingIndex = projects.findIndex(p => p.id === project.id)
      
      if (existingIndex >= 0) {
        // 更新现有项目
        projects[existingIndex] = { ...projects[existingIndex], ...project }
      } else {
        // 添加新项目
        projects.unshift(project) // 新项目添加到开头
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
      return true
    } catch (error) {
      console.error('保存项目失败:', error)
      return false
    }
  }

  // 删除项目
  static deleteProject(projectId) {
    try {
      const projects = this.getProjects()
      const filteredProjects = projects.filter(p => p.id !== projectId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects))
      return true
    } catch (error) {
      console.error('删除项目失败:', error)
      return false
    }
  }

  // 获取单个项目
  static getProject(projectId) {
    const projects = this.getProjects()
    return projects.find(p => p.id === projectId)
  }

  // 更新项目
  static updateProject(projectId, updates) {
    try {
      const projects = this.getProjects()
      const projectIndex = projects.findIndex(p => p.id === projectId)
      
      if (projectIndex >= 0) {
        projects[projectIndex] = { ...projects[projectIndex], ...updates }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
        return true
      }
      return false
    } catch (error) {
      console.error('更新项目失败:', error)
      return false
    }
  }

  // 清空所有项目
  static clearProjects() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return true
    } catch (error) {
      console.error('清空项目失败:', error)
      return false
    }
  }

  // 当前活跃项目ID管理
  static setCurrentProjectId(id) {
    localStorage.setItem('plan-card-current-project-id', id)
  }
  static getCurrentProjectId() {
    return localStorage.getItem('plan-card-current-project-id')
  }
}

// 项目数据模型
export class ProjectModel {
  constructor(input, cards = []) {
    this.id = this.generateId()
    this.title = this.generateTitle(input)
    this.description = input
    this.cards = cards
    this.conversationHistory = [] // 添加对话历史支持
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
    this.cardCount = cards.length
  }

  // 生成唯一ID
  generateId() {
    return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 根据输入生成标题
  generateTitle(input) {
    if (input.length <= 20) {
      return input
    }
    return input.substring(0, 20) + '...'
  }

  // 更新项目
  update(updates) {
    Object.assign(this, updates)
    this.updatedAt = new Date().toISOString()
    if (this.cards) {
      this.cardCount = this.cards.length
    }
  }

  // 转换为普通对象
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      cards: this.cards,
      conversationHistory: this.conversationHistory, // 包含对话历史
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      cardCount: this.cardCount
    }
  }
} 