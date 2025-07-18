<template>
  <div class="dynamic-scene" :class="{ 'blurred-background': isBlurred }">
    <!-- 场景头部 -->
    <div class="scene-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <ArrowLeft class="icon" />
        </button>
        <div class="scene-info">
          <div class="avatar" :style="{ background: sceneConfig.avatarBg }">
            {{ sceneConfig.avatarText }}
          </div>
          <div class="scene-details">
            <h3 class="scene-title">{{ sceneConfig.title }}</h3>
            <span class="scene-subtitle">{{ sceneConfig.subtitle }}</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="ai-btn" @click="handleAIClick">
          <Bot class="icon" />
          &nbsp;&nbsp;AI Button
        </button>
      </div>
    </div>

    <!-- 场景内容区域 -->
    <div class="scene-content" ref="contentContainer">
      <!-- 群聊场景 - 微信风格 -->
      <div v-if="sceneType === 'group-chat'" class="chat-messages">
        <div 
          v-for="message in sceneData.messages" 
          :key="message.id"
          :class="['message', message.isOwn ? 'own-message' : 'other-message']"
        >
          <div class="message-avatar" v-if="!message.isOwn">
            <div class="avatar-icon" :style="{ background: getAvatarBackground(message.sender) }">
              {{ getAvatarText(message.sender) }}
            </div>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p class="message-text">{{ message.text }}</p>
              <span class="message-time">{{ message.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 新闻场景 - 小红书风格 -->
      <div v-else-if="sceneType === 'news'" class="news-feed">
        <div 
          v-for="news in sceneData.news" 
          :key="news.id"
          :class="['news-card', { 'expanded': expandedNewsId === news.id }]"
          @click="toggleNewsDetail(news.id)"
        >
          <div class="news-image">
            <div class="image-placeholder" :style="{ background: getNewsImageBg(news.category) }">
              {{ getNewsImageText(news.category) }}
            </div>
          </div>
          <div class="news-content">
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-summary">{{ news.summary }}</p>
            <div class="news-meta">
              <span class="news-category">{{ news.category }}</span>
              <span class="news-time">{{ news.time }}</span>
            </div>
            <!-- 展开的详情内容 -->
            <div v-if="expandedNewsId === news.id" class="news-detail">
              <div class="detail-content">
                <h4>详细内容</h4>
                <p>这里是新闻的详细内容，包含更多信息和背景资料。用户可以在这里阅读完整的新闻内容，了解事件的来龙去脉和相关分析。</p>
                <div class="detail-meta">
                  <span>发布时间：{{ news.time }}</span>
                  <span>阅读量：1,234</span>
                  <span>评论数：56</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文档场景 - 文件管理器风格 -->
      <div v-else-if="sceneType === 'document'" class="document-list">
        <div 
          v-for="doc in sceneData.documents" 
          :key="doc.id"
          :class="['document-item', { 'active': doc.status === 'active', 'recent': doc.status === 'recent', 'expanded': expandedDocumentId === doc.id }]"
          @click="toggleDocumentDetail(doc.id)"
        >
          <div class="document-icon">
            <div class="file-icon" :style="{ background: getDocumentIconBg(doc.type) }">
              {{ getDocumentIconText(doc.type) }}
            </div>
          </div>
          <div class="document-info">
            <h3 class="document-title">{{ doc.title }}</h3>
            <p class="document-subtitle">{{ doc.subtitle }}</p>
            <div class="document-meta">
              <span class="document-size">{{ doc.size }}</span>
              <span class="document-pages">{{ doc.pages }}页</span>
              <span class="document-date">{{ doc.lastModified }}</span>
            </div>
            <!-- 展开的详情内容 -->
            <div v-if="expandedDocumentId === doc.id" class="document-detail">
              <div class="detail-content">
                <h4>文档预览</h4>
                <div class="document-preview">
                  <p>这里是文档的预览内容，用户可以在这里查看文档的摘要和关键信息。</p>
                  <div class="preview-meta">
                    <span>创建者：张三</span>
                    <span>版本：v1.2</span>
                    <span>权限：可编辑</span>
                  </div>
                </div>
                <div class="document-actions">
                  <button class="action-btn">打开</button>
                  <button class="action-btn">下载</button>
                  <button class="action-btn">分享</button>
                </div>
              </div>
            </div>
          </div>
          <div class="document-status">
            <span :class="['status-badge', doc.status]">{{ getStatusText(doc.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  ArrowLeft, 
  Bot
} from 'lucide-vue-next'
import { getSceneConfig, getSceneData } from '@/config/sceneConfig.js'

export default {
  name: 'DynamicScene',
  components: {
    ArrowLeft,
    Bot
  },
  props: {
    sceneType: {
      type: String,
      default: 'group-chat'
    },
    isBlurred: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sceneData: {},
      sceneConfig: {},
      expandedNewsId: null,
      expandedDocumentId: null
    }
  },
  watch: {
    sceneType: {
      immediate: true,
      handler(newType) {
        this.loadSceneData(newType)
        this.sceneConfig = getSceneConfig(newType)
      }
    }
  },
  methods: {
    goBack() {
      this.$emit('go-back')
    },
    handleAIClick() {
      this.$emit('ai-click')
    },
    loadSceneData(sceneType) {
      // 使用场景配置管理器加载数据
      this.sceneData = getSceneData(sceneType)
    },
    getAvatarBackground(sender) {
      // 根据发送者返回不同的背景色
      const backgrounds = {
        'Sarah': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Emma': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'John': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'Lisa': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'Mom': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'Dad': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      }
      return backgrounds[sender] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    getAvatarText(sender) {
      // 根据发送者返回头像文字
      const texts = {
        'Sarah': 'S',
        'Emma': 'E',
        'John': 'J',
        'Lisa': 'L',
        'Mom': 'M',
        'Dad': 'D'
      }
      return texts[sender] || sender.charAt(0).toUpperCase()
    },
    getNewsImageBg(category) {
      // 根据新闻分类返回不同的背景色
      const backgrounds = {
        '美股': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '政策': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        '汽车': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        '贵金属': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'A股': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
      return backgrounds[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    getNewsImageText(category) {
      // 根据新闻分类返回图标文字
      const texts = {
        '美股': '📈',
        '政策': '🏛️',
        '汽车': '🚗',
        '贵金属': '💰',
        'A股': '📊'
      }
      return texts[category] || '📰'
    },
    getDocumentIconBg(type) {
      // 根据文档类型返回不同的背景色
      const backgrounds = {
        'pdf': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        'docx': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'pptx': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'xlsx': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
      return backgrounds[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    getDocumentIconText(type) {
      // 根据文档类型返回图标文字
      const texts = {
        'pdf': '📄',
        'docx': '📝',
        'pptx': '📊',
        'xlsx': '📈'
      }
      return texts[type] || '📄'
    },
    getStatusText(status) {
      // 根据状态返回显示文字
      const texts = {
        'active': '活跃',
        'recent': '最近',
        'archived': '归档'
      }
      return texts[status] || status
    },
    toggleNewsDetail(newsId) {
      // 切换新闻详情展开状态
      this.expandedNewsId = this.expandedNewsId === newsId ? null : newsId
    },
    toggleDocumentDetail(docId) {
      // 切换文档详情展开状态
      this.expandedDocumentId = this.expandedDocumentId === docId ? null : docId
    }
  },
  mounted() {
    // 初始化时滚动到底部
    this.$nextTick(() => {
      const container = this.$refs.contentContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }
}
</script>

<style scoped>
.dynamic-scene {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.blurred-background {
  transform: scale(0.75);
  filter: blur(1px);
  pointer-events: none;
  border-radius: 30px;
  position: relative;
  box-shadow: 0 0 4px #999999;
  overflow: hidden;
}

.blurred-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.8) 30%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.4) 70%,
    rgba(255, 255, 255, 0.2) 90%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}

.scene-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #333333;
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

.scene-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.scene-details {
  display: flex;
  flex-direction: column;
}

.scene-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  line-height: 1.2;
}

.scene-subtitle {
  font-size: 13px;
  color: #666666;
  font-weight: 400;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ai-btn {
  background: #333333;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-btn:hover {
  background: #555555;
  transform: translateY(-1px);
}

.ai-btn .icon {
  width: 18px;
  height: 18px;
}

.scene-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 群聊场景样式 */
.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-content {
  max-width: 75%;
}

.message-bubble {
  background-color: #f8f8f8;
  padding: 14px 18px;
  border-radius: 20px;
  position: relative;
  border: 1px solid #e5e5e5;
}

.own-message .message-bubble {
  background: #333333;
  color: white;
  border: none;
}

.message-text {
  margin: 0 0 6px 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 400;
}

.message-time {
  font-size: 12px;
  color: #999999;
  opacity: 0.8;
  font-weight: 400;
}

.own-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* 新闻场景样式 - 小红书风格 */
.news-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  transition: all 0.2s ease;
  cursor: pointer;
}

.news-card:hover {
  transform: translateY(-2px);
  border-color: #333333;
}

.news-image {
  height: 200px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  font-weight: 600;
}

.news-content {
  padding: 16px;
}

.news-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
}

.news-summary {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
  font-weight: 400;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-category {
  background: #333333;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.news-time {
  font-size: 12px;
  color: #999999;
  font-weight: 400;
}

/* 新闻详情展开样式 */
.news-detail {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.detail-content h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

.detail-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666666;
}

.detail-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999999;
}

.detail-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 文档场景样式 - 文件管理器风格 */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e5e5e5;
  transition: all 0.2s ease;
  cursor: pointer;
}

.document-item:hover {
  transform: translateY(-1px);
  border-color: #333333;
}

.document-item.active {
  border-left: 4px solid #333333;
  background: #f8f8f8;
}

.document-item.recent {
  border-left: 4px solid #666666;
}

.document-icon {
  flex-shrink: 0;
}

.file-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-subtitle {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666666;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.document-size,
.document-pages,
.document-date {
  font-size: 11px;
  color: #999999;
  font-weight: 400;
}

.document-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #333333;
  color: white;
}

.status-badge.recent {
  background: #666666;
  color: white;
}

.status-badge.archived {
  background: #f5f5f5;
  color: #999999;
}

/* 文档详情展开样式 */
.document-detail {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.document-preview {
  margin-bottom: 16px;
}

.document-preview p {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666666;
}

.preview-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999999;
  margin-bottom: 16px;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.document-actions .action-btn {
  background: #333333;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.document-actions .action-btn:hover {
  background: #555555;
}

.icon {
  width: 20px;
  height: 20px;
}
</style> 