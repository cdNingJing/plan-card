<template>
  <div class="restaurant-booking-card">
    <div class="booking-info">
      <div class="restaurant-image">
        <img :src="bookingInfo.image" :alt="bookingInfo.location" />
      </div>
      <div class="info-details">
        <div class="info-row">
          <span class="label">地点：</span>
          <span class="value">{{ bookingInfo.location }}</span>
        </div>
        <div class="info-row">
          <span class="label">日期：</span>
          <span class="value">{{ bookingInfo.date }}</span>
        </div>
        <div class="info-row">
          <span class="label">时间：</span>
          <span class="value">{{ bookingInfo.time }}</span>
        </div>
        <div class="info-row">
          <span class="label">人数：</span>
          <span class="value">{{ bookingInfo.guests }}</span>
        </div>
        <div class="info-row">
          <span class="label">备注：</span>
          <span class="value">{{ bookingInfo.notes }}</span>
        </div>
      </div>
    </div>
    
    <div class="booking-actions">
      <button class="confirm-btn" @click="confirmBooking">
        确认预订
      </button>
      <button class="modify-btn" @click="modifyBooking">
        修改信息
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRestaurantStore } from '@/stores/restaurantStore'

const restaurantStore = useRestaurantStore()

// 从全局状态获取预订信息
const bookingInfo = computed(() => restaurantStore.getBookingInfo())

const confirmBooking = () => {
  // 模拟确认预订
  console.log('预订已确认', bookingInfo.value)
  emit('booking-confirmed', bookingInfo.value)
}

const modifyBooking = () => {
  // 模拟修改预订
  console.log('修改预订信息')
  emit('booking-modified')
}

const emit = defineEmits(['booking-confirmed', 'booking-modified'])
</script>

<style scoped>
.restaurant-booking-card {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.booking-info {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.restaurant-image {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-details {
  width: 100%;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  min-width: 60px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.value {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.booking-actions {
  display: flex;
  gap: 12px;
}

.confirm-btn, .modify-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  color: white;
}

.confirm-btn:hover {
  background: linear-gradient(90deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
}

.modify-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.modify-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}
</style> 