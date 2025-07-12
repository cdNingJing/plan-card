import documentService from './documentService.js'

class FileWatcherService {
  constructor() {
    this.watchers = new Map()
    this.lastScanTime = null
    this.scanInterval = null
  }

  // 停止监听
  stopWatching() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
      this.scanInterval = null
      console.log('📁 停止监听文件变动')
    }
  }

  // 触发文档扫描
  triggerDocumentScan() {
    // 这里可以触发store中的扫描方法
    console.log('🔄 触发文档扫描')
    window.dispatchEvent(new CustomEvent('documentScanTriggered', {
      detail: {
        timestamp: new Date().toISOString(),
        reason: 'manual_trigger'
      }
    }))
  }

  // 获取文件列表
  async getFileList() {
    // 这里可以添加实际的文件系统读取逻辑
    return [
      '副业计划启动器.md',
      '像素日常记录001.txt',
      '我的2028年生活模拟.pdf',
      '人生回音室.pdf',
      '碎片化生活语录.txt',
      '梦想生活的清单.md',
      '我理解的自己.json',
      '分开的第100天.txt',
      '年终职场总结2025.pdf'
    ]
  }

  // 读取文件内容
  async readFileContent(filename) {
    // 这里可以添加实际的文件读取逻辑
    console.log(`📖 读取文件: ${filename}`)
    const fileContents = {
      '副业计划启动器.md': '# 副业启动计划书 - 版本 1.0\n\n## 项目名称：城市轻旅手册（本地生活内容服务）',
      '像素日常记录001.txt': '[2025/7/9 07:43]\n超市收银员头发有点像我初中同桌。',
      '我理解的自己.json': '{\n  "name": "林安",\n  "age": 32,\n  "personality": {\n    "introvert_extrovert": "introvert"\n  }\n}',
      '梦想生活的清单.md': '# 梦想生活的清单 ✨\n\n## 🏠 居住\n- 安静的房子，最好带一个小庭院',
      '碎片化生活语录.txt': '生活就像拼图，每一块都有它的位置。',
      '分开的第100天.txt': '时间是最好的良药，也是最残酷的见证者。',
      '年终职场总结2025.pdf': '2025年职场工作总结：成长与挑战并存的一年。',
      '我的2028年生活模拟.pdf': '2028年生活模拟：理想与现实的距离。',
      '人生回音室.pdf': '人生回音室：深度思考与自我对话。'
    }
    return fileContents[filename] || `文件内容: ${filename}`
  }

  // 更新文档服务中的文件列表
  async updateDocumentList() {
    try {
      const files = await this.getFileList()
      console.log('📋 更新文档列表:', files)
      // 这里可以更新documentService中的文档列表
      // 或者触发store中的更新方法
    } catch (error) {
      console.error('❌ 更新文档列表失败:', error)
    }
  }
}

// 创建单例实例
const fileWatcherService = new FileWatcherService()

export default fileWatcherService 