 // 机票相关API接口
import axios from 'axios'

// API基础配置
const API_BASE_URL = '/api/flights'
const API_TIMEOUT = 30000 // 30秒超时

// 创建axios实例
const flightApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器 - 简化headers，因为代理会处理认证
flightApi.interceptors.request.use(
  (config) => {
    // 只保留基本headers，认证信息由代理处理
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'

    console.log('[FlightAPI] 请求配置:', {
      url: config.url,
      method: config.method,
      params: config.params
    })

    return config
  },
  (error) => {
    console.error('[FlightAPI] 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应
flightApi.interceptors.response.use(
  (response) => {
    console.log('[FlightAPI] 响应成功:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response.data
  },
  (error) => {
    console.error('[FlightAPI] 响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

/**
 * 搜索航班
 * @param {Object} params 搜索参数
 * @param {string} params.from 出发地机场代码
 * @param {string} params.to 目的地机场代码
 * @param {string} params.date 出发日期 (YYYY-MM-DD)
 * @param {number} params.adults 成人数量
 * @param {string} params.cabinClass 舱位等级 (economy, business, first)
 * @param {string} params.trip 行程类型 (ONE_WAY, ROUND_TRIP)
 * @param {boolean} params.is_code 是否使用机场代码
 * @param {string} params.returnDate 返程日期 (往返时使用)
 * @param {number} params.children 儿童数量
 * @param {number} params.infants 婴儿数量
 * @returns {Promise<Object>} 航班搜索结果
 */
export const searchFlights = async (params) => {
  try {
    const {
      from,
      to,
      date,
      adults = 1,
      cabinClass = 'economy',
      trip = 'ONE_WAY',
      is_code = true,
      returnDate,
      children = 0,
      infants = 0
    } = params

    const searchParams = {
      from,
      to,
      adults,
      cabinClass,
      trip,
      date,
      is_code,
      children,
      infants
    }

    // 如果是往返行程，添加返程日期
    if (trip === 'ROUND_TRIP' && returnDate) {
      searchParams.returnDate = returnDate
    }

    const response = await flightApi.get('/flights/search', {
      params: searchParams
    })

    // 适配API返回格式
    if (response && response.data && response.data.items) {
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
    console.error('[FlightAPI] 搜索航班失败:', error)
    return {
      success: false,
      error: error.message || '搜索航班失败',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 格式化API返回的航班数据
 * @param {Array} apiFlights API返回的航班数据
 * @returns {Array} 格式化后的航班数据
 */
export const formatFlightData = (apiFlights) => {
  if (!Array.isArray(apiFlights)) {
    return []
  }

  return apiFlights.map((flight, index) => {
    const airline = flight.airlines && flight.airlines[0]
    
    // 处理价格信息
    let price = 0
    let priceCurrency = 'CNY'
    
    if (flight.price) {
      price = typeof flight.price === 'number' ? flight.price : parseFloat(flight.price) || 0
    } else if (flight.fareBreakdown && flight.fareBreakdown[0]) {
      const fare = flight.fareBreakdown[0].PassengerFare
      if (fare && fare.TotalFare) {
        price = fare.TotalFare.Amount || 0
        priceCurrency = fare.TotalFare.CurrencyCode || 'CNY'
      }
    }
    
    return {
      id: flight.id || `flight_${index}`,
      airline: airline?.name || '未知航空公司',
      airlineCode: airline?.code || '',
      airlineIcon: airline?.icon || '',
      flightNumber: airline?.flightNumber || '',
      departureTime: flight.departureTime?.time || '',
      arrivalTime: flight.arrivalTime?.time || '',
      departureDate: flight.departureTime?.date || '',
      arrivalDate: flight.arrivalTime?.date || '',
      departureAirport: flight.from || '',
      departureAirportName: flight.fromCity || '',
      arrivalAirport: flight.to || '',
      arrivalAirportName: flight.toCity || '',
      duration: formatDuration(flight.duration),
      aircraft: airline?.flight || '',
      stops: 0, // API中没有中转信息，默认为直飞
      price: price,
      priceValue: price, // 保持兼容性
      priceCurrency: priceCurrency,
      cabinClass: airline?.cabinClassText || 'Economy',
      recommended: false, // 初始不推荐，由智能分析决定
      timeCategory: getTimeCategory(flight.departureTime?.time || ''),
      extensions: flight.extensions || [],
      fareBreakdown: flight.fareBreakdown || [],
      isRefundable: flight.isRefundable || false,
      cancellable: flight.cancellable || false
    }
  })
}

/**
 * 格式化时长（秒转时分）
 * @param {number} seconds 秒数
 * @returns {string} 格式化后的时长
 */
const formatDuration = (seconds) => {
  if (!seconds) return '0h0m'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  return `${hours}h${minutes}m`
}

/**
 * 获取时间分类
 * @param {string} time 时间字符串 (HH:MM)
 * @returns {string} 时间分类
 */
const getTimeCategory = (time) => {
  if (!time) return 'any'
  
  const hour = parseInt(time.split(':')[0])
  
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}



/**
 * 获取城市名称
 * @param {string} airportCode 机场代码
 * @returns {string} 城市名称
 */
const getCityName = (airportCode) => {
  const cityMap = {
    'CTU': '成都',
    'PEK': '北京',
    'SHA': '上海',
    'CAN': '广州',
    'SZX': '深圳',
    'HGH': '杭州',
    'NKG': '南京',
    'XIY': '西安',
    'CKG': '重庆',
    'WUH': '武汉',
    'NRT': '东京',
    'KIX': '大阪',
    'ICN': '首尔',
    'SIN': '新加坡',
    'BKK': '曼谷',
    'HKG': '香港',
    'TPE': '台北'
  }
  
  return cityMap[airportCode] || airportCode
}