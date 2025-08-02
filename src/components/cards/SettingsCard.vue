<template>
  <div class="settings-card">
    <div class="card-icon">
      <Settings :size="24" />
    </div>
    <div class="card-info">
      <div class="card-title">设置</div>
      <div class="card-subtitle">系统配置</div>
    </div>
  </div>
</template>

<script>
import { Settings } from 'lucide-vue-next'

export default {
  name: 'SettingsCard',
  components: {
    Settings
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
.settings-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  height: 100%;
  text-align: center;
  
  .card-icon {
    margin-bottom: 0.5rem;
    opacity: 0.9;
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