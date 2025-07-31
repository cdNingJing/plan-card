<template>
  <div class="understanding-system">
    <!-- 移动端界面容器 -->
    <div class="mobile-container">
      <!-- 侧边栏面板 - 记忆日志管理 -->
      <MemorySidebar 
        :is-open="sidebarOpen"
        :memories="memories"
        @close="closeSidebar"
        @add-memory="handleAddMemory"
        @edit-memory="handleEditMemory"
        @delete-memory="handleDeleteMemory"
        @update-memory="handleUpdateMemory"
      />

      <!-- 主界面 -->
      <div class="main-interface">
        <!-- 悬浮设置按钮 -->
        <button 
          v-if="!currentStep || currentStep === 'query'" 
          @click="openSidebar" 
          class="floating-settings"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 主内容区域 -->
        <main class="main-content">
          <div class="content-container">
            <!-- 首页欢迎界面 -->
            <section v-if="!currentStep || currentStep === 'query'" class="welcome-section">
              <div class="welcome-content">
                <div class="welcome-header">
                  <h1>用户流程系统</h1>
                  <p>系统化理解复杂问题的本质和相互关系</p>
                </div>
                
                <!-- 示例问题 -->
                <div class="example-questions" v-if="!userQuery">
                  <h3>试试这些问题</h3>
                  <div class="example-list">
                    <button 
                      v-for="example in exampleQuestions" 
                      :key="example.id"
                      @click="setExampleQuery(example.text)"
                      class="example-item"
                    >
                      {{ example.text }}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- 标签选择阶段 -->
            <section v-if="currentStep === 'tags'" class="tag-selection-section">
              <TagSelectionCards 
                :query="userQuery"
                :dynamic-tags="dynamicTagTitles"
                :ai-generated-data="aiGeneratedTagData"
                :is-generating-tags="isGeneratingTags"
                @complete="handleTagSelection"
                @timeout="handleTagTimeout"
                @tags-generated="handleTagsGenerated"
              />
            </section>

            <!-- 可能性展示卡片 -->
            <section v-if="currentStep === 'possibilities'" class="content-card">
              <PossibilityCards 
                :possibilities="possibilities"
                :selected-ids="selectedPossibilities"
                :is-loading="isLoading"
                :selected-tags="selectedTagsObjects"
                :current-query="userQuery"
                @generate-solutions="generateSolutions"
              />
            </section>

            <!-- 解决方案卡片 -->
            <section v-if="currentStep === 'solutions'" class="content-card">
              <SolutionCards 
                :solutions="solutions"
                :selected-context="getSelectedContext()"
                :allergy-foods="allergyFoods"
                :current-mood="currentMood"
                :current-query="userQuery"
                @reset-flow="resetFlow"
                @toggle-food-allergy="toggleFoodAllergy"
                @log-activity="logActivity"
                @log-mood="logMood"
                @set-reminder="setReminder"
                @open-medical-advice="openMedicalAdvice"
              />
            </section>
          </div>
        </main>

        <!-- 底部输入框 -->
        <BottomInputBox
          :current-state="getInputState()"
          v-model:query="userQuery"
          :display-text="userQuery"
          :selected-count="selectedPossibilities.length"
          :is-tags-mode="currentStep === 'tags'"
          @submit="handleQuerySubmit"
          @edit="handleEditQuery"
          @next="generateSolutions"
        />
      </div>
    </div>

    <!-- 记忆编辑模态框 -->
    <MemoryEditModal 
      :is-visible="!!editingMemory"
      :memory="editingMemory"
      @close="cancelEdit"
      @save="saveMemory"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MemorySidebar from '@/components/MemorySidebar.vue'
import QueryInput from '@/components/QueryInput.vue'
import TagSelectionCards from '@/components/TagSelectionCards.vue'
import PossibilityCards from '@/components/PossibilityCards.vue'
import SolutionCards from '@/components/SolutionCards.vue'
import MemoryEditModal from '@/components/MemoryEditModal.vue'
import BottomInputBox from '@/components/BottomInputBox.vue'
import aiApiService from '@/api/aiApi.js'

// 响应式数据
const sidebarOpen = ref(false)
const currentStep = ref('query')
const isLoading = ref(false)
const userQuery = ref('')
const memories = ref([])
const selectedTags = ref([])
const possibilities = ref([])
const selectedPossibilities = ref([])
const solutions = ref([])
const editingMemory = ref(null)
const allergyFoods = ref([])
const currentMood = ref('')
const dynamicTagTitles = ref({})
const isGeneratingTags = ref(false)
const aiGeneratedTagData = ref(null)

// 固定的可能性数据
const FIXED_POSSIBILITIES = [
  {
    id: 1,
    title: '睡眠质量与工作压力关联',
    description: '您的记忆显示，工作压力大的日子往往伴随着睡眠质量下降，这可能影响第二天的精力状态。'
  },
  {
    id: 2,
    title: '饮食习惯与情绪波动',
    description: '分析发现您的情绪低落期与某些食物摄入存在时间关联，可能存在食物不耐受问题。'
  },
  {
    id: 3,
    title: '社交活动与能量恢复',
    description: '数据表明适度的社交活动后您通常感觉精力充沛，但过度社交会导致疲劳感。'
  },
  {
    id: 4,
    title: '运动频率与整体状态',
    description: '运动较少的周期内，您更容易出现疲劳和情绪不稳定的情况。'
  }
]

// 固定的解决方案数据
const FIXED_SOLUTIONS = [
  {
    id: 1,
    type: 'allergy',
    icon: '🍎',
    title: '食物过敏追踪',
    description: '标记可能引起不适的食物，建立个人饮食档案',
    foods: ['乳制品', '麸质', '坚果', '海鲜', '咖啡因']
  },
  {
    id: 2,
    type: 'activity',
    icon: '🏃',
    title: '活动记录',
    description: '记录运动和休息情况，找到最佳节奏',
    activities: ['晨跑', '瑜伽', '散步', '深度睡眠']
  },
  {
    id: 3,
    type: 'mood',
    icon: '😊',
    title: '情绪追踪',
    description: '每日记录情绪状态，识别情绪模式',
    moods: [
      { emoji: '😊', label: '开心' },
      { emoji: '😐', label: '平静' },
      { emoji: '😔', label: '沮丧' },
      { emoji: '😴', label: '疲惫' },
      { emoji: '😤', label: '焦虑' }
    ]
  },
  {
    id: 4,
    type: 'reminder',
    icon: '⏰',
    title: '健康提醒',
    description: '设置定时提醒，养成健康习惯'
  }
]

// 计算选中标签的对象
const selectedTagsObjects = computed(() => {
  // 处理新的标签数据结构
  if (!selectedTags.value) return []
  
  // 如果是新的数据结构（包含 manualSelected 和 autoSelected）
  if (typeof selectedTags.value === 'object' && selectedTags.value.autoSelected) {
    const allTags = []
    
    // 添加自动选择的标签
    if (selectedTags.value.autoSelected) {
      allTags.push(...selectedTags.value.autoSelected.map(tag => ({
        id: tag.id,
        title: tag.title,
        isDefault: true
      })))
    }
    
    // 添加手动选择的标签（需要从 manualSelected ID 获取标题）
    if (selectedTags.value.manualSelected) {
      selectedTags.value.manualSelected.forEach(tagId => {
        const title = getTagTitleById(tagId)
        if (title) {  // 只添加有标题的标签
          allTags.push({
            id: tagId,
            title: title,
            isDefault: false
          })
        }
      })
    }
    
    return allTags
  }
  
  // 如果是旧的数组结构（向后兼容）
  if (Array.isArray(selectedTags.value)) {
    const validTags = []
    selectedTags.value.forEach(tagId => {
      const title = getTagTitleById(tagId)
      if (title) {  // 只添加有标题的标签
        validTags.push({
          id: tagId,
          title: title,
          isDefault: false
        })
      }
    })
    return validTags
  }
  
  return []
})

// 用户流程系统提示词
const USER_FLOW_SYSTEM_PROMPT = `
你是用户流程系统，一个专业的问题理解和分析系统。你的任务是根据用户的问题和他们的记忆日志，生成相关的理解维度标签。

作为用户流程系统，你具有以下特点：
- 能够深入理解用户的个人情况和历史记录
- 基于用户的记忆日志来提供个性化的分析角度
- 关注用户的成长轨迹和变化趋势
- 结合用户的实际经历来生成更有针对性的标签

你的能力范围包括：
1. 情绪与心理健康管理
2. 精力与时间管理
3. 目标设定与执行
4. 人际关系与社交技巧
5. 学习与成长方法
6. 工作与生活平衡
7. 习惯养成与行为改变
8. 未来规划与发展
9. 身体健康与生活方式
10. 创新思维与问题解决
11. 知识管理与思维框架
12. 个人价值与意义探索

分析指导原则：
- 优先考虑用户记忆日志中提到的具体情况和问题
- 根据用户的历史记录找出反复出现的主题和模式
- 结合用户的实际经历来生成更有针对性的标签
- 考虑用户的成长变化和发展趋势

请根据用户的问题和记忆日志，生成简洁清晰的内容。重要原则：

**内容要求：**
- 所有文字都要简洁明了，避免冗长复杂的表述
- 发展目标使用动词开头，4-8个字
- 已有技能/习惯用简短词汇，4-6个字
- 标签简洁明确，4-8个字
- 直接关联用户的问题和实际情况
- 体现个性化和针对性

**风格示例：**
- ✅ 具体明确：学Python编程、写技术博客、练英语口语、做副业项目
- ❌ 抽象模糊：探索跨学科知识、提升沟通力、构建知识框架
- ❌ 过于冗长：在未来2年内通过系统性学习成为全栈架构师并获得相关认证

**关键原则：**
- 用具体的技能、工具、行动代替抽象概念
- 让用户一看就知道要学什么、做什么
- 每个目标都应该是可立即执行的

请以JSON格式返回，格式如下：
{
  "tags": [
    {
      "id": 1,
      "title": "标签标题"
    }
  ]
}
`

// 根据ID获取标签标题的辅助函数
const getTagTitleById = (id) => {
  // 只使用动态生成的标签，不使用默认值
  if (dynamicTagTitles.value[id]) {
    return dynamicTagTitles.value[id]
  }
  
  // 如果没有找到，返回null（让系统直接进入下一步）
  return null
}

// 示例问题数据
const exampleQuestions = [
  {
    id: 1,
    text: "我想看看5年后的自己会是什么样"
  }
]

// 侧边栏控制
const openSidebar = () => sidebarOpen.value = true
const closeSidebar = () => sidebarOpen.value = false

// 记忆管理
const handleAddMemory = (newMemory) => {
  if (newMemory) {
    // 直接添加从侧边栏传来的记忆对象
    memories.value.push(newMemory)
    saveMemoriesToStorage()
  } else {
    // 打开模态框添加
    editingMemory.value = null
  }
}

const handleEditMemory = (memory) => {
  editingMemory.value = memory
}

const handleDeleteMemory = (id) => {
  memories.value = memories.value.filter(m => m.id !== id)
  saveMemoriesToStorage()
}

const handleUpdateMemory = ({ id, content }) => {
  const memory = memories.value.find(m => m.id === id)
  if (memory) {
    memory.content = content
    memory.updatedAt = new Date()
    saveMemoriesToStorage()
  }
}

const saveMemory = ({ content, memory }) => {
  if (memory) {
    // 编辑现有记忆
    memory.content = content
  } else {
    // 添加新记忆
    const newMemory = {
      id: Date.now(),
      content,
      timestamp: new Date()
    }
    memories.value.push(newMemory)
  }
  saveMemoriesToStorage()
}

const cancelEdit = () => {
  editingMemory.value = null
}

// 本地存储
const saveMemoriesToStorage = () => {
  localStorage.setItem('user-flow-system-memories', JSON.stringify(memories.value))
}

const loadMemoriesFromStorage = () => {
  const stored = localStorage.getItem('user-flow-system-memories')
  if (stored) {
    memories.value = JSON.parse(stored)
  }
}

// 构建包含记忆日志的系统提示词
const buildSystemPromptWithMemories = () => {
  let prompt = USER_FLOW_SYSTEM_PROMPT
  
  // 如果有记忆日志，添加到上下文中
  if (memories.value && memories.value.length > 0) {
    prompt += `\n\n## 用户记忆日志上下文\n`
    prompt += `以下是用户的历史记忆和思考记录，请结合这些信息来生成更个性化和相关的理解维度标签：\n\n`
    
    // 按时间倒序排列，最新的记录优先
    const sortedMemories = [...memories.value]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10) // 只取最近的10条记录，避免提示词过长
    
    sortedMemories.forEach((memory, index) => {
      const date = new Date(memory.timestamp).toLocaleDateString('zh-CN')
      prompt += `${index + 1}. [${date}] ${memory.content}\n`
    })
    
    prompt += `\n基于以上用户的个人记录和思考历史，请生成更贴合用户实际情况的理解维度标签。`
  }
  
  return prompt
}

// 生成动态标签和完整AI数据
const generateDynamicTags = async (query) => {
  if (!query || !query.trim()) return false
  
  try {
    isGeneratingTags.value = true
    console.log('🚀 开始生成动态标签为:', query)
    console.log('📝 包含记忆日志数量:', memories.value.length)
    
    const systemPrompt = buildSystemPromptWithMemories()
    
    // 构建完整的提示词，同时生成标签标题和发展维度数据
    const fullPrompt = `${systemPrompt}

用户问题："${query}"

请同时生成两部分内容：

1. 理解维度标签（供标签选择界面使用）
2. 发展维度分析（供卡片内容使用）

返回格式为JSON对象：
{
  "tags": [
    {
      "id": 1,
      "title": "标签标题"
    }
  ],
  "developmentAnalysis": {
    "existingSkills": [
      {
        "title": "已有技能或习惯",
        "isDefault": true
      }
    ],
    "developmentGoals": [
      {
        "title": "简短发展目标",
        "isDefault": false
      }
    ]
  }
}

重要要求：
- tags：3-6个简洁的理解维度标签，每个4-8个字
- existingSkills：2-3个已有技能/习惯，每个4-6个字
- developmentGoals：4-6个发展目标，每个目标必须：
  * 4-8个字，简洁明了但具体
  * 使用动词+具体对象的形式
  * 包含明确的行动或结果
  * 让用户一看就知道要做什么

**具体化示例对比：**
❌ 抽象模糊：探索跨学科知识、推动人性化科技、构建知识框架
✅ 具体明确：学Python编程、写技术博客、读心理学书、练英语口语、做副业项目、学设计软件

**更多具体示例：**
- 技能类：学Vue框架、练书法字、学摄影技巧、背英语单词
- 习惯类：每天跑步、写日记、早起习惯、冥想练习
- 项目类：做个人网站、开发小程序、写技术文章、录制课程

所有内容都要让用户看到就能立刻理解并采取行动。`
    
    const response = await aiApiService.sendMessage(fullPrompt)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content
      
      // 尝试解析完整的JSON响应
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          
          // 处理标签数据
          if (parsed.tags && Array.isArray(parsed.tags)) {
            const newTagTitles = {}
            parsed.tags.forEach((tag, index) => {
              newTagTitles[index + 1] = tag.title
            })
            dynamicTagTitles.value = newTagTitles
            console.log('✅ 动态标签生成成功:', newTagTitles)
          }
          
          // 处理发展维度数据
          if (parsed.developmentAnalysis) {
            aiGeneratedTagData.value = parsed.developmentAnalysis
            console.log('✅ AI发展维度数据生成成功:', parsed.developmentAnalysis)
          }
          
          return true
        }
      } catch (parseError) {
        console.warn('⚠️ JSON解析失败，尝试提取文本:', parseError)
      }
      
      // 如果JSON解析失败，尝试从文本中提取标签
      const lines = content.split('\n').filter(line => line.trim())
      const tagTitles = {}
      let tagIndex = 1
      
      for (const line of lines) {
        // 匹配各种可能的标签格式
        const tagMatch = line.match(/^\d+[\.）\s]+(.+)$/) || 
                       line.match(/^[\-\*\+]\s+(.+)$/) ||
                       line.match(/^“(.+)”$/) ||
                       line.match(/^(.{4,20})$/)
        
        if (tagMatch && tagIndex <= 6) {
          const title = tagMatch[1].trim().replace(/[“”"]/g, '')
          if (title.length >= 4 && title.length <= 20) {
            tagTitles[tagIndex] = title
            tagIndex++
          }
        }
      }
      
      if (Object.keys(tagTitles).length > 0) {
        dynamicTagTitles.value = tagTitles
        console.log('✅ 从文本提取标签成功:', tagTitles)
        return true
      }
    }
    
    console.warn('⚠️ 无法解析响应，使用默认标签')
    return false
    
  } catch (error) {
    console.error('❌ 生成动态标签失败:', error)
    return false
  } finally {
    isGeneratingTags.value = false
  }
}


// 处理标签生成完成
const handleTagsGenerated = (tagTitles) => {
  console.log('收到AI生成的标签映射:', tagTitles)
  // 更新动态标签标题映射
  dynamicTagTitles.value = { ...dynamicTagTitles.value, ...tagTitles }
}

// 处理标签选择完成
const handleTagSelection = (tags) => {
  console.log('收到标签选择结果:', tags)
  selectedTags.value = tags
  proceedToAnalysis()
}

// 处理标签选择超时
const handleTagTimeout = (tags) => {
  console.log('标签选择超时，收到结果:', tags)
  selectedTags.value = tags
  proceedToAnalysis()
}

// 进入分析阶段
const proceedToAnalysis = async () => {
  isLoading.value = true
  currentStep.value = 'possibilities'
  
  // 模拟分析过程
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 使用固定的可能性数据
  possibilities.value = [...FIXED_POSSIBILITIES]
  
  isLoading.value = false
}

// 可能性选择
const togglePossibility = (id) => {
  const index = selectedPossibilities.value.indexOf(id)
  if (index > -1) {
    selectedPossibilities.value.splice(index, 1)
  } else {
    selectedPossibilities.value.push(id)
  }
}

// 基于用户问题类型和选择标签生成个性化解决方案
const generateDynamicSolutions = () => {
  const dynamicSolutions = []
  const icons = ['🎯', '📚', '💪', '🧠', '❤️', '⚡', '🌟', '🚀', '💡', '🔧']
  
  // 检测问题类型
  const questionType = detectQuestionType(userQuery.value)
  
  selectedTagsObjects.value.forEach((tag, index) => {
    const solution = generatePersonalizedSolution(tag, questionType, index, icons)
    dynamicSolutions.push(solution)
  })
  
  return dynamicSolutions
}

// 检测用户问题类型
const detectQuestionType = (query) => {
  if (!query) return 'general'
  
  const queryLower = query.toLowerCase()
  if (queryLower.includes('5年') || queryLower.includes('未来') || queryLower.includes('将来')) {
    return 'future_vision'
  } else if (queryLower.includes('改变') || queryLower.includes('提升')) {
    return 'improvement'
  } else if (queryLower.includes('学习') || queryLower.includes('技能')) {
    return 'learning'
  }
  return 'general'
}

// 生成个性化解决方案
const generatePersonalizedSolution = (tag, questionType, index, icons) => {
  const templates = getSolutionTemplates(questionType)
  const template = templates[tag.title] || templates.default
  
  return {
    id: tag.id,
    type: 'future_action',
    icon: icons[index % icons.length],
    title: tag.title,
    questionType: questionType,
    futureVision: template.futureVision.replace('{tag}', tag.title),
    todayAction: template.todayAction.replace('{tag}', tag.title),
    milestones: template.milestones || [],
    isDefault: tag.isDefault || false,
    timeframe: '5年后',
    actionPeriod: '明天开始'
  }
}

// 获取不同问题类型的解决方案模板
const getSolutionTemplates = (questionType) => {
  const templates = {
    future_vision: {
      // 针对"5年后的自己"类型问题的模板
      'Python编程': {
        futureVision: '5年后，你将成为Python全栈开发专家，能够独立开发复杂的AI应用和企业级系统',
        todayAction: '明天开始每天写30分钟Python代码，从基础语法练习开始',
        milestones: ['3个月掌握基础语法', '6个月完成第一个项目', '1年开发Web应用', '2年学习AI框架', '5年成为技术专家']
      },
      '写技术博客': {
        futureVision: '5年后，你将拥有10万+读者的技术博客，成为行业内有影响力的技术写作者',
        todayAction: '明天开始写下第一篇技术总结，哪怕只有200字',
        milestones: ['1个月发布第一篇', '3个月建立写作习惯', '6个月获得首批读者', '1年达到1000订阅', '5年成为知名博主']
      },
      '学设计软件': {
        futureVision: '5年后，你将精通多种设计工具，能够创作出专业级的视觉作品',
        todayAction: '明天下载Figma或Photoshop，完成第一个简单的设计练习',
        milestones: ['1个月掌握基础工具', '3个月完成第一个作品', '6个月建立设计思维', '1年参与真实项目', '5年成为设计专家']
      },
      '读心理学书': {
        futureVision: '5年后，你将深度理解人性和心理机制，拥有卓越的人际交往和自我管理能力',
        todayAction: '明天开始读第一本心理学入门书，每天至少10页',
        milestones: ['3个月读完3本入门书', '6个月应用心理学原理', '1年深入专业领域', '2年帮助他人成长', '5年成为心理洞察专家']
      },
      '练英语口语': {
        futureVision: '5年后，你将能够流利地用英语进行商务谈判和学术交流',
        todayAction: '明天开始每天15分钟英语口语练习，可以从跟读开始',
        milestones: ['3个月建立发音基础', '6个月进行简单对话', '1年参与英语会议', '2年海外工作交流', '5年成为双语专家']
      },
      default: {
        futureVision: '5年后，你在{tag}领域将达到专业水平，成为这个领域的专家',
        todayAction: '明天开始每天投入30分钟学习{tag}相关知识',
        milestones: ['3个月入门', '6个月实践', '1年精进', '2年专业', '5年专家']
      }
    },
    improvement: {
      default: {
        futureVision: '通过持续改进，你将在{tag}方面取得显著提升',
        todayAction: '明天开始制定{tag}的改进计划',
        milestones: ['1个月开始改变', '3个月看到效果', '6个月形成习惯', '1年显著提升']
      }
    },
    learning: {
      default: {
        futureVision: '5年后，你将完全掌握{tag}这项技能',
        todayAction: '明天开始系统性学习{tag}',
        milestones: ['3个月入门', '6个月进阶', '1年熟练', '2年精通', '5年专家']
      }
    },
    general: {
      default: {
        futureVision: '通过坚持不懈的努力，你将在{tag}方面达到理想状态',
        todayAction: '明天开始采取第一步行动',
        milestones: ['开始行动', '持续坚持', '逐步改善', '达成目标']
      }
    }
  }
  
  return templates[questionType] || templates.general
}

// 生成解决方案
const generateSolutions = async () => {
  isLoading.value = true
  currentStep.value = 'solutions'
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 使用基于用户标签的动态解决方案数据
  solutions.value = generateDynamicSolutions()
  
  isLoading.value = false
}

// 获取选中的上下文
const getSelectedContext = () => {
  return selectedPossibilities.value.map(id => 
    possibilities.value.find(p => p.id === id)
  ).filter(Boolean)
}

// 交互式组件功能
const toggleFoodAllergy = (food) => {
  const index = allergyFoods.value.indexOf(food)
  if (index > -1) {
    allergyFoods.value.splice(index, 1)
  } else {
    allergyFoods.value.push(food)
  }
}

const logActivity = (activity) => {
  console.log('记录活动:', activity)
  // 这里可以实现具体的活动记录逻辑
}

const logMood = (mood) => {
  currentMood.value = mood.emoji
  console.log('记录情绪:', mood)
}

const setReminder = (solution) => {
  alert('提醒功能开发中...')
}

const openMedicalAdvice = () => {
  alert('建议咨询专业医生获取更详细的健康指导')
}

// 底部输入框相关方法
const getInputState = () => {
  if (currentStep.value === 'tags') {
    return 'display'
  } else if (currentStep.value === 'possibilities') {
    return 'next'
  } else if (currentStep.value === 'solutions' && userQuery.value) {
    return 'display'
  } else if (userQuery.value && currentStep.value !== 'query') {
    return 'display'
  } else {
    return 'input'
  }
}

const handleQuerySubmit = async (query) => {
  userQuery.value = query
  
  // 进入标签选择阶段
  currentStep.value = 'tags'
  
  // 立即开始生成AI数据
  await generateDynamicTags(query)
}

const handleEditQuery = () => {
  currentStep.value = 'query'
}

const setExampleQuery = async (text) => {
  userQuery.value = text
  
  // 进入标签选择阶段
  currentStep.value = 'tags'
  
  // 立即开始生成AI数据
  await generateDynamicTags(text)
}

// 重置流程
const resetFlow = () => {
  currentStep.value = 'query'
  userQuery.value = ''
  selectedTags.value = []
  possibilities.value = []
  selectedPossibilities.value = []
  solutions.value = []
  allergyFoods.value = []
  currentMood.value = ''
  dynamicTagTitles.value = {}
  aiGeneratedTagData.value = null
  isGeneratingTags.value = false
}

// 生命周期
onMounted(() => {
  loadMemoriesFromStorage()
})
</script>

<style scoped>
.understanding-system {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
}

.mobile-container {
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  background: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 主界面样式 */
.main-interface {
  flex: 1;
  min-height: 100vh;
  position: relative;
}

/* 悬浮设置按钮 */
.floating-settings {
  position: fixed;
  top: 24px;
  left: 24px;
  width: 44px;
  height: 44px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.floating-settings:hover {
  background: #f9f9f9;
  border-color: #d1d5db;
  color: #111111;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.floating-settings:active {
  transform: translateY(0);
}

/* 主内容区域 */
.main-content {
  min-height: 100vh;
  background: #fafafa;
  overflow-y: auto;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 24px 120px;
}

/* 欢迎界面样式 */
.welcome-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.welcome-header {
  margin-bottom: 48px;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.welcome-header h1 {
  margin: 0 0 12px 0;
  color: #111111;
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.welcome-header p {
  margin: 0;
  color: #6b7280;
  font-size: 18px;
  line-height: 1.6;
}

.example-questions {
  text-align: left;
}

.example-questions h3 {
  margin: 0 0 20px 0;
  color: #111111;
  font-size: 18px;
  font-weight: 600;
}

.example-list {
  display: grid;
  gap: 12px;
}

.example-item {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 15px;
  line-height: 1.5;
  font-style: italic;
}

.example-item:hover {
  background: #f9f9f9;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 标签选择阶段样式 */
.tag-selection-section {
  min-height: 60vh;
  padding-top: 40px;
}

/* 内容卡片样式 */
.content-card {
  /* background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); */
}


/* 响应式设计 */
@media (max-width: 768px) {
  .mobile-container {
    max-width: 100%;
  }
  
  .floating-settings {
    top: 16px;
    left: 16px;
    width: 40px;
    height: 40px;
  }
  
  .content-container {
    padding: 64px 16px 100px;
  }
  
  .welcome-header h1 {
    font-size: 36px;
  }
  
  .welcome-header p {
    font-size: 16px;
  }
  
  .welcome-icon {
    font-size: 64px;
  }
}

@media (max-width: 480px) {
  .floating-settings {
    top: 12px;
    left: 12px;
    width: 36px;
    height: 36px;
  }
  
  .floating-settings svg {
    width: 16px;
    height: 16px;
  }
  
  .content-container {
    padding: 56px 12px 90px;
  }
  
  .welcome-header h1 {
    font-size: 28px;
  }
  
  .welcome-header p {
    font-size: 14px;
  }
  
  .welcome-icon {
    font-size: 48px;
  }
  
  .example-item {
    padding: 16px;
    font-size: 14px;
  }
}
</style>