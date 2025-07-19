<template>
  <div class="task-modal-overlay" @click="handleOverlayClick">
    <!-- 权限请求区域 -->
    <div v-if="currentStep === 'permission'" class="permission-container" @click.stop>
      <div class="permission-section">
        <div class="permission-header">
          <div class="avatar-group">
            <div class="avatar avatar-1">🐶</div>
            <div class="avatar avatar-2">👤</div>
            <div class="avatar avatar-3">MC</div>
          </div>
          <div class="permission-info">
            <h3 class="permission-title">Access permission</h3>
            <p class="permission-desc">Allow permission to access contacts</p>
          </div>
        </div>
        <button class="allow-btn" @click="handleAllowAccess">
          Allow access
        </button>
      </div>
      
      <!-- 取消按钮 -->
      <button class="cancel-btn" @click="handleCancel">
        Cancel
      </button>
    </div>

    <!-- 联系人选择页面 -->
    <div v-if="currentStep === 'contacts'" class="contacts-container" @click.stop>
      <div class="contacts-modal">
        <div class="contacts-list">
          <div 
            v-for="contact in contacts" 
            :key="contact.id"
            class="contact-item"
            @click="selectContact(contact)"
          >
            <div class="contact-avatar">
              {{ contact.avatar }}
            </div>
            <div class="contact-info">
              <span class="contact-name">{{ contact.name }}</span>
              <span class="contact-phone">{{ contact.phone }}</span>
            </div>
            <div class="contact-checkbox">
              <div :class="['checkbox', { 'checked': selectedContact && selectedContact.id === contact.id }]">
                <div v-if="selectedContact && selectedContact.id === contact.id" class="checkmark">✓</div>
              </div>
            </div>
          </div>
        </div>

        <div class="contacts-actions">
          <button class="confirm-btn" @click="confirmContact" :disabled="!selectedContact">
            Confirm contact
          </button>
        </div>
      </div>
      
      <!-- 取消按钮 -->
      <button class="cancel-btn" @click="handleCancel">
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
import { ChevronRight, ArrowLeft } from 'lucide-vue-next'

export default {
  name: 'TaskExecutionModal',
  components: {
    ChevronRight,
    ArrowLeft
  },
  data() {
    return {
      currentStep: 'permission', // 'permission' | 'contacts'
      contacts: [
        {
          id: 1,
          name: 'Maria',
          phone: '+1 (555) 123-4567',
          avatar: '👩‍🕶️'
        },
        {
          id: 2,
          name: 'Wife',
          phone: '+1 (555) 234-5678',
          avatar: 'W'
        },
        {
          id: 3,
          name: 'Family group chat',
          phone: '+1 (555) 345-6789',
          avatar: 'FM'
        },
        {
          id: 4,
          name: 'Sarah Johnson',
          phone: '+1 (555) 456-7890',
          avatar: '👩'
        },
        {
          id: 5,
          name: 'Emma Wilson',
          phone: '+1 (555) 567-8901',
          avatar: '👩‍🦰'
        },
        {
          id: 6,
          name: 'Lisa Chen',
          phone: '+1 (555) 678-9012',
          avatar: '👩‍🦱'
        },
        {
          id: 7,
          name: 'Mom',
          phone: '+1 (555) 789-0123',
          avatar: '👩‍🦳'
        },
        {
          id: 8,
          name: 'Dad',
          phone: '+1 (555) 890-1234',
          avatar: '👨'
        }
      ],
      selectedContact: null
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close')
    },
    handleAllowAccess() {
      // 进入联系人选择页面
      this.currentStep = 'contacts'
      // 默认选中最上方的联系人
      this.selectedContact = this.contacts[0]
    },
    handleCancel() {
      // 返回前序页面
      this.$emit('cancel')
    },
    goBack() {
      // 从联系人选择返回权限页面
      this.currentStep = 'permission'
    },
    selectContact(contact) {
      this.selectedContact = contact
      console.log('Selected contact:', contact)
    },
    confirmContact() {
      if (this.selectedContact) {
        console.log('Confirming contact:', this.selectedContact)
        // 这里可以添加确认联系人后的逻辑
        this.$emit('contact-selected', this.selectedContact)
      }
    }
  }
}
</script>

<style scoped>
.task-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}



/* 权限请求容器 */
.permission-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 权限请求区域 */
.permission-section {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 32px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0px 10px 23px 0px rgba(18, 25, 43, 0.05), 0px 42px 42px 0px rgba(18, 25, 43, 0.04), 0px 94px 56px 0px rgba(18, 25, 43, 0.03), 0px 167px 67px 0px rgba(18, 25, 43, 0.01), 0px 261px 73px 0px rgba(18, 25, 43, 0);
  backdrop-filter: blur(2px);
  text-align: center;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 10px;
  margin-bottom: 16px;
}

.avatar-group {
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #FFFFFF;
}

.avatar-1 {
  background: #23CEFF;
  top: 8px;
  left: 12px;
  width: 45px;
  height: 45px;
  font-size: 21px;
}

.avatar-2 {
  background: #FF765A;
  top: 56px;
  left: 20px;
}

.avatar-3 {
  background: #A96DFF;
  top: 43px;
  right: 20px;
}

.permission-info {
  text-align: center;
}

.permission-title {
  font-size: 14px;
  font-weight: 500;
  color: #12192B;
  margin: 0 0 4px 0;
}

.permission-desc {
  font-size: 14px;
  color: #717580;
  margin: 0;
}

.allow-btn {
  background: #FFFFFF;
  color: #12192B;
  border: none;
  padding: 14px 16px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0px 10px 23px 0px rgba(18, 25, 43, 0.05), 0px 42px 42px 0px rgba(18, 25, 43, 0.04), 0px 94px 56px 0px rgba(18, 25, 43, 0.03), 0px 167px 67px 0px rgba(18, 25, 43, 0.01), 0px 261px 73px 0px rgba(18, 25, 43, 0);
}

/* 联系人选择容器 */
.contacts-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 联系人选择页面样式 */
.contacts-modal {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0px 10px 23px 0px rgba(18, 25, 43, 0.05), 0px 42px 42px 0px rgba(18, 25, 43, 0.04), 0px 94px 56px 0px rgba(18, 25, 43, 0.03), 0px 167px 67px 0px rgba(18, 25, 43, 0.01), 0px 261px 73px 0px rgba(18, 25, 43, 0);
  backdrop-filter: blur(20px);
  width: 320px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contacts-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: #f5f5f5;
}

.back-icon {
  width: 20px;
  height: 20px;
  color: #333333;
}

.contacts-title {
  font-size: 18px;
  font-weight: 600;
  color: #12192B;
  margin: 0;
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  max-height: 300px;
  overflow-y: auto;
  margin: 10px 10px 0 10px
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(18px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.contact-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  flex-shrink: 0;
}

.contact-avatar:nth-child(1) {
  background: #23CEFF;
}

.contact-avatar:nth-child(2) {
  background: #FF69B4;
}

.contact-avatar:nth-child(3) {
  background: #A96DFF;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-name {
  font-size: 16px;
  font-weight: 500;
  color: #12192B;
}

.contact-phone {
  font-size: 14px;
  color: #717580;
}

.contact-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox.checked {
  background: #12192B;
  border-color: #12192B;
}

.checkmark {
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}

.contacts-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.confirm-btn {
  background: #FFFFFF;
  color: #12192B;
  border: none;
  padding: 12px 24px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  box-shadow: 0px 10px 23px 0px rgba(18, 25, 43, 0.05), 0px 42px 42px 0px rgba(18, 25, 43, 0.04), 0px 94px 56px 0px rgba(18, 25, 43, 0.03), 0px 167px 67px 0px rgba(18, 25, 43, 0.01), 0px 261px 73px 0px rgba(18, 25, 43, 0);
}

.confirm-btn:hover:not(:disabled) {
  background: #f8f8f8;
}

.confirm-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 取消按钮 */
.cancel-btn {
  background: rgba(18, 25, 43, 0.3);
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(20px);
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(18, 25, 43, 0.2);
}

/* 底部焦点栏 */
.focus-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 47px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.focus-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #4CFFF6 0%, #219FFF 50%, #FF00E5 100%);
  border-radius: 2px;
  filter: blur(30px);
}

.focus-text {
  font-size: 12px;
  font-weight: 500;
  color: #717580;
  z-index: 1;
}



</style>