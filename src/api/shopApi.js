// 购买相关API接口
import axios from 'axios'

// API基础配置
const API_BASE_URL = '/api/shops'
const API_TIMEOUT = 30000 // 30秒超时

// 创建axios实例
const shopApi = axios.create({
  baseURL: '/api/amazon',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

const FIXED_TOKEN = 'eaa012695ec1565bed0b27d799d8bb8456c6ce75'

// 请求拦截器 - 支持动态token
shopApi.interceptors.request.use(
  (config) => {
    if (config.token) {
      config.headers['Authorization'] = `token ${config.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
shopApi.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

/**
 * 搜索商品（支持所有官方参数，querys优先）
 * @param {Object} params
 * @param {string[]} [params.querys] 多关键词数组，优先级高
 * @param {string} [params.query] 单关键词
 * @param {string} [params.by] 渠道
 * @param {string} [params.sort_by] 排序方式
 * @param {boolean} [params.exclude_sponsored] 过滤广告
 * @param {number} [params.detail] 返回前n个商品详情
 * @param {number} [params.limit] 最大数量
 * @param {string|number} [params.page] 页码
 * @param {string} [params.q] 反向图片搜索关键词
 * @param {string} [params.token] 授权token
 * @param {any} [params.*] 其他参数
 * @returns {Promise<Object>} 搜索结果
 */
export const searchShopItems = async (params) => {
  const searchParams = new URLSearchParams()
  searchParams.append('keyword', params.keyword)
  searchParams.append('domain', params.domain || 'amazon.co.jp')
  searchParams.append('exclude_sponsored', 'true')
  searchParams.append('sort_by', params.sort_by || 'most_recent')
  searchParams.append('by', params.by || 'rainforest')
  searchParams.append('page', params.page || '1')
  const headers = { Authorization: `token ${FIXED_TOKEN}` }
  const response = await shopApi.get(`/search?${searchParams.toString()}`, { headers })
  return response.data
}

/**
 * 格式化API返回的商品数据
 * @param {Object} apiData API返回的data对象
 * @returns {Array} 格式化后的商品列表
 */
export const formatShopData = (apiData) => {
  if (!apiData || !Array.isArray(apiData.items)) return []
  return apiData.items.map(item => ({
    id: item.id,
    title: item.title,
    image: item.image?.x100 || '',
    link: item.link,
    price: item.productPrice,
    oldPrice: item.oldPrice,
    currency: item.currency,
    currencySymbol: item.currencySymbol,
    rating: item.rating,
    reviews: item.reviews,
    manufacturer: item.manufacturer,
    prime: item.prime
  }))
} 