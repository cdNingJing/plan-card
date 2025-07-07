// 商务行程专用服务
export class BusinessTravelService {
  constructor() {
    this.defaultPreferences = {
      seatPreference: 'aisle',
      hotelPreference: 'near_client',
      mealPreference: 'business',
      transportPreference: 'efficient'
    }
  }

  // 生成商务行程提示词
  generateBusinessTravelPrompt(userInput, userInfo) {
    const prompt = `您是一位专业的商务行程规划专家。用户需要进行商务出差，请根据以下信息提供专业的建议：

**用户需求：** ${userInput}

**用户信息：**
- 出发地：${userInfo.departure || '待确认'}
- 目的地：${userInfo.destination || '待确认'}
- 出发日期：${userInfo.startDate || '待确认'}
- 返程日期：${userInfo.endDate || '待确认'}
- 客户地点：${userInfo.clientLocation || '待确认'}
- 会议时间：${userInfo.meetingTime || '待确认'}
- 座位偏好：${this.getSeatPreferenceText(userInfo.seatPreference)}
- 酒店偏好：${this.getHotelPreferenceText(userInfo.hotelPreference)}

**请提供以下方面的专业建议：**

1. **航班推荐**：
   - 考虑商务出行的时间效率
   - 优先推荐中午前抵达的航班
   - 考虑用户的座位偏好
   - 推荐有WiFi的航班（便于路上工作）

2. **酒店推荐**：
   - 根据酒店偏好选择合适位置
   - 推荐商务型酒店，带健身房
   - 支持延迟退房
   - 靠近客户或交通便利

3. **交通安排**：
   - 机场到客户地点的交通方案
   - 酒店到客户地点的交通方案
   - 预估费用和时间

4. **准备事项**：
   - 根据天气和会议类型生成行李清单
   - 商务着装建议
   - 会议材料准备提醒

5. **通讯管理**：
   - 自动草拟冲突日程调整邮件
   - 出差通知模板
   - 自动回复设置

6. **天气和着装建议**：
   - 目的地天气预报
   - 根据天气和会议类型提供着装建议

请以专业、高效的方式组织这些信息，确保用户能够快速了解所有关键信息并做出决策。`
    
    return prompt
  }

  // 获取座位偏好文本
  getSeatPreferenceText(preference) {
    const preferenceMap = {
      'aisle': '靠走道座位',
      'window': '靠窗座位',
      'front': '前排座位',
      'any': '无特殊要求'
    }
    return preferenceMap[preference] || '无特殊要求'
  }

  // 获取酒店偏好文本
  getHotelPreferenceText(preference) {
    const preferenceMap = {
      'near_client': '靠近客户',
      'near_airport': '靠近机场',
      'city_center': '市中心',
      'any': '无特殊要求'
    }
    return preferenceMap[preference] || '无特殊要求'
  }

  // 生成商务行程概览数据
  generateBusinessTravelOverview(userInfo) {
    return {
      flightInfo: this.generateFlightInfo(userInfo),
      hotelInfo: this.generateHotelInfo(userInfo),
      weatherInfo: this.generateWeatherInfo(userInfo),
      transportInfo: this.generateTransportInfo(userInfo),
      conflicts: this.detectConflicts(userInfo),
      preparations: this.generatePreparations(userInfo)
    }
  }

  // 生成航班信息
  generateFlightInfo(userInfo) {
    if (!userInfo.departure || !userInfo.destination) {
      return null
    }

    return {
      departure: userInfo.departure,
      arrival: userInfo.destination,
      airline: '推荐航空公司',
      departureTime: '09:00',
      duration: '2小时30分钟',
      seatPreference: this.getSeatPreferenceText(userInfo.seatPreference)
    }
  }

  // 生成酒店信息
  generateHotelInfo(userInfo) {
    if (!userInfo.destination) {
      return null
    }

    return {
      name: '商务酒店推荐',
      rating: 4.5,
      distanceToClient: '0.5',
      hasGym: true,
      hasWifi: true,
      lateCheckout: true
    }
  }

  // 生成天气信息
  generateWeatherInfo(userInfo) {
    if (!userInfo.destination) {
      return null
    }

    return {
      temperature: 22,
      condition: '晴天',
      humidity: 65,
      windSpeed: 12,
      packingSuggestion: '建议携带商务正装，天气适宜'
    }
  }

  // 生成交通信息
  generateTransportInfo(userInfo) {
    if (!userInfo.destination) {
      return null
    }

    return {
      airportToClient: {
        method: '出租车',
        duration: '30分钟',
        cost: 120
      },
      hotelToClient: {
        method: '步行',
        duration: '5分钟',
        cost: 0
      }
    }
  }

  // 检测日程冲突
  detectConflicts(userInfo) {
    const conflicts = []
    
    // 这里可以集成日历API来检测真实冲突
    // 目前返回示例数据
    if (userInfo.meetingTime) {
      conflicts.push({
        id: 'conflict_1',
        time: userInfo.meetingTime,
        event: '原定会议',
        suggestion: '建议提前调整或通知相关人员'
      })
    }

    return conflicts
  }

  // 生成准备事项
  generatePreparations(userInfo) {
    const preparations = [
      {
        id: 'prep_1',
        task: '准备会议材料',
        completed: false
      },
      {
        id: 'prep_2',
        task: '确认客户地址',
        completed: false
      },
      {
        id: 'prep_3',
        task: '预订交通工具',
        completed: false
      }
    ]

    // 根据目的地添加特定准备事项
    if (userInfo.destination) {
      preparations.push({
        id: 'prep_4',
        task: `准备${userInfo.destination}的商务着装`,
        completed: false
      })
    }

    return preparations
  }

  // 生成通讯管理数据
  generateCommunicationData(userInfo) {
    return {
      emailTasks: [
        {
          id: 'email_1',
          type: 'conflict',
          typeText: '冲突调整',
          status: 'draft',
          statusText: '草稿',
          title: '调整冲突日程',
          recipient: '同事',
          priority: '高',
          preview: '由于临时出差，需要调整明天的会议安排...'
        }
      ],
      notifications: [
        {
          id: 'notif_1',
          type: 'notification',
          typeText: '出差通知',
          status: 'pending',
          title: '出差通知',
          recipient: '家人',
          method: '微信',
          scheduledTime: '今天 18:00',
          message: `明天临时出差到${userInfo.destination || '目的地'}，预计后天回来`
        }
      ],
      autoReply: {
        enabled: false,
        message: `您好，我正在出差中，预计后天回来，紧急事务请电话联系。`
      }
    }
  }

  // 生成邮件模板
  generateEmailTemplate(type, userInfo) {
    const templates = {
      conflict: {
        subject: '会议时间调整通知',
        content: `您好，

由于临时商务出差安排，原定于${userInfo.meetingTime || '明天'}的会议需要调整时间。

建议调整到后天同一时间，或者我们可以安排线上会议。

给您带来的不便深表歉意。

谢谢！`
      },
      notification: {
        subject: '出差通知',
        content: `您好，

我将于${userInfo.startDate || '明天'}临时出差到${userInfo.destination || '目的地'}，预计${userInfo.endDate || '后天'}回来。

出差期间如有紧急事务，请电话联系。

谢谢！`
      },
      client: {
        subject: '会议确认',
        content: `您好，

关于我们明天在${userInfo.clientLocation || '贵公司'}的会议，我想确认一下具体时间和地点。

我预计${userInfo.meetingTime || '下午2点'}到达，请问是否方便？

谢谢！`
      }
    }

    return templates[type] || templates.notification
  }
}

export default BusinessTravelService 