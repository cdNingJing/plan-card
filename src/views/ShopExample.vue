<template>
  <div class="shop-example">
    <div class="page-header">
      <h1>商品选择示例</h1>
      <p>选择商品并查看已选商品集合</p>
    </div>
    
    <div class="cards-container">
      <!-- 商品卡片 -->
      <div class="card-section">
        <h2>商品列表</h2>
        <ShopCard 
          :data="shopCardData" 
          :fullscreen="false"
          @update="handleShopCardUpdate"
        />
      </div>
      
      <!-- 已选商品卡片 -->
      <div class="card-section">
        <h2>已选商品</h2>
        <SelectedProductsCard 
          :fullscreen="false"
          @update="handleSelectedProductsUpdate"
          @purchase="handlePurchase"
          @addToCart="handleAddToCart"
        />
      </div>
    </div>
    
    <!-- 操作日志 -->
    <div class="action-log">
      <h3>操作日志</h3>
      <div class="log-content">
        <div v-for="(log, index) in actionLogs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-action">{{ log.action }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import ShopCard from '@/components/cards/ShopCard.vue'
import SelectedProductsCard from '@/components/cards/SelectedProductsCard.vue'

// 响应式数据
const shopCardData = reactive({
  filters: {
    priceRange: 'any',
    rating: 'any'
  }
})

const actionLogs = ref([])

// 方法
const addLog = (action) => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  actionLogs.value.unshift({
    time,
    action
  })
  
  // 只保留最近20条日志
  if (actionLogs.value.length > 20) {
    actionLogs.value.splice(20)
  }
}

const handleShopCardUpdate = (data) => {
  console.log('[ShopExample] ShopCard更新:', data)
  
  if (data.action === 'productSelectionChanged') {
    if (data.isSelected) {
      addLog(`✅ 添加商品: ${data.product.title}`)
    } else {
      addLog(`❌ 移除商品: ${data.product.title}`)
    }
  } else if (data.action === 'addToCart') {
    addLog(`🛒 添加到购物车: ${data.orderData.product.title}`)
  } else if (data.action === 'startNewSearch') {
    addLog(`🔄 开始新的商品搜索`)
  }
}

const handleSelectedProductsUpdate = (data) => {
  console.log('[ShopExample] SelectedProductsCard更新:', data)
  
  if (data.action === 'removeProduct') {
    addLog(`🗑️ 从已选商品中移除商品`)
  } else if (data.action === 'clearAll') {
    addLog(`🧹 清空所有已选商品`)
  }
}

const handlePurchase = (data) => {
  console.log('[ShopExample] 购买商品:', data)
  addLog(`💳 购买商品: ${data.products.length}件，总价: ¥${data.totalPrice}`)
  
  // 这里可以添加实际的购买逻辑
  alert(`正在处理购买请求...\n商品数量: ${data.products.length}\n总价: ¥${data.totalPrice}`)
}

const handleAddToCart = (data) => {
  console.log('[ShopExample] 添加到购物车:', data)
  addLog(`🛒 批量添加到购物车: ${data.products.length}件商品`)
  
  // 这里可以添加实际的购物车逻辑
  alert(`已添加 ${data.products.length} 件商品到购物车`)
}
</script>

<style scoped>
.shop-example {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 2rem;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.cards-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
}

.card-section h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.action-log {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.action-log h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.875rem;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #6c757d;
  font-family: monospace;
  min-width: 80px;
}

.log-action {
  color: #333;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .shop-example {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .cards-container {
    gap: 16px;
  }
}
</style> 