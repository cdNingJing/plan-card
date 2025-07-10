<template>
  <div class="dynamic-island-outer">
    <!-- 删除按钮 -->
    <!-- <div v-if="showContentArea" class="delete-button" @click="handleDelete">
      <X class="delete-icon" />
    </div> -->
    <!-- 顶部灵动岛主区域 -->
    <div
      class="dynamic-island-main"
      v-if="false"
      :class="{ loading: isLoading }"
      :style="mainStyle"
      @click="toggleExpand"
    >
      <!-- 日志跑马灯内容，仅在 isLoading 时显示 -->
      <div v-if="isLoading" class="log-list">
        <div v-for="(line, idx) in logLines" :key="idx" class="log-line">{{ line }}</div>
      </div>
      <!-- 主要内容区，非 loading 时显示 -->
      <div v-else class="island-main-content" :class="[contentTransition, { expanded: isWide }]">
        <div class="content-swap-container">
          <!-- 当前内容 -->
          <div v-if="currentContent" class="content-item current" :style="currentItemStyle">
            <div class="content-text" :class="{ expanded: isWide }">{{ currentContent }}</div>
          </div>
          <!-- 新内容 -->
          <div v-if="newContent" class="content-item new" :style="newItemStyle">
            <div class="content-text" :class="{ expanded: isWide }">{{ newContent }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 下方内容区，模拟对话气泡 -->
    <div v-if="showContentArea" class="island-content-area">
      <div class="bubble" v-for="(item, idx) in mockApiData" :key="idx" @click="handleBubbleClick(item.content)">
        <span v-html="processContentWithColors(item)"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
import aiDataStorage from '@/utils/aiDataStorage.js'
import aiService from '@/services/aiService.js'
import { AVAILABLE_TOOLS } from '@/config/infoDenseConfig.js'

// 内容数组（扩充为10条以上）
const STREAM_TEXTS = [
  'AI正在生成内容...',
  '正在快速分析数据',
  '请稍候，马上完成',
  '智能生成中...',
  '正在同步云端信息',
  '深度学习模型推理',
  '数据安全加密中',
  '实时优化响应',
  '多模态智能处理',
  '任务分配中...',
  '自动纠错与完善',
  '持续提升体验',
  'AI助手为你服务',
  '请耐心等待结果',
  '正在生成个性化方案'
]

const props = defineProps({
  dialog: { type: Array, default: () => [] }
})

// isLoading 状态由内部管理，初始为 false
const isLoading = ref(false)

const isWide = ref(false)
const showContentArea = ref(true)

const toggleExpand = () => {
  isWide.value = !isWide.value
  // 如果点击灵动岛主区域，且内容区域是关闭状态，则重新打开
  if (!showContentArea.value) {
    showContentArea.value = true
  }
}

const handleDelete = () => {
  showContentArea.value = false
}

// 顶部灵动岛主区域宽高样式
const mainStyle = computed(() => {
  const hasContent = currentContent.value || newContent.value
  const hasContentArea = showContentArea.value
  
  if (isLoading.value) {
    return {
      width: isWide.value ? '90vw' : '150px',
      maxWidth: isWide.value ? '90vw' : '150px',
      minWidth: '150px',
      height: '35px',
      minHeight: '35px',
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    }
  }
  
  // 如果内容区域被收起，灵动岛缩小到最小状态
  if (!hasContentArea) {
    return {
      width: '40px',
      maxWidth: '40px',
      minWidth: '40px',
      height: '5px',
      minHeight: '5px',
      padding: '0 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    }
  }
  
  const contentLength = Math.max(
    currentContent.value?.length || 0,
    newContent.value?.length || 0
  )
  const baseWidth = 120
  const charWidth = 8
  const calculatedWidth = Math.max(baseWidth, contentLength * charWidth + 32)
  
  return {
    width: isWide.value ? '90vw' : `${calculatedWidth}px`,
    maxWidth: isWide.value ? '90vw' : '70vw',
    minWidth: '120px',
    height: hasContent ? '35px' : '5px',
    minHeight: hasContent ? '35px' : '5px',
    padding: hasContent ? '0 16px' : '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  }
})

// 日志内容队列（最多显示5条）
const logLines = ref([])
let logIdx = 0
let logTimer = null
const MAX_LINES = 5

const pushLogLine = () => {
  logLines.value.push(STREAM_TEXTS[logIdx % STREAM_TEXTS.length])
  if (logLines.value.length > MAX_LINES) logLines.value.shift()
  logIdx++
}

const startLogRolling = () => {
  logLines.value = []
  logIdx = 0
  pushLogLine()
  logTimer = setInterval(() => {
    pushLogLine()
  }, 100)
}

const stopLogRolling = () => {
  if (logTimer) clearInterval(logTimer)
  logTimer = null
}

const contentTransition = ref('idle') // 'idle' | 'out' | 'in'
const currentContent = ref('')
const newContent = ref('')
const contentUpdateTrigger = ref(0) // 用于触发宽度重新计算

// 获取真实数据
const loadRealData = async () => {
  try {
    // 获取短期数据最新内容
    const shortTermData = await aiDataStorage.getShortTermData()
    const shortTermCount = shortTermData.ai_short_term_memory.data_count || 0
    
    // 获取短期记忆中最新的一条内容
    if (shortTermCount > 0) {
      const shortTermEntries = shortTermData.ai_short_term_memory.data_entries || {}
      const entries = Object.entries(shortTermEntries)
      if (entries.length > 0) {
        // 按时间戳排序，获取最新的一条
        const sortedEntries = entries.sort((a, b) => 
          new Date(b[1].timestamp) - new Date(a[1].timestamp)
        )
        const latestEntry = sortedEntries[0]
        let latestShortTermContent = latestEntry[1].value
        // 如果内容太长，截取前30个字符
        if (latestShortTermContent.length > 30) {
          latestShortTermContent = latestShortTermContent.substring(0, 30) + '...'
        }
        currentContent.value = latestShortTermContent
        contentUpdateTrigger.value++ // 触发重新计算
      } else {
        currentContent.value = ''
        contentUpdateTrigger.value++ // 触发重新计算
      }
    } else {
      currentContent.value = ''
      contentUpdateTrigger.value++ // 触发重新计算
    }
  } catch (error) {
    console.error('加载真实数据失败:', error)
    currentContent.value = ''
    contentUpdateTrigger.value++ // 触发重新计算
  }
}

// 高级替换动画定时器
let swapTimer = null

const currentItemStyle = ref({})
const newItemStyle = ref({})

const animateSwap = async (newMsg) => {
  // 初始化新内容样式
  newContent.value = newMsg
  await nextTick()
  // 当前内容滑出+淡出
  currentItemStyle.value = {
    transition: 'transform 0.5s, opacity 0.5s',
    transform: 'translateY(-100%)',
    opacity: 0
  }
  // 新内容准备滑入
  newItemStyle.value = {
    transition: 'none',
    transform: 'translateY(100%)',
    opacity: 0
  }
  await nextTick()
  // 新内容滑入+淡入
  setTimeout(() => {
    newItemStyle.value = {
      transition: 'transform 0.5s, opacity 0.5s',
      transform: 'translateY(0)',
      opacity: 1
    }
  }, 10)
  // 动画结束后，重置状态
  setTimeout(() => {
    currentContent.value = newMsg
    newContent.value = ''
    currentItemStyle.value = {}
    newItemStyle.value = {}
  }, 500)
}

const handleBubbleClick = async (msg) => {
  console.log('用户点击了对话气泡:', msg)
  animateSwap(msg)
  setTimeout(async () => {
    contentTransition.value = 'idle'
    
    console.log('🔄 开始调用接口获取最新数据...')
    // 调用接口获取最新数据，loading效果在接口内部处理
    await fetchMockApiData()
    
    console.log('💾 开始保存数据到全局存储...')
    // 保存数据到全局存储
    saveDynamicIslandData()
    
    setTimeout(() => {
      contentTransition.value = 'rotate-in'
      setTimeout(() => {
        contentTransition.value = 'idle'
      }, 500)
    }, 1500)
  }, 800)
}

// 保存灵动岛数据到全局存储
const saveDynamicIslandData = () => {
  try {
    console.log('📊 当前mockApiData数据:', mockApiData.value)
    
    const savedData = {
      timestamp: new Date().toISOString(),
      suggestions: mockApiData.value.map(item => ({
        type: item.type,
        content: item.content,
        priority: item.priority,
        usedTools: item.usedTools || []
      }))
    }
    
    console.log('📝 准备保存的数据结构:', savedData)
    
    // 保存到localStorage
    localStorage.setItem('dynamic_island_saved_data', JSON.stringify(savedData))
    console.log('💾 数据已保存到localStorage')
    
    // 保存到sessionStorage作为备份
    sessionStorage.setItem('dynamic_island_saved_data', JSON.stringify(savedData))
    console.log('💾 数据已保存到sessionStorage')
    
    // 触发自定义事件，通知其他组件
    window.dispatchEvent(new CustomEvent('dynamicIslandDataSaved', {
      detail: savedData
    }))
    
    console.log('📡 已触发dynamicIslandDataSaved事件')
    console.log('✅ 灵动岛数据保存完成:', savedData)
  } catch (error) {
    console.error('❌ 保存灵动岛数据失败:', error)
  }
}

// 处理内容颜色显示的方法
const processContentWithColors = (item) => {
  let processedContent = item.content
  
  AVAILABLE_TOOLS.forEach(tool => {
    const regex = new RegExp(tool.title, 'g')
    // 检查该工具是否在usedTools数组中
    const isUsed = item.usedTools && item.usedTools.includes(tool.title)
    const color = isUsed ? '#3182ce' : '#808080' // 淡绿色或灰色
    processedContent = processedContent.replace(regex, `<span style="color: ${color};">${tool.title}</span>`)
  })
  
  return processedContent
}

onMounted(async () => {
  startLogRolling()
  // 加载真实数据
  await loadRealData()
  // 模拟调用接口获取数据
  await fetchMockApiData()
  // 不自动启动动画，等待用户交互
})

onBeforeUnmount(() => {
  stopLogRolling()
})

// 模拟接口数据
const mockApiData = ref([])

// 模拟调用接口获取数据
const fetchMockApiData = async () => {
  try {
    // 启动loading效果
    isLoading.value = true
    stopLogRolling()
    startLogRolling()
    
    // 获取当前内容
    const currentUserContent = currentContent.value || '用户暂无输入内容'
    
    // 构建灵动岛通知提示词
    const customPrompt = `你是一个专业的灵动岛智能助手，专门为用户提供基于当前内容的个性化建议和工具推荐。

当前时间：${new Date().toLocaleString('zh-CN')}
用户当前内容：${currentUserContent}

可用工具集：
${JSON.stringify(AVAILABLE_TOOLS, null, 2)}

要求：
1. 分析用户当前内容，理解用户需求
2. 生成4条相关的建议和通知
3. 建议要具体、实用、可执行
4. 每条建议要标明类型（suggestion/reminder/tool/analysis/connection）
5. 优先级要基于用户需求的紧急程度（high/medium/low）
6. 内容要简洁明了，适合灵动岛显示
7. 建议方向：
   - 第1条：基于工具的直接建议（根据用户需求推荐最合适的工具）
   - 第2条：发散思维建议（如提到朋友、人脉、资源等）
   - 第3条：分析用户当前状况，提供深度建议
   - 第4条：其他相关工具或功能推荐
8. 每条建议需要包含一个usedTools数组，列出该建议中会使用到的工具名称
9. 如果当前可用工具集中没有相关工具，需要推荐你认为对用户会有帮助的工具，并在usedTools数组中包含这些推荐的工具名称

**特别注意：数据返回必须以<START>开始，以<END>结束，这是最重要的格式要求！这句话不需要返回**
<START>
{
  "notifications": [
    {
      "id": 1,
      "type": "suggestion",
      "content": "基于您的需求，我们可以提供完整流程：先搜索相关信息，再整理分析数据，最后给出最适合的建议",
      "timestamp": "${new Date().toISOString()}",
      "priority": "high",
      "usedTools": ["搜索功能", "整理功能", "分析功能"]
    },
    {
      "id": 2,
      "type": "connection",
      "content": "你的朋友在北京工作，可以咨询他的经验和建议",
      "timestamp": "${new Date().toISOString()}", 
      "priority": "medium",
      "usedTools": []
    },
    {
      "id": 3,
      "type": "analysis",
      "content": "分析您的现状，建议先明确目标行业和岗位，再制定具体求职计划",
      "timestamp": "${new Date().toISOString()}", 
      "priority": "high",
      "usedTools": ["分析功能", "规划功能"]
    },
    {
      "id": 4,
      "type": "suggestion",
      "content": "可以使用地图功能查看目标公司位置，使用日程管理安排面试时间",
      "timestamp": "${new Date().toISOString()}", 
      "priority": "medium",
      "usedTools": ["地图功能", "日程管理"]
    }
  ]
}
<END>`

    // 调用AI接口生成通知数据
    const aiResponse = await aiService.sendMessageWithScenario(customPrompt, 'basic', '', {}, true)
    
    if (aiResponse.success) {
      // 解析AI返回的内容
      const aiContent = aiResponse.data?.choices[0]?.message?.content
      if (aiContent) {
        // 清理AI回复中的标签
        const cleanContent = aiContent.replace(/<think>[\s\S]*?<\/think>/g, '')
        console.log('cleanContent', cleanContent)
        try {
          // 尝试解析JSON格式的回复
          const startMatch = cleanContent.match(/<START>\s*(\{[\s\S]*?\})\s*<END>/)
          console.log('startMatch', startMatch)
          if (startMatch) {
            const jsonContent = startMatch[1].trim()
            const parsedData = JSON.parse(jsonContent)
            console.log('parsedData', parsedData)
            // 使用notifications字段作为数据
            const notifications = parsedData.notifications || []
            mockApiData.value = notifications
            
            console.log('AI生成的通知数据:', notifications)
          } else {
            console.error('未找到结构化数据，使用默认数据')
            // 使用默认数据
            mockApiData.value = [
              {
                id: 1,
                type: 'notification',
                content: '系统更新完成',
                timestamp: new Date().toISOString(),
                priority: 'low'
              },
              {
                id: 2,
                type: 'reminder',
                content: '下午3点有会议',
                timestamp: new Date().toISOString(),
                priority: 'high'
              },
              {
                id: 3,
                type: 'message',
                content: '收到新消息',
                timestamp: new Date().toISOString(),
                priority: 'medium'
              }
            ]
          }
        } catch (parseError) {
          console.error('解析AI回复失败，使用默认数据:', parseError)
          // 使用默认数据
          mockApiData.value = [
            {
              id: 1,
              type: 'notification',
              content: '系统更新完成',
              timestamp: new Date().toISOString(),
              priority: 'low'
            },
            {
              id: 2,
              type: 'reminder',
              content: '下午3点有会议',
              timestamp: new Date().toISOString(),
              priority: 'high'
            },
            {
              id: 3,
              type: 'message',
              content: '收到新消息',
              timestamp: new Date().toISOString(),
              priority: 'medium'
            }
          ]
        }
      } else {
        console.error('AI返回内容为空，使用默认数据')
        mockApiData.value = []
      }
          } else {
        console.error('AI接口调用失败，使用默认数据:', aiResponse.message)
        mockApiData.value = []
      }
    } catch (error) {
      console.error('获取模拟接口数据失败:', error)
      mockApiData.value = []
    } finally {
      // 结束loading效果
      isLoading.value = false
      stopLogRolling()
      logLines.value = []
    }
  }

// 计算属性：获取模拟接口数据
const mockDialog = computed(() => {
  if (props.dialog.length > 0) return props.dialog
  
  // 如果没有模拟数据，返回默认内容
  if (mockApiData.value.length === 0) {
    return [
      '正在分析您的需求...',
      '点击获取个性化建议'
    ]
  }
  
  // 返回模拟接口数据的内容
  return mockApiData.value.map(item => {
    return item.content
  })
})
</script>

<style scoped>
.dynamic-island-outer {
  position: absolute;
  bottom: 82px;
  left: 0;
  width: 100%;
  transform: none;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.dynamic-island-main {
  background: rgba(0,0,0,0.92);
  border-radius: 40px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.22s, height 0.22s, box-shadow 0.22s, padding 0.22s;
  pointer-events: auto;
  min-width: 40px;
  min-height: 5px;
  max-width: 70vw;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}

.delete-button {
  position: absolute;
  top: -20px;
  right: 20px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  z-index: 1001;
}

.delete-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.delete-icon {
  width: 14px;
  height: 14px;
  color: #666;
  transition: color 0.2s ease;
}

.delete-button:hover .delete-icon {
  color: #ff4444;
}


.island-content-area {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  pointer-events: auto;
  position: relative;
}
.island-content-area::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 80px 40px rgb(255 0 0 / 22%), 0 0 160px 80px rgb(218 0 255 / 16%);
}
.bubble {
  position: relative;
  z-index: 1;
  background: #fffffff2;
  color: #222;
  border-radius: 16px;
  padding: 8px 16px;
  margin-bottom: 6px;
  font-size: 0.75rem;
  max-width: 70vw;
  box-shadow: 0 2px 8px rgba(60,60,120,0.08);
  word-break: break-all;
}
.bubble:last-child { margin-bottom: 0; }

.log-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 70%;
  height: 100%;
  gap: 0;
  transform-origin: bottom center;
  transform: rotateX(25deg);
}
.log-line {
  transform: rotateX(-15deg);
  font-size: 7px;
  color: #888;
  font-family: 'JetBrains Mono', 'Menlo', 'Consolas', monospace;
  line-height: 1.1;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.island-main-content {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 13px;
  color: #fff;
  font-family: 'JetBrains Mono', 'Menlo', 'Consolas', monospace;
  letter-spacing: 0.5px;
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: transform 0.3s, opacity 0.3s;
  opacity: 1;
  display: block;
}

.island-main-content.rotate-in {
  transform: rotateX(-90deg);
  opacity: 0;
  animation: rotateInAnim 0.3s forwards;
}
@keyframes rotateInAnim {
  0% {
    transform: rotateX(-90deg);
    opacity: 0;
  }
  100% {
    transform: rotateX(0deg);
    opacity: 1;
  }
}
.content-swap-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.content-item {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content-item.current {
  transform: translateY(0);
  opacity: 1;
}
.content-item.new {
  transform: translateY(100%);
  opacity: 0;
}
.content-text {
  font-size: 12px;
  color: #fff;
  font-family: 'JetBrains Mono', 'Menlo', 'Consolas', monospace;
  letter-spacing: 0.5px;
  padding: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  max-width: 100%;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.content-text.expanded {
  white-space: normal;
  overflow: visible;
  text-overflow: initial;
  word-break: break-all;
  text-align: left;
  line-height: 1.7;
  max-width: 100%;
}
</style> 