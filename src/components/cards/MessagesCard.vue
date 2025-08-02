<template>
  <div class="messages-card">
    <div class="card-icon">
      <MessageCircle :size="24" />
      <div v-if="data?.unreadCount > 0" class="badge">{{ data.unreadCount }}</div>
    </div>
    <div class="card-info">
      <div class="card-title">消息</div>
      <div class="card-subtitle">{{ data?.unreadCount || 3 }} 条未读</div>
    </div>
  </div>
</template>

<script>
import { MessageCircle } from 'lucide-vue-next'

export default {
  name: 'MessagesCard',
  components: {
    MessageCircle
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss" scoped>
.messages-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  height: 100%;
  text-align: center;
  
  .card-icon {
    position: relative;
    margin-bottom: 0.5rem;
    opacity: 0.9;
    
    .badge {
      position: absolute;
      top: -0.25rem;
      right: -0.25rem;
      background: #ff4757;
      color: white;
      border-radius: 50%;
      width: 1rem;
      height: 1rem;
      font-size: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
  }
  
  .card-info {
    .card-title {
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .card-subtitle {
      font-size: 0.625rem;
      opacity: 0.8;
    }
  }
}
</style>