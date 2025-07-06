<template>
  <div class="flight-card">
    <div class="flight-filters" v-if="fullscreen">
      <div class="filter-row">
        <div class="filter-group">
          <label>出发时间</label>
          <select v-model="filters.timePreference" @change="handleFilterChange">
            <option 
              v-for="option in filterOptions.timePreference" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>价格范围</label>
          <select v-model="filters.priceRange" @change="handleFilterChange">
            <option 
              v-for="option in filterOptions.priceRange" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>航空公司</label>
          <select v-model="filters.airline" @change="handleFilterChange">
            <option 
              v-for="option in filterOptions.airline" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 预订状态提示 -->
    <div v-if="isMultiTrip && currentTripPhase === 'return'" class="booking-status">
      <div class="status-info">
        <span class="status-label">返程航班选择</span>
        <span class="status-desc">请选择返程航班完成预订</span>
      </div>
    </div>

    <!-- 预订成功状态显示 -->
    <div v-if="!fullscreen && recentBookings.length > 0" class="booking-success-section">
      <div class="success-header">
        <div class="success-icon">
          <CheckCircle :size="20" />
        </div>
        <div class="success-title">
          <h4>预订成功</h4>
          <p>您的机票已确认</p>
        </div>
        <button class="re-search-btn" @click="startNewSearch">
          重新搜索
        </button>
      </div>
      
      <div class="success-bookings">
        <div 
          v-for="booking in recentBookings" 
          :key="booking.id"
          class="success-booking-card"
        >
          <div class="booking-card-header">
            <div class="booking-id">订单号: {{ booking.id }}</div>
            <div class="booking-status">已确认</div>
          </div>
          
          <div class="booking-card-content">
            <div class="flight-routes">
              <div 
                v-for="(flight, index) in booking.flights" 
                :key="index"
                class="flight-route-item-booking"
              >
                <div class="route-info">
                  <div class="route-cities-booking">
                    <span class="departure-booking">{{ flight.departureAirport }}</span>
                    <span class="arrow-booking">{{ booking.isMultiTrip ? '↔' : '→' }}</span>
                    <span class="arrival-booking">{{ flight.arrivalAirport }}</span>
                  </div>
                  <div class="flight-details-booking">
                    <span class="airline-booking">{{ flight.airline }} {{ flight.flightNumber }}</span>
                    <span class="date-booking">{{ formatDate(flight.departureDate) }}</span>
                  </div>
                </div>
                <div class="route-price-booking">
                  ¥{{ formatPrice(flight.price) }}
                </div>
              </div>
            </div>
            
            <div class="booking-summary">
              <div class="summary-item">
                <span class="label">总价</span>
                <span class="value total-price">¥{{ formatPrice(booking.totalPrice) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">预订时间</span>
                <span class="value">{{ formatBookingDate(booking.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 航班列表/empty-state -->
    <div v-if="!fullscreen && recentBookings.length === 0" class="flight-list" :class="{ 'scrollable': !fullscreen }">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>正在搜索航班...</span>
      </div>
      <div v-else-if="filteredFlights.length === 0" class="empty-state">
        <span>暂无符合条件的航班</span>
      </div>
      <div v-else v-for="flight in filteredFlights" :key="flight.id" class="flight-item">
        <div class="flight-header">
          <div class="airline-section">
            <div class="airline-logo">
              <img 
                :src="flight.airlineIcon || getAirlineLogo(flight.airline)" 
                :alt="flight.airline"
                @error="handleImageError"
                @load="handleImageLoad"
              />
            </div>
            <div class="airline-info">
              <span class="airline-name">{{ flight.airline }}</span>
              <span class="flight-number">{{ flight.airlineCode }} {{ flight.flightNumber }}</span>
            </div>
          </div>
          <div class="flight-date">
            <span class="date">{{ formatDate(flight.departureDate) }}</span>
            <span class="day">{{ getDayOfWeek(flight.departureDate) }}</span>
          </div>
        </div>
        
        <div class="flight-route">
          <div class="route-info">
            <div class="departure">
              <div class="time">{{ flight.departureTime }}</div>
              <div class="airport-code">{{ flight.departureAirport }}</div>
              <div class="airport-name">{{ flight.departureAirportName }}</div>
            </div>
            
            <div class="flight-path">
              <div class="path-line">
                <div class="path-dot departure-dot"></div>
                <div class="path-line-segment"></div>
                <Plane :size="20" class="plane-icon" />
                <div class="path-line-segment"></div>
                <div class="path-dot arrival-dot"></div>
              </div>
              <div class="duration">{{ flight.duration }}</div>
            </div>
            
            <div class="arrival">
              <div class="time">{{ flight.arrivalTime }}</div>
              <div class="airport-code">{{ flight.arrivalAirport }}</div>
              <div class="airport-name">{{ flight.arrivalAirportName }}</div>
            </div>
          </div>
        </div>
        
        <div class="flight-details">
          <div class="detail-item">
            <span class="label">机型</span>
            <span class="value">{{ flight.aircraft }}</span>
          </div>
          <div class="detail-item">
            <span class="label">中转</span>
            <span class="value" v-if="flight.stops > 0">{{ flight.stops }}次</span>
            <span class="value direct" v-else>直飞</span>
          </div>
          <div class="detail-item">
            <span class="label">舱位</span>
            <span class="value">{{ flight.cabinClass }}</span>
          </div>
        </div>
        
        <div class="flight-price-section">
          <div class="price-info">
            <div class="price-main">
              <span class="currency">{{ flight.priceCurrency || '¥' }}</span>
              <span class="price">{{ formatPrice(flight.price) }}</span>
            </div>
            <div class="price-details">
              <span class="tax">含税</span>
              <span class="per-person">/人</span>
            </div>
          </div>
          
          <div class="flight-actions">
            <button class="action-btn primary" @click="selectFlight(flight)">
              <Calendar :size="16" />
              预订
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flight-tips" v-if="!fullscreen && recentBookings.length === 0">
      <div class="tip-item">
        <Lightbulb :size="16" />
        <span>建议提前2小时到达机场办理登机手续</span>
      </div>
    </div>
    
    <!-- 确认支付弹窗 -->
    <div v-if="showPaymentModal" class="payment-modal-overlay" @click="closePaymentModal">
      <div class="payment-modal" @click.stop>
        <div class="modal-header">
          <h3>确认支付</h3>
          <button class="close-btn" @click="closePaymentModal">×</button>
        </div>
        
        <div class="modal-content">
          <div class="booking-summary">
            <h4>预订详情</h4>
            <div class="flight-summary" v-for="(flight, index) in selectedFlights" :key="index">
              <div class="flight-route-info">
                <span class="route">{{ flight.departureAirport }} → {{ flight.arrivalAirport }}</span>
                <span class="date">{{ formatDate(flight.departureDate) }}</span>
              </div>
              <div class="flight-detail">
                <span class="airline">{{ flight.airline }} {{ flight.flightNumber }}</span>
                <span class="time">{{ flight.departureTime }} - {{ flight.arrivalTime }}</span>
              </div>
            </div>
          </div>
          
          <div class="price-summary">
            <div class="price-item">
              <span>机票费用</span>
              <span>¥{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="price-item total">
              <span>总计</span>
              <span>¥{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="cancel-btn" @click="closePaymentModal">取消</button>
          <button class="confirm-btn" @click="confirmPayment" :disabled="isProcessing">
            {{ isProcessing ? '处理中...' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Plane, Calendar, Lightbulb, CheckCircle } from 'lucide-vue-next'
import { useUserInfoStore } from '@/stores/userInfoStore.js'
import { searchFlights, formatFlightData } from '@/api/flightApi.js'
import { bookingStorage } from '@/utils/bookingStorage.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])

const userInfoStore = useUserInfoStore()

// 预订相关状态
const selectedFlights = ref([]) // 已选择的航班
const isMultiTrip = ref(false) // 是否为往返行程
const currentTripPhase = ref('outbound') // 当前选择阶段：outbound(去程) / return(返程)
const showPaymentModal = ref(false) // 是否显示支付弹窗
const isProcessing = ref(false) // 是否正在处理支付
const recentBookings = ref([]) // 最近的预订记录

// 加载最近的预订记录
const loadRecentBookings = () => {
  recentBookings.value = bookingStorage.getRecentBookings(3)
  console.log('[FlightCard] 加载最近的预订记录:', recentBookings.value)
}

// 开始新的搜索
const startNewSearch = async () => {
  console.log('[FlightCard] 开始新的航班搜索')
  
  // 清空预订记录显示
  recentBookings.value = []
  
  // 检查行程类型
  checkTripType()
  
  // 重置过滤器
  resetFilters()
  
  // 初始化航班数据
  await initFlights()
  
  // 通知父组件
  emit('update', {
    action: 'startNewSearch',
    message: '开始新的航班搜索'
  })
}

// 检查是否为往返行程
const checkTripType = () => {
  const userInfo = userInfoStore.getScenarioInfo('travel')
  const hasStartDate = userInfo.startDate && userInfo.startDate.trim() !== ''
  const hasEndDate = userInfo.endDate && userInfo.endDate.trim() !== ''
  
  isMultiTrip.value = hasStartDate && hasEndDate
  console.log('[FlightCard] 行程类型检查:', {
    hasStartDate,
    hasEndDate,
    isMultiTrip: isMultiTrip.value
  })
}

// 选择航班
const selectFlight = (flight) => {
  if (isMultiTrip.value) {
    // 往返行程：分阶段选择
    if (currentTripPhase.value === 'outbound') {
      selectedFlights.value = [flight]
      currentTripPhase.value = 'return'
      console.log('[FlightCard] 已选择去程航班，准备选择返程航班')
      
      // 获取返程航班数据
      fetchReturnFlights(flight)
    } else {
      // 选择返程航班，完成预订
      selectedFlights.value.push(flight)
      showBookingConfirmation()
    }
  } else {
    // 单程行程：直接选择
    selectedFlights.value = [flight]
    showBookingConfirmation()
  }
}

// 获取返程航班数据
const fetchReturnFlights = async (outboundFlight) => {
  try {
    const userInfo = userInfoStore.getScenarioInfo('travel')
    const returnDate = userInfo.endDate
    
    if (!returnDate) {
      console.error('[FlightCard] 返程日期未设置')
      return
    }
    
    loading.value = true
    
    // 交换出发地和目的地
    const searchParams = {
      from: getAirportCode(userInfo.destination || '东京'),
      to: getAirportCode(userInfo.departure || '成都'),
      date: returnDate,
      adults: 1,
      cabinClass: 'economy',
      trip: 'ONE_WAY',
      is_code: true
    }
    
    console.log('[FlightCard] 搜索返程航班参数:', searchParams)
    
    const result = await searchFlights(searchParams)
    
    if (result.success && result.data && result.data.items) {
      const formattedFlights = formatFlightData(result.data.items)
      allFlights.value = analyzeAndRecommendFlights(formattedFlights)
      generateFilterOptions(allFlights.value)
      
      console.log('[FlightCard] 返程航班数据已更新')
    }
  } catch (error) {
    console.error('[FlightCard] 获取返程航班失败:', error)
  } finally {
    loading.value = false
  }
}

// 显示预订确认弹窗
const showBookingConfirmation = () => {
  console.log('[FlightCard] 显示预订确认弹窗')
  showPaymentModal.value = true
}

// 关闭支付弹窗
const closePaymentModal = () => {
  showPaymentModal.value = false
  isProcessing.value = false
}

// 确认支付
const confirmPayment = async () => {
  isProcessing.value = true
  
  try {
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('[FlightCard] 支付成功！')
    
    const bookingData = {
      flights: selectedFlights.value,
      isMultiTrip: isMultiTrip.value,
      totalPrice: totalPrice.value,
      userInfo: userInfoStore.getScenarioInfo('travel')
    }
    
    // 保存预订记录到本地存储
    const savedBooking = bookingStorage.addBooking(bookingData)
    
    // 更新最近的预订记录
    loadRecentBookings()
    
    // 关闭弹窗
    showPaymentModal.value = false
    
    // 显示成功提示
    alert('预订成功！支付已完成。')
    
    // 重置选择状态
    selectedFlights.value = []
    currentTripPhase.value = 'outbound'
    
    // 通知父组件
    emit('update', {
      action: 'bookingSuccess',
      bookingData: savedBooking
    })
  } catch (error) {
    console.error('[FlightCard] 支付失败:', error)
    alert('支付失败，请重试。')
  } finally {
    isProcessing.value = false
  }
}

const filters = reactive({
  timePreference: 'any',
  priceRange: 'any',
  airline: 'any'
})

// 动态过滤选项
const filterOptions = reactive({
  timePreference: [
    { value: 'any', label: '任意时间' },
    { value: 'morning', label: '上午 (06:00-12:00)' },
    { value: 'afternoon', label: '下午 (12:00-18:00)' },
    { value: 'evening', label: '晚上 (18:00-24:00)' }
  ],
  priceRange: [
    { value: 'any', label: '任意价格' }
  ],
  airline: [
    { value: 'any', label: '不限' }
  ]
})

// 从API获取航班数据
const fetchFlightsFromAPI = async (departure, destination, customDate = null) => {
  try {
    const departureCode = getAirportCode(departure)
    const destinationCode = getAirportCode(destination)
    
    // 优先使用用户设置的日期，否则使用默认日期
    let date
    if (customDate) {
      date = customDate
    } else {
      const userInfo = userInfoStore.getScenarioInfo('travel')
      if (userInfo.startDate) {
        date = userInfo.startDate
      } else {
        // 获取当前日期
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        date = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD格式
      }
    }
    
    const searchParams = {
      from: departureCode,
      to: destinationCode,
      date: date,
      adults: 1,
      cabinClass: 'economy',
      trip: 'ONE_WAY',
      is_code: true
    }
    
    console.log('[FlightCard] 搜索航班参数:', searchParams)
    
    const result = await searchFlights(searchParams)
    
    if (result.success && result.data && result.data.items) {
      const formattedFlights = formatFlightData(result.data.items)
      console.log('[FlightCard] API返回航班数据:', formattedFlights)
      return formattedFlights
    } else {
      console.warn('[FlightCard] API返回数据格式异常:', result)
      return []
    }
  } catch (error) {
    console.error('[FlightCard] 获取航班数据失败:', error)
    return []
  }
}

// 获取机场代码
const getAirportCode = (city) => {
  const codeMap = {
    '成都': 'CTU',
    '北京': 'PEK',
    '上海': 'SHA',
    '广州': 'CAN',
    '深圳': 'SZX',
    '杭州': 'HGH',
    '南京': 'NKG',
    '西安': 'XIY',
    '重庆': 'CKG',
    '武汉': 'WUH',
    '东京': 'NRT',
    '大阪': 'KIX',
    '首尔': 'ICN',
    '新加坡': 'SIN',
    '曼谷': 'BKK',
    '香港': 'HKG',
    '台北': 'TPE'
  }
  return codeMap[city] || 'XXX'
}

// 扩展的航班数据
const allFlights = ref([])
const loading = ref(false)

// 初始化航班数据
const initFlights = async () => {
  const departure = userInfoStore.departure || '成都'
  const destination = userInfoStore.destination || '东京'
  
  loading.value = true
  try {
    const flights = await fetchFlightsFromAPI(departure, destination)
    allFlights.value = flights
    
    // 生成动态过滤选项
    generateFilterOptions(allFlights.value)
    
    console.log(`[FlightCard] 初始化航班数据: ${departure} -> ${destination}`, flights)
  } catch (error) {
    console.error('[FlightCard] 初始化航班数据失败:', error)
    allFlights.value = []
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取星期几
const getDayOfWeek = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[date.getDay()]
}

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0'
  return typeof price === 'number' ? price.toLocaleString() : price.toString()
}

// 格式化预订日期
const formatBookingDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
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

// 动态生成过滤选项
const generateFilterOptions = (flights) => {
  if (!flights || flights.length === 0) return
  
  // 生成航空公司选项
  const airlines = [...new Set(flights.map(flight => flight.airline))].filter(Boolean)
  filterOptions.airline = [
    { value: 'any', label: '不限' },
    ...airlines.map(airline => ({
      value: airline,
      label: airline
    }))
  ]
  
  // 生成价格范围选项
  const prices = flights.map(flight => flight.price || flight.priceValue || 0).filter(p => p > 0)
  if (prices.length > 0) {
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    
    const priceRanges = []
    
    // 低价位 (低于平均价格的80%)
    if (minPrice < avgPrice * 0.8) {
      const lowMax = Math.floor(avgPrice * 0.8)
      priceRanges.push({
        value: 'low',
        label: `经济舱 (¥${minPrice.toLocaleString()}-${lowMax.toLocaleString()})`
      })
    }
    
    // 中价位 (平均价格的80%-120%)
    const midMin = Math.floor(avgPrice * 0.8)
    const midMax = Math.ceil(avgPrice * 1.2)
    if (midMin < midMax) {
      priceRanges.push({
        value: 'medium',
        label: `标准舱 (¥${midMin.toLocaleString()}-${midMax.toLocaleString()})`
      })
    }
    
    // 高价位 (高于平均价格的120%)
    if (maxPrice > avgPrice * 1.2) {
      const highMin = Math.floor(avgPrice * 1.2)
      priceRanges.push({
        value: 'high',
        label: `高端舱 (¥${highMin.toLocaleString()}+)`
      })
    }
    
    filterOptions.priceRange = [
      { value: 'any', label: '任意价格' },
      ...priceRanges
    ]
  }
  
  console.log('[FlightCard] 生成的过滤选项:', filterOptions)
}

// 智能推荐分析函数
const analyzeAndRecommendFlights = (flights) => {
  if (!flights || flights.length === 0) return []
  
  // 获取用户信息
  const userInfo = userInfoStore.getScenarioInfo('travel')
  
  // 计算每个航班的综合评分
  const scoredFlights = flights.map(flight => {
    let score = 0
    const reasons = []
    
    // 1. 价格评分 (30%)
    const price = flight.price || flight.priceValue || 0
    const prices = flights.map(f => f.price || f.priceValue || 0).filter(p => p > 0)
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const priceScore = price <= avgPrice * 0.8 ? 30 : price <= avgPrice ? 20 : 10
    score += priceScore
    if (priceScore >= 20) reasons.push('价格优惠')
    
    // 2. 时间评分 (25%)
    const hour = parseInt(flight.departureTime?.split(':')[0] || '12')
    let timeScore = 0
    if (hour >= 8 && hour <= 18) {
      timeScore = 25 // 黄金时段
      reasons.push('黄金时段')
    } else if (hour >= 6 && hour <= 22) {
      timeScore = 15 // 正常时段
      reasons.push('合适时间')
    } else {
      timeScore = 5 // 深夜/凌晨
    }
    score += timeScore
    
    // 3. 航空公司评分 (20%)
    let airlineScore = 0
    if (userInfo.preferences && userInfo.preferences.airline) {
      if (flight.airline === userInfo.preferences.airline) {
        airlineScore = 20
        reasons.push('您偏好的航空公司')
      }
    } else {
      // 根据航空公司知名度评分
      const premiumAirlines = ['中国国际航空', '中国东方航空', '中国南方航空', '国泰航空', '新加坡航空']
      if (premiumAirlines.includes(flight.airline)) {
        airlineScore = 15
        reasons.push('知名航空公司')
      } else {
        airlineScore = 10
      }
    }
    score += airlineScore
    
    // 4. 直飞加分 (15%)
    if (flight.stops === 0) {
      score += 15
      reasons.push('直飞航班')
    } else {
      score += 5
    }
    
    // 5. 会员优惠 (10%)
    if (userInfo.memberLevel) {
      const discount = userInfo.memberLevel === 'gold' ? 0.9 : 0.95
      const discountedPrice = Math.round(price * discount)
      flight.priceValue = discountedPrice
      flight.price = discountedPrice
      score += 10
      reasons.push(`${userInfo.memberLevel}会员优惠`)
    }
    
    return {
      ...flight,
      score,
      reasons,
      recommended: false // 初始不推荐
    }
  })
  
  // 按评分排序
  scoredFlights.sort((a, b) => b.score - a.score)
  
  // 不再选择最佳航班作为推荐
  console.log(`[FlightCard] 航班分析完成，共${scoredFlights.length}个航班`)
  
  return scoredFlights
}

// 获取航空公司logo
const getAirlineLogo = (airline) => {
  const logoMap = {
    '中国国际航空': '/images/airlines/air-china.png',
    '中国东方航空': '/images/airlines/china-eastern.png',
    '中国南方航空': '/images/airlines/china-southern.png'
  }
  return logoMap[airline] || '/images/airlines/default.png'
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = '/images/airlines/default.png'
}

// 处理图片加载成功
const handleImageLoad = (event) => {
  // 图片加载成功，可以在这里添加加载完成的逻辑
}

// 根据用户信息刷新航班数据
const refreshFlightsByUser = async () => {
  // 如果已有预订记录，不需要刷新航班数据
  if (recentBookings.value.length > 0) {
    console.log('[FlightCard] 检测到已有预订记录，跳过航班数据刷新')
    return
  }
  
  try {
    const departure = userInfoStore.departure || '成都'
    const destination = userInfoStore.destination || '东京'
    
    loading.value = true
    
    // 从API重新获取航班数据
    const flights = await fetchFlightsFromAPI(departure, destination)
    
    // 应用智能推荐分析
    allFlights.value = analyzeAndRecommendFlights(flights)
    
    // 生成动态过滤选项
    generateFilterOptions(allFlights.value)
    
    // 重新检查行程类型
    checkTripType()
    
    console.log(`[FlightCard] 刷新航班数据: ${departure} -> ${destination}`)
    
    // 触发更新事件
    emit('update', {
      userChanged: true,
      filteredCount: filteredFlights.value.length
    })
  } catch (error) {
    console.error('[FlightCard] Error in refreshFlightsByUser:', error)
  } finally {
    loading.value = false
  }
}

// 计算总价格
const totalPrice = computed(() => {
  return selectedFlights.value.reduce((sum, flight) => sum + (flight.price || 0), 0)
})

const filteredFlights = computed(() => {
  const filtered = allFlights.value.filter(flight => {
    // 时间筛选
    if (filters.timePreference !== 'any' && flight.timeCategory !== filters.timePreference) {
      return false
    }
    
    // 航空公司筛选
    if (filters.airline !== 'any' && flight.airline !== filters.airline) {
      return false
    }
    
    // 价格筛选
    const price = flight.price || flight.priceValue || 0
    if (filters.priceRange === 'low') {
      const prices = allFlights.value.map(f => f.price || f.priceValue || 0).filter(p => p > 0)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      if (price >= avgPrice * 0.8) {
        return false
      }
    }
    if (filters.priceRange === 'medium') {
      const prices = allFlights.value.map(f => f.price || f.priceValue || 0).filter(p => p > 0)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      if (price < avgPrice * 0.8 || price > avgPrice * 1.2) {
        return false
      }
    }
    if (filters.priceRange === 'high') {
      const prices = allFlights.value.map(f => f.price || f.priceValue || 0).filter(p => p > 0)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      if (price <= avgPrice * 1.2) {
      return false
      }
    }
    
    return true
  })
  
  // 打印半屏状态下的机票数量
  if (!props.fullscreen) {
    console.log(`[FlightCard] 半屏状态显示机票数量: ${filtered.length} 条`)
  }
  
  return filtered
})

const handleFilterChange = () => {
  try {
    emit('update', {
      filters: { ...filters },
      filteredCount: filteredFlights.value.length
    })
  } catch (error) {
    console.error('Error in handleFilterChange:', error)
  }
}

// 重置过滤器为默认值
const resetFilters = () => {
  // 重置所有过滤条件
  filters.timePreference = 'any'
  filters.priceRange = 'any'
  filters.airline = 'any'
  
  // 触发更新事件，通知父组件过滤器已重置
  emit('update', {
    filters: { ...filters },
    filteredCount: filteredFlights.value.length,
    reset: true
  })
  
  console.log('[FlightCard] 退出全屏：所有过滤器已清空重置')
}

// 监听用户信息变化
watch(() => userInfoStore.destination, async (newDestination, oldDestination) => {
  try {
    if (newDestination && newDestination !== oldDestination) {
      console.log(`[FlightCard] 检测到目的地变化: ${oldDestination} -> ${newDestination}`)
      await refreshFlightsByUser()
    }
  } catch (error) {
    console.error('[FlightCard] Error in destination watch:', error)
  }
}, { immediate: false })

// 监听出发地变化
watch(() => userInfoStore.departure, async (newDeparture, oldDeparture) => {
  try {
    if (newDeparture && newDeparture !== oldDeparture) {
      console.log(`[FlightCard] 检测到出发地变化: ${oldDeparture} -> ${newDeparture}`)
      await refreshFlightsByUser()
    }
  } catch (error) {
    console.error('[FlightCard] Error in departure watch:', error)
  }
}, { immediate: false })

// 监听日期变化，重新检查行程类型
watch(() => userInfoStore.getScenarioInfo('travel'), (newUserInfo, oldUserInfo) => {
  try {
    const oldStartDate = oldUserInfo?.startDate
    const oldEndDate = oldUserInfo?.endDate
    const newStartDate = newUserInfo?.startDate
    const newEndDate = newUserInfo?.endDate
    
    if (oldStartDate !== newStartDate || oldEndDate !== newEndDate) {
      console.log('[FlightCard] 检测到日期变化，重新检查行程类型')
      checkTripType()
      
      // 如果从单程变为往返，重置选择状态
      if (!isMultiTrip.value && oldStartDate !== newStartDate && oldEndDate !== newEndDate) {
        selectedFlights.value = []
        currentTripPhase.value = 'outbound'
      }
    }
  } catch (error) {
    console.error('[FlightCard] Error in userInfo watch:', error)
  }
}, { deep: true, immediate: false })

// 监听 filters 变化，自动触发筛选
watch(filters, () => {
  try {
    handleFilterChange()
  } catch (error) {
    console.error('Error in filters watch:', error)
  }
}, { deep: true, immediate: false })

// 监听props变化
watch(() => props.data, (newData) => {
  try {
    if (newData && newData.filters) {
      Object.assign(filters, newData.filters)
    }
  } catch (error) {
    console.error('[FlightCard] Error in data watch:', error)
  }
}, { deep: true, immediate: false })

// 监听筛选结果变化，打印半屏状态下的机票数量
watch(filteredFlights, (newFilteredFlights) => {
  if (!props.fullscreen) {
    console.log(`[FlightCard] 半屏状态机票数量更新: ${newFilteredFlights.length} 条`)
  }
}, { immediate: true })

// 监听全屏状态变化，退出全屏时重置过滤器
watch(() => props.fullscreen, (newFullscreen, oldFullscreen) => {
  console.log(`[FlightCard] 全屏状态变化: ${oldFullscreen} -> ${newFullscreen}`)
  
  // 从全屏状态退出时重置过滤器
  if (oldFullscreen && !newFullscreen) {
    console.log('[FlightCard] 检测到退出全屏，开始重置过滤器...')
    resetFilters()
  }
}, { immediate: false })

// 组件初始化
onMounted(async () => {
  // 从本地存储加载用户信息
  userInfoStore.loadFromStorage()
  
  // 加载最近的预订记录
  loadRecentBookings()
  
  // 如果已有预订记录，不需要初始化航班数据
  if (recentBookings.value.length > 0) {
    console.log('[FlightCard] 检测到已有预订记录，跳过航班数据初始化')
    return
  }
  
  // 检查行程类型
  checkTripType()
  
  // 确保过滤器为默认状态
  resetFilters()
  
  // 初始化航班数据
  await initFlights()
  
  console.log('[FlightCard] 组件初始化完成，过滤器已重置为默认状态')
})
</script>

<style scoped>
.flight-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.booking-status {
  background: #E8F5E8;
  border: 1px solid #4CAF50;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2E7D32;
}

.status-desc {
  font-size: 0.8rem;
  color: #388E3C;
}

.flight-filters {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #E5E5E5;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #FFFFFF;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: #333333;
}

.flight-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flight-list.scrollable {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.flight-list.scrollable::-webkit-scrollbar {
  width: 4px;
}

.flight-list.scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.flight-list.scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.flight-list.scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.flight-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
}

.flight-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.flight-item.recommended {
  border-color: #333333;
  background: #FAFAFA;
}

.flight-item.recommended::before {
  content: '推荐';
  position: absolute;
  top: -1px;
  right: 16px;
  background: #333333;
  color: #FFFFFF;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 0 0 4px 4px;
}

.flight-item.recommended::after {
  content: attr(data-reasons);
  position: absolute;
  top: 20px;
  right: 16px;
  background: rgba(51, 51, 51, 0.9);
  color: #FFFFFF;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.flight-item.recommended:hover::after {
  opacity: 1;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.airline-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.airline-logo {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
}

.airline-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.airline-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.airline-name {
  font-weight: 600;
  color: #333333;
}

.flight-number {
  font-size: 0.875rem;
  color: #666666;
  background: #F0F0F0;
  padding: 2px 6px;
  border-radius: 4px;
}

.flight-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.date {
  font-size: 0.875rem;
  color: #666666;
}

.day {
  font-size: 0.75rem;
  color: #999999;
}

.flight-route {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.departure,
.arrival {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.time {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333333;
}

.airport-code {
  font-size: 0.75rem;
  color: #999999;
}

.airport-name {
  font-size: 0.75rem;
  color: #666666;
}

.flight-path {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.path-line {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 200px;
}

.path-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #333333;
}

.path-line-segment {
  flex-grow: 1;
  height: 1px;
  background-color: #333333;
}

.plane-icon {
  width: 20px;
  height: 20px;
}

.duration {
  font-size: 0.875rem;
  color: #666666;
}

.flight-details {
  display: flex;
  justify-content: space-around;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #F0F0F0;
  border-bottom: 1px solid #F0F0F0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.label {
  font-size: 0.875rem;
  color: #666666;
}

.value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333333;
}

.value.direct {
  color: #333333;
  font-weight: 500;
}

.flight-price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
}

.price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.price-main {
  display: flex;
  align-items: center;
  gap: 4px;
}

.currency {
  font-size: 0.875rem;
  color: #666666;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.price-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.tax {
  font-size: 0.75rem;
  color: #999999;
}

.per-person {
  font-size: 0.75rem;
  color: #999999;
}

.flight-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

.action-btn.primary:hover {
  background: #222222;
}

.action-btn.secondary {
  background: #FFFFFF;
  color: #666666;
}

.action-btn.secondary:hover {
  background: #F8F9FA;
  color: #333333;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666666;
  font-size: 0.875rem;
}

.loading-state {
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #E5E5E5;
  border-top: 2px solid #333333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.flight-tips {
  background: #F8F9FA;
  border-radius: 6px;
  padding: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #666666;
}

/* 支付弹窗样式 */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal {
  background: #FFFFFF;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E5E5;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333333;
}

.modal-content {
  padding: 24px;
}

.booking-summary h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.flight-summary {
  padding: 12px;
  background: #F8F9FA;
  border-radius: 8px;
  margin-bottom: 12px;
}

.flight-route-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.route {
  font-weight: 600;
  color: #333333;
}

.date {
  font-size: 0.875rem;
  color: #666666;
}

.flight-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.airline {
  color: #333333;
}

.time {
  color: #666666;
}

.price-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E5E5;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #666666;
}

.price-item.total {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E5E5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #E5E5E5;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  color: #666666;
}

.cancel-btn:hover {
  background: #F8F9FA;
  color: #333333;
}

.confirm-btn {
  background: #333333;
  border: 1px solid #333333;
  color: #FFFFFF;
}

.confirm-btn:hover:not(:disabled) {
  background: #222222;
}

.confirm-btn:disabled {
  background: #CCCCCC;
  border-color: #CCCCCC;
  cursor: not-allowed;
}

/* 预订成功状态样式 */
.booking-success-section {
  background: linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%);
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.booking-success-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A, #81C784);
}

.success-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.re-search-btn {
  margin-left: auto;
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid #4CAF50;
  border-radius: 6px;
  color: #4CAF50;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.re-search-btn:hover {
  background: #4CAF50;
  color: #FFFFFF;
}

.success-icon {
  width: 40px;
  height: 40px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.success-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2E7D32;
}

.success-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #388E3C;
}

.success-bookings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.success-booking-card {
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E8F5E8;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}

.booking-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #F1F8E9;
  border-bottom: 1px solid #E8F5E8;
}

.booking-id {
  font-size: 0.8rem;
  color: #666666;
  font-family: monospace;
}

.booking-status {
  background: #4CAF50;
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.booking-card-content {
  padding: 16px;
}

.flight-routes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.flight-route-item-booking {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #FAFAFA;
  border-radius: 6px;
  border-left: 3px solid #4CAF50;
  margin-bottom: 8px;
}

.route-info {
  flex: 1;
}

.route-cities-booking {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.departure-booking,
.arrival-booking {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.arrow-booking {
  font-size: 1rem;
  color: #4CAF50;
  font-weight: bold;
}

.flight-details-booking {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
  color: #666666;
  flex-direction: column;
}

.airline-booking {
  font-weight: 500;
}

.date-booking {
  color: #999999;
}

.route-price-booking {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333333;
  background: #E8F5E8;
  padding: 3px 6px;
  border-radius: 3px;
}

.booking-summary {
  border-top: 1px solid #E8F5E8;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  font-size: 0.875rem;
  color: #666666;
}

.summary-item .value {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 500;
}

.summary-item .total-price {
  font-size: 1rem;
  font-weight: 600;
  color: #2E7D32;
}

/* 无需搜索航班提示 */
.no-flight-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #F8F9FA;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4CAF50;
  font-size: 0.875rem;
  font-weight: 500;
}

</style> 