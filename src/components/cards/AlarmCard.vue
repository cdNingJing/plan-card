<template>
  <div class="alarm-card">
    <div class="alarm-info">
      <div class="alarm-time">{{ alarmTime }}</div>
      <div class="alarm-label">{{ alarmLabel }}</div>
      <div class="alarm-status" :class="{ 'enabled': isEnabled }">
        {{ isEnabled ? '已启用' : '已关闭' }}
      </div>
    </div>
    <div class="alarm-icon">
      <i :class="isEnabled ? 'icon-bell' : 'icon-bell-off'"></i>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AlarmCard',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    isSpecific: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const alarmTime = ref('07:30')
    const alarmLabel = ref('起床闹钟')
    const isEnabled = ref(true)
    
    const loadAlarmData = () => {
      if (props.data.time) {
        alarmTime.value = props.data.time
      }
      if (props.data.label) {
        alarmLabel.value = props.data.label
      }
      if (props.data.enabled !== undefined) {
        isEnabled.value = props.data.enabled
      }
    }
    
    onMounted(() => {
      loadAlarmData()
    })
    
    return {
      alarmTime,
      alarmLabel,
      isEnabled
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  .alarm-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .alarm-time {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
    }
    
    .alarm-label {
      font-size: 0.75rem;
      opacity: 0.8;
      font-weight: 500;
      margin-bottom: 0.125rem;
    }
    
    .alarm-status {
      font-size: 0.625rem;
      opacity: 0.6;
      
      &.enabled {
        color: #4caf50;
        opacity: 0.8;
      }
    }
  }
  
  .alarm-icon {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    opacity: 0.6;
    
    i {
      font-size: 1rem;
    }
  }
}

// 响应式调整
@media (max-width: 375px) {
  .alarm-card {
    padding: 0.75rem;
    
    .alarm-info {
      .alarm-time {
        font-size: 1rem;
      }
      
      .alarm-label {
        font-size: 0.625rem;
      }
      
      .alarm-status {
        font-size: 0.5rem;
      }
    }
  }
}
</style>