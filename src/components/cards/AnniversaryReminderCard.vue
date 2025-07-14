<template>
  <div class="anniversary-reminder-card">
    <div class="card-header">
      <div class="reminder-icon">
        <Calendar class="w-6 h-6" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    
    <div class="reminder-content">
      <div class="reminder-description">
        {{ description }}
      </div>
      
      <div class="anniversary-list">
        <div class="anniversary-item" v-for="(item, index) in anniversaries" :key="index">
          <div class="item-header">
            <div class="item-icon">
              <Gift class="w-4 h-4" />
            </div>
            <div class="item-info">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-date">{{ item.date }}</div>
            </div>
            <div class="item-days" :class="getDaysClass(item.daysLeft)">
              {{ getDaysText(item.daysLeft) }}
            </div>
          </div>
          <div class="item-description">{{ item.description }}</div>
          <div class="item-relationship">{{ item.relationship }}</div>
          <div class="item-suggestions">
            <div class="suggestion-item" v-for="suggestion in item.suggestions" :key="suggestion">
              💡 {{ suggestion }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="reminder-insight" v-if="insight">
        <div class="insight-icon">
          <Heart class="w-4 h-4" />
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
import { Calendar, Gift, Heart } from 'lucide-vue-next'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '纪念日提醒'
  },
  description: {
    type: String,
    default: '重要的日子，值得用心纪念'
  },
  anniversaries: {
    type: Array,
    default: () => []
  },
  insight: {
    type: String,
    default: ''
  },
  primaryAction: {
    type: String,
    default: '设置提醒'
  },
  secondaryAction: {
    type: String,
    default: '管理纪念日'
  }
})

// Emits
const emit = defineEmits(['primaryAction', 'secondaryAction'])

// Methods
const getDaysClass = (daysLeft) => {
  if (daysLeft <= 0) return 'urgent'
  if (daysLeft <= 3) return 'soon'
  if (daysLeft <= 7) return 'upcoming'
  return 'normal'
}

const getDaysText = (daysLeft) => {
  if (daysLeft <= 0) return '今天'
  if (daysLeft === 1) return '明天'
  if (daysLeft <= 7) return `${daysLeft}天后`
  return `${daysLeft}天后`
}

const handlePrimaryAction = () => {
  emit('primaryAction', props.anniversaries)
}

const handleSecondaryAction = () => {
  emit('secondaryAction', props.anniversaries)
}
</script>

<style scoped>
.anniversary-reminder-card {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #fecaca;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.reminder-icon {
  color: #dc2626;
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.reminder-content {
  margin-bottom: 20px;
}

.reminder-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.anniversary-list {
  margin-bottom: 16px;
}

.anniversary-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #fecaca;
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

.item-days {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

.item-days.urgent {
  background: #fee2e2;
  color: #dc2626;
}

.item-days.soon {
  background: #fef3c7;
  color: #d97706;
}

.item-days.upcoming {
  background: #dbeafe;
  color: #2563eb;
}

.item-days.normal {
  background: #f1f5f9;
  color: #64748b;
}

.item-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 8px;
}

.item-relationship {
  font-size: 12px;
  color: #dc2626;
  background: #fef2f2;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-bottom: 8px;
  display: inline-block;
}

.item-suggestions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-item {
  font-size: 12px;
  color: #64748b;
  line-height: 1.3;
}

.reminder-insight {
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
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
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