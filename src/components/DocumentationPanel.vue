<template>
  <div class="documentation-panel">
    <DynamicIsland :visible="showIsland" :docName="islandDocName" :percent="islandPercent" />
    <div class="documentation-content">
      <div class="document-grid">
        <div 
          v-for="(doc, idx) in documents" 
          :key="doc.id"
          class="document-item"
          :class="doc.status"
          @click="openEditDialog(doc)"
        >
          <component 
            :is="getIconComponent(doc.type, doc.category).component" 
            :size="64" 
            :color="getCardColor(doc)"
            class="doc-icon"
          />
          <div class="doc-name" :class="doc.status">{{ doc.name }}</div>
        </div>
      </div>
    </div>
    <!-- 测试灵动岛按钮 -->
    <div v-if="showEditDialog" style="text-align:center;margin:10px 0 0 0;">
      <button class="ios-btn" style="background:#6366f1;color:#fff;min-width:90px;" @click="testIsland">测试灵动岛</button>
    </div>
    <!-- 文档编辑对话框 -->
    <div v-if="showEditDialog" class="edit-dialog-overlay" @click="closeEditDialog">
      <div class="edit-dialog" @click.stop>
        <div class="edit-dialog-header">
          <h3 class="edit-dialog-title">编辑文档</h3>
          <button class="close-btn" @click="closeEditDialog" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="edit-dialog-content">
          <div class="edit-field file-name-field">
            <label class="edit-label file-label">文件名</label>
            <input 
              v-model="editingDoc.name" 
              type="text" 
              class="edit-input file-input ios-input"
              placeholder="输入文件名"
              maxlength="40"
            />
          </div>
          <div class="edit-field main-content-field">
            <label class="edit-label main-label">文档内容</label>
            <textarea 
              v-model="editingDoc.content" 
              class="edit-textarea content-textarea main-content-textarea ios-input"
              placeholder="输入文档内容"
              rows="20"
            ></textarea>
          </div>
        </div>
        
        <div class="edit-dialog-footer">
          <button class="cancel-btn ios-btn" @click="closeEditDialog">取消</button>
          <button class="save-btn ios-btn" @click="saveDocument" :disabled="isSaving">
            <span v-if="!isSaving">保存</span>
            <span v-else class="saving-indicator">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              保存中...
            </span>
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
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentScanStore } from '@/stores/documentScanStore.js'
import documentService from '@/services/documentService.js'
import DynamicIsland from './DynamicIsland.vue'

const documentScanStore = useDocumentScanStore()
const { documents, isScanning } = storeToRefs(documentScanStore)

// 编辑相关状态
const showEditDialog = ref(false)
const editingDoc = ref(null)
const isSaving = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')

// 灵动岛相关状态
const showIsland = ref(false)
const islandDocName = ref('')
const islandPercent = ref(0)
let islandTimer = null

// 测试按钮触发灵动岛动画
const testIsland = () => {
  if (!editingDoc.value) return
  showIsland.value = true
  islandDocName.value = editingDoc.value.name
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

onMounted(() => {
  // 初始化文档数据
  documentScanStore.initializeDocuments()
})

const getCardColor = (doc) => {
  if (doc.status === 'default') return '#bfcfff'
  if (doc.status === 'searching') return '#6366f1'
  if (doc.status === 'done') return '#6366f1'
  return documentService.getDocumentIcon(doc.type, doc.category).color
}

const getIconComponent = (type, category) => {
  return documentService.getDocumentIcon(type, category)
}

// 打开编辑对话框
const openEditDialog = (doc) => {
  editingDoc.value = { ...doc }
  showEditDialog.value = true
}

// 关闭编辑对话框
const closeEditDialog = () => {
  showEditDialog.value = false
  editingDoc.value = null
}

// 保存文档
const saveDocument = async () => {
  if (!editingDoc.value || isSaving.value) return
  
  isSaving.value = true
  
  try {
    // 更新文档服务中的数据
    const updatedDoc = await documentService.updateDocument(editingDoc.value.id, {
      name: editingDoc.value.name,
      description: editingDoc.value.description,
      content: editingDoc.value.content
    })
    
    if (updatedDoc) {
      // 更新store中的文档数据
      const docIndex = documentScanStore.documents.findIndex(d => d.id === updatedDoc.id)
      if (docIndex !== -1) {
        documentScanStore.documents[docIndex] = { 
          ...documentScanStore.documents[docIndex], 
          ...updatedDoc 
        }
      }
      
      console.log('✅ 文档保存成功:', updatedDoc.name)
      showSuccessNotification(`文档 "${updatedDoc.name}" 保存成功`)
      closeEditDialog()
    }
  } catch (error) {
    console.error('❌ 保存文档失败:', error)
  } finally {
    isSaving.value = false
  }
}

// 显示成功提示
const showSuccessNotification = (message) => {
  successMessage.value = message
  showSuccessMessage.value = true
  
  // 3秒后自动隐藏
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}
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
.documentation-content > * {
  position: relative;
  z-index: 2;
}

.search-btn {
  margin-bottom: 10px;
  padding: 4px 18px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(90deg, #e0e7ff 0%, #f3f4f6 100%);
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 2px 12px 0 rgba(99,102,241,0.08);
  backdrop-filter: blur(8px);
  transition: box-shadow 0.2s, background 0.2s;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 18px;
  background: transparent;
}

.document-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 2px 18px 2px;
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
.document-item.searching {
  border: 2px solid #6366f1;
  background: transparent;
  box-shadow: 0 0 0 6px #6366f133;
  animation: scanFlash 0.4s;
}
.document-item.searching::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 20px;
  top: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0) 100%);
  filter: blur(8px);
  z-index: 2;
  pointer-events: none;
  animation: card-glow-scan-c6fe163e 0.5s cubic-bezier(.4,0,.6,1) infinite alternate;
}
@keyframes card-glow-scan {
  0% { top: 0; }
  100% { top: 62%; }
}
@keyframes scanFlash {
  0% { box-shadow: 0 0 0 0 #6366f133; }
  100% { box-shadow: 0 0 0 6px #6366f133; }
}
.document-item.done {
  border: 2px solid #6366f1;
  background: transparent;
  box-shadow: none;
}

.doc-icon {
  margin-bottom: 2px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}
.document-item.searching .doc-icon {
  color: #6366f1 !important;
}
.document-item.done .doc-icon {
  color: #6366f1 !important;
}

.doc-name {
  color: #bfcfff;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: color 0.2s;
  text-align: center;
}
.doc-name.done {
  color: #6366f1;
}

/* 编辑对话框样式 */
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

.edit-meta-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 8px;
}

.meta-input {
  font-size: 13px;
  color: #6b7280;
  background: #f7f7fa;
  border: 1.5px solid #e5e7eb;
  padding: 6px 12px;
  border-radius: 8px;
  flex: 1 1 0;
  min-width: 0;
  margin-bottom: 0;
  font-weight: 400;
}

.desc-input {
  flex: 2 1 0;
}

.edit-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.edit-label.main-label {
  font-size: 15px;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 8px;
}

.edit-field {
  margin-bottom: 20px;
}

.edit-field.main-content-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.edit-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.edit-input:focus {
  outline: none;
  border-color: #6366f1;
}

.edit-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.edit-textarea:focus {
  outline: none;
  border-color: #6366f1;
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

.edit-field.file-name-field {
  margin-bottom: 18px;
}

.edit-label.file-label, .edit-label.main-label {
  font-size: 14px;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  letter-spacing: 0.2px;
}

.file-input {
  font-size: 15px;
  color: #22223b;
  background: #f7f7fa;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 12px;
  width: 100%;
  font-weight: 500;
  margin-bottom: 0;
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

@media (max-width: 768px) {
  .documentation-content {
    padding: 8px;
  }
  .document-grid {
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  .document-item {
    padding: 12px 1px 8px 1px;
  }
  .doc-name {
    font-size: 14px;
  }
  
  .edit-dialog {
    width: 99vw;
    max-width: 99vw;
    max-height: 99vh;
    border-radius: 16px;
  }
  
  .edit-dialog-content {
    padding: 8px 8px 4px 8px;
  }
  
  .edit-dialog-header {
    padding: 12px 0 0 0;
  }
  
  .edit-dialog-footer {
    padding: 0 16px 16px 16px;
  }
  .edit-meta-row {
    flex-direction: column;
    gap: 6px;
  }
  .content-textarea.main-content-textarea {
    min-height: 120px;
    font-size: 14px;
    padding: 8px 6px;
  }
  .file-input {
    font-size: 14px;
    padding: 6px 6px;
  }
  .cancel-btn, .save-btn {
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 7px;
    height: 28px;
    min-width: 48px;
  }
  .ios-input {
    font-size: 14px;
    padding: 8px 10px;
    border-radius: 10px;
  }
  .ios-btn {
    font-size: 13px;
    height: 30px;
    min-width: 54px;
    border-radius: 12px;
    padding: 0 10px;
  }
}
</style> 