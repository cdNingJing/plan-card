<template>
  <div class="allergy-free-menu-card">
    <div class="card-content">
      <div class="menu-section">
        <div class="menu-list">
          <div class="menu-item" v-for="(item, idx) in recommendedMenu" :key="item.id">
            <img :src="item.image" class="menu-img" :alt="item.name" />
            <div class="menu-info-right">
              <div class="menu-item-info">
                <span class="menu-name">{{ item.name }}</span>
                <span class="menu-desc">{{ item.description }}</span>
              </div>
              <div class="menu-tags">
                <span class="tag safe">安全</span>
                <span class="tag" :class="item.category">{{ item.category }}</span>
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
const tool = {
  title: "提供无过敏菜单",
  description: "帮你规避食物过敏"
}
const recommendedMenu = [
  {
    id: 1,
    name: "蒸蛋羹",
    description: "纯鸡蛋制作，无添加物",
    category: "主食",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    name: "白米饭",
    description: "纯大米，无麸质",
    category: "主食",
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    name: "清蒸鱼",
    description: "新鲜鱼类，无调味料",
    category: "蛋白质",
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 4,
    name: "蒸胡萝卜",
    description: "纯胡萝卜，无添加",
    category: "蔬菜",
    image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=200&q=80"
  }
]
</script>

<style scoped>
.allergy-free-menu-card {
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

.menu-index {
  width: 24px;
  height: 24px;
  background: #e0e7ff;
  color: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
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

.tag.safe {
  background: #d4edda;
  color: #155724;
}

.tag.主食 {
  background: #fff3cd;
  color: #856404;
}

.tag.蛋白质 {
  background: #d1ecf1;
  color: #0c5460;
}

.tag.蔬菜 {
  background: #d4edda;
  color: #155724;
}
</style> 