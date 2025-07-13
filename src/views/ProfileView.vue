<template>
  <div class="profile-chat-root">
    <div class="profile-layout-container">
      <!-- 文档区域 - 70% -->
      <div class="documentation-section">
        <div class="documentation-header">
          <button class="search-btn" @click="startSearch">模拟检索全部文档</button>
          <button class="search-btn" @click="testPartyComponent1">为孩子举办生日派对</button>
          <button class="search-btn" @click="testRestaurantComponent">为妈妈的生日在19点预订公司附近的餐厅</button>
          <button class="ios-btn search-btn" @click="testIsland">测试灵动岛</button>
        </div>
        <DocumentationPanel ref="docPanelRef" />
      </div>
      <!-- 聊天区域 - 30% -->
      <div class="profile-chat-frame" style="position:relative;">
        <!-- 新灵动岛模块 -->
        <transition name="island-zoom-fade">
          <div v-if="showIsland" class="profile-dynamic-island dark island-row-mode">
            <span class="island-title dark island-doc-title" :title="currentDoc.name">{{ currentDoc.name }}</span>
            <div class="island-circle-progress small">
              <svg viewBox="0 0 40 40" class="circle-svg small">
                <circle
                  class="circle-bg"
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke-width="4"
                />
                <circle
                  class="circle-fg"
                  :class="{ 'no-transition': !circleTransition }"
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke-width="4"
                  :stroke-dasharray="100"
                  :stroke-dashoffset="100 - (animatedPercent || 0)"
                />
                <text x="20" y="23" text-anchor="middle" class="circle-text small">{{ animatedPercent || 0 }}%</text>
              </svg>
            </div>
          </div>
        </transition>
        <!-- 这里不再放灵动岛 -->
        <!-- <DynamicIsland :visible="showIsland" :docName="islandDocName" :percent="islandPercent" /> -->

        <!-- <DynamicIsland v-if="inputValue" /> -->
        <div class="profile-chat-history-card-wrapper">
          <!-- DynamicIslandCard 作为底层显示 -->
          <div class="dynamic-island-card-container" v-if="showDynamicIslandCard">
            <DynamicIslandCard :savedData="dynamicIslandData" :activeComponentNames="activeComponentNames" />
          </div>
          
          <!-- 历史对话卡片作为上层显示 -->
          <div
            class="profile-chat-history-card"
            :class="`history-${historyCardState}`"
            ref="historyCardRef"
          >
            <div class="profile-chat-history">
              <HistoryCard :messages="messages" :onToggleFull="toggleHistoryCardFull" :isFull="historyCardState === 'full'" :isLoading="isLoading" />
            </div>
          </div>
        </div>
        <div class="profile-chat-inputbar">
          <input
            v-model="inputValue"
            class="profile-chat-input"
            type="text"
            :placeholder="fixedPlaceholder"
            @keydown.enter="handleSubmit"
            @focus="onInputFocus"
            ref="inputRef"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '@/stores/historyStore'
import HistoryCard from '@/components/cards/HistoryCard.vue'
import DynamicIsland from '@/components/DynamicIsland.vue'
import DynamicIslandCard from '@/components/cards/DynamicIslandCard.vue'
import DocumentationPanel from '@/components/DocumentationPanel.vue'
import aiService from '@/services/aiService.js'
import aiDataStorage from '@/utils/aiDataStorage.js'
import { parseAIResponse } from '@/utils/aiResponseParser.js'
import { useDocumentScanStore } from '@/stores/documentScanStore.js'
import { useRestaurantStore } from '@/stores/restaurantStore'
import claudeApiService from '@/api/claudeApi.js'
import { SCENARIOS } from '@/config/scenarios.js'
import documentInfoService from '@/services/documentInfoService.js'

const historyStore = useHistoryStore()
const documentScanStore = useDocumentScanStore()
const restaurantStore = useRestaurantStore()
const { messages } = storeToRefs(historyStore)

const inputValue = ref('')
const chatMessagesRef = ref(null)

// 新增：loading 状态
const isLoading = ref(false)


// 新增：历史卡片显示状态
const historyCardState = ref('collapsed') // 'collapsed' | 'half' | 'full'

// 灵动岛相关变量
let progressTimer = null
const showDynamicIsland = ref(false)
const islandProgress = ref(0)
const islandState = ref('collapsed')
const islandStatusText = ref('处理中...')
const islandDescription = ref('AI 理解中：分析意图')
const islandResultType = ref('info')
const islandTitleText = ref('')
const islandConflictMessage = ref('')
const islandConflictSuggestions = ref([])
const islandResultMessage = ref('')
const islandNextStepText = ref('')

// 灵动岛相关状态 - 优化为支持多个文档
const showIsland = ref(false)
const islandDocuments = ref([]) // 存储多个文档信息
const currentDocumentIndex = ref(0) // 当前处理的文档索引
const islandPercent = ref(0)
let islandTimer = null
const documentScanTimes = ref({}) // 存储每个文档的实际扫描时间

// 计算当前文档的短名称
const currentDocumentName = computed(() => {
  if (islandDocuments.value.length === 0) return ''
  const currentDoc = islandDocuments.value[currentDocumentIndex.value]
  if (!currentDoc) return ''
  return currentDoc.name.length > 12 ? currentDoc.name.slice(0, 10) + '...' : currentDoc.name
})

// 计算总进度
const totalProgress = computed(() => {
  if (islandDocuments.value.length === 0) return 0
  const totalSteps = islandDocuments.value.length
  const completedSteps = currentDocumentIndex.value
  const currentStepProgress = islandPercent.value / 100
  return Math.round(((completedSteps + currentStepProgress) / totalSteps) * 100)
})

// 灵动岛显示状态
const islandDisplayState = computed(() => {
  if (islandDocuments.value.length === 0) return 'hidden'
  if (islandDocuments.value.length === 1) return 'single'
  return 'multiple'
})

// 计算当前文档的详细信息
const currentDoc = computed(() => islandDocuments.value[currentDocumentIndex.value] || { name: '', progress: 0 });

// 百分比动画显示
const animatedPercent = ref(0)
const circleTransition = ref(true);

async function animatePercentSmart(duration = 2500) {
  // 1. 禁用transition，归零
  circleTransition.value = false;
  animatedPercent.value = 0;
  await nextTick();
  // 强制reflow，确保SVG渲染为0
  const el = document.querySelector('.circle-fg');
  if (el) el.getBoundingClientRect();
  // 2. 启用transition，开始动画
  circleTransition.value = true;
  await nextTick();
  
  // 获取当前文档的实际扫描时间
  const currentDoc = islandDocuments.value[currentDocumentIndex.value];
  const actualDuration = documentScanTimes.value[currentDoc?.name] || duration;
  
  console.log(`开始扫描文档: ${currentDoc?.name}, 预计时间: ${actualDuration}ms`);
  
  // 3. 动画递增 - 与DocumentationPanel的扫描时间同步
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / actualDuration, 1);
    
    // 使用缓动函数使动画更自然
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const percent = Math.round(easeOutQuart * 100);
    
    animatedPercent.value = percent;
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      animatedPercent.value = 100;
      console.log(`文档扫描完成: ${currentDoc?.name}`);
      
      // 等待一小段时间后进入下一个文档
      setTimeout(() => {
        currentDocumentIndex.value++;
        if (currentDocumentIndex.value >= islandDocuments.value.length) {
          console.log('所有文档扫描完成');
          showIsland.value = false;
          islandDocuments.value = [];
          // 重置状态
          animatedPercent.value = 0;
          currentDocumentIndex.value = 0;
        } else {
          // 开始扫描下一个文档
          animatePercentSmart(actualDuration);
        }
      }, 500);
    }
  }
  requestAnimationFrame(step);
}

const processNextDocument = () => {
  if (currentDocumentIndex.value >= islandDocuments.value.length) {
    showIsland.value = false;
    islandDocuments.value = [];
    return;
  }
  
  // 获取当前文档的扫描时间
  const currentDoc = islandDocuments.value[currentDocumentIndex.value];
  const actualDuration = documentScanTimes.value[currentDoc?.name] || 2500;
  animatePercentSmart(actualDuration);
}

// 百分比动画监听（只在进度未满时同步动画）
watch(() => currentDoc.value.progress, (newVal) => {
  if (typeof newVal !== 'number' || newVal === 100) return;
  let start = animatedPercent.value
  let end = newVal
  let duration = 400 // ms
  let startTime = null
  function animatePercent(ts) {
    if (!startTime) startTime = ts
    const progress = Math.min((ts - startTime) / duration, 1)
    animatedPercent.value = Math.round(start + (end - start) * progress)
    if (progress < 1) {
      requestAnimationFrame(animatePercent)
    } else {
      animatedPercent.value = end
    }
  }
  requestAnimationFrame(animatePercent)
}, { immediate: true })

// 测试灵动岛 - 支持多个文档
const testIsland = () => {
  // 从DocumentationPanel获取真实的文档数据
  if (!docPanelRef.value || !docPanelRef.value.filteredDocuments) {
    console.log('无法获取文档数据')
    return
  }
  
  const realDocuments = docPanelRef.value.filteredDocuments
  if (realDocuments.length === 0) {
    console.log('没有可用的文档')
    return
  }
  
  // 使用真实文档数据
  const testDocuments = realDocuments.map((doc, index) => ({
    id: index + 1,
    name: doc.metadata?.title || doc.metadata?.source || `文档${index + 1}`,
    progress: 0
  }))
  
  // 根据文档类型和大小估算扫描时间 - 与DocumentationPanel保持一致
  const testScanTimes = {}
  testDocuments.forEach(doc => {
    const docName = doc.name
    // 根据文档名称估算扫描时间（毫秒）- 与DocumentationPanel的扫描时间同步
    if (docName.includes('.md') || docName.includes('.txt')) {
      testScanTimes[docName] = 1200 // 与DocumentationPanel的扫描时间一致
    } else if (docName.includes('.json')) {
      testScanTimes[docName] = 800 // 与DocumentationPanel的扫描时间一致
    } else {
      testScanTimes[docName] = 1500 // 与DocumentationPanel的扫描时间一致
    }
  })
  
  console.log('使用真实文档数据:', testDocuments)
  console.log('扫描时间配置:', testScanTimes)
  startDocumentProcessing(testDocuments, testScanTimes)
}

// 开始文档处理流程
const startDocumentProcessing = (documents, scanTimes = {}) => {
  islandDocuments.value = documents.map(doc => ({ ...doc, progress: 0 }))
  currentDocumentIndex.value = 0
  islandPercent.value = 0
  documentScanTimes.value = scanTimes
  showIsland.value = true
  
  // 开始处理第一个文档
  processNextDocument()
}

// 停止文档处理
const stopDocumentProcessing = () => {
  if (islandTimer) {
    clearInterval(islandTimer)
    islandTimer = null
  }
  showIsland.value = false
  islandDocuments.value = []
  currentDocumentIndex.value = 0
  islandPercent.value = 0
}

const onInputFocus = () => {
  if (historyCardState.value === 'collapsed') {
    historyCardState.value = 'half'
  }
}
const onInputBlur = () => {
  if (historyCardState.value === 'half') {
    historyCardState.value = 'collapsed'
  }
}
const toggleHistoryCardFull = () => {
  historyCardState.value = historyCardState.value === 'full' ? 'half' : 'full'
}

// 灵动岛卡片数据
const dynamicIslandData = ref({
  timestamp: new Date().toISOString(),
  suggestions: []
})
const showDynamicIslandCard = ref(false)
const activeComponentNames = ref([
  'AllergyFreeMenuCard',
  'NoVegetableMenuCard', 
  'PartyThemeCard',
  'PartyTimeCard',
  'ShoppingListCard'
])

const fixedPlaceholder = ref('输入您的问题...')

const loadDynamicIslandData = () => {
  try {
    let savedData = localStorage.getItem('dynamic_island_saved_data')
    if (savedData) {
      dynamicIslandData.value = JSON.parse(savedData)
      // showDynamicIslandCard.value = true
    }
  } catch (e) {
    // 忽略错误
  }
}

const historyCardRef = ref(null)
const inputRef = ref(null)
const docPanelRef = ref(null)

const handleGlobalClick = (e) => {
  if (
    historyCardRef.value?.contains(e.target) ||
    inputRef.value?.contains(e.target)
  ) {
    return
  }
  if (historyCardState.value === 'half') {
    historyCardState.value = 'collapsed'
  }
}

onMounted(() => {
  // 只在本地没有历史数据时发送欢迎消息
  const hasHistory = !!localStorage.getItem('chat_history');
  if (!hasHistory) {
    historyStore.addMessage({
      id: Date.now() + Math.random(),
      content: '欢迎来到聊天室！我是你的智能助手，很高兴为你服务。',
      type: 'bot'
    });
  }
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
  // 加载灵动岛数据
  loadDynamicIslandData()
  
  // 初始化文档扫描store
  documentScanStore.initializeDocuments()
  documentScanStore.watchForChanges()
  
  // 监听灵动岛数据保存事件
  console.log('🎯 ProfileView组件已挂载，开始监听dynamicIslandDataSaved事件')
  
  window.addEventListener('dynamicIslandDataSaved', (event) => {
    console.log('📨 ProfileView收到灵动岛数据保存事件:', event.detail)
    dynamicIslandData.value = event.detail
    showDynamicIslandCard.value = true
    console.log('🔄 灵动岛数据已更新，显示灵动岛卡片:', dynamicIslandData.value)
    
    // 自动切换到灵动岛卡片（第4张卡片，索引为3）
    setTimeout(() => {
      console.log('🎯 自动切换到灵动岛卡片')
      historyStore.setCurrentCardIndex(3)
    }, 100)
  })
  document.addEventListener('mousedown', handleGlobalClick)
});

onUnmounted(() => {
  historyStore.saveMessages()
  historyStore.saveCurrentCardIndex()
  
  // 清理灵动岛定时器
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (islandTimer) {
    clearInterval(islandTimer)
    islandTimer = null
  }
  document.removeEventListener('mousedown', handleGlobalClick)
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}



const addMessage = (content, type = 'user') => {
  historyStore.addMessage({
    id: Date.now() + Math.random(),
    content,
    type
  })
  scrollToBottom()
}

// 构建知识库上下文的方法
const buildKnowledgeContext = (bestMatch) => {
  const now = new Date()
  const currentTime = now.toTimeString().split(' ')[0]
  const toolsMarkdown = documentInfoService.getToolsMarkdown()
  
  // 基础提示词模板
  const basePrompt = `
你是一个富有创意和洞察力的AI助手，请用中文回答问题。当前时间：${currentTime}。

你的回答策略：
1. 理解用户真实意图：分析用户问题背后的真正需求，而不是简单回答表面问题
2. 智能信息使用：
   - 长期档案：仅在涉及用户偏好、习惯、关系等问题时使用，用于提供个性化建议
   - 短期记忆：用于理解当前对话的上下文关联性和连续性
3. 问题区分：
   - "你是谁"：询问AI的身份，应该介绍自己是AI助手
   - "我是谁"：询问用户身份，应该引导用户说明具体需求，不要直接输出个人信息
4. 对话连续性：当用户连续询问类似问题时，基于之前的对话上下文给出连贯的回答
5. 保护隐私：当用户询问身份时，不要直接输出完整个人信息，而是引导用户说明具体需求或通过提问了解意图
6. 提供价值：基于理解给出实用建议，而不是信息罗列
7. answer字段策略：只推荐一个最核心的观点或建议，避免多个选项

【可用服务工具】
当前系统提供以下服务工具：
${toolsMarkdown}

**强制要求：你必须严格按照以下<START>内容<END>格式返回，不能有任何其他内容！**
<START>
{
  "answer": "基于对用户意图的理解，通过1-2个简洁的引导性问题深入对话，避免冗长解释",
  "availableServices": ["服务工具名称1", "服务工具名称2"]
}
<END>

**格式要求说明：**
- answer 字段：返回对用户问题的回答
- availableServices 字段：返回可能用到的服务工具名称数组
  `.trim()
  
  if (bestMatch) {
    // 有匹配的知识库内容，添加知识库信息
    const knowledgeInfo = `
# 知识库上下文信息

## 文档标题
${bestMatch.metadata?.title || '无标题'}

## 文档来源
${bestMatch.metadata?.source || '未知来源'}

## 匹配分数
${bestMatch.score}

## 原始内容
${bestMatch.content}

## 内容类型
${bestMatch.metadata?.content_type || 'document'}

## 内容摘要
${bestMatch.metadata?.summary || '无摘要'}

## 抽取结果
${bestMatch.metadata?.entities || '无抽取结果'}

## 分析结果
${bestMatch.metadata?.analysis || '无分析结果'}

---
请基于以上知识库信息回答用户的问题。

${basePrompt}`
    
    return knowledgeInfo
  } else {
    // 没有匹配的知识库内容，直接返回基础提示词
    return basePrompt
  }
}

const handleSubmit = async () => {
  const value = inputValue.value.trim()
  console.log('value', value)
  if (value) {
    // 设置 loading 状态
    isLoading.value = true
    
    // 添加用户消息
    addMessage(value, 'user')
    inputValue.value = ''
    let bestMatch = null
    // 新增：调用DocumentationPanel的搜索方法
    try {
      if (docPanelRef.value && docPanelRef.value.searchInFirstCollection) {
        console.log('开始搜索知识库...')
        const searchResult = await docPanelRef.value.searchInFirstCollection(value, 10)
        console.log('知识库搜索结果:', searchResult)
        
        if (searchResult.success) {
          console.log(`在合集 "${searchResult.collectionName}" 中找到 ${searchResult.resultsCount} 条相关结果`)
          if (searchResult.data && searchResult.data.results && searchResult.data.results.length > 0) {
            console.log('搜索结果详情:', searchResult.data.results)
            
            // 新增：过滤出score大于40%且最大的文档
            const results = searchResult.data.results
            if (results && results.length > 0) {
              // 过滤出score大于40%的文档
              const filteredResults = results.filter(result => result.score > 0.4)
              
              if (filteredResults.length > 0) {
                // 按score降序排序，获取score最大的文档
                const sortedResults = filteredResults.sort((a, b) => b.score - a.score)
                bestMatch = sortedResults[0]
                console.log(`找到 ${filteredResults.length} 个相关度大于40%的文档，最高相关度: ${(bestMatch.score * 100).toFixed(1)}%`)
              } else {
                console.log('没有找到相关度大于40%的文档')
              }
            }
          }
        } else {
          console.log('知识库搜索失败:', searchResult.message)
        }
      } else {
        console.log('DocumentationPanel搜索方法不可用')
      }
    } catch (error) {
      console.error('调用知识库搜索时发生错误:', error)
    }
    console.log('bestMatch', bestMatch)
    
    // 新增：当bestMatch有值时，执行文档扫描和灵动岛动画
    if (bestMatch) {
      console.log('开始执行文档扫描和灵动岛动画...')
      
      // 1. 执行DocumentationPanel的文档扫描
      if (docPanelRef.value && docPanelRef.value.highlightDocumentsSequentially) {
        const docId = bestMatch.id || bestMatch.metadata?.descriptive_id
        if (docId) {
          console.log('开始扫描文档:', docId)
          docPanelRef.value.highlightDocumentsSequentially([docId])
        }
      }
      
      // 2. 启动灵动岛动画
      const docName = bestMatch.metadata?.title || bestMatch.metadata?.source || '相关文档'
      const scanTime = 1200 // 与DocumentationPanel扫描时间一致
      
      const islandDoc = {
        id: 1,
        name: docName,
        progress: 0
      }
      
      const scanTimes = {
        [docName]: scanTime
      }
      
      console.log('启动灵动岛动画:', islandDoc)
      startDocumentProcessing([islandDoc], scanTimes)
    }
    
    
    // 启动灵动岛流程
    // startDynamicIslandFlow()
    
    try {
      // 构建历史对话上下文
      const conversationHistory = historyStore.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      
      // 新增：整合bestMatch内容作为AI提示词
      let enhancedConversationHistory = [...conversationHistory]
      let knowledgeContext = buildKnowledgeContext(bestMatch)
      
      console.log('整合的知识库上下文:', knowledgeContext)

      
      // 第一步：使用 Claude API 进行基础对话
      const claudeResponse = await claudeApiService.multiTurnChat(enhancedConversationHistory, knowledgeContext)
      
      if (claudeResponse.success) {
        // 处理 Claude 回复
        const aiContent = claudeResponse?.data?.content?.[0]?.text || claudeResponse?.data?.content || ''

        // 使用公共方法解析AI响应
        const parsedData = parseAIResponse(aiContent)
        // 如果成功解析到数据，处理结构化响应
        if (parsedData) {
            // 第一步：先显示基础回答，保存extractedInfo到全局状态
            if (parsedData.answer) {
              // 保存extractedInfo到全局状态
              // if (parsedData.extractedInfo && Array.isArray(parsedData.extractedInfo)) {
              //   console.log('💾 保存extractedInfo到全局状态:', parsedData.extractedInfo)
              //   historyStore.setExtractedInfo(parsedData.extractedInfo)
              // } else {
              //   console.log('🗑️ 清空extractedInfo')
              //   historyStore.clearExtractedInfo()
              // }
              console.log('parsedData', parsedData)
              addMessage(parsedData.answer, 'bot')
            } else {
              // 如果没有answer字段，使用清理后的内容
              addMessage(cleanContent, 'bot')
            }

            // 处理可用服务工具信息
            if (parsedData.availableServices && Array.isArray(parsedData.availableServices)) {
              console.log('可用服务工具:', parsedData.availableServices)
              
              // 根据推荐的工具更新灵动岛卡片
              if (parsedData.availableServices.length > 0) {
                // 将工具名称转换为组件名称
                const componentMap = {
                  '提供无过敏菜单': 'AllergyFreeMenuCard',
                  '去除蔬菜菜单': 'NoVegetableMenuCard',
                  '派对主题推荐': 'PartyThemeCard',
                  '派对时间建议': 'PartyTimeCard',
                  '采购清单生成': 'ShoppingListCard',
                  '餐厅列表': 'RestaurantMatchCard',
                  '填写餐厅预订信息': 'RestaurantBookingCard'
                }
                
                const recommendedComponents = parsedData.availableServices
                  .map(service => componentMap[service])
                  .filter(component => component)
                
                if (recommendedComponents.length > 0) {
                  activeComponentNames.value = recommendedComponents
                  showDynamicIslandCard.value = true
                  dynamicIslandData.value = {
                    timestamp: new Date().toISOString(),
                    suggestions: [
                      { id: 1, text: '查看推荐工具' },
                      { id: 2, text: '了解更多服务' }
                    ]
                  }
                }
              }
            }
            
            // 处理长期数据和短期记忆
            if (parsedData.longTermData && parsedData.longTermData.trim()) {
              try {
                const timestamp = new Date().toISOString()
                const key = `ai_long_term_${timestamp}`
                const result = await aiDataStorage.saveLongTermData(key, parsedData.longTermData)
                if (result.success) {
                  console.log('长期数据保存成功:', result.message)
                } else {
                  console.error('长期数据保存失败:', result.message)
                }
              } catch (error) {
                console.error('保存长期数据时发生错误:', error)
              }
            }
            
            if (parsedData.shortTermMemory && parsedData.shortTermMemory.trim()) {
              console.log('短期记忆:', parsedData.shortTermMemory)
              try {
                const timestamp = new Date().toISOString()
                const key = `ai_short_term_${timestamp}`
                const result = await aiDataStorage.saveShortTermData(key, parsedData.shortTermMemory)
                if (result.success) {
                  console.log('短期记忆保存成功:', result.message)
                  // 保存成功后调用短期记忆摘要整理
                  try {
                    console.log('短期记忆总结已触发')
                  } catch (summaryError) {
                    console.error('触发短期记忆总结失败:', summaryError)
                  }
                } else {
                  console.error('短期记忆保存失败:', result.message)
                }
              } catch (error) {
                console.error('保存短期记忆时发生错误:', error)
              }
            }
          }
        
        console.log('Claude AI回复成功:', claudeResponse.data)
        
        // 完成灵动岛流程 - 成功状态
        completeDynamicIslandFlow('success', {
          message: 'AI 已成功处理您的请求',
          nextStepText: '查看结果'
        })
        
      } else {
        // 完成灵动岛流程 - 错误状态
        completeDynamicIslandFlow('conflict', {
          message: '抱歉，我现在无法回答您的问题，请稍后再试。',
          suggestions: [
            { id: 1, text: '重试' },
            { id: 2, text: '稍后处理' }
          ]
        })
        
        // 添加错误消息
        addMessage('抱歉，我现在无法回答您的问题，请稍后再试。', 'bot')
        console.error('Claude AI回复失败:', claudeResponse.error)
      }
    } catch (error) {
      // 完成灵动岛流程 - 网络错误状态
      completeDynamicIslandFlow('conflict', {
        message: '抱歉，发生了网络错误，请检查网络连接。',
        suggestions: [
          { id: 1, text: '重试' },
          { id: 2, text: '稍后处理' }
        ]
      })
      
      // 添加错误消息
      addMessage('抱歉，发生了网络错误，请检查网络连接。', 'bot')
      console.error('AI服务错误:', error)
    } finally {
      // 重置 loading 状态
      isLoading.value = false
      // 确保停止文档处理动画
      stopDocumentProcessing()
    }
    
    // 保持在当前卡片，不自动跳转到历史记录页面
  }
  // 打印全局历史消息
  console.log('历史消息：', historyStore.messages)
}







// 卡片label - 动态设置
const setCardLabels = () => {
  const baseLabels = ['聊天记录', '长期记忆', '短期记忆']
  if (showDynamicIslandCard.value) {
    baseLabels.push('灵动岛建议')
  }
  return baseLabels
}

// 灵动岛相关方法
const startDynamicIslandFlow = () => {
  // 重置状态
  islandProgress.value = 0
  islandState.value = 'collapsed'
  islandStatusText.value = '处理中...'
  islandDescription.value = 'AI 理解中：分析意图'
  islandResultType.value = 'info'
  
  // 显示灵动岛
  showDynamicIsland.value = true
  
  // 启动进度模拟
  startProgressSimulation()
}

const startProgressSimulation = () => {
  // 清除之前的定时器
  if (progressTimer) {
    clearInterval(progressTimer)
  }
  
  // 第一阶段：折叠态到半展开态
  setTimeout(() => {
    islandState.value = 'expanded'
    islandDescription.value = 'AI 理解中：分析意图'
  }, 500)
  
  // 模拟进度增长
  progressTimer = setInterval(() => {
    if (islandProgress.value < 90) {
      islandProgress.value += Math.random() * 15 + 5 // 5-20的随机增长
    }
  }, 300)
}

const completeDynamicIslandFlow = (resultType, data = {}) => {
  // 清除进度定时器
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  
  // 完成进度
  islandProgress.value = 100
  
  // 切换到全展开态
  setTimeout(() => {
    islandState.value = 'full'
    islandResultType.value = resultType
    
    if (resultType === 'conflict') {
      islandTitleText.value = '需要确认'
      islandConflictMessage.value = data.message || '检测到潜在冲突，请确认操作'
      islandConflictSuggestions.value = data.suggestions || [
        { id: 1, text: '确认继续' },
        { id: 2, text: '取消操作' }
      ]
    } else {
      islandTitleText.value = '处理完成'
      islandResultMessage.value = data.message || 'AI 已成功处理您的请求'
      islandNextStepText.value = data.nextStepText || '下一步'
    }
  }, 500)
}

const hideDynamicIsland = () => {
  showDynamicIsland.value = false
  islandProgress.value = 0
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const handleIslandSuggestion = (suggestion) => {
  console.log('用户选择了建议:', suggestion)
  hideDynamicIsland()
  
  // 根据建议执行相应操作
  if (suggestion.text === '确认继续') {
    // 继续执行操作
    console.log('用户确认继续操作')
  } else if (suggestion.text === '取消操作') {
    // 取消操作
    console.log('用户取消操作')
  } else if (suggestion.text === '重试') {
    // 重试操作
    console.log('用户选择重试')
    // 这里可以重新执行之前的操作
    setTimeout(() => {
      startDynamicIslandFlow()
    }, 500)
  } else if (suggestion.text === '稍后处理') {
    // 稍后处理
    console.log('用户选择稍后处理')
  }
}

const handleIslandNextStep = () => {
  console.log('用户点击下一步')
  hideDynamicIsland()
  // 这里可以添加下一步的具体逻辑
}

const handleIslandDismiss = () => {
  console.log('用户选择稍后处理')
  hideDynamicIsland()
}

// 文档扫描相关方法
const startSearch = () => {
  console.log('startSearch called')
  if (!docPanelRef.value) {
    console.log('docPanelRef.value 不存在')
    return
  }
  console.log('docPanelRef.value 存在')
  if (docPanelRef.value.startSearch) {
    console.log('startSearch 方法可用')
    docPanelRef.value.startSearch()
    console.log('startSearch 已调用')
  } else {
    console.log('startSearch 方法不可用')
  }
}

// 聚会测试组件方法
const testPartyComponent1 = () => {
  // 选中输入框
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
  // 先进行对话
  const userMessage = "为孩子举办生日派对"
  addMessage(userMessage, 'user')
  // 添加用户消息
  inputValue.value = ''

  // 扫描聚会人员统计.txt文档
  documentScanStore.startPartialScan([12]) // 扫描第4个文件（聚会人员统计.txt）
  
  // 扫描完成后返回消息
  setTimeout(() => {
    addMessage('参会人员已确认，正在分析更多数据。', 'bot')
    // 扫描聚会人员统计.txt文档
    documentScanStore.startPartialScan([13, 14, 15])
      setTimeout(() => {
        addMessage('深度分析已完成！正在生成卡片。', 'bot')
        
        setTimeout(() => {
          // 显示聚会相关的组件1
          activeComponentNames.value = [
            'PartyThemeCard',
            'PartyTimeCard',
            'ShoppingListCard',
            'AllergyFreeMenuCard',
            'NoVegetableMenuCard'
          ]
          showDynamicIslandCard.value = true
          dynamicIslandData.value = {
            timestamp: new Date().toISOString(),
            suggestions: [
              { id: 1, text: '查看聚会名单' },
              { id: 2, text: '导出人员统计' },
              { id: 3, text: '继续扫描更多文档' }
            ]
          }
          // 隐藏历史卡片
          historyCardState.value = 'collapsed'
          // 移除输入框选中效果
          if (inputRef.value) {
            inputRef.value.blur()
          }
        }, 1000)
        
      }, 3000)
  }, 3000)

  
}

const testRestaurantComponent = () => {
  // 选中输入框
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
  // 先进行对话
  const userMessage = "为妈妈的生日在19点预订公司附近的餐厅"
  addMessage(userMessage, 'user')
  // 添加用户消息
  inputValue.value = ''

  // 扫描聚会人员统计.txt文档
  documentScanStore.startPartialScan([6]) // 扫描第4个文件（聚会人员统计.txt）
  
  // 扫描完成后返回消息
  setTimeout(() => {
    addMessage('妈妈信息已确认，正在分析更多数据。', 'bot')
    // 扫描聚会人员统计.txt文档
    documentScanStore.startPartialScan([5, 3])
      setTimeout(() => {
        addMessage('深度分析已完成！正在生成卡片。', 'bot')
        
        setTimeout(() => {
          // 显示预订餐厅相关的组件
          activeComponentNames.value = [
            'RestaurantMatchCard',
            'RestaurantBookingCard'
          ]
          showDynamicIslandCard.value = true
          dynamicIslandData.value = {
            timestamp: new Date().toISOString(),
            suggestions: [
              { id: 1, text: '查看餐厅推荐' },
              { id: 2, text: '导出预订信息' },
              { id: 3, text: '生成用餐方案' }
            ]
          }
          // 隐藏历史卡片
          historyCardState.value = 'collapsed'
          // 移除输入框选中效果
          if (inputRef.value) {
            inputRef.value.blur()
          }
          
          // 完成灵动岛流程
          completeDynamicIslandFlow('success', {
            message: '餐厅匹配完成',
            nextStepText: '查看推荐'
          })
        }, 1000)
        
      }, 3000)
  }, 3000)
}




</script>

<style scoped>
.profile-chat-root {
  height: 100vh;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-layout-container {
  width: 100%;
  min-width: 1200px;
  height: 100vh;
  display: flex;
  align-items: stretch;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

.documentation-section {
  flex: 0 0 73%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.documentation-header {
  padding: 20px 30px 10px 30px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-btn, .test-btn, .auto-test-btn {
  padding: 4px 18px;
  border-radius: 18px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  backdrop-filter: blur(8px);
  transition: box-shadow 0.2s, background 0.2s;
  cursor: pointer;
}

.test-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  padding: 2px;
  box-shadow: 0 2px 12px 0 rgba(245, 158, 11, 0.08);
}

.test-input {
  flex: 1;
  min-width: 200px;
  padding: 4px 12px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  background: transparent;
  outline: none;
  color: #f59e0b;
  font-weight: 500;
}

.test-input::placeholder {
  color: #f59e0b;
  opacity: 0.6;
}

.test-input:focus {
  background: rgba(254, 243, 199, 0.3);
}

.search-btn {
  background: linear-gradient(90deg, #e0e7ff 0%, #f3f4f6 100%);
  color: #6366f1;
  box-shadow: 0 2px 12px 0 rgba(99,102,241,0.08);
}

.search-btn:hover {
  box-shadow: 0 4px 18px 0 rgba(99,102,241,0.15);
  background: linear-gradient(90deg, #d1d5db 0%, #e5e7eb 100%);
}

.test-btn {
  background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%);
  color: #f59e0b;
  box-shadow: 0 2px 12px 0 rgba(245,158,11,0.08);
}

.test-btn:hover {
  box-shadow: 0 4px 18px 0 rgba(245,158,11,0.15);
  background: linear-gradient(90deg, #fde68a 0%, #fcd34d 100%);
}

.auto-test-btn {
  background: linear-gradient(90deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  box-shadow: 0 2px 12px 0 rgba(5,150,105,0.08);
}

.auto-test-btn:hover {
  box-shadow: 0 4px 18px 0 rgba(5,150,105,0.15);
  background: linear-gradient(90deg, #a7f3d0 0%, #6ee7b7 100%);
}

.party-test-btn {
  background: linear-gradient(90deg, #fce7f3 0%, #fbcfe8 100%);
  color: #ec4899;
  box-shadow: 0 2px 12px 0 rgba(236,72,153,0.08);
}

.party-test-btn:hover {
  box-shadow: 0 4px 18px 0 rgba(236,72,153,0.15);
  background: linear-gradient(90deg, #fbcfe8 0%, #f9a8d4 100%);
}

.restaurant-test-btn {
  background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%);
  color: #f59e0b;
  box-shadow: 0 2px 12px 0 rgba(245,158,11,0.08);
}

.restaurant-test-btn:hover {
  box-shadow: 0 4px 18px 0 rgba(245,158,11,0.15);
  background: linear-gradient(90deg, #fde68a 0%, #fcd34d 100%);
}

.profile-chat-frame {
  flex: 0 0 35%;
  height: 100%;
  max-width: 400px;
}

.profile-chat-frame {
  border-radius: 36px;
  background: #fff;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 120, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
}



.profile-chat-history-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: stretch;
  max-height: calc(100% - 90px);
  align-items: flex-end;
}

.dynamic-island-card-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 20px;
  z-index: 1;
  pointer-events: none;
}

.dynamic-island-card-container > * {
  pointer-events: auto;
}



.profile-chat-history-card {
  margin: 18px 18px 0 18px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 120, 0.10);
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
  position: relative;
  transition: height 0.3s, max-height 0.3s, min-height 0.3s;
  height: 0;
  max-height: 0;
  min-height: 0;
}
.profile-chat-history-card.history-collapsed {
  height: 0;
  max-height: 0;
  min-height: 0;
  padding: 0;
}
.profile-chat-history-card.history-half {
  height: 50%;
  max-height: 50%;
  min-height: 120px;
  padding: 0;
}
.profile-chat-history-card.history-full {
  height: calc(100% - 20px);
  max-height: calc(100% - 20px);
  min-height: calc(100% - 20px);
  padding: 0;
}

.profile-chat-history {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 18px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 28px;
}

.profile-chat-history.history-collapsed {
  max-height: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  transition: max-height 0.3s, min-height 0.3s, padding 0.3s;
}
.profile-chat-history.history-half {
  max-height: 140px;
  min-height: 60px;
  overflow-y: auto;
  transition: max-height 0.3s, min-height 0.3s, padding 0.3s;
}
.profile-chat-history.history-full {
  max-height: 500px;
  min-height: 120px;
  overflow-y: auto;
  transition: max-height 0.3s, min-height 0.3s, padding 0.3s;
}

.profile-chat-inputbar {
  display: flex;
  align-items: center;
  padding: 18px 18px 18px 18px;
  gap: 12px;
  flex-shrink: 0;
}

.profile-chat-input {
  flex: 1;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #f5f7fa 60%, #e0e7ff 100%);
  padding: 18px 20px;
  font-size: 0.8125rem;
  outline: none;
  color: #222;
  box-shadow: 0 2px 12px 0 rgba(60, 60, 120, 0.10), 0 1.5px 0 0 #e5e7eb;
  transition: box-shadow 0.18s, background 0.18s;
  font-weight: 500;
}

.profile-chat-input:focus {
  background: linear-gradient(135deg, #e0e7ff 60%, #c7d2fe 100%);
  box-shadow: 0 4px 18px 0 rgba(60, 60, 120, 0.18), 0 2px 0 0 #474747;
  color: #111;
}

.profile-chat-send {
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.profile-chat-send:disabled {
  background: #e5e7eb;
  color: #aaa;
  cursor: not-allowed;
}

.history-toggle-btn {
  margin: 0 0 8px 0;
  padding: 2px 14px;
  border-radius: 12px;
  border: none;
  background: #e0e7ff;
  color: #6366f1;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.history-toggle-btn:hover {
  background: #c7d2fe;
}

.profile-dynamic-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 120px;
  max-width: 200px;
  height: 32px;
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(24,24,28,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 0 14px;
  border: 1.5px solid #23232a;
  transition: box-shadow 0.2s, background 0.2s;
  pointer-events: none;
}
.profile-dynamic-island.dark {
  background: rgba(24,24,28,0.96);
  border: 1.5px solid #23232a;
  box-shadow: 0 2px 12px 0 rgba(24,24,28,0.22);
}
.island-title {
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.island-title.dark {
  color: #bfcfff;
}
.island-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
}
.progress-bar-bg {
  width: 38px;
  height: 5px;
  background: #e0e7ff;
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-bg.dark {
  background: #23232a;
}
.progress-bar-fg {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(.4,0,.6,1);
}
.progress-bar-fg.dark {
  background: linear-gradient(90deg, #bfcfff 0%, #6366f1 100%);
}
.progress-text {
  font-size: 11px;
  color: #6366f1;
  font-weight: 500;
  min-width: 22px;
  text-align: right;
}
.progress-text.dark {
  color: #bfcfff;
}
.island-fade-enter-active, .island-fade-leave-active {
  transition: opacity 0.25s;
}
.island-fade-enter-from, .island-fade-leave-to {
  opacity: 0;
}
.island-zoom-fade-enter-active, .island-zoom-fade-leave-active {
  transition: opacity 0.22s, transform 0.22s;
}
.island-zoom-fade-enter-from, .island-zoom-fade-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* 多文档灵动岛样式 */
.profile-dynamic-island.multiple {
  min-width: 160px;
  max-width: 280px;
  height: 40px;
  padding: 0 16px;
}

.island-single-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.island-multiple-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 4px;
}

.island-docs-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.island-doc-counter {
  font-size: 10px;
  color: #6366f1;
  font-weight: 500;
  opacity: 0.8;
}

.island-doc-counter.dark {
  color: #bfcfff;
}

.island-docs-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
}

.doc-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.doc-indicator.completed {
  background: #10b981;
  transform: scale(1.2);
}

.doc-indicator.current {
  background: #6366f1;
  transform: scale(1.4);
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
}

.doc-indicator.pending {
  background: rgba(99, 102, 241, 0.2);
  transform: scale(0.8);
}

/* 文档名称切换动画 */
.document-name-fade-enter-active,
.document-name-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.document-name-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.document-name-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 灵动岛状态切换动画 */
.profile-dynamic-island.single {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.profile-dynamic-island.multiple {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

/* 进度条动画优化 */
.progress-bar-fg {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.6, 1);
  position: relative;
  overflow: hidden;
}

.progress-bar-fg::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.progress-bar-fg.dark {
  background: linear-gradient(90deg, #bfcfff 0%, #6366f1 100%);
}

.progress-bar-fg.dark::after {
  background: linear-gradient(90deg, transparent, rgba(191, 207, 255, 0.2), transparent);
}

.island-circle-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  max-width: 180px;
  padding: 10px 0;
}

.island-circle-progress {
  width: 54px;
  height: 54px;
  margin-bottom: 4px;
  position: relative;
}

.circle-svg {
  width: 54px;
  height: 54px;
  display: block;
}

.circle-bg {
  stroke: #23232a;
  opacity: 0.18;
}

.circle-fg {
  stroke: #bfcfff;
  transition: stroke-dashoffset 0.5s cubic-bezier(.4,0,.6,1);
  stroke-linecap: round;
}
.circle-fg.no-transition {
  transition: none !important;
}

.circle-text {
  font-size: 13px;
  fill: #bfcfff;
  font-weight: bold;
  dominant-baseline: middle;
}

.island-doc-label {
  margin-top: 2px;
  text-align: center;
  max-width: 110px;
  font-size: 13px;
  color: #bfcfff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.island-row-mode {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-width: 60px;
  max-width: 110px;
  width: 100%;
  padding: 4px 4px 4px 10px;
  box-sizing: border-box;
}

.island-doc-title {
  font-size: 11px;
  color: #bfcfff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
  min-width: 0;
}

.island-circle-progress.small {
  width: 22px;
  height: 22px;
  margin-bottom: 0;
  margin-left: 4px;
  flex-shrink: 0;
}

.circle-svg.small {
  width: 20px;
  height: 20px;
}

.circle-text.small {
  font-size: 9px;
}

@media (max-width: 1200px) {
  
  .documentation-section {
    flex: 0 0 73%;
  }
  
  .profile-chat-frame {
    flex: 0 0 35%;
    max-width: none;
  }
}



@media (max-width: 600px) {

  .documentation-section {
    flex: 0 0 50%;
  }
  
  .profile-chat-frame {
    flex: 0 0 50%;
    border-radius: 20px;
  }
  
  .profile-chat-root, .profile-chat-frame {
    width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}
</style> 