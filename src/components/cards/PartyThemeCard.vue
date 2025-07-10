<template>
  <div class="party-theme-card">
    <div class="card-content">
      <div class="theme-section">
        <div class="theme-list">
          <div class="theme-item" v-for="theme in themes" :key="theme.id">
            <img :src="theme.image" class="theme-img" :alt="theme.name" />
            <div class="theme-info">
              <span class="theme-name">{{ theme.name }}</span>
              <span class="theme-desc">{{ theme.description }}</span>
              <div class="theme-tags">
                <span class="tag popular" v-if="theme.popular">热门</span>
                <span class="tag" :class="`age-${theme.ageGroup.replace('岁', '').replace('-', '-')}`">{{ theme.ageGroup }}</span>
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
import { Palette } from 'lucide-vue-next'

// 只用内部模拟数据
const themes = [
  { 
    id: 1, 
    name: "超级英雄", 
    description: "孩子们最爱的英雄主题，包含蜘蛛侠、钢铁侠等角色装饰", 
    popular: true, 
    ageGroup: "6-10岁",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=200&q=80"
  },
  { 
    id: 2, 
    name: "公主童话", 
    description: "梦幻童话风格，粉色系装饰和皇冠元素", 
    popular: false, 
    ageGroup: "4-8岁",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=200&q=80"
  },
  { 
    id: 3, 
    name: "动物乐园", 
    description: "可爱动物主题，包含各种动物装饰和气球", 
    popular: false, 
    ageGroup: "3-7岁",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=200&q=80"
  },
  { 
    id: 4, 
    name: "太空探险", 
    description: "宇宙主题派对，星星、行星和宇航员装饰", 
    popular: true, 
    ageGroup: "5-9岁",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=200&q=80"
  }
]
</script>

<style scoped>
.party-theme-card {
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

.theme-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #f6f6f6;
  border: 1px solid #eee;
}

.theme-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.theme-item:hover {
  background: #f1f3f4;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.theme-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  display: block;
}

.theme-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: block;
}

.theme-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.tag {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: #e2e3e5;
  color: #383d41;
}

.tag.popular {
  background: #f8d7da;
  color: #721c24;
}

.tag.age-3-7 {
  background: #d1ecf1;
  color: #0c5460;
}

.tag.age-4-8 {
  background: #d4edda;
  color: #155724;
}

.tag.age-5-9 {
  background: #fff3cd;
  color: #856404;
}

.tag.age-6-10 {
  background: #e2e3e5;
  color: #383d41;
}
</style> 