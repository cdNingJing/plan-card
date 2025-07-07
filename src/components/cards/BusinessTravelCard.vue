<template>
  <div class="business-travel-card">
    <!-- 商务行程概览 -->
    <div class="travel-overview">
      <div class="overview-header">
        <h4>商务行程概览</h4>
        <div class="travel-status">
          <span class="status-badge urgent">紧急行程</span>
        </div>
      </div>
      
      <!-- 关键信息网格 -->
      <div class="info-grid">
        <!-- 航班信息 -->
        <div class="info-section flight-info">
          <div class="section-header">
            <Plane :size="16" />
            <span>航班信息</span>
          </div>
          <div class="flight-summary" v-if="data.flightInfo">
            <div class="route">
              <span class="departure">{{ data.flightInfo.departure }}</span>
              <span class="arrow">→</span>
              <span class="arrival">{{ data.flightInfo.arrival }}</span>
            </div>
            <div class="flight-details">
              <span class="airline">{{ data.flightInfo.airline }}</span>
              <span class="time">{{ data.flightInfo.departureTime }}</span>
              <span class="duration">{{ data.flightInfo.duration }}</span>
            </div>
            <div class="seat-preference" v-if="data.flightInfo.seatPreference">
              <span class="preference">座位偏好: {{ data.flightInfo.seatPreference }}</span>
            </div>
          </div>
          <div class="no-data" v-else>
            <span>暂无航班信息</span>
          </div>
        </div>

        <!-- 酒店信息 -->
        <div class="info-section hotel-info">
          <div class="section-header">
            <Building :size="16" />
            <span>酒店信息</span>
          </div>
          <div class="hotel-summary" v-if="data.hotelInfo">
            <div class="hotel-name">{{ data.hotelInfo.name }}</div>
            <div class="hotel-details">
              <span class="rating">{{ data.hotelInfo.rating }}星</span>
              <span class="distance">{{ data.hotelInfo.distanceToClient }}km到客户</span>
            </div>
            <div class="hotel-features">
              <span class="feature" v-if="data.hotelInfo.hasGym">健身房</span>
              <span class="feature" v-if="data.hotelInfo.hasWifi">WiFi</span>
              <span class="feature" v-if="data.hotelInfo.lateCheckout">延迟退房</span>
            </div>
          </div>
          <div class="no-data" v-else>
            <span>暂无酒店信息</span>
          </div>
        </div>

        <!-- 天气信息 -->
        <div class="info-section weather-info">
          <div class="section-header">
            <Cloud :size="16" />
            <span>天气预报</span>
          </div>
          <div class="weather-summary" v-if="data.weatherInfo">
            <div class="weather-main">
              <span class="temperature">{{ data.weatherInfo.temperature }}°C</span>
              <span class="condition">{{ data.weatherInfo.condition }}</span>
            </div>
            <div class="weather-details">
              <span class="humidity">湿度: {{ data.weatherInfo.humidity }}%</span>
              <span class="wind">风速: {{ data.weatherInfo.windSpeed }}km/h</span>
            </div>
            <div class="packing-suggestion" v-if="data.weatherInfo.packingSuggestion">
              <span class="suggestion">{{ data.weatherInfo.packingSuggestion }}</span>
            </div>
          </div>
          <div class="no-data" v-else>
            <span>暂无天气信息</span>
          </div>
        </div>

        <!-- 交通信息 -->
        <div class="info-section transport-info">
          <div class="section-header">
            <Car :size="16" />
            <span>交通信息</span>
          </div>
          <div class="transport-summary" v-if="data.transportInfo">
            <div class="transport-option">
              <span class="type">机场到客户</span>
              <span class="method">{{ data.transportInfo.airportToClient.method }}</span>
              <span class="duration">{{ data.transportInfo.airportToClient.duration }}</span>
              <span class="cost">¥{{ data.transportInfo.airportToClient.cost }}</span>
            </div>
            <div class="transport-option" v-if="data.transportInfo.hotelToClient">
              <span class="type">酒店到客户</span>
              <span class="method">{{ data.transportInfo.hotelToClient.method }}</span>
              <span class="duration">{{ data.transportInfo.hotelToClient.duration }}</span>
              <span class="cost">¥{{ data.transportInfo.hotelToClient.cost }}</span>
            </div>
          </div>
          <div class="no-data" v-else>
            <span>暂无交通信息</span>
          </div>
        </div>
      </div>

      <!-- 冲突提醒 -->
      <div class="conflict-alert" v-if="data.conflicts && data.conflicts.length > 0">
        <div class="alert-header">
          <AlertTriangle :size="16" />
          <span>日程冲突提醒</span>
        </div>
        <div class="conflict-list">
          <div v-for="conflict in data.conflicts" :key="conflict.id" class="conflict-item">
            <span class="conflict-time">{{ conflict.time }}</span>
            <span class="conflict-event">{{ conflict.event }}</span>
            <span class="conflict-suggestion">{{ conflict.suggestion }}</span>
          </div>
        </div>
      </div>

      <!-- 准备事项 -->
      <div class="preparation-checklist" v-if="data.preparations && data.preparations.length > 0">
        <div class="checklist-header">
          <CheckSquare :size="16" />
          <span>准备事项</span>
        </div>
        <div class="checklist-items">
          <div v-for="item in data.preparations" :key="item.id" class="checklist-item">
            <input 
              type="checkbox" 
              :id="item.id" 
              :checked="item.completed"
              @change="togglePreparation(item.id)"
            />
            <label :for="item.id">{{ item.task }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plane, Building, Cloud, Car, AlertTriangle, CheckSquare } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      flightInfo: null,
      hotelInfo: null,
      weatherInfo: null,
      transportInfo: null,
      conflicts: [],
      preparations: []
    })
  }
})

const emit = defineEmits(['update'])

const togglePreparation = (itemId) => {
  const updatedPreparations = props.data.preparations.map(item => 
    item.id === itemId ? { ...item, completed: !item.completed } : item
  )
  
  emit('update', {
    ...props.data,
    preparations: updatedPreparations
  })
}
</script>

<style scoped>
.business-travel-card {
  padding: 20px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E5E5;
}

.travel-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.overview-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.travel-status {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.urgent {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.info-section {
  padding: 16px;
  background: #F8F9FA;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333333;
}

.flight-summary,
.hotel-summary,
.weather-summary,
.transport-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333333;
}

.arrow {
  color: #666666;
}

.flight-details,
.hotel-details,
.weather-details {
  display: flex;
  gap: 12px;
  font-size: 0.875rem;
  color: #666666;
}

.seat-preference,
.hotel-features,
.packing-suggestion {
  font-size: 0.875rem;
  color: #666666;
}

.hotel-name {
  font-weight: 600;
  color: #333333;
}

.temperature {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.condition {
  font-size: 0.875rem;
  color: #666666;
}

.transport-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E5E5E5;
}

.transport-option:last-child {
  border-bottom: none;
}

.type {
  font-size: 0.875rem;
  color: #666666;
  min-width: 80px;
}

.method {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 500;
}

.duration {
  font-size: 0.875rem;
  color: #666666;
}

.cost {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 600;
}

.no-data {
  color: #999999;
  font-size: 0.875rem;
  font-style: italic;
}

.conflict-alert {
  padding: 16px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #DC2626;
  font-weight: 600;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conflict-item {
  display: flex;
  gap: 12px;
  font-size: 0.875rem;
}

.conflict-time {
  color: #DC2626;
  font-weight: 500;
  min-width: 80px;
}

.conflict-event {
  color: #333333;
  flex: 1;
}

.conflict-suggestion {
  color: #666666;
  font-style: italic;
}

.preparation-checklist {
  padding: 16px;
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
}

.checklist-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #0369A1;
  font-weight: 600;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.checklist-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #0369A1;
}

.checklist-item label {
  color: #333333;
  cursor: pointer;
}

.checklist-item input[type="checkbox"]:checked + label {
  text-decoration: line-through;
  color: #666666;
}
</style> 