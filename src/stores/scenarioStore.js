import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useScenarioStore = defineStore('scenario', () => {
  // 模拟场景数据
  const scenarioData = reactive({
    // 基础信息 - 所有场景共用
    "basicInfo": {
      "userName": "张三",
      "phone": "138****8888",
      "email": "zhangsan@example.com",
      "address": "北京市朝阳区",
      "emergencyContact": "李四 139****9999"
    },
    // 机票预订场景
    "flightBooking": {
      "departure": "成都",
      "destination": "纽约",
      "startDate": "2025-07-10",
      "endDate": "2025-07-17",
      "travelers": 2,
      "travelType": "leisure",
      "budget": "8000元",
      "companions": ["朋友"],
      "duration": 7,
      "purpose": "旅游"
    },
    // 酒店预订场景
    "hotelBooking": {
      "hotelName": "希尔顿酒店",
      "checkIn": "2025-07-10",
      "checkOut": "2025-07-17",
      "roomType": "标准双人间",
      "guests": 2,
      "location": "市中心",
      "amenities": ["WiFi", "健身房", "游泳池"]
    },
    // 餐厅预订场景
    "restaurantBooking": {
      "restaurantName": "米其林三星餐厅",
      "diningTime": "19:00",
      "diningDate": "2025-07-15",
      "diners": 4,
      "cuisine": "法式料理",
      "occasion": "生日聚会"
    },
    // 派对聚会场景
    "partyEvent": {
      "partyType": "生日派对",
      "partyTime": "18:00",
      "partyDate": "2025-07-20",
      "partyLocation": "家中",
      "attendees": 15,
      "theme": "复古主题"
    },
    // 购物采购场景
    "shoppingTrip": {
      "shoppingList": ["衣服", "鞋子", "化妆品"],
      "shoppingBudget": "3000元",
      "shoppingTime": "周末",
      "shoppingLocation": "购物中心",
      "priority": "高"
    },
    // 医疗预约场景
    "medicalAppointment": {
      "appointmentType": "体检预约",
      "doctorName": "王医生",
      "department": "内科",
      "appointmentDate": "2025-07-25",
      "appointmentTime": "09:00",
      "symptoms": "常规体检",
      "insurance": "医保"
    },
    // 教育培训场景
    "educationCourse": {
      "courseName": "Python编程进阶",
      "institution": "在线教育平台",
      "startDate": "2025-08-01",
      "endDate": "2025-10-31",
      "schedule": "每周二、四 19:00-21:00",
      "instructor": "李老师",
      "students": 25,
      "level": "中级"
    },
    // 健身运动场景
    "fitnessTraining": {
      "workoutType": "力量训练",
      "gymName": "超级健身房",
      "trainerName": "陈教练",
      "sessionTime": "18:00",
      "sessionDate": "2025-07-12",
      "duration": "90分钟",
      "focus": ["胸肌", "背肌", "腿部"]
    },
    // 汽车保养场景
    "carMaintenance": {
      "carModel": "丰田凯美瑞",
      "serviceType": "定期保养",
      "serviceCenter": "丰田4S店",
      "appointmentDate": "2025-07-18",
      "appointmentTime": "10:00",
      "mileage": "50000公里",
      "services": ["机油更换", "滤芯更换", "轮胎检查"]
    },
    // 宠物护理场景
    "petCare": {
      "petName": "小白",
      "petType": "金毛犬",
      "serviceType": "疫苗接种",
      "veterinary": "爱心宠物医院",
      "appointmentDate": "2025-07-22",
      "appointmentTime": "14:00",
      "vaccines": ["狂犬疫苗", "三联疫苗"]
    },
    // 家庭维修场景
    "homeRepair": {
      "repairType": "水管维修",
      "serviceProvider": "专业维修公司",
      "appointmentDate": "2025-07-14",
      "appointmentTime": "09:00",
      "issue": "厨房水龙头漏水",
      "urgency": "紧急",
      "estimatedCost": "200元"
    },
    // 美容美发场景
    "beautySalon": {
      "serviceType": "染发造型",
      "salonName": "美丽人生美发店",
      "stylistName": "张美美",
      "appointmentDate": "2025-07-16",
      "appointmentTime": "15:00",
      "hairColor": "栗棕色",
      "style": "韩式卷发"
    },
    // 法律咨询场景
    "legalConsultation": {
      "consultationType": "合同纠纷",
      "lawyerName": "李律师",
      "lawFirm": "正义律师事务所",
      "appointmentDate": "2025-07-28",
      "appointmentTime": "16:00",
      "caseType": "商业合同",
      "urgency": "一般"
    },
    // 心理咨询场景
    "psychologicalCounseling": {
      "counselingType": "情绪管理",
      "therapistName": "王心理师",
      "clinicName": "心灵港湾咨询中心",
      "appointmentDate": "2025-07-30",
      "appointmentTime": "19:00",
      "sessionType": "个人咨询",
      "duration": "60分钟"
    },
    // 摄影服务场景
    "photographyService": {
      "serviceType": "婚纱摄影",
      "photographerName": "陈摄影师",
      "studioName": "美好时光摄影工作室",
      "shootDate": "2025-08-05",
      "shootTime": "09:00",
      "location": "外景拍摄",
      "package": "豪华套餐"
    },
    // 搬家服务场景
    "movingService": {
      "serviceType": "家庭搬家",
      "companyName": "安心搬家服务",
      "moveDate": "2025-08-10",
      "moveTime": "08:00",
      "fromAddress": "朝阳区建国路88号",
      "toAddress": "海淀区中关村大街1号",
      "items": ["家具", "电器", "书籍"]
    },
    // 偏好设置
    "preferences": {
      "seatClass": "经济舱",
      "mealPreference": "无特殊要求",
      "baggage": "20kg",
      "roomPreference": "高楼层",
      "breakfast": "含早餐",
      "parking": "需要停车",
      "dietaryRestrictions": "无",
      "winePairing": "需要配酒",
      "privateRoom": "需要包间",
      "catering": "外卖披萨",
      "decorations": "气球装饰",
      "music": "流行音乐",
      "brandPreference": "知名品牌",
      "sizePreference": "标准码",
      "returnPolicy": "7天退换",
      "preferredTime": "上午",
      "doctorGender": "不限",
      "hospitalLevel": "三甲医院",
      "followUp": "需要随访",
      "learningStyle": "实践为主",
      "groupSize": "小班教学",
      "materials": "提供教材",
      "certificate": "需要证书"
    },
    // 约束条件
    "constraints": {
      "maxBudget": "8000元",
      "flexibleDates": true,
      "directFlight": false,
      "accessibility": "无障碍设施",
      "allergies": "无过敏",
      "petFriendly": false,
      "dressCode": "正装",
      "noiseLevel": "控制音量",
      "timeLimit": "3小时",
      "maxWaitTime": "30分钟",
      "emergency": false,
      "timeCommitment": "每周6小时",
      "prerequisites": "基础Python知识",
      "onlineOnly": true
    }
  })

  // 更新场景数据的方法
  const updateScenarioData = (scenarioKey, data) => {
    if (scenarioData[scenarioKey]) {
      Object.assign(scenarioData[scenarioKey], data)
    }
  }

  // 更新基础信息
  const updateBasicInfo = (data) => {
    Object.assign(scenarioData.basicInfo, data)
  }

  // 更新偏好设置
  const updatePreferences = (data) => {
    Object.assign(scenarioData.preferences, data)
  }

  // 更新约束条件
  const updateConstraints = (data) => {
    Object.assign(scenarioData.constraints, data)
  }

  // 重置所有数据
  const resetAllData = () => {
    // 这里可以重新初始化数据
    console.log('重置所有场景数据')
  }

  return {
    scenarioData,
    updateScenarioData,
    updateBasicInfo,
    updatePreferences,
    updateConstraints,
    resetAllData
  }
}) 