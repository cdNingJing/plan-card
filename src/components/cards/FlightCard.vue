<template>
  <div class="flight-card">
    <div class="flight-filters" v-if="fullscreen">
      <div class="filter-row">
        <div class="filter-group">
          <label>出发时间</label>
          <select v-model="filters.timePreference" @change="handleFilterChange">
            <option value="morning">上午 (06:00-12:00)</option>
            <option value="afternoon">下午 (12:00-18:00)</option>
            <option value="evening">晚上 (18:00-24:00)</option>
            <option value="any">任意时间</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>价格范围</label>
          <select v-model="filters.priceRange" @change="handleFilterChange">
            <option value="budget">经济舱 (¥2000-3000)</option>
            <option value="business">商务舱 (¥8000-12000)</option>
            <option value="first">头等舱 (¥15000+)</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>航空公司</label>
          <select v-model="filters.airline" @change="handleFilterChange">
            <option value="any">不限</option>
            <option value="国航">中国国际航空</option>
            <option value="东航">中国东方航空</option>
            <option value="南航">中国南方航空</option>
          </select>
        </div>
      </div>
    </div>

    <div class="flight-list">
      <div 
        v-for="flight in filteredFlights" 
        :key="flight.id"
        class="flight-item"
        :class="{ recommended: flight.recommended }"
      >
        <div class="flight-info">
          <div class="airline-info">
            <span class="airline-name">{{ flight.airline }}</span>
            <span class="flight-number">{{ flight.flightNumber }}</span>
          </div>
          
          <div class="time-info">
            <div class="departure">
              <span class="time">{{ flight.departureTime }}</span>
              <span class="airport">{{ flight.departureAirport }}</span>
            </div>
            <div class="duration">
              <Plane :size="16" />
              <span>{{ flight.duration }}</span>
            </div>
            <div class="arrival">
              <span class="time">{{ flight.arrivalTime }}</span>
              <span class="airport">{{ flight.arrivalAirport }}</span>
            </div>
          </div>
          
          <div class="flight-details">
            <span class="aircraft">{{ flight.aircraft }}</span>
            <span class="stops" v-if="flight.stops > 0">{{ flight.stops }}次中转</span>
            <span class="direct" v-else>直飞</span>
          </div>
        </div>
        
        <div class="flight-price">
          <div class="price-info">
            <span class="price">{{ flight.price }}</span>
            <span class="tax">含税</span>
          </div>
          <div class="flight-actions">
            <button class="action-btn secondary" @click="comparePrice(flight)">
              <BarChart3 :size="16" />
              比价
            </button>
            <button class="action-btn primary" @click="bookFlight(flight)">
              <Calendar :size="16" />
              预订
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flight-tips" v-if="!fullscreen">
      <div class="tip-item">
        <Lightbulb :size="16" />
        <span>建议提前2小时到达机场办理登机手续</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Plane, BarChart3, Calendar, Lightbulb } from 'lucide-vue-next'

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
  timePreference: 'any',
  priceRange: 'budget',
  airline: 'any'
})

// 扩展的航班数据
const allFlights = ref([
  {
    id: 1,
    airline: '中国国际航空',
    flightNumber: 'CA403',
    departureTime: '14:30',
    arrivalTime: '19:45',
    departureAirport: 'CTU',
    arrivalAirport: 'NRT',
    duration: '3h15m',
    aircraft: 'A330-300',
    stops: 0,
    price: '¥2,800',
    priceValue: 2800,
    recommended: true,
    timeCategory: 'afternoon'
  },
  {
    id: 2,
    airline: '中国东方航空',
    flightNumber: 'MU515',
    departureTime: '09:15',
    arrivalTime: '14:30',
    departureAirport: 'CTU',
    arrivalAirport: 'NRT',
    duration: '3h15m',
    aircraft: 'B787-9',
    stops: 0,
    price: '¥3,200',
    priceValue: 3200,
    recommended: false,
    timeCategory: 'morning'
  },
  {
    id: 3,
    airline: '中国南方航空',
    flightNumber: 'CZ8085',
    departureTime: '20:45',
    arrivalTime: '01:55+1',
    departureAirport: 'CTU',
    arrivalAirport: 'NRT',
    duration: '3h10m',
    aircraft: 'A321neo',
    stops: 0,
    price: '¥2,650',
    priceValue: 2650,
    recommended: false,
    timeCategory: 'evening'
  }
])

const filteredFlights = computed(() => {
  return allFlights.value.filter(flight => {
    // 时间筛选
    if (filters.timePreference !== 'any' && flight.timeCategory !== filters.timePreference) {
      return false
    }
    
    // 航空公司筛选
    if (filters.airline !== 'any' && flight.airline !== filters.airline) {
      return false
    }
    
    // 价格筛选 (简化逻辑)
    if (filters.priceRange === 'budget' && flight.priceValue > 4000) {
      return false
    }
    
    return true
  })
})

const handleFilterChange = () => {
  emit('update', {
    filters: { ...filters },
    filteredCount: filteredFlights.value.length
  })
}

const comparePrice = (flight) => {
  // 比价功能
  console.log('比价:', flight)
}

const bookFlight = (flight) => {
  // 预订功能
  console.log('预订:', flight)
  emit('update', {
    selectedFlight: flight,
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
.flight-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.flight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  transition: all 0.2s;
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

.flight-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.airline-info {
  display: flex;
  align-items: center;
  gap: 8px;
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

.time-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.departure,
.arrival {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.time {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333333;
}

.airport {
  font-size: 0.75rem;
  color: #999999;
}

.duration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #666666;
  font-size: 0.875rem;
}

.flight-details {
  display: flex;
  gap: 12px;
  font-size: 0.875rem;
  color: #666666;
}

.direct {
  color: #333333;
  font-weight: 500;
}

.stops {
  color: #999999;
}

.flight-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
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

.tax {
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

</style> 