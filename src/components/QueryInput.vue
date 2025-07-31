<template>
  <div class="query-step">
    <div class="query-header">
      <h2>Understanding System</h2>
      <p>通过系统化分析，深入理解问题的本质和潜在联系</p>
    </div>
    
    <div class="query-examples">
      <div class="example-card" @click="setExampleQuery('身体信号')">
        "我感觉身体的'小信号'和生活的'大事件'之间，似乎有某种看不见的联系。"
      </div>
      <div class="example-card" @click="setExampleQuery('生活平衡')">
        "我的精力像一个天平，工作、家庭和社交在三端，我该如何找到那个平衡点？"
      </div>
      <div class="example-card" @click="setExampleQuery('系统思维')">
        "我想用系统性的方法来理解复杂问题背后的根本原因和相互关系。"
      </div>
    </div>
    
    <div class="query-input">
      <textarea 
        v-model="localQuery"
        @input="updateQuery"
        placeholder="描述您想要深入理解的问题或系统..."
        rows="4"
      ></textarea>
      <button 
        @click="handleExplore" 
        :disabled="!localQuery.trim() || isLoading"
        class="explore-btn"
      >
        <span v-if="isLoading">分析中...</span>
        <span v-else>开始分析</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  query: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:query', 'start-exploration'])

const localQuery = ref(props.query)

const updateQuery = () => {
  emit('update:query', localQuery.value)
}

const setExampleQuery = (type) => {
  if (type === '身体信号') {
    localQuery.value = "我感觉身体的'小信号'和生活的'大事件'之间，似乎有某种看不见的联系。"
  } else if (type === '生活平衡') {
    localQuery.value = "我的精力像一个天平，工作、家庭和社交在三端，我该如何找到那个平衡点？"
  } else if (type === '系统思维') {
    localQuery.value = "我想用系统性的方法来理解复杂问题背后的根本原因和相互关系。"
  }
  updateQuery()
}

const handleExplore = () => {
  emit('start-exploration')
}

watch(() => props.query, (newQuery) => {
  localQuery.value = newQuery
})
</script>

<style scoped>
.query-step {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.query-header h2 {
  margin-bottom: 8px;
  color: hsl(var(--foreground));
  font-size: 28px;
  font-weight: 700;
}

.query-header p {
  color: hsl(var(--muted-foreground));
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.5;
}

.query-examples {
  margin-bottom: 32px;
  display: grid;
  gap: 12px;
}

.example-card {
  background: hsl(var(--muted));
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-style: italic;
  line-height: 1.5;
  color: hsl(var(--foreground));
  border: 2px solid transparent;
}

.example-card:hover {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.1);
}

.query-input {
  position: relative;
}

.query-input textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid hsl(var(--border));
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  font-size: 16px;
  margin-bottom: 16px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  line-height: 1.5;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.query-input textarea:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.query-input textarea::placeholder {
  color: hsl(var(--muted-foreground));
}

.explore-btn {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.explore-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.explore-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
  background: hsl(var(--primary) / 0.9);
}

.explore-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .query-header h2 {
    font-size: 24px;
  }
  
  .query-header p {
    font-size: 14px;
  }
  
  .example-card {
    padding: 16px;
    font-size: 14px;
  }
  
  .query-input textarea {
    font-size: 14px;
  }
  
  .explore-btn {
    padding: 14px 24px;
    font-size: 14px;
  }
}
</style>