<template>
  <div class="documentation-panel">
    <div class="documentation-content">
      <div class="document-grid">
        <div 
          v-for="(doc, idx) in documents" 
          :key="doc.id"
          class="document-item"
          :class="doc.status"
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
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentScanStore } from '@/stores/documentScanStore.js'
import documentService from '@/services/documentService.js'

const documentScanStore = useDocumentScanStore()
const { documents, isScanning } = storeToRefs(documentScanStore)

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
  transition: border-color 0.3s;
  cursor: pointer;
  position: relative;
  backdrop-filter: none;
  overflow: hidden;
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
}
</style> 