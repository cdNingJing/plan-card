<template>
  <div class="ai-interaction">
    <!-- AI推荐悬浮内容 -->
    <div class="ai-recommendations">
      <div 
        v-for="recommendation in recommendations" 
        :key="recommendation.id"
        class="recommendation-card" 
        @click="handleRecommendationClick(recommendation)"
      >
        <div class="rec-icon">{{ recommendation.icon }}</div>
        <span class="rec-text">{{ recommendation.text }}</span>
        <div class="rec-arrow">
          <ChevronRight class="arrow-icon" />
        </div>
      </div>
    </div>
    
    <!-- 底部输入框 -->
    <div class="bottom-input-area">
      <div class="input-wrapper">
        <button class="add-btn" @click="handleAddClick">
          <span class="plus">+</span>
        </button>
        <div class="input-field">
          <input 
            v-model="inputMessage" 
            type="text" 
            placeholder="Ask follow-up..." 
            @keyup.enter="handleSendMessage"
            @focus="handleInputFocus"
          />
        </div>
        <button class="mic-btn" @click="handleMicClick">
          <Mic class="icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Mic, ChevronRight } from 'lucide-vue-next'

export default {
  name: 'AIInteraction',
  components: {
    Mic,
    ChevronRight
  },
  props: {
    recommendations: {
      type: Array,
      default: () => [
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
          icon: '✏️',
          text: 'Draft a party invitation message',
          type: 'invitation'
        }
      ]
    }
  },
  data() {
    return {
      inputMessage: ''
    }
  },
  methods: {
    handleRecommendationClick(recommendation) {
      this.$emit('recommendation-click', recommendation)
    },
    handleAddClick() {
      this.$emit('add-click')
    },
    handleSendMessage() {
      if (this.inputMessage.trim()) {
        this.$emit('send-message', this.inputMessage)
        this.inputMessage = ''
      }
    },
    handleInputFocus() {
      this.$emit('input-focus')
    },
    handleMicClick() {
      this.$emit('mic-click')
    }
  }
}
</script>

<style scoped>
.ai-interaction {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.3s ease;
}

/* AI推荐悬浮内容样式 */
.ai-recommendations {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 10px;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recommendation-card {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  border-radius: 99px;
  border: 1px solid #e5e5e5;
  margin-bottom: 6px;
}

.recommendation-card:last-child {
  margin-bottom: 0;
}

.recommendation-card:active {
  background-color: #f0f0f0;
  transform: scale(0.98);
}

.rec-icon {
  font-size: 14px;
  margin-right: 8px;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #f8f8f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
}

.rec-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  line-height: 1.4;
}

.rec-arrow {
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  color: #999999;
}

/* 底部输入框区域 */
.bottom-input-area {
  margin-top: auto;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-radius: 99px;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
}

.add-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #eee;
}

.plus {
  font-size: 16px;
  color: #333333;
  font-weight: 600;
}

.input-field {
  flex: 1;
}

.input-field input {
  width: 100%;
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 14px;
  background: transparent;
  color: #333333;
  font-weight: 400;
}

.input-field input::placeholder {
  color: #a0a3aa;
  opacity: 1;
}

.mic-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333333;
  width: 32px;
  height: 32px;
  border: 1px solid #eee;
}

.mic-btn:hover {
  background-color: #f8f8f8;
}

.icon {
  width: 16px;
  height: 16px;
}

</style> 