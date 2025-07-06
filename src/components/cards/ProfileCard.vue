<template>
  <div class="profile-card">
    <div class="profile-header">
      <h3>收礼人画像</h3>
      <p class="profile-description">基于您提供的信息，我们为您分析了收礼人的画像</p>
    </div>
    
    <div class="profile-content">
      <!-- 基本信息展示 -->
      <div class="basic-info-section" v-if="hasBasicInfo">
        <h4>基本信息</h4>
        <div class="info-grid">
          <div class="info-item" v-if="data.recipient">
            <span class="info-label">收礼人：</span>
            <span class="info-value">{{ data.recipient }}</span>
          </div>
          <div class="info-item" v-if="data.occasion">
            <span class="info-label">送礼场合：</span>
            <span class="info-value">{{ data.occasion }}</span>
          </div>
          <div class="info-item" v-if="data.budget">
            <span class="info-label">预算范围：</span>
            <span class="info-value">{{ data.budget }}</span>
          </div>
          <div class="info-item" v-if="data.interests">
            <span class="info-label">兴趣爱好：</span>
            <span class="info-value">{{ data.interests }}</span>
          </div>
        </div>
      </div>
      
      <div class="analysis-section">
        <h4>画像分析</h4>
        <p class="analysis-text">{{ data.analysis || '正在分析收礼人画像...' }}</p>
      </div>
      
      <div class="tags-section">
        <h4>特征标签</h4>
        <div class="tags-container">
          <span 
            v-for="tag in data.tags" 
            :key="tag" 
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <!-- 礼物建议 -->
      <div class="suggestions-section" v-if="data.giftSuggestions">
        <h4>礼物建议</h4>
        <div class="suggestions-list">
          <div 
            v-for="suggestion in data.giftSuggestions" 
            :key="suggestion.id"
            class="suggestion-item"
          >
            <div class="suggestion-icon">💡</div>
            <div class="suggestion-content">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-reason">{{ suggestion.reason }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, watch, onMounted, onUnmounted, ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfoStore.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const userInfoStore = useUserInfoStore()

// 组件挂载状态
const isComponentMounted = ref(false)

// 计算是否有基本信息
const hasBasicInfo = computed(() => {
  return props.data.recipient || props.data.occasion || props.data.budget || props.data.interests
})

// 监听用户信息变化，实时更新画像
watch(() => userInfoStore.getScenarioInfo('gift'), (newUserInfo) => {
  try {
    // 检查组件是否仍然挂载
    if (!isComponentMounted.value) {
      console.log('[ProfileCard] 组件已卸载，跳过用户信息监听')
      return
    }
    
    // 触发组件重新渲染以更新画像
    console.log('[ProfileCard] 检测到用户信息变化，更新画像')
  } catch (error) {
    console.error('[ProfileCard] 监听用户信息变化时出错:', error)
  }
}, { deep: true, immediate: false })

onMounted(() => {
  isComponentMounted.value = true
  userInfoStore.loadFromStorage()
})

onUnmounted(() => {
  isComponentMounted.value = false
  console.log('[ProfileCard] 组件已卸载，清理完成')
})
</script>

<style scoped>
.profile-card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 20px;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333333;
}

.profile-description {
  margin: 0;
  font-size: 0.875rem;
  color: #666666;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-section h4,
.tags-section h4,
.basic-info-section h4,
.suggestions-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.analysis-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #666666;
  background: #F8F9FA;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #4CAF50;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #E8F5E8;
  color: #2E7D32;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.basic-info-section {
  background: #F8F9FA;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 0.875rem;
  color: #666666;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 600;
}

.suggestions-section {
  background: #FFF8E1;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #FFE082;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #FFFFFF;
  border-radius: 6px;
  border: 1px solid #FFE082;
}

.suggestion-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4px;
}

.suggestion-reason {
  font-size: 0.8rem;
  color: #666666;
  line-height: 1.4;
}
</style> 