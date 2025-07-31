<template>
  <div class="bottom-input-container">
    <!-- 状态1: 默认输入框 -->
    <div v-if="currentState === 'input'" class="input-state">
      <div class="input-wrapper">
        <input
          ref="inputRef"
          v-model="localQuery"
          type="text"
          placeholder="输入您想要深入理解的问题..."
          class="main-input"
          @keydown.enter="handleSubmit"
          @input="handleInput"
        />
        <button 
          v-if="localQuery.trim()" 
          @click="handleSubmit" 
          class="send-button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l7 7-7 7M15 8H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 状态2: 显示问题文本 -->
    <div v-if="currentState === 'display'" class="display-state">
      <div class="question-display" :class="{ 'simple-display': isTagsMode }">
        <div class="question-text">{{ displayText }}</div>
        <button v-if="!isTagsMode" @click="handleEdit" class="edit-button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z" stroke="currentColor" stroke-width="1"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 状态3: 下一步按钮 -->
    <div v-if="currentState === 'next'" class="next-state">
      <div class="selection-summary">
        <span class="selected-count">已选择 {{ selectedCount }} 个关联</span>
      </div>
      <button @click="handleNext" class="next-button" :disabled="selectedCount === 0">
        <span>生成解决方案</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1l7 7-7 7M15 8H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentState: {
    type: String,
    default: 'input', // 'input', 'display', 'next'
    validator: (value) => ['input', 'display', 'next'].includes(value)
  },
  query: {
    type: String,
    default: ''
  },
  displayText: {
    type: String,
    default: ''
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  isTagsMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:query', 'submit', 'edit', 'next'])

const localQuery = ref(props.query)
const inputRef = ref(null)

const handleInput = () => {
  emit('update:query', localQuery.value)
}

const handleSubmit = () => {
  if (localQuery.value.trim()) {
    emit('submit', localQuery.value.trim())
  }
}

const handleEdit = () => {
  emit('edit')
}

const handleNext = () => {
  if (props.selectedCount > 0) {
    emit('next')
  }
}

// 监听状态变化，自动聚焦输入框
watch(() => props.currentState, async (newState) => {
  if (newState === 'input') {
    await nextTick()
    inputRef.value?.focus()
  }
})

// 监听查询变化
watch(() => props.query, (newQuery) => {
  localQuery.value = newQuery
})
</script>

<style scoped>
.bottom-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 500;
}

/* 状态1: 输入框 */
.input-state {
  padding: 16px 24px 24px;
}

.input-wrapper {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.main-input {
  width: 100%;
  padding: 16px 20px;
  padding-right: 60px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background: #fafafa;
  color: #111111;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.main-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.main-input::placeholder {
  color: #9ca3af;
}

.send-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: #111111;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover {
  background: #000000;
  transform: translateY(-50%) scale(1.05);
}

/* 状态2: 显示问题 */
.display-state {
  padding: 12px 16px;
}

.question-display {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.question-display.simple-display {
  background: transparent;
  border: none;
  padding: 8px 20px;
  justify-content: center;
}

.question-text {
  flex: 1;
  color: #111111;
  font-size: 16px;
  line-height: 1.5;
}

.edit-button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-button:hover {
  background: #f3f4f6;
  color: #374151;
}

/* 状态3: 下一步按钮 */
.next-state {
  padding: 16px 24px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
}

.selection-summary {
  display: flex;
  align-items: center;
}

.selected-count {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.next-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #111111;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-button:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.next-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-state,
  .display-state {
    padding: 12px 16px 20px;
  }
  
  .next-state {
    padding: 12px 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .next-button {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-input {
    font-size: 14px;
    padding: 14px 16px;
    padding-right: 56px;
  }
  
  .send-button {
    width: 36px;
    height: 36px;
  }
  
  .question-text {
    font-size: 14px;
  }
  
  .next-button {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>