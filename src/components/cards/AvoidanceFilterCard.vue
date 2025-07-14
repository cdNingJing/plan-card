<template>
  <div class="avoidance-filter-card">
    <div class="card-header">
      <div class="safety-icon">
        <Shield class="w-6 h-6" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    
    <div class="filter-content">
      <div class="filter-description">
        {{ description }}
      </div>
      
      <div class="avoidance-list">
        <div class="avoidance-item" v-for="(item, index) in avoidanceItems" :key="index">
          <div class="item-icon">
            <AlertTriangle class="w-4 h-4" />
          </div>
          <div class="item-content">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-reason">{{ item.reason }}</div>
          </div>
        </div>
      </div>
      
      <div class="safe-recommendations">
        <div class="recommendations-header">
          <div class="safe-icon">
            <CheckCircle class="w-4 h-4" />
          </div>
          <span>安全推荐</span>
        </div>
        <div class="recommendations-list">
          <div class="recommendation-item" v-for="(item, index) in safeRecommendations" :key="index">
            {{ item }}
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
import { Shield, AlertTriangle, CheckCircle } from 'lucide-vue-next'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '安全筛选'
  },
  description: {
    type: String,
    default: '已为你排除不适合的内容'
  },
  avoidanceItems: {
    type: Array,
    default: () => []
  },
  safeRecommendations: {
    type: Array,
    default: () => []
  },
  primaryAction: {
    type: String,
    default: '查看推荐'
  },
  secondaryAction: {
    type: String,
    default: '调整设置'
  }
})

// Emits
const emit = defineEmits(['primaryAction', 'secondaryAction'])

// Methods
const handlePrimaryAction = () => {
  emit('primaryAction', props.safeRecommendations)
}

const handleSecondaryAction = () => {
  emit('secondaryAction', props.avoidanceItems)
}
</script>

<style scoped>
.avoidance-filter-card {
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

.safety-icon {
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

.filter-content {
  margin-bottom: 20px;
}

.filter-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.avoidance-list {
  margin-bottom: 16px;
}

.avoidance-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid #fecaca;
}

.item-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 2px;
}

.item-reason {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.safe-recommendations {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #bbf7d0;
}

.recommendations-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.safe-icon {
  font-size: 16px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recommendation-item {
  font-size: 13px;
  color: #047857;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #bbf7d0;
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
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
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