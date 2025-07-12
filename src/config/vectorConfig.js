/**
 * 向量搜索配置文件
 * 统一管理向量搜索相关的配置参数
 */

export const VECTOR_CONFIG = {
  // 搜索选项
  searchOptions: {
    similarityThreshold: 0.15,
    maxResults: 20,
    embeddingModel: 'paraphrase-multilingual-MiniLM-L12-v2'
  },

  // 中文停用词
  stopwords: [
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', 
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', 
    '自己', '这', '那', '他', '她', '它', '们', '个', '只', '条', '张', '片', '块',
    '把', '被', '给', '让', '使', '得', '地', '得', '着', '过', '来', '去', '回',
    '进', '出', '上', '下', '左', '右', '前', '后', '里', '外', '中', '间', '旁边',
    '附近', '周围', '里面', '外面', '上面', '下面', '前面', '后面', '左边', '右边'
  ],

  // 实体词典
  entityDictionary: {
    names: [
      '李秀英', '林美华', 'Lin Meihua', '妈妈', '父亲', '爸爸'
    ],
    foods: [
      '红烧肉', '糖醋里脊', '清蒸鲈鱼', '麻婆豆腐', '宫保鸡丁', '蒜蓉西兰花', 
      '番茄炒蛋', '酸菜鱼', '意大利菜', '日式', '定食', '生鱼片', '芥末', 
      '榴莲', '臭豆腐', '苦瓜', '粥', '包子', '豆浆', '油条', '米饭', 
      '炒菜', '汤', '面条', '饺子'
    ],
    activities: [
      '园艺', '烹饪', '广场舞', '看电视剧', '阅读', '插花', '散步', 
      '买菜', '购物', '看电视', '打电话', '整理家务'
    ],
    places: [
      '北京', '海淀区', '万柳中路小区', '北医三院', '新中关购物中心', 
      '西单大悦城', 'Trattoria Roma', '元气寿司'
    ],
    health: [
      '高血压', '糖尿病前期', '降压药', '降糖药', '海鲜过敏', '花生过敏', 
      '少盐', '少油', '少糖'
    ],
    personality: [
      '细心', '节俭', '关心家人', '传统', '勤劳', '温柔', '喜欢计划'
    ]
  },

  // 姓名特殊处理配置
  nameSearchConfig: {
    // 姓名查询关键词
    nameQueryKeywords: [
      '名字', '姓名', '叫什么', '李秀英', '林美华', 'Lin Meihua'
    ],
    // 姓名映射关系
    nameMappings: {
      '妈妈': ['妈妈', '母亲', '李秀英', '林美华', 'lin meihua'],
      '李秀英': ['李秀英', '林美华', 'lin meihua', '妈妈'],
      '林美华': ['李秀英', '林美华', 'lin meihua', '妈妈']
    }
  },

  // 搜索策略权重配置
  strategyWeights: {
    'name-search': 0.5,
    'semantic-vector': 0.35,
    'tfidf-search': 0.3,
    'keyword-match': 0.25,
    'entity-match': 0.2,
    'fuzzy-search': 0.15
  },

  // TF-IDF配置
  tfidfConfig: {
    maxFeatures: 1000,
    ngramRange: [1, 2]
  },

  // 关键词匹配配置
  keywordMatchConfig: {
    minWordLength: 2,
    fuzzyRatioThreshold: 80,
    partialMatchRatio: 0.5
  },

  // 实体匹配配置
  entityMatchConfig: {
    exactMatchScore: 1.0,
    contentMatchScore: 0.8,
    relationshipMatchScore: 0.9,
    nameMatchScore: 0.95
  }
}

/**
 * 获取向量搜索配置
 * @param {string} configKey - 配置键名
 * @returns {any} 配置值
 */
export function getVectorConfig(configKey) {
  return VECTOR_CONFIG[configKey] || null
}

/**
 * 获取搜索选项
 * @returns {Object} 搜索选项
 */
export function getSearchOptions() {
  return VECTOR_CONFIG.searchOptions
}

/**
 * 获取停用词列表
 * @returns {Array} 停用词列表
 */
export function getStopwords() {
  return VECTOR_CONFIG.stopwords
}

/**
 * 获取实体词典
 * @returns {Object} 实体词典
 */
export function getEntityDictionary() {
  return VECTOR_CONFIG.entityDictionary
}

/**
 * 获取姓名搜索配置
 * @returns {Object} 姓名搜索配置
 */
export function getNameSearchConfig() {
  return VECTOR_CONFIG.nameSearchConfig
}

/**
 * 获取搜索策略权重
 * @returns {Object} 策略权重
 */
export function getStrategyWeights() {
  return VECTOR_CONFIG.strategyWeights
}

/**
 * 更新配置
 * @param {string} configKey - 配置键名
 * @param {any} value - 新值
 */
export function updateVectorConfig(configKey, value) {
  if (VECTOR_CONFIG.hasOwnProperty(configKey)) {
    VECTOR_CONFIG[configKey] = value
  }
}

/**
 * 重置配置到默认值
 */
export function resetVectorConfig() {
  // 这里可以重新加载默认配置
  // 暂时保持当前实现
} 