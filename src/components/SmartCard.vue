<template>
  <div 
    class="smart-card"
    :class="[
      `state-${card.state}`,
      `type-${card.type}`,
      { 'write-operation': card.writeOperation }
    ]"
  >
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="card-title">
        <component :is="getIcon(card.icon)" :size="20" />
        <h3>{{ card.title }}</h3>
      </div>
      <div class="card-actions">
        <button 
          v-if="card.state !== 'fullscreen'"
          @click="toggleState"
          class="action-btn"
          :title="card.state === 'expanded' ? '收起' : '展开'"
        >
          <component :is="card.state === 'expanded' ? 'ChevronUp' : 'ChevronDown'" :size="16" />
        </button>
        <button 
          @click="enterFullscreen"
          class="action-btn"
          title="全屏"
        >
          <Maximize2 :size="16" />
        </button>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content" v-show="card.state !== 'collapsed'">
      <!-- 目的地卡片 -->
      <DestinationCard 
        v-if="card.type === 'destination'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 航班推荐卡片 -->
      <FlightCard 
        v-else-if="card.type === 'flight'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 酒店推荐卡片 -->
      <HotelCard 
        v-else-if="card.type === 'hotel'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 礼物推荐卡片 -->
      <GiftCard 
        v-else-if="card.type === 'gift'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 预算过滤卡片 -->
      <BudgetCard 
        v-else-if="card.type === 'budget'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 会议详情卡片 -->
      <MeetingCard 
        v-else-if="card.type === 'meeting'"
        :data="card.data"
        @update="handleUpdate"
      />
      
      <!-- 通用卡片 -->
      <GenericCard 
        v-else
        :data="card.data"
        :type="card.type"
        @update="handleUpdate"
      />
    </div>

    <!-- 全屏遮罩 -->
    <div v-if="card.state === 'fullscreen'" class="fullscreen-overlay" @click="exitFullscreen">
      <div class="fullscreen-content" @click.stop>
        <div class="fullscreen-header">
          <h2>{{ card.title }}</h2>
          <button @click="exitFullscreen" class="close-btn">
            <X :size="24" />
          </button>
        </div>
        <div class="fullscreen-body">
          <!-- 全屏内容 -->
          <component 
            :is="getCardComponent(card.type)"
            :data="card.data"
            :fullscreen="true"
            @update="handleUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  X,
  MapPin,
  Plane,
  Building,
  Calendar,
  Package,
  User,
  Gift,
  DollarSign,
  Lightbulb,
  Users,
  Bell,
  CheckCircle,
  Paperclip
} from 'lucide-vue-next'

import DestinationCard from './cards/DestinationCard.vue'
import FlightCard from './cards/FlightCard.vue'
import HotelCard from './cards/HotelCard.vue'
import GiftCard from './cards/GiftCard.vue'
import BudgetCard from './cards/BudgetCard.vue'
import MeetingCard from './cards/MeetingCard.vue'
import GenericCard from './cards/GenericCard.vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-state', 'update-data'])

const iconMap = {
  MapPin,
  Plane,
  Building,
  Calendar,
  Package,
  User,
  Gift,
  DollarSign,
  Lightbulb,
  Users,
  Bell,
  CheckCircle,
  Paperclip
}

const getIcon = (iconName) => {
  return iconMap[iconName] || MapPin
}

const getCardComponent = (type) => {
  const componentMap = {
    destination: DestinationCard,
    flight: FlightCard,
    hotel: HotelCard,
    gift: GiftCard,
    budget: BudgetCard,
    meeting: MeetingCard
  }
  return componentMap[type] || GenericCard
}

const toggleState = () => {
  const newState = props.card.state === 'expanded' ? 'collapsed' : 'expanded'
  emit('update-state', props.card.id, newState)
}

const enterFullscreen = () => {
  emit('update-state', props.card.id, 'fullscreen')
}

const exitFullscreen = () => {
  emit('update-state', props.card.id, 'expanded')
}

const handleUpdate = (data) => {
  emit('update-data', props.card.id, data)
}
</script>

<style scoped>
.smart-card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.smart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.smart-card.write-operation {
  border-left: 4px solid #333333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E5E5E5;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #E5E5E5;
  color: #333333;
}

.card-content {
  padding: 20px;
}

.state-collapsed .card-content {
  display: none;
}

.state-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.fullscreen-content {
  background: #FFFFFF;
  border-radius: 8px;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
}

.fullscreen-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #E5E5E5;
  color: #333333;
}

.fullscreen-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  min-height: 0;
}

/* 卡片类型特定样式 */
.type-destination {
  border-left: 4px solid #666666;
}

.type-flight {
  border-left: 4px solid #999999;
}

.type-hotel {
  border-left: 4px solid #999999;
}

.type-gift {
  border-left: 4px solid #666666;
}

.type-budget {
  border-left: 4px solid #333333;
}

.type-meeting {
  border-left: 4px solid #666666;
}

@media (max-width: 768px) {
  .card-header {
    padding: 12px 16px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .fullscreen-overlay {
    padding: 16px;
  }
  
  .fullscreen-content {
    width: 95vw;
    height: 95vh;
  }
  
  .fullscreen-header {
    padding: 16px;
  }
  
  .fullscreen-body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 10px 12px;
  }
  
  .card-content {
    padding: 12px;
  }
  
  .fullscreen-overlay {
    padding: 12px;
  }
  
  .fullscreen-content {
    width: 98vw;
    height: 98vh;
  }
  
  .fullscreen-header {
    padding: 12px;
  }
  
  .fullscreen-header h2 {
    font-size: 1.125rem;
  }
  
  .fullscreen-body {
    padding: 12px;
  }
}
</style> 