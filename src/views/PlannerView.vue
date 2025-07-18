<template>
  <div class="planner-view">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- Start Planning Agent 卡片 -->
      <div class="agent-card expanded">
        <div class="card-header">
          <h2 class="card-title">Start Planning Agent?</h2>
        </div>
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
                <div class="chat-messages">
                  <div class="message user-message">
                    <span>Let's go to Maldives this summer!</span>
                  </div>
                  <div class="message other-message">
                    <div class="avatar">S</div>
                    <span>How about July 15-22?</span>
                  </div>
                  <div class="message user-message">
                    <span>I'm in! When works for everyone?</span>
                  </div>
                  <div class="message other-message">
                    <div class="avatar">M</div>
                    <span>Perfect! I can do those dates</span>
                  </div>
                  <div class="message user-message">
                    <span>Works for me too! 🎉</span>
                  </div>
                  <div class="message other-message">
                    <div class="avatar">M</div>
                    <span>Thinking of dinner tonight. What restaurant would you prefer?</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Start Agent 按钮 -->
        <button class="start-agent-btn" @click="startAgent" :disabled="selectedOptions.length === 0">
          Start Agent
        </button>
      </div>

      <!-- 底部任务卡片 -->
      <div class="tasks-section">
        <div class="task-cards">
          <div class="task-card collapsed">
            <span class="task-title">Meal Prep</span>
            <span class="task-status">Waiting for agent</span>
          </div>
        </div>
        
        <div class="info-text">
          <span>You can use your phone while the tasks runs</span>
        </div>
      </div>

      <!-- Tommy's Birthday Party 卡片 -->
      <div class="event-card">
        <span class="event-title">Tommy's Birthday Party</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlannerView',
  data() {
    return {
      isAgentStarted: false,
      selectedOptions: []
    }
  },
  methods: {
    startAgent() {
      if (this.selectedOptions.length === 0) {
        return
      }
      this.isAgentStarted = true
      console.log('Planning Agent started with options:', this.selectedOptions)
      // 这里可以添加启动代理的逻辑
      // 比如跳转到计划页面或开始AI对话
      this.$router.push('/plan')
    }
  }
}
</script>

<style scoped>
.planner-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #E5E6E1 0%, #FFFFFF 50%, #A7AAB9 100%);
  padding: 0;
  margin: 0;
  position: relative;
  overflow: hidden;
}

.planner-view::before {
  content: '';
  position: absolute;
  top: -492px;
  left: -70px;
  width: 720px;
  height: 1400px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1400"><defs><radialGradient id="balls" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:%23E6E7EC;stop-opacity:1" /><stop offset="100%" style="stop-color:%23EEF0F4;stop-opacity:1" /></radialGradient></defs><circle cx="360" cy="700" r="600" fill="url(%23balls)" opacity="0.3"/></svg>');
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
}

/* 主要内容区域 */
.main-content {
  padding: 20px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
}

/* Agent 卡片样式 */
.agent-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(255, 255, 255, 0.35) 100%);
  backdrop-filter: blur(70px);
  border-radius: 32px;
  padding: 20px 24px 8px;
  box-shadow: 0px 50px 30px -30px rgba(125, 136, 172, 0.25);
  border: 0.5px solid rgba(255, 255, 255, 0.45);
  margin-bottom: 24px;
  position: relative;
}

.agent-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.45) 100%);
  border-radius: inherit;
  z-index: -1;
}

.agent-card.expanded {
  /* 移除固定高度，让内容自然展开 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-title {
  font-size: 20px;
  font-weight: 500;
  color: #12192B;
  margin: 0;
  line-height: 1.3;
  font-family: 'Inter', sans-serif;
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

/* 手机模拟器 */
.phone-mockup {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  background: rgba(18, 25, 43, 0.05);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 176px;
  overflow: hidden;
}

.phone-frame {
  width: 320px;
  height: 540px;
  border-radius: 40px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  position: relative;
  background: #1c1c1e;
  border: 2px solid #2c2c2e;
  backdrop-filter: blur(20px);
  transform: scale(0.25);
  transform-origin: top center;
}

.phone-frame::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: #2c2c2e;
  border-radius: 2px;
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
}

.chat-header {
  height: 60px;
  background: rgba(248, 249, 250, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  gap: 12px;
}

.back-button {
  font-size: 24px;
  color: #007AFF;
  font-weight: 300;
  cursor: pointer;
}

.chat-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #1c1e21;
}

.chat-agent-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
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

.chat-input-area {
  height: 80px;
  background: rgba(248, 249, 250, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.chat-input {
  flex: 1;
  height: 40px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
  color: #8e8e93;
  display: flex;
  align-items: center;
  font-weight: 400;
}

/* Start Agent 按钮 */
.start-agent-btn {
  width: 100%;
  background: #12192B;
  color: white;
  border: none;
  border-radius: 99px;
  padding: 8px 16px;
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

/* 任务部分 */
.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-cards {
  display: flex;
  gap: 16px;
}

.task-card {
  flex: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
  backdrop-filter: blur(20px);
  border-radius: 35px;
  padding: 13px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-card.collapsed {
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.2) 100%);
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  opacity: 0.9;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #12192B;
  font-family: 'Inter', sans-serif;
  line-height: 1.43;
}

.task-status {
  font-size: 12px;
  color: #595E6B;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  line-height: 1.33;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #A0A3AA;
  text-align: center;
  justify-content: center;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  line-height: 1.33;
}

/* 事件卡片 */
.event-card {
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 14px 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: calc(100% - 40px);
  max-width: 400px;
}

.event-title {
  font-size: 12px;
  font-weight: 500;
  color: #717580;
  margin: 0;
  line-height: 1.33;
  font-family: 'Inter', sans-serif;
}
</style>