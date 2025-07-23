<template>
  <div class="metadata-view">
    <div class="header">
      <h1>用户元数据</h1>
      <p class="subtitle">个人身份信息和角色数据</p>
    </div>

    <!-- 个人信息部分 -->
    <div class="section">
      <h2>个人信息</h2>
      <div class="info-card">
        <div 
          v-for="(value, key) in userMetadata.personalInfo" 
          :key="key"
          class="info-item"
        >
          <label>{{ formatFieldLabel(key) }}：</label>
          <span v-if="typeof value === 'object' && value !== null">
            {{ formatObjectValue(value) }}
          </span>
          <span v-else>
            {{ formatFieldValue(key, value) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 身份角色部分 -->
    <div class="section">
      <h2>身份角色</h2>
      <div class="identity-cards">
        <div 
          v-for="identity in userMetadata.identityRoles" 
          :key="identity.id"
          class="identity-card"
        >
          <div class="identity-header">
            <h3>{{ formatIdentityName(identity.id) }}</h3>
            <span class="type-badge">{{ formatIdentityType(identity.type) }}</span>
          </div>
          <div class="identity-content">
            <div class="identity-info">
              <div class="info-item">
                <label>ID：</label>
                <span>{{ identity.id }}</span>
              </div>
              <div class="info-item">
                <label>类型：</label>
                <span>{{ identity.type }}</span>
              </div>
              <div class="info-item">
                <label>描述：</label>
                <span>{{ identity.description }}</span>
              </div>
              <div class="info-item">
                <label>偏好设置：</label>
                <span>{{ identity.preferences }}</span>
              </div>
              <div class="info-item">
                <label>元数据：</label>
                <span>{{ identity.metadata }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话图标 -->
    <div class="chat-icon" @click="toggleChat">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
      </svg>
    </div>
    
    <!-- 清空对话按钮 -->
    <div v-if="showChat && messages.length > 0" class="clear-chat-btn" @click="clearChatHistory">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
      </svg>
    </div>
    
    <!-- 任务四象限控制图标 -->
    <div v-if="showTaskControlIcon" :class="['task-control-icon', { 'collapsed': isTaskDialogCollapsed, 'updating': isTaskUpdating }]" @click="toggleTaskDialog">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" fill="currentColor"/>
      </svg>
      <div v-if="isTaskUpdating" class="update-indicator">
        <div class="spinner"></div>
      </div>
    </div>
    
    <!-- 对话输入框 -->
    <div v-if="showChat" class="chat-input-container">
      <div :class="['chat-input-wrapper', { 'has-messages': messages.length > 0 }]">
        <input 
          v-model="chatMessage" 
          @keyup.enter="sendMessage"
          placeholder="输入您的问题..."
          class="chat-input"
          ref="chatInput"
          :disabled="isLoading"
        />
        <button @click="sendMessage" class="send-btn" :disabled="isLoading">
          <svg v-if="!isLoading" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
          </svg>
          <div v-else class="send-loading">
            <div class="send-dot"></div>
            <div class="send-dot"></div>
            <div class="send-dot"></div>
          </div>
        </button>
      </div>
    </div>

    <!-- 对话消息列表 -->
    <div v-if="showChat && messages.length > 0" class="messages-container">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message', message.type]"
      >
        <div class="message-content" v-html="formatMessageContent(message.content)">
        </div>
        <div class="message-time">
          {{ message.time }}
        </div>
      </div>
      
      <!-- Loading效果 -->
      <div v-if="isLoading" class="message ai loading-message">
        <div class="loading-content">
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <span class="loading-text">正在思考中...</span>
        </div>
      </div>
    </div>
    
    <!-- 任务四象限分类对话框 -->
    <TaskQuadrantDialog
      :visible="isTaskDialogCollapsed"
      :tasks="pendingTasks"
      @delete-task="deleteTask"
      @add-task="addTask"
      @update-task="updateTask"
      @clear-all-tasks="clearAllTasks"
      @close="closeTaskQuadrantDialog"
    />
  </div>
</template>

<script>
import { userMetadata } from '@/data/userMetadata.js'
import knowledgeApi from '@/api/knowledgeApi.js'
import claudeApiService from '@/api/claudeApi.js'
import taskAgentApiService from '@/api/taskAgentApi.js'
import TaskQuadrantDialog from '@/components/TaskQuadrantDialog.vue'

export default {
  name: 'MetadataView',
  components: {
    TaskQuadrantDialog
  },
  data() {
    return {
      userMetadata,
      showChat: false,
      chatMessage: '',
      messages: [],
      isLoading: false,
      pendingTasks: [],
      showTaskIcon: false,
      taskHistory: [],
      pendingTasksKey: 'pending_tasks',
      showTaskControlIcon: true,
      isTaskDialogCollapsed: false,
      taskMonitoringTimer: null,
      isTaskUpdating: false,
      
      // 任务管理相关
      taskManager: {
        // 任务去重配置
        deduplication: {
          enabled: true,
          similarityThreshold: 0.8, // 相似度阈值
          checkFields: ['content', 'task', 'reason'] // 检查去重的字段
        },
        
        // 任务状态管理
        status: {
          isUpdating: false,
          lastUpdateTime: null,
          updateCount: 0
        },
        
        // 任务操作历史
        operationHistory: [],
        
        // 任务缓存
        taskCache: new Map(),
        
        // 任务统计
        statistics: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          highPriorityTasks: 0
        }
      },
      
      // 任务去重结果
      duplicateTasks: [],
      
      // 任务编辑状态
      editingTask: null,
      
      // 任务筛选和排序
      taskFilters: {
        quadrant: 'all',
        priority: 'all',
        status: 'all',
        searchText: ''
      },
      
      taskSortBy: 'importance', // importance, urgency, createdAt, updatedAt
      
      // 任务批量操作
      selectedTasks: [],
      
      // 任务导入导出
      taskExportData: null,
      
      // 任务备份
      taskBackups: [],
      
      // 任务管理面板显示状态
      showTaskManager: false
    }
  },
      mounted() {
      // 页面加载时从localStorage加载对话历史和任务历史
      this.loadChatHistory()
      this.loadAutoMessageHistory()
      this.loadPendingTasks()
      
      // 启动定期任务监控（每5分钟检查一次）
      this.startTaskMonitoring()
      
      // 加载任务管理数据
      this.loadTaskManagerData()
      this.loadTaskBackups()
      
      // 初始化任务统计
      this.updateTaskStatistics()
    },
    
    beforeUnmount() {
      // 清理定时器
      if (this.taskMonitoringTimer) {
        clearInterval(this.taskMonitoringTimer)
      }
    },
  computed: {
    // 检查是否有任务
    hasTasks() {
      return this.pendingTasks.length > 0
    }
  },
  methods: {
    // 格式化字段标签
    formatFieldLabel(key) {
      return  key
    },
    
    // 格式化字段值
    formatFieldValue(key, value) {
      if (value === null || value === undefined) {
        return '未设置'
      }
      
      // 特殊字段格式化
      switch (key) {
        case 'age':
          return `${value}岁`
        case 'phone':
        case 'email':
          return value
        case 'birthDate':
        case 'marriageDate':
          return value
        case 'height':
        case 'weight':
        case 'bloodType':
        case 'eyeColor':
        case 'hairColor':
          return value
        case 'birthPlace':
        case 'householdAddress':
          return value
        case 'maritalStatus':
          return value
        default:
          return value
      }
    },
    
    // 格式化对象值
    formatObjectValue(obj) {
      if (!obj || typeof obj !== 'object') {
        return '未设置'
      }
      
      // 处理教育信息
      if (obj.degree && obj.university && obj.major) {
        return `${obj.degree} - ${obj.university} - ${obj.major} (${obj.graduationYear}年毕业)`
      }
      
      // 处理紧急联系人
      if (obj.name && obj.relationship && obj.phone) {
        return `${obj.name} (${obj.relationship}) - ${obj.phone}`
      }
      
      // 处理其他对象，转换为字符串
      return JSON.stringify(obj, null, 2)
    },
    
    // 格式化身份名称
    formatIdentityName(id) {
      const nameMap = {
        'real_identity': '真实身份',
        'work_identity': '工作身份',
        'family_identity': '家庭身份',
        'social_identity': '社交身份'
      }
      return nameMap[id] || id
    },
    
    // 格式化身份类型
    formatIdentityType(type) {
      const typeMap = {
        'real': '真实身份',
        'professional': '职业身份',
        'life': '生活身份',
        'social': '社交身份'
      }
      return typeMap[type] || type
    },
    
    // 格式化日期时间
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '未设置'
      
      try {
        const date = new Date(dateTimeString)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateTimeString
      }
    },
    
    // 格式化元数据标签
    formatMetadataLabel(key) {
      const labelMap = {
        'legalName': '法定姓名',
        'documents': '证件列表',
        'verificationLevel': '验证级别',
        'company': '公司名称',
        'position': '职位',
        'department': '部门',
        'employeeId': '员工编号',
        'workEmail': '工作邮箱',
        'skills': '技能',
        'experience': '工作经验',
        'salary': '薪资',
        'workLocation': '工作地点',
        'workPhone': '工作电话',
        'familyRole': '家庭角色',
        'spouse': '配偶',
        'children': '子女',
        'homeAddress': '家庭地址',
        'homePhone': '家庭电话',
        'nickname': '昵称',
        'interests': '兴趣爱好',
        'socialPlatforms': '社交平台',
        'hobbies': '爱好',
        'personality': '性格特点'
      }
      return labelMap[key] || key
    },
    

    

    
    toggleChat() {
      this.showChat = !this.showChat

      if (this.showChat) {
        this.$nextTick(() => {
          this.scrollToBottom()
          this.$refs.chatInput?.focus()
        })
      }
    },
    async sendMessage() {
      if (!this.chatMessage.trim() || this.isLoading) return
      
      const userInput = this.chatMessage
      
      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: userInput,
        time: this.getCurrentTime()
      }
      this.messages.push(userMessage)
      
      // 保存对话历史
      this.saveChatHistory()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      // 清空输入框
      this.chatMessage = ''
      
      // 开始loading
      this.isLoading = true
      
      try {
        // 使用knowledgeApi.search方法
        const data = await knowledgeApi.search(userInput, {
          limit: 10,
          collectionName: "collection_user_4821",
          includeGraphContext: true,
          includeReranking: true,
          includeReasoning: true,
          scoreThreshold: 0.3
        })
        
        // 处理API响应，获取bestMatch
        const { aiResponse, bestMatch } = await this.processAPIResponse(data, userInput)
        console.log('aiResponse', aiResponse)
        console.log('bestMatch', bestMatch)
        
        // 调用对话API
        const aiContent = await this.callChatAPI(userInput, bestMatch)
        const aiMessage = {
          type: 'ai',
          content: aiContent,
          time: this.getCurrentTime()
        }
        this.messages.push(aiMessage)
        
        // 保存对话历史
        this.saveChatHistory()
        
        // 对话完成后，自动触发任务更新
        if (this.pendingTasks.length > 0) {
          setTimeout(async () => {
            await this.continuousTaskUpdate()
          }, 1000) // 延迟1秒执行，避免阻塞UI
        }
      } catch (error) {
        console.error('API调用失败:', error)
        // 网络错误时直接调用对话API
        const aiContent = await this.callChatAPI(userInput, [])
        const aiMessage = {
          type: 'ai',
          content: aiContent,
          time: this.getCurrentTime()
        }
        this.messages.push(aiMessage)
        
        // 保存对话历史
        this.saveChatHistory()
        
        // 对话完成后，自动触发任务更新
        if (this.pendingTasks.length > 0) {
          setTimeout(async () => {
            await this.continuousTaskUpdate()
          }, 1000) // 延迟1秒执行，避免阻塞UI
        }
      } finally {
        // 结束loading
        this.isLoading = false
      }
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    scrollToBottom() {
      const messagesContainer = document.querySelector('.messages-container')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    },
    getCurrentTime() {
      const now = new Date()
      return now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    async processAPIResponse(data, userInput) {
      try {
        let bestMatch = []
        let aiResponse = ''
        
        // 检查API响应结构
        if (data && data.results && data.results.length > 0) {
          console.log('API搜索结果:', data.results)
          
          // 按score降序排序，获取所有匹配文档的内容组合
          const sortedResults = data.results.sort((a, b) => b.score - a.score)
          
          // 将所有匹配文档保存为数组
          bestMatch = sortedResults.map(result => ({
            descriptive_id: result.metadata?.descriptive_id,
            chunk_id: result.metadata?.chunk_id,
            title: result.metadata?.title || result.metadata?.source || '无标题',
            analysis: result?.metadata.analysis,
            entities: result?.metadata.entities,
            summary: result?.metadata.summary,
            content: result.content,
            score: result.score
          }))
          
          console.log(`找到 ${bestMatch.length} 个相关文档:`, bestMatch)
          
          // 组合所有匹配文档的内容
          if (bestMatch.length > 0) {
            const combinedContent = bestMatch.map(doc => 
              `【${doc.title}】\n${doc.summary} \n${doc.analysis} \n${doc.entities}`
            ).join('\n\n')
            
            aiResponse = `根据知识库搜索结果，我为您找到以下相关信息：\n\n${combinedContent}`
          }
        }
        
        // 如果有推理结果
        if (data.reasoning) {
          aiResponse = data.reasoning
        }
        
        // 如果有其他响应内容
        if (data.response) {
          aiResponse = data.response
        }
        
        // 如果没有找到合适的响应内容，直接调用对话API
        if (!aiResponse) {
          console.log('没有找到合适的响应内容，直接调用对话API')
          aiResponse = await this.callChatAPI(userInput, [])
        }
        
        return { aiResponse, bestMatch }
      } catch (error) {
        console.error('处理API响应失败:', error)
        console.log('没有找到合适的响应内容，直接调用对话API')
        const fallbackResponse = await this.callChatAPI(userInput, [])
        return { aiResponse: fallbackResponse, bestMatch: [] }
      }
    },
    async callChatAPI(userInput, bestMatch) {
      try {
        // 构建对话上下文
        const conversationHistory = this.messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
        
        // 构建知识库上下文
        const knowledgeContext = this.buildKnowledgeContext(bestMatch)
        console.log('知识库上下文:', knowledgeContext)
        
        // 使用Claude API进行对话
        const claudeResponse = await claudeApiService.multiTurnChat(conversationHistory, knowledgeContext)
        
        if (claudeResponse.success) {
          const aiContent = claudeResponse?.data?.content?.[0]?.text || claudeResponse?.data?.content || '抱歉，我现在无法回答您的问题，请稍后再试。'
          
          // 解析JSON格式的响应
          const parsedData = this.parseAIResponse(aiContent)
          console.log('解析的AI响应数据:', parsedData)
          
          // 检查是否有新任务
          if (parsedData && parsedData.hasNewTasks) {
            await this.handleNewTasks()
          }
          
          // 检查是否有时间更新
          if (parsedData && parsedData.hasTimeUpdate) {
            await this.updateTasksWithNewInfo()
          }
          
          // 检查是否需要持续更新
          if (parsedData && parsedData.needsContinuousUpdate) {
            await this.continuousTaskUpdate()
          }
          
          if (parsedData && parsedData.answer) {
            return parsedData.answer
          } else {
            // 如果解析失败，返回原始内容
            return aiContent
          }
        } else {
          // Claude API失败，返回默认回复
          console.error('Claude API调用失败:', claudeResponse.error)
          return '抱歉，我现在无法回答您的问题，请稍后再试。'
        }
      } catch (error) {
        console.error('调用对话API失败:', error)
        return '抱歉，发生了网络错误，请检查网络连接。'
      }
    },
    parseAIResponse(content) {
      try {
        // 查找<START>和<END>标记之间的内容
        const startMatch = content.match(/<START>\s*(\{[\s\S]*?\})\s*<END>/)
        if (startMatch && startMatch[1]) {
          const jsonContent = startMatch[1]
          const parsedData = JSON.parse(jsonContent)
          console.log('成功解析AI响应JSON:', parsedData)
          return parsedData
        }
        
        // 如果没有找到标记，尝试直接解析整个内容
        const parsedData = JSON.parse(content)
        console.log('直接解析AI响应JSON:', parsedData)
        return parsedData
      } catch (error) {
        console.error('解析AI响应失败:', error)
        console.log('原始内容:', content)
        return null
      }
    },
    buildKnowledgeContext(bestMatch) {
      const now = new Date()
      const currentTime = now.toTimeString().split(' ')[0]
      
      // 获取用户元数据信息
      const virtualPersona = this.getUserMetadataInfo()
      
      // 基础提示词模板
      const basePrompt = `
你是一个基于用户个人数据的虚拟人设AI助手。当前时间：${currentTime}。

## 你的角色设定：
你拥有用户的完整个人信息和多个身份角色。当用户询问关于"你"的问题时，你应该基于这些信息来回答，就像你是这个虚拟人设一样。回答要自然、流畅，避免机械化的表达。

## 回答策略：
1. **数据解析**：从提供的用户元数据中解析出相关信息
2. **身份切换**：根据用户问题自动选择合适的身份角色回答
3. **信息整合**：当用户询问"你的名字"时，可以介绍多个身份的名字
4. **智能提问**：只在信息不足或需要确认的模糊问题中才提问，清晰的问题直接回答
5. **个性化回答**：基于用户的真实信息，给出自然、个性化的回答，避免过于正式或机械化的表达
6. **信息不足处理**：如果提供的信息不足以回答问题，直接说明信息不足
7. **任务分析**：当用户提到需要处理的任务时，分析每个任务的重要性和紧急性，生成带分析结果的任务列表

## 回答风格：
- 使用自然的对话语言，避免过于正式或机械化的表达
- 根据问题的性质选择合适的身份角色回答
- 在信息不足时才提问，清晰的问题直接回答
- 保持对话的连贯性和自然性

## 身份角色说明：
- **真实身份**：用于正式场合和法律事务
- **工作身份**：在职场中的身份，专注于技术能力和职业发展
- **生活身份**：在生活中的身份，作为丈夫和父亲，承担家庭责任和个人生活
- **社交身份**：在朋友和社交圈中的身份，更加轻松随意

**请基于以上用户元数据信息回答用户问题。如果信息不足，请直接说明。**

**回答示例：**
- 问："你的名字？" → 答："我叫王小明，不过在不同场合大家叫我不同的名字。工作中是王工程师，家里是小王，朋友间是小明。"
- 问："你多大了？" → 答："我28岁，1996年3月15日出生的。"
- 问："你喜欢什么游戏？" → 答："我喜欢游戏，不过具体喜欢什么类型游戏，这个信息在我资料里不够详细。"
- 任务检测：当用户提到需要处理的任务时，生成"hasNewTasks": true，否则为false
- 时间更新检测：当用户提到时间变化（如"现在是下午"、"时间已经到了"等）或情况变化时，生成"hasTimeUpdate": true，否则为false
- 持续监控：当对话中包含可能影响任务状态的信息时，生成"needsContinuousUpdate": true，否则为false
- 自动更新触发条件：
  * 时间变化（如"现在是下午"、"时间已经到了"等）
  * 位置变化（如"已经到了西安"、"在绿地酒店"等）
  * 状态变化（如"任务已完成"、"会议结束了"等）
  * 人员变化（如"小李安排了"、"张磊同行"等）
  * 计划变化（如"改期了"、"取消了"等）
  * 任何可能影响现有任务的信息

**强制要求：你必须严格按照以下<START>内容<END>格式返回，不能有任何其他内容！**
<START>
{
  "answer": "基于用户元数据的自然、个性化回答。只在信息不足或需要确认的模糊问题中才提问，清晰的问题直接回答，避免过度提问",
  "hasNewTasks": true/false,
  "hasTimeUpdate": true/false,
  "needsContinuousUpdate": true/false,
  "availableServices": ["组件名称1", "组件名称2", "组件名称3", ...],
  "longTermData": "从当前对话中提取用户的隐含意图、偏好趋势、生活习惯、恐惧避雷、人生心愿、社交关系、健康档案等持久性信息。重点关注：1)隐含行程意图（如查询天气背后的出行动机）；2)偏好迁移趋势（如饮品、食物选择变化）；3)恐惧动物/食物自动规避；4)未言明生活习惯（如周五披萨啤酒看片）；5)人生心愿回溯（如开猫咖、考潜水证）；6)长期收藏偏好；7)过敏食物避雷；8)重要纪念日和人物关系；9)职业规划心愿；10)超长期愿望记忆。提取格式：用户[具体行为/偏好/心愿/关系/恐惧]",
  "extractedInfo": ["与用户问题直接相关的关键信息1", "关键信息2", "关键信息3"],
  "dataModifications": {}
}
<END>

**格式要求说明：**
- answer 字段：返回基于用户元数据的自然、个性化回答。只在信息不足或需要确认的模糊问题中才提问，清晰的问题直接回答，避免过度提问
- availableServices 字段：返回可能用到的组件名称数组（如：AllergyFreeMenuCard、PartyThemeCard, 等等或者更多）
- longTermData 字段：提取用户的隐含意图、偏好趋势、生活习惯、恐惧避雷、人生心愿、社交关系、健康档案等持久性信息，重点关注隐含行程意图、偏好迁移趋势、恐惧自动规避、未言明生活习惯、人生心愿回溯、长期收藏偏好、过敏食物避雷、重要纪念日关系、职业规划心愿、超长期愿望记忆等
- extractedInfo 字段：先总结文档中与用户问题直接相关的关键信息要点数组，只提取能回答用户问题的信息
- dataModifications 字段：当用户要求修改模拟数据时，返回需要修改的数据对象。格式为嵌套对象，包含要修改的场景数据（如basicInfo、flightBooking、preferences等）和对应的新值。如果用户没有要求修改数据，则返回空对象{}
`.trim()
      
      if (bestMatch && bestMatch.length > 0) {
        // 有匹配的知识库内容，添加知识库信息
        const documentsInfo = bestMatch.map((doc, index) => `
## 文档 ${index + 1}
**标题：** ${doc.title}
**相关度：** ${(doc.score * 100).toFixed(1)}%
**内容：**
${doc.content || doc.summary || '无内容'}
${doc.analysis ? `**分析：** ${doc.analysis}` : ''}
${doc.entities ? `**实体：** ${doc.entities}` : ''}
`).join('\n\n')

        const knowledgeInfo = `
# 用户元数据信息

${virtualPersona}

# 知识库上下文信息

${documentsInfo}

---
请基于以上用户元数据信息和知识库信息回答用户的问题。

${basePrompt}`
        
        return knowledgeInfo
      } else {
        // 没有匹配的知识库内容，直接返回用户元数据信息
        const knowledgeInfo = `
# 用户元数据信息

${virtualPersona}

---
请基于以上用户元数据信息回答用户的问题。

${basePrompt}`
        
        return knowledgeInfo
      }
    },
    // 删除generateAIResponse方法，现在使用虚拟人设对话
    
    // 获取用户元数据信息的方法
    getUserMetadataInfo() {
      const personalInfo = this.userMetadata.personalInfo
      const identityRoles = this.userMetadata.identityRoles
      
      return `
# 用户元数据信息

## 个人信息
${personalInfo.basicInfo}
${personalInfo.physicalInfo}
${personalInfo.birthPlace}
${personalInfo.householdInfo}
${personalInfo.educationInfo}
${personalInfo.maritalInfo}
${personalInfo.emergencyContact}

## 身份角色
${identityRoles.map(role => `
### ${role.id} (${role.type})
${role.description}
${role.preferences}
${role.metadata}
`).join('\n\n')}
`
    },
    
    // 保存对话历史到localStorage
    saveChatHistory() {
      try {
        const chatData = {
          messages: this.messages,
          timestamp: new Date().toISOString(),
          totalMessages: this.messages.length
        }
        localStorage.setItem('metadata_chat_history', JSON.stringify(chatData))
        console.log('对话历史已保存到localStorage')
      } catch (error) {
        console.error('保存对话历史失败:', error)
      }
    },
    
    // 从localStorage加载对话历史
    loadChatHistory() {
      try {
        const savedData = localStorage.getItem('metadata_chat_history')
        if (savedData) {
          const chatData = JSON.parse(savedData)
          this.messages = chatData.messages || []
          console.log(`从localStorage加载了 ${this.messages.length} 条对话记录`)
        }
      } catch (error) {
        console.error('加载对话历史失败:', error)
        this.messages = []
      }
    },
    
    // 清空对话历史
    clearChatHistory() {
      try {
        this.messages = []
        localStorage.removeItem('metadata_chat_history')
        console.log('对话历史已清空')
      } catch (error) {
        console.error('清空对话历史失败:', error)
      }
    },
    
    // 格式化消息内容
    formatMessageContent(content) {
      if (!content) return ''
      
      // 将换行符转换为HTML换行
      let formattedContent = content.replace(/\n/g, '<br>')
      
      // 格式化列表项
      formattedContent = formattedContent.replace(/^(\d+\.\s)/gm, '<span class="list-item">$1</span>')
      formattedContent = formattedContent.replace(/^([•·]\s)/gm, '<span class="list-item">$1</span>')
      
      // 格式化粗体文本
      formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // 格式化斜体文本
      formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // 格式化代码块
      formattedContent = formattedContent.replace(/```(.*?)```/gs, '<pre class="code-block">$1</pre>')
      
      // 格式化行内代码
      formattedContent = formattedContent.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      
      // 格式化引用
      formattedContent = formattedContent.replace(/^>\s(.*)/gm, '<blockquote class="quote">$1</blockquote>')
      
      return formattedContent
    },
    
    // 处理新任务和任务更新
    async handleNewTasks() {
      try {
        console.log('检测到新任务，开始分析...')
        
        // 获取当前用户消息
        const currentMessage = this.messages[this.messages.length - 1]
        if (!currentMessage || currentMessage.type !== 'user') {
          console.log('未找到用户消息')
          return
        }
        
        // 构建包含当前时间和情况的完整消息
        const currentTime = new Date().toLocaleTimeString()
        const enhancedMessage = `当前时间：${currentTime}\n\n${currentMessage.content}`
        
        // 调用任务分析API
        const response = await taskAgentApiService.analyzeTasks(
          enhancedMessage, 
          this.pendingTasks
        )
        
        if (response.success) {
          const result = response.data
          console.log('任务分析结果:', result)
          
                    // 处理新任务
          if (result.newTasks && result.newTasks.length > 0) {
            // 使用新的任务管理系统处理新任务
            const processedTasks = []
            const allDuplicates = []
            
            for (const taskData of result.newTasks) {
              const result = this.addTask(taskData)
              if (result.success) {
                processedTasks.push(result.task)
              }
              if (result.duplicates) {
                allDuplicates.push(...result.duplicates)
              }
            }

            // 保存任务到本地存储（仅在对话AI返回新任务时）
            this.savePendingTasks()
            
            // 显示四象限对话框
            this.isTaskDialogCollapsed = true

            console.log('新任务已添加:', processedTasks)
            if (allDuplicates.length > 0) {
              console.log('检测到重复任务:', allDuplicates)
            }
          }
          
                      // 处理任务更新
            if (result.updatedTasks && result.updatedTasks.length > 0) {
              result.updatedTasks.forEach(updatedTask => {
                const index = this.pendingTasks.findIndex(task => task.id === updatedTask.id)
                if (index !== -1) {
                  this.pendingTasks[index] = { 
                    ...this.pendingTasks[index], 
                    ...updatedTask,
                    content: updatedTask.task // 确保任务内容正确显示
                  }
                }
              })
              console.log('任务已更新:', result.updatedTasks)
            }
            
            // 处理任务删除
            if (result.deletedTasks && result.deletedTasks.length > 0) {
              const deletedTaskIds = result.deletedTasks
              this.pendingTasks = this.pendingTasks.filter(task => 
                !deletedTaskIds.includes(task.id)
              )
              console.log('任务已删除:', deletedTaskIds)
              
              // 如果没有任务了，隐藏任务图标
              if (this.pendingTasks.length === 0) {
                this.showTaskIcon = false
              }
            }
          
          // 如果有分析结果，可以显示给用户
          if (result.analysis) {
            console.log('任务分析说明:', result.analysis)
          }
        } else {
          console.error('任务分析失败:', response.error)
        }
              } catch (error) {
          console.error('处理新任务时出错:', error)
        }
      },
      
          // 持续任务更新（基于对话的主动更新）
    async updateTasksWithNewInfo() {
        try {
          console.log('手动触发任务更新...')
          
          // 获取最后一条用户消息
          const lastUserMessage = this.messages
            .filter(msg => msg.type === 'user')
            .pop()
          
          if (!lastUserMessage) {
            console.log('没有找到用户消息')
            return
          }
          
          // 构建包含当前时间的消息
          const currentTime = new Date().toLocaleTimeString()
          const enhancedMessage = `当前时间：${currentTime}\n\n${lastUserMessage.content}`
          
          // 调用任务分析API进行更新
          const response = await taskAgentApiService.analyzeTasks(
            enhancedMessage, 
            this.pendingTasks
          )
          
          if (response.success) {
            const result = response.data
            console.log('任务更新结果:', result)
            
            // 处理任务更新
            if (result.updatedTasks && result.updatedTasks.length > 0) {
              result.updatedTasks.forEach(updatedTask => {
                const index = this.pendingTasks.findIndex(task => task.id === updatedTask.id)
                if (index !== -1) {
                  this.pendingTasks[index] = { 
                    ...this.pendingTasks[index], 
                    ...updatedTask,
                    content: updatedTask.task
                  }
                }
              })
              console.log('任务已更新:', result.updatedTasks)
            }
            
            // 处理任务删除
            if (result.deletedTasks && result.deletedTasks.length > 0) {
              const deletedTaskIds = result.deletedTasks
              this.pendingTasks = this.pendingTasks.filter(task => 
                !deletedTaskIds.includes(task.id)
              )
              console.log('过时任务已删除:', deletedTaskIds)
              
              // 如果没有任务了，隐藏任务图标
              if (this.pendingTasks.length === 0) {
                this.showTaskIcon = false
              }
            }
            
            // 如果有分析结果，记录到控制台（不显示给用户）
            if (result.analysis) {
              console.log('任务更新分析:', result.analysis)
            }
          } else {
            console.error('任务更新失败:', response.error)
          }
        } catch (error) {
          console.error('更新任务时出错:', error)
        }
      },
      
      // 持续任务监控和更新
      async continuousTaskUpdate() {
        try {
          console.log('开始持续任务监控...')
          this.isTaskUpdating = true
          
          // 获取最近的对话历史（最近10条消息，确保有足够上下文）
          const recentMessages = this.messages.slice(-10)
          const conversationContext = recentMessages
            .map(msg => `${msg.type === 'user' ? '用户' : 'AI'}: ${msg.content}`)
            .join('\n')
          
          // 构建包含当前时间和对话上下文的完整消息
          const currentTime = new Date().toLocaleTimeString()
          const enhancedMessage = `当前时间：${currentTime}\n\n对话上下文：\n${conversationContext}\n\n请基于当前对话和情况，主动识别并更新所有相关任务状态。注意：即使没有明确提及任务，也要根据对话中的信息变化主动更新相关任务。`
          
          // 调用任务分析API进行持续更新
          const response = await taskAgentApiService.analyzeTasks(
            enhancedMessage, 
            this.pendingTasks
          )
          
          if (response.success) {
            const result = response.data
            console.log('持续任务更新结果:', result)
            
            let hasChanges = false
            
            // 处理任务更新
            if (result.updatedTasks && result.updatedTasks.length > 0) {
              result.updatedTasks.forEach(updatedTask => {
                const index = this.pendingTasks.findIndex(task => task.id === updatedTask.id)
                if (index !== -1) {
                  this.pendingTasks[index] = { 
                    ...this.pendingTasks[index], 
                    ...updatedTask,
                    content: updatedTask.task
                  }
                  hasChanges = true
                }
              })
              console.log('任务已更新:', result.updatedTasks)
            }
            
            // 处理任务删除
            if (result.deletedTasks && result.deletedTasks.length > 0) {
              const deletedTaskIds = result.deletedTasks
              this.pendingTasks = this.pendingTasks.filter(task => 
                !deletedTaskIds.includes(task.id)
              )
              hasChanges = true
              console.log('过时任务已删除:', deletedTaskIds)
            }
            
            // 处理新任务
            if (result.newTasks && result.newTasks.length > 0) {
              const newTasks = result.newTasks.map((task, index) => ({
                id: Date.now() + index,
                content: task.task,
                task: task.task,
                importance: task.importance || 'medium',
                urgency: task.urgency || 'medium',
                reason: task.reason || '',
                quadrant: task.quadrant || 'not-important-not-urgent'
              }))
              
              this.pendingTasks = [...this.pendingTasks, ...newTasks]
              hasChanges = true
              console.log('新任务已添加:', newTasks)
            }
            
            // 如果有变化，更新UI
            if (hasChanges) {
              // 如果没有任务了，隐藏任务图标
              if (this.pendingTasks.length === 0) {
                this.showTaskIcon = false
              } else {
                this.showTaskIcon = true
              }
              
                          // 如果有分析结果，记录到控制台（不显示给用户）
            if (result.analysis) {
              console.log('持续任务更新分析:', result.analysis)
            }
            }
          } else {
            console.error('持续任务更新失败:', response.error)
          }
        } catch (error) {
          console.error('持续任务监控时出错:', error)
        } finally {
          this.isTaskUpdating = false
        }
      },
      
      // 启动定期任务监控
      startTaskMonitoring() {
        // 每2分钟检查一次任务状态
        this.taskMonitoringTimer = setInterval(async () => {
          if (this.pendingTasks.length > 0) {
            console.log('定期任务监控检查...')
            await this.continuousTaskUpdate()
          }
        }, 2 * 60 * 1000) // 2分钟
      },
    
    // 关闭任务四象限对话框
    closeTaskQuadrantDialog() {
      this.isTaskDialogCollapsed = false
      
      // 如果有任务，显示图标
      if (this.pendingTasks.length > 0) {
        this.showTaskIcon = true
      }
    },
    

    

    
    // 添加任务
    addTask(taskData) {
      this.pendingTasks.push(taskData)
      this.savePendingTasks()
      
      // 显示任务图标
      this.showTaskIcon = true
    },
    
    // 更新任务
    updateTask(taskData) {
      const index = this.pendingTasks.findIndex(task => task.id === taskData.id)
      if (index !== -1) {
        this.pendingTasks[index] = taskData
        this.savePendingTasks()
      }
    },
    
    // 删除任务
    deleteTask(taskId) {
      this.pendingTasks = this.pendingTasks.filter(task => task.id !== taskId)
      
      // 如果没有任务了，隐藏图标
      if (this.pendingTasks.length === 0) {
        this.showTaskIcon = false
      }
    },
    
    // 清空所有任务数据
    clearAllTasks() {
      // 显示确认对话框
      if (!confirm('确定要清空所有任务数据吗？此操作不可撤销，所有任务将被永久删除。')) {
        return
      }
      try {
        console.log('开始清空所有任务数据...')
        
        // 先检查当前数据状态
        const dataStatus = this.checkTaskDataStatus()
        console.log('清空前数据状态:', dataStatus)
        
        // 清空任务列表
        this.pendingTasks = []
        
        // 清空任务历史
        this.taskHistory = []
        
        // 清空本地存储 - 彻底删除所有任务相关数据
        localStorage.removeItem(this.pendingTasksKey)
        localStorage.removeItem('task_history')
        localStorage.removeItem('task_quadrant_data')
        localStorage.removeItem('task_analysis_data')
        localStorage.removeItem('task_monitoring_data')
        localStorage.removeItem('task_update_history')
        localStorage.removeItem('task_quadrant_settings')
        
        // 清理所有可能包含任务数据的localStorage键
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('task') || key.includes('Task') || key.includes('pending'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // 隐藏任务图标
        this.showTaskIcon = false
        this.showTaskControlIcon = false
        
        // 关闭对话框
        this.isTaskDialogCollapsed = false
        
        // 停止任务监控定时器
        if (this.taskMonitoringTimer) {
          clearInterval(this.taskMonitoringTimer)
          this.taskMonitoringTimer = null
        }
        
        console.log('所有任务数据已彻底清空')
        
        // 验证数据是否真的被清空
        const remainingTaskData = localStorage.getItem(this.pendingTasksKey)
        if (remainingTaskData) {
          console.warn('仍有任务数据残留，尝试强制清除...')
          localStorage.removeItem(this.pendingTasksKey)
        }
        
        // 清空后再次检查状态
        const afterDataStatus = this.checkTaskDataStatus()
        console.log('清空后数据状态:', afterDataStatus)
        
        // 添加清空确认消息到对话历史
        const clearMessage = afterDataStatus.hasPendingTasks || afterDataStatus.hasTaskHistory || afterDataStatus.hasTaskQuadrantData
          ? '⚠️ 任务数据已清空，但仍有部分数据残留，请刷新页面'
          : '✅ 所有任务数据已彻底清空，本地存储已完全清理'
        
        this.messages.push({
          id: Date.now(),
          type: 'ai',
          content: clearMessage,
          timestamp: new Date().toLocaleTimeString()
        })
        
        // 保存对话历史
        this.saveChatHistory()
        
              } catch (error) {
          console.error('清空任务数据时出错:', error)
        }
      },
      
      // 滚动到顶部
      scrollToTop() {
        const container = document.querySelector('.quadrant-container')
        if (container) {
          container.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      },
      
      // 检查任务数据状态
      checkTaskDataStatus() {
        const pendingTasks = localStorage.getItem(this.pendingTasksKey)
        const taskHistory = localStorage.getItem('task_history')
        const taskQuadrantData = localStorage.getItem('task_quadrant_data')
        
        console.log('任务数据状态检查:')
        console.log('- pendingTasks:', pendingTasks ? '存在' : '不存在')
        console.log('- taskHistory:', taskHistory ? '存在' : '不存在')
        console.log('- taskQuadrantData:', taskQuadrantData ? '存在' : '不存在')
        
        return {
          hasPendingTasks: !!pendingTasks,
          hasTaskHistory: !!taskHistory,
          hasTaskQuadrantData: !!taskQuadrantData
        }
      },
    
    // 保存任务分类
    saveTaskQuadrant() {
      // 将分类结果添加到对话历史
      const quadrants = {
        'important-urgent': '重要且紧急',
        'important-not-urgent': '重要不紧急',
        'urgent-not-important': '紧急不重要',
        'not-important-not-urgent': '不重要不紧急'
      }
      
      let taskSummary = '任务分类结果：\n'
      Object.keys(quadrants).forEach(quadrant => {
        const tasks = this.getTasksByQuadrant(quadrant)
        if (tasks.length > 0) {
          taskSummary += `\n${quadrants[quadrant]}：\n`
          tasks.forEach(task => {
            taskSummary += `• ${task.content}\n`
          })
        }
      })
      
      const taskMessage = {
        type: 'task',
        content: taskSummary,
        time: this.getCurrentTime()
      }
      this.messages.push(taskMessage)
      
      // 保存对话历史
      this.saveChatHistory()
      
      // 清除已保存的任务
      this.pendingTasks = []
      
      // 关闭对话框
      this.closeTaskQuadrantDialog()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    

    
    // 显示任务四象限对话框
    openTaskQuadrantDialog() {
      // 直接显示任务四象限对话框，即使没有任务也可以显示
      this.isTaskDialogCollapsed = true
    },
    
    // 切换任务对话框显示状态
    // 切换任务对话框
    async toggleTaskDialog() {
      this.isTaskDialogCollapsed = !this.isTaskDialogCollapsed
      
      // 如果打开对话框，先更新任务状态
      if (this.isTaskDialogCollapsed) {
        await this.continuousTaskUpdate()
      }
    },
    
    // 显示指定的历史消息组
    showHistoryMessageGroup(groupId) {
      const group = this.autoMessageHistory.find(g => g.id === groupId)
      if (group) {
        this.pendingAutoMessages = [...group.messages]
        this.showAutoMessageDialog = true
      }
    },
    
    // 清除历史消息
    clearHistoryMessages() {
      this.lastAutoMessages = []
      this.showHistoryIcon = false
    },
    
    // 保存自动消息历史到localStorage
    saveAutoMessageHistory() {
      try {
        localStorage.setItem('auto_message_history', JSON.stringify(this.autoMessageHistory))
        console.log('自动消息历史已保存到localStorage')
      } catch (error) {
        console.error('保存自动消息历史失败:', error)
      }
    },
    
    // 从localStorage加载自动消息历史
    loadAutoMessageHistory() {
      try {
        const savedHistory = localStorage.getItem('auto_message_history')
        if (savedHistory) {
          this.autoMessageHistory = JSON.parse(savedHistory)
          console.log('自动消息历史已从localStorage加载')
        }
      } catch (error) {
        console.error('加载自动消息历史失败:', error)
      }
    },
    
    // 保存pendingTasks到localStorage（仅在对话AI返回新任务时调用）
    savePendingTasks() {
      try {
        if (this.pendingTasks.length > 0) {
          localStorage.setItem(this.pendingTasksKey, JSON.stringify(this.pendingTasks))
          console.log('任务已保存到localStorage')
        }
        
        // 同时保存任务管理数据
        this.saveTaskManagerData()
      } catch (error) {
        console.error('保存任务失败:', error)
      }
    },
    
    // 从localStorage加载pendingTasks
    loadPendingTasks() {
      try {
        const savedTasks = localStorage.getItem(this.pendingTasksKey)
        if (savedTasks) {
          this.pendingTasks = JSON.parse(savedTasks)
          if (this.pendingTasks.length > 0) {
            this.showTaskIcon = true
            console.log('待分类任务已从localStorage加载')
          }
        }
      } catch (error) {
        console.error('加载待分类任务失败:', error)
      }
    },
    
    // 删除单条自动消息
    deleteAutoMessage(messageIndex) {
      this.pendingAutoMessages.splice(messageIndex, 1)
      this.savePendingAutoMessages()
      
      // 如果没有消息了，隐藏图标
      if (this.pendingAutoMessages.length === 0) {
        this.showHistoryIcon = false
      }
    },
    
    // 删除历史消息组
    deleteHistoryMessageGroup(groupId) {
      this.autoMessageHistory = this.autoMessageHistory.filter(group => group.id !== groupId)
      this.saveAutoMessageHistory()
      
      // 如果没有历史消息了，隐藏图标
      if (this.autoMessageHistory.length === 0) {
        this.showHistoryIcon = false
        this.lastAutoMessages = []
      }
    },
    
    // 任务管理核心方法
    
    // 1. 任务去重机制
    deduplicateTasks(newTasks, existingTasks = this.pendingTasks) {
      if (!this.taskManager.deduplication.enabled) {
        return { uniqueTasks: newTasks, duplicates: [] }
      }
      
      const uniqueTasks = []
      const duplicates = []
      
      newTasks.forEach(newTask => {
        let isDuplicate = false
        let duplicateReason = ''
        
        // 检查与现有任务的重复
        for (const existingTask of existingTasks) {
          const similarity = this.calculateTaskSimilarity(newTask, existingTask)
          
          if (similarity >= this.taskManager.deduplication.similarityThreshold) {
            isDuplicate = true
            duplicateReason = `与现有任务"${existingTask.content}"相似度: ${(similarity * 100).toFixed(1)}%`
            break
          }
        }
        
        // 检查与新任务列表中的重复
        for (const uniqueTask of uniqueTasks) {
          const similarity = this.calculateTaskSimilarity(newTask, uniqueTask)
          
          if (similarity >= this.taskManager.deduplication.similarityThreshold) {
            isDuplicate = true
            duplicateReason = `与待添加任务"${uniqueTask.content}"相似度: ${(similarity * 100).toFixed(1)}%`
            break
          }
        }
        
        if (isDuplicate) {
          duplicates.push({
            task: newTask,
            reason: duplicateReason
          })
        } else {
          uniqueTasks.push(newTask)
        }
      })
      
      return { uniqueTasks, duplicates }
    },
    
    // 计算任务相似度
    calculateTaskSimilarity(task1, task2) {
      const fields = this.taskManager.deduplication.checkFields
      let totalSimilarity = 0
      let fieldCount = 0
      
      fields.forEach(field => {
        const value1 = task1[field] || ''
        const value2 = task2[field] || ''
        
        if (value1 && value2) {
          const similarity = this.calculateStringSimilarity(value1, value2)
          totalSimilarity += similarity
          fieldCount++
        }
      })
      
      return fieldCount > 0 ? totalSimilarity / fieldCount : 0
    },
    
    // 计算字符串相似度 (使用编辑距离)
    calculateStringSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
      
      if (longer.length === 0) return 1.0
      
      const editDistance = this.calculateEditDistance(longer, shorter)
      return (longer.length - editDistance) / longer.length
    },
    
    // 计算编辑距离
    calculateEditDistance(str1, str2) {
      const matrix = []
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }
      
      return matrix[str2.length][str1.length]
    },
    
    // 2. 任务增删改查操作
    addTask(taskData) {
      const task = {
        id: Date.now() + Math.random(),
        content: taskData.task,
        task: taskData.task,
        importance: taskData.importance || 'medium',
        urgency: taskData.urgency || 'medium',
        reason: taskData.reason || '',
        quadrant: taskData.quadrant || 'not-important-not-urgent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        priority: this.calculatePriority(taskData.importance, taskData.urgency)
      }
      
      // 去重检查
      const { uniqueTasks, duplicates } = this.deduplicateTasks([task])
      
      if (uniqueTasks.length > 0) {
        this.pendingTasks.push(...uniqueTasks)
        this.updateTaskStatistics()
        this.logTaskOperation('add', task)
        
        if (duplicates.length > 0) {
          this.duplicateTasks = duplicates
          console.log('检测到重复任务:', duplicates)
        }
        
        return { success: true, task: uniqueTasks[0], duplicates }
      } else {
        return { success: false, duplicates }
      }
    },
    
    updateTask(taskId, updates) {
      const taskIndex = this.pendingTasks.findIndex(task => task.id === taskId)
      
      if (taskIndex !== -1) {
        const originalTask = { ...this.pendingTasks[taskIndex] }
        
        this.pendingTasks[taskIndex] = {
          ...this.pendingTasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        
        // 重新计算优先级
        if (updates.importance || updates.urgency) {
          this.pendingTasks[taskIndex].priority = this.calculatePriority(
            this.pendingTasks[taskIndex].importance,
            this.pendingTasks[taskIndex].urgency
          )
        }
        
        this.updateTaskStatistics()
        this.logTaskOperation('update', this.pendingTasks[taskIndex], originalTask)
        
        return { success: true, task: this.pendingTasks[taskIndex] }
      }
      
      return { success: false, error: '任务不存在' }
    },
    
    deleteTask(taskId) {
      const taskIndex = this.pendingTasks.findIndex(task => task.id === taskId)
      
      if (taskIndex !== -1) {
        const deletedTask = this.pendingTasks[taskIndex]
        this.pendingTasks.splice(taskIndex, 1)
        
        this.updateTaskStatistics()
        this.logTaskOperation('delete', deletedTask)
        
        // 如果没有任务了，隐藏图标
        if (this.pendingTasks.length === 0) {
          this.showTaskIcon = false
        }
        
        return { success: true, task: deletedTask }
      }
      
      return { success: false, error: '任务不存在' }
    },
    
    getTask(taskId) {
      return this.pendingTasks.find(task => task.id === taskId)
    },
    
    // 3. 任务筛选和排序
    getFilteredAndSortedTasks() {
      let filteredTasks = [...this.pendingTasks]
      
      // 应用筛选
      if (this.taskFilters.quadrant !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.quadrant === this.taskFilters.quadrant)
      }
      
      if (this.taskFilters.priority !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === this.taskFilters.priority)
      }
      
      if (this.taskFilters.status !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === this.taskFilters.status)
      }
      
      if (this.taskFilters.searchText) {
        const searchText = this.taskFilters.searchText.toLowerCase()
        filteredTasks = filteredTasks.filter(task => 
          task.content.toLowerCase().includes(searchText) ||
          task.reason.toLowerCase().includes(searchText)
        )
      }
      
      // 应用排序
      filteredTasks.sort((a, b) => {
        switch (this.taskSortBy) {
          case 'importance':
            return this.getPriorityWeight(b.importance) - this.getPriorityWeight(a.importance)
          case 'urgency':
            return this.getPriorityWeight(b.urgency) - this.getPriorityWeight(a.urgency)
          case 'createdAt':
            return new Date(b.createdAt) - new Date(a.createdAt)
          case 'updatedAt':
            return new Date(b.updatedAt) - new Date(a.updatedAt)
          default:
            return 0
        }
      })
      
      return filteredTasks
    },
    
    // 4. 任务统计和优先级计算
    updateTaskStatistics() {
      const now = new Date()
      
      this.taskManager.statistics = {
        totalTasks: this.pendingTasks.length,
        completedTasks: this.pendingTasks.filter(task => task.status === 'completed').length,
        overdueTasks: this.pendingTasks.filter(task => {
          if (task.dueDate) {
            return new Date(task.dueDate) < now && task.status !== 'completed'
          }
          return false
        }).length,
        highPriorityTasks: this.pendingTasks.filter(task => 
          task.importance === 'high' || task.urgency === 'high'
        ).length
      }
    },
    
    calculatePriority(importance, urgency) {
      const importanceWeight = this.getPriorityWeight(importance)
      const urgencyWeight = this.getPriorityWeight(urgency)
      return importanceWeight + urgencyWeight
    },
    
    getPriorityWeight(level) {
      switch (level) {
        case 'high': return 3
        case 'medium': return 2
        case 'low': return 1
        default: return 1
      }
    },
    
    // 5. 任务操作日志
    logTaskOperation(operation, task, originalTask = null) {
      const logEntry = {
        id: Date.now(),
        operation,
        taskId: task.id,
        taskContent: task.content,
        timestamp: new Date().toISOString(),
        originalTask: originalTask ? { content: originalTask.content, quadrant: originalTask.quadrant } : null
      }
      
      this.taskManager.operationHistory.push(logEntry)
      
      // 限制历史记录数量
      if (this.taskManager.operationHistory.length > 100) {
        this.taskManager.operationHistory = this.taskManager.operationHistory.slice(-50)
      }
      
      console.log(`任务操作: ${operation}`, logEntry)
    },
    
    // 6. 任务备份和恢复
    createTaskBackup() {
      const backup = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        tasks: JSON.parse(JSON.stringify(this.pendingTasks)),
        statistics: { ...this.taskManager.statistics },
        description: `任务备份 - ${new Date().toLocaleString()}`
      }
      
      this.taskBackups.push(backup)
      
      // 限制备份数量
      if (this.taskBackups.length > 10) {
        this.taskBackups = this.taskBackups.slice(-5)
      }
      
      this.saveTaskBackups()
      return backup
    },
    
    restoreTaskBackup(backupId) {
      const backup = this.taskBackups.find(b => b.id === backupId)
      
      if (backup) {
        this.pendingTasks = JSON.parse(JSON.stringify(backup.tasks))
        this.updateTaskStatistics()
        
        console.log('任务备份已恢复:', backup.description)
        return { success: true, backup }
      }
      
      return { success: false, error: '备份不存在' }
    },
    
    // 7. 任务导入导出
    exportTasks() {
      const exportData = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        tasks: this.pendingTasks,
        statistics: this.taskManager.statistics,
        filters: this.taskFilters,
        sortBy: this.taskSortBy
      }
      
      this.taskExportData = exportData
      return exportData
    },
    
    importTasks(importData) {
      try {
        if (importData.version && importData.tasks) {
          // 去重检查
          const { uniqueTasks, duplicates } = this.deduplicateTasks(importData.tasks)
          
          if (uniqueTasks.length > 0) {
            this.pendingTasks.push(...uniqueTasks)
            this.updateTaskStatistics()
            
            console.log(`导入成功: ${uniqueTasks.length} 个任务`)
            if (duplicates.length > 0) {
              console.log(`跳过重复任务: ${duplicates.length} 个`)
            }
            
            return { success: true, imported: uniqueTasks.length, duplicates: duplicates.length }
          }
        }
        
        return { success: false, error: '无效的导入数据' }
      } catch (error) {
        console.error('导入任务失败:', error)
        return { success: false, error: error.message }
      }
    },
    
    // 8. 保存和加载方法
    saveTaskBackups() {
      try {
        localStorage.setItem('task_backups', JSON.stringify(this.taskBackups))
      } catch (error) {
        console.error('保存任务备份失败:', error)
      }
    },
    
    loadTaskBackups() {
      try {
        const savedBackups = localStorage.getItem('task_backups')
        if (savedBackups) {
          this.taskBackups = JSON.parse(savedBackups)
        }
      } catch (error) {
        console.error('加载任务备份失败:', error)
      }
    },
    
    saveTaskManagerData() {
      try {
        const managerData = {
          deduplication: this.taskManager.deduplication,
          statistics: this.taskManager.statistics,
          filters: this.taskFilters,
          sortBy: this.taskSortBy
        }
        localStorage.setItem('task_manager_data', JSON.stringify(managerData))
      } catch (error) {
        console.error('保存任务管理数据失败:', error)
      }
    },
    
    loadTaskManagerData() {
      try {
        const savedData = localStorage.getItem('task_manager_data')
        if (savedData) {
          const data = JSON.parse(savedData)
          this.taskManager.deduplication = { ...this.taskManager.deduplication, ...data.deduplication }
          this.taskManager.statistics = { ...this.taskManager.statistics, ...data.statistics }
          this.taskFilters = { ...this.taskFilters, ...data.filters }
          this.taskSortBy = data.sortBy || this.taskSortBy
        }
      } catch (error) {
        console.error('加载任务管理数据失败:', error)
      }
    },
  }
}
</script>

<style scoped>
.metadata-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.info-item label {
  font-weight: 600;
  color: #333;
  min-width: 120px;
  margin-right: 16px;
}

.info-item span {
  color: #555;
  line-height: 1.6;
  flex: 1;
}

.identity-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.identity-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.identity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.identity-header h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  text-transform: capitalize;
}

.type-badge {
  background: #007AFF;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.identity-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.identity-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.identity-info .info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0;
}

.identity-info .info-item label {
  font-weight: 600;
  color: #333;
  min-width: 100px;
  margin-right: 12px;
  flex-shrink: 0;
}

.identity-info .info-item span {
  color: #555;
  line-height: 1.6;
  flex: 1;
  word-break: break-word;
  white-space: pre-wrap;
  max-width: 100%;
  overflow-wrap: break-word;
}

@media (max-width: 768px) {
  .metadata-view {
    padding: 16px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .identity-cards {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
  }
  
  .info-item label {
    margin-bottom: 8px;
  }
}

/* 对话图标样式 */
.chat-icon {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.chat-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.chat-icon svg {
  color: white;
}

/* 清空对话按钮样式 */
.clear-chat-btn {
  position: fixed;
  bottom: 140px;
  right: 30px;
  width: 40px;
  height: 40px;
  background: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  transition: all 0.3s ease;
}

.clear-chat-btn:hover {
  background: #ff3742;
  transform: scale(1.05);
}

.clear-chat-btn svg {
  color: white;
}

/* 任务四象限控制图标样式 */
.task-control-icon {
  position: fixed;
  bottom: 220px;
  right: 30px;
  width: 40px;
  height: 40px;
  background: #17a2b8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
  transition: all 0.3s ease;
}

.task-control-icon.collapsed {
  background: #6c757d;
}

.task-control-icon:hover {
  background: #138496;
  transform: scale(1.05);
}

.task-control-icon svg {
  color: white;
}

.task-control-icon.updating {
  background: #007bff;
  color: white;
}

.update-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
}

.spinner {
  width: 8px;
  height: 8px;
  border: 1px solid #ffffff;
  border-top: 1px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.task-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
}



.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover {
  background: #218838;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.empty-state svg {
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 对话输入框样式 */
.chat-input-container {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 500px;
  z-index: 1001;
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  transition: border-radius 0.3s ease;
}

.chat-input-wrapper.has-messages {
  border-radius: 0 0 25px 25px;
}

.chat-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 16px;
  font-size: 16px;
  background: transparent;
}

.chat-input::placeholder {
  color: #999;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover {
  background: #0056CC;
  transform: scale(1.05);
}

.send-btn svg {
  color: white;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-loading {
  display: flex;
  gap: 2px;
  align-items: center;
}

.send-dot {
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: send-loading-bounce 1.2s infinite ease-in-out both;
}

.send-dot:nth-child(1) {
  animation-delay: -0.24s;
}

.send-dot:nth-child(2) {
  animation-delay: -0.12s;
}

.send-dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes send-loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 消息列表样式 */
.messages-container {
  position: fixed;
  bottom: 78px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 500px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px 12px 0 0;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.message.user {
  align-items: flex-end;
}

.message.ai {
  align-items: flex-start;
}



.message-content {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message.user .message-content {
  background: linear-gradient(135deg, #007AFF, #0056CC);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}

.message.ai .message-content {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.message.scene .message-content {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.message.auto .message-content {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
  color: white;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
}

/* 自动消息确认对话框样式 */
.auto-message-dialog-overlay {
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
}

.auto-message-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-data-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-data-btn:hover {
  background: #c82333;
}

.clear-data-btn svg {
  width: 16px;
  height: 16px;
}

.scroll-top-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-top-btn:hover {
  background: #138496;
}

.scroll-top-btn svg {
  width: 16px;
  height: 16px;
}

.task-stats {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: #666;
}

.stat-item {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.task-manage-btn {
  background: #6f42c1;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-manage-btn:hover {
  background: #5a32a3;
}

.task-manage-btn svg {
  width: 16px;
  height: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
}

.dialog-content {
  padding: 12px;
  overflow-y: auto;
}

.dialog-description {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background: #f8f9fa;
  transition: border-color 0.2s;
}

.message-item:hover {
  border-color: #007AFF;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  margin: 0;
}

.message-checkbox {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: #007AFF;
}

.message-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.delete-message-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: 8px;
  flex-shrink: 0;
}

.delete-message-btn:hover {
  background: #ffebee;
}

.delete-message-btn svg {
  color: #dc3545;
  width: 12px;
  height: 12px;
}



.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  padding: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

.message.ai .message-time {
  text-align: left;
}

/* 消息内容格式化样式 */
.message-content strong {
  font-weight: 600;
}

.message-content em {
  font-style: italic;
}

.message-content .list-item {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.message-content .code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  overflow-x: auto;
}

.message-content .inline-code {
  background: #f1f3f4;
  border-radius: 3px;
  padding: 2px 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.message-content .quote {
  border-left: 3px solid #007AFF;
  padding-left: 12px;
  margin: 8px 0;
  font-style: italic;
  color: #666;
}

/* Loading效果样式 */
.loading-message {
  opacity: 0.8;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f0f0;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #666;
  border-radius: 50%;
  animation: loading-bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 14px;
  color: #666;
  font-style: italic;
}



/* 响应式调整 */
@media (max-width: 768px) {
  .chat-input-container {
    width: 95%;
  }
  
  .messages-container {
    width: 95%;
    max-height: 250px;
  }
  
  .chat-icon {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
}
</style> 