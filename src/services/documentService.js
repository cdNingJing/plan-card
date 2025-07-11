import { documentTypes, getIcon } from '@/config/iconLibrary.js'

// 文档服务类
class DocumentService {
  constructor() {
    this.documents = [
      // 真实文档数据
      { id: 1, name: '副业计划启动器.md', type: 'markdown', category: 'document', typeLabel: 'MD', description: '城市轻旅手册项目启动计划', content: '副业启动计划书 - 版本 1.0，项目名称：城市轻旅手册（本地生活内容服务）' },
      { id: 2, name: '像素日常记录001.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '日常生活片段记录', content: '超市收银员头发有点像我初中同桌。奇怪，居然记得那个发旋。' },
      { id: 5, name: '碎片化生活语录.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '生活感悟和语录收集', content: '碎片化的生活感悟和语录' },
      { id: 12, name: '聚会人员统计.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '派对参与人员名单和统计', content: '聚会人员统计：\n\n成人：\n- 小明爸爸、妈妈\n- 小红爸爸、妈妈\n- 小李爸爸、妈妈\n\n小朋友：\n- 小明（8岁）\n- 小红（6岁）\n- 小李（7岁）\n- 小王（5岁）\n\n总计：10人（6个成人，4个小朋友）' },
      { id: 13, name: '喜好菜品清单.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '每个小朋友喜欢吃的菜品', content: '小朋友喜好菜品：\n\n小明（8岁）：\n- 番茄炒蛋\n- 红烧肉\n- 糖醋里脊\n- 蛋炒饭\n\n小红（6岁）：\n- 炸鸡翅\n- 薯条\n- 汉堡包\n- 披萨\n\n小李（7岁）：\n- 清蒸鱼\n- 白米饭\n- 蒸蛋羹\n- 水果沙拉\n\n小王（5岁）：\n- 面条\n- 小笼包\n- 炸鸡块\n- 冰淇淋' },
      { id: 14, name: '忌口清单.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '每个人的食物忌口情况', content: '忌口清单：\n\n小明：\n- 对花生过敏\n- 不吃辣\n- 不吃香菜\n\n小红：\n- 对海鲜过敏\n- 不吃胡萝卜\n- 不吃青椒\n\n小李：\n- 对牛奶过敏\n- 不吃茄子\n- 不吃苦瓜\n\n小明爸爸：\n- 对酒精过敏\n- 不吃生冷食物\n\n小红妈妈：\n- 不吃辛辣食物\n- 不吃油炸食品' },
      { id: 15, name: '小朋友游戏喜好.txt', type: 'text', category: 'document', typeLabel: 'TXT', description: '每个小朋友喜欢玩的游戏', content: '小朋友游戏喜好：\n\n小明（8岁）：\n- 超级英雄角色扮演\n- 乐高积木\n- 电子游戏\n- 足球\n\n小红（6岁）：\n- 公主装扮\n- 画画\n- 跳舞\n- 捉迷藏\n\n小李（7岁）：\n- 动物模仿游戏\n- 拼图\n- 手工制作\n- 跳绳\n\n小王（5岁）：\n- 泡泡机\n- 气球游戏\n- 简单拼图\n- 音乐游戏' },
      { id: 16, name: '妈妈.md', type: 'markdown', category: 'document', typeLabel: 'MD', description: '妈妈个人档案和偏好信息', content: '虚拟人物档案：妈妈（Mom）\n\n基本信息：\n- 姓名：林美华（Lin Meihua）\n- 关系：用户的母亲\n- 生日：7月1日\n- 年龄：58岁\n- 血型：B型\n- 居住地：北京市海淀区\n\n个性特征：\n- 性格：温柔、细心、喜欢计划行程\n- 兴趣爱好：喜欢安静舒适的环境、喜爱阅读、插花、日本电视剧、喜欢尝试新餐厅但不喜欢太油腻的食物\n- 饮食偏好：喜欢意大利菜、日式定食、低盐轻油菜系；忌口生冷食物、辣椒、大蒜、贝类海鲜\n- 特殊需求：不喜欢人多吵闹的场所（如快餐店、夜店）\n\n常出没地点：\n- 家：北京市海淀区万柳中路小区\n- 医院：北医三院定期体检\n- 购物：新中关购物中心，西单大悦城\n- 餐厅常去：Trattoria Roma（意式）、元气寿司（日式）\n- 公共交通：喜欢打车或乘坐地铁4号线\n\n历史偏好：\n- 2024年生日时在「竹芝·La Bella Vita」庆祝，非常满意\n- 点评里喜欢"环境安静、服务好、甜点好吃"的关键词\n- 曾对用户说"下次想试试公司旁边那家意大利餐厅"\n- 有轻微高血压，饮食需要清淡' }
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
  async updateDocument(id, updates) {
    const index = this.documents.findIndex(doc => doc.id === id)
    if (index !== -1) {
      this.documents[index] = { ...this.documents[index], ...updates }
      
      // 保存到文件系统
      try {
        await this.saveDocumentToFile(this.documents[index])
        console.log('💾 文档已保存到文件系统:', this.documents[index].name)
      } catch (error) {
        console.error('❌ 保存到文件系统失败:', error)
        // 即使文件保存失败，也返回更新后的文档
      }
      
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

  // 保存文档到文件系统
  async saveDocumentToFile(document) {
    try {
      // 这里可以添加实际的文件系统写入逻辑
      // 例如：使用 Node.js 的 fs 模块或浏览器的 File System Access API
      
      // 模拟文件保存
      console.log(`📝 保存文档到文件: ${document.name}`)
      console.log(`📄 文档内容: ${document.content.substring(0, 100)}...`)
      
      // 模拟异步保存
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 触发文件变动事件
      this.triggerFileChangeEvent(document.name)
      
      return true
    } catch (error) {
      console.error('❌ 保存文档到文件失败:', error)
      throw error
    }
  }

  // 触发文件变动事件
  triggerFileChangeEvent(filename) {
    // 触发文件变动事件，通知其他组件
    window.dispatchEvent(new CustomEvent('documentFileChanged', {
      detail: {
        filename,
        timestamp: new Date().toISOString(),
        action: 'saved'
      }
    }))
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