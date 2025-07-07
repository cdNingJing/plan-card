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
          <div class="info-item" v-if="userInfo.recipient">
            <span class="info-label">收礼人：</span>
            <span class="info-value">{{ userInfo.recipient }}</span>
          </div>
          <div class="info-item" v-if="userInfo.occasion">
            <span class="info-label">送礼场合：</span>
            <span class="info-value">{{ userInfo.occasion }}</span>
          </div>
          <div class="info-item" v-if="userInfo.budget">
            <span class="info-label">预算范围：</span>
            <span class="info-value">{{ userInfo.budget }}</span>
          </div>
          <div class="info-item" v-if="userInfo.interests">
            <span class="info-label">兴趣爱好：</span>
            <span class="info-value">{{ userInfo.interests }}</span>
          </div>
        </div>
      </div>
      
      <div class="analysis-section">
        <h4>画像分析</h4>
        <p class="analysis-text">{{ analysisText }}</p>
      </div>
      
      <!-- 礼物建议 -->
      <div class="suggestions-section" v-if="parsedGiftSuggestions.length > 0">
        <h4>礼物建议</h4>
        <div v-if="isGeneratingSuggestions" class="generating-state">
          <div class="loading-spinner"></div>
          <span>正在生成个性化礼物建议...</span>
        </div>
        <div v-else class="suggestions-list">
          <div 
            v-for="suggestion in parsedGiftSuggestions" 
            :key="suggestion.id || suggestion.title || suggestion.reason"
            class="suggestion-item simple"
          >
            <div class="suggestion-content">
              <div class="suggestion-title" v-if="suggestion.title">{{ suggestion.title }}</div>
              <div class="suggestion-reason" v-if="suggestion.reason">{{ suggestion.reason }}</div>
              <div class="suggestion-details">
                <span class="price-range" v-if="suggestion.priceRange">{{ suggestion.priceRange }}</span>
                <span class="purchase-advice" v-if="suggestion.purchaseAdvice">{{ suggestion.purchaseAdvice }}</span>
              </div>
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
import { giftRecommendationService } from '@/services/giftRecommendationService.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const userInfoStore = useUserInfoStore()

// 组件挂载状态
const isComponentMounted = ref(false)

// 礼物建议状态
const giftSuggestions = ref([])
const isGeneratingSuggestions = ref(false)

// 解析AI返回的建议，只保留结构化的推荐项，并去掉内容中的**
const parsedGiftSuggestions = computed(() => {
  // 过滤掉非结构化（如解释性前言、json代码块等）
  return giftSuggestions.value
    .filter(item => item && (item.title || item.reason || item.priceRange || item.purchaseAdvice))
    .map(item => ({
      ...item,
      title: item.title ? item.title.replace(/\*\*/g, '') : '',
      reason: item.reason ? item.reason.replace(/\*\*/g, '') : '',
      priceRange: item.priceRange ? item.priceRange.replace(/\*\*/g, '') : '',
      purchaseAdvice: item.purchaseAdvice ? item.purchaseAdvice.replace(/\*\*/g, '') : ''
    }))
})

// 获取用户信息
const userInfo = computed(() => userInfoStore.getScenarioInfo('gift'))

// 计算是否有基本信息
const hasBasicInfo = computed(() => {
  return userInfo.value.recipient || userInfo.value.occasion || userInfo.value.budget || userInfo.value.interests
})

// 计算画像分析文本
const analysisText = computed(() => {
  const { recipient, occasion, interests } = userInfo.value
  
  if (!recipient) {
    return '正在分析收礼人画像...'
  }
  
  let analysis = `根据您提供的信息，"${recipient}" `
  if (interests) {
    analysis += `是一位热爱${interests}的`
  }
  if (occasion) {
    analysis += `，在${occasion}这个特殊的日子里，`
  }
  analysis += `我们为您推荐最适合的礼物品类。`
  
  return analysis
})

// 生成礼物建议
const generateGiftSuggestions = async (userInfo) => {
  if (!isComponentMounted.value) return
  
  try {
    isGeneratingSuggestions.value = true
    console.log('[ProfileCard] 开始生成礼物建议，用户信息:', userInfo)
    
    const suggestions = await giftRecommendationService.generateGiftSuggestions(userInfo)
    
    if (isComponentMounted.value) {
      giftSuggestions.value = suggestions
      console.log('[ProfileCard] 礼物建议生成成功:', suggestions)
    }
  } catch (error) {
    console.error('[ProfileCard] 生成礼物建议失败:', error)
    if (isComponentMounted.value) {
      // AI调用失败，清空建议
      giftSuggestions.value = []
    }
  } finally {
    if (isComponentMounted.value) {
      isGeneratingSuggestions.value = false
    }
  }
}

// 检查用户信息是否有足够内容生成建议
const hasEnoughInfoForSuggestions = (userInfo) => {
  const { recipient, occasion, budget, interests, searchQuery } = userInfo || {}
  return recipient || occasion || budget || interests || searchQuery
}

// 监听用户信息变化，实时更新画像和礼物建议
watch(userInfo, async (newUserInfo, oldUserInfo) => {
  try {
    // 检查组件是否仍然挂载
    if (!isComponentMounted.value) {
      console.log('[ProfileCard] 组件已卸载，跳过用户信息监听')
      return
    }
    
    console.log('[ProfileCard] 检测到用户信息变化，更新画像和礼物建议')
    
    // 检查是否有足够的信息生成建议
    if (hasEnoughInfoForSuggestions(newUserInfo)) {
      // 检查信息是否有实质性变化
      const oldRecipient = oldUserInfo?.recipient || ''
      const newRecipient = newUserInfo?.recipient || ''
      const oldInterests = oldUserInfo?.interests || ''
      const newInterests = newUserInfo?.interests || ''
      const oldBudget = oldUserInfo?.budget || ''
      const newBudget = newUserInfo?.budget || ''
      const oldSearchQuery = oldUserInfo?.searchQuery || ''
      const newSearchQuery = newUserInfo?.searchQuery || ''
      
      // 如果关键信息发生变化，重新生成建议
      if (newRecipient !== oldRecipient || 
          newInterests !== oldInterests || 
          newBudget !== oldBudget || 
          newSearchQuery !== oldSearchQuery) {
        console.log('[ProfileCard] 检测到关键信息变化，重新生成礼物建议')
        await generateGiftSuggestions(newUserInfo)
      }
    } else {
      // 信息不足，清空建议
      giftSuggestions.value = []
    }
  } catch (error) {
    console.error('[ProfileCard] 监听用户信息变化时出错:', error)
  }
}, { deep: true, immediate: false })

onMounted(async () => {
  isComponentMounted.value = true
  userInfoStore.loadFromStorage()
  
  // 延迟初始化，确保用户信息已加载
  setTimeout(async () => {
    if (isComponentMounted.value) {
      const currentUserInfo = userInfo.value
      if (hasEnoughInfoForSuggestions(currentUserInfo)) {
        console.log('[ProfileCard] 组件挂载，初始化礼物建议')
        await generateGiftSuggestions(currentUserInfo)
      }
    }
  }, 100)
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

.suggestion-item.simple {
  display: block;
  background: #fff;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 16px;
  margin-bottom: 8px;
}
.suggestion-item.simple:last-child {
  margin-bottom: 0;
  border-bottom: none;
}
.suggestion-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.suggestion-reason {
  font-size: 0.92rem;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.6;
}
.suggestion-details {
  font-size: 0.85rem;
  color: #888;
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.price-range {
  color: #FF9800;
  font-weight: 500;
}
.purchase-advice {
  font-style: normal;
}

.generating-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 6px;
  border: 1px solid #FFE082;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #FFE082;
  border-top: 2px solid #FF9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 