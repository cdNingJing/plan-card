<template>
  <div class="generic-card">
    <div v-if="type === 'flight'" class="flight-content">
      <h4>航班推荐</h4>
      <div class="flight-list">
        <div 
          v-for="flight in data.recommendations" 
          :key="flight.airline"
          class="flight-item"
        >
          <div class="flight-info">
            <span class="airline">{{ flight.airline }}</span>
            <span class="time">{{ flight.time }}</span>
          </div>
          <div class="flight-price">{{ flight.price }}</div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'hotel'" class="hotel-content">
      <h4>酒店推荐</h4>
      <div class="hotel-list">
        <div 
          v-for="hotel in data.recommendations" 
          :key="hotel.name"
          class="hotel-item"
        >
          <div class="hotel-info">
            <span class="hotel-name">{{ hotel.name }}</span>
            <div class="hotel-rating">
              <span class="rating">{{ hotel.rating }}</span>
              <span class="stars">⭐</span>
            </div>
          </div>
          <div class="hotel-price">{{ hotel.price }}</div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'meeting'" class="meeting-content">
      <div class="meeting-details">
        <div class="detail-item">
          <span class="label">会议主题</span>
          <span class="value">{{ data.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">时间</span>
          <span class="value">{{ data.time }}</span>
        </div>
        <div class="detail-item">
          <span class="label">时长</span>
          <span class="value">{{ data.duration }}</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'itinerary'" class="itinerary-content">
      <h4>行程规划</h4>
      <div class="itinerary-list">
        <div 
          v-for="day in data.days" 
          :key="day.day"
          class="day-item"
        >
          <h5>第{{ day.day }}天: {{ day.title }}</h5>
          <div class="activities">
            <div 
              v-for="activity in day.activities" 
              :key="activity.time"
              class="activity-item"
            >
              <span class="time">{{ activity.time }}</span>
              <span class="activity">{{ activity.activity }}</span>
              <span class="duration">{{ activity.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'packing'" class="packing-content">
      <h4>打包清单</h4>
      <div class="packing-list">
        <div 
          v-for="category in data.categories" 
          :key="category.name"
          class="category-item"
        >
          <h5>{{ category.name }}</h5>
          <ul class="items-list">
            <li v-for="item in category.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'profile'" class="profile-content">
      <h4>收礼人画像</h4>
      <div class="profile-analysis">
        <p>{{ data.analysis }}</p>
        <div class="tags">
          <span 
            v-for="tag in data.tags" 
            :key="tag"
            class="tag"
          >{{ tag }}</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'tips'" class="tips-content">
      <h4>贴心提示</h4>
      <ul class="tips-list">
        <li v-for="tip in data.tips" :key="tip">{{ tip }}</li>
      </ul>
    </div>
    
    <div v-else-if="type === 'participants'" class="participants-content">
      <h4>参与者管理</h4>
      <div class="participants-list">
        <div class="required">
          <h5>必需参与者</h5>
          <ul>
            <li v-for="attendee in data.attendees" :key="attendee">{{ attendee }}</li>
          </ul>
        </div>
        <div class="optional">
          <h5>可选参与者</h5>
          <ul>
            <li v-for="attendee in data.optional" :key="attendee">{{ attendee }}</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'reminder'" class="reminder-content">
      <h4>提醒设置</h4>
      <div class="reminder-settings">
        <div class="setting-item">
          <span class="label">提醒时间:</span>
          <span class="value">{{ data.settings.join(', ') }}</span>
        </div>
        <div class="setting-item">
          <span class="label">提醒方式:</span>
          <span class="value">{{ data.method }}</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'feedback'" class="feedback-content">
      <h4>执行反馈</h4>
      <div class="feedback-status">
        <span class="status">状态: {{ data.status }}</span>
      </div>
    </div>
    
    <div v-else-if="type === 'attachments'" class="attachments-content">
      <h4>附件管理</h4>
      <div class="attachments-list">
        <p v-if="data.files.length === 0">暂无附件</p>
        <div v-else>
          <div 
            v-for="file in data.files" 
            :key="file.name"
            class="file-item"
          >
            {{ file.name }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'suggestions'" class="suggestions-content">
      <h4>建议方案</h4>
      <div class="suggestions-list">
        <div 
          v-for="suggestion in data.recommendations" 
          :key="suggestion.title"
          class="suggestion-item"
        >
          <h5>{{ suggestion.title }}</h5>
          <p>{{ suggestion.description }}</p>
          <span class="priority">{{ suggestion.priority }}</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="type === 'resources'" class="resources-content">
      <h4>相关资源</h4>
      <div class="resources-list">
        <div 
          v-for="resource in data.recommendations" 
          :key="resource.title"
          class="resource-item"
        >
          <h5>{{ resource.title }}</h5>
          <p>{{ resource.description }}</p>
          <span class="type">{{ resource.type }}</span>
        </div>
      </div>
    </div>
    
    <div v-else class="default-content">
      <p>{{ type }} 卡片内容</p>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])
</script>

<style scoped>
.generic-card {
  line-height: 1.5;
}

.flight-content h4,
.hotel-content h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.flight-list,
.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flight-item,
.hotel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;
  border: 1px solid #E5E5E5;
}

.flight-info,
.hotel-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.airline,
.hotel-name {
  font-weight: 600;
  color: #333333;
}

.time {
  font-size: 0.875rem;
  color: #666666;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating {
  font-size: 0.875rem;
  color: #666666;
}

.stars {
  font-size: 0.75rem;
}

.flight-price,
.hotel-price {
  font-weight: 600;
  color: #333333;
}

.meeting-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E5E5E5;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 0.875rem;
  color: #666666;
  font-weight: 500;
}

.value {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 600;
}

.default-content {
  color: #666666;
  font-size: 0.875rem;
}

.default-content pre {
  background: #F8F9FA;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  overflow-x: auto;
  margin-top: 8px;
}

/* 新增卡片类型样式 */
.itinerary-content h4,
.packing-content h4,
.profile-content h4,
.tips-content h4,
.participants-content h4,
.reminder-content h4,
.feedback-content h4,
.attachments-content h4,
.suggestions-content h4,
.resources-content h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.day-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;
  border: 1px solid #E5E5E5;
}

.day-item h5 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 0.875rem;
}

.time {
  color: #666666;
  font-weight: 500;
}

.activity {
  flex: 1;
  margin: 0 8px;
  color: #333333;
}

.duration {
  color: #999999;
  font-size: 0.75rem;
}

.category-item {
  margin-bottom: 12px;
}

.category-item h5 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.items-list {
  margin: 0;
  padding-left: 16px;
  font-size: 0.875rem;
  color: #666666;
}

.items-list li {
  margin-bottom: 4px;
}

.profile-analysis p {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.5;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 8px;
  background: #F0F0F0;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666666;
}

.tips-list {
  margin: 0;
  padding-left: 16px;
  font-size: 0.875rem;
  color: #666666;
}

.tips-list li {
  margin-bottom: 8px;
}

.participants-list {
  display: flex;
  gap: 16px;
}

.required,
.optional {
  flex: 1;
}

.required h5,
.optional h5 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.required ul,
.optional ul {
  margin: 0;
  padding-left: 16px;
  font-size: 0.875rem;
  color: #666666;
}

.reminder-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E5E5E5;
}

.setting-item:last-child {
  border-bottom: none;
}

.feedback-status {
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;
  border: 1px solid #E5E5E5;
}

.status {
  font-size: 0.875rem;
  color: #666666;
}

.attachments-list p {
  margin: 0;
  font-size: 0.875rem;
  color: #999999;
  text-align: center;
  padding: 20px;
}

.file-item {
  padding: 8px 12px;
  background: #F8F9FA;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 8px;
}

.suggestion-item,
.resource-item {
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;
  border: 1px solid #E5E5E5;
  margin-bottom: 12px;
}

.suggestion-item h5,
.resource-item h5 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.suggestion-item p,
.resource-item p {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.5;
}

.priority,
.type {
  display: inline-block;
  padding: 2px 6px;
  background: #333333;
  color: #FFFFFF;
  border-radius: 3px;
  font-size: 0.75rem;
}

</style> 