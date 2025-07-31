<template>
  <div class="allergy-tracker">
    <div class="food-tags">
      <span 
        v-for="food in foods"
        :key="food"
        class="food-tag"
        @click="toggleFood(food)"
        :class="{ 'marked': selectedFoods.includes(food) }"
      >
        {{ food }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  foods: {
    type: Array,
    default: () => []
  },
  selectedFoods: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-food'])

const toggleFood = (food) => {
  emit('toggle-food', food)
}
</script>

<style scoped>
.food-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.food-tag {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  border: 2px solid transparent;
  user-select: none;
}

.food-tag:hover {
  background: hsl(var(--secondary) / 0.8);
  transform: translateY(-1px);
}

.food-tag.marked {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
  border-color: hsl(var(--destructive) / 0.5);
}
</style>