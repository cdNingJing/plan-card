<template>
  <div class="calculator-card">
    <div class="card-icon">
      <Calculator :size="24" />
    </div>
    <div class="card-info">
      <div class="card-title">计算器</div>
      <div class="card-subtitle">工具</div>
    </div>
  </div>
</template>

<script>
import { Calculator } from 'lucide-vue-next'

export default {
  name: 'CalculatorCard',
  components: {
    Calculator
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
.calculator-card {
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