// 酒店相关API接口
import axios from 'axios'

// API基础配置
const API_BASE_URL = '/api/hotels'
const API_TIMEOUT = 30000 // 30秒超时

// 创建axios实例
const hotelApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器 - 简化headers，因为代理会处理认证
hotelApi.interceptors.request.use(
  (config) => {
    // 只保留基本headers，认证信息由代理处理
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'

    console.log('[HotelAPI] 请求配置:', {
      url: config.url,
      method: config.method,
      params: config.params
    })

    return config
  },
  (error) => {
    console.error('[HotelAPI] 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应
hotelApi.interceptors.response.use(
  (response) => {
    console.log('[HotelAPI] 响应成功:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response.data
  },
  (error) => {
    console.error('[HotelAPI] 响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

/**
 * 搜索酒店
 * @param {Object} params 搜索参数
 * @param {string} params.location 目的地
 * @param {string} params.arrival_date 入住日期 (旅行开始时间) (YYYY-MM-DD)
 * @param {string} params.departure_date 退房日期 (离开时间) (YYYY-MM-DD)
 * @param {number} params.adults 成人数量
 * @param {number} params.children 儿童数量
 * @param {number} params.rooms 房间数量
 * @returns {Promise<Object>} 酒店搜索结果
 */
export const searchHotels = async (params) => {
  try {
    const {
      location,
      departure_date,
      arrival_date,
      adults = 1,
      children = 0,
      rooms = 1
    } = params

    const searchParams = {
      location,
      departure_date,
      arrival_date,
      adults,
      children,
      rooms
    }

    const response = await hotelApi.get('/search', {
      params: searchParams
    })

    // 适配API返回格式
    if (response && response.data) {
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      }
    }

    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[HotelAPI] 搜索酒店失败:', error)
    return {
      success: false,
      error: error.message || '搜索酒店失败',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 格式化API返回的酒店数据
 * @param {Array} apiHotels API返回的酒店数据
 * @returns {Array} 格式化后的酒店数据
 */
export const formatHotelData = (apiHotels) => {
  if (!Array.isArray(apiHotels)) {
    return []
  }

  return apiHotels.map((hotel, index) => {
    // 处理价格信息
    let price = 0
    let priceCurrency = 'CNY'
    
    if (hotel.price) {
      price = typeof hotel.price === 'number' ? hotel.price : parseFloat(hotel.price) || 0
    }
    
    return {
      id: hotel.id || `hotel_${index}`,
      name: hotel.name || '未知酒店',
      rating: hotel.rating || 0,
      starRating: Math.floor((hotel.rating || 0) / 2), // 将10分制转换为5星制
      price: `¥${price.toLocaleString()}`,
      priceValue: price,
      oldPrice: hotel.oldPrice,
      image: hotel.image || (hotel.images && hotel.images[0]) || '',
      images: hotel.images || [],
      latitude: hotel.latitude || 0,
      longitude: hotel.longitude || 0,
      url: hotel.url || '',
      reviews: hotel.reviews || '',
      // 保留原始数据的所有字段
      ...hotel
    }
  })
}

/**
 * 获取酒店详情
 * @param {string} hotelId 酒店ID
 * @returns {Promise<Object>} 酒店详情
 */
export const getHotelDetails = async (hotelId) => {
  try {
    const response = await hotelApi.get(`/details/${hotelId}`)
    
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[HotelAPI] 获取酒店详情失败:', error)
    return {
      success: false,
      error: error.message || '获取酒店详情失败',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 搜索城市
 * @param {string} query 搜索关键词
 * @returns {Promise<Object>} 城市搜索结果
 */
export const searchCities = async (query) => {
  try {
    const response = await hotelApi.get('/cities/search', {
      params: { q: query }
    })
    
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[HotelAPI] 搜索城市失败:', error)
    return {
      success: false,
      error: error.message || '搜索城市失败',
      timestamp: new Date().toISOString()
    }
  }
} 