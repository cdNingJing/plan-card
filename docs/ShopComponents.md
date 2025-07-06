# 商品卡片组件文档

## 概述

本项目包含两个主要的商品相关组件：
- `ShopCard.vue` - 商品列表卡片，用于显示和选择商品
- `SelectedProductsCard.vue` - 已选商品集合卡片，用于管理已选择的商品

## ShopCard 组件

### 功能特性

- 🔍 **智能搜索**: 根据用户输入信息自动生成搜索关键词
- 📱 **响应式设计**: 支持全屏和普通模式
- 🎯 **商品选择**: 点击商品卡片可选择/取消选择
- 🛒 **购物车集成**: 支持添加商品到购物车
- 📊 **实时更新**: 监听用户信息变化自动刷新商品列表

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `data` | Object | - | 卡片数据对象（必需） |
| `fullscreen` | Boolean | false | 是否全屏显示 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update` | Object | 卡片状态更新事件 |
| `fullscreen` | Boolean | 全屏状态变化事件 |

### 使用示例

```vue
<template>
  <ShopCard 
    :data="shopCardData" 
    :fullscreen="false"
    @update="handleShopCardUpdate"
  />
</template>

<script setup>
import ShopCard from '@/components/cards/ShopCard.vue'

const shopCardData = {
  filters: {
    priceRange: 'any',
    rating: 'any'
  }
}

const handleShopCardUpdate = (data) => {
  console.log('ShopCard更新:', data)
}
</script>
```

## SelectedProductsCard 组件

### 功能特性

- 📦 **商品集合管理**: 显示所有已选择的商品
- 💰 **价格计算**: 自动计算总价和节省金额
- 🛒 **批量操作**: 支持批量添加到购物车
- 💳 **购买功能**: 提供立即购买按钮
- 🗑️ **商品移除**: 支持单个移除和批量清空

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `fullscreen` | Boolean | false | 是否全屏显示 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update` | Object | 卡片状态更新事件 |
| `purchase` | Object | 购买事件 |
| `addToCart` | Object | 添加到购物车事件 |

### 使用示例

```vue
<template>
  <SelectedProductsCard 
    :fullscreen="false"
    @update="handleSelectedProductsUpdate"
    @purchase="handlePurchase"
    @addToCart="handleAddToCart"
  />
</template>

<script setup>
import SelectedProductsCard from '@/components/cards/SelectedProductsCard.vue'

const handleSelectedProductsUpdate = (data) => {
  console.log('已选商品更新:', data)
}

const handlePurchase = (data) => {
  console.log('购买商品:', data.products)
  console.log('总价:', data.totalPrice)
}

const handleAddToCart = (data) => {
  console.log('添加到购物车:', data.products)
}
</script>
```

## 组件通信

### 数据共享

两个组件通过 `localStorage` 共享数据：

- `selectedShopProductIds`: 存储已选商品的ID列表
- `selectedShopProducts`: 存储已选商品的完整数据
- `shopOrders`: 存储购物车记录

### 事件通信

```javascript
// ShopCard 发送的事件
{
  action: 'productSelectionChanged',
  selectedProducts: [...],
  selectedCount: 3,
  product: {...},
  isSelected: true
}

// SelectedProductsCard 发送的事件
{
  action: 'removeProduct',
  productId: 'product_123'
}

{
  action: 'clearAll'
}

{
  products: [...],
  totalPrice: 299.99,
  totalSavings: 50.00
}
```

## 智能搜索功能

### 搜索关键词生成

组件会根据用户输入的信息智能生成搜索关键词：

1. **收件人信息**: 直接作为关键词
2. **兴趣爱好**: 作为关键词组合
3. **预算范围**: 
   - 低预算 (< 1000): 添加"经济实惠"、"性价比"
   - 高预算 (> 5000): 添加"高端"、"精品"
4. **通用关键词**: 自动添加"礼品"、"礼物"

### 示例

```javascript
// 用户输入
{
  recipient: "爸爸",
  interests: ["运动", "健身"],
  budget: "800",
  searchQuery: ""
}

// 生成的搜索关键词
"爸爸 运动 健身 经济实惠 性价比 礼品 礼物"
```

## 样式定制

### CSS 变量

可以通过 CSS 变量自定义样式：

```css
:root {
  --shop-card-border-radius: 12px;
  --shop-card-shadow: 0 4px 16px rgba(49,130,206,0.10);
  --shop-primary-color: #3182ce;
  --shop-success-color: #28a745;
  --shop-danger-color: #dc3545;
}
```

### 响应式断点

- 桌面端: `> 1024px`
- 平板端: `768px - 1024px`
- 移动端: `< 768px`

## 最佳实践

### 1. 错误处理

```javascript
const handleShopCardUpdate = (data) => {
  try {
    // 处理更新逻辑
  } catch (error) {
    console.error('处理ShopCard更新失败:', error)
  }
}
```

### 2. 性能优化

- 使用 `v-memo` 优化大列表渲染
- 合理使用 `computed` 属性
- 避免在模板中进行复杂计算

### 3. 用户体验

- 提供加载状态指示
- 添加错误提示信息
- 支持键盘导航
- 提供无障碍访问支持

## 故障排除

### 常见问题

1. **商品不显示**
   - 检查用户信息是否正确输入
   - 查看控制台是否有API错误
   - 确认网络连接正常

2. **选择状态不同步**
   - 检查 localStorage 是否正常工作
   - 确认组件是否正确监听存储变化

3. **样式显示异常**
   - 检查CSS变量是否正确设置
   - 确认样式文件是否正确导入

### 调试信息

组件会在控制台输出详细的调试信息：

```javascript
[ShopCard] 智能生成的搜索关键词: 爸爸 运动 健身 经济实惠 性价比 礼品 礼物
[ShopCard] 成功获取商品数据，共 12 个商品
[SelectedProductsCard] 加载已选商品: 3 件
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的商品选择和购买功能
- 实现智能搜索功能
- 添加响应式设计支持 