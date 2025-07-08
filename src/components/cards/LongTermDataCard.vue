<template>
  <div class="long-term-data-card">
    <!-- 固定头部 -->
    <div class="card-header">
      <div class="header-left">
        <h3>长期记忆</h3>
        <p class="subtitle">AI提取的重要信息</p>
      </div>
      <div class="header-right">
        <button class="toggle-btn" @click="showSummary = !showSummary">
          {{ showSummary ? '小计' : '总结' }}
        </button>
        <button class="clear-all-btn" @click="clearAllData" title="清空所有长期数据">
          <span class="clear-all-text">清空</span>
        </button>
      </div>
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="card-content" ref="cardContentRef">
      <!-- 用 Markdown 卡片展示 summary -->
      <div v-if="showSummary && summaryMarkdown" class="summary-block">
        <MarkdownCard :content="summaryMarkdown" />
      </div>
      
      <div v-else class="data-content">
        <div v-if="longTermRecords.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <p>暂无长期数据</p>
          <span>AI会在这里保存您的重要信息</span>
        </div>
        
        <div v-else class="data-list">
          <div 
            v-for="(record, index) in longTermRecords" 
            :key="index"
            class="data-item"
          >
            <div class="data-header">
              <span class="data-time">{{ index + 1 }}</span>
              <span class="data-key">{{ formatTime(record.time) }}</span>
              <button 
                @click="deleteSingleRecord(record.key)" 
                class="delete-btn"
                title="删除此条记录"
              >
                <span class="delete-icon">×</span>
              </button>
            </div>
            <div class="data-value">{{ record.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import aiDataStorage from '@/utils/aiDataStorage.js'
import MarkdownCard from './MarkdownCard.vue'


const longTermRecords = ref([])
const summary = ref(null)
const summaryMarkdown = ref('')
const showSummary = ref(false)
const cardContentRef = ref(null)
const dataEntries = ref({})
const lastDataCount = ref(0) // 记录上次的 data_count

const formatTime = (timeString) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeString
  }
}

// 递归生成 markdown 字符串
function summaryToMarkdown(data, level = 2) {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    return data.map(item => `- ${summaryToMarkdown(item, level + 1)}`).join('\n')
  }
  if (typeof data === 'object' && data !== null) {
    let md = ''
    for (const key in data) {
      md += `${'#'.repeat(level)} ${key}\n`;
      md += summaryToMarkdown(data[key], level + 1) + '\n'
    }
    return md
  }
  return ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (cardContentRef.value) {
      cardContentRef.value.scrollTop = cardContentRef.value.scrollHeight
    }
  })
}

const loadLongTermData = async () => {
  try {
    // 获取数据
    const data = await aiDataStorage.getLongTermData()
    const currentDataCount = data.ai_long_term_data.data_count || 0
    
    // 只有当 data_count 真正发生变化时才更新
    if (currentDataCount === lastDataCount.value) {
      console.log('长期数据 data_count 未变化，跳过更新:', currentDataCount)
      return
    }
    
    console.log('长期数据 data_count 变化，开始更新:', lastDataCount.value, '->', currentDataCount)
    lastDataCount.value = currentDataCount
    
    const records = await aiDataStorage.getLongTermRecords(20) // 显示最近20条
    longTermRecords.value = records
    
    // 获取 summary 字段
    summary.value = data.ai_long_term_data.summary || null
    console.log('summary', summary.value)
    summaryMarkdown.value = summary.value ? summaryToMarkdown(summary.value, 2) : ''
    
    // 更新 dataEntries
    dataEntries.value = data.ai_long_term_data.data_entries || {}
    
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('加载长期数据失败:', error)
  }
}

// 监听 dataEntries 变化，只在数据更新后显示
watch(dataEntries, () => {
  loadLongTermData()
}, { deep: true })

// 删除单个记录
const deleteSingleRecord = async (key) => {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      const result = await aiDataStorage.deleteLongTermData(key)
      if (result.success) {
        console.log('删除成功:', key)
        await loadLongTermData() // 重新加载数据
      } else {
        console.error('删除失败:', result.message)
      }
    } catch (error) {
      console.error('删除记录时发生错误:', error)
    }
  }
}

// 清空所有数据
const clearAllData = async () => {
  if (confirm('确定要清空所有长期数据吗？此操作不可恢复。')) {
    try {
      const result = await aiDataStorage.clearLongTermData()
      if (result.success) {
        console.log('清空成功')
        await loadLongTermData() // 重新加载数据
      } else {
        console.error('清空失败:', result.message)
      }
    } catch (error) {
      console.error('清空数据时发生错误:', error)
    }
  }
}

onMounted(async () => {
  await loadLongTermData()
})

</script>

<style scoped>
.long-term-data-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
  background: inherit;
  z-index: 10;
  background: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.toggle-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.toggle-btn:hover {
  background: #374151;
  color: #fff;
  border-color: #374151;
}

.clear-all-btn {
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.clear-all-btn:hover {
  background: #fecaca;
  color: #dc2626;
  border-color: #f87171;
}

.clear-all-text {
  font-size: 11px;
}

/* 可滚动的内容区域 */
.card-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.data-content {
  margin-bottom: 15px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-state span {
  font-size: 12px;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.data-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.delete-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s;
  font-size: 14px;
  line-height: 1;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.delete-icon {
  font-weight: bold;
}

.data-time {
  font-size: 11px;
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.data-key {
  font-size: 11px;
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.data-value {
  font-size: 14px;
  line-height: 1.4;
  color: #374151;
  word-break: break-word;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 15px;
}

.stats {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

/* 滚动条样式 */
.card-content::-webkit-scrollbar {
  width: 4px;
}

.card-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.card-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style> 