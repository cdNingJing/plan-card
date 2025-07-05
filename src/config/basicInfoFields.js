// 基础信息字段配置
export const basicInfoFieldsConfig = {
  // 旅行场景 - 专注于机票和酒店接口所需信息
  travel: {
    title: '旅行基础信息',
    description: '请填写旅行相关信息，我们将为您查找合适的机票和酒店',
    fields: [
      {
        key: 'departure',
        label: '出发地',
        type: 'text',
        placeholder: '请输入出发城市',
        required: true
      },
      {
        key: 'destination',
        label: '目的地',
        type: 'text',
        placeholder: '请输入目的地',
        required: true
      },
      {
        key: 'startDate',
        label: '出发日期',
        type: 'date',
        required: true,
        min: new Date().toISOString().split('T')[0]
      },
      {
        key: 'endDate',
        label: '返程日期',
        type: 'date',
        required: false,
        min: new Date().toISOString().split('T')[0]
      },
      {
        key: 'travelers',
        label: '出行人数',
        type: 'text',
        placeholder: '出行人数',
        required: false
      },
      {
        key: 'budget',
        label: '预算范围',
        type: 'select',
        required: false,
        placeholder: '请选择预算范围',
        options: [
          { value: 'budget', label: '经济型 (≤3000元)' },
          { value: 'comfort', label: '舒适型 (3000-8000元)' },
          { value: 'luxury', label: '豪华型 (>8000元)' }
        ]
      }
    ]
  },

  // 礼物场景 - 专注于购买接口所需信息
  gift: {
    title: '礼物推荐基础信息',
    description: '请提供基本信息，我们将为您推荐合适的礼物并提供购买链接',
    fields: [
      {
        key: 'recipient',
        label: '收礼人',
        type: 'text',
        placeholder: '请输入收礼人称呼',
        required: true,
        description: '例如：妈妈、朋友、同事等'
      },
      {
        key: 'occasion',
        label: '送礼场合',
        type: 'select',
        required: true,
        placeholder: '请选择场合',
        options: [
          { value: 'birthday', label: '生日' },
          { value: 'holiday', label: '节日' },
          { value: 'anniversary', label: '纪念日' },
          { value: 'just-because', label: '日常表达' }
        ],
        description: '送礼的具体场合'
      },
      {
        key: 'budget',
        label: '预算',
        type: 'range',
        min: 50,
        max: 2000,
        step: 50,
        defaultValue: 300,
        format: 'currency',
        description: '您的预算范围'
      },
      {
        key: 'interests',
        label: '收礼人兴趣',
        type: 'checkbox',
        options: [
          { value: 'gardening', label: '园艺' },
          { value: 'cooking', label: '烹饪' },
          { value: 'reading', label: '阅读' },
          { value: 'sports', label: '运动' },
          { value: 'tech', label: '科技' },
          { value: 'fashion', label: '时尚' }
        ],
        description: '收礼人的主要兴趣爱好（可多选）'
      }
    ]
  },

  // 会议场景 - 专注于邮箱发送功能所需信息
  meeting: {
    title: '会议基础信息',
    description: '请填写会议信息，我们将通过邮箱发送会议提醒',
    fields: [
      {
        key: 'meetingTitle',
        label: '会议主题',
        type: 'text',
        placeholder: '请输入会议主题',
        required: true,
        description: '会议的主要议题'
      },
      {
        key: 'meetingDate',
        label: '会议日期',
        type: 'date',
        required: true,
        min: new Date().toISOString().split('T')[0],
        description: '会议举行的日期'
      },
      {
        key: 'startTime',
        label: '开始时间',
        type: 'time',
        required: true,
        description: '会议开始时间'
      },
      {
        key: 'participants',
        label: '参会人员邮箱',
        type: 'textarea',
        rows: 3,
        placeholder: '请输入参会人员邮箱，每行一个...',
        required: true,
        description: '需要发送会议提醒的邮箱地址'
      },
      {
        key: 'duration',
        label: '会议时长',
        type: 'select',
        required: false,
        placeholder: '请选择会议时长',
        options: [
          { value: '30', label: '30分钟' },
          { value: '60', label: '1小时' },
          { value: '120', label: '2小时' },
          { value: '240', label: '半天' }
        ],
        description: '预计会议持续时间'
      },
      {
        key: 'location',
        label: '会议地点',
        type: 'text',
        placeholder: '请输入会议地点或链接',
        description: '会议室地址或在线会议链接'
      }
    ]
  },

  // 通用场景
  general: {
    title: '基础信息',
    description: '请填写相关信息，我们将为您提供个性化的建议',
    fields: [
      {
        key: 'title',
        label: '标题',
        type: 'text',
        placeholder: '请输入标题',
        required: true,
        description: '简要描述您的需求'
      },
      {
        key: 'description',
        label: '详细描述',
        type: 'textarea',
        rows: 4,
        placeholder: '请详细描述您的需求...',
        required: true,
        description: '提供更多详细信息'
      }
    ]
  }
}

// 根据场景获取字段配置
export const getBasicInfoFields = (scenario = 'general') => {
  return basicInfoFieldsConfig[scenario] || basicInfoFieldsConfig.general
}

// 获取所有可用场景
export const getAvailableScenarios = () => {
  return Object.keys(basicInfoFieldsConfig)
} 