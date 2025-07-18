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
        <!-- <button class="ios-btn rerank-btn" @click="openRerankDialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          重排序搜索
        </button>
        <button class="ios-btn history-btn" @click="openHistoryDialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          操作历史
        </button>
        <button class="ios-btn health-btn" @click="performHealthCheck">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          系统状态
        </button> -->
        <button class="ios-btn batch-delete-btn" @click="startBatchDelete" :disabled="isBatchDeleting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ isBatchDeleting ? '批量删除中...' : '批量删除测试数据' }}
        </button>
        
        <!-- 上传开关和进度条 -->
        <div class="upload-controls">
          <!-- 上传开关 -->
          <div class="upload-toggle-container">
            <label class="upload-toggle-label">记录上传</label>
            <button 
              class="upload-toggle-btn" 
              :class="{ 'active': uploadSettings.enableUpload }"
              @click="toggleUpload"
              title="控制是否上传记录信息到知识库"
            >
              <div class="toggle-slider"></div>
            </button>
          </div>
          
          <!-- 上传进度条 -->
          <div v-if="isUploading" class="upload-progress-container">
            <div class="upload-progress-bar">
              <div class="upload-progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="upload-progress-text">{{ uploadProgress }}%</span>
          </div>
          
          <!-- 批量删除进度条 -->
          <div v-if="isBatchDeleting" class="upload-progress-container">
            <div class="upload-progress-bar">
              <div class="upload-progress-fill" :style="{ width: batchDeleteProgress + '%' }"></div>
            </div>
            <span class="upload-progress-text">{{ batchDeleteProgress }}%</span>
          </div>
        </div>
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
                {{ collection.stats?.vector_stats?.content_types?.document ?? 0 }} 文档
              </span>
              <span class="stat-item">
                {{ collection.stats?.vector_stats?.content_types?.json ?? 0 }} JSON
              </span>
              <span class="stat-item">
                {{ collection.stats?.vector_stats?.content_types?.text ?? 0 }} 文本
              </span>
              <span class="stat-item">
                {{ collection.stats?.vector_stats?.content_types?.image ?? 0 }} 图片
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
              'test-highlight': testHighlightIndex === idx,
              editing: editingDocument?.id === getChunkId(document)
            }"
            @click="handleDocumentClick(document)"
          >
            <div v-if="isScanning && scanningDocs[scanningIndex] === getDocId(document)" class="scan-loading">
              正在读取...
            </div>
            <div v-if="testHighlightIndex === idx" class="scan-loading">正在读取...</div>
            
            <!-- 查看模式 -->
            <div v-else class="document-view-mode">
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
                <button class="action-btn edit-btn" @click.stop="handleDocumentClick(document)" title="编辑文档">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="action-btn delete-btn" @click.stop="deleteDocument(document)" title="删除文档">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
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
    <div v-if="showCreateDialog" class="edit-dialog-overlay">
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
    <div v-if="showUploadDialog" class="edit-dialog-overlay">
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
            <label class="edit-label">内容类型</label>
            <div class="content-type-selector">
              <label class="content-type-option" :class="{ active: uploadForm.contentType === 'text' }">
                <input 
                  type="radio" 
                  v-model="uploadForm.contentType" 
                  value="text" 
                  class="content-type-radio"
                />
                <span class="content-type-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  文本
                </span>
              </label>
              <label class="content-type-option" :class="{ active: uploadForm.contentType === 'json' }">
                <input 
                  type="radio" 
                  v-model="uploadForm.contentType" 
                  value="json" 
                  class="content-type-radio"
                />
                <span class="content-type-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  JSON
                </span>
              </label>
              <label class="content-type-option" :class="{ active: uploadForm.contentType === 'document' }">
                <input 
                  type="radio" 
                  v-model="uploadForm.contentType" 
                  value="document" 
                  class="content-type-radio"
                />
                <span class="content-type-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  文档
                </span>
              </label>
              <label class="content-type-option" :class="{ active: uploadForm.contentType === 'structured' }">
                <input 
                  type="radio" 
                  v-model="uploadForm.contentType" 
                  value="structured" 
                  class="content-type-radio"
                />
                <span class="content-type-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3h18v18H3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 9h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  结构化
                </span>
              </label>
            </div>
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
            <div class="content-input-wrapper">
              <textarea 
                v-model="uploadForm.content" 
                class="edit-textarea content-textarea main-content-textarea ios-input"
                :placeholder="getContentPlaceholder()"
                rows="15"
              ></textarea>
              <div class="content-type-hint" v-if="uploadForm.contentType !== 'text'">
                <div class="hint-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="hint-text">
                  <strong>{{ getContentTypeLabel() }}</strong>
                  <span>{{ getContentTypeDescription() }}</span>
                </div>
              </div>
            </div>
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
    <div v-if="showSearchDialog" class="edit-dialog-overlay">
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
            <div class="search-input-container">
              <input 
                v-model="searchForm.query" 
                type="text" 
                class="edit-input ios-input"
                placeholder="输入搜索关键词"
                @keyup.enter="performSearch"
              />
              <!-- 搜索建议下拉框 -->
              <div v-if="searchSuggestions.length > 0" class="search-suggestions">
                <div 
                  v-for="suggestion in searchSuggestions" 
                  :key="suggestion"
                  class="suggestion-item"
                  @click="selectSuggestion(suggestion)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  {{ suggestion }}
                </div>
              </div>
            </div>
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
          
          <!-- 新增：高级搜索选项 -->
          <div class="search-options">
            <h4 class="options-title">高级搜索选项</h4>
            <div class="options-grid">
              <div class="option-item">
                <label class="option-label">
                  <input 
                    v-model="searchForm.includeGraphContext" 
                    type="checkbox" 
                    class="option-checkbox"
                  />
                  包含图上下文
                </label>
              </div>
              <div class="option-item">
                <label class="option-label">
                  <input 
                    v-model="searchForm.includeReranking" 
                    type="checkbox" 
                    class="option-checkbox"
                  />
                  启用重排序
                </label>
              </div>
              <div class="option-item">
                <label class="option-label">
                  <input 
                    v-model="searchForm.includeReasoning" 
                    type="checkbox" 
                    class="option-checkbox"
                  />
                  生成推理合成
                </label>
              </div>
            </div>
            <div class="edit-field">
              <label class="edit-label">最小相关性分数 (0.0-1.0)</label>
              <input 
                v-model.number="searchForm.scoreThreshold" 
                type="number" 
                class="edit-input ios-input"
                placeholder="0.0"
                min="0.0"
                max="1.0"
                step="0.1"
              />
            </div>
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

    <!-- 新增：重排序搜索对话框 -->
    <div v-if="showRerankDialog" class="edit-dialog-overlay">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">高级重排序搜索</h3>
          <button class="close-btn" @click="closeRerankDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="edit-dialog-content">
          <div class="edit-field">
            <label class="edit-label">搜索关键词</label>
            <input 
              v-model="rerankForm.query" 
              type="text" 
              class="edit-input ios-input"
              placeholder="输入搜索关键词"
              @keyup.enter="performRerankSearch"
            />
          </div>
          <div class="edit-field">
            <label class="edit-label">选择集合</label>
            <select v-model="rerankForm.collectionName" class="edit-input ios-input">
              <option value="">所有集合</option>
              <option v-for="collection in collections" :key="collection.name" :value="collection.name">
                {{ collection.name }}
              </option>
            </select>
          </div>
          <div class="edit-field">
            <label class="edit-label">结果数量</label>
            <input 
              v-model.number="rerankForm.limit" 
              type="number" 
              class="edit-input ios-input"
              placeholder="5"
              min="1"
              max="20"
            />
          </div>
          <div class="edit-field">
            <label class="edit-label">重排序策略</label>
            <select v-model="rerankForm.rerankingStrategy" class="edit-input ios-input">
              <option value="cerebras_llm">Cerebras LLM</option>
            </select>
          </div>
          <div class="edit-field">
            <label class="edit-label">
              <input 
                v-model="rerankForm.includeExplanation" 
                type="checkbox" 
                class="option-checkbox"
              />
              包含详细解释
            </label>
          </div>
        </div>
        
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeRerankDialog">取消</button>
          <button 
            class="save-btn ios-btn" 
            @click="performRerankSearch" 
            :disabled="isReranking"
          >
            <span v-if="!isReranking">重排序搜索</span>
            <span v-else class="saving-indicator">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              重排序中...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 新增：操作历史对话框 -->
    <div v-if="showHistoryDialog" class="edit-dialog-overlay">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">操作历史</h3>
          <button class="close-btn" @click="closeHistoryDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="edit-dialog-content">
          <div class="history-filters">
            <div class="edit-field">
              <label class="edit-label">操作类型</label>
              <select v-model="historyForm.operationType" class="edit-input ios-input">
                <option value="">所有操作</option>
                <option value="edit">编辑操作</option>
                <option value="delete">删除操作</option>
              </select>
            </div>
            <div class="edit-field">
              <label class="edit-label">显示数量</label>
              <input 
                v-model.number="historyForm.limit" 
                type="number" 
                class="edit-input ios-input"
                placeholder="50"
                min="1"
                max="100"
              />
            </div>
          </div>
          
          <div v-if="isLoadingHistory" class="loading-state">
            <svg class="spinner" width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            加载操作历史中...
          </div>
          
          <div v-else-if="operationHistory.length > 0" class="history-list">
            <div 
              v-for="operation in operationHistory" 
              :key="operation.operation_id"
              class="history-item"
            >
              <div class="history-header">
                <span class="operation-type" :class="operation.operation_type">
                  {{ operation.operation_type === 'edit' ? '编辑' : '删除' }}
                </span>
                <span class="operation-time">{{ formatDate(operation.start_time) }}</span>
              </div>
              <div class="history-details">
                <div class="detail-row">
                  <span class="detail-label">集合:</span>
                  <span class="detail-value">{{ operation.collection_name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">块ID:</span>
                  <span class="detail-value">{{ operation.chunk_id }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">处理时间:</span>
                  <span class="detail-value">{{ operation.processing_time }}ms</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">状态:</span>
                  <span class="detail-value" :class="operation.status">
                    {{ operation.status === 'success' ? '成功' : '失败' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" class="empty-icon">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="empty-text">暂无操作历史</p>
          </div>
        </div>
        
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeHistoryDialog">关闭</button>
          <button 
            class="save-btn ios-btn" 
            @click="loadOperationHistory" 
            :disabled="isLoadingHistory"
          >
            刷新历史
          </button>
        </div>
      </div>
    </div>

    <!-- 文档详情对话框（可编辑） -->
    <div v-if="showDocumentDialog" class="edit-dialog-overlay">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">编辑文档</h3>
          <button class="close-btn" @click="closeDocumentDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="edit-dialog-content">
          <div class="edit-field">
            <label class="edit-label">标题</label>
            <input v-model="editingDialogDocument.metadata.title" class="edit-input" placeholder="输入标题" />
          </div>
          <div class="edit-field">
            <label class="edit-label">来源</label>
            <input v-model="editingDialogDocument.metadata.source" class="edit-input" placeholder="输入来源" />
          </div>
          <div class="edit-field">
            <label class="edit-label">内容</label>
            <textarea v-model="editingDialogDocument.content" class="edit-textarea" rows="8" placeholder="输入内容"></textarea>
          </div>
        </div>
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeDocumentDialog">取消</button>
          <button class="save-btn ios-btn" @click="saveDialogDocumentEdit" :disabled="isSaving">
            <span v-if="!isSaving">确认修改</span>
            <span v-else>保存中...</span>
          </button>
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
import { useUserInfoStore } from '@/stores/userInfoStore.js'

// 状态管理
const collections = ref([])
const searchResults = ref([])
const documents = ref([])
const isLoading = ref(false)

// 用户信息store
const userInfoStore = useUserInfoStore()
const { uploadSettings } = userInfoStore

// 对话框状态
const showCreateDialog = ref(false)
const showUploadDialog = ref(false)
const showSearchDialog = ref(false)
const showRerankDialog = ref(false)
const showHistoryDialog = ref(false)
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
  contentType: 'text', // 新增：内容类型
  title: '',
  content: '',
  source: ''
})

const searchForm = ref({
  query: '',
  collectionName: '',
  limit: 10,
  includeGraphContext: true, // 默认勾选：包含图上下文
  includeReranking: true, // 默认勾选：启用重排序
  includeReasoning: true, // 默认勾选：生成推理合成
  scoreThreshold: 0
})

const rerankForm = ref({
  query: '',
  collectionName: '',
  limit: 10,
  rerankingStrategy: 'cerebras_llm',
  includeExplanation: false
})

const historyForm = ref({
  operationType: '',
  limit: 50
})

// 当前选中的文档
const currentDocument = ref(null)

// 编辑文档相关状态
const editingDocument = ref(null)
const isSaving = ref(false)
const originalDocument = ref(null)

// 加载状态
const isCreating = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const isSearching = ref(false)
const isSimulatingSearch = ref(false)
const isScanning = ref(false)
const scanningIndex = ref(-1)
const scanningDocs = ref([])
const isReranking = ref(false)
const isLoadingHistory = ref(false)

// 灵动岛相关状态
const showIsland = ref(false)
const islandDocName = ref('')
const islandPercent = ref(0)
let islandTimer = null

// 选中合集状态
const selectedCollection = ref(null)

// 测试高亮索引
const testHighlightIndex = ref(-1)

// 批量删除相关状态
const isBatchDeleting = ref(false)
const batchDeleteProgress = ref(0)
const batchDeleteQueue = ref([])
const currentBatchDeleteIndex = ref(0)

// 全局扫描状态
const globalScanState = ref({
  isScanning: false,
  scanQueue: [],
  currentScanIndex: -1
})

// 操作历史
const operationHistory = ref([])

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

// 监听集合列表变化，自动设置第一个合集为默认搜索目标
watch(collections, (newCollections) => {
  if (newCollections && newCollections.length > 0) {
    if (!searchForm.value.collectionName) {
      searchForm.value.collectionName = newCollections[0].name
      console.log('自动设置默认搜索合集:', newCollections[0].name)
    }
    if (!rerankForm.value.collectionName) {
      rerankForm.value.collectionName = newCollections[0].name
      console.log('自动设置默认重排序搜索合集:', newCollections[0].name)
    }
  }
}, { immediate: true })

// 添加startSearch方法，与highlightAllDocuments效果相同
function startSearch() {
  console.log('startSearch called')
  highlightAllDocuments()
}

// 批量删除功能
const startBatchDelete = async () => {
  if (filteredDocuments.value.length === 0) {
    showSuccessNotification('当前没有可删除的文档')
    return
  }
  
  if (!confirm(`确定要批量删除 ${filteredDocuments.value.length} 个文档吗？此操作不可撤销！`)) {
    return
  }
  
  try {
    isBatchDeleting.value = true
    batchDeleteProgress.value = 0
    batchDeleteQueue.value = [...filteredDocuments.value]
    currentBatchDeleteIndex.value = 0
    
    console.log(`开始批量删除 ${batchDeleteQueue.value.length} 个文档`)
    
    // 开始轮询删除
    await executeBatchDelete()
    
  } catch (error) {
    console.error('批量删除失败:', error)
    showSuccessNotification('批量删除失败: ' + error.message)
  } finally {
    isBatchDeleting.value = false
    batchDeleteProgress.value = 0
    batchDeleteQueue.value = []
    currentBatchDeleteIndex.value = 0
  }
}

const executeBatchDelete = async () => {
  if (currentBatchDeleteIndex.value >= batchDeleteQueue.value.length) {
    console.log('批量删除完成')
    showSuccessNotification(`批量删除完成，共删除 ${batchDeleteQueue.value.length} 个文档`)
    
    // 重新加载文档列表
    await loadDocuments()
    
    // 刷新统计数据以确保显示最新数据
    await refreshCollectionStats()
    return
  }
  
  const currentDoc = batchDeleteQueue.value[currentBatchDeleteIndex.value]
  
  try {
    console.log(`正在删除第 ${currentBatchDeleteIndex.value + 1}/${batchDeleteQueue.value.length} 个文档:`, currentDoc.metadata?.title || '无标题')
    
    const chunkId = getChunkId(currentDoc)
    await knowledgeApi.deleteChunk(currentDoc.collection_name, chunkId)
    
    // 更新进度
    currentBatchDeleteIndex.value++
    batchDeleteProgress.value = Math.round((currentBatchDeleteIndex.value / batchDeleteQueue.value.length) * 100)
    
    // 添加延迟，避免API调用过于频繁
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 继续删除下一个
    await executeBatchDelete()
    
  } catch (error) {
    console.error(`删除文档失败 (${currentBatchDeleteIndex.value + 1}/${batchDeleteQueue.value.length}):`, error)
    showSuccessNotification(`删除文档失败: ${currentDoc.metadata?.title || '无标题'} - ${error.message}`)
    
    // 继续删除下一个，不中断整个流程
    currentBatchDeleteIndex.value++
    batchDeleteProgress.value = Math.round((currentBatchDeleteIndex.value / batchDeleteQueue.value.length) * 100)
    await new Promise(resolve => setTimeout(resolve, 500))
    await executeBatchDelete()
  }
}

// 执行扫描队列
const executeScanQueue = async () => {
  if (globalScanState.value.scanQueue.length === 0) {
    globalScanState.value.isScanning = false
    return
  }
  
  // 获取API开始时间
  const apiStartTime = window.apiStartTime || Date.now()
  const currentTime = Date.now()
  const totalElapsed = currentTime - apiStartTime
  
  const currentId = globalScanState.value.scanQueue[globalScanState.value.currentScanIndex]
  if (currentId) {
    const idx = filteredDocuments.value.findIndex(doc => getDocId(doc) === currentId)
    if (idx !== -1) {
      testHighlightIndex.value = idx
      
      // 基于API请求时间计算扫描时间
      const estimatedTotalDuration = 8000 // 预估总时间8秒
      const overallProgress = Math.min(totalElapsed / estimatedTotalDuration, 0.9)
      const scanTime = Math.max(800, Math.min(2000, 1200 * (1 + overallProgress * 0.5))) // 800-2000ms之间
      
      console.log(`executeScanQueue扫描时间: ${scanTime}ms, API进度: ${(overallProgress * 100).toFixed(1)}%`)
      await new Promise(resolve => setTimeout(resolve, scanTime))
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

// 刷新集合统计数据
const refreshCollectionStats = async () => {
  try {
    for (const collection of collections.value) {
      try {
        const stats = await knowledgeApi.getCollectionStats(collection.name)
        collection.stats = stats.statistics
        console.log(`✅ 集合 ${collection.name} 统计数据已更新:`, stats.statistics)
      } catch (error) {
        console.warn(`获取集合 ${collection.name} 统计信息失败:`, error)
      }
    }
  } catch (error) {
    console.error('刷新集合统计数据失败:', error)
  }
}

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
    await refreshCollectionStats()
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
    contentType: 'text', // 重置为默认的文本类型
    title: '',
    content: '',
    source: ''
  }
}

// 切换上传开关
const toggleUpload = () => {
  userInfoStore.toggleUpload()
}

// 通用上传方法，可以被外部调用
const uploadContentToCollection = async (content, collectionName, metadata = {}) => {
  if (!content || !content.trim()) {
    console.error('上传内容为空')
    return { success: false, message: '上传内容为空' }
  }

  if (!collectionName) {
    console.error('集合名称为空')
    return { success: false, message: '集合名称为空' }
  }

  try {
    isUploading.value = true
    uploadProgress.value = 0
    
    // 模拟上传进度 - 30%前快，中间慢，后面快
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        let increment = 0
        
        if (uploadProgress.value < 30) {
          // 前30%：快速增长 8-15
          increment = Math.floor(Math.random() * 8) + 8
        } else if (uploadProgress.value < 70) {
          // 30%-70%：慢速增长 2-5
          increment = Math.floor(Math.random() * 4) + 2
        } else {
          // 70%-90%：快速增长 6-12
          increment = Math.floor(Math.random() * 7) + 6
        }
        
        uploadProgress.value = Math.min(uploadProgress.value + increment, 90)
      }
    }, 200)
    
    const defaultMetadata = {
      title: '无标题',
      source: '系统上传',
      author: '系统'
    }
    
    const finalMetadata = { ...defaultMetadata, ...metadata }

    await knowledgeApi.uploadTextContent(
      content,
      collectionName,
      finalMetadata,
      true,
      false
    )
    
    // 完成上传
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 等待一小段时间显示100%
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('✅ 内容上传成功')
    
    // 立即更新集合列表和文档列表
    try {
      await loadCollections()
      await loadDocuments()
      console.log('✅ 页面数据更新成功')
    } catch (error) {
      console.error('❌ 页面数据更新失败:', error)
    }
    
    // 刷新统计数据以确保显示最新数据
    await refreshCollectionStats()
    
    return { success: true, message: '内容上传成功' }
  } catch (error) {
    console.error('上传内容失败:', error)
    return { success: false, message: '上传内容失败: ' + error.message, error }
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const uploadContent = async () => {
  if (!uploadForm.value.collectionName || !uploadForm.value.content.trim()) {
    showSuccessNotification('请选择集合并输入内容')
    return
  }

  const metadata = {
    title: uploadForm.value.title || '无标题',
    source: uploadForm.value.source || '用户上传',
    author: '用户'
  }

  try {
    isUploading.value = true
    uploadProgress.value = 0
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        let increment = 0
        
        if (uploadProgress.value < 30) {
          increment = Math.floor(Math.random() * 8) + 8
        } else if (uploadProgress.value < 70) {
          increment = Math.floor(Math.random() * 4) + 2
        } else {
          increment = Math.floor(Math.random() * 7) + 6
        }
        
        uploadProgress.value = Math.min(uploadProgress.value + increment, 90)
      }
    }, 200)

    let result
    const contentType = uploadForm.value.contentType

    // 根据内容类型调用相应的API方法
    switch (contentType) {
      case 'text':
        result = await knowledgeApi.uploadTextContent(
          uploadForm.value.content,
          uploadForm.value.collectionName,
          metadata,
          true,
          false
        )
        break
      case 'json':
        // 尝试解析JSON内容
        let jsonContent
        try {
          jsonContent = JSON.parse(uploadForm.value.content)
        } catch (error) {
          throw new Error('JSON格式不正确，请检查内容格式')
        }
        result = await knowledgeApi.uploadJsonContent(
          jsonContent,
          uploadForm.value.collectionName,
          metadata,
          true,
          false
        )
        break
      case 'document':
        result = await knowledgeApi.uploadDocumentContent(
          uploadForm.value.content,
          uploadForm.value.collectionName,
          metadata,
          true,
          false
        )
        break
      case 'structured':
        // 尝试解析结构化内容
        let structuredContent
        try {
          structuredContent = JSON.parse(uploadForm.value.content)
        } catch (error) {
          throw new Error('结构化数据格式不正确，请检查内容格式')
        }
        result = await knowledgeApi.uploadStructuredContent(
          structuredContent,
          uploadForm.value.collectionName,
          metadata,
          true,
          false
        )
        break
      default:
        throw new Error('不支持的内容类型')
    }
    
    // 完成上传
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 等待一小段时间显示100%
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('✅ 内容上传成功')
    
    // 立即更新集合列表和文档列表
    try {
      await loadCollections()
      await loadDocuments()
      console.log('✅ 页面数据更新成功')
    } catch (error) {
      console.error('❌ 页面数据更新失败:', error)
    }
    
    // 刷新统计数据以确保显示最新数据
    await refreshCollectionStats()
    
    showSuccessNotification('内容上传成功')
    closeUploadDialog()
  } catch (error) {
    console.error('上传内容失败:', error)
    showSuccessNotification('上传内容失败: ' + error.message)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// 搜索功能
const closeSearchDialog = () => {
  showSearchDialog.value = false
  // 保持当前选择的合集，只清空查询
  const currentCollection = searchForm.value.collectionName
  searchForm.value = {
    query: '',
    collectionName: currentCollection || (collections.value.length > 0 ? collections.value[0].name : ''),
    limit: 10,
    includeGraphContext: true,
    includeReranking: true,
    includeReasoning: true,
    scoreThreshold: 0
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
      limit: searchForm.value.limit || 10,
      collectionName: searchForm.value.collectionName || null,
      includeGraphContext: searchForm.value.includeGraphContext,
      includeReranking: searchForm.value.includeReranking,
      includeReasoning: searchForm.value.includeReasoning,
      scoreThreshold: searchForm.value.scoreThreshold
    }

    const response = await knowledgeApi.search(
      searchForm.value.query,
      searchOptions
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
const searchInFirstCollection = async (query, limit = 10) => {
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
      {
        limit: limit,
        collectionName: firstCollection.name,
        includeGraphContext: true,
        includeReranking: true,
        includeReasoning: true,
        scoreThreshold: 0
      }
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

// 新增：便捷的重排序搜索方法
const rerankSearchInFirstCollection = async (query, limit = 10) => {
  if (!query || !query.trim()) {
    console.log('重排序搜索查询为空')
    return { success: false, message: '重排序搜索查询为空' }
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

    console.log(`在合集 "${firstCollection.name}" 中进行重排序搜索: "${query}"`)

    const response = await knowledgeApi.rerankSearch(
      query.trim(),
      {
        limit: limit,
        collectionName: firstCollection.name,
        includeExplanation: true,
        rerankingStrategy: 'cerebras_llm'
      }
    )
    
    console.log('重排序搜索返回结果:', response)
    
    return {
      success: true,
      data: response,
      collectionName: firstCollection.name,
      query: query.trim(),
      resultsCount: response.reranked_results?.length || 0,
      rerankedResults: response.reranked_results || [],
      detailedAnalysis: response.detailed_analysis,
      rerankingStats: response.reranking_stats
    }
  } catch (error) {
    console.error('重排序搜索失败:', error)
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
        const response = await knowledgeApi.search('', {
          limit: 50,
          collectionName: collection.name,
          includeGraphContext: true,
          includeReranking: true,
          includeReasoning: true,
          scoreThreshold: 0
        })
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
  editingDialogDocument.value = {
    id: getChunkId(document),
    content: document.content || '',
    metadata: {
      title: document.metadata?.title || '',
      source: document.metadata?.source || '',
      author: document.metadata?.author || '',
      chunk_id: document.metadata?.chunk_id || '',
      descriptive_id: document.metadata?.descriptive_id || ''
    },
    collection_name: document.collection_name
  }
  showDocumentDialog.value = true
}

// 关闭文档详情对话框
const closeDocumentDialog = () => {
  showDocumentDialog.value = false
  currentDocument.value = null
}

// 重排序搜索
const openRerankDialog = () => {
  rerankForm.value = {
    query: '',
    collectionName: collections.value.length > 0 ? collections.value[0].name : '',
    limit: 10,
    rerankingStrategy: 'cerebras_llm',
    includeExplanation: false
  }
  isReranking.value = false
  showRerankDialog.value = true
}

const closeRerankDialog = () => {
  showRerankDialog.value = false
  // 保持当前选择的合集，只清空查询
  const currentCollection = rerankForm.value.collectionName
  rerankForm.value = {
    query: '',
    collectionName: currentCollection || (collections.value.length > 0 ? collections.value[0].name : ''),
    limit: 10,
    rerankingStrategy: 'cerebras_llm',
    includeExplanation: false
  }
}

const performRerankSearch = async () => {
  if (!rerankForm.value.query.trim()) {
    showSuccessNotification('请输入搜索关键词')
    return
  }

  try {
    isReranking.value = true
    
    console.log('开始重排序搜索:', {
      query: rerankForm.value.query,
      limit: rerankForm.value.limit,
      collectionName: rerankForm.value.collectionName,
      includeExplanation: rerankForm.value.includeExplanation,
      rerankingStrategy: rerankForm.value.rerankingStrategy
    })
    
    const rerankOptions = {
      limit: rerankForm.value.limit || 10,
      collectionName: rerankForm.value.collectionName || null,
      includeExplanation: rerankForm.value.includeExplanation,
      rerankingStrategy: rerankForm.value.rerankingStrategy
    }

    const response = await knowledgeApi.rerankSearch(
      rerankForm.value.query.trim(),
      rerankOptions
    )
    
    console.log('重排序搜索响应:', response)
    
    // 处理响应结果
    if (response.reranked_results && Array.isArray(response.reranked_results)) {
      searchResults.value = response.reranked_results
      showSuccessNotification(`重排序搜索完成: 找到 ${searchResults.value.length} 条结果`)
      
      // 如果有详细分析，显示在控制台
      if (response.detailed_analysis) {
        console.log('重排序详细分析:', response.detailed_analysis)
      }
      
      // 如果有重排序统计，显示在控制台
      if (response.reranking_stats) {
        console.log('重排序统计:', response.reranking_stats)
      }
    } else {
      searchResults.value = []
      showSuccessNotification('重排序搜索完成，但未找到相关结果')
    }
    
    closeRerankDialog()
  } catch (error) {
    console.error('重排序搜索失败:', error)
    showSuccessNotification('重排序搜索失败: ' + error.message)
  } finally {
    isReranking.value = false
  }
}

// 内容类型相关辅助方法
const getContentPlaceholder = () => {
  const contentType = uploadForm.value.contentType
  switch (contentType) {
    case 'text':
      return '输入要上传的文本内容...'
    case 'json':
      return '输入JSON格式的内容，例如：\n{\n  "name": "示例",\n  "value": 123,\n  "items": ["a", "b", "c"]\n}'
    case 'document':
      return '输入文档内容，支持富文本格式...'
    case 'structured':
      return '输入结构化数据，例如：\n{\n  "type": "product",\n  "attributes": {\n    "name": "产品名称",\n    "price": 99.99\n  }\n}'
    default:
      return '输入要上传的内容...'
  }
}

const getContentTypeLabel = () => {
  const contentType = uploadForm.value.contentType
  switch (contentType) {
    case 'text':
      return '文本内容'
    case 'json':
      return 'JSON数据'
    case 'document':
      return '文档内容'
    case 'structured':
      return '结构化数据'
    default:
      return '未知类型'
  }
}

const getContentTypeDescription = () => {
  const contentType = uploadForm.value.contentType
  switch (contentType) {
    case 'text':
      return '适用于普通文本、文章、笔记等'
    case 'json':
      return '适用于结构化数据、配置信息、API响应等'
    case 'document':
      return '适用于正式文档、报告、手册等'
    case 'structured':
      return '适用于数据库记录、产品信息、用户数据等'
    default:
      return ''
  }
}

// 操作历史
const openHistoryDialog = () => {
  historyForm.value = {
    operationType: '',
    limit: 50
  }
  isLoadingHistory.value = false
  operationHistory.value = []
  showHistoryDialog.value = true
  // 自动加载操作历史
  loadOperationHistory()
}

const closeHistoryDialog = () => {
  showHistoryDialog.value = false
}

const loadOperationHistory = async () => {
  try {
    isLoadingHistory.value = true
    const response = await knowledgeApi.getOperationHistory({
      operationType: historyForm.value.operationType,
      limit: historyForm.value.limit
    })
    operationHistory.value = response.operation_history?.operations || []
    
    if (operationHistory.value.length > 0) {
      showSuccessNotification(`加载了 ${operationHistory.value.length} 条操作记录`)
    } else {
      showSuccessNotification('暂无操作历史记录')
    }
  } catch (error) {
    console.error('加载操作历史失败:', error)
    showSuccessNotification('加载操作历史失败: ' + error.message)
  } finally {
    isLoadingHistory.value = false
  }
}

// 系统健康检查
const performHealthCheck = async () => {
  try {
    const healthInfo = await knowledgeApi.healthCheck()
    const systemInfo = await knowledgeApi.getSystemInfo()
    
    const message = `系统状态: ${healthInfo.status}\n` +
                   `版本: ${healthInfo.version}\n` +
                   `运行时间: ${healthInfo.uptime}\n` +
                   `活跃用户: ${healthInfo.active_users}\n` +
                   `总集合数: ${healthInfo.total_collections}`
    
    showSuccessNotification('系统状态检查完成')
    console.log('系统健康信息:', healthInfo)
    console.log('系统信息:', systemInfo)
  } catch (error) {
    console.error('健康检查失败:', error)
    showSuccessNotification('健康检查失败: ' + error.message)
  }
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

  // 获取文档的chunk_id（用于API操作）
  function getChunkId(doc) {
    return doc?.metadata?.chunk_id || doc?.id || ""
  }
  
  // 获取文档的descriptive_id（用于编辑器显示）
  function getDescriptiveId(doc) {
    return doc?.metadata?.descriptive_id || doc?.metadata?.chunk_id || doc?.id || ""
  }

// 保持向后兼容的getDocId方法（默认使用chunk_id）
function getDocId(doc) {
  return getChunkId(doc)
}

async function highlightDocumentsSequentially(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return
  console.log('highlightDocumentsSequentially called, ids:', ids)
  
  // 获取API开始时间
  const apiStartTime = window.apiStartTime || Date.now()
  const currentTime = Date.now()
  const totalElapsed = currentTime - apiStartTime
  
  console.log(`DocumentationPanel扫描开始，API已运行: ${totalElapsed}ms`)
  
  for (let i = 0; i < ids.length; i++) {
    const idx = filteredDocuments.value.findIndex(doc => getDocId(doc) === ids[i])
    console.log(`高亮第${i+1}个文档，id:`, ids[i], 'idx:', idx, 'filteredDocuments:', filteredDocuments.value)
    if (idx === -1) continue
    testHighlightIndex.value = idx
    
    // 基于API请求时间计算扫描时间
    const estimatedTotalDuration = 8000 // 预估总时间8秒
    const overallProgress = Math.min(totalElapsed / estimatedTotalDuration, 0.9)
    const scanTime = Math.max(800, Math.min(2000, 1200 * (1 + overallProgress * 0.5))) // 800-2000ms之间
    
    console.log(`文档扫描时间: ${scanTime}ms, 基于API进度: ${(overallProgress * 100).toFixed(1)}%`)
    await new Promise(resolve => setTimeout(resolve, scanTime))
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

// 新增：搜索建议功能
const searchSuggestions = ref([])
const isLoadingSuggestions = ref(false)

const getSearchSuggestions = async (query, limit = 3) => {
  if (!query || !query.trim()) {
    searchSuggestions.value = []
    return
  }

  try {
    isLoadingSuggestions.value = true
    const response = await knowledgeApi.getSearchSuggestions(query.trim(), limit)
    searchSuggestions.value = response.suggestions || []
  } catch (error) {
    console.error('获取搜索建议失败:', error)
    searchSuggestions.value = []
  } finally {
    isLoadingSuggestions.value = false
  }
}

// 监听搜索输入，自动获取建议
watch(() => searchForm.value.query, (newQuery) => {
  if (newQuery && newQuery.trim().length > 2) {
    getSearchSuggestions(newQuery, 3)
  } else {
    searchSuggestions.value = []
  }
}, { debounce: 300 })

// 选择搜索建议
const selectSuggestion = (suggestion) => {
  searchForm.value.query = suggestion
  searchSuggestions.value = []
}

// 文档编辑功能
const handleDocumentClick = (document) => {
  // 如果正在编辑，点击其他地方不退出编辑模式
  if (editingDocument.value?.id === getChunkId(document)) return
  
  // 如果正在编辑其他文档，先取消编辑
  if (editingDocument.value) {
    cancelDocumentEdit()
  }
  
  // 打开文档详情
  openDocumentDetails(document)
}

const cancelDocumentEdit = () => {
  editingDocument.value = null
  originalDocument.value = null
}

const deleteDocument = async (document) => {
  if (!confirm(`确定要删除文档 "${document.metadata?.title || '无标题'}" 吗？`)) return
  
  try {
    const chunkId = getChunkId(document)
    console.log('删除文档 - 使用的chunk_id:', chunkId)
    console.log('删除文档 - 完整文档信息:', document)
    
    // 调用删除API
    await knowledgeApi.deleteChunk(document.collection_name, chunkId)
    
    showSuccessNotification('文档删除成功')
    
    // 重新加载文档列表
    await loadDocuments()
    
    // 刷新统计数据以确保显示最新数据
    await refreshCollectionStats()
  } catch (error) {
    console.error('删除文档失败:', error)
    showSuccessNotification('删除文档失败: ' + error.message)
  }
}

// 编辑弹窗的副本
const editingDialogDocument = ref({
  id: '',
  content: '',
  metadata: { 
    title: '', 
    source: '', 
    author: '',
    chunk_id: '',
    descriptive_id: ''
  },
  collection_name: ''
});

// 保存弹窗编辑
const saveDialogDocumentEdit = async () => {
  if (!editingDialogDocument.value) return;
  try {
    isSaving.value = true;
    console.log('弹窗编辑 - 使用的chunk_id:', editingDialogDocument.value.id);
    console.log('弹窗编辑 - 完整文档信息:', editingDialogDocument.value);

    // 构建 new_metadata，包含 title/source
    const newMetadata = {
      version: 2.0,
      last_updated: new Date().toISOString(),
      editor: editingDialogDocument.value.metadata.descriptive_id, // 使用descriptive_id作为编辑器标识
      title: editingDialogDocument.value.metadata?.title || '',
      source: editingDialogDocument.value.metadata?.source || ''
    }
    
    const response = await knowledgeApi.editChunk(
      editingDialogDocument.value.collection_name,
      editingDialogDocument.value.id,
      editingDialogDocument.value.content,
      newMetadata
    );
    
    console.log('弹窗编辑API响应:', response)
    
    // 检查编辑是否成功
    if (response.status === 'success') {
      console.log('弹窗编辑成功，operation_id:', response.operation_id)
      showSuccessNotification('文档修改成功');
      showDocumentDialog.value = false;
      await loadDocuments();
    } else {
      throw new Error('编辑失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    showSuccessNotification('保存失败: ' + error.message);
  } finally {
    isSaving.value = false;
  }
};

defineExpose({ 
  simulateSearchAll, 
  filteredDocuments, 
  startScanAnimation, 
  highlightFirstDocument, 
  highlightDocumentsSequentially,
  highlightAllDocuments,
  startSearch,
  searchInFirstCollection,
  rerankSearchInFirstCollection,
  loadDocuments,
  loadCollections,
  uploadContentToCollection,
  openRerankDialog,
  openHistoryDialog,
  loadOperationHistory,
  performHealthCheck,
  refreshCollectionStats
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

.documentation-content::-webkit-scrollbar {
  display: none;
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

.rerank-btn {
  background: #f6f7fa;
  color: #6366f1;
}

.history-btn {
  background: #f6f7fa;
  color: #6366f1;
}

.health-btn {
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

/* 上传进度条样式 */
.upload-progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 20px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  min-width: 120px;
}

.upload-progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.upload-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.upload-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  min-width: 32px;
  text-align: center;
}

/* 上传控制区域样式 */
.upload-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 20px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
}

.upload-toggle-label {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  white-space: nowrap;
}

.upload-toggle-btn {
  position: relative;
  width: 36px;
  height: 20px;
  background: #e2e8f0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.upload-toggle-btn.active {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-toggle-btn.active .toggle-slider {
  left: 18px;
}

/* 批量删除按钮样式 */
.batch-delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.batch-delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.batch-delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* 高级搜索选项样式 */
.search-options {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.options-title {
  font-size: 16px;
  font-weight: 600;
  color: #22223b;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.option-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
}

/* 操作历史样式 */
.history-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #22223b;
}

.operation-type {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.operation-type.edit {
  background-color: #e0f2fe;
  color: #1d4ed8;
}

.operation-type.delete {
  background-color: #fef3c7;
  color: #d97706;
}

.operation-time {
  color: #9ca3af;
  font-size: 12px;
}

.history-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;
}

.detail-label {
  font-weight: 500;
  color: #4b5563;
}

.detail-value {
  font-weight: 400;
  color: #22223b;
}

.detail-value.success {
  color: #10b981;
}

.detail-value.failed {
  color: #ef4444;
}

/* 搜索建议样式 */
.search-input-container {
  position: relative;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  flex: 1;
}

.search-suggestions-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.search-suggestions-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.search-suggestions-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.search-suggestions-btn svg {
  width: 16px;
  height: 16px;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #6366f1;
  font-size: 14px;
}

.suggestion-item:hover {
  background-color: #f6f7fa;
}

.suggestion-item svg {
  color: #9ca3af;
  flex-shrink: 0;
}

/* 文档编辑模式样式 */
.document-item.editing {
  border-color: #6366f1 !important;
  background: #f5f7ff;
  box-shadow: 0 0 0 2px #bfcfff55;
  transition: border-color 0.3s, background 0.3s;
}

.document-edit-mode {
  width: 100%;
  padding: 18px 8px 8px 8px;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 2px 8px 0 #bfcfff22;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.edit-label {
  font-size: 15px;
  font-weight: 600;
  color: #6366f1;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.edit-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
  transition: background 0.2s, color 0.2s;
}

.edit-action-btn.save-btn {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}
.edit-action-btn.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.edit-action-btn.save-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #7c82f7 0%, #a78bfa 100%);
}

.edit-action-btn.cancel-btn {
  background: #fee2e2;
  color: #dc2626;
}
.edit-action-btn.cancel-btn:hover {
  background: #fecaca;
  color: #b91c1c;
}

.edit-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-field-label {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 2px;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  background: #f6f7fa;
  color: #22223b;
  transition: border-color 0.2s, background 0.2s;
  font-family: inherit;
  resize: none;
}

.edit-input:focus,
.edit-textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: #fff;
}

.edit-textarea {
  min-height: 90px;
  resize: vertical;
}

/* 内容类型选择器样式 */
.content-type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 4px;
}

.content-type-option {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.content-type-option:hover {
  border-color: #bfcfff;
  background: #f5f7ff;
}

.content-type-option.active {
  border-color: #6366f1;
  background: linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.content-type-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.content-type-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  width: 100%;
}

.content-type-option.active .content-type-label {
  color: #6366f1;
  font-weight: 600;
}

.content-type-label svg {
  flex-shrink: 0;
  color: #9ca3af;
  transition: color 0.2s;
}

.content-type-option.active .content-type-label svg {
  color: #6366f1;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .content-type-selector {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .content-type-option {
    padding: 10px 12px;
  }
  
  .content-type-label {
    font-size: 13px;
  }
}

/* 内容输入包装器和提示样式 */
.content-input-wrapper {
  position: relative;
}

.content-type-hint {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(8px);
  max-width: 280px;
  z-index: 5;
}

.hint-icon {
  flex-shrink: 0;
  color: #6366f1;
  margin-top: 1px;
}

.hint-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  line-height: 1.4;
}

.hint-text strong {
  color: #6366f1;
  font-weight: 600;
}

.hint-text span {
  color: #6b7280;
  font-size: 11px;
}

/* 响应式调整提示框 */
@media (max-width: 640px) {
  .content-type-hint {
    position: static;
    margin-top: 8px;
    max-width: none;
  }
}
</style>