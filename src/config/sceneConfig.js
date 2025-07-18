// 场景配置管理器
export const sceneConfigs = {
  'group-chat': {
    title: 'Mom Squad',
    subtitle: 'Messenger',
    avatarText: 'MS',
    avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    inputPlaceholder: 'Ask follow-up...',
    showCall: true,
    showVideo: true,
    showCamera: true,
    showImage: true,
    showMic: true,
    showEmoji: true,
    showThumbsUp: true,
    messages: [
      {
        id: 1,
        sender: 'Sarah',
        text: 'Morning everyone! How\'s everyone\'s week going?',
        time: '09:15',
        isOwn: false
      },
      {
        id: 2,
        sender: 'Emma',
        text: 'Busy as always! Kids had soccer practice yesterday',
        time: '09:17',
        isOwn: false
      },
      {
        id: 3,
        sender: 'You',
        text: 'Same here! Emma had her dance recital on Sunday',
        time: '09:20',
        isOwn: true
      },
      {
        id: 4,
        sender: 'Sarah',
        text: 'Oh that\'s so sweet! How did it go?',
        time: '09:22',
        isOwn: false
      },
      {
        id: 5,
        sender: 'You',
        text: 'She did great! So proud of her 💕',
        time: '09:25',
        isOwn: true
      },
      {
        id: 6,
        sender: 'Sarah',
        text: 'Speaking of kids... isn\'t Tommy\'s birthday coming up soon, Sarah?',
        time: '09:30',
        isOwn: false
      }
    ]
  },
  'news': {
    title: '财经新闻',
    subtitle: '实时更新',
    avatarText: '📰',
    avatarBg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    inputPlaceholder: '搜索新闻...',
    showCall: false,
    showVideo: false,
    showCamera: false,
    showImage: false,
    showMic: true,
    showEmoji: false,
    showThumbsUp: false,
    news: [
      {
        id: 1,
        title: '美股三大指数集体收涨，科技股领涨',
        summary: '道指涨0.8%，纳指涨1.2%，标普500指数涨0.9%。苹果、微软等科技股表现强劲。',
        time: '09:30',
        category: '美股',
        trending: true
      },
      {
        id: 2,
        title: '央行宣布降准0.25个百分点',
        summary: '释放长期资金约5000亿元，支持实体经济发展，市场流动性将得到改善。',
        time: '10:15',
        category: '政策',
        trending: true
      },
      {
        id: 3,
        title: '新能源汽车销量同比增长45%',
        summary: '1-11月累计销量突破600万辆，比亚迪、特斯拉等品牌表现突出。',
        time: '11:00',
        category: '汽车',
        trending: false
      },
      {
        id: 4,
        title: '黄金价格创年内新高',
        summary: '受避险情绪推动，COMEX黄金期货价格突破2000美元/盎司关口。',
        time: '11:45',
        category: '贵金属',
        trending: true
      },
      {
        id: 5,
        title: 'A股三大指数震荡上行',
        summary: '沪指涨0.5%，深成指涨0.8%，创业板指涨1.1%。北向资金净流入超50亿元。',
        time: '14:30',
        category: 'A股',
        trending: false
      }
    ]
  },
  'document': {
    title: '文档阅读',
    subtitle: 'PDF Viewer',
    avatarText: '📄',
    avatarBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    inputPlaceholder: '搜索文档...',
    showCall: false,
    showVideo: false,
    showCamera: false,
    showImage: false,
    showMic: true,
    showEmoji: false,
    showThumbsUp: false,
    documents: [
      {
        id: 1,
        title: '产品需求文档',
        subtitle: 'PRD - 用户管理系统',
        type: 'pdf',
        size: '2.3MB',
        lastModified: '2024-01-15',
        pages: 24,
        status: 'active'
      },
      {
        id: 2,
        title: '技术架构设计',
        subtitle: '系统架构文档',
        type: 'docx',
        size: '1.8MB',
        lastModified: '2024-01-12',
        pages: 18,
        status: 'recent'
      },
      {
        id: 3,
        title: '用户调研报告',
        subtitle: 'Q4 用户行为分析',
        type: 'pdf',
        size: '3.1MB',
        lastModified: '2024-01-10',
        pages: 32,
        status: 'archived'
      },
      {
        id: 4,
        title: '项目计划书',
        subtitle: '2024年度规划',
        type: 'pptx',
        size: '4.2MB',
        lastModified: '2024-01-08',
        pages: 45,
        status: 'active'
      },
      {
        id: 5,
        title: '财务预算表',
        subtitle: '年度预算明细',
        type: 'xlsx',
        size: '1.5MB',
        lastModified: '2024-01-05',
        pages: 12,
        status: 'recent'
      }
    ]
  }
}

// 获取场景配置
export function getSceneConfig(sceneType) {
  return sceneConfigs[sceneType] || sceneConfigs['group-chat']
}

// 获取所有可用的场景类型
export function getAvailableSceneTypes() {
  return Object.keys(sceneConfigs)
}

// 获取场景数据
export function getSceneData(sceneType) {
  const config = getSceneConfig(sceneType)
  return {
    messages: config.messages || [],
    news: config.news || [],
    documents: config.documents || []
  }
}

// 更新场景消息
export function updateSceneMessages(sceneType, newMessage) {
  const config = getSceneConfig(sceneType)
  if (config.messages) {
    config.messages.push(newMessage)
  }
} 