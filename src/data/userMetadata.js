// 用户元数据 - 不可改变的个人信息和身份角色
export const userMetadata = {
  // 不可改变的个人信息
  personalInfo: {
    // 真实身份信息
    basicInfo: '姓名：王小明 | 性别：男 | 年龄：28岁 | 出生日期：1996年3月15日 | 身份证号：110101199603151234 | 手机号：138****5678 | 邮箱：wangxiaoming@example.com',
    
    // 基础生理信息
    physicalInfo: '身高：175厘米 | 体重：68公斤 | 血型：A型 | 眼睛颜色：棕色 | 头发颜色：黑色',
    
    // 出生地信息
    birthPlace: '出生地：中国北京市朝阳区',
    
    // 户籍信息
    householdInfo: '户籍所在地：中国北京市海淀区中关村大街1号',
    
    // 教育背景
    educationInfo: '最高学历：本科 | 毕业院校：北京大学 | 专业：计算机科学与技术 | 毕业年份：2018年',
    
    // 婚姻状况
    maritalInfo: '婚姻状况：已婚 | 结婚日期：2020年6月15日',
    
    // 紧急联系人
    emergencyContact: '紧急联系人：王大明（父亲）| 联系电话：139****1234 | 地址：北京市朝阳区建国路88号'
  },
  
  // 身份角色数组 - 用户在不同场景下的身份
  identityRoles: [
    {
      id: 'real_identity',
      type: 'real',
      description: '真实身份：王小明 | 显示名称：王小明 | 描述：我的真实身份，用于正式场合和法律事务 | 默认身份：是 | 活跃状态：是 | 创建时间：2024-01-01T00:00:00Z | 更新时间：2024-01-01T00:00:00Z | 法律姓名：王小明 | 官方证件：身份证、户口本、结婚证 | 验证级别：已验证',
      preferences: '隐私设置：不分享真实姓名、不分享联系信息、分享位置信息、不分享身份历史、允许身份追踪 | 通知设置：身份切换提醒开启、隐私警告开启、数据同步通知开启',
      metadata: '数据版本：1.0.0 | 创建时间：2024-01-01T00:00:00Z | 最后更新：2024-01-15T12:00:00Z | 数据完整性：已验证 | 校验和：abc123def456 | 数据来源：用户手动录入 | 验证状态：已通过 | 数据质量：高'
    },
    {
      id: 'work_identity',
      type: 'professional',
      description: '工作身份：王工程师 | 显示名称：王工程师 | 描述：在职场中的身份，专注于技术能力和职业发展 | 默认身份：否 | 活跃状态：是 | 创建时间：2024-01-01T00:00:00Z | 更新时间：2024-01-01T00:00:00Z | 公司：某互联网公司 | 职位：高级软件工程师 | 部门：技术部 | 员工ID：EMP2024001 | 工作邮箱：wang.engineer@company.com | 技能：JavaScript、Vue.js、Node.js、Python、Docker | 工作年限：5年 | 月薪：25000元 | 工作地点：北京市朝阳区 | 工作电话：010-12345678',
      preferences: '自动切换规则：工作时间09:00-18:00周一到周五在公司自动切换到工作身份 | 隐私设置：分享工作信息、分享技能信息、分享位置信息、不分享身份历史、允许身份追踪 | 通知设置：身份切换提醒开启、隐私警告开启、数据同步通知开启',
      metadata: '数据版本：1.0.0 | 创建时间：2024-01-01T00:00:00Z | 最后更新：2024-01-15T12:00:00Z | 数据完整性：已验证 | 校验和：def456ghi789 | 数据来源：公司HR系统同步 | 验证状态：已通过 | 数据质量：高'
    },
    {
      id: 'family_identity',
      type: 'family',
      description: '家庭身份：小王 | 显示名称：小王 | 描述：在家庭中的身份，作为丈夫和父亲 | 默认身份：否 | 活跃状态：是 | 创建时间：2024-01-01T00:00:00Z | 更新时间：2024-01-01T00:00:00Z | 家庭角色：丈夫 | 配偶姓名：李小美 | 子女：王小糖（3岁，女儿） | 家庭地址：北京市海淀区中关村大街100号 | 家庭电话：138****5678',
      preferences: '自动切换规则：家庭时间18:00-22:00每天在家庭自动切换到家庭身份 | 隐私设置：分享家庭信息、分享位置信息、不分享身份历史、允许身份追踪 | 通知设置：身份切换提醒开启、隐私警告开启、数据同步通知开启',
      metadata: '数据版本：1.0.0 | 创建时间：2024-01-01T00:00:00Z | 最后更新：2024-01-15T12:00:00Z | 数据完整性：已验证 | 校验和：ghi789jkl012 | 数据来源：家庭成员共享 | 验证状态：已通过 | 数据质量：高'
    },
    {
      id: 'social_identity',
      type: 'social',
      description: '社交身份：小明 | 显示名称：小明 | 描述：在朋友和社交圈中的身份，更加轻松随意 | 默认身份：否 | 活跃状态：是 | 创建时间：2024-01-01T00:00:00Z | 更新时间：2024-01-01T00:00:00Z | 昵称：小明 | 兴趣爱好：编程、游戏、音乐、电影 | 社交平台：微信xiaoming_tech、微博tech_xiaoming、GitHub xiaoming-dev、LinkedIn xiaoming-wang | 爱好：打游戏、听音乐、看电影、写代码 | 性格：内向但友善，技术宅',
      preferences: '隐私设置：分享兴趣爱好、分享社交平台、分享位置信息、不分享身份历史、允许身份追踪 | 通知设置：身份切换提醒开启、隐私警告开启、数据同步通知开启',
      metadata: '数据版本：1.0.0 | 创建时间：2024-01-01T00:00:00Z | 最后更新：2024-01-15T12:00:00Z | 数据完整性：已验证 | 校验和：jkl012mno345 | 数据来源：社交平台API同步 | 验证状态：已通过 | 数据质量：高'
    }
  ],
}

// 数据查询函数 - 根据ID返回对应的元数据
export function getUserMetadata(id = null) {
  if (!id) {
    // 不传ID时返回完整数据
    return userMetadata
  }
  
  // 根据ID查询对应的数据
  switch (id) {
    case 'personalInfo':
      return userMetadata.personalInfo
    case 'identityRoles':
      return userMetadata.identityRoles
    case 'identityHistory':
      return userMetadata.identityHistory
    case 'identityPreferences':
      return userMetadata.identityPreferences
    case 'extensions':
      return userMetadata.extensions
    default:
      // 如果是身份角色ID，返回对应的身份信息
      const identity = userMetadata.identityRoles.find(role => role.id === id)
      if (identity) {
        return identity
      }
      
      // 如果是历史记录ID，返回对应的历史记录
      const history = userMetadata.identityHistory.find(hist => hist.id === id)
      if (history) {
        return history
      }
      
      // 如果都没找到，返回null
      return null
  }
}

// 获取所有身份角色
export function getAllIdentityRoles() {
  return userMetadata.identityRoles
}

// 获取活跃的身份角色
export function getActiveIdentityRoles() {
  return userMetadata.identityRoles.filter(role => role.isActive)
}

// 获取默认身份角色
export function getDefaultIdentityRole() {
  return userMetadata.identityRoles.find(role => role.isDefault)
}

// 根据类型获取身份角色
export function getIdentityRolesByType(type) {
  return userMetadata.identityRoles.filter(role => role.type === type)
}

// 获取个人基本信息
export function getPersonalInfo() {
  return userMetadata.personalInfo
}

// 获取身份切换历史
export function getIdentityHistory() {
  return userMetadata.identityHistory
}

// 获取身份偏好设置
export function getIdentityPreferences() {
  return userMetadata.identityPreferences
}

// 获取扩展数据
export function getExtensions() {
  return userMetadata.extensions
} 