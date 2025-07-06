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
        type: 'number',
        placeholder: '请输入出行人数',
        required: false,
        min: 1,
        max: 10,
        defaultValue: 1,
        description: '请输入1-10之间的正整数'
      },
      {
        key: 'budget',
        label: '预算',
        type: 'input',
        required: false,
        placeholder: '请输入预算（如8000元、预算不限等）'
      }
    ]
  },

  // 礼物场景 - 专注于购买接口所需信息
  gift: {
    title: '礼物选择基础信息',
    description: '请告诉我们您想给谁买礼物，我们会帮您找到最合适的礼物',
    fields: [
      {
        key: 'recipient',
        label: '收礼人',
        type: 'text',
        placeholder: '例如：妈妈、爸爸、女朋友、同事等',
        required: false,
        description: '您想给谁买礼物？'
      },
      // {
      //   key: 'occasion',
      //   label: '送礼场合',
      //   type: 'text',
      //   placeholder: '例如：生日、母亲节、结婚纪念日、新年等',
      //   required: false,
      //   description: '什么场合送这个礼物？'
      // },
      // {
      //   key: 'budget',
      //   label: '预算范围',
      //   type: 'text',
      //   placeholder: '例如：500元以内、1000-2000元、预算不限等',
      //   required: false,
      //   description: '您的预算大概是多少？'
      // },
      // {
      //   key: 'interests',
      //   label: '收礼人兴趣',
      //   type: 'text',
      //   placeholder: '例如：园艺、阅读、运动、美食、科技等',
      //   required: false,
      //   description: '收礼人有什么兴趣爱好？'
      // },
      {
        key: 'searchQuery',
        label: '具体需求',
        type: 'textarea',
        placeholder: '如果您已经有具体想法，请详细描述：\n例如：想要母亲节礼物推荐，预算500元以内\n或者：想要一款性价比高的手机，预算在3000元左右',
        required: true,
        rows: 4,
        description: '如果您已经有具体的礼物想法，可以在这里详细描述'
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
        required: false,
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
        label: '会议时长（小时）',
        type: 'text',
        required: true,
        required: false,
        placeholder: '请选择会议时长',
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