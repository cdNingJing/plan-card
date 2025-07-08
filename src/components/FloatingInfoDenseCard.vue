<template>
  <!-- 展开状态 - 居中显示 -->
  <div 
    v-if="isVisible && isExpanded"
    class="floating-overlay"
    @click="closeCard"
  >
    <div 
      class="floating-info-dense-card expanded-card"
      @click.stop
    >
      <!-- 展开状态内容 -->
      <div class="expanded-content">
        <!-- 头部 -->
        <div class="expanded-header" @click="toggleExpanded">
          <div class="header-content">
            <div class="header-text">
              <h3 class="card-title">行程决策概览</h3>
              <p class="card-subtitle">关键信息一目了然，助您快速决策</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn close-btn" @click.stop="closeCard" title="关闭">
              <X :size="16" />
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="info-dense-grid">
          <!-- 基础信息卡片 -->
          <div class="basic-info-card" v-if="sectionData.basicInfo">
            <div class="basic-info-row" v-if="sectionData.basicInfo.meetingSubject">
              <span class="basic-info-label">会议主题：</span>{{ sectionData.basicInfo.meetingSubject }}
            </div>
            <div class="basic-info-row" v-if="sectionData.basicInfo.meetingDate">
              <span class="basic-info-label">会议时间：</span>{{ sectionData.basicInfo.meetingDate }}
            </div>
            <div class="basic-info-row" v-if="sectionData.basicInfo.meetingLocation">
              <span class="basic-info-label">会议地点：</span>{{ sectionData.basicInfo.meetingLocation }}
            </div>
          </div>
          
          <!-- 信息提示卡片 -->
          <div class="info-notice-card" v-if="showBasicInfoNotice">
            <div class="notice-header">
              <span class="notice-title">信息提示</span>
            </div>
            <div class="notice-content">
              <p class="notice-text">
                请补充：<span style="color:#d35400;font-weight:600">{{ missingBasicFields }}</span>，以便为您推荐合适的行程与服务。
              </p>
            </div>
          </div>
          
          <!-- 航班信息提示卡片 -->
          <div class="info-notice-card" v-if="showFlightNotice">
            <div class="notice-header">
              <span class="notice-title">航班信息提示</span>
            </div>
            <div class="notice-content">
              <p class="notice-text">
                请补充：<span style="color:#d35400;font-weight:600">{{ missingFlightFields }}</span>，以便为您推荐合适的航班。
              </p>
            </div>
          </div>
          <!-- 航班卡片 -->
          <div class="dense-card flight-dense-card" v-if="sectionData.flight && !showFlightNotice">
            <div class="dense-card-title-row">
              <span class="dense-card-title">推荐航班</span>
              <span class="flight-status" v-if="sectionData.flight.statusText" :class="sectionData.flight?.status">{{ sectionData.flight?.statusText }}</span>
            </div>
            <div class="flight-main">
              <div class="flight-route" v-if="sectionData.flight.departure && sectionData.flight.destination">
                <span class="city">{{ sectionData.flight?.departure }}</span>
                <span class="arrow">→</span>
                <span class="city">{{ sectionData.flight?.destination }}</span>
              </div>
              <div class="flight-time" v-if="sectionData.flight.departureTime && sectionData.flight.arrivalTime && sectionData.flight.duration">
                <span>{{ sectionData.flight?.departureTime }}</span>
                <span>-</span>
                <span>{{ sectionData.flight?.arrivalTime }}</span>
                <span class="duration">({{ sectionData.flight?.duration }})</span>
              </div>
            </div>
            <div class="flight-footer">
              <span class="seat" v-if="sectionData.flight.seatPreference">座位：{{ sectionData.flight?.seatPreference }}</span>
              <span class="price" v-if="sectionData.flight.price">¥{{ sectionData.flight?.price }}</span>
            </div>
          </div>
          <!-- 酒店卡片 -->
          <div class="dense-card hotel-dense-card" v-if="sectionData.hotel">
            <div class="dense-card-title-row">
              <span class="dense-card-title">推荐酒店</span>
              <span class="hotel-status" :class="sectionData.hotel?.status">{{ sectionData.hotel?.statusText }}</span>
            </div>
            <div class="hotel-main">
              <template v-if="sectionData.hotel.name === '待确认'">
                <div class="hotel-name hotel-pending">待确认</div>
              </template>
              <template v-else>
                <div class="hotel-name">{{ sectionData.hotel?.name }}</div>
                <div class="hotel-details">
                  <span class="distance">{{ sectionData.hotel?.distance }}</span>
                  <span class="rating">{{ sectionData.hotel?.rating }}</span>
                </div>
                <div class="membership">会员：{{ sectionData.hotel?.membershipLevel }}</div>
                <div class="benefits">
                  <span v-for="b in sectionData.hotel?.benefits || []" :key="b" class="benefit-tag">{{ b }}</span>
                </div>
                <div class="hotel-footer">
                  <span class="price">¥{{ sectionData.hotel?.price }}/晚</span>
                </div>
              </template>
            </div>
          </div>
          <!-- 天气卡片 -->
          <div class="dense-card weather-dense-card" v-if="sectionData.weather">
            <div class="dense-card-title-row">
              <span class="dense-card-title">天气预报</span>
              <span class="temperature">{{ sectionData.weather?.temperature }}°C</span>
            </div>
            <div class="weather-main">
              <span class="condition">{{ sectionData.weather?.condition }}</span>
              <span class="humidity">湿度 {{ sectionData.weather?.humidity }}%</span>
            </div>
            <div class="packing-suggestions">
              <span class="packing-label">行李建议：</span>
              <span v-for="item in sectionData.weather?.packingSuggestions || []" :key="item" class="suggestion-item">{{ item }}</span>
            </div>
          </div>
          <!-- 交通卡片 -->
          <div class="dense-card transport-dense-card" v-if="sectionData.transport">
            <div class="dense-card-title-row">
              <span class="dense-card-title">交通安排</span>
              <span class="duration">{{ sectionData.transport?.duration }}</span>
            </div>
            <div class="transport-main">
              <div class="route">
                <span>{{ sectionData.transport?.from }}</span>
                <span class="arrow">→</span>
                <span>{{ sectionData.transport?.to }}</span>
              </div>
              <div class="method">方式：{{ sectionData.transport?.method }}</div>
              <div class="cost">费用：¥{{ sectionData.transport?.cost }}</div>
              <div class="timing">预计到达：{{ sectionData.transport?.estimatedTime }}</div>
            </div>
          </div>
          <!-- 日程冲突卡片 -->
          <div class="dense-card schedule-dense-card" v-if="sectionData.schedule">
            <div class="dense-card-title-row">
              <span class="dense-card-title">日程提醒</span>
              <span class="conflict-count" v-if="sectionData.schedule?.conflicts?.length > 0">
                {{ sectionData.schedule?.conflicts?.length }} 个冲突
              </span>
            </div>
            <div class="schedule-main">
              <div v-if="!sectionData.schedule?.conflicts?.length" class="no-conflicts">
                <CheckCircle :size="16" />
                <span>无日程冲突</span>
              </div>
              <div v-else class="conflicts-list">
                <div v-for="conflict in sectionData.schedule?.conflicts || []" :key="conflict.id" class="conflict-item">
                  <div class="conflict-header">
                    <span class="time">{{ conflict.time }}</span>
                    <span class="type">{{ conflict.type }}</span>
                  </div>
                  <div class="conflict-title">{{ conflict.title }}</div>
                  <div class="conflict-suggestion">
                    <span class="suggestion">{{ conflict.suggestion }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 底部规划详情按钮 -->
          <div class="planning-detail-section">
            <button class="planning-detail-btn" @click="enterDetailedPlanning">
              <span class="btn-text">规划详情</span>
              <span class="btn-subtitle">展开完整 Planner UI</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 底部输入框 -->
      <div class="floating-input-section">
        <PlanInput 
          :projectId="projectId"
          placeholder="继续添加需求或修改计划..."
          :scenario="scenario"
        />
      </div>
    </div>
  </div>

  <!-- 收起状态 - 右上角显示 -->
  <div 
    v-if="isVisible && !isExpanded"
    class="floating-info-dense-card minimized-card"
  >
    <div class="minimized-header" @click="toggleExpanded">
      <div class="minimized-content">
        <div class="minimized-text">
          <span class="minimized-title">行程决策概览</span>
          <span class="minimized-subtitle">上海 → 纽约 | ¥5680 | 希尔顿酒店</span>
        </div>
      </div>
      <div class="minimized-actions">
        <button class="action-btn close-btn" @click.stop="closeCard">
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  ChevronDown, 
  ChevronUp,
  X,
  CheckCircle
} from 'lucide-vue-next'
import { infoDenseConfig } from '@/config/infoDenseConfig.js'
import { ProjectStorage } from '@/utils/storage.js'
import PlanInput from './PlanInput.vue'

const props = defineProps({
  cardData: {
    type: Object,
    default: () => ({})
  },
  scenario: {
    type: String,
    default: 'business-travel'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  projectId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update-data', 'book-flight', 'book-hotel', 'book-transport', 'reschedule-event', 'close', 'enter-detailed-planning'])

// 从本地存储获取展开状态，默认为true
const getStoredExpandedState = () => {
  if (!props.projectId) return true
  
  try {
    const project = ProjectStorage.getProject(props.projectId)
    return project?.floatingCardExpanded !== undefined ? project.floatingCardExpanded : true
  } catch (error) {
    console.error('获取展开状态失败:', error)
    return true
  }
}

const isExpanded = ref(getStoredExpandedState())

// 获取场景配置
const config = computed(() => infoDenseConfig)

// 动态数据
const sectionData = ref({})

// 模拟基础信息（唯一数据源）
function getBasicInfoMock() {
  return {
    meetingSubject: '纽约客户会',
    meetingDate: '2025-07-10',
    meetingLocation: '纽约曼哈顿时代广场希尔顿酒店  ',
    departure: '上海',
    destination: '纽约',
    departureTime: '2025-07-10 08:00',
    arrivalTime: '2025-07-11 18:00',
    // 航班相关
    seatPreference: '靠窗',
    flightPrice: '5680',
    // 酒店相关
    hotelName: '纽约中央公园希尔顿酒店',
    hotelDistance: '步行5分钟',
    hotelRating: '4.8',
    hotelMembershipLevel: '金卡会员',
    hotelBenefits: ['免费升房', '延迟退房', '免费早餐'],
    hotelPrice: '1200',
    // 天气相关
    temperature: 28,
    condition: '多云转晴',
    humidity: 65,
    packingSuggestions: ['商务正装', '轻便外套', '雨伞', '充电器', '会议资料'],
    // 交通相关
    transportFrom: '肯尼迪机场',
    transportTo: '曼哈顿时代广场希尔顿酒店',
    transportMethod: 'Uber 专车',
    transportCost: '85',
    transportDuration: '45分钟',
    transportEstimatedTime: '12:30 到达',
    // 辅助信息
    name: '张三',
    phone: '138****8888',
    company: '上海智行科技',
    email: 'zhangsan@example.com'
  }
}

// 生成航班数据
function getFlightFromBasicInfo(info) {
  // 只需出发地、目的地、起飞时间都存在才返回航班数据，否则返回 null
  if (!info?.departure || !info?.destination || !info?.departureTime) return null
  return {
    status: 'available',
    statusText: '可预订',
    departure: info.departure,
    destination: info.destination,
    departureTime: info.departureTime,
    arrivalTime: info.arrivalTime || '',
    duration: info.arrivalTime && info.departureTime ? calcDuration(info.departureTime, info.arrivalTime) : '',
    seatPreference: info.seatPreference || '',
    price: info.flightPrice || ''
  }
}
// 生成酒店数据
function getHotelFromBasicInfo(info) {
  if (!info?.meetingLocation || !info?.hotelName) return null
  return {
    status: 'available',
    statusText: '可预订',
    name: info.hotelName,
    distance: info.hotelDistance || '',
    rating: info.hotelRating || '',
    membershipLevel: info.hotelMembershipLevel || '',
    benefits: info.hotelBenefits || [],
    price: info.hotelPrice || ''
  }
}
// 生成天气数据
function getWeatherFromBasicInfo(info) {
  if (!info?.temperature && !info?.condition) return null
  return {
    temperature: info.temperature,
    condition: info.condition,
    humidity: info.humidity,
    packingSuggestions: info.packingSuggestions || []
  }
}
// 生成交通数据
function getTransportFromBasicInfo(info) {
  if (!info?.meetingLocation || !info?.transportFrom || !info?.transportTo) return null
  return {
    from: info.transportFrom,
    to: info.transportTo,
    method: info.transportMethod || '',
    cost: info.transportCost || '',
    duration: info.transportDuration || '',
    estimatedTime: info.transportEstimatedTime || ''
  }
}
// 生成日程冲突
function getScheduleFromBasicInfo(info) {
  const conflicts = []
  if (info && info.arrivalTime && info.meetingDate) {
    const flightArrive = new Date(info.arrivalTime.replace(/-/g, '/'))
    const meetingTime = new Date(info.meetingDate.replace(/-/g, '/'))
    if (flightArrive > meetingTime) {
      conflicts.push({
        id: 'conflict_1',
        time: info.meetingDate,
        type: '会议',
        title: info.meetingSubject || '客户会议',
        suggestion: '建议调整航班或会议时间，避免冲突'
      })
    }
  }
  return { conflicts }
}
// 计算时长
function calcDuration(start, end) {
  try {
    const s = new Date(start.replace(/-/g, '/'))
    const e = new Date(end.replace(/-/g, '/'))
    const ms = e - s
    if (ms > 0) {
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      return `${h}h ${m}m`
    }
  } catch { }
  return ''
}

// 初始化数据
const initializeData = () => {
  const info = getBasicInfoMock()
  sectionData.value = {
    basicInfo: info,
    flight: getFlightFromBasicInfo(info),
    hotel: getHotelFromBasicInfo(info),
    weather: getWeatherFromBasicInfo(info),
    transport: getTransportFromBasicInfo(info),
    schedule: getScheduleFromBasicInfo(info)
  }
}

// 进入详细规划
const enterDetailedPlanning = () => {
  emit('enter-detailed-planning')
}

// 切换展开状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  
  // 保存到本地存储
  if (props.projectId) {
    try {
      ProjectStorage.updateProject(props.projectId, {
        floatingCardExpanded: isExpanded.value
      })
    } catch (error) {
      console.error('保存展开状态失败:', error)
    }
  }
}

// 关闭卡片
const closeCard = () => {
  emit('close')
}

// 监听projectId变化，重新获取展开状态
watch(() => props.projectId, (newProjectId) => {
  if (newProjectId) {
    isExpanded.value = getStoredExpandedState()
  }
})

// 组件挂载时初始化数据
onMounted(() => {
  initializeData()
})

const showHotelPendingNotice = computed(() =>
  sectionData.value.hotel?.name === '待确认' || sectionData.value.transport?.to === '待确认'
)

const pendingReasons = computed(() => {
  const reasons = []
  if (sectionData.value.hotel?.name === '待确认' || sectionData.value.transport?.to === '待确认') {
    reasons.push('缺少会议地点')
  }
  return reasons.join('、')
})

const pendingTargets = computed(() => {
  const targets = []
  if (sectionData.value.hotel?.name === '待确认') targets.push('酒店')
  if (sectionData.value.transport?.to === '待确认') targets.push('交通方案')
  return targets.join('和')
})

const showBasicInfoNotice = computed(() => {
  const info = sectionData.value.basicInfo || {}
  return !info.meetingDate || !info.meetingLocation
})

const missingBasicFields = computed(() => {
  const info = sectionData.value.basicInfo || {}
  const missing = []
  if (!info.meetingDate) missing.push('会议时间')
  if (!info.meetingLocation) missing.push('会议地点')
  return missing.join('、')
})

const showFlightNotice = computed(() => {
  const flight = sectionData.value.flight || {}
  return !flight.departure || !flight.destination || !flight.departureTime
})

const missingFlightFields = computed(() => {
  const info = sectionData.value.basicInfo || {}
  const missing = []
  if (!info.departure) missing.push('出发地')
  if (!info.destination) missing.push('目的地')
  if (!info.departureTime) missing.push('起飞时间')
  return missing.join('、')
})
</script>

<style scoped>
/* 背景遮罩 - 展开状态 */
.floating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 基础卡片样式 */
.floating-info-dense-card {
  background: #FFFFFF;
  border-radius: 12px;
  transition: all 0.3s ease;
}

/* 展开状态卡片 - 居中显示，带阴影 */
.expanded-card {
  position: relative;
  z-index: 1000;
  max-width: 900px;
  min-width: 320px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 8px 32px rgba(0, 0, 0, 0.15);
}

/* 收起状态卡片 - 右上角显示，无阴影 */
.minimized-card {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
  min-width: 280px;
}

.minimized-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.minimized-header:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.minimized-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.minimized-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.minimized-title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
}

.minimized-subtitle {
  font-size: 0.75rem;
  opacity: 0.9;
  line-height: 1.2;
}

.minimized-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 展开状态 */
.expanded-content {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}

.expanded-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

.card-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.info-dense-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  padding: 24px;
  overflow: auto;
}

/* 信息提示卡片 */
.info-notice-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 8px;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.notice-icon {
  font-size: 1.2rem;
}

.notice-title {
  font-weight: 600;
  color: #856404;
  font-size: 1rem;
}

.notice-content {
  color: #856404;
}

.notice-text {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.notice-list {
  margin: 8px 0;
  padding-left: 16px;
}

.notice-list li {
  font-size: 0.85rem;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notice-suggestion {
  margin: 12px 0 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c5ce7;
  background: rgba(108, 92, 231, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #6c5ce7;
}

.dense-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dense-card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dense-card-title {
  font-weight: bold;
  font-size: 1.1rem;
}

.flight-status, .hotel-status {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  background: #d4edda;
  color: #155724;
}

.hotel-status.pending {
  background: #fff3cd;
  color: #856404;
}

.temperature {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.flight-main, .hotel-main, .weather-main, .transport-main, .schedule-main {
  margin-bottom: 8px;
}

.flight-route, .route {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1rem;
}

.flight-time, .duration, .method, .cost, .timing, .hotel-details, .membership, .benefits, .packing-suggestions, .condition, .humidity {
  font-size: 0.95rem;
  color: #666;
}

.flight-footer, .hotel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seat {
  color: #1976d2;
  font-size: 0.95rem;
}

.price {
  color: #dc3545;
  font-size: 1.2rem;
  font-weight: bold;
}

.price:contains('待确认') {
  color: #6c757d;
  font-style: italic;
}

.benefit-tag, .suggestion-item {
  background: #E3F2FD;
  color: #1976D2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 4px;
}

.conflict-count {
  background: #FFF3CD;
  color: #856404;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.no-conflicts {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #28A745;
  font-weight: 500;
}

.conflicts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conflict-item {
  background: #FFF3CD;
  border: 1px solid #FFEAA7;
  border-radius: 6px;
  padding: 8px;
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.75rem;
}

.conflict-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.conflict-suggestion {
  font-size: 0.75rem;
  color: #856404;
}

/* 底部规划详情按钮 */
.planning-detail-section {
  grid-column: 1 / -1;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.planning-detail-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.planning-detail-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-text {
  font-size: 1.1rem;
  font-weight: 600;
}

.btn-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* 悬浮输入框区域 */
.floating-input-section {
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .expanded-card { max-width: 98vw; }
  .info-dense-grid { grid-template-columns: 1fr; }
}

.hotel-pending {
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 600;
  margin: 24px 0 16px 0;
  text-align: center;
}

.basic-info-card {
  grid-column: 1 / -1;
  background: #f4f8fb;
  border: 1px solid #e3eaf2;
  border-radius: 10px;
  padding: 14px 20px 10px 20px;
  margin-bottom: 10px;
  font-size: 0.98rem;
}
.basic-info-row {
  margin-bottom: 4px;
  color: #34495e;
}
.basic-info-label {
  font-weight: 600;
  color: #1976d2;
  margin-right: 6px;
}
</style> 