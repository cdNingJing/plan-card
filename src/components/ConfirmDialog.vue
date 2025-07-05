<template>
  <div v-if="visible" class="confirm-dialog-overlay" @click="handleOverlayClick">
    <div class="confirm-dialog" @click.stop>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ title }}</h3>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-message">{{ message }}</p>
        <div v-if="details" class="dialog-details">
          <div class="detail-item">
            <span class="detail-label">计划类型：</span>
            <span class="detail-value">{{ getTypeLabel(details.type) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">计划标题：</span>
            <span class="detail-value">{{ details.title }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">需求描述：</span>
            <span class="detail-value">{{ details.description }}</span>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button @click="handleCancel" class="btn btn-cancel">
          取消
        </button>
        <button @click="handleConfirm" class="btn btn-confirm">
          确认生成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认生成计划'
  },
  message: {
    type: String,
    default: '确定要生成这个计划吗？'
  },
  details: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const getTypeLabel = (type) => {
  const typeMap = {
    travel: '旅行计划',
    gift: '礼物推荐',
    meeting: '会议安排',
    general: '通用计划'
  }
  return typeMap[type] || '未知类型'
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.confirm-dialog {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.dialog-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #E5E5E5;
}

.dialog-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.dialog-content {
  padding: 20px 24px;
}

.dialog-message {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #666666;
  line-height: 1.5;
}

.dialog-details {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #E5E5E5;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 500;
  color: #333333;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: #666666;
  flex: 1;
  word-break: break-word;
}

.dialog-actions {
  padding: 16px 24px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #E5E5E5;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  min-width: 80px;
}

.btn-cancel {
  background: #FFFFFF;
  color: #666666;
  border-color: #E5E5E5;
}

.btn-cancel:hover {
  background: #F8F9FA;
  border-color: #CCCCCC;
}

.btn-confirm {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

.btn-confirm:hover {
  background: #000000;
  border-color: #000000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style> 