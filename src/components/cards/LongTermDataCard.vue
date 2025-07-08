<template>
  <div class="long-term-data-card">
    <div class="card-header">
      <div class="header-left">
        <h3>长期记忆</h3>
        <p class="subtitle">AI提取的重要信息</p>
      </div>
      <button class="toggle-btn" @click="showSummary = !showSummary">
        {{ showSummary ? '小计' : '总结' }}
      </button>
    </div>
    
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
          </div>
          <div class="data-value">{{ record.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import aiDataStorage from '@/utils/aiDataStorage.js'
import MarkdownCard from './MarkdownCard.vue'

const longTermRecords = ref([])
const summary = ref(null)
const summaryMarkdown = ref('')
const showSummary = ref(true)

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

const loadLongTermData = async () => {
  try {
    const records = await aiDataStorage.getLongTermRecords(20) // 显示最近20条
    longTermRecords.value = records
    // 获取 summary 字段
    const data = await aiDataStorage.getLongTermData()
    summary.value = data.ai_long_term_data.summary || null
    console.log('summary', summary.value)
    summaryMarkdown.value = summary.value ? summaryToMarkdown(summary.value, 2) : ''
    console.log('summaryMarkdown', summaryMarkdown.value)
  } catch (error) {
    console.error('加载长期数据失败:', error)
  }
}

onMounted(async () => {
  await loadLongTermData()
  
  // 定期刷新数据（因为现在数据保存在文件中）
  setInterval(async () => {
    await loadLongTermData()
  }, 5000) // 每5秒刷新一次
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
  overflow: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
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

.data-content {
  flex: 1;
  overflow-y: auto;
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
.data-content::-webkit-scrollbar {
  width: 4px;
}

.data-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.data-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.data-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style> 