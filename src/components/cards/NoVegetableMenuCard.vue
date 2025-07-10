<template>
  <div class="no-vegetable-menu-card">
    <div class="card-content">
      <div class="menu-section">
        <div class="menu-list">
          <div class="menu-item" v-for="(item, idx) in menu" :key="item.id">
            <img :src="item.image" class="menu-img" :alt="item.name" />
            <div class="menu-info-right">
              <div class="menu-item-info">
                <span class="menu-name">{{ item.name }}</span>
                <span class="menu-desc">{{ item.description }}</span>
              </div>
              <div class="menu-tags">
                <span class="tag">{{ item.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Smile } from 'lucide-vue-next'

// 只用内部模拟数据
const menu = [
  {
    id: 1,
    name: "番茄炒蛋",
    description: "无蔬菜，蛋白质丰富",
    category: "主食",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    name: "牛肉饭",
    description: "牛肉搭配米饭，无蔬菜",
    category: "主食",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    name: "烤鸡翅",
    description: "无蔬菜，香嫩多汁",
    category: "蛋白质",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 4,
    name: "蛋炒饭",
    description: "鸡蛋炒饭，无蔬菜",
    category: "主食",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=200&q=80"
  }
]
</script>

<style scoped>
.no-vegetable-menu-card {
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

.card-content {
  margin-top: 0;
}

.menu-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  flex-shrink: 0;
  background: #f6f6f6;
  border: 1px solid #eee;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 0;
}

.menu-info-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.menu-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-name {
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.menu-desc {
  font-size: 13px;
  color: #666;
}

.menu-tags {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.tag {
  background: #fff3cd;
  color: #856404;
}
</style> 