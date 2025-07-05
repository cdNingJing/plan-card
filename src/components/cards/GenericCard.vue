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

</style> 