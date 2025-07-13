<template>
  <div class="documentation-panel">
    <DynamicIsland :visible="showIsland" :docName="islandDocName" :percent="islandPercent" />
    <div class="documentation-content">
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <button class="ios-btn create-btn" @click="createNewCollection">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          新建集合
        </button>
        <button class="ios-btn upload-btn" @click="showUploadDialog = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          上传内容
        </button>
        <button class="ios-btn search-btn" @click="showSearchDialog = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          搜索
        </button>
      </div>

      <!-- 集合列表 -->
      <div class="collections-section">
        <h3 class="section-title">知识集合</h3>
        <div class="cards-grid">
          <div 
            v-for="collection in collections" 
            :key="collection.name"
            class="card-item collection-item"
            :class="[collection.status, selectedCollection?.name === collection.name ? 'selected' : '']"
            @click="openCollectionDetails(collection)"
          >
            <button class="collection-delete-btn" @click.stop="deleteCollection(collection)" title="删除集合">
              <Trash :size="20" :stroke-width="2" />
            </button>
            <div class="collection-icon">
              <Folder :size="48" :stroke-width="2" color="#6366f1" />
            </div>
            <div class="doc-name">{{ collection.name }}</div>
            <div class="collection-stats">
              <span class="stat-item">
                {{ collection.stats?.vector_stats?.content_types?.document ?? collection.stats?.total_chunks ?? 0 }} 条内容
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 文档列表 -->
      <div class="documents-section">
        <h3 class="section-title">文档列表</h3>
        <div v-if="isLoading" class="loading-state">
          <svg class="spinner" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
              <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
            </circle>
          </svg>
          加载文档中...
        </div>
        <div v-else-if="filteredDocuments.length > 0" class="cards-grid">
          <div 
            v-for="(document, idx) in filteredDocuments" 
            :key="getDocId(document)"
            class="card-item document-item"
            :class="{
              'search-highlight': isSimulatingSearch,
              'scan-highlight': isScanning && scanningDocs[scanningIndex] === getDocId(document),
              'test-highlight': testHighlightIndex === idx
            }"
            @click="openDocumentDetails(document)"
          >
            <div v-if="isScanning && scanningDocs[scanningIndex] === getDocId(document)" class="scan-loading">
              正在读取...
            </div>
            <div v-if="testHighlightIndex === idx" class="scan-loading">正在读取...</div>
            <div class="document-icon">
              <FileText :size="48" :stroke-width="2" color="#6366f1" />
            </div>
            <div class="document-info">
              <div class="document-title">{{ document.metadata?.title || '无标题' }}</div>
              <div class="document-meta">
                <span class="source">{{ document.metadata?.source || '未知来源' }}</span>
                <span class="date">{{ formatDate(document.created_at) }}</span>
              </div>
            </div>
            <div class="document-actions">
              <button class="action-btn edit-btn disabled" @click.stop="showEditNotAvailable" title="编辑功能暂未开放">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="action-btn delete-btn disabled" @click.stop="showDeleteNotAvailable" title="删除功能暂未开放">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" class="empty-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p class="empty-text">暂无文档</p>
          <p class="empty-subtext">上传内容后，文档将显示在这里</p>
          <div class="api-notice">
            <p class="notice-text">注意：当前API仅支持文档查看，编辑和删除功能暂未开放</p>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="search-results-section">
        <h3 class="section-title">搜索结果</h3>
        <div class="search-results">
          <div 
            v-for="result in searchResults" 
            :key="getDocId(result)"
            class="search-result-item"
            @click="openResultDetails(result)"
          >
            <div class="result-content">
              <div class="result-title">{{ result.metadata?.title || '无标题' }}</div>
              <div class="result-text">{{ result.content }}</div>
              <div class="result-meta">
                <span class="score">相关度: {{ (result.score * 100).toFixed(1) }}%</span>
                <span class="source">{{ result.metadata?.source || '未知来源' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建集合对话框 -->
    <div v-if="showCreateDialog" class="edit-dialog-overlay" @click="closeCreateDialog">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">新建知识集合</h3>
          <button class="close-btn" @click="closeCreateDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="edit-dialog-content">
          <div class="edit-field">
            <label class="edit-label">集合名称</label>
            <input 
              v-model="newCollection.name" 
              type="text" 
              class="edit-input ios-input"
              placeholder="输入集合名称"
              maxlength="50"
            />
          </div>
          <div class="edit-field">
            <label class="edit-label">描述</label>
            <textarea 
              v-model="newCollection.description" 
              class="edit-textarea ios-input"
              placeholder="输入集合描述"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeCreateDialog">取消</button>
          <button 
            class="save-btn ios-btn" 
            @click="createCollection" 
            :disabled="isCreating"
          >
            <span v-if="!isCreating">创建</span>
            <span v-else class="saving-indicator">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              创建中...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 上传内容对话框 -->
    <div v-if="showUploadDialog" class="edit-dialog-overlay" @click="closeUploadDialog">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">上传内容</h3>
          <button class="close-btn" @click="closeUploadDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="edit-dialog-content">
          <div class="edit-field">
            <label class="edit-label">选择集合</label>
            <select v-model="uploadForm.collectionName" class="edit-input ios-input">
              <option value="">请选择集合</option>
              <option v-for="collection in collections" :key="collection.name" :value="collection.name">
                {{ collection.name }}
              </option>
            </select>
          </div>
          <div class="edit-field">
            <label class="edit-label">内容标题</label>
            <input 
              v-model="uploadForm.title" 
              type="text" 
              class="edit-input ios-input"
              placeholder="输入内容标题"
            />
          </div>
          <div class="edit-field">
            <label class="edit-label">内容</label>
            <textarea 
              v-model="uploadForm.content" 
              class="edit-textarea content-textarea main-content-textarea ios-input"
              placeholder="输入要上传的内容"
              rows="15"
            ></textarea>
          </div>
          <div class="edit-field">
            <label class="edit-label">来源</label>
            <input 
              v-model="uploadForm.source" 
              type="text" 
              class="edit-input ios-input"
              placeholder="输入内容来源"
            />
          </div>
        </div>
        
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeUploadDialog">取消</button>
          <button 
            class="save-btn ios-btn" 
            @click="uploadContent" 
            :disabled="isUploading"
          >
            <span v-if="!isUploading">上传</span>
            <span v-else class="saving-indicator">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              上传中...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索对话框 -->
    <div v-if="showSearchDialog" class="edit-dialog-overlay" @click="closeSearchDialog">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">搜索知识库</h3>
          <button class="close-btn" @click="closeSearchDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="edit-dialog-content">
          <div class="edit-field">
            <label class="edit-label">搜索关键词</label>
            <input 
              v-model="searchForm.query" 
              type="text" 
              class="edit-input ios-input"
              placeholder="输入搜索关键词"
              @keyup.enter="performSearch"
            />
          </div>
          <div class="edit-field">
            <label class="edit-label">选择集合</label>
            <select v-model="searchForm.collectionName" class="edit-input ios-input">
              <option value="">所有集合</option>
              <option v-for="collection in collections" :key="collection.name" :value="collection.name">
                {{ collection.name }}
              </option>
            </select>
          </div>
          <div class="edit-field">
            <label class="edit-label">结果数量</label>
            <input 
              v-model.number="searchForm.limit" 
              type="number" 
              class="edit-input ios-input"
              placeholder="5"
              min="1"
              max="20"
            />
          </div>
        </div>
        
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeSearchDialog">取消</button>
          <button 
            class="save-btn ios-btn" 
            @click="performSearch" 
            :disabled="isSearching"
          >
            <span v-if="!isSearching">搜索</span>
            <span v-else class="saving-indicator">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              搜索中...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 文档详情对话框 -->
    <div v-if="showDocumentDialog" class="edit-dialog-overlay" @click="closeDocumentDialog">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">{{ currentDocument?.metadata?.title || '文档详情' }}</h3>
          <div class="dialog-subtitle">仅支持查看，编辑功能暂未开放</div>
          <button class="close-btn" @click="closeDocumentDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="edit-dialog-content">
          <div class="document-details">
            <div class="detail-item">
              <label class="detail-label">标题</label>
              <div class="detail-value">{{ currentDocument?.metadata?.title || '无标题' }}</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">来源</label>
              <div class="detail-value">{{ currentDocument?.metadata?.source || '未知来源' }}</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">创建时间</label>
              <div class="detail-value">{{ formatDate(currentDocument?.created_at) }}</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">内容</label>
              <div class="detail-content">{{ currentDocument?.content || '无内容' }}</div>
            </div>
          </div>
        </div>
        
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeDocumentDialog">关闭</button>
        </div>
      </div>
    </div>



    <!-- 成功提示 -->
    <div v-if="showSuccessMessage" class="success-message">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, defineExpose, watch } from 'vue'
import knowledgeApi from '@/api/knowledgeApi.js'
import DynamicIsland from './DynamicIsland.vue'
import { Folder, FileText, Trash } from 'lucide-vue-next'

// 状态管理
const collections = ref([])
const searchResults = ref([])
const documents = ref([])
const isLoading = ref(false)

// 对话框状态
const showCreateDialog = ref(false)
const showUploadDialog = ref(false)
const showSearchDialog = ref(false)
const showDocumentDialog = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')

// 表单数据
const newCollection = ref({
  name: '',
  description: ''
})

const uploadForm = ref({
  collectionName: '',
  title: '',
  content: '',
  source: ''
})

const searchForm = ref({
  query: '',
  collectionName: '',
  limit: 5
})

// 当前选中的文档
const currentDocument = ref(null)

// 加载状态
const isCreating = ref(false)
const isUploading = ref(false)
const isSearching = ref(false)
const isSimulatingSearch = ref(false)
const isScanning = ref(false)
const scanningIndex = ref(-1)
const scanningDocs = ref([])

// 灵动岛相关状态
const showIsland = ref(false)
const islandDocName = ref('')
const islandPercent = ref(0)
let islandTimer = null

// 选中合集状态
const selectedCollection = ref(null)

// 测试高亮索引
const testHighlightIndex = ref(-1)

// 全局扫描状态
const globalScanState = ref({
  isScanning: false,
  scanQueue: [],
  currentScanIndex: -1
})

// 计算过滤后的文档列表
const filteredDocuments = computed(() => {
  if (!selectedCollection.value) return documents.value
  return documents.value.filter(doc => doc.collection_name === selectedCollection.value.name)
})

// 监听文档数据变化，自动开始扫描
watch(filteredDocuments, (newDocs) => {
  if (newDocs && newDocs.length > 0 && globalScanState.value.isScanning) {
    console.log('文档数据已更新，开始执行扫描队列')
    executeScanQueue()
  }
}, { deep: true })

// 执行扫描队列
const executeScanQueue = async () => {
  if (globalScanState.value.scanQueue.length === 0) {
    globalScanState.value.isScanning = false
    return
  }
  
  const currentId = globalScanState.value.scanQueue[globalScanState.value.currentScanIndex]
  if (currentId) {
    const idx = filteredDocuments.value.findIndex(doc => getDocId(doc) === currentId)
    if (idx !== -1) {
      testHighlightIndex.value = idx
      await new Promise(resolve => setTimeout(resolve, 1200))
      testHighlightIndex.value = -1
    }
  }
  
  globalScanState.value.currentScanIndex++
  if (globalScanState.value.currentScanIndex < globalScanState.value.scanQueue.length) {
    setTimeout(() => executeScanQueue(), 200)
  } else {
    globalScanState.value.isScanning = false
    globalScanState.value.scanQueue = []
    globalScanState.value.currentScanIndex = -1
  }
}

onMounted(async () => {
  await loadCollections()
  // 延迟加载文档，确保集合已加载完成
  setTimeout(async () => {
    await loadDocuments()
  }, 100)
})

// 加载集合列表
const loadCollections = async () => {
  try {
    isLoading.value = true
    const response = await knowledgeApi.listCollections()
    collections.value = response.collections?.map(name => ({
      name,
      status: 'done',
      stats: { total_chunks: 0 }
    })) || []
    
    // 获取每个集合的统计信息
    for (const collection of collections.value) {
      try {
        const stats = await knowledgeApi.getCollectionStats(collection.name)
        collection.stats = stats.statistics
      } catch (error) {
        console.warn(`获取集合 ${collection.name} 统计信息失败:`, error)
      }
    }
  } catch (error) {
    console.error('加载集合列表失败:', error)
    showSuccessNotification('加载集合列表失败: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 新建集合
const createNewCollection = () => {
  newCollection.value = { name: '', description: '' }
  showCreateDialog.value = true
}

const createCollection = async () => {
  if (!newCollection.value.name.trim()) {
    showSuccessNotification('请输入集合名称')
    return
  }

  try {
    isCreating.value = true
    await knowledgeApi.createCollection(
      newCollection.value.name,
      1536,
      newCollection.value.description
    )
    
    showSuccessNotification(`集合 "${newCollection.value.name}" 创建成功`)
    closeCreateDialog()
    await loadCollections()
  } catch (error) {
    console.error('创建集合失败:', error)
    showSuccessNotification('创建集合失败: ' + error.message)
  } finally {
    isCreating.value = false
  }
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  newCollection.value = { name: '', description: '' }
}

// 上传内容
const closeUploadDialog = () => {
  showUploadDialog.value = false
  uploadForm.value = {
    collectionName: '',
    title: '',
    content: '',
    source: ''
  }
}

const uploadContent = async () => {
  if (!uploadForm.value.collectionName || !uploadForm.value.content.trim()) {
    showSuccessNotification('请选择集合并输入内容')
    return
  }

  try {
    isUploading.value = true
    
    const metadata = {
      title: uploadForm.value.title || '无标题',
      source: uploadForm.value.source || '用户上传',
      author: '用户'
    }

    await knowledgeApi.uploadContent(
      uploadForm.value.content,
      uploadForm.value.collectionName,
      metadata,
      true,
      false
    )
    
    showSuccessNotification('内容上传成功')
    closeUploadDialog()
    await loadCollections()
    // 延迟刷新文档列表，确保新上传的内容能够显示
    setTimeout(async () => {
      await loadDocuments()
    }, 500)
  } catch (error) {
    console.error('上传内容失败:', error)
    showSuccessNotification('上传内容失败: ' + error.message)
  } finally {
    isUploading.value = false
  }
}

// 搜索功能
const closeSearchDialog = () => {
  showSearchDialog.value = false
  searchForm.value = {
    query: '',
    collectionName: '',
    limit: 5
  }
}

const performSearch = async () => {
  if (!searchForm.value.query.trim()) {
    showSuccessNotification('请输入搜索关键词')
    return
  }

  try {
    isSearching.value = true
    
    const searchOptions = {
      query: searchForm.value.query,
      collectionName: searchForm.value.collectionName || undefined,
      limit: searchForm.value.limit || 5,
      includeGraphContext: true
    }

    const response = await knowledgeApi.search(
      searchOptions.query,
      searchOptions.collectionName,
      searchOptions.limit,
      searchOptions.includeGraphContext
    )
    
    searchResults.value = response.results || []
    showSuccessNotification(`找到 ${searchResults.value.length} 条相关结果`)
    closeSearchDialog()
  } catch (error) {
    console.error('搜索失败:', error)
    showSuccessNotification('搜索失败: ' + error.message)
  } finally {
    isSearching.value = false
  }
}

// 新增：默认搜索方法，使用第一个合集
const searchInFirstCollection = async (query, limit = 5) => {
  if (!query || !query.trim()) {
    console.log('搜索查询为空')
    return { success: false, message: '搜索查询为空' }
  }

  try {
    // 确保集合已加载
    if (collections.value.length === 0) {
      await loadCollections()
    }

    // 获取第一个合集名称
    const firstCollection = collections.value[0]
    if (!firstCollection) {
      console.log('没有可用的合集')
      return { success: false, message: '没有可用的合集' }
    }

    console.log(`在合集 "${firstCollection.name}" 中搜索: "${query}"`)

    const response = await knowledgeApi.search(
      query.trim(),
      firstCollection.name,
      limit,
      true // includeGraphContext
    )
    
    console.log('搜索返回结果:', response)
    
    return {
      success: true,
      data: response,
      collectionName: firstCollection.name,
      query: query.trim(),
      resultsCount: response.results?.length || 0
    }
  } catch (error) {
    console.error('搜索失败:', error)
    return {
      success: false,
      message: error.message,
      error: error
    }
  }
}

// 查看集合详情
const openCollectionDetails = (collection) => {
  if (selectedCollection.value && selectedCollection.value.name === collection.name) {
    selectedCollection.value = null // 再次点击取消过滤
  } else {
    selectedCollection.value = collection
  }
}

// 加载文档列表
const loadDocuments = async () => {
  try {
    isLoading.value = true
    // 从所有集合中获取文档
    const allDocuments = []
    
    for (const collection of collections.value) {
      try {
        // 使用搜索功能获取文档列表
        const response = await knowledgeApi.search('', collection.name, 50, true)
        if (response.results) {
          allDocuments.push(...response.results.map(result => ({
            id: result.id,
            content: result.content,
            metadata: result.metadata,
            created_at: new Date().toISOString(), // 搜索API不返回创建时间，使用当前时间
            collection_name: collection.name,
            score: result.score
          })))
        }
      } catch (error) {
        console.warn(`获取集合 ${collection.name} 文档失败:`, error)
        // 如果搜索失败，创建一些模拟文档用于演示
        allDocuments.push({
          id: `doc_${collection.name}_1`,
          content: '这是一个示例文档内容，用于演示文档列表功能。',
          metadata: {
            title: `${collection.name} 示例文档`,
            source: '演示内容',
            author: '系统'
          },
          created_at: new Date().toISOString(),
          collection_name: collection.name,
          score: 1.0
        })
      }
    }
    
    documents.value = allDocuments
  } catch (error) {
    console.error('加载文档列表失败:', error)
    showSuccessNotification('加载文档列表失败: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 查看文档详情
const openDocumentDetails = (document) => {
  currentDocument.value = document
  showDocumentDialog.value = true
}

// 关闭文档详情对话框
const closeDocumentDialog = () => {
  showDocumentDialog.value = false
  currentDocument.value = null
}



// 显示编辑功能不可用提示
const showEditNotAvailable = () => {
  showSuccessNotification('编辑功能暂未开放，敬请期待')
}

// 显示删除功能不可用提示
const showDeleteNotAvailable = () => {
  showSuccessNotification('删除功能暂未开放，敬请期待')
}

// 删除集合方法
const deleteCollection = async (collection) => {
  if (!confirm(`确定要删除集合 "${collection.name}" 吗？该集合下所有内容也将被删除。`)) {
    return
  }
  try {
    await knowledgeApi.deleteCollection(collection.name)
    showSuccessNotification(`集合 "${collection.name}" 删除成功`)
    await loadCollections()
    await loadDocuments()
  } catch (error) {
    showSuccessNotification('删除集合失败: ' + error.message)
  }
}


// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '未知时间'
  }
}

// 查看搜索结果详情
const openResultDetails = (result) => {
  // 这里可以实现查看搜索结果详情的功能
  showSuccessNotification(`查看结果: ${result.metadata?.title || '无标题'}`)
}

// 显示成功提示
const showSuccessNotification = (message) => {
  successMessage.value = message
  showSuccessMessage.value = true
  
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// 灵动岛动画
const triggerIslandAnimation = (docName) => {
  showIsland.value = true
  islandDocName.value = docName
  islandPercent.value = 0
  
  if (islandTimer) clearInterval(islandTimer)
  
  let p = 0
  islandTimer = setInterval(() => {
    p += Math.floor(Math.random() * 10) + 5
    if (p >= 100) {
      p = 100
      clearInterval(islandTimer)
      setTimeout(() => { showIsland.value = false }, 800)
    }
    islandPercent.value = p
  }, 350)
}

function simulateSearchAll() {
  isSimulatingSearch.value = true
  setTimeout(() => {
    isSimulatingSearch.value = false
  }, 1500)
}

function startScanAnimation(docIds = []) {
  if (!docIds.length) return
  isScanning.value = true
  scanningDocs.value = docIds
  scanningIndex.value = 0
  function scanNext() {
    if (scanningIndex.value >= docIds.length) {
      isScanning.value = false
      scanningIndex.value = -1
      return
    }
    setTimeout(() => {
      scanningIndex.value++
      scanNext()
    }, 900)
  }
  scanNext()
}

function highlightFirstDocument() {
  if (filteredDocuments.value.length === 0) return
  testHighlightIndex.value = 0
  setTimeout(() => {
    testHighlightIndex.value = -1
  }, 1500)
}

function getDocId(doc) {
  return doc.id !== undefined ? doc.id : (doc.metadata && doc.metadata.descriptive_id ? doc.metadata.descriptive_id : undefined)
}

async function highlightDocumentsSequentially(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return
  console.log('highlightDocumentsSequentially called, ids:', ids)
  for (let i = 0; i < ids.length; i++) {
    const idx = filteredDocuments.value.findIndex(doc => getDocId(doc) === ids[i])
    console.log(`高亮第${i+1}个文档，id:`, ids[i], 'idx:', idx, 'filteredDocuments:', filteredDocuments.value)
    if (idx === -1) continue
    testHighlightIndex.value = idx
    await new Promise(resolve => setTimeout(resolve, 1200))
    testHighlightIndex.value = -1
    if (i < ids.length - 1) {
      console.log('准备高亮下一个文档')
      await new Promise(r => setTimeout(r, 200))
    }
  }
  console.log('highlightDocumentsSequentially 完成')
}

function highlightAllDocuments() {
  const ids = filteredDocuments.value.map(doc => getDocId(doc))
  if (ids.length === 0) {
    console.log('没有文档可高亮')
    return
  }
  
  // 设置全局扫描状态
  globalScanState.value.isScanning = true
  globalScanState.value.scanQueue = [...ids]
  globalScanState.value.currentScanIndex = 0
  
  console.log('开始高亮所有文档，文档数量:', ids.length)
  
  // 如果文档已加载，立即开始扫描
  if (filteredDocuments.value.length > 0) {
    executeScanQueue()
  }
}

// 添加startSearch方法，与highlightAllDocuments效果相同
function startSearch() {
  console.log('startSearch called')
  highlightAllDocuments()
}

defineExpose({ 
  simulateSearchAll, 
  filteredDocuments, 
  startScanAnimation, 
  highlightFirstDocument, 
  highlightDocumentsSequentially,
  highlightAllDocuments,
  startSearch,
  searchInFirstCollection
})
</script>

<style scoped>
.documentation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%);
  border-radius: 36px;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 120, 0.10), 0 1.5px 0 0 #e5e7eb;
  border: none;
  overflow: hidden;
}

.documentation-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: transparent;
  position: relative;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.ios-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: #f6f7fa;
  color: #6366f1;
}

.create-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.upload-btn {
  background: #f6f7fa;
  color: #6366f1;
}

.search-btn {
  background: #f6f7fa;
  color: #6366f1;
}

.ios-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #22223b;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 18px;
  background: transparent;
}

.document-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px 18px 16px;
  background: transparent;
  border: 2px solid #bfcfff;
  border-radius: 24px;
  box-shadow: none;
  transition: border-color 0.3s, transform 0.2s;
  cursor: pointer;
  position: relative;
  backdrop-filter: none;
  overflow: hidden;
}

.document-item:hover {
  transform: translateY(-2px);
  border-color: #6366f1;
}

.document-item.done {
  border: 2px solid #6366f1;
  background: transparent;
  box-shadow: none;
}

.collection-icon {
  color: #6366f1;
  margin-bottom: 8px;
}

.doc-name {
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-align: center;
  margin-bottom: 4px;
}

.collection-stats {
  font-size: 12px;
  color: #6b7280;
}

.stat-item {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.search-results-section {
  margin-top: 32px;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-result-item {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.search-result-item:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #22223b;
  margin-bottom: 8px;
}

.result-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.score {
  color: #6366f1;
  font-weight: 500;
}

/* 文档列表样式 */
.documents-section {
  margin-top: 32px;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.document-item:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.document-icon {
  color: #6366f1;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-size: 16px;
  font-weight: 600;
  color: #22223b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.source {
  color: #6366f1;
  font-weight: 500;
}

.date {
  color: #9ca3af;
}

.document-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn:hover {
  transform: scale(1.05);
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn.disabled:hover {
  transform: none;
  background: #f3f4f6;
  color: #9ca3af;
}

.edit-btn:hover {
  background: #dbeafe;
  color: #2563eb;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* 文档详情样式 */
.document-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  letter-spacing: 0.2px;
}

.detail-value {
  font-size: 14px;
  color: #22223b;
  padding: 8px 12px;
  background: #f6f7fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.detail-content {
  font-size: 14px;
  color: #22223b;
  line-height: 1.6;
  padding: 12px;
  background: #f6f7fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
}

/* 加载状态和空状态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #6366f1;
  font-size: 14px;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  color: #bfcfff;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #9ca3af;
}

.api-notice {
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #f59e0b;
}

.notice-text {
  font-size: 12px;
  color: #92400e;
  margin: 0;
  text-align: center;
}

/* 对话框样式 */
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.edit-dialog {
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 8px 40px 0 rgba(60, 60, 120, 0.13), 0 1.5px 0 0 #e5e7eb;
  width: 92vw;
  max-width: 820px;
  max-height: 97vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: none;
  animation: ios-fade-in 0.25s cubic-bezier(.4,0,.6,1);
}

@keyframes ios-fade-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.edit-dialog-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0 0 0;
  border: none;
  position: relative;
}

.edit-dialog-title {
  margin: 0 auto;
  font-size: 22px;
  font-weight: 700;
  color: #22223b;
  letter-spacing: 0.5px;
  text-align: center;
}

.dialog-subtitle {
  margin: 4px auto 0 auto;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  font-weight: 400;
}

.close-btn {
  position: absolute;
  right: 24px;
  top: 18px;
  background: none;
  border: none;
  color: #bfcfff;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.edit-dialog-content {
  flex: 1;
  padding: 18px 28px 8px 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.edit-field {
  margin-bottom: 20px;
}

.edit-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  letter-spacing: 0.2px;
}

.edit-input, .edit-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #f6f7fa;
  color: #22223b;
}

.edit-input:focus, .edit-textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: #fff;
}

.edit-textarea {
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.content-textarea {
  min-height: 200px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.content-textarea.main-content-textarea {
  min-height: 340px;
  font-size: 16px;
  color: #22223b;
  background: #f6f7fa;
  border: none;
  border-radius: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.7;
  padding: 18px 20px;
  resize: vertical;
  flex: 1 1 0;
  box-sizing: border-box;
  box-shadow: 0 1px 2px 0 rgba(60,60,120,0.03);
  transition: box-shadow 0.2s, border 0.2s;
}

.content-textarea.main-content-textarea:focus {
  box-shadow: 0 0 0 2px #bfcfff;
  border: 1.5px solid #6366f1;
  background: #fff;
}

.edit-dialog-footer {
  display: flex;
  gap: 18px;
  justify-content: center;
  align-items: center;
  padding: 12px 0 18px 0;
  border: none;
  background: transparent;
}

.cancel-btn, .save-btn {
  flex: none;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 64px;
  height: 32px;
  line-height: 1.2;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.saving-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ios-input {
  background: #f6f7fa;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  color: #22223b;
  padding: 13px 18px;
  width: 100%;
  font-weight: 500;
  margin-bottom: 0;
  box-shadow: 0 1px 2px 0 rgba(60,60,120,0.03);
  transition: box-shadow 0.2s, border 0.2s;
  outline: none;
}

.ios-input:focus {
  box-shadow: 0 0 0 2px #bfcfff;
  border: 1.5px solid #6366f1;
  background: #fff;
}

.ios-btn {
  flex: none;
  min-width: 72px;
  height: 36px;
  padding: 0 18px;
  font-size: 15px;
  border-radius: 18px;
  font-weight: 600;
  border: none;
  box-shadow: none;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.cancel-btn.ios-btn {
  background: #f6f7fa;
  color: #63687a;
}

.cancel-btn.ios-btn:hover {
  background: #e5e7eb;
}

.save-btn.ios-btn {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}

.save-btn.ios-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-btn.ios-btn:hover:not(:disabled) {
  box-shadow: 0 2px 8px 0 #bfcfff55;
  background: linear-gradient(90deg, #7c82f7 0%, #a78bfa 100%);
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(260px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
  justify-items: start;
  align-items: stretch;
  justify-content: start;
}
.card-item {
  max-width: 320px;
  min-width: 220px;
  width: 100%;
  margin: 0;
  padding: 24px 16px 18px 16px;
  border-radius: 24px;
  border: 2px solid #bfcfff;
  background: transparent;
  box-shadow: none;
  transition: border-color 0.3s, transform 0.2s;
  cursor: pointer;
  position: relative;
  backdrop-filter: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.card-item:hover {
  transform: translateY(-2px);
  border-color: #6366f1;
}
/* .collection-item.done {
  border: 2px solid #6366f1;
} */
.collection-item.selected {
  border: 2px solid #6366f1 !important;
  box-shadow: 0 0 0 2px #bfcfff55;
  background: #f5f7ff;
}
.collection-delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #bfcfff;
  cursor: pointer;
  border-radius: 50%;
  padding: 4px;
  transition: background 0.2s, color 0.2s;
  z-index: 2;
}
.collection-delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}
.search-highlight {
  box-shadow: 0 0 0 3px #6366f1aa;
  border-color: #6366f1 !important;
  background: #f5f7ff;
  transition: box-shadow 0.3s, background 0.3s;
}
.scan-highlight {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 4px #6ee7b7aa;
  background: #e0fdf4;
  position: relative;
  transition: box-shadow 0.3s, background 0.3s;
}
.scan-loading {
  position: absolute;
  top: 12px; left: 12px;
  font-size: 13px;
  color: #10b981;
  font-weight: bold;
  z-index: 2;
}
.test-highlight {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 4px #6ee7b7aa;
  background: #e0fdf4;
  position: relative;
  transition: box-shadow 0.3s, background 0.3s;
}
</style>