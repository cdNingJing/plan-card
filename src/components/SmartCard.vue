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

        <!-- 商品卡片收起状态下的选中商品信息 -->
        <div v-if="card.type === 'shop' && card.state === 'collapsed' && selectedShopProducts.length > 0" class="shop-selected-summary">
          <div class="selected-count">
            <CheckCircle :size="14" />
            <span>{{ selectedShopProducts.length }}个商品已选中</span>
          </div>
          <div class="selected-preview">
            <span v-for="(item, idx) in selectedShopProducts.slice(0, 2)" :key="item.id" class="selected-item">
              {{ item.title }}
              <span class="selected-price">{{ item.currencySymbol || '¥' }}{{ item.price }}</span>
            </span>
            <span v-if="selectedShopProducts.length > 2" class="more-selected">
              +{{ selectedShopProducts.length - 2 }}个
            </span>
          </div>
        </div>
        
        <!-- 已选商品卡片收起状态下的购买信息 -->
        <div v-if="card.type === 'selected-products' && card.state === 'collapsed' && selectedShopProducts.length > 0" class="selected-products-summary">
          <div class="selected-count">
            <CheckCircle :size="14" />
            <span>{{ selectedShopProducts.length }}个商品待购买</span>
          </div>
          <div class="selected-preview">
            <span v-for="(item, idx) in selectedShopProducts.slice(0, 2)" :key="item.id" class="selected-item">
              {{ item.title }}
              <span class="selected-price">{{ item.currencySymbol || '¥' }}{{ item.price }}</span>
            </span>
            <span v-if="selectedShopProducts.length > 2" class="more-selected">
              +{{ selectedShopProducts.length - 2 }}个
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
      
      <!-- 会议确认卡片 -->
      <MeetingConfirmCard 
        v-else-if="card.type === 'meeting-confirm'"
        :data="card.data"
        @update="handleMeetingConfirmUpdate"
      />
      
      <!-- 会议信息整合卡片 -->
      <MeetingSummaryCard 
        v-else-if="card.type === 'meeting-summary'"
        :data="card.data"
        @update="handleMeetingSummaryUpdate"
        @next="handleMeetingSummaryNext"
      />
      
      <!-- 会议执行结果卡片 -->
      <MeetingResultCard 
        v-else-if="card.type === 'meeting-result'"
        :data="card.data"
        @update="handleMeetingResultUpdate"
      />
      
      <!-- 会议延期卡片 -->
      <MeetingPostponementCard 
        v-else-if="card.type === 'meeting-postponement'"
        :data="card.data"
        @update="handleMeetingPostponementUpdate"
        @next="handleMeetingPostponementNext"
      />
      
      <!-- 基础信息卡片 -->
      <BasicInfoCard 
        v-else-if="card.type === 'basic-info'"
        :scenario="card.data.scenario || 'general'"
        :initialData="getBasicInfoInitialData()"
        @submit="handleBasicInfoSubmit"
        @change="handleBasicInfoChange"
        @collapse="handleBasicInfoCollapse"
      />
      
      <!-- 商务行程概览卡片 -->
      <BusinessTravelCard 
        v-else-if="card.type === 'business-travel'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 通讯管理卡片 -->
      <CommunicationCard 
        v-else-if="card.type === 'communication'"
        :data="card.data"
        @update="handleUpdate"
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
      
      <!-- 提示卡片 -->
      <TipsCard 
        v-else-if="card.type === 'tips'"
        :data="card.data"
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
      
      <!-- 商品购买卡片 -->
      <template v-else-if="card.type === 'shop'">
        <ShopCard
          :data="card.data"
          :fullscreen="card.state === 'expanded'"
          @update="handleShopCardUpdate"
        />
      </template>
      
      <!-- 已选商品卡片 -->
      <template v-else-if="card.type === 'selected-products'">
        <SelectedProductsCard
          :fullscreen="card.state === 'expanded'"
          @update="handleSelectedProductsUpdate"
          @purchase="handleSelectedProductsPurchase"
          @addToCart="handleSelectedProductsAddToCart"
        />
      </template>
      
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
            :initialData="getBasicInfoInitialData()"
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
  Info,
  Briefcase,
  Mail
} from 'lucide-vue-next'
import { bookingStorage } from '@/utils/bookingStorage.js'
import MeetingConfirmCard from './cards/MeetingConfirmCard.vue'
import MeetingSummaryCard from './cards/MeetingSummaryCard.vue'
import MeetingResultCard from './cards/MeetingResultCard.vue'
import MeetingPostponementCard from './cards/MeetingPostponementCard.vue'

import DestinationCard from './cards/DestinationCard.vue'
import FlightCard from './cards/FlightCard.vue'
import HotelCard from './cards/HotelCard.vue'
import GiftCard from './cards/GiftCard.vue'
import BudgetCard from './cards/BudgetCard.vue'
import MeetingCard from './cards/MeetingCard.vue'
import GenericCard from './cards/GenericCard.vue'
import BasicInfoCard from './cards/BasicInfoCard.vue'
import TipsCard from './cards/TipsCard.vue'
import ShopCard from './cards/ShopCard.vue'
import SelectedProductsCard from './cards/SelectedProductsCard.vue'
import BusinessTravelCard from './cards/BusinessTravelCard.vue'
import CommunicationCard from './cards/CommunicationCard.vue'

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

// 获取已选商品数据
let selectedShopProducts = []
try {
  const raw = localStorage.getItem('selectedShopProducts')
  selectedShopProducts = raw ? JSON.parse(raw) : []
} catch (e) {
  selectedShopProducts = []
}

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
  Info,
  Briefcase,
  Mail
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
    'meeting-confirm': MeetingConfirmCard,
    'meeting-summary': MeetingSummaryCard,
    'meeting-result': MeetingResultCard,
    'basic-info': BasicInfoCard,
    tips: TipsCard,
    shop: ShopCard,
    'selected-products': SelectedProductsCard,
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

const getBasicInfoInitialData = () => {
  // 优先级：formData > 直接字段 > 空对象
  if (props.card.data.formData && Object.keys(props.card.data.formData).length > 0) {
    console.log('[SmartCard] 使用 formData 作为 initialData:', props.card.data.formData)
    return props.card.data.formData
  }
  
  // 如果没有 formData，检查是否有直接字段（从用户输入解析的实体信息）
  const directFields = {}
  const travelFields = ['departure', 'destination', 'startDate', 'endDate', 'travelers']
  const giftFields = ['recipient', 'occasion', 'budget', 'interests']
  const meetingFields = ['meetingTitle', 'meetingDate', 'startTime', 'participants', 'duration', 'location']
  
  // 根据场景检查相关字段
  const scenario = props.card.data.scenario || 'general'
  let relevantFields = []
  
  if (scenario === 'travel') {
    relevantFields = travelFields
  } else if (scenario === 'gift') {
    relevantFields = giftFields
  } else if (scenario === 'meeting') {
    relevantFields = meetingFields
  }
  
  // 提取相关字段
  relevantFields.forEach(field => {
    if (props.card.data[field] !== undefined) {
      directFields[field] = props.card.data[field]
    }
  })
  
  if (Object.keys(directFields).length > 0) {
    console.log('[SmartCard] 使用直接字段作为 initialData:', directFields)
    return directFields
  }
  
  console.log('[SmartCard] 没有找到 initialData，使用空对象')
  return {}
}

const handleShopCardUpdate = (payload) => {
  // 可根据需要处理 ShopCard 的 update 事件
}

const handleSelectedProductsUpdate = (payload) => {
  // 处理已选商品卡片的更新事件
  console.log('[SmartCard] 已选商品卡片更新:', payload)
}

const handleSelectedProductsPurchase = (payload) => {
  // 处理已选商品卡片的购买事件
  console.log('[SmartCard] 已选商品购买:', payload)
}

const handleMeetingConfirmUpdate = (payload) => {
  // 处理会议确认卡片的更新事件
  console.log('[SmartCard] 会议确认更新:', payload)
  
  if (payload.action === 'meetingReminderSent') {
    // 会议提醒发送成功
    console.log('[SmartCard] 会议提醒发送成功:', payload.data)
  } else if (payload.action === 'meetingReminderFailed') {
    // 会议提醒发送失败
    console.log('[SmartCard] 会议提醒发送失败:', payload.error)
  }
}

const handleMeetingSummaryUpdate = (payload) => {
  // 处理会议信息整合卡片的更新事件
  console.log('[SmartCard] 会议信息整合更新:', payload)
  
  if (payload.action === 'meetingReminderSent') {
    // 会议提醒发送成功，准备进入结果卡片
    console.log('[SmartCard] 会议提醒发送成功，准备显示结果:', payload)
    
    // 更新卡片数据，包含发送结果
    emit('update-data', props.card.id, {
      ...props.card.data,
      sendResult: {
        successCount: payload.meetingInfo?.attendees?.length || 0,
        sendTime: new Date().toISOString(),
        success: true
      }
    })
  } else if (payload.action === 'meetingReminderFailed') {
    // 会议提醒发送失败
    console.log('[SmartCard] 会议提醒发送失败:', payload.error)
  }
}

const handleMeetingSummaryNext = () => {
  // 处理会议信息整合卡片的下一步事件
  console.log('[SmartCard] 会议信息整合下一步')
  // 这里可以触发下一个卡片的激活
}

const handleMeetingResultUpdate = (payload) => {
  // 处理会议执行结果卡片的更新事件
  console.log('[SmartCard] 会议执行结果更新:', payload)
  
  if (payload.action === 'createNewMeeting') {
    // 创建新会议
    console.log('[SmartCard] 创建新会议')
  } else if (payload.action === 'viewMeetingDetails') {
    // 查看会议详情
    console.log('[SmartCard] 查看会议详情:', payload.meetingInfo)
  }
}

const handleMeetingPostponementUpdate = (payload) => {
  // 处理会议延期卡片的更新事件
  console.log('[SmartCard] 会议延期更新:', payload)
  
  if (payload.action === 'meetingPostponed') {
    // 会议延期成功
    console.log('[SmartCard] 会议延期成功:', payload)
    
    // 更新卡片数据，包含延期结果
    emit('update-data', props.card.id, {
      ...props.card.data,
      postponementResult: {
        success: true,
        originalDate: payload.postponementData.originalDate,
        originalTime: payload.postponementData.originalTime,
        newDate: payload.postponementData.newDate,
        newTime: payload.postponementData.newTime,
        reason: payload.postponementData.reason,
        processedAt: new Date().toISOString()
      }
    })
  } else if (payload.action === 'meetingPostponementFailed') {
    // 会议延期失败
    console.log('[SmartCard] 会议延期失败:', payload.error)
  } else if (payload.action === 'cancelPostponement') {
    // 取消延期
    console.log('[SmartCard] 取消会议延期:', payload.message)
  }
}

const handleMeetingPostponementNext = () => {
  // 处理会议延期卡片的下一步事件
  console.log('[SmartCard] 会议延期下一步')
  // 这里可以触发下一个卡片的激活
}

const handleSelectedProductsAddToCart = (payload) => {
  // 处理已选商品卡片的添加到购物车事件
  console.log('[SmartCard] 已选商品添加到购物车:', payload)
}

// 信息密集型卡片事件处理
const handleBookFlight = (flightInfo) => {
  console.log('[SmartCard] 预订航班:', flightInfo)
  // 这里可以触发航班预订流程
}

const handleBookHotel = (hotelInfo) => {
  console.log('[SmartCard] 预订酒店:', hotelInfo)
  // 这里可以触发酒店预订流程
}

const handleBookTransport = (transportInfo) => {
  console.log('[SmartCard] 预订交通:', transportInfo)
  // 这里可以触发交通预订流程
}

const handleRescheduleEvent = (eventId) => {
  console.log('[SmartCard] 重新安排事件:', eventId)
  // 这里可以触发事件重新安排流程
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

/* 商品卡片收起状态下的选中商品信息样式 */
.shop-selected-summary {
  padding: 10px 18px 8px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #f0f0f0;
}

.selected-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #3182ce;
  font-weight: 500;
}

.selected-preview {
  margin-top: 4px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.selected-item {
  font-size: 13px;
  color: #222;
  background: #eaf4ff;
  border-radius: 4px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.selected-price {
  color: #e53e3e;
  font-weight: bold;
  margin-left: 2px;
}

.more-selected {
  color: #888;
  font-size: 13px;
  align-self: center;
}

/* 已选商品卡片收起状态下的购买信息样式 */
.selected-products-summary {
  padding: 10px 18px 8px 18px;
  background: #f0f8f0;
  border-bottom: 1px solid #e8f5e8;
}

.selected-products-summary .selected-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #28a745;
  font-weight: 500;
}

.selected-products-summary .selected-preview {
  margin-top: 4px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.selected-products-summary .selected-item {
  font-size: 13px;
  color: #222;
  background: #e8f5e8;
  border-radius: 4px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.selected-products-summary .selected-price {
  color: #e53e3e;
  font-weight: bold;
  margin-left: 2px;
}
</style> 