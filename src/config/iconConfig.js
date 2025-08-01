/**
 * 图标配置系统
 * 统一管理第三方图标库，禁用表情符号
 */

// 图标库映射 - 使用 Lucide Icons 作为主要图标库
export const ICON_LIBRARY = 'lucide' // 或 'feather', 'heroicons' 等

// 通用图标映射
export const ICONS = {
  // 基础操作
  'plus': 'plus',
  'minus': 'minus',
  'search': 'search',
  'settings': 'settings',
  'menu': 'menu',
  'close': 'x',
  'check': 'check',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  
  // 通信和输入
  'mic': 'mic',
  'mic-off': 'mic-off',
  'send': 'send',
  'keyboard': 'keyboard',
  'message-circle': 'message-circle',
  'phone': 'phone',
  'mail': 'mail',
  
  // 时间和日程
  'clock': 'clock',
  'calendar': 'calendar',
  'calendar-clock': 'calendar-clock',
  'bell': 'bell',
  'bell-off': 'bell-off',
  'timer': 'timer',
  'hourglass': 'hourglass',
  
  // 天气
  'sun': 'sun',
  'cloud': 'cloud',
  'cloud-rain': 'cloud-rain',
  'cloud-snow': 'cloud-snow',
  'wind': 'wind',
  'thermometer': 'thermometer',
  
  // 学习和工作
  'book': 'book',
  'book-open': 'book-open',
  'graduation-cap': 'graduation-cap',
  'briefcase': 'briefcase',
  'folder': 'folder',
  'file': 'file',
  'edit': 'edit',
  'pen-tool': 'pen-tool',
  
  // 健康和运动
  'heart': 'heart',
  'activity': 'activity',
  'zap': 'zap',
  'shield': 'shield',
  'target': 'target',
  
  // 社交和分享
  'users': 'users',
  'user': 'user',
  'share': 'share',
  'share-2': 'share-2',
  'thumbs-up': 'thumbs-up',
  'star': 'star',
  
  // 媒体和娱乐
  'play': 'play',
  'pause': 'pause',
  'stop': 'stop',
  'volume-2': 'volume-2',
  'volume-x': 'volume-x',
  'camera': 'camera',
  'image': 'image',
  
  // 导航和位置
  'home': 'home',
  'map-pin': 'map-pin',
  'navigation': 'navigation',
  'compass': 'compass',
  
  // 数据和分析
  'bar-chart': 'bar-chart',
  'pie-chart': 'pie-chart',
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',
  'analytics': 'bar-chart-3',
  
  // 系统和工具
  'wifi': 'wifi',
  'bluetooth': 'bluetooth',
  'battery': 'battery',
  'power': 'power',
  'refresh': 'refresh-cw',
  'download': 'download',
  'upload': 'upload',
  
  // 状态和反馈
  'alert-circle': 'alert-circle',
  'alert-triangle': 'alert-triangle',
  'info': 'info',
  'help-circle': 'help-circle',
  'eye': 'eye',
  'eye-off': 'eye-off'
}

// 卡片类型图标映射
export const CARD_ICONS = {
  // 通用固定卡片
  'time': ICONS.clock,
  'weather': ICONS.cloud,
  'alarm': ICONS.bell,
  'calendar': ICONS.calendar,
  
  // 学业相关卡片
  'exam-countdown': ICONS['calendar-clock'],
  'study-progress': ICONS['book-open'],
  'grade-tracking': ICONS['graduation-cap'],
  
  // 健康相关卡片
  'exercise-record': ICONS.activity,
  'diet-tracking': ICONS.heart,
  'health-reminder': ICONS.shield,
  
  // 事业相关卡片
  'project-progress': ICONS.briefcase,
  'meeting-schedule': ICONS.calendar,
  'goal-completion': ICONS.target
}

// 梦想类型图标映射
export const DREAM_ICONS = {
  'education': ICONS['graduation-cap'],
  'career': ICONS.briefcase,
  'health': ICONS.heart,
  'finance': ICONS['trending-up'],
  'family': ICONS.users,
  'travel': ICONS.navigation,
  'skill': ICONS['pen-tool'],
  'business': ICONS.briefcase
}

// 快捷指令图标映射
export const COMMAND_ICONS = {
  'alarm': ICONS.clock,
  'weather': ICONS.cloud,
  'dream': ICONS.plus,
  'progress': ICONS.book,
  'reminder': ICONS.bell,
  'calendar': ICONS.calendar,
  'health': ICONS.heart,
  'finance': ICONS['trending-up']
}

// 超时间维度图标映射
export const DIMENSION_ICONS = {
  'history': ICONS.clock,
  'analysis': ICONS.analytics,
  'future': ICONS['trending-up'],
  'connections': ICONS['share-2']
}

/**
 * 获取图标类名
 * @param {string} iconKey - 图标键名
 * @param {string} category - 图标分类 (可选)
 * @returns {string} 完整的图标类名
 */
export function getIconClass(iconKey, category = null) {
  let iconName = iconKey
  
  // 根据分类查找图标
  if (category) {
    const categoryMaps = {
      'card': CARD_ICONS,
      'dream': DREAM_ICONS,
      'command': COMMAND_ICONS,
      'dimension': DIMENSION_ICONS
    }
    
    const categoryMap = categoryMaps[category]
    if (categoryMap && categoryMap[iconKey]) {
      iconName = categoryMap[iconKey]
    }
  }
  
  // 如果在通用图标中找到，使用通用图标
  if (ICONS[iconKey]) {
    iconName = ICONS[iconKey]
  }
  
  // 返回完整的CSS类名
  return `icon-${iconName}`
}

/**
 * 获取SVG图标路径 (如果使用内联SVG)
 * @param {string} iconKey - 图标键名
 * @returns {string} SVG路径
 */
export function getIconSvg(iconKey) {
  // 这里可以根据需要返回SVG路径
  // 目前返回空字符串，使用CSS图标字体
  return ''
}

/**
 * 验证图标是否存在
 * @param {string} iconKey - 图标键名
 * @returns {boolean} 图标是否存在
 */
export function validateIcon(iconKey) {
  return Object.prototype.hasOwnProperty.call(ICONS, iconKey)
}

/**
 * 获取所有可用图标列表
 * @returns {Array} 图标键名数组
 */
export function getAvailableIcons() {
  return Object.keys(ICONS)
}

// 默认导出配置对象
export default {
  ICON_LIBRARY,
  ICONS,
  CARD_ICONS,
  DREAM_ICONS,
  COMMAND_ICONS,
  DIMENSION_ICONS,
  getIconClass,
  getIconSvg,
  validateIcon,
  getAvailableIcons
}