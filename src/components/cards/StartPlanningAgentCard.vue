<template>
  <div class="agent-card" :class="cardState">
    <div class="card-header" @click="handleHeaderClick">
      <h2 class="card-title">Start Planning Agent?</h2>
      <div class="header-actions">
        <span v-if="cardState === 'collapsed'" class="card-status">Ready to start</span>
        <button v-if="cardState === 'half'" class="action-btn" @click.stop="expandToFull">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
        <button v-if="cardState === 'full'" class="action-btn" @click.stop="closeFull">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="cardState !== 'collapsed'" class="card-content">
      <p class="card-subtitle">Help coordinate the party</p>
      
      <div class="help-section">
        <h3 class="help-title">I'll help by</h3>
        <div class="help-options">
          <label class="help-option">
            <input type="checkbox" v-model="selectedOptions" value="coordinate" class="checkbox-input">
            <div class="checkbox-custom"></div>
            <span class="option-text">Coordinating time and location with the group</span>
          </label>
          <label class="help-option">
            <input type="checkbox" v-model="selectedOptions" value="dietary" class="checkbox-input">
            <div class="checkbox-custom"></div>
            <span class="option-text">Tracking dietary restrictions</span>
          </label>
        </div>
      </div>

      <!-- 嵌入的聊天预览 - 手机UI模拟 -->
      <div class="phone-mockup">
        <div class="phone-frame">
          <div class="phone-screen">
            <div class="chat-app">
              <div class="chat-messages" ref="chatMessages">
                <div 
                  v-for="message in displayMessages" 
                  :key="message.id"
                  :class="['message', message.type === 'user' ? 'user-message' : 'other-message']"
                >
                  <div v-if="message.type === 'other'" class="avatar">{{ message.sender }}</div>
                  <span>{{ message.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Agent工作状态显示 -->
        <div v-if="agentWorking" class="agent-status">
          <span class="working-time">{{ formatTime(workingTime) }}</span>
        </div>
      </div>

      <!-- Start Agent 按钮 -->
      <button class="start-agent-btn" @click="handleStartAgent" :disabled="selectedOptions.length === 0">
        Start Agent
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StartPlanningAgentCard',
  props: {
    chatMessages: {
      type: Array,
      default: () => []
    },
    agentWorking: {
      type: Boolean,
      default: false
    },
    workingTime: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedOptions: [],
      cardState: 'collapsed' // 'collapsed', 'half', 'full'
    }
  },
  computed: {
    displayMessages() {
      return this.chatMessages
    }
  },
  watch: {
    // 监听消息变化，自动滚动到底部
    chatMessages: {
      handler(newMessages, oldMessages) {
        // 只有当有新消息添加时才滚动
        if (newMessages.length > (oldMessages ? oldMessages.length : 0)) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.scrollToBottom()
            }, 100)
          })
        }
      },
      deep: true
    },
    // 监听显示消息变化
    displayMessages: {
      handler() {
        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToBottom()
          }, 100)
        })
      },
      deep: true
    }
  },
  methods: {
    handleStartAgent() {
      this.$emit('start-agent', this.selectedOptions)
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}s`
    },
    // 状态管理方法
    handleHeaderClick() {
      if (this.cardState === 'collapsed') {
        this.cardState = 'half'
      } else {
        this.cardState = 'collapsed'
      }
    },
    expandToFull() {
      this.cardState = 'full'
    },
    closeFull() {
      this.cardState = 'half'
    },
    scrollToBottom() {
      const chatContainer = this.$refs.chatMessages
      if (chatContainer) {
        // 使用平滑滚动到底部
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        })
      }
    },
    // 添加用户消息的方法
    addUserMessage(text) {
      // 这里可以添加用户消息的逻辑
      // 由于消息是通过props传入的，这个方法主要用于组件内部处理
      this.$emit('add-message', {
        type: 'user',
        text: text,
        time: this.getCurrentTime()
      })
      // 用户发送消息后滚动到底部
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    },
    getCurrentTime() {
      const now = new Date()
      return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    }
  },
  mounted() {
    // 初始化时滚动到底部
    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    })
  }
}
</script>

<style scoped>
/* Agent 卡片样式 */
.agent-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(255, 255, 255, 0.35) 100%);
  backdrop-filter: blur(70px);
  border-radius: 32px;
  padding: 20px 24px 8px;
  box-shadow: 0px 50px 30px -30px rgba(125, 136, 172, 0.25);
  border: 0.5px solid rgba(255, 255, 255, 0.45);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* 三种状态样式 */
.agent-card.collapsed {
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.2) 100%);
  backdrop-filter: blur(20px);
  border-radius: 35px;
  padding: 13px 24px;
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  opacity: 0.9;
  height: auto;
  min-height: auto;
  margin: 0;
  transform: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.agent-card.collapsed:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.agent-card.half {
  padding: 8px 24px 8px;
  height: auto;
  min-height: 400px;
}

.agent-card.full {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  margin: 0;
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.card-header:hover {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #666666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333333;
}

.card-title {
  font-size: 20px;
  font-weight: 500;
  color: #12192B;
  margin: 0;
  line-height: 1.3;
  font-family: 'Inter', sans-serif;
}

.agent-card.collapsed .card-title {
  font-size: 14px;
  font-weight: 500;
  color: #12192B;
  font-family: 'Inter', sans-serif;
  line-height: 1.43;
}

.card-status {
  font-size: 12px;
  color: #595E6B;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  line-height: 1.33;
}

.card-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-subtitle {
  color: #595E6B;
  font-size: 12px;
  margin: 0 0 24px 0;
  font-weight: 500;
  line-height: 1.33;
  font-family: 'Inter', sans-serif;
}

/* 帮助部分 */
.help-section {
  margin-bottom: 24px;
}

.help-title {
  font-size: 12px;
  font-weight: 500;
  color: #12192B;
  margin: 0 0 12px 0;
  line-height: 1.33;
  font-family: 'Inter', sans-serif;
}

.help-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid #8e8e93;
  border-radius: 4px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background: white;
}

.checkbox-input:checked + .checkbox-custom {
  background: #007AFF;
  border-color: #007AFF;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: 600;
}

.option-text {
  font-size: 12px;
  color: #12192B;
  font-weight: 500;
  line-height: 1.33;
  font-family: 'Inter', sans-serif;
}

/* 手机模拟器样式 */
.phone-mockup {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  background-color: #e9e9ee;
  height: 160px;
  border-radius: 20px;
  overflow: hidden;
}

/* 全屏状态下的手机模拟器 */
.agent-card.full .phone-mockup {
  height: 300px;
  margin: 40px 0;
}

.phone-frame {
  width: 320px;
  height: 540px;
  border-radius: 40px;
  padding: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  position: relative;
  backdrop-filter: blur(20px);
  transform: scale(0.25);
  transform-origin: center center;
  /* 确保手机框架在容器中正确显示 */
  flex-shrink: 0;
}

/* 全屏状态下的手机框架 */
.agent-card.full .phone-frame {
  transform: scale(0.4);
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-app {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  height: 100%;
  min-height: 0;
  /* 确保聊天应用容器有正确的高度 */
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  /* 确保容器有足够的高度来滚动 */
  min-height: 0;
  max-height: 100%;
}

/* Webkit浏览器的滚动条样式 */
.chat-messages::-webkit-scrollbar {
  display: none;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 85%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.user-message span {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 20px;
  border-bottom-right-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 400;
}

.other-message {
  align-self: flex-start;
}

.other-message span {
  background: rgba(248, 249, 250, 0.8);
  color: #1c1e21;
  padding: 12px 16px;
  border-radius: 20px;
  border-bottom-left-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 400;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #8e8e93;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Agent工作状态 */
.agent-status {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(18, 25, 43, 0.8);
  color: white;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

/* Start Agent 按钮 */
.start-agent-btn {
  width: 100%;
  background: #12192B;
  color: white;
  border: none;
  border-radius: 99px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', sans-serif;
  line-height: 1.43;
}

.start-agent-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(18, 25, 43, 0.3);
}

.start-agent-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(18, 25, 43, 0.2);
}

.start-agent-btn:disabled {
  background: #8e8e93;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: 0 2px 8px rgba(142, 142, 147, 0.2);
}
</style>