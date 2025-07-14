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

// 可用工具集（重新组织，删除重复，分为通用组件和垂直领域组件）
export const AVAILABLE_TOOLS = [
  // ===== 通用智能分析组件 =====
  {
    "title": "偏好趋势分析",
    "description": "分析你的消费和偏好变化趋势",
    "aiDescription": "深度分析用户的消费习惯、饮食偏好、社交方式等行为变化趋势，识别从重口味到清淡健康、从冲动消费到理性投资、从大群体聚会到小圈子深度交流等偏好迁移模式。通过机器学习算法识别用户行为模式的变化，提供个性化的生活建议和预测性服务。适用于分析用户长期行为数据，发现潜在的生活优化机会。",
    "component": "TrendAnalysisCard",
    "category": "通用分析"
  },
  {
    "title": "安全避雷筛选",
    "description": "基于过敏和恐惧信息自动排除不适合的内容",
    "aiDescription": "智能识别用户的过敏信息（如花生、海鲜、牛奶、猫毛等）和恐惧因素（如恐高、害怕财务问题、社交焦虑等），自动过滤和排除不适合的内容、活动、场所和推荐。通过建立用户安全档案，确保所有推荐都符合用户的安全需求。支持动态更新过敏和恐惧信息，提供实时的安全保护。适用于所有涉及推荐和选择的场景。",
    "component": "AvoidanceFilterCard",
    "category": "通用安全"
  },
  {
    "title": "心愿记忆管理",
    "description": "记录和唤醒你的人生心愿",
    "aiDescription": "长期记录和智能唤醒用户的人生心愿（如开宠物咖啡店、环游世界、学潜水、创业等），结合用户的安全信息（过敏、恐惧）提供安全的心愿实现方案。通过自然语言处理识别用户表达的心愿，建立心愿档案，定期提醒和更新。支持心愿的优先级排序、实现路径规划、风险评估等功能。适用于帮助用户实现人生目标和梦想。",
    "component": "WishMemoryCard",
    "category": "通用心愿"
  },
  {
    "title": "收藏推荐系统",
    "description": "基于你的收藏和兴趣推荐相关内容",
    "aiDescription": "分析用户的长期收藏（如手工艺品、书籍、邮票、艺术品等）和兴趣偏好，智能推荐相关的学习资源、创业资料、文化内容、技能培训等。通过协同过滤和内容推荐算法，发现用户可能感兴趣的新内容。支持收藏分类管理、兴趣标签提取、推荐理由解释等功能。适用于个性化内容推荐和学习路径规划。",
    "component": "CollectionRecommendCard",
    "category": "通用推荐"
  },
  {
    "title": "纪念日提醒",
    "description": "管理重要日期和人物关系",
    "aiDescription": "智能管理用户的重要日期（如妈妈生日、结婚纪念日、孩子开学日、朋友生日等）和人物关系，分析用户对纪念日庆祝方式的变化趋势（从传统聚餐转向体验式活动、从物质礼物转向精神体验等）。支持纪念日分类、提醒设置、庆祝建议、关系维护等功能。通过情感分析理解用户对重要关系的重视程度。",
    "component": "AnniversaryReminderCard",
    "category": "通用提醒"
  },
  {
    "title": "生活习惯洞察",
    "description": "发现你的隐性生活习惯变化",
    "aiDescription": "深度洞察用户的隐性生活习惯变化，如从夜猫子到早睡早起、从外卖党到自己做饭、从宅家到经常运动、从冲动消费到理性投资等。通过行为模式识别和预测分析，提供预测性服务和优化建议。支持习惯追踪、变化趋势分析、健康建议、生活优化方案等功能。适用于个人生活管理和健康改善。",
    "component": "HabitInsightCard",
    "category": "通用洞察"
  },

  // ===== 餐饮服务垂直组件 =====
  {
    "title": "无过敏菜单生成",
    "description": "基于过敏信息生成安全的菜单选项",
    "aiDescription": "根据用户的过敏信息（花生、海鲜、牛奶、坚果等）自动生成安全的菜单选项，确保饮食安全。通过食材数据库和过敏原匹配算法，排除含有过敏原的菜品，推荐安全的替代方案。支持多种过敏原组合、营养均衡考虑、口味偏好匹配等功能。适用于餐厅点餐、家庭烹饪、外卖选择等场景。",
    "component": "AllergyFreeMenuCard",
    "category": "餐饮服务"
  },
  {
    "title": "挑食友好菜单",
    "description": "为不喜欢蔬菜的孩子提供菜单选择",
    "aiDescription": "专门为不喜欢吃蔬菜的孩子设计菜单，通过创意烹饪方法（如蔬菜隐藏、趣味造型、营养替代等）让孩子在不知不觉中摄入营养。支持年龄适配、营养均衡、趣味性设计、家长指导等功能。适用于儿童营养管理、挑食改善、家庭烹饪等场景。",
    "component": "NoVegetableMenuCard",
    "category": "餐饮服务"
  },
  {
    "title": "智能餐厅匹配",
    "description": "根据偏好和过敏信息匹配最适合的餐厅",
    "aiDescription": "基于用户的位置、饮食偏好、过敏信息、预算、用餐时间等条件，智能匹配最适合的餐厅。通过多维度评分算法，考虑餐厅的菜品安全、口味匹配、价格合理、位置便利等因素。支持实时位置服务、用户评价整合、个性化推荐等功能。适用于外出用餐、商务宴请、家庭聚餐等场景。",
    "component": "RestaurantMatchCard",
    "category": "餐饮服务"
  },
  {
    "title": "一键餐厅预订",
    "description": "简化餐厅预订流程",
    "aiDescription": "提供一键式餐厅预订服务，自动填写用户信息、用餐时间、人数、特殊要求（如过敏、座位偏好、生日庆祝等）。通过API集成多个预订平台，实现统一的预订体验。支持预订确认、变更通知、用餐提醒、评价收集等功能。适用于各种用餐场景的预订需求。",
    "component": "RestaurantBookingCard",
    "category": "餐饮服务"
  },

  // ===== 社交活动垂直组件 =====
  {
    "title": "派对主题推荐",
    "description": "根据孩子兴趣推荐合适的派对主题",
    "aiDescription": "根据孩子的年龄、性别、兴趣爱好（如恐龙、公主、超级英雄、动物等），推荐最适合的派对主题。通过主题数据库和年龄适配算法，提供完整的主题方案，包括装饰风格、活动安排、音乐选择、游戏设计等。支持个性化定制、预算控制、安全考虑等功能。适用于儿童生日派对、节日庆祝等场景。",
    "component": "PartyThemeCard",
    "category": "社交活动"
  },
  {
    "title": "派对时间优化",
    "description": "分析大家空闲时间推荐最佳派对时间",
    "aiDescription": "通过分析参与者的日程安排和空闲时间，智能推荐最适合举办派对的日期和时间，确保更多人能参加。考虑参与者的工作安排、孩子上学时间、交通便利性、天气情况等因素。支持时间冲突检测、参与度预测、备选方案提供等功能。适用于各种聚会活动的时间安排。",
    "component": "PartyTimeCard",
    "category": "社交活动"
  },
  {
    "title": "智能采购清单",
    "description": "根据派对主题和人数生成详细采购清单",
    "aiDescription": "根据派对主题、参与人数、预算限制，自动生成详细的采购清单，包括装饰品、食物、饮料、礼品、游戏道具等。通过智能算法计算所需数量，考虑预算分配、采购优先级、替代方案等。支持清单导出、采购提醒、预算跟踪、供应商推荐等功能。适用于各种聚会活动的准备工作。",
    "component": "ShoppingListCard",
    "category": "社交活动"
  }
] 