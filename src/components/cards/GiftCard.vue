<template>
  <div class="gift-card">
    <div class="gift-list">
      <div 
        v-for="gift in data.recommendations" 
        :key="gift.name"
        class="gift-item"
      >
        <div class="gift-info">
          <h4>{{ gift.name }}</h4>
          <p>{{ gift.description }}</p>
          <div class="gift-price">{{ gift.price }}</div>
        </div>
        <div class="gift-actions">
          <button class="action-btn primary">
            <Heart :size="16" />
            收藏
          </button>
          <button class="action-btn secondary">
            <ShoppingCart :size="16" />
            购买
          </button>
        </div>
      </div>
    </div>
    
    <div class="gift-filters" v-if="fullscreen">
      <h4>筛选条件</h4>
      <div class="filter-group">
        <label>价格范围</label>
        <div class="price-range">
          <input type="range" min="0" max="1000" v-model="priceRange" />
          <span>¥0 - ¥{{ priceRange }}</span>
        </div>
      </div>
      
      <div class="filter-group">
        <label>礼物类型</label>
        <div class="type-options">
          <button 
            v-for="type in giftTypes" 
            :key="type"
            :class="['type-btn', { active: selectedTypes.includes(type) }]"
            @click="toggleType(type)"
          >
            {{ type }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Heart, ShoppingCart } from 'lucide-vue-next'

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

const emit = defineEmits(['update'])

const priceRange = ref(500)
const selectedTypes = ref(['园艺用品'])

const giftTypes = [
  '园艺用品', '电子产品', '家居用品', '健康保健', '美容护肤', '图书文具'
]

const toggleType = (type) => {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    selectedTypes.value.splice(index, 1)
  } else {
    selectedTypes.value.push(type)
  }
  handleUpdate()
}

const handleUpdate = () => {
  emit('update', {
    priceRange: priceRange.value,
    selectedTypes: selectedTypes.value
  })
}
</script>

<style scoped>
.gift-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gift-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gift-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
}

.gift-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.gift-info p {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.4;
}

.gift-price {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.gift-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

.action-btn.primary:hover {
  background: #222222;
}

.action-btn.secondary {
  background: #FFFFFF;
  color: #666666;
}

.action-btn.secondary:hover {
  background: #F8F9FA;
  color: #333333;
}

.gift-filters {
  border-top: 1px solid #E5E5E5;
  padding-top: 20px;
}

.gift-filters h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
  margin-bottom: 8px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-range input {
  flex: 1;
}

.price-range span {
  font-size: 0.875rem;
  color: #666666;
  min-width: 80px;
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-btn {
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  background: #FFFFFF;
  color: #666666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  background: #F8F9FA;
}

.type-btn.active {
  background: #333333;
  color: #FFFFFF;
  border-color: #333333;
}

</style> 