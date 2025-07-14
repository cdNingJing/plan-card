<template>
  <div class="wish-memory-card">
    <div class="card-header">
      <div class="wish-icon">
        <Star class="w-6 h-6" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    
    <div class="wish-content">
      <div class="wish-description">
        {{ description }}
      </div>
      
      <div class="wish-list">
        <div class="wish-item" v-for="(wish, index) in wishes" :key="index">
          <div class="wish-header">
            <div class="wish-icon">
              <Star class="w-4 h-4" />
            </div>
            <div class="wish-info">
              <div class="wish-title">{{ wish.title }}</div>
              <div class="wish-date">{{ wish.date }}</div>
            </div>
            <div class="wish-status" :class="wish.status">
              {{ getStatusText(wish.status) }}
            </div>
          </div>
          <div class="wish-description-text">{{ wish.description }}</div>
          <div class="wish-tags">
            <span class="tag" v-for="tag in wish.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
      
      <div class="wish-insight" v-if="insight">
        <div class="insight-icon">
          <Lightbulb class="w-4 h-4" />
        </div>
        <div class="insight-text">{{ insight }}</div>
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
import { Star, Lightbulb } from 'lucide-vue-next'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '心愿记忆'
  },
  description: {
    type: String,
    default: '记录你的美好心愿和梦想'
  },
  wishes: {
    type: Array,
    default: () => []
  },
  insight: {
    type: String,
    default: ''
  },
  primaryAction: {
    type: String,
    default: '实现心愿'
  },
  secondaryAction: {
    type: String,
    default: '添加心愿'
  }
})

// Emits
const emit = defineEmits(['primaryAction', 'secondaryAction'])

// Methods
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待实现',
    'in-progress': '进行中',
    'completed': '已完成',
    'expired': '已过期'
  }
  return statusMap[status] || '未知'
}

const handlePrimaryAction = () => {
  emit('primaryAction', props.wishes)
}

const handleSecondaryAction = () => {
  emit('secondaryAction', props.wishes)
}
</script>

<style scoped>
.wish-memory-card {
  background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9d5ff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.wish-icon {
  color: #a855f7;
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.wish-content {
  margin-bottom: 20px;
}

.wish-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.wish-list {
  margin-bottom: 16px;
}

.wish-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e9d5ff;
}

.wish-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.wish-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.wish-info {
  flex: 1;
}

.wish-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.wish-date {
  font-size: 12px;
  color: #64748b;
}

.wish-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

.wish-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.wish-status.in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.wish-status.completed {
  background: #d1fae5;
  color: #059669;
}

.wish-status.expired {
  background: #fee2e2;
  color: #dc2626;
}

.wish-description-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 8px;
}

.wish-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  color: #a855f7;
  background: #f3e8ff;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #e9d5ff;
}

.wish-insight {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 1px solid #fbbf24;
}

.insight-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.insight-text {
  font-size: 13px;
  color: #92400e;
  line-height: 1.4;
  font-weight: 500;
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
  background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
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