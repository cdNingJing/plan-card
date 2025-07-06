<template>
  <div 
    class="smart-card"
    :class="[
      `state-${card.state}`,
      `type-${card.type}`,
      { 'write-operation': card.writeOperation },
      { 'completed': card.isCompleted }
    ]"
  >
    <!-- 卡片头部 -->
    <div class="card-header" @click="toggleState">
      <div class="card-title">
        <h3>{{ card.title }}</h3>
        <!-- 航班卡片收起状态下的购买信息 -->
        <div v-if="card.type === 'flight' && card.state === 'collapsed' && recentBookings.length > 0" class="flight-booking-summary">
          <div class="booking-count">
            <CheckCircle :size="14" />
            <span>{{ recentBookings.length }}个航班已预订</span>
          </div>
          <div class="booking-preview">
            <span v-for="(booking, index) in recentBookings.slice(0, 2)" :key="booking.id" class="booking-item">
              {{ getBookingRouteText(booking) }}
              <span class="booking-price">¥{{ formatPrice(booking.totalPrice) }}</span>
            </span>
            <span v-if="recentBookings.length > 2" class="more-bookings">
              +{{ recentBookings.length - 2 }}个
            </span>
          </div>
        </div>
        
        <!-- 酒店卡片收起状态下的购买信息 -->
        <div v-if="card.type === 'hotel' && card.state === 'collapsed' && recentHotelBookings.length > 0" class="hotel-booking-summary">
          <div class="booking-count">
            <CheckCircle :size="14" />
            <span>{{ recentHotelBookings.length }}个酒店已预订</span>
          </div>
          <div class="booking-preview">
            <span v-for="(booking, index) in recentHotelBookings.slice(0, 2)" :key="booking.id" class="booking-item">
              {{ booking.hotel.name }}
              <span class="booking-price">{{ booking.totalPrice }}</span>
            </span>
            <span v-if="recentHotelBookings.length > 2" class="more-bookings">
              +{{ recentHotelBookings.length - 2 }}个
            </span>
          </div>
        </div>
      </div>
      <div class="card-actions" @click.stop>
        <!-- 已完成标识 -->
        <div v-if="card.isCompleted" class="completed-badge">
          <CheckCircle :size="16" />
        </div>
        <button 
          v-if="card.state === 'expanded'"
          @click="enterFullscreen"
          class="action-btn"
          title="全屏"
        >
          <Maximize2 :size="16" />
        </button>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content" v-show="card.state !== 'collapsed'">
      <!-- 目的地卡片 -->
      <DestinationCard 
        v-if="card.type === 'destination'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 航班推荐卡片 -->
      <FlightCard 
        v-else-if="card.type === 'flight'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 酒店推荐卡片 -->
      <HotelCard 
        v-else-if="card.type === 'hotel'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 礼物推荐卡片 -->
      <GiftCard 
        v-else-if="card.type === 'gift'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 预算过滤卡片 -->
      <BudgetCard 
        v-else-if="card.type === 'budget'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 会议详情卡片 -->
      <MeetingCard 
        v-else-if="card.type === 'meeting'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 基础信息卡片 -->
      <BasicInfoCard 
        v-else-if="card.type === 'basic-info'"
        :scenario="card.data.scenario || 'general'"
        :initialData="card.data.formData || {}"
        @submit="handleBasicInfoSubmit"
        @change="handleBasicInfoChange"
        @collapse="handleBasicInfoCollapse"
      />
      
      <!-- 行程卡片 -->
      <GenericCard 
        v-else-if="card.type === 'itinerary'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 打包清单卡片 -->
      <GenericCard 
        v-else-if="card.type === 'packing'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 画像卡片 -->
      <GenericCard 
        v-else-if="card.type === 'profile'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 提示卡片 -->
      <GenericCard 
        v-else-if="card.type === 'tips'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 参与者卡片 -->
      <GenericCard 
        v-else-if="card.type === 'participants'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 提醒设置卡片 -->
      <GenericCard 
        v-else-if="card.type === 'reminder'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 执行反馈卡片 -->
      <GenericCard 
        v-else-if="card.type === 'feedback'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 附件管理卡片 -->
      <GenericCard 
        v-else-if="card.type === 'attachments'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 建议方案卡片 -->
      <GenericCard 
        v-else-if="card.type === 'suggestions'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 相关资源卡片 -->
      <GenericCard 
        v-else-if="card.type === 'resources'"
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
      
      <!-- 通用卡片 -->
      <GenericCard 
        v-else
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
    </div>

    <!-- 全屏遮罩 -->
    <div v-if="card.state === 'fullscreen'" class="fullscreen-overlay" @click="exitFullscreen">
      <div class="fullscreen-content" @click.stop>
        <div class="fullscreen-header">
          <h2>{{ card.title }}</h2>
          <button @click="exitFullscreen" class="close-btn">
            <X :size="24" />
          </button>
        </div>
        <div class="fullscreen-body">
          <!-- 全屏内容 -->
          <BasicInfoCard 
            v-if="card.type === 'basic-info'"
            :scenario="card.data.scenario || 'general'"
            :initialData="card.data.formData || {}"
            @submit="handleBasicInfoSubmit"
            @change="handleBasicInfoChange"
            @collapse="handleBasicInfoCollapse"
          />
          <component 
            v-else
            :is="getCardComponent(card.type)"
            :data="card.data"
            :fullscreen="true"
            @update="handleUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  X,
  MapPin,
  Plane,
  Building,
  Calendar,
  Package,
  User,
  Gift,
  DollarSign,
  Lightbulb,
  Users,
  Bell,
  CheckCircle,
  Paperclip,
  Info
} from 'lucide-vue-next'
import { bookingStorage } from '@/utils/bookingStorage.js'

import DestinationCard from './cards/DestinationCard.vue'
import FlightCard from './cards/FlightCard.vue'
import HotelCard from './cards/HotelCard.vue'
import GiftCard from './cards/GiftCard.vue'
import BudgetCard from './cards/BudgetCard.vue'
import MeetingCard from './cards/MeetingCard.vue'
import GenericCard from './cards/GenericCard.vue'
import BasicInfoCard from './cards/BasicInfoCard.vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-state', 'update-data'])

// 获取最近的预订记录
const recentBookings = computed(() => {
  if (props.card.type === 'flight') {
    return bookingStorage.getRecentBookings(3)
  }
  return []
})

// 获取酒店预订记录
const recentHotelBookings = computed(() => {
  if (props.card.type === 'hotel') {
    return bookingStorage.getRecentHotelBookings(3)
  }
  return []
})

// 获取预订路线文本
const getBookingRouteText = (booking) => {
  if (!booking.flights || booking.flights.length === 0) return '未知路线'
  
  if (booking.isMultiTrip && booking.flights.length >= 2) {
    const outbound = booking.flights[0]
    const returnFlight = booking.flights[1]
    return `${outbound.departureAirport} ↔ ${outbound.arrivalAirport}`
  } else {
    const flight = booking.flights[0]
    return `${flight.departureAirport} → ${flight.arrivalAirport}`
  }
}

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0'
  return typeof price === 'number' ? price.toLocaleString() : price.toString()
}

const iconMap = {
  MapPin,
  Plane,
  Building,
  Calendar,
  Package,
  User,
  Gift,
  DollarSign,
  Lightbulb,
  Users,
  Bell,
  CheckCircle,
  Paperclip,
  Info
}

const getIcon = (iconName) => {
  return iconMap[iconName] || MapPin
}

const getCardComponent = (type) => {
  const componentMap = {
    destination: DestinationCard,
    flight: FlightCard,
    hotel: HotelCard,
    gift: GiftCard,
    budget: BudgetCard,
    meeting: MeetingCard,
    'basic-info': BasicInfoCard,
    default: GenericCard
  }
  return componentMap[type] || componentMap.default
}

const toggleState = () => {
  const newState = props.card.state === 'expanded' ? 'collapsed' : 'expanded'
  emit('update-state', props.card.id, newState)
}

const enterFullscreen = () => {
  emit('update-state', props.card.id, 'fullscreen')
}

const exitFullscreen = () => {
  emit('update-state', props.card.id, 'expanded')
}

const handleUpdate = (data) => {
  emit('update-data', props.card.id, data)
}

const handleBasicInfoSubmit = (formData) => {
  // 保存表单数据到卡片
  emit('update-data', props.card.id, {
    ...props.card.data,
    formData: formData,
    isCompleted: true
  })
  
  // 可以触发其他卡片的激活
  console.log('基础信息已提交:', formData)
}

const handleBasicInfoCollapse = () => {
  // 折叠卡片
  emit('update-state', props.card.id, 'collapsed')
}

const handleBasicInfoChange = (formData) => {
  // 实时保存表单数据，包括完成状态
  emit('update-data', props.card.id, {
    ...props.card.data,
    formData: formData,
    isCompleted: formData.isCompleted || false
  })
}
</script>

<style scoped>
.smart-card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.smart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.smart-card.write-operation {
  border-left: 4px solid #333333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E5E5E5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.card-header:hover {
  background: #E5E5E5;
}

.card-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: space-between;
}

.card-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

/* 航班卡片收起状态下的购买信息样式 */
.flight-booking-summary {
  margin-top: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%);
  border: 1px solid #4CAF50;
  border-radius: 6px;
  font-size: 0.8rem;
}

.booking-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #2E7D32;
  font-weight: 500;
  margin-bottom: 4px;
}

.booking-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333333;
  font-size: 0.75rem;
}

.booking-price {
  color: #2E7D32;
  font-weight: 500;
}

.more-bookings {
  color: #666666;
  font-size: 0.7rem;
  font-style: italic;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #E5E5E5;
  color: #333333;
}

.card-content {
  padding: 20px;
}

.state-collapsed .card-content {
  display: none;
}

.state-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.fullscreen-content {
  background: #FFFFFF;
  border-radius: 0;
  width: 100vw;
  height: 100vh;
  max-width: 1200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
}

.fullscreen-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #E5E5E5;
  color: #333333;
}

.fullscreen-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  min-height: 0;
}

/* 收起状态的通用样式优化 */
.smart-card.state-collapsed {
  background: #FAFAFA;
  border: 1px solid #E5E5E5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.smart-card.state-collapsed:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.smart-card.state-collapsed .card-header {
  background: #FAFAFA;
  border-bottom: none;
  padding: 12px 20px;
  border-radius: 8px;
}

.smart-card.state-collapsed .card-header:hover {
  background: #F5F5F5;
}

.smart-card.state-collapsed .card-title h3 {
  font-size: 0.9rem;
  color: #666666;
}

/* 已完成状态样式 */
.smart-card.completed {
  background: #F8FDF8;
  border-color: #22C55E;
}

.smart-card.completed .card-header {
  background: #ECFDF5;
  border-bottom-color: #22C55E;
}

.smart-card.completed .card-title h3 {
  color: #16A34A;
}

.completed-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #22C55E;
  animation: completedPulse 2s ease-in-out;
}

@keyframes completedPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 已完成状态下的收起效果 */
.smart-card.completed.state-collapsed {
  background: #F0FDF4;
  border: 1px solid #22C55E;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
}

.smart-card.completed.state-collapsed:hover {
  background: #ECFDF5;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
  transform: translateY(-2px);
}

.smart-card.completed.state-collapsed .card-header {
  background: transparent;
  border-bottom: none;
}

.smart-card.completed.state-collapsed .card-header:hover {
  background: rgba(34, 197, 94, 0.05);
}

.smart-card.completed.state-collapsed .card-title h3 {
  color: #16A34A;
  font-weight: 600;
}

/* 收起状态下完成图标的样式 */
.smart-card.state-collapsed .completed-badge {
  margin-right: 0;
}

/* 已完成卡片的绿色左边框 */
.smart-card.completed.state-collapsed {
  border-left: 3px solid #22C55E;
}

/* 酒店卡片收起状态下的购买信息样式 */
.hotel-booking-summary {
  margin-top: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%);
  border: 1px solid #4CAF50;
  border-radius: 6px;
  font-size: 0.8rem;
}

.hotel-booking-summary .booking-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #2E7D32;
  font-weight: 500;
  margin-bottom: 4px;
}

.hotel-booking-summary .booking-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hotel-booking-summary .booking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333333;
  font-size: 0.75rem;
}

.hotel-booking-summary .booking-price {
  color: #2E7D32;
  font-weight: 500;
}

.hotel-booking-summary .more-bookings {
  color: #666666;
  font-size: 0.7rem;
  font-style: italic;
}
</style> 