// 信息密集型卡片配置模板
export const infoDenseConfig = {
  flight: {
    title: '推荐航班',
    fields: [
      { key: 'departure', label: '出发地' },
      { key: 'destination', label: '目的地' },
      { key: 'departureTime', label: '起飞时间' },
      { key: 'arrivalTime', label: '到达时间' },
      { key: 'duration', label: '飞行时长' },
      { key: 'seatPreference', label: '座位偏好' },
      { key: 'price', label: '价格' },
      { key: 'status', label: '状态' },
      { key: 'statusText', label: '状态文本' }
    ]
  },
  hotel: {
    title: '推荐酒店',
    fields: [
      { key: 'name', label: '酒店名称' },
      { key: 'distance', label: '距离' },
      { key: 'rating', label: '评分' },
      { key: 'membershipLevel', label: '会员等级' },
      { key: 'benefits', label: '会员权益' },
      { key: 'price', label: '价格' },
      { key: 'status', label: '状态' },
      { key: 'statusText', label: '状态文本' }
    ]
  },
  weather: {
    title: '天气预报',
    fields: [
      { key: 'temperature', label: '温度' },
      { key: 'condition', label: '天气状况' },
      { key: 'humidity', label: '湿度' },
      { key: 'packingSuggestions', label: '行李建议' }
    ]
  },
  transport: {
    title: '交通安排',
    fields: [
      { key: 'from', label: '出发地' },
      { key: 'to', label: '目的地' },
      { key: 'method', label: '交通方式' },
      { key: 'cost', label: '费用' },
      { key: 'duration', label: '时长' },
      { key: 'estimatedTime', label: '预计到达' }
    ]
  },
  schedule: {
    title: '日程提醒',
    fields: [
      { key: 'conflicts', label: '冲突事件' }
    ]
  }
} 