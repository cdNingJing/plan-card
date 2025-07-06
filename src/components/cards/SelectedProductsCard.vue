<template>
  <div class="selected-products-card" :class="{ scrollable: fullscreen }">
    <div class="selected-products-header">
      <div class="header-title">
        <ShoppingCart :size="20" />
        <h3>已选商品</h3>
        <span class="product-count" v-if="selectedProducts.length > 0">({{ selectedProducts.length }})</span>
      </div>
      <button 
        v-if="selectedProducts.length > 0" 
        class="clear-all-btn" 
        @click="clearAllSelected"
      >
        清空
      </button>
    </div>

    <div class="selected-products-content">
      <div v-if="selectedProducts.length === 0" class="empty-state">
        <Package :size="48" />
        <span>暂无已选商品</span>
        <p>请在其他卡片中选择商品添加到购物车</p>
      </div>
      
      <div v-else class="selected-products-list">
        <div 
          v-for="product in selectedProducts" 
          :key="product.id"
          class="selected-product-item"
        >
          <div class="product-image-container">
            <img :src="product.image" :alt="product.title" class="product-image" />
            <button class="remove-btn" @click="removeProduct(product.id)">×</button>
          </div>
          
          <div class="product-details">
            <div class="product-title" :title="product.title">{{ product.title }}</div>
            <div class="product-price">
              <span class="currency">{{ product.currencySymbol || '¥' }}</span>
              <span class="price">{{ formatPrice(product.price) }}</span>
              <span v-if="product.oldPrice && product.oldPrice !== product.price" class="old-price">
                {{ product.currencySymbol || '¥' }}{{ formatPrice(product.oldPrice) }}
              </span>
            </div>
            
            <div class="product-meta">
              <span v-if="product.rating" class="product-rating">
                <span class="star">★</span>{{ product.rating }}
              </span>
              <span v-if="product.reviews" class="product-reviews">({{ product.reviews }})</span>
              <span v-if="product.prime" class="prime-badge">Prime</span>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="remove-single-btn" @click="removeProduct(product.id)">
              <Eye :size="14" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近订单信息 -->
    <div v-if="recentOrder" class="recent-order-section">
      <div class="order-header">
        <div class="order-icon">
          <CheckCircle :size="20" />
        </div>
        <div class="order-title">
          <h4>购买成功</h4>
          <p>订单已生成，感谢您的购买</p>
        </div>
        <button class="new-order-btn" @click="startNewOrder">
          重新购买
        </button>
      </div>
      
      <div class="order-details">
        <div class="order-info">
          <div class="order-item">
            <span class="order-label">订单号:</span>
            <span class="order-value">{{ recentOrder.orderId }}</span>
          </div>
          <div class="order-item">
            <span class="order-label">交易号:</span>
            <span class="order-value">{{ recentOrder.transactionId }}</span>
          </div>
          <div class="order-item">
            <span class="order-label">购买时间:</span>
            <span class="order-value">{{ formatOrderTime(recentOrder.orderTime) }}</span>
          </div>
          <div class="order-item">
            <span class="order-label">商品数量:</span>
            <span class="order-value">{{ recentOrder.products.length }}件</span>
          </div>
          <div class="order-item">
            <span class="order-label">总金额:</span>
            <span class="order-value total-amount">¥{{ formatPrice(recentOrder.totalAmount) }}</span>
          </div>
          <div class="order-item" v-if="recentOrder.totalSavings > 0">
            <span class="order-label">节省金额:</span>
            <span class="order-value savings-amount">¥{{ formatPrice(recentOrder.totalSavings) }}</span>
          </div>
        </div>
        
        <div class="order-products">
          <h5>购买商品</h5>
          <div class="order-product-list">
            <div 
              v-for="product in recentOrder.products" 
              :key="product.id"
              class="order-product-item"
            >
              <img :src="product.image" :alt="product.title" class="order-product-image" />
              <div class="order-product-info">
                <div class="order-product-title">{{ product.title }}</div>
                <div class="order-product-price">
                  <span class="currency">{{ product.currencySymbol || '¥' }}</span>
                  <span class="price">{{ formatPrice(product.price) }}</span>
                  <span v-if="product.oldPrice && product.oldPrice !== product.price" class="old-price">
                    {{ product.currencySymbol || '¥' }}{{ formatPrice(product.oldPrice) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 购买总结 -->
    <div v-if="selectedProducts.length > 0" class="purchase-summary">
      <div class="summary-info">
        <div class="summary-item">
          <span class="summary-label">商品数量:</span>
          <span class="summary-value">{{ selectedProducts.length }}件</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">总价:</span>
          <span class="summary-value total-price">¥{{ formatPrice(totalPrice) }}</span>
        </div>
        <div class="summary-item" v-if="totalSavings > 0">
          <span class="summary-label">节省:</span>
          <span class="summary-value savings">¥{{ formatPrice(totalSavings) }}</span>
        </div>
      </div>
      
      <div class="purchase-actions">
        <button class="purchase-btn primary" @click="purchaseAll" :disabled="isProcessing">
          <CreditCard :size="16" />
          {{ isProcessing ? '处理中...' : '立即购买' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ShoppingCart, Package, Eye, CreditCard, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])

// 响应式数据
const selectedProducts = ref([])
const isProcessing = ref(false)
const recentOrder = ref(null)

// 计算属性
const totalPrice = computed(() => {
  return selectedProducts.value.reduce((sum, product) => {
    return sum + (product.price || 0)
  }, 0)
})

const totalSavings = computed(() => {
  return selectedProducts.value.reduce((sum, product) => {
    const oldPrice = product.oldPrice || 0
    const currentPrice = product.price || 0
    return sum + Math.max(0, oldPrice - currentPrice)
  }, 0)
})

// 方法
const loadSelectedProducts = () => {
  try {
    const products = JSON.parse(localStorage.getItem('selectedShopProducts') || '[]')
    selectedProducts.value = products
    console.log('[SelectedProductsCard] 加载已选商品:', products.length, '件')
  } catch (error) {
    console.error('[SelectedProductsCard] 加载已选商品失败:', error)
    selectedProducts.value = []
  }
}

const saveSelectedProducts = () => {
  try {
    localStorage.setItem('selectedShopProducts', JSON.stringify(selectedProducts.value))
    console.log('[SelectedProductsCard] 保存已选商品:', selectedProducts.value.length, '件')
  } catch (error) {
    console.error('[SelectedProductsCard] 保存已选商品失败:', error)
  }
}

const removeProduct = (productId) => {
  const index = selectedProducts.value.findIndex(p => p.id === productId)
  if (index !== -1) {
    selectedProducts.value.splice(index, 1)
    saveSelectedProducts()
    
    // 同时更新选中ID列表
    const selectedIds = JSON.parse(localStorage.getItem('selectedShopProductIds') || '[]')
    const newSelectedIds = selectedIds.filter(id => id !== productId)
    localStorage.setItem('selectedShopProductIds', JSON.stringify(newSelectedIds))
    
    console.log('[SelectedProductsCard] 移除商品:', productId)
    emit('update', { action: 'removeProduct', productId })
  }
}

const clearAllSelected = () => {
  if (confirm('确定要清空所有已选商品吗？')) {
    selectedProducts.value = []
    saveSelectedProducts()
    
    // 清空选中ID列表
    localStorage.setItem('selectedShopProductIds', JSON.stringify([]))
    
    console.log('[SelectedProductsCard] 清空所有已选商品')
    emit('update', { action: 'clearAll' })
  }
}

// 模拟支付接口调用
const mockPaymentAPI = async (orderData) => {
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 模拟90%的成功率
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        resolve({
          success: true,
          orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: orderData.totalAmount,
          message: '支付成功'
        })
      } else {
        reject(new Error('支付失败，请重试'))
      }
    }, 2000) // 2秒延迟模拟真实支付过程
  })
}

const purchaseAll = async () => {
  if (selectedProducts.value.length === 0) {
    alert('请先选择商品')
    return
  }
  
  if (isProcessing.value) {
    return
  }
  
  isProcessing.value = true
  
  try {
    console.log('[SelectedProductsCard] 开始购买流程:', selectedProducts.value)
    
    // 构建订单数据
    const orderData = {
      products: selectedProducts.value,
      totalAmount: totalPrice.value,
      totalSavings: totalSavings.value,
      orderTime: new Date().toISOString(),
      orderId: `ORDER_${Date.now()}`
    }
    
    // 调用模拟支付接口
    const paymentResult = await mockPaymentAPI(orderData)
    
    console.log('[SelectedProductsCard] 支付成功:', paymentResult)
    
    // 保存订单记录
    saveOrderRecord({
      ...orderData,
      ...paymentResult
    })
    
    // 保存订单记录
    saveOrderRecord({
      ...orderData,
      ...paymentResult
    })
    
    // 设置最近订单信息
    recentOrder.value = { ...orderData, ...paymentResult }
    
    // 清空已选商品
    selectedProducts.value = []
    saveSelectedProducts()
    localStorage.setItem('selectedShopProductIds', JSON.stringify([]))
    
    // 通知父组件
    emit('update', { 
      action: 'purchaseSuccess', 
      orderData: { ...orderData, ...paymentResult }
    })
    
  } catch (error) {
    console.error('[SelectedProductsCard] 购买失败:', error)
    alert(`购买失败: ${error.message}`)
  } finally {
    isProcessing.value = false
  }
}

// 保存订单记录
const saveOrderRecord = (orderRecord) => {
  try {
    const orders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    orders.unshift(orderRecord)
    // 只保留最近50条记录
    if (orders.length > 50) {
      orders.splice(50)
    }
    localStorage.setItem('purchaseOrders', JSON.stringify(orders))
    console.log('[SelectedProductsCard] 订单记录已保存:', orderRecord.orderId)
  } catch (error) {
    console.error('[SelectedProductsCard] 保存订单记录失败:', error)
  }
}

// 格式化订单时间
const formatOrderTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  const now = new Date()
  const diffTime = now - date
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  
  if (diffMinutes < 1) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffMinutes < 1440) {
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours}小时前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
}

// 开始新的购买
const startNewOrder = () => {
  recentOrder.value = null
  console.log('[SelectedProductsCard] 开始新的购买流程')
  emit('update', { action: 'startNewOrder' })
}



const formatPrice = (price) => {
  if (!price) return '0'
  return typeof price === 'number' ? price.toLocaleString() : price.toString()
}

// 监听本地存储变化
const watchStorageChanges = () => {
  window.addEventListener('storage', (e) => {
    if (e.key === 'selectedShopProducts') {
      loadSelectedProducts()
    }
  })
}

// 监听选中商品变化
watch(selectedProducts, () => {
  saveSelectedProducts()
}, { deep: true })

onMounted(() => {
  loadSelectedProducts()
  watchStorageChanges()
  
  // 定期检查本地存储变化（用于同页面内的更新）
  setInterval(() => {
    const storedProducts = JSON.parse(localStorage.getItem('selectedShopProducts') || '[]')
    if (JSON.stringify(storedProducts) !== JSON.stringify(selectedProducts.value)) {
      loadSelectedProducts()
    }
  }, 1000)
})
</script>

<style scoped>
.selected-products-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(49,130,206,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.selected-products-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.header-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.product-count {
  background: #3182ce;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.clear-all-btn {
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-all-btn:hover {
  background: #c82333;
}

.selected-products-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6c757d;
  text-align: center;
}

.empty-state span {
  margin-top: 16px;
  font-size: 1.1rem;
  font-weight: 500;
}

.empty-state p {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
  color: #adb5bd;
}

.selected-products-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.selected-product-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.product-image-container {
  position: relative;
  flex-shrink: 0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #c82333;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-title {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e53e3e;
}

.old-price {
  font-size: 0.875rem;
  color: #6c757d;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #6c757d;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #f6b100;
}

.star {
  font-size: 0.75rem;
}

.product-reviews {
  color: #6c757d;
}

.prime-badge {
  background: #ffd700;
  color: #333;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
}

.product-actions {
  flex-shrink: 0;
}

.remove-single-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.remove-single-btn:hover {
  background: #c82333;
}

.purchase-summary {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  border-top: 1px solid #4caf50;
  padding: 20px;
}

.summary-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8f5e8;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 0.75rem;
  color: #6c757d;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.total-price {
  font-size: 1.25rem;
  color: #e53e3e;
}

.savings {
  color: #28a745;
}

.purchase-actions {
  display: flex;
  gap: 12px;
}

.purchase-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.purchase-btn.primary {
  background: #28a745;
  color: #fff;
}

.purchase-btn.primary:hover:not(:disabled) {
  background: #218838;
}

.purchase-btn.primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.recent-order-section {
  background: linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%);
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.recent-order-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A, #81C784);
}

.order-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.order-icon {
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

.order-title h4 {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2E7D32;
}

.order-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #388E3C;
}

.new-order-btn {
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

.new-order-btn:hover {
  background: #4CAF50;
  color: #FFFFFF;
}

.order-details {
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E8F5E8;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}

.order-info {
  padding: 16px;
  border-bottom: 1px solid #E8F5E8;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.order-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-label {
  font-size: 0.75rem;
  color: #666666;
  font-weight: 500;
}

.order-value {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 600;
}

.total-amount {
  font-size: 1.125rem;
  color: #2E7D32;
}

.savings-amount {
  color: #28a745;
}

.order-products {
  padding: 16px;
}

.order-products h5 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.order-product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 8px;
  border: 1px solid #E9ECEF;
}

.order-product-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.order-product-info {
  flex: 1;
  min-width: 0;
}

.order-product-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-product-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}

.order-product-price .price {
  color: #e53e3e;
  font-weight: 600;
}

.order-product-price .old-price {
  color: #6c757d;
  text-decoration: line-through;
  font-size: 0.75rem;
}



.selected-products-card.scrollable {
  max-height: 60vh;
  overflow-y: auto;
}

.selected-products-card.scrollable::-webkit-scrollbar {
  width: 4px;
}

.selected-products-card.scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}
</style> 