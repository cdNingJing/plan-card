<template>
  <div class="hotel-card">
    <div class="hotel-filters" v-if="fullscreen">
      <div class="filter-row">
        <div class="filter-group">
          <label>价格范围</label>
          <select v-model="filters.priceRange" @change="handleFilterChange">
            <option value="budget">经济型 (¥200-500)</option>
            <option value="mid">中档型 (¥500-1000)</option>
            <option value="luxury">豪华型 (¥1000+)</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>酒店位置</label>
          <select v-model="filters.location" @change="handleFilterChange">
            <option value="any">不限</option>
            <option value="新宿">新宿区</option>
            <option value="银座">银座区</option>
            <option value="涩谷">涩谷区</option>
            <option value="浅草">浅草区</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>评分要求</label>
          <select v-model="filters.rating" @change="handleFilterChange">
            <option value="any">不限</option>
            <option value="4.0">4.0分以上</option>
            <option value="4.5">4.5分以上</option>
            <option value="4.8">4.8分以上</option>
          </select>
        </div>
      </div>
    </div>

    <div class="hotel-list">
      <div 
        v-for="hotel in filteredHotels" 
        :key="hotel.id"
        class="hotel-item"
        :class="{ recommended: hotel.recommended }"
      >
        <div class="hotel-image">
          <div class="image-placeholder">
            <Building :size="32" />
          </div>
          <div class="hotel-badges">
            <span v-if="hotel.recommended" class="badge recommended">推荐</span>
            <span v-if="hotel.freeWifi" class="badge wifi">免费WiFi</span>
          </div>
        </div>
        
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
          
          <div class="hotel-details">
            <div class="location">
              <MapPin :size="14" />
              <span>{{ hotel.location }}</span>
            </div>
            <div class="distance">
              <Navigation :size="14" />
              <span>距离{{ hotel.landmark }}{{ hotel.distance }}</span>
            </div>
          </div>
          
          <div class="hotel-amenities">
            <span v-for="amenity in hotel.amenities" :key="amenity" class="amenity">
              {{ amenity }}
            </span>
          </div>
          
          <div class="hotel-description">
            {{ hotel.description }}
          </div>
        </div>
        
        <div class="hotel-booking">
          <div class="price-info">
            <span class="price">{{ hotel.price }}</span>
            <span class="per-night">/晚</span>
            <span class="total-price">共{{ hotel.totalPrice }}</span>
          </div>
          
          <div class="availability">
            <span class="rooms-left" v-if="hotel.roomsLeft <= 3">
              仅剩{{ hotel.roomsLeft }}间
            </span>
            <span class="free-cancel" v-if="hotel.freeCancellation">
              免费取消
            </span>
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
    
    <div class="hotel-tips" v-if="!fullscreen">
      <div class="tip-item">
        <Info :size="16" />
        <span>建议选择地铁站附近的酒店，出行更便利</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Building, MapPin, Navigation, Eye, Calendar, Info } from 'lucide-vue-next'

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
  priceRange: 'mid',
  location: 'any',
  rating: 'any'
})

// 扩展的酒店数据
const allHotels = ref([
  {
    id: 1,
    name: '新宿王子酒店',
    location: '新宿区',
    starRating: 4,
    rating: 4.5,
    price: '¥680',
    priceValue: 680,
    totalPrice: '¥3,400',
    landmark: '新宿站',
    distance: '500米',
    roomsLeft: 2,
    freeCancellation: true,
    freeWifi: true,
    recommended: true,
    amenities: ['免费WiFi', '健身房', '24小时前台'],
    description: '位于新宿中心地带，交通便利，设施完善'
  },
  {
    id: 2,
    name: '银座丽思卡尔顿酒店',
    location: '银座区',
    starRating: 5,
    rating: 4.8,
    price: '¥1,200',
    priceValue: 1200,
    totalPrice: '¥6,000',
    landmark: '银座站',
    distance: '200米',
    roomsLeft: 5,
    freeCancellation: true,
    freeWifi: true,
    recommended: false,
    amenities: ['免费WiFi', 'SPA', '米其林餐厅', '礼宾服务'],
    description: '奢华五星级酒店，享受顶级服务体验'
  },
  {
    id: 3,
    name: '涩谷天空酒店',
    location: '涩谷区',
    starRating: 3,
    rating: 4.2,
    price: '¥450',
    priceValue: 450,
    totalPrice: '¥2,250',
    landmark: '涩谷站',
    distance: '300米',
    roomsLeft: 8,
    freeCancellation: false,
    freeWifi: true,
    recommended: false,
    amenities: ['免费WiFi', '观景台', '洗衣服务'],
    description: '现代化设计，可俯瞰涩谷全景'
  }
])

const filteredHotels = computed(() => {
  return allHotels.value.filter(hotel => {
    // 价格筛选
    if (filters.priceRange === 'budget' && hotel.priceValue > 500) {
      return false
    }
    if (filters.priceRange === 'mid' && (hotel.priceValue < 500 || hotel.priceValue > 1000)) {
      return false
    }
    if (filters.priceRange === 'luxury' && hotel.priceValue < 1000) {
      return false
    }
    
    // 位置筛选
    if (filters.location !== 'any' && !hotel.location.includes(filters.location)) {
      return false
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
  emit('update', {
    selectedHotel: hotel,
    action: 'view'
  })
}

const bookHotel = (hotel) => {
  console.log('预订酒店:', hotel)
  emit('update', {
    selectedHotel: hotel,
    action: 'book'
  })
}

// 监听props变化
watch(() => props.data, (newData) => {
  if (newData.filters) {
    Object.assign(filters, newData.filters)
  }
}, { deep: true })
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

.hotel-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
}

.hotel-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hotel-item.recommended {
  border-color: #333333;
}

.hotel-image {
  position: relative;
  flex-shrink: 0;
}

.image-placeholder {
  width: 120px;
  height: 90px;
  background: #F0F0F0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
}

.hotel-badges {
  position: absolute;
  top: 4px;
  left: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.recommended {
  background: #333333;
  color: #FFFFFF;
}

.badge.wifi {
  background: #E3F2FD;
  color: #1976D2;
}

.hotel-info {
  flex: 1;
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
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 6px;
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

.hotel-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location,
.distance {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: #666666;
}

.hotel-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.amenity {
  padding: 2px 6px;
  background: #F0F0F0;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666666;
}

.hotel-description {
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.4;
}

.hotel-booking {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 140px;
}

.price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.per-night {
  font-size: 0.75rem;
  color: #999999;
}

.total-price {
  font-size: 0.875rem;
  color: #666666;
}

.availability {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 0.75rem;
}

.rooms-left {
  color: #FF6B6B;
  font-weight: 500;
}

.free-cancel {
  color: #4CAF50;
}

.booking-actions {
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

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .hotel-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .hotel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .hotel-booking {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .booking-actions {
    flex-direction: row;
  }
  
  .image-placeholder {
    width: 100%;
    height: 120px;
  }
}
</style> 