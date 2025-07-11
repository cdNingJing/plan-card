<template>
  <div class="profile-chat-root">
    <div class="profile-layout-container">
      <!-- 文档区域 - 70% -->
      <div class="documentation-section">
        <div class="documentation-header">
          <button class="search-btn" @click="startSearch">模拟检索全部文档</button>
          <button class="search-btn" @click="testPartyComponent1">为孩子举办生日派对</button>
          <button class="search-btn" @click="testRestaurantComponent">为妈妈的生日在19点预订公司附近的餐厅</button>
        </div>
        <DocumentationPanel />
      </div>
      <!-- 聊天区域 - 30% -->
      <div class="profile-chat-frame">
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
              <HistoryCard :messages="messages" :onToggleFull="toggleHistoryCardFull" :isFull="historyCardState === 'full'" />
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
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

const historyStore = useHistoryStore()
const documentScanStore = useDocumentScanStore()
const restaurantStore = useRestaurantStore()
const { messages } = storeToRefs(historyStore)

const inputValue = ref('')
const chatMessagesRef = ref(null)

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

const handleSubmit = async () => {
  const value = inputValue.value.trim()
  console.log('value', value)
  if (value) {
    // 添加用户消息
    addMessage(value, 'user')
    inputValue.value = ''
    
    // 启动灵动岛流程
    // startDynamicIslandFlow()
    
    try {
      // 构建历史对话上下文
      const conversationHistory = historyStore.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      
      // 调用AI服务，使用简单场景调用方法，传递历史对话上下文
      const response = await aiService.sendMessageWithScenario(value, 'basic', '', {
        conversationHistory: conversationHistory
      })
      
      if (response.success) {
        // 处理AI回复
        const aiContent = response?.data?.choices[0]?.message?.content

        // 使用公共方法解析AI响应
        const parsedData = parseAIResponse(aiContent)

        // 如果成功解析到数据，处理结构化响应
        if (parsedData) {
            // 第一步：先显示基础回答，保存extractedInfo到全局状态
            if (parsedData.answer) {
              // 保存extractedInfo到全局状态
              if (parsedData.extractedInfo && Array.isArray(parsedData.extractedInfo)) {
                console.log('💾 保存extractedInfo到全局状态:', parsedData.extractedInfo)
                historyStore.setExtractedInfo(parsedData.extractedInfo)
              } else {
                console.log('🗑️ 清空extractedInfo')
                historyStore.clearExtractedInfo()
              }
              
              addMessage(parsedData.answer, 'bot')
            } else {
              // 如果没有answer字段，使用清理后的内容
              addMessage(cleanContent, 'bot')
            }
            
                          // 第二步：如果有相关文档，进行深度文档查询
              if (parsedData.relevantDocuments && Array.isArray(parsedData.relevantDocuments) && parsedData.relevantDocuments.length > 0) {
                console.log('相关文档:', parsedData.relevantDocuments)
                
                // 添加正在读取相关文档的固定提示信息
                addMessage('正在读取相关文档...', 'bot')
                
                // 调用文档查询
                try {
                  const docResponse = await aiService.queryWithDocuments(value, parsedData.relevantDocuments)
                
                  if (docResponse.success) {
                    // 删除"正在读取相关文档..."消息
                    const lastMessage = historyStore.messages[historyStore.messages.length - 1]
                    if (lastMessage && lastMessage.content === '正在读取相关文档...') {
                      historyStore.messages.pop()
                    }
                    
                    // 添加基于文档的详细回答
                    addMessage(docResponse.content, 'bot')
                  } else {
                    // 如果文档查询失败，删除提示消息
                    const lastMessage = historyStore.messages[historyStore.messages.length - 1]
                    if (lastMessage && lastMessage.content === '正在读取相关文档...') {
                      historyStore.messages.pop()
                    }
                    addMessage('抱歉，无法获取相关文档信息，请稍后再试。', 'bot')
                  }
                } catch (error) {
                  console.error('文档查询失败:', error)
                  const lastMessage = historyStore.messages[historyStore.messages.length - 1]
                  if (lastMessage && lastMessage.content === '正在读取相关文档...') {
                    historyStore.messages.pop()
                  }
                  addMessage('抱歉，文档查询过程中出现错误。', 'bot')
                }
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
        
        console.log('AI回复成功:', response.data)
        
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
        console.error('AI回复失败:', response.error)
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
  documentScanStore.startScan()
  
  // 模拟全量扫描完成后发送固定消息
  setTimeout(() => {
    const scanCompleteMessage = "文档扫描已完成！\n\n已成功扫描全部文档，发现以下关键信息：\n\n• 项目配置文件完整\n• 组件结构清晰\n• 数据流设计合理\n• 文档覆盖全面\n\n建议：您可以查看灵动岛卡片获取更详细的分析结果。"
    addMessage(scanCompleteMessage, 'bot')
  }, 5000) // 5秒后模拟全量扫描完成
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