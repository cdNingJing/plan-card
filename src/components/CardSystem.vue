<template>
  <div class="card-system">
    <!-- 卡片容器 -->
    <div class="cards-container" v-if="cardStore.visibleCards.length > 0">
      <TransitionGroup name="card" tag="div" class="cards-grid">
        <SmartCard
          v-for="card in cardStore.visibleCards"
          :key="card.id"
          :card="card"
          @update-state="handleUpdateState"
          @update-data="handleUpdateData"
        />
      </TransitionGroup>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <Sparkles :size="48" />
      </div>
      <h3>开始您的智能助手体验</h3>
      <p>在底部输入框中描述您的需求，我将为您生成相应的功能卡片</p>
      <div class="examples">
        <h4>试试这些示例：</h4>
        <div class="example-tags">
          <button 
            v-for="example in examples" 
            :key="example.id"
            @click="$emit('use-example', example.text)"
            class="example-tag"
          >
            {{ example.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCardStore } from '../stores/cardStore'
import SmartCard from './SmartCard.vue'
import { Sparkles } from 'lucide-vue-next'

const cardStore = useCardStore()

const examples = [
  { id: 1, text: '我想和朋友一起去东京玩五天' },
  { id: 2, text: '我想送妈妈一个园艺相关的礼物，预算500元以内' },
  { id: 3, text: '明天下午三点的项目会议，请发提醒' }
]

const emit = defineEmits(['use-example'])

const handleUpdateState = (cardId, newState) => {
  cardStore.updateCardState(cardId, newState)
}

const handleUpdateData = (cardId, newData) => {
  cardStore.updateCardData(cardId, newData)
}
</script>

<style scoped>
.card-system {
  flex: 1;
  padding: 24px;
}

.cards-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  align-items: start;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.empty-icon {
  color: #666666;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 1rem;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 32px;
}

.examples h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.example-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.example-tag {
  padding: 8px 16px;
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.example-tag:hover {
  background: #E5E5E5;
  color: #333333;
  transform: translateY(-1px);
}

/* 卡片动画 */
.card-enter-active,
.card-leave-active {
  transition: all 0.3s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.card-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.card-move {
  transition: transform 0.3s ease;
}

</style> 