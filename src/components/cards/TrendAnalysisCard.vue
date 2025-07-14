<template>
  <div class="trend-analysis-card">
    <div class="card-header">
      <div class="trend-icon">
        <TrendingUp class="w-6 h-6" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    
    <div class="trend-content">
      <div class="trend-description">
        {{ description }}
      </div>
      
      <div class="trend-chart">
        <div class="trend-line">
          <div class="trend-point" v-for="(point, index) in trendData" :key="index">
            <div class="point-label">{{ point.label }}</div>
            <div class="point-value" :class="point.type">{{ point.value }}</div>
          </div>
        </div>
      </div>
      
      <div class="trend-insight">
        <div class="insight-icon">💡</div>
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
import { TrendingUp } from 'lucide-vue-next'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '趋势分析'
  },
  description: {
    type: String,
    default: '检测到你的偏好变化趋势'
  },
  trendData: {
    type: Array,
    default: () => []
  },
  insight: {
    type: String,
    default: '基于你的行为模式，为你推荐最适合的选择'
  },
  primaryAction: {
    type: String,
    default: '采纳建议'
  },
  secondaryAction: {
    type: String,
    default: '查看详情'
  }
})

// Emits
const emit = defineEmits(['primaryAction', 'secondaryAction'])

// Methods
const handlePrimaryAction = () => {
  emit('primaryAction', props.trendData)
}

const handleSecondaryAction = () => {
  emit('secondaryAction', props.trendData)
}
</script>

<style scoped>
.trend-analysis-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.trend-icon {
  color: #6366f1;
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.trend-content {
  margin-bottom: 20px;
}

.trend-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.trend-chart {
  margin-bottom: 16px;
}

.trend-line {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.trend-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.point-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.point-value {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  background: #f1f5f9;
}

.point-value.old {
  color: #64748b;
  background: #f1f5f9;
}

.point-value.new {
  color: #059669;
  background: #d1fae5;
}

.point-value.trend {
  color: #6366f1;
  background: #e0e7ff;
}

.trend-insight {
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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
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