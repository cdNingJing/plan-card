// 用户信息本地存储管理
export class UserInfoStorage {
  static STORAGE_KEY = 'plan_card_user_info'

  // 获取所有用户信息
  static getUserInfo() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return {}
    }
  }

  // 保存特定场景的用户信息
  static saveScenarioInfo(scenario, data) {
    try {
      const userInfo = this.getUserInfo()
      userInfo[scenario] = {
        ...data,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userInfo))
      return true
    } catch (error) {
      console.error('保存用户信息失败:', error)
      return false
    }
  }

  // 获取特定场景的用户信息
  static getScenarioInfo(scenario) {
    try {
      const userInfo = this.getUserInfo()
      return userInfo[scenario] || {}
    } catch (error) {
      console.error('获取场景信息失败:', error)
      return {}
    }
  }

  // 清除特定场景的用户信息
  static clearScenarioInfo(scenario) {
    try {
      const userInfo = this.getUserInfo()
      delete userInfo[scenario]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userInfo))
      return true
    } catch (error) {
      console.error('清除场景信息失败:', error)
      return false
    }
  }

  // 清除所有用户信息
  static clearAllInfo() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error('清除所有用户信息失败:', error)
      return false
    }
  }

  // 获取旅行场景的常用信息
  static getTravelDefaults() {
    const travelInfo = this.getScenarioInfo('travel')
    return {
      departure: travelInfo.departure || '',
      destination: travelInfo.destination || '',
      startDate: travelInfo.startDate || '',
      endDate: travelInfo.endDate || '',
      travelers: travelInfo.travelers || '',
      budget: travelInfo.budget || ''
    }
  }

  // 保存旅行场景信息
  static saveTravelInfo(data) {
    return this.saveScenarioInfo('travel', data)
  }
} 