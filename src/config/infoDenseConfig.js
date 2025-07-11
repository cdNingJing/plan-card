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

// 可用工具集（全局默认值）
export const AVAILABLE_TOOLS = [
  {
    "title": "提供无过敏菜单",
    "description": "帮你规避食物过敏",
    "component": "AllergyFreeMenuCard"
  },
  {
    "title": "去除蔬菜菜单",
    "description": "让挑食的孩子吃得开心",
    "component": "NoVegetableMenuCard"
  },
  {
    "title": "派对主题推荐",
    "description": "选一个孩子喜欢的风格",
    "component": "PartyThemeCard"
  },
  {
    "title": "派对时间建议",
    "description": "选一个大家都有空的时间",
    "component": "PartyTimeCard"
  },
  {
    "title": "采购清单生成",
    "description": "告诉你需要准备什么东西",
    "component": "ShoppingListCard"
  },
  {
    "title": "餐厅列表",
    "description": "根据偏好自动匹配餐厅",
    "component": "RestaurantMatchCard"
  },
  {
    "title": "填写餐厅预订信息",
    "description": "一键确认完成预订",
    "component": "RestaurantBookingCard"
  }
] 