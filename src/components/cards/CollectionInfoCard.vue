<template>
  <div class="collection-info-card">
    <div class="card-header">
      <h3 class="card-title">场景信息</h3>
    </div>
    <button v-if="showCloseButton" class="close-button" @click="handleClose">
      <X :size="16" />
    </button>
    <div class="card-content">
      <!-- 结构化数据展示 -->
      <div v-if="scenarioData" class="data-section">
        <!-- 基础信息 -->
        <div class="data-group basic-info" v-if="scenarioData.basicInfo">
          <div class="group-title">基础信息</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.basicInfo" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value basic-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 机票预订场景 -->
        <div class="data-group" v-if="scenarioData.flightBooking">
          <div class="group-title">机票预订</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.flightBooking" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
            <!-- 机票偏好设置 -->
            <div class="preferences-section" v-if="scenarioData.preferences">
              <div class="section-title">偏好设置</div>
              <div class="nested-object">
                <div v-for="(value, key) in getFlightPreferences()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- 机票约束条件 -->
            <div class="constraints-section" v-if="scenarioData.constraints">
              <div class="section-title">约束条件</div>
              <div class="nested-object">
                <div v-for="(value, key) in getFlightConstraints()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 酒店预订场景 -->
        <div class="data-group" v-if="scenarioData.hotelBooking">
          <div class="group-title">酒店预订</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.hotelBooking" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
            <!-- 酒店偏好设置 -->
            <div class="preferences-section" v-if="scenarioData.preferences">
              <div class="section-title">偏好设置</div>
              <div class="nested-object">
                <div v-for="(value, key) in getHotelPreferences()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- 酒店约束条件 -->
            <div class="constraints-section" v-if="scenarioData.constraints">
              <div class="section-title">约束条件</div>
              <div class="nested-object">
                <div v-for="(value, key) in getHotelConstraints()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 餐厅预订场景 -->
        <div class="data-group" v-if="scenarioData.restaurantBooking">
          <div class="group-title">餐厅预订</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.restaurantBooking" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
            <!-- 餐厅偏好设置 -->
            <div class="preferences-section" v-if="scenarioData.preferences">
              <div class="section-title">偏好设置</div>
              <div class="nested-object">
                <div v-for="(value, key) in getRestaurantPreferences()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- 餐厅约束条件 -->
            <div class="constraints-section" v-if="scenarioData.constraints">
              <div class="section-title">约束条件</div>
              <div class="nested-object">
                <div v-for="(value, key) in getRestaurantConstraints()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 派对聚会场景 -->
        <div class="data-group" v-if="scenarioData.partyEvent">
          <div class="group-title">派对聚会</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.partyEvent" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
            <!-- 派对偏好设置 -->
            <div class="preferences-section" v-if="scenarioData.preferences">
              <div class="section-title">偏好设置</div>
              <div class="nested-object">
                <div v-for="(value, key) in getPartyPreferences()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- 派对约束条件 -->
            <div class="constraints-section" v-if="scenarioData.constraints">
              <div class="section-title">约束条件</div>
              <div class="nested-object">
                <div v-for="(value, key) in getPartyConstraints()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 购物采购场景 -->
        <div class="data-group" v-if="scenarioData.shoppingTrip">
          <div class="group-title">购物采购</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.shoppingTrip" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
            <!-- 购物偏好设置 -->
            <div class="preferences-section" v-if="scenarioData.preferences">
              <div class="section-title">偏好设置</div>
              <div class="nested-object">
                <div v-for="(value, key) in getShoppingPreferences()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- 购物约束条件 -->
            <div class="constraints-section" v-if="scenarioData.constraints">
              <div class="section-title">约束条件</div>
              <div class="nested-object">
                <div v-for="(value, key) in getShoppingConstraints()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 医疗预约场景 -->
        <div class="data-group" v-if="scenarioData.medicalAppointment">
          <div class="group-title">医疗预约</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.medicalAppointment" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
            <!-- 医疗偏好设置 -->
            <div class="preferences-section" v-if="scenarioData.preferences">
              <div class="section-title">偏好设置</div>
              <div class="nested-object">
                <div v-for="(value, key) in getMedicalPreferences()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- 医疗约束条件 -->
            <div class="constraints-section" v-if="scenarioData.constraints">
              <div class="section-title">约束条件</div>
              <div class="nested-object">
                <div v-for="(value, key) in getMedicalConstraints()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 教育培训场景 -->
        <div class="data-group" v-if="scenarioData.educationCourse">
          <div class="group-title">教育培训</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.educationCourse" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
            <!-- 教育偏好设置 -->
            <div class="preferences-section" v-if="scenarioData.preferences">
              <div class="section-title">偏好设置</div>
              <div class="nested-object">
                <div v-for="(value, key) in getEducationPreferences()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- 教育约束条件 -->
            <div class="constraints-section" v-if="scenarioData.constraints">
              <div class="section-title">约束条件</div>
              <div class="nested-object">
                <div v-for="(value, key) in getEducationConstraints()" :key="key" class="nested-item">
                  <span class="nested-key">{{ formatKey(key) }}</span>
                  <span class="nested-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 健身运动场景 -->
        <div class="data-group" v-if="scenarioData.fitnessTraining">
          <div class="group-title">健身运动</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.fitnessTraining" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 汽车保养场景 -->
        <div class="data-group" v-if="scenarioData.carMaintenance">
          <div class="group-title">汽车保养</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.carMaintenance" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 宠物护理场景 -->
        <div class="data-group" v-if="scenarioData.petCare">
          <div class="group-title">宠物护理</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.petCare" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 家庭维修场景 -->
        <div class="data-group" v-if="scenarioData.homeRepair">
          <div class="group-title">家庭维修</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.homeRepair" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 美容美发场景 -->
        <div class="data-group" v-if="scenarioData.beautySalon">
          <div class="group-title">美容美发</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.beautySalon" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 法律咨询场景 -->
        <div class="data-group" v-if="scenarioData.legalConsultation">
          <div class="group-title">法律咨询</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.legalConsultation" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 心理咨询场景 -->
        <div class="data-group" v-if="scenarioData.psychologicalCounseling">
          <div class="group-title">心理咨询</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.psychologicalCounseling" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 摄影服务场景 -->
        <div class="data-group" v-if="scenarioData.photographyService">
          <div class="group-title">摄影服务</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.photographyService" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 搬家服务场景 -->
        <div class="data-group" v-if="scenarioData.movingService">
          <div class="group-title">搬家服务</div>
          <div class="group-content">
            <div class="nested-object">
              <div v-for="(value, key) in scenarioData.movingService" :key="key" class="nested-item">
                <span class="nested-key">{{ formatKey(key) }}</span>
                <span class="nested-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <Info :size="24" />
        </div>
        <div class="empty-text">暂无场景数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Info, X } from 'lucide-vue-next'
import { useScenarioStore } from '@/stores/scenarioStore'

// 使用场景数据store
const scenarioStore = useScenarioStore()

// 从store获取数据
const scenarioData = computed(() => scenarioStore.scenarioData)

// 定义props
const props = defineProps({
  showCloseButton: {
    type: Boolean,
    default: true
  }
})

// 关闭组件
const handleClose = () => {
  // 触发关闭事件
  emit('close')
}

// 定义事件
const emit = defineEmits(['close'])

// 格式化键名
const formatKey = (key) => {
  const keyMap = {
    // 基础信息
    'userName': '用户名',
    'phone': '手机号',
    'email': '邮箱',
    'address': '地址',
    'emergencyContact': '紧急联系人',
    
    // 机票场景
    'departure': '出发地',
    'destination': '目的地',
    'startDate': '开始日期',
    'endDate': '结束日期',
    'travelers': '旅行人数',
    'travelType': '旅行类型',
    'budget': '预算',
    'companions': '同行人',
    'duration': '行程天数',
    'purpose': '出行目的',
    
    // 酒店场景
    'hotelName': '酒店名称',
    'checkIn': '入住日期',
    'checkOut': '退房日期',
    'roomType': '房间类型',
    'guests': '入住人数',
    'location': '位置',
    'amenities': '设施',
    
    // 餐厅场景
    'restaurantName': '餐厅名称',
    'diningTime': '用餐时间',
    'diningDate': '用餐日期',
    'diners': '用餐人数',
    'cuisine': '菜系偏好',
    'occasion': '用餐场合',
    
    // 派对场景
    'partyType': '派对类型',
    'partyTime': '派对时间',
    'partyDate': '派对日期',
    'partyLocation': '派对地点',
    'attendees': '参与人数',
    'theme': '派对主题',
    
    // 购物场景
    'shoppingList': '购物清单',
    'shoppingBudget': '购物预算',
    'shoppingTime': '购物时间',
    'shoppingLocation': '购物地点',
    'priority': '优先级',
    
    // 医疗场景
    'appointmentType': '预约类型',
    'doctorName': '医生姓名',
    'department': '科室',
    'appointmentDate': '预约日期',
    'appointmentTime': '预约时间',
    'symptoms': '症状描述',
    'insurance': '保险类型',
    
    // 教育场景
    'courseName': '课程名称',
    'institution': '培训机构',
    'schedule': '课程安排',
    'instructor': '授课老师',
    'students': '学员人数',
    'level': '课程级别',
    
    // 健身场景
    'workoutType': '训练类型',
    'gymName': '健身房名称',
    'trainerName': '教练姓名',
    'sessionTime': '训练时间',
    'sessionDate': '训练日期',
    'duration': '训练时长',
    'focus': '训练重点',
    
    // 汽车保养场景
    'carModel': '车型',
    'serviceType': '服务类型',
    'serviceCenter': '服务中心',
    'mileage': '里程数',
    'services': '服务项目',
    
    // 宠物护理场景
    'petName': '宠物名称',
    'petType': '宠物类型',
    'veterinary': '宠物医院',
    'vaccines': '疫苗类型',
    
    // 家庭维修场景
    'repairType': '维修类型',
    'serviceProvider': '服务提供商',
    'issue': '问题描述',
    'urgency': '紧急程度',
    'estimatedCost': '预估费用',
    
    // 美容美发场景
    'salonName': '美发店名称',
    'stylistName': '发型师',
    'hairColor': '发色',
    'style': '发型',
    
    // 法律咨询场景
    'consultationType': '咨询类型',
    'lawyerName': '律师姓名',
    'lawFirm': '律师事务所',
    'caseType': '案件类型',
    
    // 心理咨询场景
    'counselingType': '咨询类型',
    'therapistName': '心理师姓名',
    'clinicName': '咨询中心',
    'sessionType': '咨询类型',
    
    // 摄影服务场景
    'photographerName': '摄影师姓名',
    'studioName': '摄影工作室',
    'shootDate': '拍摄日期',
    'shootTime': '拍摄时间',
    'location': '拍摄地点',
    'package': '套餐类型',
    
    // 搬家服务场景
    'companyName': '搬家公司',
    'moveDate': '搬家日期',
    'moveTime': '搬家时间',
    'fromAddress': '搬出地址',
    'toAddress': '搬入地址',
    'items': '搬运物品',
    
    // 偏好设置
    'seatClass': '座位等级',
    'mealPreference': '餐食偏好',
    'baggage': '行李重量',
    'roomPreference': '房间偏好',
    'dietaryRestrictions': '饮食限制',
    'breakfast': '早餐',
    'parking': '停车',
    'winePairing': '配酒',
    'privateRoom': '包间',
    'catering': '餐饮',
    'decorations': '装饰',
    'music': '音乐',
    'brandPreference': '品牌偏好',
    'sizePreference': '尺码偏好',
    'returnPolicy': '退换政策',
    'preferredTime': '偏好时间',
    'doctorGender': '医生性别',
    'hospitalLevel': '医院等级',
    'followUp': '随访安排',
    'learningStyle': '学习方式',
    'groupSize': '班级规模',
    'materials': '教材提供',
    'certificate': '证书需求',
    
    // 约束条件
    'maxBudget': '最大预算',
    'flexibleDates': '日期灵活',
    'directFlight': '直飞航班',
    'accessibility': '无障碍设施',
    'allergies': '过敏信息',
    'petFriendly': '宠物友好',
    'dressCode': '着装要求',
    'noiseLevel': '噪音控制',
    'timeLimit': '时间限制',
    'maxWaitTime': '最大等待时间',
    'emergency': '紧急情况',
    'timeCommitment': '时间投入',
    'prerequisites': '前置要求',
    'onlineOnly': '仅限在线'
  }
  return keyMap[key] || key
}

// 格式化值
const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '未设置'
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return String(value)
}

// 获取机票偏好设置
const getFlightPreferences = () => {
  return {
    "seatClass": scenarioData.value.preferences.seatClass,
    "mealPreference": scenarioData.value.preferences.mealPreference,
    "baggage": scenarioData.value.preferences.baggage
  }
}

// 获取机票约束条件
const getFlightConstraints = () => {
  return {
    "maxBudget": scenarioData.value.constraints.maxBudget,
    "flexibleDates": scenarioData.value.constraints.flexibleDates,
    "directFlight": scenarioData.value.constraints.directFlight
  }
}

// 获取酒店偏好设置
const getHotelPreferences = () => {
  return {
    "roomPreference": scenarioData.value.preferences.roomPreference,
    "breakfast": scenarioData.value.preferences.breakfast,
    "parking": scenarioData.value.preferences.parking
  }
}

// 获取酒店约束条件
const getHotelConstraints = () => {
  return {
    "maxBudget": scenarioData.value.constraints.maxBudget,
    "accessibility": scenarioData.value.constraints.accessibility,
    "petFriendly": scenarioData.value.constraints.petFriendly
  }
}

// 获取餐厅偏好设置
const getRestaurantPreferences = () => {
  return {
    "dietaryRestrictions": scenarioData.value.preferences.dietaryRestrictions,
    "winePairing": scenarioData.value.preferences.winePairing,
    "privateRoom": scenarioData.value.preferences.privateRoom
  }
}

// 获取餐厅约束条件
const getRestaurantConstraints = () => {
  return {
    "maxBudget": scenarioData.value.constraints.maxBudget,
    "allergies": scenarioData.value.constraints.allergies,
    "dressCode": scenarioData.value.constraints.dressCode
  }
}

// 获取派对偏好设置
const getPartyPreferences = () => {
  return {
    "catering": scenarioData.value.preferences.catering,
    "decorations": scenarioData.value.preferences.decorations,
    "music": scenarioData.value.preferences.music
  }
}

// 获取派对约束条件
const getPartyConstraints = () => {
  return {
    "maxBudget": scenarioData.value.constraints.maxBudget,
    "allergies": scenarioData.value.constraints.allergies,
    "noiseLevel": scenarioData.value.constraints.noiseLevel
  }
}

// 获取购物偏好设置
const getShoppingPreferences = () => {
  return {
    "brandPreference": scenarioData.value.preferences.brandPreference,
    "sizePreference": scenarioData.value.preferences.sizePreference,
    "returnPolicy": scenarioData.value.preferences.returnPolicy
  }
}

// 获取购物约束条件
const getShoppingConstraints = () => {
  return {
    "maxBudget": scenarioData.value.constraints.maxBudget,
    "timeLimit": scenarioData.value.constraints.timeLimit,
    "parking": scenarioData.value.preferences.parking
  }
}

// 获取医疗偏好设置
const getMedicalPreferences = () => {
  return {
    "preferredTime": scenarioData.value.preferences.preferredTime,
    "doctorGender": scenarioData.value.preferences.doctorGender,
    "hospitalLevel": scenarioData.value.preferences.hospitalLevel,
    "followUp": scenarioData.value.preferences.followUp
  }
}

// 获取医疗约束条件
const getMedicalConstraints = () => {
  return {
    "maxWaitTime": scenarioData.value.constraints.maxWaitTime,
    "accessibility": scenarioData.value.constraints.accessibility,
    "emergency": scenarioData.value.constraints.emergency
  }
}

// 获取教育偏好设置
const getEducationPreferences = () => {
  return {
    "learningStyle": scenarioData.value.preferences.learningStyle,
    "groupSize": scenarioData.value.preferences.groupSize,
    "materials": scenarioData.value.preferences.materials,
    "certificate": scenarioData.value.preferences.certificate
  }
}

// 获取教育约束条件
const getEducationConstraints = () => {
  return {
    "maxBudget": scenarioData.value.constraints.maxBudget,
    "timeCommitment": scenarioData.value.constraints.timeCommitment,
    "prerequisites": scenarioData.value.constraints.prerequisites,
    "onlineOnly": scenarioData.value.constraints.onlineOnly
  }
}

// 暴露方法给父组件
defineExpose({
  // 更新场景数据
  updateScenarioData: scenarioStore.updateScenarioData,
  // 更新基础信息
  updateBasicInfo: scenarioStore.updateBasicInfo,
  // 更新偏好设置
  updatePreferences: scenarioStore.updatePreferences,
  // 更新约束条件
  updateConstraints: scenarioStore.updateConstraints,
  // 重置所有数据
  resetAllData: scenarioStore.resetAllData
})

</script>

<style scoped>
.collection-info-card {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 24px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  min-width: 320px;
  height: 600px;
  overflow-y: auto;
  position: relative;
}

.collection-info-card::-webkit-scrollbar {
  display: none;
}

.card-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: white;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  position: absolute;
  right: 20px;
  top: 20px;
}

.close-button:hover {
  opacity: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.data-group.basic-info {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.group-title {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.data-group.basic-info .group-title {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.group-content {
  padding: 12px;
}

.nested-object {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nested-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nested-item:last-child {
  border-bottom: none;
}

.nested-key {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.nested-value {
  font-size: 12px;
  color: white;
  font-weight: 600;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nested-value.basic-value {
  color: white;
  font-weight: 700;
}

.array-value {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.array-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.array-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.array-item {
  background: rgba(99, 102, 241, 0.2);
  color: #bfcfff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.simple-value {
  padding: 6px 0;
}

.value-text {
  font-size: 12px;
  color: white;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
}

.preferences-section, .constraints-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-top: 12px;
}

.section-title {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preferences-section .section-title {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

@media (max-width: 768px) {
  .collection-info-card {
    max-width: 100%;
    min-width: auto;
  }
}
</style> 