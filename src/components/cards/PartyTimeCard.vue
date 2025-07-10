<template>
  <div class="party-time-card">
    <div class="card-content">
      <div class="time-section">
        <div class="time-list">
          <div class="time-item" v-for="time in times" :key="time.id">
            <div class="time-info">
              <span class="time-slot">{{ time.slot }}</span>
              <span class="time-desc">{{ time.description }}</span>
            </div>
            <div class="time-tags">
              <span class="tag">{{ time.type }}</span>
              <span class="tag">{{ time.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 只用内部模拟数据
const times = [
  { id: 1, slot: "周六上午", description: "适合户外活动", type: "推荐", duration: "2小时" },
  { id: 2, slot: "周日下午", description: "适合室内聚会", type: "推荐", duration: "3小时" }
]
</script>

<style scoped>
.party-time-card {
  height: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  overflow: auto;
}
.party-theme-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: #17a2b8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.card-title h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.card-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.card-content {
  margin-top: 16px;
}

.time-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.time-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.time-info {
  flex: 1;
}

.time-slot {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.time-desc {
  display: block;
  font-size: 0.8rem;
  color: #666;
}

.time-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.tag.下午 {
  background: #fff3cd;
  color: #856404;
}

.tag.上午 {
  background: #d1ecf1;
  color: #0c5460;
}

.tag.晚上 {
  background: #e2e3e5;
  color: #383d41;
}

.tag.全天 {
  background: #d4edda;
  color: #155724;
}

.tag.2小时 {
  background: #f8d7da;
  color: #721c24;
}

.tag.3小时 {
  background: #d1ecf1;
  color: #0c5460;
}

.tag.6小时 {
  background: #fff3cd;
  color: #856404;
}
</style> 