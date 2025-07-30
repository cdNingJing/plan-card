<template>
  <div class="group-chat-view">
    <!-- 左侧区域：任务汇总 + 群聊消息 -->
    <div class="left-panel">
      <!-- 任务汇总列表 -->
      <div class="task-summary">
        <div class="task-header">
          <h2>任务汇总</h2>
          <div class="task-stats">
            <span>{{ taskList.length }} 个任务</span>
            <span>{{ completedTasksCount }} 已完成</span>
          </div>
        </div>
        
        <div class="task-list" ref="taskListContainer">
          <!-- 第一象限：重要且紧急 -->
          <div class="quadrant-section">
            <div class="quadrant-title">第一象限：重要且紧急</div>
            <div 
              v-for="task in getQuadrantTasks(1)" 
              :key="task.id"
              :class="['task-item', { completed: task.completed }]"
            >
              <div class="task-checkbox">
                <input 
                  type="checkbox" 
                  :checked="task.completed"
                  @change="toggleTask(task)"
                />
              </div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-description">{{ task.description }}</div>
                <div class="task-meta">
                  <span class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</span>
                  <span class="task-urgency" :class="task.urgency">{{ getUrgencyText(task.urgency) }}</span>
                  <span class="task-deadline">{{ formatDate(task.deadline) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 第二象限：重要不紧急 -->
          <div class="quadrant-section">
            <div class="quadrant-title">第二象限：重要不紧急</div>
            <div 
              v-for="task in getQuadrantTasks(2)" 
              :key="task.id"
              :class="['task-item', { completed: task.completed }]"
            >
              <div class="task-checkbox">
                <input 
                  type="checkbox" 
                  :checked="task.completed"
                  @change="toggleTask(task)"
                />
              </div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-description">{{ task.description }}</div>
                <div class="task-meta">
                  <span class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</span>
                  <span class="task-urgency" :class="task.urgency">{{ getUrgencyText(task.urgency) }}</span>
                  <span class="task-deadline">{{ formatDate(task.deadline) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 第三象限：紧急不重要 -->
          <div class="quadrant-section">
            <div class="quadrant-title">第三象限：紧急不重要</div>
            <div 
              v-for="task in getQuadrantTasks(3)" 
              :key="task.id"
              :class="['task-item', { completed: task.completed }]"
            >
              <div class="task-checkbox">
                <input 
                  type="checkbox" 
                  :checked="task.completed"
                  @change="toggleTask(task)"
                />
              </div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-description">{{ task.description }}</div>
                <div class="task-meta">
                  <span class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</span>
                  <span class="task-urgency" :class="task.urgency">{{ getUrgencyText(task.urgency) }}</span>
                  <span class="task-deadline">{{ formatDate(task.deadline) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 第四象限：不重要不紧急 -->
          <div class="quadrant-section">
            <div class="quadrant-title">第四象限：不重要不紧急</div>
            <div 
              v-for="task in getQuadrantTasks(4)" 
              :key="task.id"
              :class="['task-item', { completed: task.completed }]"
            >
              <div class="task-checkbox">
                <input 
                  type="checkbox" 
                  :checked="task.completed"
                  @change="toggleTask(task)"
                />
              </div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-description">{{ task.description }}</div>
                <div class="task-meta">
                  <span class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</span>
                  <span class="task-urgency" :class="task.urgency">{{ getUrgencyText(task.urgency) }}</span>
                  <span class="task-deadline">{{ formatDate(task.deadline) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 群聊消息区域 -->
      <div class="chat-area">
        <div class="chat-header">
          <h2>群聊消息</h2>
          <div class="chat-stats">
            <span>{{ messages.length }} 条消息</span>
            <span>{{ onlineMembersCount }} 人在线</span>
          </div>
        </div>
        
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['message', message.type]"
          >
            <div class="message-avatar">
              <User class="avatar-icon" />
            </div>
            <div class="message-content">
              <div class="message-sender">{{ message.sender }}</div>
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.time) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧九宫格成员输入区域 -->
    <div class="right-panel">
      <div class="members-header">
        <h2>群成员</h2>
        <div class="members-actions">
          <button class="add-member-btn" @click="addNewMember">
            <Plus class="add-icon" />
            添加成员
          </button>
        </div>
      </div>
      
      <div class="members-grid-container">
        <div class="members-grid">
          <div 
            v-for="member in members" 
            :key="member.id"
            class="member-cell"
            :class="{ active: selectedMember && selectedMember.id === member.id }"
            @click="selectMember(member)"
          >
            <div class="member-header">
              <User class="avatar-icon" />
              <div class="member-info">
                <div class="member-name">
                  {{ member.name }}
                  <span v-if="member.id <= 3" class="default-badge">默认</span>
                </div>
              </div>
              <div class="member-actions">
                <button class="settings-member-btn" @click.stop="openSettings(member)">
                  <Settings class="settings-icon" />
                </button>
                <button 
                  v-if="member.id > 3" 
                  class="delete-member-btn" 
                  @click.stop="deleteMember(member)"
                >
                  <Trash2 class="delete-icon" />
                </button>
              </div>
            </div>
            

            
            <div class="member-input-area">
              <textarea
                v-model="member.inputMessage"
                :placeholder="`${member.name} 说点什么...`"
                class="member-input"
                @keyup.enter.ctrl="sendMemberMessage(member)"
                @focus="selectMember(member)"
              ></textarea>
              <button 
                class="send-member-btn"
                @click="sendMemberMessage(member)"
                :disabled="!member.inputMessage.trim()"
              >
                <Send class="send-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="settings-overlay">
      <div class="settings-dialog" @click.stop>
        <div class="settings-header">
          <h3>成员设置</h3>
          <button class="close-settings-btn" @click="closeSettings">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="settings-content">
          <div class="setting-item">
            <label>成员姓名：</label>
            <input 
              v-model="editingMember.name" 
              type="text" 
              class="setting-input"
              placeholder="请输入成员姓名"
              :disabled="editingMember && editingMember.id <= 3"
            />
            <div v-if="editingMember && editingMember.id <= 3" class="setting-hint">
              默认成员姓名不可修改
            </div>
          </div>
          
          <div class="setting-item">
            <label>个人信息：</label>
            <textarea 
              v-model="editingMember.personalInfo" 
              class="setting-textarea"
              placeholder="请输入个人信息..."
              rows="6"
            ></textarea>
          </div>
        </div>
        
        <div class="settings-actions">
          <button class="cancel-btn" @click="closeSettings">取消</button>
          <button class="save-btn" @click="saveSettings">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { User, Settings, Trash2, X, Plus, Send } from 'lucide-vue-next'

export default {
  name: 'GroupChatView',
  components: {
    User,
    Settings,
    Trash2,
    X,
    Plus,
    Send
  },
  data() {
    return {
      selectedMember: null,
      taskList: [
        {
          id: 1,
          title: '完成项目文档',
          description: '编写项目技术文档和用户手册',
          priority: 'high',
          urgency: 'high',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天后
          completed: false
        },
        {
          id: 2,
          title: '代码审查',
          description: '审查团队提交的代码，确保质量',
          priority: 'medium',
          urgency: 'high',
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1天后
          completed: true
        },
        {
          id: 3,
          title: '技术分享会',
          description: '准备下周的技术分享内容',
          priority: 'low',
          urgency: 'low',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
          completed: false
        },
        {
          id: 4,
          title: '性能优化',
          description: '优化系统性能，提升用户体验',
          priority: 'high',
          urgency: 'medium',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
          completed: false
        },
        {
          id: 5,
          title: '单元测试',
          description: '为新功能编写单元测试',
          priority: 'medium',
          urgency: 'medium',
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1天后
          completed: false
        },
        {
          id: 6,
          title: '学习新技术',
          description: '学习React Hooks和TypeScript',
          priority: 'high',
          urgency: 'low',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天后
          completed: false
        },
        {
          id: 7,
          title: '整理工作台',
          description: '整理桌面和文件归档',
          priority: 'low',
          urgency: 'high',
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1天后
          completed: false
        },
        {
          id: 8,
          title: '阅读技术博客',
          description: '阅读最新的技术文章和博客',
          priority: 'low',
          urgency: 'low',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
          completed: false
        }
      ],
      members: [],
      showSettings: false,
      editingMember: null,
      messages: []
    }
  },
  computed: {
    onlineMembersCount() {
      return this.members.length
    },
    completedTasksCount() {
      return this.taskList.filter(task => task.completed).length
    }
  },
  mounted() {
    this.loadMembers()
    this.loadMessages()
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  },
  updated() {
    this.scrollToBottom()
  },
  methods: {
    selectMember(member) {
      this.selectedMember = member
    },
    
    sendMemberMessage(member) {
      if (!member.inputMessage.trim()) return
      
      const message = {
        id: Date.now(),
        sender: member.name,
        content: member.inputMessage,
        time: new Date(),
        type: 'received'
      }
      
      // 添加到群聊消息
      this.messages.push(message)
      
      member.inputMessage = ''
      
      // 保存消息到本地存储
      this.saveMessages()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    formatTime(time) {
      return new Date(time).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    

    
    toggleTask(task) {
      task.completed = !task.completed
    },
    
    getPriorityText(priority) {
      const priorityMap = {
        'high': '高',
        'medium': '中',
        'low': '低'
      }
      return priorityMap[priority] || priority
    },
    
    getUrgencyText(urgency) {
      const urgencyMap = {
        'high': '紧急',
        'medium': '一般',
        'low': '不紧急'
      }
      return urgencyMap[urgency] || urgency
    },
    
    getQuadrantTasks(quadrant) {
      return this.taskList.filter(task => {
        const isHighPriority = task.priority === 'high'
        const isHighUrgency = task.urgency === 'high'
        
        switch (quadrant) {
          case 1: // 第一象限：重要且紧急
            return isHighPriority && isHighUrgency
          case 2: // 第二象限：重要不紧急
            return isHighPriority && !isHighUrgency
          case 3: // 第三象限：紧急不重要
            return !isHighPriority && isHighUrgency
          case 4: // 第四象限：不重要不紧急
            return !isHighPriority && !isHighUrgency
          default:
            return false
        }
      })
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    addNewMember() {
      // 确保新ID至少为4，避免与默认成员冲突
      const maxId = Math.max(...this.members.map(m => m.id))
      const newId = Math.max(maxId + 1, 4)
      
      const newMember = {
        id: newId,
        name: `新成员${newId}`,
        inputMessage: '',
        personalInfo: ''
      }
      
      this.members.push(newMember)
      this.saveMembers()
    },
    
    deleteMember(member) {
      // 检查是否为默认成员（id为1、2、3的成员不可删除）
      if (member.id <= 3) {
        alert('默认成员不可删除！')
        return
      }
      
      if (confirm(`确定要删除成员 "${member.name}" 吗？`)) {
        const index = this.members.findIndex(m => m.id === member.id)
        if (index !== -1) {
          this.members.splice(index, 1)
          
          // 如果删除的是当前选中的成员，清除选中状态
          if (this.selectedMember && this.selectedMember.id === member.id) {
            this.selectedMember = null
          }
          
          // 保存到本地存储
          this.saveMembers()
        }
      }
    },
    
    openSettings(member) {
      this.editingMember = { ...member }
      this.showSettings = true
    },
    
    closeSettings() {
      this.showSettings = false
      this.editingMember = null
    },
    
    saveSettings() {
      if (this.editingMember && this.editingMember.name.trim()) {
        const index = this.members.findIndex(m => m.id === this.editingMember.id)
        if (index !== -1) {
          // 对于默认成员，只允许修改个人信息，不允许修改姓名
          if (this.editingMember.id <= 3) {
            this.members[index] = { 
              ...this.members[index], 
              personalInfo: this.editingMember.personalInfo 
            }
          } else {
            // 对于非默认成员，允许修改所有信息
            this.members[index] = { ...this.editingMember }
          }
          this.saveMembers()
          this.closeSettings()
        }
      }
    },
    
    // 保存成员信息到本地存储
    saveMembers() {
      try {
        localStorage.setItem('group_chat_members', JSON.stringify(this.members))
        console.log('成员信息已保存到本地存储')
      } catch (error) {
        console.error('保存成员信息失败:', error)
      }
    },
    
    // 从本地存储加载成员信息
    loadMembers() {
      try {
        const savedMembers = localStorage.getItem('group_chat_members')
        if (savedMembers) {
          const loadedMembers = JSON.parse(savedMembers)
          console.log('成员信息已从本地存储加载', loadedMembers)
          
          // 确保默认成员始终存在
          const defaultMembers = [
            { 
              id: 1, 
              name: '产品', 
              inputMessage: '',
              personalInfo: '负责产品规划和需求分析，确保产品功能满足用户需求。'
            },
            { 
              id: 2, 
              name: '设计', 
              inputMessage: '',
              personalInfo: '负责UI/UX设计，创建用户友好的界面和交互体验。'
            },
            { 
              id: 3, 
              name: '项目管理', 
              inputMessage: '',
              personalInfo: '负责项目进度管理，协调团队资源，确保项目按时交付。'
            }
          ]
          
          // 合并默认成员和保存的成员，确保默认成员不被覆盖
          const mergedMembers = [...defaultMembers]
          
          // 添加其他保存的成员（id > 3的成员）
          loadedMembers.forEach(member => {
            if (member.id > 3) {
              mergedMembers.push(member)
            }
          })
          
          this.members = mergedMembers
        } else {
          // 如果没有保存的数据，使用默认的三个成员
          this.members = [
            { 
              id: 1, 
              name: '产品', 
              inputMessage: '',
              personalInfo: '负责产品规划和需求分析，确保产品功能满足用户需求。'
            },
            { 
              id: 2, 
              name: '设计', 
              inputMessage: '',
              personalInfo: '负责UI/UX设计，创建用户友好的界面和交互体验。'
            },
            { 
              id: 3, 
              name: '项目管理', 
              inputMessage: '',
              personalInfo: '负责项目进度管理，协调团队资源，确保项目按时交付。'
            }
          ]
          this.saveMembers()
        }
      } catch (error) {
        console.error('加载成员信息失败:', error)
        // 如果加载失败，使用默认成员
        this.members = [
          { 
            id: 1, 
            name: '产品', 
            inputMessage: '',
            personalInfo: '负责产品规划和需求分析，确保产品功能满足用户需求。'
          },
          { 
            id: 2, 
            name: '设计', 
            inputMessage: '',
            personalInfo: '负责UI/UX设计，创建用户友好的界面和交互体验。'
          },
          { 
            id: 3, 
            name: '项目管理', 
            inputMessage: '',
            personalInfo: '负责项目进度管理，协调团队资源，确保项目按时交付。'
          }
        ]
      }
    },
    
    // 保存消息到本地存储
    saveMessages() {
      try {
        localStorage.setItem('group_chat_messages', JSON.stringify(this.messages))
        console.log('消息已保存到本地存储')
      } catch (error) {
        console.error('保存消息失败:', error)
      }
    },
    
    // 从本地存储加载消息
    loadMessages() {
      try {
        const savedMessages = localStorage.getItem('group_chat_messages')
        if (savedMessages) {
          this.messages = JSON.parse(savedMessages)
          console.log('消息已从本地存储加载')
        }
      } catch (error) {
        console.error('加载消息失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.group-chat-view {
  display: flex;
  height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

/* 左侧面板 */
.left-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  background: transparent;
  margin-right: 16px;
  flex-shrink: 0;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 任务汇总区域 */
.task-summary {
  height: 40%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.task-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.task-stats {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #666;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quadrant-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007AFF;
}

.task-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.task-item:hover {
  border-color: #007AFF;
  background: #f0f8ff;
}

.task-item.completed {
  opacity: 0.6;
  background: #f0f0f0;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #666;
}

.task-checkbox {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.task-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007AFF;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.task-description {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  flex-wrap: wrap;
}

.task-priority {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.task-priority.high {
  background: #ffebee;
  color: #d32f2f;
}

.task-priority.medium {
  background: #fff3e0;
  color: #f57c00;
}

.task-priority.low {
  background: #e8f5e8;
  color: #388e3c;
}

.task-urgency {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.task-urgency.high {
  background: #fff3e0;
  color: #f57c00;
}

.task-urgency.medium {
  background: #e3f2fd;
  color: #1976d2;
}

.task-urgency.low {
  background: #f3e5f5;
  color: #7b1fa2;
}

.task-deadline {
  color: #666;
}

/* 成员管理头部 */
.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.members-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.members-actions {
  display: flex;
  gap: 8px;
}

.add-member-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-member-btn:hover {
  background: #0056CC;
}

.add-icon {
  width: 14px;
  height: 14px;
}

/* 九宫格容器 */
.members-grid-container {
  flex: 1;
  overflow-y: auto;
}

/* 九宫格成员区域 */
.members-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 12px;
  max-height: 100%;
}

.member-cell {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.member-cell:hover {
  border-color: #007AFF;
  background: #f0f8ff;
}

.member-cell.active {
  border-color: #007AFF;
  background: #e6f3ff;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.avatar-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  padding: 6px;
  color: #666;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.default-badge {
  background: #007AFF;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: normal;
}

.delete-member-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-member-btn:hover {
  background: #ff3742;
  transform: scale(1.1);
}

.delete-icon {
  width: 12px;
  height: 12px;
}

.member-actions {
  display: flex;
  gap: 4px;
  position: absolute;
  top: 0;
  right: 0;
}

.settings-member-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: #17a2b8;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.settings-member-btn:hover {
  background: #138496;
  transform: scale(1.1);
}

.settings-icon {
  width: 12px;
  height: 12px;
}

/* 设置弹窗样式 */
.settings-overlay {
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

.settings-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.settings-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-settings-btn {
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

.close-settings-btn:hover {
  background: #e9ecef;
}

.close-icon {
  width: 16px;
  height: 16px;
}

.settings-content {
  padding: 24px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.setting-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.setting-input:focus {
  outline: none;
  border-color: #007AFF;
}

.setting-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.setting-textarea:focus {
  outline: none;
  border-color: #007AFF;
}

.setting-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  font-style: italic;
}

.settings-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.save-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: #007AFF;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: #0056CC;
}



.member-input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.member-input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  resize: none;
  min-height: 60px;
  max-height: 100px;
  background: white;
  transition: border-color 0.3s ease;
}

.member-input:focus {
  outline: none;
  border-color: #007AFF;
}

.send-member-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-member-btn:hover {
  background: #0056CC;
  transform: scale(1.05);
}

.send-member-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  color: white;
  width: 14px;
  height: 14px;
}

/* 群聊区域 */
.chat-area {
  height: 60%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.chat-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chat-stats {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #666;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 85%;
}

.message.received {
  align-self: flex-start;
}

.message.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar .avatar-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e9ecef;
  padding: 4px;
  color: #666;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-sender {
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
}

.message-text {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.4;
  color: #333;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message.sent .message-text {
  background: #007AFF;
  color: white;
}

.message-time {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
  text-align: right;
}

.message.received .message-time {
  text-align: left;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .group-chat-view {
    flex-direction: column;
    padding: 12px;
  }
  
  .left-panel {
    width: 100%;
    height: 50%;
    flex-shrink: 0;
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .right-panel {
    width: 100%;
    height: 50%;
    flex: 1;
    margin-left: 0;
  }
  
  .task-summary {
    height: 40%;
  }
  
  .chat-area {
    height: 60%;
  }
  
  .members-header {
    padding: 12px 16px;
  }
  
  .members-header h2 {
    font-size: 14px;
  }
  
  .add-member-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .members-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .member-cell {
    height: 160px;
    padding: 12px;
  }
  
  .member-cell {
    padding: 12px;
  }
  
  .member-input {
    min-height: 50px;
    font-size: 12px;
  }
  
  .avatar-icon {
    width: 28px;
    height: 28px;
    padding: 4px;
  }
  
  .member-name {
    font-size: 13px;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .chat-header h2 {
    font-size: 16px;
  }
  
  .chat-area {
    max-height: 180px;
  }
  
  .messages-container {
    padding: 10px 16px;
    max-height: 120px;
  }
  
  .message {
    max-width: 90%;
  }
}

@media (max-width: 480px) {
  .group-chat-view {
    padding: 8px;
  }
  
  .task-list {
    padding: 12px 16px;
  }
  
  .task-item {
    padding: 10px;
  }
  
  .task-title {
    font-size: 13px;
  }
  
  .task-description {
    font-size: 11px;
  }
  
  .task-meta {
    font-size: 10px;
  }
  
  .members-header {
    padding: 10px 12px;
  }
  
  .members-header h2 {
    font-size: 13px;
  }
  
  .add-member-btn {
    padding: 5px 8px;
    font-size: 10px;
  }
  
  .members-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .member-cell {
    height: 140px;
    padding: 10px;
  }
  
  .member-cell {
    padding: 10px;
  }
  
  .member-input {
    min-height: 40px;
    font-size: 11px;
  }
  
  .avatar-icon {
    width: 24px;
    height: 24px;
    padding: 3px;
  }
  
  .member-name {
    font-size: 12px;
  }
  
  .chat-area {
    max-height: 150px;
  }
  
  .messages-container {
    padding: 8px 12px;
    max-height: 100px;
  }
}
</style> 