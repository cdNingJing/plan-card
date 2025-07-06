<template>
  <div class="shop-card" :class="{ scrollable: fullscreen }">
    <!-- <div>{{ fullscreen }}</div> -->
    <div class="shop-card-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>正在加载商品数据...</span>
      </div>
      <div v-else-if="allProducts.length === 0" class="empty-state">
        <span>暂无商品</span>
      </div>
      <div v-else class="product-list">
        <div
          v-for="product in allProducts"
          :key="product.id"
          class="product-item"
          :class="{ selected: selectedProductIds.includes(product.id) }"
          @click="toggleSelectProduct(product)"
        >
          <img :src="product.image" :alt="product.title" class="product-image" />
          <div class="product-info">
            <div class="product-title" :title="product.title">{{ product.title }}</div>
            <div class="product-price-row">
              <span class="currency">{{ product.currencySymbol || '¥' }}</span>
              <span class="price">{{ product.price }}</span>
              <span v-if="product.oldPrice && product.oldPrice !== product.price" class="old-price">
                {{ product.currencySymbol || '¥' }}{{ product.oldPrice }}
              </span>
              <span v-if="product.rating" class="product-rating">
                <span class="star">★</span>{{ product.rating }}
              </span>
              <span v-if="product.reviews" class="product-reviews">({{ product.reviews }})</span>
              <span v-if="product.prime" class="prime-badge">Prime</span>
            </div>
          </div>
          <button class="detail-btn-fixed" @click.stop="openDetail(product.link)">详情</button>
          <div v-if="selectedProductIds.includes(product.id)" class="selected-check">✔</div>
        </div>
      </div>
    </div>
    
    <div class="shop-tips" v-if="!fullscreen && recentOrders.length === 0">
      <div class="tip-item">
        <Info :size="16" />
        <span>建议对比多个商品的价格和评价，选择最适合的</span>
      </div>
    </div>

    <!-- 购物车成功状态显示 -->
    <div v-if="!fullscreen && recentOrders.length > 0" class="shop-cart-success-section">
      <div class="shop-success-header">
        <div class="shop-success-icon">
          <CheckCircle :size="20" />
        </div>
        <div class="shop-success-title">
          <h4>购物车</h4>
          <p>已添加商品到购物车</p>
        </div>
        <button class="shop-re-search-btn" @click="startNewSearch">
          重新搜索
        </button>
      </div>
      
      <div class="shop-success-orders">
        <div 
          v-for="order in recentOrders" 
          :key="order.id"
          class="shop-success-order-card"
        >
          <div class="shop-order-card-header">
            <div class="shop-order-id">订单号: {{ order.id }}</div>
            <div class="shop-order-status">已添加</div>
          </div>
          
          <div class="shop-order-card-content">
            <div class="shop-order-info">
              <div class="shop-order-product">
                <img :src="order.product.image" :alt="order.product.title" class="shop-order-image" />
                <div class="shop-order-details">
                  <h5>{{ order.product.title }}</h5>
                  <div class="shop-order-rating" v-if="order.product.rating > 0">
                    <div class="stars">
                      <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.floor(order.product.rating) }">
                        ★
                      </span>
                    </div>
                    <span class="rating-score">{{ order.product.rating.toFixed(1) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="shop-order-quantity">
                <div class="shop-order-quantity-item">
                  <span class="shop-order-label">数量</span>
                  <span class="shop-order-value">{{ order.quantity }}件</span>
                </div>
              </div>
            </div>
            
            <div class="shop-order-summary">
              <div class="shop-summary-item">
                <span class="shop-summary-label">单价</span>
                <span class="shop-summary-value shop-total-price">¥{{ formatPrice(order.product.price) }}</span>
              </div>
              <div class="shop-summary-item">
                <span class="shop-summary-label">添加时间</span>
                <span class="shop-summary-value">{{ formatOrderDate(order.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品详情弹窗 -->
    <div v-if="showDetailModal" class="shop-detail-modal-overlay" @click="closeDetailModal">
      <div class="shop-detail-modal" @click.stop>
        <div class="shop-modal-header">
          <h3>商品详情</h3>
          <button class="shop-close-btn" @click="closeDetailModal">×</button>
        </div>
        
        <div class="shop-modal-content">
          <div class="shop-detail-info">
            <img :src="selectedProduct.image" :alt="selectedProduct.title" class="shop-detail-image" />
            <div class="shop-detail-text">
              <h4>{{ selectedProduct.title }}</h4>
              <div class="shop-detail-rating" v-if="selectedProduct.rating > 0">
                <div class="stars">
                  <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.floor(selectedProduct.rating) }">
                    ★
                  </span>
                </div>
                <span class="rating-score">{{ selectedProduct.rating.toFixed(1) }}</span>
                <span class="reviews-count" v-if="selectedProduct.reviews > 0">({{ selectedProduct.reviews }}条评价)</span>
              </div>
              <div class="shop-detail-price">
                <span class="current-price">¥{{ formatPrice(selectedProduct.price) }}</span>
                <span class="old-price" v-if="selectedProduct.oldPrice">¥{{ formatPrice(selectedProduct.oldPrice) }}</span>
              </div>
              <div class="shop-detail-actions">
                <button class="shop-detail-btn primary" @click="addToCart(selectedProduct)">
                  <ShoppingCart :size="16" />
                  加入购物车
                </button>
                <button class="shop-detail-btn secondary" @click="buyNow(selectedProduct)">
                  <CreditCard :size="16" />
                  立即购买
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, defineProps } from 'vue'
import { Package, Eye, ShoppingCart, Info, CheckCircle, CreditCard } from 'lucide-vue-next'
import { searchShopItems, formatShopData } from '@/api/shopApi.js'
import { useUserInfoStore } from '@/stores/userInfoStore.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'fullscreen'])

const filters = reactive({
  priceRange: 'any',
  rating: 'any'
})

const userInfoStore = useUserInfoStore()

const loading = ref(false)
const error = ref('')

const allProducts = ref([])

// 购物相关状态
const selectedProduct = ref(null)
const showDetailModal = ref(false)
const recentOrders = ref([])

// 组件挂载状态
const isComponentMounted = ref(false)

// 动态过滤选项
const filterOptions = reactive({
  priceRange: [
    { value: 'any', label: '不限' }
  ],
  rating: [
    { value: 'any', label: '不限' }
  ]
})

const searchQuery = computed(() => userInfoStore.getScenarioInfo('gift').searchQuery || '')

const selectedProductIds = ref(JSON.parse(localStorage.getItem('selectedShopProductIds') || '[]'))

const fetchProducts = async () => {
  if (!isComponentMounted.value) return
  loading.value = true
  error.value = ''
  try {
    const userInfo = userInfoStore.getScenarioInfo('gift')
    const searchQuery = userInfo.searchQuery || ''
    const params = parseSearchQuery(searchQuery)
    const result = await searchShopItems(params)
    if (result && Array.isArray(result.items)) {
      allProducts.value = formatShopData(result)
    } else {
      allProducts.value = []
      error.value = '暂无商品数据'
    }
  } catch (e) {
    error.value = '商品数据加载失败'
    allProducts.value = []
  } finally {
    loading.value = false
  }
}

// 解析搜索查询文本，生成keyword等新API参数
const parseSearchQuery = (text) => {
  let keyword = ''
  if (text && text.trim() !== '') {
    keyword = text.trim()
  }
  return {
    keyword,
    domain: 'amazon.co.jp',
    by: 'rainforest',
    sort_by: 'most_recent',
    exclude_sponsored: true,
    page: 1
  }
}

onMounted(() => {
  isComponentMounted.value = true
  userInfoStore.loadFromStorage()
  loadRecentOrders()
  
  // 如果已有购物记录，不需要初始化商品数据
  if (recentOrders.value.length > 0) {
    console.log('[ShopCard] 检测到已有购物记录，跳过商品数据初始化')
    return
  }
  
  fetchProducts()
})

onUnmounted(() => {
  isComponentMounted.value = false
  console.log('[ShopCard] 组件已卸载，清理完成')
})

// 监听用户搜索信息变化自动刷新商品
watch(() => userInfoStore.getScenarioInfo('gift'), (newUserInfo, oldUserInfo) => {
  try {
    // 检查组件是否仍然挂载
    if (!isComponentMounted.value) {
      console.log('[ShopCard] 组件已卸载，跳过用户信息监听')
      return
    }
    
    // 如果已有购物记录，不自动刷新商品数据
    if (recentOrders.value.length > 0) {
      console.log('[ShopCard] 检测到已有购物记录，跳过自动刷新商品数据')
      return
    }
    
    // 检查基础信息是否有变化
    const oldRecipient = oldUserInfo?.recipient
    const newRecipient = newUserInfo?.recipient
    const oldInterests = oldUserInfo?.interests
    const newInterests = newUserInfo?.interests
    const oldBudget = oldUserInfo?.budget
    const newBudget = newUserInfo?.budget
    const oldSearchQuery = oldUserInfo?.searchQuery
    const newSearchQuery = newUserInfo?.searchQuery
    
    // 如果基础信息发生变化，自动刷新商品数据
    if (newRecipient !== oldRecipient || 
        newInterests !== oldInterests || 
        newBudget !== oldBudget || 
        newSearchQuery !== oldSearchQuery) {
      console.log('[ShopCard] 检测到基础信息变化，刷新商品数据:', {
        recipient: `${oldRecipient} -> ${newRecipient}`,
        interests: `${oldInterests} -> ${newInterests}`,
        budget: `${oldBudget} -> ${newBudget}`,
        searchQuery: `${oldSearchQuery} -> ${newSearchQuery}`
      })
      
      // 特别关注searchQuery的变化
      if (newSearchQuery !== oldSearchQuery) {
        console.log('[ShopCard] 检测到searchQuery变化，将使用新的搜索查询:', newSearchQuery)
      }
      
      fetchProducts()
    }
  } catch (error) {
    console.error('[ShopCard] 监听用户信息变化时出错:', error)
  }
}, { deep: true, immediate: false })

const filteredProducts = computed(() => {
  return allProducts.value.filter(product => {
    // 价格筛选
    if (filters.priceRange !== 'any') {
      const price = product.price || 0
      const prices = allProducts.value.map(p => p.price || 0).filter(p => p > 0)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      
      if (filters.priceRange === 'low' && price >= avgPrice * 0.8) {
        return false
      }
      if (filters.priceRange === 'medium' && (price < avgPrice * 0.8 || price > avgPrice * 1.2)) {
        return false
      }
      if (filters.priceRange === 'high' && price <= avgPrice * 1.2) {
        return false
      }
    }
    
    // 评分筛选
    if (filters.rating !== 'any' && product.rating < parseFloat(filters.rating)) {
      return false
    }
    
    return true
  })
})

const handleFilterChange = () => {
  emit('update', {
    filters: { ...filters },
    filteredCount: filteredProducts.value.length
  })
}

const viewDetails = (product) => {
  console.log('查看详情:', product)
  selectedProduct.value = product
  showDetailModal.value = true
  emit('update', {
    selectedProduct: product,
    action: 'view'
  })
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedProduct.value = null
}

const addToCart = (product) => {
  console.log('加入购物车:', product)
  
  const orderData = {
    id: `order_${Date.now()}`,
    product: product,
    quantity: 1,
    createdAt: new Date().toISOString()
  }
  
  // 保存购物记录到本地存储
  saveShopOrder(orderData)
  
  // 更新最近的购物记录显示
  loadRecentOrders()
  
  // 关闭弹窗
  if (showDetailModal.value) {
    closeDetailModal()
  }
  
  // 显示成功提示
  alert('已添加到购物车！')
  
  // 通知父组件
  emit('update', {
    action: 'addToCart',
    orderData: orderData
  })
}

const buyNow = (product) => {
  console.log('立即购买:', product)
  // 这里可以实现立即购买逻辑
  alert('立即购买功能开发中...')
}

// 保存购物记录到本地存储
const saveShopOrder = (orderData) => {
  try {
    const orders = JSON.parse(localStorage.getItem('shopOrders') || '[]')
    orders.unshift(orderData)
    // 只保留最近10条记录
    if (orders.length > 10) {
      orders.splice(10)
    }
    localStorage.setItem('shopOrders', JSON.stringify(orders))
    console.log('[ShopCard] 购物记录已保存:', orderData)
    return orderData
  } catch (error) {
    console.error('[ShopCard] 保存购物记录失败:', error)
    return null
  }
}

// 加载最近的购物记录
const loadRecentOrders = () => {
  try {
    const orders = JSON.parse(localStorage.getItem('shopOrders') || '[]')
    recentOrders.value = orders.slice(0, 3) // 只显示最近3条
    console.log('[ShopCard] 加载最近的购物记录:', recentOrders.value)
  } catch (error) {
    console.error('[ShopCard] 加载购物记录失败:', error)
    recentOrders.value = []
  }
}

// 开始新的搜索
const startNewSearch = async () => {
  console.log('[ShopCard] 开始新的商品搜索')
  
  // 清空购物记录显示
  recentOrders.value = []
  
  // 重新获取商品数据
  await fetchProducts()
  
  // 通知父组件
  emit('update', {
    action: 'startNewSearch',
    message: '开始新的商品搜索'
  })
}

// 监听props变化
watch(() => props.data, (newData) => {
  if (newData.filters) {
    Object.assign(filters, newData.filters)
  }
}, { deep: true })

const handleImageError = () => {
  // 处理图片加载失败后的逻辑
  console.error('图片加载失败')
}

// 动态生成过滤选项
const generateFilterOptions = (products) => {
  if (!products || products.length === 0) return
  
  // 生成价格范围选项
  const prices = products.map(product => product.price || 0).filter(p => p > 0)
  if (prices.length > 0) {
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    
    const priceRanges = []
    
    // 低价位 (低于平均价格的80%)
    if (minPrice < avgPrice * 0.8) {
      const lowMax = Math.floor(avgPrice * 0.8)
      priceRanges.push({
        value: 'low',
        label: `经济型 (¥${minPrice.toLocaleString()}-${lowMax.toLocaleString()})`
      })
    }
    
    // 中价位 (平均价格的80%-120%)
    const midMin = Math.floor(avgPrice * 0.8)
    const midMax = Math.ceil(avgPrice * 1.2)
    if (midMin < midMax) {
      priceRanges.push({
        value: 'medium',
        label: `中档型 (¥${midMin.toLocaleString()}-${midMax.toLocaleString()})`
      })
    }
    
    // 高价位 (高于平均价格的120%)
    if (maxPrice > avgPrice * 1.2) {
      const highMin = Math.floor(avgPrice * 1.2)
      priceRanges.push({
        value: 'high',
        label: `高端型 (¥${highMin.toLocaleString()}+)`
      })
    }
    
    filterOptions.priceRange = [
      { value: 'any', label: '不限' },
      ...priceRanges
    ]
  }
  
  // 生成评分选项
  const ratings = [...new Set(products.map(product => product.rating).filter(r => r > 0))]
  if (ratings.length > 0) {
    const sortedRatings = ratings.sort((a, b) => b - a)
    const ratingOptions = []
    
    // 根据实际评分生成选项
    if (sortedRatings.some(r => r >= 4.5)) {
      ratingOptions.push({ value: '4.5', label: '4.5分以上' })
    }
    if (sortedRatings.some(r => r >= 4.0)) {
      ratingOptions.push({ value: '4.0', label: '4.0分以上' })
    }
    if (sortedRatings.some(r => r >= 3.5)) {
      ratingOptions.push({ value: '3.5', label: '3.5分以上' })
    }
    if (sortedRatings.some(r => r >= 3.0)) {
      ratingOptions.push({ value: '3.0', label: '3.0分以上' })
    }
    
    filterOptions.rating = [
      { value: 'any', label: '不限' },
      ...ratingOptions
    ]
  }
  
  console.log('[ShopCard] 生成的过滤选项:', filterOptions)
}

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0'
  return typeof price === 'number' ? price.toLocaleString() : price.toString()
}

// 格式化购物时间
const formatOrderDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 监听 searchQuery 变化，有值时自动请求商品接口
watch(searchQuery, (newQuery) => {
  if (newQuery && newQuery.trim() !== '') {
    fetchProducts()
  } else {
    allProducts.value = []
  }
}, { immediate: true })

function openDetail(link) {
  window.open(link, '_blank')
}

function toggleSelectProduct(product) {
  const idx = selectedProductIds.value.indexOf(product.id)
  if (idx === -1) {
    selectedProductIds.value.push(product.id)
  } else {
    selectedProductIds.value.splice(idx, 1)
  }
  // 保存所有选中商品完整数据
  const selectedProducts = allProducts.value.filter(p => selectedProductIds.value.includes(p.id))
  localStorage.setItem('selectedShopProductIds', JSON.stringify(selectedProductIds.value))
  localStorage.setItem('selectedShopProducts', JSON.stringify(selectedProducts))
}

// 自动监听 props.data 变化，刷新商品
watch(
  () => props.data,
  (newData, oldData) => {
    if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
      fetchShopProducts() // 用新内容请求接口
    }
  },
  { deep: true }
)
</script>

<style scoped>
.shop-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(49,130,206,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.shop-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 0 18px;
  font-size: 1.1rem;
  font-weight: bold;
}
.shop-card-title {
  color: #222;
}
.fullscreen-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #3182ce;
}
.shop-card-content {
  padding: 0 12px 12px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.shop-filters {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #E5E5E5;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #FFFFFF;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: #333333;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shop-list.scrollable {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.shop-list.scrollable::-webkit-scrollbar {
  width: 4px;
}

.shop-list.scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.shop-list.scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.shop-list.scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.product-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(49,130,206,0.18);
  padding: 0 0 16px 0;
  text-decoration: none;
  color: #222;
  border: 2px solid transparent;
  transition: border 0.2s, background 0.2s, box-shadow 0.2s;
  position: relative;
  cursor: pointer;
  min-height: 270px;
}

.product-item.selected {
  border: 2px solid #3182ce;
  background: #f0f6ff;
}

.selected-check {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3182ce;
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: bold;
  z-index: 2;
}

.product-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 8px 12px 0 12px;
}

.product-title {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  max-height: 2.6em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #e53e3e;
}

.old-price {
  font-size: 13px;
  color: #aaa;
  text-decoration: line-through;
  margin-left: 4px;
}

.product-meta {
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 6px;
  align-items: center;
}

.prime-badge {
  background: #ffd700;
  color: #222;
  border-radius: 4px;
  padding: 0 4px;
  font-size: 11px;
  margin-left: 2px;
}

.shop-tips {
  background: #F8F9FA;
  border-radius: 6px;
  padding: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #666666;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #666666;
  font-size: 0.95rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #E5E5E5;
  border-top: 2px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
  font-size: 0.95rem;
}

.shop-cart-success-section {
  background: linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%);
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.shop-cart-success-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A, #81C784);
}

.shop-success-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.shop-success-icon {
  width: 40px;
  height: 40px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.shop-success-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2E7D32;
}

.shop-success-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #388E3C;
}

.shop-re-search-btn {
  margin-left: auto;
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid #4CAF50;
  border-radius: 6px;
  color: #4CAF50;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.shop-re-search-btn:hover {
  background: #4CAF50;
  color: #FFFFFF;
}

.shop-success-orders {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shop-success-order-card {
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E8F5E8;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}

.shop-order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #F1F8E9;
  border-bottom: 1px solid #E8F5E8;
}

.shop-order-id {
  font-size: 0.8rem;
  color: #666666;
  font-family: monospace;
}

.shop-order-status {
  background: #4CAF50;
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.shop-order-card-content {
  padding: 16px;
}

.shop-order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.shop-order-product {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.shop-order-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.shop-order-details h5 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.shop-order-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shop-order-quantity {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.shop-order-quantity-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.shop-order-label {
  font-size: 0.75rem;
  color: #999999;
}

.shop-order-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
}

.shop-order-summary {
  border-top: 1px solid #E8F5E8;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shop-summary-label {
  font-size: 0.75rem;
  color: #999999;
}

.shop-summary-value {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 500;
}

.shop-total-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2E7D32;
}

.shop-detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.shop-detail-modal {
  background-color: #FFFFFF;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.shop-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.shop-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.shop-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shop-detail-info {
  display: flex;
  gap: 16px;
}

.shop-detail-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.shop-detail-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.shop-detail-text h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.shop-detail-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shop-detail-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
}

.shop-detail-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.shop-detail-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.shop-detail-btn.primary {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

.shop-detail-btn.primary:hover {
  background: #222222;
}

.shop-detail-btn.secondary {
  background: #FFFFFF;
  color: #666666;
}

.shop-detail-btn.secondary:hover {
  background: #F8F9FA;
  color: #333333;
}

.detail-btn-fixed {
  position: static;
  margin: 12px auto 0 auto;
  display: block;
  width: 80%;
  max-width: 160px;
  background: #3182ce;
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 6px 18px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(49,130,206,0.08);
  cursor: pointer;
  z-index: 3;
  transition: background 0.2s;
}

.detail-btn-fixed:hover {
  background: #2563eb;
}

.product-rating {
  color: #f6b100;
  font-size: 13px;
  margin-left: 6px;
  display: flex;
  align-items: center;
}

.product-rating .star {
  font-size: 13px;
  margin-right: 1px;
}

.product-reviews {
  color: #888;
  font-size: 12px;
}

.shop-card.scrollable {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}
.shop-card.scrollable::-webkit-scrollbar {
  width: 4px;
}
.shop-card.scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}
.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
</style>