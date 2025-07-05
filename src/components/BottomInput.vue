<template>
  <footer class="bottom-input">
    <div class="input-container">
      <div class="input-wrapper">
        <input 
          v-model="inputValue"
          type="text" 
          :placeholder="placeholder"
          @keyup.enter="handleSubmit"
          class="main-input"
        />
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  placeholder: {
    type: String,
    default: '描述您的需求，如：我想和朋友一起去东京玩五天...'
  },
  initialValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit'])

const router = useRouter()
const inputValue = ref(props.initialValue)

const handleSubmit = () => {
  if (inputValue.value.trim()) {
    emit('submit', inputValue.value.trim())
    
    // 如果没有父组件处理，默认跳转到计划页面
    if (!props.onSubmit) {
      router.push({
        name: 'plan',
        query: { input: inputValue.value.trim() }
      })
    }
    
    // 清空输入框
    inputValue.value = ''
  }
}

// 暴露方法给父组件
defineExpose({
  setValue: (value) => {
    inputValue.value = value
  },
  getValue: () => inputValue.value,
  submit: handleSubmit
})
</script>

<style scoped>
.bottom-input {
  background: #F8F9FA;
  border-top: 1px solid #E5E5E5;
  padding: 12px 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-sizing: border-box;
  min-height: 68px; /* 使用min-height而不是固定height */
}

.input-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
}

.input-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
}

.main-input {
  width: 100%;
  max-width: 800px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 16px;
  background: #FFFFFF;
  color: #333333;
  transition: all 0.2s;
  box-sizing: border-box;
}

.main-input:focus {
  outline: none;
  border-color: #333333;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
}

.main-input::placeholder {
  color: #999999;
}

@media (max-width: 768px) {
  .bottom-input {
    padding: 10px 12px;
    min-height: 64px;
  }
  
  .main-input {
    height: 44px;
    padding: 0 14px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .bottom-input {
    padding: 8px 12px;
    min-height: 60px;
  }
  
  .main-input {
    height: 44px;
    padding: 0 12px;
    font-size: 16px; /* 保持16px防止iOS缩放 */
  }
}
</style> 