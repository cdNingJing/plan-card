<template>
  <div class="habit-insight-card">
    <div class="card-header">
      <div class="habit-icon">
        <Brain class="w-6 h-6" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    
    <div class="habit-content">
      <div class="habit-description">
        {{ description }}
      </div>
      
      <div class="habit-pattern">
        <div class="pattern-header">
          <div class="pattern-icon">
            <Clock class="w-4 h-4" />
          </div>
          <span>检测到的习惯模式</span>
        </div>
        <div class="pattern-details">
          <div class="pattern-item" v-for="(pattern, index) in patterns" :key="index">
            <div class="pattern-time">{{ pattern.time }}</div>
            <div class="pattern-activity">{{ pattern.activity }}</div>
            <div class="pattern-frequency">{{ pattern.frequency }}</div>
          </div>
        </div>
      </div>
      
      <div class="prediction-section">
        <div class="prediction-header">
          <div class="prediction-icon">
            <Zap class="w-4 h-4" />
          </div>
          <span>预测性提醒</span>
        </div>
        <div class="prediction-content">
          <div class="prediction-item" v-for="(prediction, index) in predictions" :key="index">
            <div class="prediction-time">{{ prediction.time }}</div>
            <div class="prediction-suggestion">{{ prediction.suggestion }}</div>
            <div class="prediction-confidence">
              置信度: {{ prediction.confidence }}%
            </div>
          </div>
        </div>
      </div>
      
      <div class="habit-insight" v-if="insight">
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
import { Brain, Clock, Zap, Lightbulb } from 'lucide-vue-next'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '生活习惯洞察'
  },
  description: {
    type: String,
    default: '发现你的隐性生活习惯，提供预测性服务'
  },
  patterns: {
    type: Array,
    default: () => []
  },
  predictions: {
    type: Array,
    default: () => []
  },
  insight: {
    type: String,
    default: ''
  },
  primaryAction: {
    type: String,
    default: '采纳建议'
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
  emit('primaryAction', props.predictions)
}

const handleSecondaryAction = () => {
  emit('secondaryAction', props.patterns)
}
</script>

<style scoped>
.habit-insight-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #bbf7d0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.habit-icon {
  color: #059669;
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.habit-content {
  margin-bottom: 20px;
}

.habit-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.habit-pattern {
  margin-bottom: 16px;
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.pattern-icon {
  font-size: 16px;
}

.pattern-details {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #bbf7d0;
}

.pattern-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #dcfce7;
}

.pattern-item:last-child {
  border-bottom: none;
}

.pattern-time {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  min-width: 60px;
}

.pattern-activity {
  flex: 1;
  font-size: 13px;
  color: #1e293b;
}

.pattern-frequency {
  font-size: 12px;
  color: #64748b;
  background: #f0fdf4;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}

.prediction-section {
  margin-bottom: 16px;
}

.prediction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
}

.prediction-icon {
  font-size: 16px;
}

.prediction-content {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9d5ff;
}

.prediction-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid #f3e8ff;
}

.prediction-item:last-child {
  border-bottom: none;
}

.prediction-time {
  font-size: 12px;
  color: #7c3aed;
  font-weight: 600;
}

.prediction-suggestion {
  font-size: 13px;
  color: #1e293b;
  line-height: 1.4;
}

.prediction-confidence {
  font-size: 11px;
  color: #64748b;
  background: #faf5ff;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #e9d5ff;
  display: inline-block;
}

.habit-insight {
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