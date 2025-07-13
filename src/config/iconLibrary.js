import { 
  BookOpen, 
  Code, 
  Settings, 
  AlertTriangle, 
  History, 
  HelpCircle, 
  GraduationCap, 
  BookMarked,
  FileText,
  FileCode,
  FileType,
  FileJson,
  FileText as FileTxt,
  Brain,
  Database
} from 'lucide-vue-next'

// 图标库配置
export const iconLibrary = {
  // 文档类型图标
  document: {
    guide: {
      component: BookOpen,
      color: '#6366f1'
    },
    api: {
      component: Code,
      color: '#6366f1'
    },
    config: {
      component: Settings,
      color: '#6366f1'
    },
    troubleshooting: {
      component: AlertTriangle,
      color: '#6366f1'
    },
    changelog: {
      component: History,
      color: '#6366f1'
    },
    faq: {
      component: HelpCircle,
      color: '#6366f1'
    },
    tutorial: {
      component: GraduationCap,
      color: '#6366f1'
    },
    reference: {
      component: BookMarked,
      color: '#6366f1'
    }
  },
  
  // 文件格式图标
  format: {
    pdf: {
      component: FileText,
      color: '#6366f1'
    },
    markdown: {
      component: FileCode,
      color: '#6366f1'
    },
    html: {
      component: FileType,
      color: '#6366f1'
    },
    json: {
      component: FileJson,
      color: '#6366f1'
    },
    text: {
      component: FileTxt,
      color: '#6366f1'
    }
  },
  
  // AI 数据图标
  'ai-data': {
    json: {
      component: Brain,
      color: '#8b5cf6'
    }
  }
}

// 获取图标函数
export const getIcon = (type, category = 'document') => {
  const categoryIcons = iconLibrary[category]
  if (!categoryIcons) {
    return iconLibrary.document.guide // 默认图标
  }
  
  const iconData = categoryIcons[type]
  if (!iconData) {
    return iconLibrary.document.guide // 默认图标
  }
  
  return iconData
}

// 文档类型映射
export const documentTypes = {
  guide: { name: '使用指南', type: 'guide', category: 'document' },
  api: { name: 'API文档', type: 'api', category: 'document' },
  config: { name: '配置说明', type: 'config', category: 'document' },
  troubleshooting: { name: '故障排除', type: 'troubleshooting', category: 'document' },
  changelog: { name: '更新日志', type: 'changelog', category: 'document' },
  faq: { name: '常见问题', type: 'faq', category: 'document' },
  tutorial: { name: '教程', type: 'tutorial', category: 'document' },
  reference: { name: '参考手册', type: 'reference', category: 'document' },
  pdf: { name: 'PDF文档', type: 'pdf', category: 'format' },
  markdown: { name: 'Markdown', type: 'markdown', category: 'format' },
  html: { name: 'HTML文档', type: 'html', category: 'format' },
  json: { name: 'JSON配置', type: 'json', category: 'format' },
  text: { name: '文本文件', type: 'text', category: 'format' }
}