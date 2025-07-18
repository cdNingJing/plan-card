<template>
  <div class="chat-container" :class="{ 'ai-mode': showAIRecommendations }">
    <!-- 动态场景组件（作为背景） -->
    <DynamicScene 
      :scene-type="currentSceneType"
      :is-blurred="showAIRecommendations"
      @go-back="goBack"
      @ai-click="handleAIClick"
      @toggle-ai="toggleAIRecommendations"
      @input-focus="onInputFocus"
    />

    <!-- 场景切换按钮（仅在非AI模式下显示） -->
    <div v-if="!showAIRecommendations" class="scene-switcher">
      <button 
        :class="['scene-btn', { active: currentSceneType === 'group-chat' }]"
        @click="changeSceneType('group-chat')"
      >
        群聊
      </button>
      <button 
        :class="['scene-btn', { active: currentSceneType === 'news' }]"
        @click="changeSceneType('news')"
      >
        新闻
      </button>
    </div>

    <!-- AI交互组件覆盖层 -->
    <div v-if="showAIRecommendations" class="ai-overlay">
      <AIInteraction 
        :recommendations="aiRecommendations"
        @recommendation-click="handleRecommendationClick"
        @add-click="handleAddClick"
        @send-message="handleSendMessage"
        @input-focus="onInputFocus"
        @mic-click="handleMicClick"
      />
    </div>
  </div>
</template>

<script>
import DynamicScene from '@/components/DynamicScene.vue'
import AIInteraction from '@/components/AIInteraction.vue'
import { getAvailableSceneTypes } from '@/config/sceneConfig.js'

export default {
  name: 'ChatView',
  components: {
    DynamicScene,
    AIInteraction
  },
  data() {
    return {
      showAIRecommendations: false,
      currentSceneType: 'group-chat', // 当前场景类型
      aiRecommendations: [
        {
          id: 1,
          icon: '📍',
          text: 'Help coordinate a birthday party',
          type: 'party'
        },
        {
          id: 2,
          icon: '🎉',
          text: 'Plan Tommy\'s birthday celebration',
          type: 'celebration'
        },
        {
          id: 3,
          icon: '✍️',
          text: 'Draft a party invitation message',
          type: 'invitation'
        }
      ]
    }
  },
  mounted() {
    // 点击外部区域关闭推荐
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    handleAIClick() {
      // AI按钮点击处理，显示推荐内容
      console.log('AI button clicked')
      this.showAIRecommendations = true
    },
    toggleAIRecommendations() {
      // 切换AI推荐显示状态
      this.showAIRecommendations = !this.showAIRecommendations
    },
    handleRecommendationClick(recommendation) {
      // 处理推荐项点击
      console.log('Recommendation clicked:', recommendation)
      
      // 跳转到planner页面
      this.$router.push('/planner')
    },
    handleAddClick() {
      // 处理添加按钮点击
      console.log('Add button clicked')
    },
    handleSendMessage(message) {
      // 处理发送消息
      console.log('Send message:', message)
    },
    handleMicClick() {
      // 处理麦克风按钮点击
      console.log('Mic button clicked')
    },
    onInputFocus() {
      // 输入框聚焦时保持AI状态
      // this.showAIRecommendations = false
    },
    // 切换场景类型的方法
    changeSceneType(sceneType) {
      this.currentSceneType = sceneType
    },
    // 更新AI推荐内容
    updateAIRecommendations(recommendations) {
      this.aiRecommendations = recommendations
    },
    handleClickOutside(event) {
      // 检查点击是否在AI覆盖层外
      const aiOverlay = this.$el.querySelector('.ai-overlay')
      const aiBtn = this.$el.querySelector('.ai-btn')
      
      if (this.showAIRecommendations && aiOverlay && 
          !aiOverlay.contains(event.target) && 
          !aiBtn.contains(event.target)) {
        this.showAIRecommendations = false
      }
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.ai-mode {
  /* AI模式下的容器样式 */
}

/* 场景切换器样式 */
.scene-switcher {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scene-btn {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scene-btn:hover {
  background: #f8f8f8;
  transform: translateY(-1px);
}

.scene-btn.active {
  background: #333333;
  color: white;
  border-color: #333333;
}

/* AI覆盖层样式 */
.ai-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 