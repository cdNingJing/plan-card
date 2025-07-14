<template>
  <div class="collection-recommend-card">
    <div class="card-header">
      <div class="collection-icon">
        <BookOpen class="w-6 h-6" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    
    <div class="collection-content">
      <div class="collection-description">
        {{ description }}
      </div>
      
      <div class="collection-list">
        <div class="collection-item" v-for="(item, index) in collections" :key="index">
          <div class="item-header">
            <div class="item-icon">
              <BookOpen class="w-4 h-4" />
            </div>
            <div class="item-info">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-date">{{ item.date }}</div>
            </div>
            <div class="item-category">{{ item.category }}</div>
          </div>
          <div class="item-description">{{ item.description }}</div>
          <div class="item-tags">
            <span class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
      
      <div class="recommendation-section">
        <div class="recommendation-header">
          <div class="recommend-icon">
            <Target class="w-4 h-4" />
          </div>
          <span>基于你的收藏推荐</span>
        </div>
        <div class="recommendation-list">
          <div class="recommendation-item" v-for="(rec, index) in recommendations" :key="index">
            <div class="rec-icon">
              <Sparkles class="w-4 h-4" />
            </div>
            <div class="rec-content">
              <div class="rec-title">{{ rec.title }}</div>
              <div class="rec-reason">{{ rec.reason }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-actions">
      <button class="action-btn primary" @click="handlePrimaryAction">
        {{ primaryAction }}
      </button>
      <button class="action-btn secondary" @click="handleSecondaryAction">
        {{ secondaryAction }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BookOpen, Target, Sparkles } from 'lucide-vue-next'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '收藏推荐'
  },
  description: {
    type: String,
    default: '基于你的收藏历史，为你推荐相关内容'
  },
  collections: {
    type: Array,
    default: () => []
  },
  recommendations: {
    type: Array,
    default: () => []
  },
  primaryAction: {
    type: String,
    default: '查看推荐'
  },
  secondaryAction: {
    type: String,
    default: '管理收藏'
  }
})

// Emits
const emit = defineEmits(['primaryAction', 'secondaryAction'])

// Methods
const handlePrimaryAction = () => {
  emit('primaryAction', props.recommendations)
}

const handleSecondaryAction = () => {
  emit('secondaryAction', props.collections)
}
</script>

<style scoped>
.collection-recommend-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #bae6fd;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.collection-icon {
  color: #0ea5e9;
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.collection-content {
  margin-bottom: 20px;
}

.collection-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.collection-list {
  margin-bottom: 16px;
}

.collection-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #bae6fd;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.item-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.item-date {
  font-size: 12px;
  color: #64748b;
}

.item-category {
  font-size: 12px;
  color: #0ea5e9;
  background: #e0f2fe;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.item-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 8px;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  color: #0ea5e9;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.recommendation-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #bbf7d0;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.recommend-icon {
  font-size: 16px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.rec-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-size: 13px;
  font-weight: 600;
  color: #047857;
  margin-bottom: 2px;
}

.rec-reason {
  font-size: 12px;
  color: #059669;
  line-height: 1.3;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.action-btn.secondary {
  background: #f8fafc;
  color: #6366f1;
  border: 1px solid #e2e8f0;
}

.action-btn.secondary:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}
</style>