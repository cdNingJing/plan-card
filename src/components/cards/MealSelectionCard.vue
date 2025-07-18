<template>
  <div class="meal-card" :class="cardState" @click="handleCardClick">
    <div class="card-header" @click.stop="handleHeaderClick">
      <h2 class="card-title">Choose Your Meal</h2>
      <div class="header-actions">
        <span v-if="cardState === 'collapsed'" class="card-status">Select meal</span>
        <button v-if="cardState === 'half'" class="action-btn" @click.stop="expandToFull">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
        <button v-if="cardState === 'full'" class="action-btn" @click.stop="closeFull">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="cardState !== 'collapsed'" class="card-content">
      <p class="card-subtitle">Allergy-safe meal options</p>
      
      <div class="meal-options">
        <div class="meal-grid">
          <div 
            v-for="meal in mealOptions" 
            :key="meal.id"
            :class="['meal-option', { 'selected': selectedMeal && selectedMeal.id === meal.id }]"
            @click="selectMeal(meal)"
          >
            <div class="meal-image">
              <img :src="meal.image" :alt="meal.name" class="meal-img">
              <div class="meal-overlay">
                <span class="meal-name">{{ meal.name }}</span>
                <div class="radio-button">
                  <div :class="['radio-circle', { 'checked': selectedMeal && selectedMeal.id === meal.id }]">
                    <div v-if="selectedMeal && selectedMeal.id === meal.id" class="radio-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        class="confirm-btn" 
        :class="{ 'disabled': !selectedMeal }" 
        @click="confirmSelection"
        :disabled="!selectedMeal"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MealSelectionCard',
  props: {
    mealOptions: {
      type: Array,
      default: () => [
        {
          id: 1,
          name: 'Tonkatsu',
          image: '/images/tonkatsu.jpg',
          description: 'Breaded pork cutlet with sauce',
          allergens: ['None']
        },
        {
          id: 2,
          name: 'Gyūdon',
          image: '/images/gyudon.jpg',
          description: 'Beef bowl with rice',
          allergens: ['None']
        },
        {
          id: 3,
          name: 'Sushi Roll',
          image: '/images/sushi.jpg',
          description: 'Fresh salmon roll',
          allergens: ['Fish']
        },
        {
          id: 4,
          name: 'Tempura',
          image: '/images/tempura.jpg',
          description: 'Crispy vegetable tempura',
          allergens: ['None']
        },
        {
          id: 5,
          name: 'Ramen',
          image: '/images/ramen.jpg',
          description: 'Noodle soup with pork',
          allergens: ['Egg', 'Wheat']
        },
        {
          id: 6,
          name: 'Yakitori',
          image: '/images/yakitori.jpg',
          description: 'Grilled chicken skewers',
          allergens: ['None']
        }
      ]
    }
  },
  data() {
    return {
      selectedMeal: null,
      cardState: 'collapsed' // 'collapsed', 'half', 'full'
    }
  },
  methods: {
    // 卡片点击处理
    handleCardClick() {
      // 在收起状态下，点击卡片任意位置都会展开
      if (this.cardState === 'collapsed') {
        this.cardState = 'half'
      }
    },
    // 状态管理方法
    handleHeaderClick() {
      if (this.cardState === 'collapsed') {
        this.cardState = 'half'
      } else {
        this.cardState = 'collapsed'
      }
    },
    expandToFull() {
      this.cardState = 'full'
    },
    closeFull() {
      this.cardState = 'half'
    },
    selectMeal(meal) {
      this.selectedMeal = meal
      console.log('Selected meal:', meal)
    },
    confirmSelection() {
      if (this.selectedMeal) {
        this.$emit('meal-selected', this.selectedMeal)
        console.log('Confirmed meal:', this.selectedMeal)
      }
    }
  }
}
</script>

<style scoped>
/* Meal卡片样式 */
.meal-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(255, 255, 255, 0.35) 100%);
  backdrop-filter: blur(70px);
  border-radius: 32px;
  padding: 20px 24px 8px;
  box-shadow: 0px 50px 30px -30px rgba(125, 136, 172, 0.25);
  border: 0.5px solid rgba(255, 255, 255, 0.45);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 三种状态样式 */
.meal-card.collapsed {
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.2) 100%);
  backdrop-filter: blur(20px);
  border-radius: 35px;
  padding: 13px 24px;
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  opacity: 0.9;
  height: auto;
  min-height: auto;
  margin: 0;
  transform: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}


.meal-card.half {
  padding: 8px 24px 8px;
  height: auto;
  min-height: 400px;
}

.meal-card.full {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  margin: 0;
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.card-header:hover {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #666666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 20px;
  font-weight: 500;
  color: #12192B;
  margin: 0;
  line-height: 1.3;
  font-family: 'Inter', sans-serif;
}

.meal-card.collapsed .card-title {
  font-size: 14px;
  font-weight: 500;
  color: #12192B;
  font-family: 'Inter', sans-serif;
  line-height: 1.43;
}

.card-status {
  font-size: 12px;
  color: #595E6B;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  line-height: 1.33;
}

.card-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-subtitle {
  color: #595E6B;
  font-size: 12px;
  margin: 0 0 24px 0;
  font-weight: 500;
  line-height: 1.33;
  font-family: 'Inter', sans-serif;
}

/* 餐品选项样式 */
.meal-options {
  margin-bottom: 24px;
}

.meal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

/* 全屏状态下的网格 */
.meal-card.full .meal-grid {
  max-height: 500px;
  grid-template-columns: repeat(3, 1fr);
}

.meal-option {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.meal-option.selected {
  border-color: #007AFF;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}

.meal-image {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.meal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}


.meal-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.meal-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.radio-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.radio-circle.checked {
  background: #007AFF;
  border-color: #007AFF;
}

.radio-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

/* 确认按钮 */
.confirm-btn {
  width: 100%;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 16px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
}


.confirm-btn.disabled {
  background: #E0E0E0;
  color: #A0A0A0;
  cursor: not-allowed;
  transform: none;
}

/* 滚动条样式 */
.meal-grid::-webkit-scrollbar {
  width: 4px;
}

.meal-grid::-webkit-scrollbar-track {
  background: transparent;
}

.meal-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.meal-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style> 