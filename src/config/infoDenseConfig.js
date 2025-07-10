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
    "title": "搜索功能",
    "description": "可以搜索各种信息，包括工作、学习资料、新闻等"
  },
  {
    "title": "整理功能",
    "description": "可以整理和分类信息，生成结构化数据"
  },
  {
    "title": "分析功能",
    "description": "可以分析用户需求，提供个性化建议"
  },
  {
    "title": "规划功能",
    "description": "可以制定计划和流程，帮助用户达成目标"
  },
  {
    "title": "提醒功能",
    "description": "可以设置提醒和通知，帮助用户管理时间"
  },
  {
    "title": "机票查询",
    "description": "可以查询航班信息、价格比较、预订机票"
  },
  {
    "title": "酒店查询",
    "description": "可以查询酒店信息、价格、预订房间"
  },
  {
    "title": "地图功能",
    "description": "可以查询路线、地点、周边信息"
  },
  {
    "title": "翻译功能",
    "description": "可以翻译文本、文档、网页内容"
  },
  {
    "title": "计算器",
    "description": "可以进行各种数学计算、单位转换"
  },
  {
    "title": "天气查询",
    "description": "可以查询天气信息、预报、空气质量"
  },
  {
    "title": "新闻资讯",
    "description": "可以获取最新新闻、行业动态"
  },
  {
    "title": "文档处理",
    "description": "可以创建、编辑、转换各种文档格式"
  },
  {
    "title": "图片处理",
    "description": "可以编辑、压缩、转换图片格式"
  },
  {
    "title": "语音识别",
    "description": "可以将语音转换为文字"
  },
  {
    "title": "日程管理",
    "description": "可以管理日程安排、会议提醒"
  },
  {
    "title": "联系人管理",
    "description": "可以管理联系人信息、通讯录"
  },
  {
    "title": "文件管理",
    "description": "可以整理、备份、同步文件"
  },
  {
    "title": "笔记功能",
    "description": "可以记录、整理、搜索笔记"
  },
  {
    "title": "任务管理",
    "description": "可以创建、跟踪、完成待办事项"
  }
] 