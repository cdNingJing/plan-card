<template>
  <div class="restaurant-match-card">
    <div class="restaurant-list">
      <div 
        v-for="restaurant in restaurants" 
        :key="restaurant.id"
        class="restaurant-item"
        :class="{ active: selectedRestaurant?.id === restaurant.id }"
        @click="selectRestaurant(restaurant)"
      >
        <div class="restaurant-image">
          <img :src="restaurant.image" :alt="restaurant.name" />
        </div>
        <div class="restaurant-content">
          <div class="restaurant-info">
            <h4>{{ restaurant.name }}</h4>
            <p class="cuisine">{{ restaurant.cuisine }}</p>
            <p class="atmosphere">{{ restaurant.atmosphere }}</p>
            <div class="tags">
              <span v-for="tag in restaurant.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="restaurant-rating">
            <span class="rating">{{ restaurant.rating }}</span>
            <span class="price">{{ restaurant.price }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRestaurantStore } from '@/stores/restaurantStore'

const restaurantStore = useRestaurantStore()

const restaurants = ref([
  {
    id: 1,
    name: 'Italian Trattoria',
    cuisine: '意大利菜',
    atmosphere: '温馨家庭氛围',
    rating: '4.8',
    price: '$$',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    tags: ['妈妈最爱', '家庭聚餐', '意式风情']
  },
  {
    id: 2,
    name: 'La Bella Vita',
    cuisine: '意大利菜',
    atmosphere: '浪漫约会氛围',
    rating: '4.6',
    price: '$$$',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    tags: ['情侣约会', '精致料理', '红酒配餐']
  },
  {
    id: 3,
    name: 'Casa Mia',
    cuisine: '意大利菜',
    atmosphere: '轻松休闲氛围',
    rating: '4.4',
    price: '$',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
    tags: ['性价比高', '家常味道', '适合聚会']
  }
])

// 从全局状态获取选中的餐厅
const selectedRestaurant = computed(() => restaurantStore.getSelectedRestaurant())

const selectRestaurant = (restaurant) => {
  // 设置全局选中的餐厅
  restaurantStore.setSelectedRestaurant(restaurant)
}
</script>

<style scoped>
.restaurant-match-card {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.restaurant-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.restaurant-item {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.restaurant-item:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

.restaurant-item.active {
  border-color: #6366f1;
  background: #eef2ff;
}

.restaurant-image {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.restaurant-info {
  flex: 1;
}

.restaurant-info h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.cuisine {
  margin: 0 0 4px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.atmosphere {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 13px;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.tag {
  padding: 2px 8px;
  background: #e0e7ff;
  color: #6366f1;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.restaurant-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating {
  color: #f59e0b;
  font-weight: 600;
  font-size: 14px;
}

.price {
  color: #059669;
  font-weight: 500;
  font-size: 13px;
}
</style> 