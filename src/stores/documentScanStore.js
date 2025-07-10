import { defineStore } from 'pinia'
import documentService from '@/services/documentService.js'
import fileWatcherService from '@/services/fileWatcherService.js'

export const useDocumentScanStore = defineStore('documentScan', {
  state: () => ({
    documents: [],
    isScanning: false,
    scanQueue: [],
    scanProgress: 0,
    lastScanTime: null
  }),
  
  getters: {
    // 获取扫描完成的文档数量
    completedDocuments: (state) => {
      return state.documents.filter(doc => doc.status === 'done').length
    },
    
    // 获取正在扫描的文档数量
    scanningDocuments: (state) => {
      return state.documents.filter(doc => doc.status === 'searching').length
    },
    
    // 获取扫描进度百分比
    scanProgressPercent: (state) => {
      if (state.documents.length === 0) return 0
      return Math.round((state.completedDocuments / state.documents.length) * 100)
    }
  },
  
  actions: {
    // 初始化文档数据
    initializeDocuments() {
      this.documents = documentService.getAllDocuments().map(doc => ({ 
        ...doc, 
        status: 'default' 
      }))
    },
    
    // 开始扫描所有文档
    async startScan() {
      if (this.isScanning) return
      
      // 重置所有文档状态
      this.documents.forEach(doc => doc.status = 'default')
      this.scanQueue = this.documents.map((doc, idx) => idx)
      this.isScanning = true
      this.scanProgress = 0
      this.lastScanTime = new Date()
      
      // 开始扫描动画
      const scanDuration = 3000 // 每个文档扫描持续3秒
      const scanStep = 180 // 每隔180ms启动下一个
      const total = this.scanQueue.length
      
      for (let i = 0; i < total; i++) {
        const idx = this.scanQueue[i]
        
        setTimeout(() => {
          this.documents[idx].status = 'searching'
          
          setTimeout(() => {
            this.documents[idx].status = 'done'
            this.scanProgress = this.completedDocuments
            
            // 最后一个done后，结束扫描
            if (i === total - 1) {
              this.isScanning = false
              console.log('📚 文档扫描完成')
            }
          }, scanDuration)
        }, i * scanStep)
      }
    },
    
    // 停止扫描
    stopScan() {
      this.isScanning = false
      this.scanQueue = []
      // 保持当前状态，不清零
    },
    
    // 重置扫描状态
    resetScan() {
      this.documents.forEach(doc => doc.status = 'default')
      this.isScanning = false
      this.scanQueue = []
      this.scanProgress = 0
    },
    
    // 监听文件变动并触发扫描
    watchForChanges() {
      console.log('📁 开始监听文档变动...')
      
      // 启动文件监听服务
      fileWatcherService.startWatching()
      
      // 监听文件变动事件
      window.addEventListener('documentScanTriggered', (event) => {
        console.log('📄 收到文件变动事件:', event.detail)
        this.startScan()
      })
    },
    
    // 检查文件变动（模拟）
    checkForFileChanges() {
      // 这里可以添加实际的文件检查逻辑
      // 例如：比较文件的修改时间
      const lastScan = this.lastScanTime
      const now = new Date()
      
      // 模拟：如果距离上次扫描超过2分钟，就认为有变动
      if (!lastScan || (now - lastScan) > 120000) {
        return true
      }
      
      return false
    },
    
    // 手动触发扫描（用于测试）
    triggerManualScan() {
      console.log('🔍 手动触发文档扫描')
      this.startScan()
    },
    
    // 部分文档扫描（用于测试）
    startPartialScan(documentIds = [1, 2, 3]) {
      console.log('🧪 开始部分文档扫描:', documentIds)
      
      // 重置指定文档的状态
      this.documents.forEach(doc => {
        if (documentIds.includes(doc.id)) {
          doc.status = 'default'
        }
      })
      
      // 模拟扫描动画
      documentIds.forEach((docId, index) => {
        const doc = this.documents.find(d => d.id === docId)
        if (doc) {
          setTimeout(() => {
            doc.status = 'searching'
            console.log(`🔍 正在扫描: ${doc.name}`)
            
            setTimeout(() => {
              doc.status = 'done'
              console.log(`✅ 扫描完成: ${doc.name}`)
            }, 2000) // 每个文档扫描2秒
          }, index * 500) // 每隔500ms启动下一个
        }
      })
    }
  }
}) 