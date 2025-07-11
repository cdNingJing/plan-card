<template>
  <div class="shopping-list-card">
    <div class="card-content">
      <div class="list-section">
        <div class="list-categories">
          <div class="category" v-for="category in shoppingCategories" :key="category.id">
            <h5>{{ category.name }}</h5>
            <div class="item-list">
              <div class="item" v-for="item in category.items" :key="item.id">
                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-quantity">{{ item.quantity }}</span>
                </div>
                <div class="item-tags">
                  <span class="tag">{{ item.priority }}</span>
                  <span class="tag">{{ item.category }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 只用内部模拟数据
const shoppingCategories = [
  { id: 1, name: "主食", items: [
    { id: 1, name: "大米", quantity: "2斤", priority: "高", category: "主食" },
    { id: 2, name: "面包", quantity: "1袋", priority: "中", category: "主食" }
  ]},
  { id: 2, name: "蛋白质", items: [
    { id: 3, name: "鸡蛋", quantity: "12个", priority: "高", category: "蛋白质" },
    { id: 4, name: "牛奶", quantity: "2瓶", priority: "低", category: "蛋白质" }
  ]}
]
</script>

<style scoped>
.shopping-list-card {
  height: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  overflow: auto;
}
.party-theme-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.card-title h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.card-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.list-section h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.list-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category h5 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 4px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}

.item-quantity {
  font-size: 0.8rem;
  color: #666;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.tag.必需 {
  background: #f8d7da;
  color: #721c24;
}

.tag.可选 {
  background: #fff3cd;
  color: #856404;
}

.tag.装饰 {
  background: #d1ecf1;
  color: #0c5460;
}

.tag.食物 {
  background: #d4edda;
  color: #155724;
}

.tag.饮料 {
  background: #e2e3e5;
  color: #383d41;
}

.tag.活动 {
  background: #f8d7da;
  color: #721c24;
}
</style> 