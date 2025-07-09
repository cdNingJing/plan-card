<template>
  <div class="short-term-data-card">
    <!-- 固定头部 -->
    <div class="card-header">
      <div class="header-left">
        <h3>短期记忆</h3>
        <p class="subtitle">当前会话的重要信息</p>
      </div>
      <div class="header-right">
      <button class="toggle-btn" @click="showSummary = !showSummary">
        {{ showSummary ? '小计' : '总结' }}
      </button>
        <button class="clear-all-btn" @click="clearAllData" title="清空所有短期数据">
          <span class="clear-all-text">清空</span>
        </button>
      </div>
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="card-content" ref="cardContentRef">
    <div v-if="showSummary && summaryMarkdown" class="summary-block">
      <MarkdownCard :content="summaryMarkdown" />
    </div>
    
    <div v-else class="data-content">
      <div v-if="shortTermRecords.length === 0" class="empty-state">
        <div class="empty-icon">💭</div>
        <p>暂无短期记忆</p>
        <span>AI会在这里保存当前会话的重要信息</span>
      </div>
      <div v-else class="data-list">
        <div 
          v-for="(record, index) in shortTermRecords" 
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

const shortTermRecords = ref([])
const summary = ref(null)
const summaryMarkdown = ref('')
const showSummary = ref(false)
const cardContentRef = ref(null)
const dataEntries = ref({})

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

const loadShortTermData = async () => {
  try {
    const records = await aiDataStorage.getShortTermRecords(20)
    shortTermRecords.value = records
    // 获取 summary 字段
    const data = await aiDataStorage.getShortTermData()
    summary.value = data.summary || null
    summaryMarkdown.value = summary.value ? summaryToMarkdown(summary.value, 2) : ''
    
    // 打印 data_count 用于调试
    const dataCount = data.ai_short_term_memory.data_count || 0
    console.log('短期记忆 data_count:', dataCount)
    
    // 更新 dataEntries，但不触发监听器
    const newDataEntries = data.ai_short_term_memory.data_entries || {}
    const currentDataCount = dataEntries.value.data_count || 0
    const newDataCount = data.ai_short_term_memory.data_count || 0
    
    // 只有当 data_count 真正发生变化时才更新
    if (currentDataCount !== newDataCount) {
      dataEntries.value = newDataEntries
      // 数据变化时调用AI总结
      if (newDataCount > 0) {
        console.log('短期记忆 data_count changed:', newDataCount)
        // 这里可以添加短期记忆的AI总结逻辑
      }
    }
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('加载短期数据失败:', error)
  }
}

// 移除 dataEntries 的监听器，避免无限循环
// watch(dataEntries, () => {
//   loadShortTermData()
//   // 当数据有变化时，自动调用AI总结
//   const currentLength = Object.keys(dataEntries.value).length
//   if (currentLength > 0 && currentLength !== lastDataEntriesLength) {
//     console.log('短期记忆dataEntries changed, length:', currentLength)
//     lastDataEntriesLength = currentLength
//     // 这里可以添加短期记忆的AI总结逻辑
//   }
// }, { deep: true })

// 删除单个记录
const deleteSingleRecord = async (key) => {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      const result = await aiDataStorage.deleteShortTermData(key)
      if (result.success) {
        console.log('删除成功:', key)
        await loadShortTermData() // 重新加载数据
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
  if (confirm('确定要清空所有短期数据吗？此操作不可恢复。')) {
    try {
      const result = await aiDataStorage.clearShortTermData()
      if (result.success) {
        console.log('清空成功')
        await loadShortTermData() // 重新加载数据
      } else {
        console.error('清空失败:', result.message)
      }
    } catch (error) {
      console.error('清空数据时发生错误:', error)
    }
  }
}

onMounted(async () => {
  await loadShortTermData()
})
</script>

<style scoped>
.short-term-data-card {
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

.toggle-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 0.75rem;
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
  font-size: 0.6875rem;
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
  font-size: 0.6875rem;
}

.card-header h3 {
  margin: 0 0 5px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
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
  font-size: 3rem;
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0 0 5px 0;
  font-size: 1rem;
  font-weight: 500;
}

.empty-state span {
  font-size: 0.75rem;
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
  font-size: 0.875rem;
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
  font-size: 0.6875rem;
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.data-key {
  font-size: 0.6875rem;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.data-value {
  font-size: 0.875rem;
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
  font-size: 0.75rem;
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