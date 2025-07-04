<template>
  <div class="app">
    <header class="header">
      <h1>📋 计划卡片</h1>
      <p>使用 Vue 3 + Pinia 管理您的计划</p>
    </header>
    
    <main class="main">
      <PlanCard />
    </main>
  </div>
</template>

<script setup>
import PlanCard from './components/PlanCard.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 