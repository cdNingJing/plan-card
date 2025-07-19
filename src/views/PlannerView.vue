<template>
  <div class="planner-view">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- Start Planning Agent 卡片 -->
      <StartPlanningAgentCard 
        :chat-messages="chatMessages"
        :agent-working="agentWorking"
        :working-time="workingTime"
        @start-agent="handleStartAgent"
      />

      <!-- Agent工作结果展示 -->
      <div v-if="agentWorkCompleted" class="agent-results">
        <div class="results-layout">
          <!-- 左侧地图区域 -->
          <div class="left-section">
            <div class="map-container">
              <div class="map-background"></div>
              <div class="activity-tag">
                <span class="activity-text">Backyard + Indoor</span>
                <div class="map-pin">📍</div>
              </div>
              <div class="event-info">
                <h3 class="event-title">Unicorn Adventure</h3>
                <div class="event-details">
                  <span class="event-date">Sat, July 15th</span>
                  <span class="event-time">2:00 PM - 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧客人信息区域 -->
          <div class="right-section">
            <div class="guest-list">
              <div class="guest-item">
                <span class="guest-name">Tommy</span>
                <span class="guest-allergy">(nut allergy)</span>
              </div>
              <div class="guest-item">
                <span class="guest-name">Emma</span>
                <span class="guest-allergy">(dairy-free)</span>
              </div>
            </div>
            <div class="rsvp-info">
              <span class="rsvp-count">8 RSVPs</span>
              <span class="age-range">ages 7-9</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Meal选择卡片 -->
      <MealSelectionCard 
        :meal-options="mealRecommendations"
        @meal-selected="handleMealSelected"
      />

      <!-- 底部任务卡片 -->
      <div class="tasks-section">
        <div class="info-text">
          <span>You can use your phone while the tasks runs</span>
        </div>
      </div>

      <!-- Tommy's Birthday Party 卡片 -->
      <div class="event-card">
        <span class="event-title">Tommy's Birthday Party</span>
      </div>
    </div>

    <!-- 任务执行弹出框 -->
    <TaskExecutionModal 
      v-if="showTaskModal"
      @close="handleTaskModalClose"
      @start-tasks="handleStartTasks"
      @allow-access="handleAllowAccess"
      @cancel="handleTaskModalCancel"
      @contact-selected="handleContactSelected"
    />
  </div>
</template>

<script>
import TaskExecutionModal from '@/components/TaskExecutionModal.vue'
import StartPlanningAgentCard from '@/components/cards/StartPlanningAgentCard.vue'
import MealSelectionCard from '@/components/cards/MealSelectionCard.vue'

export default {
  name: 'PlannerView',
  components: {
    TaskExecutionModal,
    StartPlanningAgentCard,
    MealSelectionCard
  },
  data() {
    return {
      isAgentStarted: false,
      showTaskModal: false,
      agentWorking: false,
      workingTime: 0,
      workingTimer: null,
      chatMessages: [
        {
          id: 1,
          type: 'user',
          text: 'Let\'s go to Maldives this summer!',
          time: '10:30'
        },
        {
          id: 2,
          type: 'other',
          sender: 'S',
          text: 'How about July 15-22?',
          time: '10:31'
        },
        {
          id: 3,
          type: 'user',
          text: 'I\'m in! When works for everyone?',
          time: '10:32'
        },
        {
          id: 4,
          type: 'other',
          sender: 'M',
          text: 'Perfect! I can do those dates',
          time: '10:33'
        },
        {
          id: 5,
          type: 'user',
          text: 'Works for me too! 🎉',
          time: '10:34'
        },
        {
          id: 6,
          type: 'other',
          sender: 'M',
          text: 'Thinking of dinner tonight. What restaurant would you prefer?',
          time: '10:35'
        }
      ],
      agentMessages: [
        // 第一轮：询问时间
        { type: 'agent', text: 'Hi! I\'m coordinating the dinner plans. What time works best for everyone?', sender: 'AI' },
        { type: 'user', text: '7 PM works for me', sender: 'You' },
        // 第二轮：询问地点
        { type: 'agent', text: 'Perfect! Now, where would you prefer to meet?', sender: 'AI' },
        { type: 'user', text: 'The Italian restaurant downtown', sender: 'You' },
        // 第三轮：询问过敏食物
        { type: 'agent', text: 'Great choice! Any food allergies I should know about?', sender: 'AI' },
        { type: 'user', text: 'I\'m allergic to nuts and shellfish', sender: 'You' }
      ],
      agentResults: {
        time: '7:00 PM',
        location: 'Italian Restaurant Downtown',
        allergies: ['Nuts', 'Shellfish'],
        participants: 4
      },
      mealRecommendations: [
        { 
          id: 1, 
          name: 'Tonkatsu', 
          description: 'Breaded pork cutlet with sauce', 
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
          allergens: ['None'],
          selected: false 
        },
        { 
          id: 2, 
          name: 'Gyūdon', 
          description: 'Beef bowl with rice', 
          image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
          allergens: ['None'],
          selected: false 
        },
        { 
          id: 3, 
          name: 'Sushi Roll', 
          description: 'Fresh salmon roll', 
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
          allergens: ['Fish'],
          selected: false 
        },
        { 
          id: 4, 
          name: 'Tempura', 
          description: 'Crispy vegetable tempura', 
          image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
          allergens: ['None'],
          selected: false 
        },
        { 
          id: 5, 
          name: 'Ramen', 
          description: 'Noodle soup with pork', 
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
          allergens: ['Egg', 'Wheat'],
          selected: false 
        },
        { 
          id: 6, 
          name: 'Yakitori', 
          description: 'Grilled chicken skewers', 
          image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
          allergens: ['None'],
          selected: false 
        }
      ],
      agentWorkCompleted: false
    }
  },
  watch: {
    chatMessages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      },
      deep: true
    }
  },
  computed: {
    displayMessages() {
      return this.chatMessages
    },
    hasSelectedMeals() {
      return this.mealRecommendations.some(meal => meal.selected)
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
            }, 50)
          })
        }
      },
      deep: true
    }
  },
  methods: {
    handleStartAgent(selectedOptions) {
      if (selectedOptions.length === 0) {
        return
      }
      this.isAgentStarted = true
      console.log('Planning Agent started with options:', selectedOptions)
      
      // 显示权限提示框
      this.showTaskModal = true
    },
    // 任务执行弹出框相关方法
    handleStartTasks() {
      console.log('Starting all tasks...')
      // 这里可以添加任务执行逻辑
      this.showTaskModal = false
      // 跳转到计划页面
      this.$router.push('/plan')
    },
    handleAllowAccess() {
      console.log('Allowing access...')
      // 这里可以添加权限处理逻辑
    },
    handleTaskModalClose() {
      this.showTaskModal = false
    },
    handleTaskModalCancel() {
      this.showTaskModal = false
    },
    handleContactSelected(contact) {
      console.log('Contact selected:', contact)
      // 关闭弹窗
      this.showTaskModal = false
      // 开始Agent工作
      this.startAgentWork()
    },
    startAgentWork() {
      this.agentWorking = true
      this.workingTime = 0
      
      // 开始计时器
      this.workingTimer = setInterval(() => {
        this.workingTime++
      }, 1000)
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      // 模拟三轮对话
      this.simulateAgentConversation()
    },
    simulateAgentConversation() {
      let messageIndex = 0
      const addMessage = () => {
        if (messageIndex < this.agentMessages.length) {
          const message = this.agentMessages[messageIndex]
          
          // 立即添加消息到聊天记录
          this.chatMessages.push({
            id: this.chatMessages.length + 1,
            type: message.type,
            sender: message.sender,
            text: message.text,
            time: this.getCurrentTime()
          })
          
          messageIndex++
          
          // 确保DOM更新后滚动到底部，添加延迟确保内容完全渲染
          setTimeout(() => {
            this.scrollToBottom()
          }, 100)
          
          // 每2秒添加下一条消息
          if (messageIndex < this.agentMessages.length) {
            setTimeout(addMessage, 2000)
          } else {
            // 对话结束，停止计时器
            clearInterval(this.workingTimer)
            this.agentWorking = false
            // 显示Agent工作结果
            this.agentWorkCompleted = true
            // 最后一条消息后再次滚动到底部
            setTimeout(() => {
              this.scrollToBottom()
            }, 200)
          }
        }
      }
      
      // 开始添加消息
      setTimeout(addMessage, 1000)
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
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}s`
    },
    getCurrentTime() {
      const now = new Date()
      return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    },
    toggleMealSelection(meal) {
      meal.selected = !meal.selected
    },
    confirmMealSelection() {
      const selectedMeals = this.mealRecommendations.filter(meal => meal.selected)
      console.log('Confirmed meals:', selectedMeals)
      // 这里可以添加确认菜品后的逻辑
    },
    handleMealSelected(meal) {
      console.log('Meal selected:', meal)
      // 这里可以添加meal选择后的逻辑
    },
    // 添加用户消息的方法
    addUserMessage(text) {
      this.chatMessages.push({
        id: this.chatMessages.length + 1,
        type: 'user',
        text: text,
        time: this.getCurrentTime()
      })
      // 用户发送消息后滚动到底部
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    }
  },
  mounted() {
    // 初始化时滚动到底部
    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    })
  },
  beforeUnmount() {
    // 清理计时器
    if (this.workingTimer) {
      clearInterval(this.workingTimer)
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
  position: relative;
  z-index: 1;
  gap: 6px;
}



/* Agent工作结果样式 */
.agent-results {
  background: transparent;
  border-radius: 24px;
}

/* 左右布局样式 */
.results-layout {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.left-section {
  width: 65%;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-sizing: border-box;
}

.right-section {
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 地图容器样式 */
.map-container {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&h=300&fit=crop');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 16px;
  opacity: 0.3;
}

.map-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(215deg, transparent 0%, #ffffff 60% 50%, rgba(255, 255, 255, 0.8) 100%);
  border-radius: 16px;
  pointer-events: none;
}

.map-pin {
  position: absolute;
  font-size: 16px;
  z-index: 2;
  color: #ff6b9d;
  right: -20px;
}

.activity-tag {
  background: white;
  color: #333333;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  align-self: flex-end;
  margin: 12px 12px 0 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.activity-text {
  font-size: 11px;
  font-weight: 600;
  color: #333333;
  font-family: 'Inter', sans-serif;
}

.activity-icon {
  font-size: 12px;
}

/* 活动信息样式 */
.event-info {
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border: none;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  margin-top: auto;
}

.event-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 4px 0;
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-date,
.event-time {
  font-size: 12px;
  color: #717580;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
}

/* 右侧区域样式 */
.right-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.guest-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.guest-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
}

.guest-name {
  font-size: 12px;
  font-weight: 500;
  color: #333333;
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
  margin-bottom: 2px;
}

.guest-allergy {
  font-size: 12px;
  color: #717580;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  line-height: 1.2;
}

.rsvp-info {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rsvp-count {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
  margin-bottom: 2px;
}

.age-range {
  font-size: 12px;
  color: #717580;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  line-height: 1.2;
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
  transform-origin: top center;
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