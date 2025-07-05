<template>
  <div class="home-view">
    <!-- 主体内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <div class="welcome-section">
          <h1>智能规划助手</h1>
          <p>描述您的需求，我们为您生成个性化的计划卡片</p>
        </div>
        
        <!-- 示例区域 -->
        <div class="examples-section">
          <h2>试试这些示例：</h2>
          <div class="example-list">
            <button 
              v-for="example in examples" 
              :key="example.id"
              class="example-btn"
              @click="handleExample(example.text)"
            >
              {{ example.text }}
            </button>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 底部输入组件 -->
    <BottomInput 
      ref="bottomInputRef"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomInput from '../components/BottomInput.vue'

const router = useRouter()
const bottomInputRef = ref(null)

// 示例数据
const examples = ref([
  {
    id: 1,
    text: "我想和朋友一起去东京玩五天"
  },
  {
    id: 2,
    text: "我想送妈妈一个园艺相关的礼物，预算500元以内"
  },
  {
    id: 3,
    text: "明天下午三点的项目会议，请发提醒"
  }
])

const handleExample = (text) => {
  // 设置输入框的值
  bottomInputRef.value.setValue(text)
  // 提交
  bottomInputRef.value.submit()
}

const handleSubmit = (input) => {
  // 跳转到计划页面
  router.push({
    name: 'plan',
    query: { input }
  })
}
</script>

<style scoped>
.home-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFFFFF;
  overflow: hidden; /* 防止整体滚动 */
}

.main-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 68px; /* 默认输入框高度 */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 当输入框展开时，调整内容区域 */
.main-content.input-expanded {
  bottom: 50vh; /* 展开状态占用50vh */
}

.main-content.input-fullscreen {
  bottom: 100vh; /* 全屏状态完全隐藏 */
}

.content-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-section h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.welcome-section p {
  font-size: 1rem;
  color: #666666;
  font-weight: 400;
  line-height: 1.5;
}

.examples-section {
  margin-bottom: 32px;
}

.examples-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20px;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.example-btn {
  padding: 14px 18px;
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  line-height: 1.4;
}

.example-btn:hover {
  background: #E5E5E5;
  border-color: #CCCCCC;
}

/* 桌面端样式 */
@media (min-width: 769px) {
  .main-content {
    bottom: 68px;
    padding: 64px 24px;
  }
  
  .main-content.input-expanded {
    bottom: 50vh;
  }
  
  .main-content.input-fullscreen {
    bottom: 100vh;
  }
  
  .welcome-section {
    margin-bottom: 48px;
  }
  
  .welcome-section h1 {
    font-size: 3rem;
    margin-bottom: 16px;
  }
  
  .welcome-section p {
    font-size: 1.25rem;
  }
  
  .examples-section {
    margin-bottom: 48px;
  }
  
  .examples-section h2 {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
  
  .example-list {
    gap: 12px;
  }
  
  .example-btn {
    padding: 16px 24px;
    font-size: 1rem;
  }
}

/* 平板端样式 */
@media (max-width: 768px) and (min-width: 481px) {
  .main-content {
    bottom: 64px;
    padding: 24px 16px;
  }
  
  .main-content.input-expanded {
    bottom: 60vh;
  }
  
  .main-content.input-fullscreen {
    bottom: 100vh;
  }
  
  .welcome-section h1 {
    font-size: 2.5rem;
  }
  
  .welcome-section p {
    font-size: 1.125rem;
  }
}

/* 手机端样式 */
@media (max-width: 480px) {
  .main-content {
    bottom: 60px;
    padding: 16px 12px;
  }
  
  .main-content.input-expanded {
    bottom: 70vh;
  }
  
  .main-content.input-fullscreen {
    bottom: 100vh;
  }
  
  .welcome-section {
    margin-bottom: 24px;
  }
  
  .welcome-section h1 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
  
  .welcome-section p {
    font-size: 0.9rem;
  }
  
  .examples-section {
    margin-bottom: 24px;
  }
  
  .examples-section h2 {
    font-size: 1.125rem;
    margin-bottom: 16px;
  }
  
  .example-list {
    gap: 8px;
  }
  
  .example-btn {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
}
</style> 