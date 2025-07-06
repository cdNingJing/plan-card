<template>
  <div class="hotel-card">
    <div class="hotel-filters" v-if="fullscreen">
      <div class="filter-row">
        <div class="filter-group">
          <label>价格范围</label>
          <select v-model="filters.priceRange" @change="handleFilterChange">
            <option v-for="option in filterOptions.priceRange" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>评分要求</label>
          <select v-model="filters.rating" @change="handleFilterChange">
            <option v-for="option in filterOptions.rating" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 酒店列表/empty-state -->
    <div v-if="!fullscreen && recentBookings.length === 0" class="hotel-list" :class="{ 'scrollable': !fullscreen }">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>正在加载酒店数据...</span>
      </div>
      <div v-else-if="error || filteredHotels.length === 0" class="empty-state">
        <span>{{ error || '暂无酒店数据' }}</span>
      </div>
      <div 
        v-for="hotel in filteredHotels" 
        :key="hotel.id"
        class="hotel-item"
      >
        <div class="hotel-image">
          <img 
            v-if="hotel.image" 
            :src="hotel.image" 
            :alt="hotel.name"
            class="hotel-image"
            @error="handleImageError"
          />
          <div v-else class="image-placeholder">
            <Building :size="32" />
          </div>
          <div class="hotel-badges">
            <span v-if="hotel.freeWifi" class="badge wifi">免费WiFi</span>
          </div>
        </div>
        
        <div class="hotel-content">
          <div class="hotel-info">
            <div class="hotel-header">
              <h4 class="hotel-name">{{ hotel.name }}</h4>
              <div class="hotel-rating">
                <div class="stars">
                  <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= hotel.starRating }">
                    ★
                  </span>
                </div>
                <span class="rating-score">{{ hotel.rating }}</span>
              </div>
            </div>
            
            <div class="hotel-reviews" v-if="hotel.reviews">
              <span class="reviews-count">{{ hotel.reviews }}条评价</span>
            </div>
          </div>
          
          <div class="hotel-booking">
            <div class="price-info">
              <span class="price">{{ hotel.price }}</span>
              <span class="old-price" v-if="hotel.oldPrice">¥{{ hotel.oldPrice }}</span>
            </div>
            
            <div class="booking-actions">
              <button class="action-btn secondary" @click="viewDetails(hotel)">
                <Eye :size="16" />
                详情
              </button>
              <button class="action-btn primary" @click="bookHotel(hotel)">
                <Calendar :size="16" />
                预订
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="hotel-tips" v-if="!fullscreen && recentBookings.length === 0">
      <div class="tip-item">
        <Info :size="16" />
        <span>建议选择地铁站附近的酒店，出行更便利</span>
      </div>
    </div>

    <!-- 预订成功状态显示 -->
    <div v-if="!fullscreen && recentBookings.length > 0" class="hotel-booking-success-section">
      <div class="hotel-success-header">
        <div class="hotel-success-icon">
          <CheckCircle :size="20" />
        </div>
        <div class="hotel-success-title">
          <h4>预订成功</h4>
          <p>您的酒店已确认</p>
        </div>
        <button class="hotel-re-search-btn" @click="startNewSearch">
          重新搜索
        </button>
      </div>
      
      <div class="hotel-success-bookings">
        <div 
          v-for="booking in recentBookings" 
          :key="booking.id"
          class="hotel-success-booking-card"
        >
          <div class="hotel-booking-card-header">
            <div class="hotel-booking-id">订单号: {{ booking.id }}</div>
            <div class="hotel-booking-status">已确认</div>
          </div>
          
          <div class="hotel-booking-card-content">
            <div class="hotel-booking-info">
              <div class="hotel-booking-hotel">
                <img :src="booking.hotel.image" :alt="booking.hotel.name" class="hotel-booking-image" />
                <div class="hotel-booking-details">
                  <h5>{{ booking.hotel.name }}</h5>
                  <div class="hotel-booking-rating">
                    <div class="stars">
                      <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= booking.hotel.starRating }">
                        ★
                      </span>
                    </div>
                    <span class="rating-score">{{ booking.hotel.rating }}</span>
                  </div>
                </div>
              </div>
              
              <div class="hotel-booking-dates">
                <div class="hotel-booking-date-item">
                  <span class="hotel-booking-label">入住</span>
                  <span class="hotel-booking-value">{{ formatDate(booking.checkInDate) }}</span>
                </div>
                <div class="hotel-booking-date-item">
                  <span class="hotel-booking-label">退房</span>
                  <span class="hotel-booking-value">{{ formatDate(booking.checkOutDate) }}</span>
                </div>
              </div>
            </div>
            
            <div class="hotel-booking-summary">
              <div class="hotel-summary-item">
                <span class="hotel-summary-label">总价</span>
                <span class="hotel-summary-value hotel-total-price">{{ booking.totalPrice }}</span>
              </div>
              <div class="hotel-summary-item">
                <span class="hotel-summary-label">预订时间</span>
                <span class="hotel-summary-value">{{ formatBookingDate(booking.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认支付弹窗 -->
    <div v-if="showPaymentModal" class="hotel-payment-modal-overlay" @click="closePaymentModal">
      <div class="hotel-payment-modal" @click.stop>
        <div class="hotel-modal-header">
          <h3>确认支付</h3>
          <button class="hotel-close-btn" @click="closePaymentModal">×</button>
        </div>
        
        <div class="hotel-modal-content">
          <div class="hotel-booking-summary">
            <h4>预订详情</h4>
            <div class="hotel-summary-modal">
              <div class="hotel-info-modal">
                <img :src="selectedHotel.image" :alt="selectedHotel.name" class="hotel-image-modal" />
                <div class="hotel-details-modal">
                  <h5>{{ selectedHotel.name }}</h5>
                  <div class="hotel-rating-modal">
                    <div class="stars">
                      <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= selectedHotel.starRating }">
                        ★
                      </span>
                    </div>
                    <span class="rating-score">{{ selectedHotel.rating }}</span>
                  </div>
                </div>
              </div>
              <div class="hotel-booking-dates">
                <div class="hotel-date-item">
                  <span class="hotel-label">入住日期</span>
                  <span class="hotel-value">{{ checkInDate }}</span>
                </div>
                <div class="hotel-date-item">
                  <span class="hotel-label">退房日期</span>
                  <span class="hotel-value">{{ checkOutDate }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="hotel-price-summary">
            <div class="hotel-price-item">
              <span>房费</span>
              <span>{{ selectedHotel.price }}</span>
            </div>
            <div class="hotel-price-item">
              <span>服务费</span>
              <span>¥50</span>
            </div>
            <div class="hotel-price-item total">
              <span>总计</span>
              <span>{{ totalPrice }}</span>
            </div>
          </div>
        </div>
        
        <div class="hotel-modal-actions">
          <button class="hotel-cancel-btn" @click="closePaymentModal">取消</button>
          <button class="hotel-confirm-btn" @click="confirmPayment" :disabled="isProcessing">
            {{ isProcessing ? '处理中...' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Building, Eye, Calendar, Info, CheckCircle } from 'lucide-vue-next'
import { searchHotels, formatHotelData } from '@/api/hotelApi.js'
import { useUserInfoStore } from '@/stores/userInfoStore.js'

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

const filters = reactive({
  priceRange: 'any',
  rating: 'any'
})

const userInfoStore = useUserInfoStore()

const loading = ref(false)
const error = ref('')

const allHotels = ref([])

// 预订相关状态
const selectedHotel = ref(null)
const showPaymentModal = ref(false)
const isProcessing = ref(false)
const recentBookings = ref([])

// 动态过滤选项
const filterOptions = reactive({
  priceRange: [
    { value: 'any', label: '不限' }
  ],
  rating: [
    { value: 'any', label: '不限' }
  ]
})

const fetchHotels = async () => {
  // 如果已有预订记录，不需要获取酒店列表
  if (recentBookings.value.length > 0) {
    console.log('[HotelCard] 检测到已有预订记录，跳过酒店数据获取')
    return
  }
  
  loading.value = true
  error.value = ''
  try {
    // 获取用户出行信息
    const userInfo = userInfoStore.getScenarioInfo('travel')
    const location = userInfo.destination || '东京'
    const arrival_date = userInfo.startDate || ''
    let departure_date = userInfo.endDate || ''
    
    // 如果没有选择返回时间，默认加一天
    if (!departure_date && arrival_date) {
      const startDate = new Date(arrival_date)
      startDate.setDate(startDate.getDate() + 1)
      departure_date = startDate.toISOString().split('T')[0]
    }
    
    const params = {
      location,
      departure_date,
      arrival_date,
      adults: 1,
      children: 0,
      rooms: 1
    }
    const result = await searchHotels(params)
    if (result.success && result.data && Array.isArray(result.data.items) && result.data.items.length > 0) {
      allHotels.value = formatHotelData(result.data.items)
      generateFilterOptions(allHotels.value)
    } else {
      allHotels.value = []
      error.value = '暂无酒店数据'
    }
  } catch (e) {
    error.value = '酒店数据加载失败'
    allHotels.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  userInfoStore.loadFromStorage()
  loadRecentBookings()
  
  // 如果已有预订记录，不需要初始化酒店数据
  if (recentBookings.value.length > 0) {
    console.log('[HotelCard] 检测到已有预订记录，跳过酒店数据初始化')
    return
  }
  
  fetchHotels()
})

// 监听用户目的地、日期变化自动刷新酒店
watch([
  () => userInfoStore.destination,
  () => userInfoStore.getScenarioInfo('travel').startDate,
  () => userInfoStore.getScenarioInfo('travel').endDate
], () => {
  // 如果已有预订记录，不自动刷新酒店数据
  if (recentBookings.value.length > 0) {
    console.log('[HotelCard] 检测到已有预订记录，跳过自动刷新酒店数据')
    return
  }
  
  fetchHotels()
})

const filteredHotels = computed(() => {
  return allHotels.value.filter(hotel => {
    // 价格筛选
    if (filters.priceRange !== 'any') {
      const price = hotel.priceValue || 0
      const prices = allHotels.value.map(h => h.priceValue || 0).filter(p => p > 0)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      
      if (filters.priceRange === 'low' && price >= avgPrice * 0.8) {
        return false
      }
      if (filters.priceRange === 'medium' && (price < avgPrice * 0.8 || price > avgPrice * 1.2)) {
        return false
      }
      if (filters.priceRange === 'high' && price <= avgPrice * 1.2) {
        return false
      }
    }
    
    // 评分筛选
    if (filters.rating !== 'any' && hotel.rating < parseFloat(filters.rating)) {
      return false
    }
    
    return true
  })
})

const handleFilterChange = () => {
  emit('update', {
    filters: { ...filters },
    filteredCount: filteredHotels.value.length
  })
}

const viewDetails = (hotel) => {
  console.log('查看详情:', hotel)
  if (hotel.url) {
    window.open(hotel.url, '_blank')
  }
  emit('update', {
    selectedHotel: hotel,
    action: 'view'
  })
}

const bookHotel = (hotel) => {
  console.log('预订酒店:', hotel)
  selectedHotel.value = hotel
  showPaymentModal.value = true
}

// 计算入住日期和退房日期
const checkInDate = computed(() => {
  const userInfo = userInfoStore.getScenarioInfo('travel')
  return userInfo.startDate || ''
})

const checkOutDate = computed(() => {
  const userInfo = userInfoStore.getScenarioInfo('travel')
  let endDate = userInfo.endDate || ''
  
  // 如果没有选择返回时间，默认加一天
  if (!endDate && userInfo.startDate) {
    const startDate = new Date(userInfo.startDate)
    startDate.setDate(startDate.getDate() + 1)
    endDate = startDate.toISOString().split('T')[0]
  }
  
  return endDate
})

// 计算总价格
const totalPrice = computed(() => {
  if (!selectedHotel.value) return '¥0'
  const basePrice = selectedHotel.value.priceValue || 0
  const serviceFee = 50
  return `¥${(basePrice + serviceFee).toLocaleString()}`
})

// 关闭支付弹窗
const closePaymentModal = () => {
  showPaymentModal.value = false
  isProcessing.value = false
  selectedHotel.value = null
}

// 确认支付
const confirmPayment = async () => {
  isProcessing.value = true
  
  try {
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('[HotelCard] 支付成功！')
    
    const bookingData = {
      id: `hotel_${Date.now()}`,
      hotel: selectedHotel.value,
      checkInDate: checkInDate.value,
      checkOutDate: checkOutDate.value,
      totalPrice: totalPrice.value,
      userInfo: userInfoStore.getScenarioInfo('travel'),
      createdAt: new Date().toISOString()
    }
    
    // 保存预订记录到本地存储
    saveHotelBooking(bookingData)
    
    // 更新最近的预订记录显示
    loadRecentBookings()
    
    // 关闭弹窗
    showPaymentModal.value = false
    
    // 显示成功提示
    alert('预订成功！支付已完成。')
    
    // 重置选择状态
    selectedHotel.value = null
    
    // 通知父组件
    emit('update', {
      action: 'bookingSuccess',
      bookingData: bookingData
    })
  } catch (error) {
    console.error('[HotelCard] 支付失败:', error)
    alert('支付失败，请重试。')
  } finally {
    isProcessing.value = false
  }
}

// 保存酒店预订记录到本地存储
const saveHotelBooking = (bookingData) => {
  try {
    const existingBookings = JSON.parse(localStorage.getItem('hotel_bookings') || '[]')
    existingBookings.unshift(bookingData) // 添加到开头
    
    // 只保留最近10条记录
    const updatedBookings = existingBookings.slice(0, 10)
    
    localStorage.setItem('hotel_bookings', JSON.stringify(updatedBookings))
    console.log('[HotelCard] 酒店预订记录已保存到本地存储')
  } catch (error) {
    console.error('[HotelCard] 保存酒店预订记录失败:', error)
  }
}

// 监听props变化
watch(() => props.data, (newData) => {
  if (newData.filters) {
    Object.assign(filters, newData.filters)
  }
}, { deep: true })

const handleImageError = () => {
  // 处理图片加载失败后的逻辑
  console.error('图片加载失败')
}

// 动态生成过滤选项
const generateFilterOptions = (hotels) => {
  if (!hotels || hotels.length === 0) return
  
  // 生成价格范围选项
  const prices = hotels.map(hotel => hotel.priceValue || 0).filter(p => p > 0)
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
        label: `经济型 (¥${minPrice.toLocaleString()}-${lowMax.toLocaleString()})`
      })
    }
    
    // 中价位 (平均价格的80%-120%)
    const midMin = Math.floor(avgPrice * 0.8)
    const midMax = Math.ceil(avgPrice * 1.2)
    if (midMin < midMax) {
      priceRanges.push({
        value: 'medium',
        label: `中档型 (¥${midMin.toLocaleString()}-${midMax.toLocaleString()})`
      })
    }
    
    // 高价位 (高于平均价格的120%)
    if (maxPrice > avgPrice * 1.2) {
      const highMin = Math.floor(avgPrice * 1.2)
      priceRanges.push({
        value: 'high',
        label: `豪华型 (¥${highMin.toLocaleString()}+)`
      })
    }
    
    filterOptions.priceRange = [
      { value: 'any', label: '不限' },
      ...priceRanges
    ]
  }
  
  // 生成评分选项
  const ratings = [...new Set(hotels.map(hotel => hotel.rating).filter(r => r > 0))]
  if (ratings.length > 0) {
    const sortedRatings = ratings.sort((a, b) => b - a)
    const ratingOptions = []
    
    // 根据实际评分生成选项
    if (sortedRatings.some(r => r >= 9.0)) {
      ratingOptions.push({ value: '9.0', label: '9.0分以上' })
    }
    if (sortedRatings.some(r => r >= 8.5)) {
      ratingOptions.push({ value: '8.5', label: '8.5分以上' })
    }
    if (sortedRatings.some(r => r >= 8.0)) {
      ratingOptions.push({ value: '8.0', label: '8.0分以上' })
    }
    if (sortedRatings.some(r => r >= 7.5)) {
      ratingOptions.push({ value: '7.5', label: '7.5分以上' })
    }
    
    filterOptions.rating = [
      { value: 'any', label: '不限' },
      ...ratingOptions
    ]
  }
  
  console.log('[HotelCard] 生成的过滤选项:', filterOptions)
}

// 加载最近的预订记录
const loadRecentBookings = () => {
  try {
    const existingBookings = JSON.parse(localStorage.getItem('hotel_bookings') || '[]')
    recentBookings.value = existingBookings.slice(0, 3) // 只显示最近3条
    console.log('[HotelCard] 加载最近的预订记录:', recentBookings.value)
  } catch (error) {
    console.error('[HotelCard] 加载预订记录失败:', error)
    recentBookings.value = []
  }
}

// 开始新的搜索
const startNewSearch = async () => {
  console.log('[HotelCard] 开始新的酒店搜索')
  
  // 清空预订记录显示
  recentBookings.value = []
  
  // 重新获取酒店数据
  await fetchHotels()
  
  // 通知父组件
  emit('update', {
    action: 'startNewSearch',
    message: '开始新的酒店搜索'
  })
}

// 添加新的格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 添加新的格式化预订时间函数
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
</script>

<style scoped>
.hotel-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hotel-filters {
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

.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hotel-list.scrollable {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.hotel-list.scrollable::-webkit-scrollbar {
  width: 4px;
}

.hotel-list.scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.hotel-list.scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.hotel-list.scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.hotel-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
}

.hotel-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hotel-image {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #F0F0F0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
}

.hotel-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.wifi {
  background: #E3F2FD;
  color: #1976D2;
}

.hotel-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hotel-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.hotel-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333333;
  flex: 1;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  color: #E5E5E5;
  font-size: 0.875rem;
}

.star.filled {
  color: #FFD700;
}

.rating-score {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.hotel-reviews {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #666666;
}

.reviews-count {
  font-weight: 500;
}

.hotel-booking {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #F0F0F0;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.old-price {
  font-size: 0.875rem;
  color: #999999;
  text-decoration: line-through;
}

.booking-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
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

.hotel-tips {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E5E5E5;
  border-top: 4px solid #333333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.hotel-payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.hotel-payment-modal {
  background-color: #FFFFFF;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
}

.hotel-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.hotel-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.hotel-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotel-booking-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotel-summary-modal {
  display: contents;
  gap: 16px;
}

.hotel-info-modal {
  gap: 16px;
  display: flex;
  align-items: center;
}

.hotel-image-modal {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.hotel-details-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
}

.hotel-rating-modal {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hotel-booking-dates {
  display: flex;
  gap: 16px;
  justify-content: space-around;
}

.hotel-date-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hotel-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
}

.hotel-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.hotel-price-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotel-price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hotel-price-item span {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.hotel-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.hotel-cancel-btn,
.hotel-confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.hotel-cancel-btn {
  background: #FFFFFF;
  color: #666666;
}

.hotel-confirm-btn {
  background: #333333;
  color: #FFFFFF;
}

.hotel-confirm-btn:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}

.hotel-booking-success-section {
  background: linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%);
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.hotel-booking-success-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A, #81C784);
}

.hotel-success-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.hotel-success-icon {
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

.hotel-success-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2E7D32;
}

.hotel-success-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #388E3C;
}

.hotel-re-search-btn {
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

.hotel-re-search-btn:hover {
  background: #4CAF50;
  color: #FFFFFF;
}

.hotel-success-bookings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotel-success-booking-card {
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E8F5E8;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}

.hotel-booking-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #F1F8E9;
  border-bottom: 1px solid #E8F5E8;
}

.hotel-booking-id {
  font-size: 0.8rem;
  color: #666666;
  font-family: monospace;
}

.hotel-booking-status {
  background: #4CAF50;
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.hotel-booking-card-content {
  padding: 16px;
}

.hotel-booking-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.hotel-booking-hotel {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.hotel-booking-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.hotel-booking-details h5 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.hotel-booking-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hotel-booking-dates {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.hotel-booking-date-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.hotel-booking-label {
  font-size: 0.75rem;
  color: #999999;
}

.hotel-booking-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.hotel-booking-summary {
  border-top: 1px solid #E8F5E8;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hotel-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hotel-summary-label {
  font-size: 0.75rem;
  color: #999999;
}

.hotel-summary-value {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 500;
}

.hotel-total-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2E7D32;
}
</style> 