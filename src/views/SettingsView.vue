<template>
  <div class="settings-view">
    <!-- iOS导航栏 -->
    <div class="navbar">
      <!-- <button class="navbar-btn back" @click="goBack">
        <ChevronLeft />
        <span>返回</span>
      </button> -->
      <div class="navbar-title">设置</div>
    </div>
    
    <!-- 设置内容区域 -->
    <div class="content" v-show="!showAboutDetail">
      <!-- "关于您"卡片 -->
      <div class="about-card">
        <div class="avatar">
          <span>{{ userData.userInfo.avatar.text }}</span>
          <div class="avatar-edit" @click="editAvatar">
            <Camera />
          </div>
        </div>
        <div class="user-name">{{ userData.userInfo.name }}</div>
        <div class="user-id">ID: {{ userData.userInfo.id }}</div>
        
        <div class="about-stats">
          <div class="stat-item">
            <div class="stat-value">{{ userData.userInfo.stats.profileCompleteness }}</div>
            <div class="stat-label">资料完整度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userData.userInfo.stats.usageDays }}</div>
            <div class="stat-label">使用天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userData.userInfo.stats.memberLevel }}</div>
            <div class="stat-label">会员等级</div>
          </div>
        </div>
        
        <button class="add-item-btn" @click="goToAbout">
          <UserCircle /> 查看个人资料详情
        </button>
      </div>
      
      <!-- 账户设置 -->
      <div class="card">
        <div class="card-header">
          <h2>账户设置</h2>
        </div>
        <div 
          v-for="item in userData.settings.account" 
          :key="item.id"
          class="list-item" 
          @click="openSetting(item.name)"
        >
          <div class="item-icon" :style="{ backgroundColor: item.iconColor }">
            <component :is="getIconComponent(item.icon)" />
          </div>
          <div class="item-content">
            <div class="item-label">{{ item.name }}</div>
          </div>
          <ChevronRight class="item-chevron" />
        </div>
      </div>
      
      <!-- 隐私设置 -->
      <div class="card">
        <div class="card-header">
          <h2>隐私设置</h2>
        </div>
        <div 
          v-for="item in userData.settings.privacy" 
          :key="item.id"
          class="list-item" 
          @click="openSetting(item.name)"
        >
          <div class="item-icon" :style="{ backgroundColor: item.iconColor }">
            <component :is="getIconComponent(item.icon)" />
          </div>
          <div class="item-content">
            <div class="item-label">{{ item.name }}</div>
          </div>
          <ChevronRight class="item-chevron" />
        </div>
      </div>
      
      <!-- 通知设置 -->
      <div class="card">
        <div class="card-header">
          <h2>通知设置</h2>
        </div>
        <div 
          v-for="item in userData.settings.notifications" 
          :key="item.id"
          class="list-item" 
          @click="openSetting(item.name)"
        >
          <div class="item-icon" :style="{ backgroundColor: item.iconColor }">
            <component :is="getIconComponent(item.icon)" />
          </div>
          <div class="item-content">
            <div class="item-label">{{ item.name }}</div>
          </div>
          <ChevronRight class="item-chevron" />
        </div>
      </div>
      
      <!-- 通用设置 -->
      <div class="card">
        <div class="card-header">
          <h2>通用设置</h2>
        </div>
        <div 
          v-for="item in userData.settings.general" 
          :key="item.id"
          class="list-item" 
          @click="openSetting(item.name)"
        >
          <div class="item-icon" :style="{ backgroundColor: item.iconColor }">
            <component :is="getIconComponent(item.icon)" />
          </div>
          <div class="item-content">
            <div class="item-label">{{ item.name }}</div>
          </div>
          <ChevronRight class="item-chevron" />
        </div>
      </div>
      
      <!-- 支持与关于 -->
      <div class="card">
        <div class="card-header">
          <h2>支持与关于</h2>
        </div>
        <div 
          v-for="item in userData.settings.support" 
          :key="item.id"
          class="list-item" 
          @click="openSetting(item.name)"
        >
          <div class="item-icon" :style="{ backgroundColor: item.iconColor }">
            <component :is="getIconComponent(item.icon)" />
          </div>
          <div class="item-content">
            <div class="item-label">{{ item.name }}</div>
          </div>
          <ChevronRight class="item-chevron" />
        </div>
      </div>
      
      <!-- 账户操作 -->
      <div class="card">
        <div class="card-header">
          <h2>账户操作</h2>
        </div>
        <div 
          v-for="item in userData.settings.accountActions" 
          :key="item.id"
          class="list-item" 
          @click="handleAccountAction(item)"
        >
          <div class="item-icon" :style="{ backgroundColor: item.iconColor }">
            <component :is="getIconComponent(item.icon)" />
          </div>
          <div class="item-content">
            <div class="item-label">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
    
    
  </div>
</template>

<script>
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Shield, 
  Key, 
  Lock, 
  EyeOff, 
  Database, 
  Bell, 
  Mail, 
  Volume2, 
  Globe, 
  Moon, 
  RefreshCw, 
  HelpCircle, 
  MessageCircle, 
  Info, 
  LogOut, 
  Ban, 
  Trash2, 
  UserCircle, 
  Camera, 
  Crown, 
  Calendar, 
  Gift, 
  PlusCircle, 
  Edit, 
  Star,
  Users,
  Cake,
  CreditCard
} from 'lucide-vue-next'
import userProfileData from '@/data/userProfile.json'

export default {
  name: 'SettingsView',
  components: {
    ChevronLeft,
    ChevronRight,
    User,
    Shield,
    Key,
    Lock,
    EyeOff,
    Database,
    Bell,
    Mail,
    Volume2,
    Globe,
    Moon,
    RefreshCw,
    HelpCircle,
    MessageCircle,
    Info,
    LogOut,
    Ban,
    Trash2,
    UserCircle,
    Camera,
    Crown,
    Calendar,
    Gift,
    PlusCircle,
    Edit,
    Star,
    Users,
    Cake,
    CreditCard
  },
  data() {
    return {
      userData: userProfileData
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    finishEdit() {
      // 完成编辑逻辑
      console.log('完成编辑')
    },
    editAvatar() {
      alert('打开照片选择器')
    },
    goToAbout() {
      this.$router.push('/about')
    },

    editAbout() {
      console.log('编辑关于您信息')
    },
              openSetting(settingName) {
      alert(`打开${settingName}设置页面`)
    },
    getIconComponent(iconName) {
      const iconMap = {
        'user': 'User',
        'shield': 'Shield',
        'key': 'Key',
        'lock': 'Lock',
        'eye-off': 'EyeOff',
        'database': 'Database',
        'bell': 'Bell',
        'mail': 'Mail',
        'volume-2': 'Volume2',
        'globe': 'Globe',
        'moon': 'Moon',
        'refresh-cw': 'RefreshCw',
        'help-circle': 'HelpCircle',
        'message-circle': 'MessageCircle',
        'info': 'Info',
        'log-out': 'LogOut',
        'ban': 'Ban',
        'trash-2': 'Trash2'
      }
      return iconMap[iconName] || 'User'
    },
    handleAccountAction(item) {
      if (item.action === 'logout') {
        if (confirm(item.confirmMessage)) {
          console.log('退出登录')
        }
      } else if (item.action === 'deactivate') {
        if (confirm(item.confirmMessage)) {
          console.log('停用账户')
        }
      } else if (item.action === 'delete') {
        if (confirm(item.confirmMessage)) {
          console.log('删除账户')
        }
      }
    },
  
  }
}
</script>

<style scoped>
/* iOS风格设计 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.settings-view {
  background-color: #f2f2f7;
  color: #000;
  line-height: 1.5;
  padding-top: 44px;
  padding-bottom: 80px;
  min-height: 100vh;
}

/* iOS导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  background-color: rgba(249, 249, 251, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
}

.navbar-btn {
  background: none;
  border: none;
  font-size: 17px;
  color: #007AFF;
  z-index: 10;
  cursor: pointer;
}

.navbar-btn.back {
  padding-right: 16px;
  color: #007AFF;
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar-btn.back svg {
  width: 16px;
  height: 16px;
}

/* 内容区域 */
.content {
  padding: 16px 0;
  animation: fadeIn 0.3s ease-out;
}

/* iOS卡片样式 */
.card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 16px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.card-header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
}

.card-header h2 {
  font-size: 17px;
  font-weight: 600;
}

/* 列表项样式 */
.list-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  min-height: 44px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.list-item:last-child {
  border-bottom: none;
}

.item-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.item-icon svg {
  width: 16px;
  height: 16px;
}

.item-content {
  flex: 1;
}

.item-label {
  font-size: 17px;
  color: #000;
}

.item-value {
  font-size: 17px;
  color: #8E8E93;
  text-align: right;
}

.item-chevron {
  color: #C7C7CC;
  margin-left: 8px;
  width: 16px;
  height: 16px;
}

/* 关于您卡片 */
.about-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 16px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  text-align: center;
  padding: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #007AFF, #34C759);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
  margin: 0 auto 16px;
  position: relative;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid white;
  cursor: pointer;
}

.avatar-edit svg {
  width: 14px;
  height: 14px;
}

.user-name {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-id {
  font-size: 15px;
  color: #8E8E93;
  margin-bottom: 16px;
}

.about-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #007AFF;
}

.stat-label {
  font-size: 13px;
  color: #8E8E93;
  margin-top: 4px;
}

/* 状态指示器 */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(52, 199, 89, 0.2);
  border-radius: 10px;
  font-size: 13px;
  color: #34C759;
}

.status-badge.warning {
  background: rgba(255, 149, 0, 0.2);
  color: #FF9500;
}

.status-badge.info {
  background: rgba(0, 122, 255, 0.2);
  color: #007AFF;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 地址卡片 */
.address-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.address-title {
  font-weight: 600;
  font-size: 16px;
}

.address-default {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.address-details {
  color: #8E8E93;
  font-size: 15px;
  line-height: 1.4;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 12px;
}

.address-action-btn {
  background: none;
  border: none;
  color: #007AFF;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.address-action-btn svg {
  width: 14px;
  height: 14px;
}

/* 地址类型指示器 */
.address-type {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-size: 13px;
  margin-right: 8px;
}

.address-type.home {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

.address-type.work {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

.address-type.other {
  background: rgba(142, 142, 147, 0.1);
  color: #8E8E93;
}

.add-item-btn {
  width: 100%;
  background: none;
  border: none;
  text-align: center;
  padding: 12px 0;
  color: #007AFF;
  font-size: 17px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.add-item-btn svg {
  width: 16px;
  height: 16px;
}

/* 关于您详情页样式 */
.detail-header {
  padding: 20px 16px;
  text-align: center;
  background: #fff;
  border-bottom: 0.5px solid rgba(0,0,0,0.1);
}

.detail-content {
  padding: 16px;
}
</style> 