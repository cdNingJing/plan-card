<template>
  <div class="tips-card">
    <div class="tips-header">
      <h3>贴心提示</h3>
      <p class="tips-description">为您提供一些实用的建议和注意事项</p>
    </div>
    
    <div class="tips-content">
      <div 
        v-for="(tip, index) in personalizedTips" 
        :key="index"
        class="tip-item"
      >
        <div class="tip-icon">
          <span class="tip-number">{{ index + 1 }}</span>
        </div>
        <div class="tip-text">
          {{ tip }}
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

// 获取用户信息
const userInfo = computed(() => userInfoStore.getScenarioInfo('gift'))

// 监听用户信息变化，实时更新提示
watch(() => userInfoStore.getScenarioInfo('gift'), (newUserInfo) => {
  try {
    // 检查组件是否仍然挂载
    if (!isComponentMounted.value) {
      console.log('[TipsCard] 组件已卸载，跳过用户信息监听')
      return
    }
    
    // 触发计算属性重新计算
    console.log('[TipsCard] 检测到用户信息变化，更新提示')
  } catch (error) {
    console.error('[TipsCard] 监听用户信息变化时出错:', error)
  }
}, { deep: true, immediate: false })

onMounted(() => {
  isComponentMounted.value = true
  userInfoStore.loadFromStorage()
})

onUnmounted(() => {
  isComponentMounted.value = false
  console.log('[TipsCard] 组件已卸载，清理完成')
})

// 生成个性化提示
const personalizedTips = computed(() => {
  const tips = []
  const recipient = userInfo.value.recipient || ''
  const occasion = userInfo.value.occasion || ''
  const budget = userInfo.value.budget || ''
  const interests = userInfo.value.interests || ''
  
  // 基础提示
  tips.push('选择实用性强的礼物，考虑收礼人的日常使用频率')
  tips.push('注意礼物的包装精美程度，好的包装能增加礼物的价值感')
  
  // 根据收礼人关系给出建议
  if (recipient.includes('妈妈') || recipient.includes('母亲')) {
    tips.push('妈妈通常喜欢实用且贴心的礼物，考虑她的生活习惯和喜好')
    tips.push('可以选择一些能让她放松身心的礼物，如按摩器、香薰等')
  } else if (recipient.includes('爸爸') || recipient.includes('父亲')) {
    tips.push('爸爸通常喜欢实用性强、质量好的礼物')
    tips.push('可以考虑一些能体现关心和陪伴的礼物')
  } else if (recipient.includes('女朋友') || recipient.includes('女友')) {
    tips.push('女朋友的礼物要体现用心和浪漫，可以考虑个性化定制')
    tips.push('注意礼物的美观性和情感价值')
  } else if (recipient.includes('同事')) {
    tips.push('同事礼物要适中，避免过于贵重或过于私人化')
    tips.push('选择一些通用性强、适合办公环境的礼物')
  }
  
  // 根据场合给出建议
  if (occasion.includes('生日')) {
    tips.push('生日礼物要体现对收礼人的了解和关心')
  } else if (occasion.includes('母亲节') || occasion.includes('父亲节')) {
    tips.push('节日礼物要体现感恩和孝心，选择有意义的礼物')
  } else if (occasion.includes('结婚纪念日')) {
    tips.push('纪念日礼物要有纪念价值，可以考虑定制或收藏类礼物')
  }
  
  // 根据预算给出建议
  if (budget && budget.includes('500')) {
    tips.push('500元预算内可以选择一些精致的小礼物或实用工具')
  } else if (budget && budget.includes('1000')) {
    tips.push('1000元预算可以选择一些品质较好的电子产品或奢侈品')
  }
  
  // 根据兴趣给出建议
  if (interests.includes('园艺')) {
    tips.push('园艺爱好者喜欢实用的工具和美观的花盆')
    tips.push('考虑礼物的耐用性和实用性')
  } else if (interests.includes('阅读')) {
    tips.push('爱阅读的人喜欢书籍、电子阅读器或舒适的阅读环境')
  } else if (interests.includes('运动')) {
    tips.push('运动爱好者喜欢专业的运动装备和健身器材')
  }
  
  return tips.slice(0, 6) // 最多显示6条提示
})
</script>

<style scoped>
.tips-card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 20px;
}

.tips-header {
  margin-bottom: 20px;
}

.tips-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333333;
}

.tips-description {
  margin: 0;
  font-size: 0.875rem;
  color: #666666;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tip-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tip-number {
  color: #FFFFFF;
  font-size: 0.75rem;
  font-weight: 600;
}

.tip-text {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #666666;
  padding-top: 2px;
}
</style> 