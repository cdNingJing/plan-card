<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? '编辑记忆' : '添加记忆' }}</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <textarea 
          v-model="localContent"
          :placeholder="isEditing ? '编辑您的记忆...' : '请输入新的记忆...'"
          rows="4"
          ref="textareaRef"
        ></textarea>
      </div>
      <div class="modal-actions">
        <button @click="saveMemory" class="save-btn" :disabled="!localContent.trim()">
          {{ isEditing ? '保存' : '添加' }}
        </button>
        <button @click="closeModal" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, defineProps, defineEmits } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  memory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const localContent = ref('')
const textareaRef = ref(null)

const isEditing = computed(() => props.memory !== null)

const closeModal = () => {
  localContent.value = ''
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

const saveMemory = () => {
  if (localContent.value.trim()) {
    emit('save', {
      content: localContent.value.trim(),
      memory: props.memory
    })
    closeModal()
  }
}

// 监听模态框显示状态
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    localContent.value = props.memory?.content || ''
    await nextTick()
    textareaRef.value?.focus()
  }
})

// 处理键盘事件
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeModal()
  } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    saveMemory()
  }
}

// 在模态框显示时添加键盘监听
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: hsl(var(--card));
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-header h3 {
  margin: 0;
  color: hsl(var(--foreground));
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: hsl(var(--muted));
}

.modal-body {
  padding: 20px 24px;
  flex: 1;
}

.modal-body textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid hsl(var(--border));
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  min-height: 100px;
}

.modal-body textarea:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.modal-body textarea::placeholder {
  color: hsl(var(--muted-foreground));
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px 20px;
  border-top: 1px solid hsl(var(--border));
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.save-btn {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.save-btn:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.cancel-btn:hover {
  background: hsl(var(--secondary) / 0.8);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 16px 20px 12px;
  }
  
  .modal-header h3 {
    font-size: 16px;
  }
  
  .modal-body {
    padding: 16px 20px;
  }
  
  .modal-actions {
    padding: 12px 20px 16px;
    flex-direction: column-reverse;
  }
  
  .save-btn, .cancel-btn {
    width: 100%;
    padding: 12px;
  }
}
</style>