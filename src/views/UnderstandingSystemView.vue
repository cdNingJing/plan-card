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
                <div class="example-questions">
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
                @cards-order-finalized="handleCardsOrderFinalized"
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
                :is-loading="isLoading"
                :possibility-cards-order="possibilityCardsOrder"
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
const detectedScenario = ref(null) // 检测到的场景类型
const possibilityCardsOrder = ref([]) // 存储可能性卡片的最终顺序

// 场景类型定义
const SCENARIO_TYPES = {
  PLAN_ENDING: 'plan_ending',     // 计划结局（未来规划类）
  COGNITIVE_BREAKTHROUGH: 'cognitive_breakthrough', // 认知突破
  PERCEPTION_EXPANSION: 'perception_expansion',     // 感知扩张  
  PERSONALITY_RESHAPE: 'personality_reshape',       // 人格重塑
  MEMORY_RECONSTRUCTION: 'memory_reconstruction',   // 记忆重构
  SOUL_CONNECTION: 'soul_connection',               // 灵魂连接
  GENERAL_ANALYSIS: 'general_analysis'              // 通用分析
}

// 增强的场景分析函数
const analyzeScenario = (query) => {
  if (!query || !query.trim()) return SCENARIO_TYPES.GENERAL_ANALYSIS
  
  const queryLower = query.toLowerCase()
  console.log('🔍 正在分析问题场景:', query)
  
  // 多维度场景检测权重系统
  const scenarioScores = {
    [SCENARIO_TYPES.PLAN_ENDING]: 0,
    [SCENARIO_TYPES.COGNITIVE_BREAKTHROUGH]: 0,
    [SCENARIO_TYPES.PERCEPTION_EXPANSION]: 0,
    [SCENARIO_TYPES.PERSONALITY_RESHAPE]: 0,
    [SCENARIO_TYPES.MEMORY_RECONSTRUCTION]: 0,
    [SCENARIO_TYPES.SOUL_CONNECTION]: 0
  }
  
  // 1. 计划结局场景关键词匹配
  const planEndingKeywords = [
    { word: '5年', weight: 3 }, { word: '年后', weight: 3 }, { word: '未来', weight: 2 },
    { word: '将来', weight: 2 }, { word: '以后', weight: 2 }, { word: '规划', weight: 2 },
    { word: '愿景', weight: 2 }, { word: '目标', weight: 1 }, { word: '梦想', weight: 2 },
    { word: '想象', weight: 1 }, { word: '设想', weight: 1 }, { word: '展望', weight: 2 }
  ]
  
  // 2. 认知突破场景关键词匹配
  const cognitiveKeywords = [
    { word: '困住', weight: 3 }, { word: '阻碍', weight: 3 }, { word: '难以推进', weight: 4 },
    { word: '创业计划', weight: 2 }, { word: '瓶颈', weight: 2 }, { word: '障碍', weight: 2 },
    { word: '卡住', weight: 2 }, { word: '进展缓慢', weight: 2 }, { word: '停滞', weight: 2 },
    { word: '突破', weight: 1 }, { word: '困惑', weight: 1 }
  ]
  
  // 3. 感知扩张场景关键词匹配
  const perceptionKeywords = [
    { word: '观察力', weight: 4 }, { word: '发现', weight: 2 }, { word: '生活的美', weight: 4 },
    { word: '重新发现', weight: 3 }, { word: '感受力', weight: 2 }, { word: '美感', weight: 2 },
    { word: '敏感度', weight: 2 }, { word: '洞察', weight: 2 }, { word: '细节', weight: 1 },
    { word: '审美', weight: 2 }, { word: '体验', weight: 1 }
  ]
  
  // 4. 人格重塑场景关键词匹配
  const personalityKeywords = [
    { word: '自律', weight: 3 }, { word: '果断', weight: 3 }, { word: '领导力', weight: 3 },
    { word: '成为一个', weight: 2 }, { word: '改变自己', weight: 2 }, { word: '提升自己', weight: 2 },
    { word: '性格', weight: 2 }, { word: '品格', weight: 2 }, { word: '习惯', weight: 1 },
    { word: '自控', weight: 2 }, { word: '意志力', weight: 2 }, { word: '执行力', weight: 2 }
  ]
  
  // 5. 记忆重构场景关键词匹配
  const memoryKeywords = [
    { word: '回忆', weight: 3 }, { word: '出不来', weight: 4 }, { word: '活在', weight: 3 },
    { word: '某段', weight: 2 }, { word: '过去', weight: 2 }, { word: '往事', weight: 2 },
    { word: '纠结', weight: 2 }, { word: '放不下', weight: 3 }, { word: '忘不了', weight: 3 },
    { word: '释怀', weight: 2 }, { word: '痛苦', weight: 1 }
  ]
  
  // 6. 灵魂连接场景关键词匹配
  const connectionKeywords = [
    { word: '共振', weight: 4 }, { word: '同频', weight: 4 }, { word: '内心', weight: 2 },
    { word: '连接', weight: 2 }, { word: '灵魂', weight: 3 }, { word: '知音', weight: 3 },
    { word: '理解我', weight: 2 }, { word: '懂我', weight: 2 }, { word: '共鸣', weight: 3 },
    { word: '深度交流', weight: 2 }, { word: '精神伙伴', weight: 3 }
  ]
  
  // 计算各场景得分
  const keywordSets = [
    { keywords: planEndingKeywords, scenario: SCENARIO_TYPES.PLAN_ENDING },
    { keywords: cognitiveKeywords, scenario: SCENARIO_TYPES.COGNITIVE_BREAKTHROUGH },
    { keywords: perceptionKeywords, scenario: SCENARIO_TYPES.PERCEPTION_EXPANSION },
    { keywords: personalityKeywords, scenario: SCENARIO_TYPES.PERSONALITY_RESHAPE },
    { keywords: memoryKeywords, scenario: SCENARIO_TYPES.MEMORY_RECONSTRUCTION },
    { keywords: connectionKeywords, scenario: SCENARIO_TYPES.SOUL_CONNECTION }
  ]
  
  keywordSets.forEach(({ keywords, scenario }) => {
    keywords.forEach(({ word, weight }) => {
      if (queryLower.includes(word)) {
        scenarioScores[scenario] += weight
        console.log(`🎯 关键词匹配: "${word}" -> ${scenario} (+${weight})`)
      }
    })
  })
  
  // 找出得分最高的场景
  const maxScore = Math.max(...Object.values(scenarioScores))
  if (maxScore > 0) {
    const detectedScenario = Object.keys(scenarioScores).find(
      scenario => scenarioScores[scenario] === maxScore
    )
    console.log('✅ 场景分析结果:', scenarioScores)
    console.log('🏆 最终检测场景:', detectedScenario, '(得分:', maxScore, ')')
    return detectedScenario
  }
  
  // 如果没有匹配到特定场景，返回通用分析
  console.log('✅ 检测到场景: 通用分析')
  return SCENARIO_TYPES.GENERAL_ANALYSIS
}

// 根据场景类型生成对应的系统行为描述
const getScenarioSystemBehavior = (scenarioType) => {
  const behaviors = {
    [SCENARIO_TYPES.PLAN_ENDING]: `
## 🎯 未来愿景·计划结局引擎
作为时间线规划系统，我将：
1. **构建详细未来蓝图**：基于你的问题描绘5年后的具体生活场景和专业状态
2. **逆向分解行动路径**：从目标终点开始，精确设计每个关键节点的行动计划
3. **即时行动启动器**：提供明天就能开始执行的具体第一步行动
4. **进度里程碑设计**：建立可量化的成功指标和阶段性检查点`,

    [SCENARIO_TYPES.COGNITIVE_BREAKTHROUGH]: `
## 🔍 认知思维盲区检测仪
作为深度心理分析系统，我需要：
1. **识别隐藏性信念障碍**：分析你的语言模式、情绪表达、行为习惯，识别潜意识中的自我设限信念
2. **揭示未意识到的内在障碍**：可能是"我配不上成功"、"我不够聪明"、"成功会带来负担"等深层信念
3. **提供突破性洞察**：不是告诉你该怎么做，而是让你看见连自己都没意识到的思维模式
4. **重构认知框架**：帮你建立支持成功的新信念系统`,

    [SCENARIO_TYPES.PERCEPTION_EXPANSION]: `
## 👁️ 感知扩张训练师
作为感知力提升系统，我将：
1. **重新训练观察模式**：引导你以诗意+科学双重视角重新观看日常事物
2. **激活感受力**：发现街道建筑中的文化密码、情绪氛围、隐藏之美
3. **扩展感知维度**：从视觉到听觉、触觉、直觉的全方位感知训练
4. **重燃生活热情**：让你重新爱上世界，发现平凡中的不平凡`,

    [SCENARIO_TYPES.PERSONALITY_RESHAPE]: `
## 🏆 人格镜像·勇气引擎
作为人格重塑系统，我将：
1. **精准分析性格短板**：识别当前人格与目标人格之间的具体差距
2. **设计微习惯重构**：制定带有反馈机制的行为改变日程
3. **激活内在勇气**：通过渐进式挑战唤醒你的潜在领导力
4. **建立新身份认同**：帮你从"想成为"转变为"我就是"的身份转换`,

    [SCENARIO_TYPES.MEMORY_RECONSTRUCTION]: `
## 🎬 记忆裁缝
作为记忆重构系统，我将：
1. **识别情绪锚点**：分析该回忆中的核心情绪触发点（被否定、被遗弃、被伤害）
2. **重写记忆叙述**：从不同角度重新解读那段经历，发现其中的成长意义
3. **情感释放疗愈**：通过新的叙述版本，让你以旁观者视角重新审视过去
4. **重构身份认知**：修复"你是谁"的源代码，建立更健康的自我认知`,

    [SCENARIO_TYPES.SOUL_CONNECTION]: `
## 🌐 共鸣网络·灵魂连接器
作为情感共鸣系统，我将：
1. **深度人格画像**：基于价值观、兴趣、情绪状态构建你的内在映射
2. **共鸣匹配算法**：识别与你内心频率一致的灵魂伙伴特征
3. **建立连接桥梁**：提供与同频者交流的话题、方式和平台建议
4. **创造深度对话**：打破表面社交，直达心灵深处的真实连接`,

    [SCENARIO_TYPES.GENERAL_ANALYSIS]: `
## 🧠 智能分析系统
作为通用问题分析系统，我将：
1. **多角度问题解构**：从不同维度深入分析你的问题本质
2. **个性化解决方案**：基于你的具体情况提供针对性建议
3. **系统性思维框架**：帮你建立解决问题的完整思维模型
4. **可执行行动计划**：将分析结果转化为具体可行的改进方案`
  }
  
  return behaviors[scenarioType] || behaviors[SCENARIO_TYPES.GENERAL_ANALYSIS]
}

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

// 标签生成系统提示词
const TAG_GENERATION_SYSTEM_PROMPT = `
你是标签生成系统，专门负责理解用户问题并生成相关的分析维度标签。

## 核心职责
根据用户的问题和记忆日志，生成3-6个简洁明确的理解维度标签，用于后续的深度分析。

## 分析能力范围
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

## 标签生成原则
- 每个标签4-8个字，简洁明确
- 直接关联用户的核心问题
- 基于用户的记忆日志提供个性化角度
- 避免抽象概念，使用具体表述
- 让用户一看就明白分析维度

## 输出格式
请以JSON格式返回：
{
  "tags": [
    {
      "id": 1,
      "title": "标签标题"
    }
  ]
}
`

// 解决方案生成系统提示词
const SOLUTION_GENERATION_SYSTEM_PROMPT = `
你是解决方案生成系统，专业的个人发展规划师和深度心理分析师。你的任务是为用户制定坚定、具体、可执行的行动计划。

## 核心能力
- 深度心理分析和认知重构
- 个人发展路径规划
- 具体行动方案设计
- 成功指标设定

## 分析方法
1. 基于用户问题识别核心需求
2. 结合记忆日志了解个人背景
3. 考虑可能性卡片的重要性顺序
4. 制定递进式发展计划

## 输出要求
为每个发展方向生成包含以下4个部分的详细行动计划：

### 1. 5年后愿景 (futureVision)
- 描述具体的专业水平和成就
- 包含具体的数字指标（收入、影响力、项目数量等）
- 使用确定性语言："你将成为..."而不是"你可能..."
- 长度：100-150字

### 2. 明天行动 (todayAction)  
- 必须是明天就能立即执行的具体行动
- 强调"立即开始"、"马上行动"等坚定语气
- 避免"收集资源"类建议，直接说要做什么
- 使用行动导向的动词：创建、写出、打开、练习
- 长度：80-120字

### 3. 执行计划 (executionPlan)
时间节点：第1个月、第3个月、第6个月、第1年
每个阶段包含：
- title: 阶段核心目标，使用坚定语气
- description: 该阶段要达成的具体成果
- actions: 4个具体的行动项，使用"完成"、"掌握"、"建立"等确定性动词

### 4. 成功指标 (successMetrics)
- 5个可量化、可验证的成果指标
- 使用"您将..."开头，给用户确定感
- 包含具体数字和专业水平描述
- 体现真实的职业价值和个人成长

## 语调要求
- 坚定、确信的语气，不用"可能"、"建议"等词汇
- 直接告诉用户要做什么，而不是建议收集什么
- 使用第二人称"您"、"你"，增强针对性
- 强调持续行动和专业成长
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
  },
  {
    id: 2,
    text: "我连续写创业计划，但始终难以推进，感觉被什么困住了"
  },
  {
    id: 3,
    text: "我总觉得我的观察力不够，想重新发现生活的美"
  },
  {
    id: 4,
    text: "我想成为一个自律、果断、有领导力的人"
  },
  {
    id: 5,
    text: "我一直活在某段回忆里出不来"
  },
  {
    id: 6,
    text: "我想找到和我内心共振的人"
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

// 构建标签生成的专用提示词
const buildTagGenerationPrompt = (query, scenarioType = null) => {
  let prompt = TAG_GENERATION_SYSTEM_PROMPT
  
  // 如果检测到特定场景，添加场景专用的分析角度
  if (scenarioType && scenarioType !== SCENARIO_TYPES.GENERAL_ANALYSIS) {
    const scenarioBehavior = getScenarioSystemBehavior(scenarioType)
    prompt += `\n\n## 场景特化分析\n基于问题场景类型"${scenarioType}"，请从以下角度生成标签：\n${scenarioBehavior}`
  }
  
  // 如果有记忆日志，添加到上下文中
  if (memories.value && memories.value.length > 0) {
    prompt += `\n\n## 用户记忆日志上下文\n`
    prompt += `以下是用户的历史记忆和思考记录，请结合这些信息来生成更个性化的理解维度标签：\n\n`
    
    // 按时间倒序排列，最新的记录优先
    const sortedMemories = [...memories.value]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10) // 只取最近的10条记录，避免提示词过长
    
    sortedMemories.forEach((memory, index) => {
      const date = new Date(memory.timestamp).toLocaleDateString('zh-CN')
      prompt += `${index + 1}. [${date}] ${memory.content}\n`
    })
    
    prompt += `\n请基于以上用户的个人记录生成贴合实际情况的分析标签。`
  }
  
  prompt += `\n\n用户问题："${query}"\n\n请生成3-6个理解维度标签。`
  
  return prompt
}

// 生成动态标签和完整AI数据
const generateDynamicTags = async (query) => {
  if (!query || !query.trim()) return false
  
  try {
    isGeneratingTags.value = true
    console.log('🚀 开始生成动态标签为:', query)
    console.log('📝 包含记忆日志数量:', memories.value.length)
    console.log('🎯 当前场景类型:', detectedScenario.value)
    
    // 使用专门的标签生成提示词
    const tagPrompt = buildTagGenerationPrompt(query, detectedScenario.value)
    
    // 构建完整的提示词，同时生成标签标题和发展维度数据
    const fullPrompt = `${tagPrompt}

同时请生成发展维度分析数据（供后续界面使用）：

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

// 处理可能性卡片顺序确定
const handleCardsOrderFinalized = (orderedCards) => {
  console.log('收到最终可能性卡片顺序:', orderedCards)
  possibilityCardsOrder.value = orderedCards
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
const generateDynamicSolutions = async () => {
  console.log('🎯 开始生成解决方案，场景类型:', detectedScenario.value)
  
  // 对于计划结局场景，生成特殊的计划结局解决方案
  if (detectedScenario.value === SCENARIO_TYPES.PLAN_ENDING) {
    console.log('🚀 生成计划结局类型解决方案')
    return await generatePlanEndingSolutions()
  }
  
  // 优先尝试使用AI生成动态内容
  const aiSolutions = await generateDynamicSolutionsFromAI(
    userQuery.value, 
    selectedTagsObjects.value, 
    memories.value
  )
  
  if (aiSolutions && aiSolutions.length > 0) {
    console.log('✅ 使用AI生成的动态解决方案')
    return aiSolutions
  }
  
  // AI失败时使用基于场景的静态方案
  console.log('📋 使用基于场景的静态解决方案')
  return generateScenarioBasedSolutions()
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
const generatePersonalizedSolution = (tag, scenarioType, index, icons) => {
  // 根据场景类型获取对应的解决方案类型
  let solutionType = 'future_action'
  
  if (scenarioType === SCENARIO_TYPES.PLAN_ENDING) {
    solutionType = 'plan_ending'
  } else if (scenarioType === SCENARIO_TYPES.COGNITIVE_BREAKTHROUGH) {
    solutionType = 'cognitive_breakthrough'
  } else if (scenarioType === SCENARIO_TYPES.PERCEPTION_EXPANSION) {
    solutionType = 'perception_expansion'
  } else if (scenarioType === SCENARIO_TYPES.PERSONALITY_RESHAPE) {
    solutionType = 'personality_reshape'
  } else if (scenarioType === SCENARIO_TYPES.MEMORY_RECONSTRUCTION) {
    solutionType = 'memory_reconstruction' 
  } else if (scenarioType === SCENARIO_TYPES.SOUL_CONNECTION) {
    solutionType = 'soul_connection'
  }
  
  // 获取场景对应的模板
  const templates = getSolutionTemplates(scenarioType)
  const template = templates[tag.title] || templates.default
  
  return {
    id: tag.id,
    type: solutionType,
    icon: icons[index % icons.length],
    title: tag.title,
    scenarioType: scenarioType,
    futureVision: template.futureVision.replace('{tag}', tag.title),
    todayAction: template.todayAction.replace('{tag}', tag.title),
    milestones: template.milestones || [],
    isDefault: tag.isDefault || false,
    timeframe: '5年后',
    actionPeriod: '明天开始'
  }
}

// 构建解决方案生成的专用提示词
const buildSolutionGenerationPrompt = (userQuery, selectedTags, userMemories) => {
  let prompt = SOLUTION_GENERATION_SYSTEM_PROMPT
  
  // 使用场景分析系统获取系统行为
  const scenarioType = detectedScenario.value || analyzeScenario(userQuery)
  if (scenarioType && scenarioType !== SCENARIO_TYPES.GENERAL_ANALYSIS) {
    const specialSystemBehavior = getScenarioSystemBehavior(scenarioType)
    prompt += `\n\n## 场景特化分析\n基于问题场景类型"${scenarioType}"，请采用以下专业分析方式：\n${specialSystemBehavior}`
  }
  
  // 添加用户背景信息
  if (userMemories && userMemories.length > 0) {
    prompt += `\n\n## 用户背景信息\n`
    userMemories.slice(0, 5).forEach((memory, index) => {
      prompt += `${index + 1}. ${memory.content}\n`
    })
  }
  
  // 添加可能性卡片顺序信息
  if (possibilityCardsOrder.value && possibilityCardsOrder.value.length > 0) {
    prompt += `\n\n## 可能性展示卡片的最终顺序（按重要性排列）\n`
    possibilityCardsOrder.value.forEach((card, index) => {
      prompt += `${index + 1}. ${card.title} - ${card.description}\n`
    })
    prompt += `\n请按照此顺序的重要性来安排解决方案的优先级和详细程度。`
  }
  
  prompt += `\n\n## 任务要求\n用户问题：${userQuery}\n用户选择的发展方向：${selectedTags.map(tag => tag.title).join('、')}`
  
  return prompt
}

// 调用AI接口生成动态解决方案
const generateDynamicSolutionsFromAI = async (userQuery, selectedTags, userMemories) => {
  try {
    console.log('🤖 开始调用AI生成动态解决方案')
    
    const basePrompt = buildSolutionGenerationPrompt(userQuery, selectedTags, userMemories)
    
    // 添加具体的输出格式要求
    const fullPrompt = `${basePrompt}

## 输出格式要求
为每个发展方向生成JSON格式的数据：

\`\`\`json
{
  "solutions": [
    {
      "title": "发展方向名称",
      "futureVision": "5年后详细愿景描述",
      "todayAction": "明天立即开始的具体行动",
      "executionPlan": [
        {
          "time": "第1个月",
          "title": "阶段标题",
          "description": "阶段描述",
          "actions": ["具体行动1", "具体行动2", "具体行动3", "具体行动4"]
        }
      ],
      "successMetrics": [
        "您将达成的具体成果1",
        "您将达成的具体成果2",
        "您将达成的具体成果3",
        "您将达成的具体成果4",
        "您将达成的具体成果5"
      ]
    }
  ]
}
\`\`\`

请严格按照JSON格式输出，确保数据结构完整。`
    
    const response = await aiApiService.sendMessage(fullPrompt)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content
      
      // 提取JSON数据
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0])
        
        if (parsedData.solutions && Array.isArray(parsedData.solutions)) {
          // 转换为组件需要的格式
          return parsedData.solutions.map((solution, index) => ({
            id: `ai-solution-${index}`,
            type: 'future_action',
            icon: ['🎯', '📚', '💪', '🧠', '❤️', '⚡', '🌟', '🚀', '💡', '🔧'][index % 10],
            title: solution.title,
            futureVision: solution.futureVision,
            todayAction: solution.todayAction,
            executionPlan: solution.executionPlan,
            successMetrics: solution.successMetrics,
            timeframe: '5年后',
            actionPeriod: '明天开始'
          }))
        }
      }
    }
    
    console.warn('⚠️ AI响应解析失败，使用默认方案')
    return null
    
  } catch (error) {
    console.error('❌ AI接口调用失败:', error)
    return null
  }
}

// 生成计划结局内容的专门函数
const generatePlanEndingContent = async (query) => {
  try {
    isLoading.value = true
    console.log('🎯 开始生成计划结局内容:', query)
    
    // 使用专门的解决方案生成提示词构建
    const basePrompt = buildSolutionGenerationPrompt(query, [], memories.value)
    
    const planEndingPrompt = `${basePrompt}

## 特别要求：计划结局场景分析
请为用户的未来规划问题生成详细的计划结局内容，包含以下部分：

1. **5年后愿景描述**：具体描绘用户5年后的生活状态、专业成就和个人成长
2. **关键里程碑**：从现在到5年后的重要节点和标志性成就
3. **立即行动计划**：明天就能开始的具体行动步骤
4. **核心发展方向**：3-5个主要的发展领域和技能点

返回格式为JSON：
{
  "planEnding": {
    "futureVision": "详细的5年后愿景描述",
    "keyMilestones": [
      {
        "timeframe": "时间节点",
        "title": "里程碑标题", 
        "description": "具体描述"
      }
    ],
    "immediateActions": [
      "立即可执行的行动1",
      "立即可执行的行动2",
      "立即可执行的行动3"
    ],
    "developmentAreas": [
      {
        "title": "发展方向名称",
        "priority": "high/medium/low",
        "description": "发展方向描述"
      }
    ]
  }
}

要求：
- 内容要具体、可操作、有针对性
- 5年愿景要包含具体的数字和成就指标
- 立即行动必须是明天就能开始的具体事项
- 发展方向要与用户问题高度相关`
    
    const response = await aiApiService.sendMessage(planEndingPrompt)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          
          if (parsed.planEnding) {
            // 将计划结局数据存储到solutions中，以便在SolutionCards中显示
            solutions.value = [{
              id: 'plan-ending-1',
              type: 'plan_ending',
              title: '你的未来愿景',
              planEndingData: parsed.planEnding,
              futureVision: parsed.planEnding.futureVision,
              immediateActions: parsed.planEnding.immediateActions,
              keyMilestones: parsed.planEnding.keyMilestones,
              developmentAreas: parsed.planEnding.developmentAreas
            }]
            
            console.log('✅ 计划结局内容生成成功:', parsed.planEnding)
            // 直接跳转到solutions显示
            currentStep.value = 'solutions'
            return
          }
        }
      } catch (parseError) {
        console.warn('⚠️ 计划结局JSON解析失败:', parseError)
      }
    }
    
    // 如果AI生成失败，使用默认的计划结局内容
    console.log('📋 使用默认计划结局内容')
    solutions.value = [{
      id: 'plan-ending-default',
      type: 'plan_ending', 
      title: '你的未来愿景',
      planEndingData: {
        futureVision: '5年后，你将成为一个更加成熟、自信和有影响力的人。你将在自己选择的领域达到专业水平，拥有清晰的人生方向和强大的执行能力。',
        keyMilestones: [
          {
            timeframe: '第1年',
            title: '基础建设期',
            description: '确立核心目标，建立学习和成长的基础框架'
          },
          {
            timeframe: '第3年', 
            title: '能力突破期',
            description: '在关键领域取得显著进展，建立个人品牌和影响力'
          },
          {
            timeframe: '第5年',
            title: '愿景实现期', 
            description: '达成核心目标，成为该领域的专家和引领者'
          }
        ],
        immediateActions: [
          '明天开始制定详细的5年规划',
          '确定3个最重要的发展方向',
          '建立每日学习和成长的习惯'
        ],
        developmentAreas: [
          {
            title: '专业技能提升',
            priority: 'high',
            description: '在核心专业领域达到专家水平'
          },
          {
            title: '个人品牌建设',
            priority: 'medium', 
            description: '建立个人影响力和专业声誉'
          },
          {
            title: '综合素质发展',
            priority: 'medium',
            description: '提升领导力、沟通力等综合能力'
          }
        ]
      }
    }]
    
    currentStep.value = 'solutions'
    
  } catch (error) {
    console.error('❌ 生成计划结局内容失败:', error)
    // 发生错误时回退到标准流程
    currentStep.value = 'tags'
    await generateDynamicTags(query)
  } finally {
    isLoading.value = false
  }
}

// 生成计划结局类型的解决方案
const generatePlanEndingSolutions = async () => {
  // 复用之前的计划结局生成逻辑，但格式化为标准解决方案格式
  try {
    const query = userQuery.value
    
    // 使用专门的解决方案生成提示词
    const basePrompt = buildSolutionGenerationPrompt(query, selectedTagsObjects.value, memories.value)
    
    const planEndingPrompt = `${basePrompt}

## 特别要求：计划结局场景
请为每个发展方向生成计划结局内容，返回格式为JSON：
{
  "solutions": [
    {
      "title": "发展方向名称",
      "futureVision": "5年后的具体愿景",
      "immediateActions": ["立即行动1", "立即行动2", "立即行动3"],
      "keyMilestones": [
        {
          "timeframe": "时间节点",
          "title": "里程碑标题",
          "description": "具体描述"
        }
      ],
      "developmentAreas": [
        {
          "title": "发展方向",
          "priority": "high/medium/low", 
          "description": "描述"
        }
      ]
    }
  ]
}`
    
    const response = await aiApiService.sendMessage(planEndingPrompt)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          
          if (parsed.solutions && Array.isArray(parsed.solutions)) {
            return parsed.solutions.map((solution, index) => ({
              id: `plan-ending-${index}`,
              type: 'plan_ending',
              icon: ['🎯', '📚', '💪', '🧠', '❤️', '⚡', '🌟', '🚀'][index % 8],
              title: solution.title,
              planEndingData: {
                futureVision: solution.futureVision,
                immediateActions: solution.immediateActions,
                keyMilestones: solution.keyMilestones,
                developmentAreas: solution.developmentAreas
              },
              futureVision: solution.futureVision,
              immediateActions: solution.immediateActions,
              keyMilestones: solution.keyMilestones,
              developmentAreas: solution.developmentAreas
            }))
          }
        }
      } catch (parseError) {
        console.warn('⚠️ 计划结局解析失败:', parseError)
      }
    }
  } catch (error) {
    console.error('❌ 计划结局AI生成失败:', error)
  }
  
  // 使用默认的计划结局解决方案
  return selectedTagsObjects.value.map((tag, index) => ({
    id: `plan-ending-default-${index}`,
    type: 'plan_ending',
    icon: ['🎯', '📚', '💪', '🧠', '❤️', '⚡', '🌟', '🚀'][index % 8],
    title: tag.title,
    planEndingData: {
      futureVision: `5年后，你将在${tag.title}领域成为专家，拥有深厚的专业知识和丰富的实践经验。`,
      immediateActions: [
        `明天开始制定${tag.title}的学习计划`,
        `寻找${tag.title}相关的优质资源`,
        `每天投入固定时间练习${tag.title}`
      ],
      keyMilestones: [
        {
          timeframe: '第1年',
          title: '基础建设期',
          description: `在${tag.title}领域建立扎实的基础知识和技能`
        },
        {
          timeframe: '第3年',
          title: '能力突破期',
          description: `在${tag.title}方面取得显著进展，建立个人优势`
        },
        {
          timeframe: '第5年',
          title: '专家水平',
          description: `成为${tag.title}领域的专家，具备指导他人的能力`
        }
      ],
      developmentAreas: [
        {
          title: `${tag.title}核心技能`,
          priority: 'high',
          description: `深度掌握${tag.title}的核心知识和技能`
        },
        {
          title: '实践应用能力',
          priority: 'medium',
          description: `将理论知识转化为实际应用能力`
        }
      ]
    }
  }))
}

// 生成基于场景的静态解决方案
const generateScenarioBasedSolutions = () => {
  const icons = ['🎯', '📚', '💪', '🧠', '❤️', '⚡', '🌟', '🚀', '💡', '🔧']
  
  return selectedTagsObjects.value.map((tag, index) => {
    const solution = generatePersonalizedSolution(tag, detectedScenario.value, index, icons)
    return solution
  })
}

// 获取不同场景类型的解决方案模板（保留作为备用）
const getSolutionTemplates = (scenarioType) => {
  const templates = {
    [SCENARIO_TYPES.PLAN_ENDING]: {
      // 计划结局场景模板
      default: {
        futureVision: '5年后，你将在{tag}领域达到专业水平，成为这个领域的专家和引领者',
        todayAction: '明天开始制定{tag}的详细发展计划，每天投入至少1小时专注学习',
        milestones: ['3个月建立基础', '1年达到入门水平', '3年获得专业能力', '5年成为领域专家']
      }
    },
    [SCENARIO_TYPES.COGNITIVE_BREAKTHROUGH]: {
      // 认知突破场景模板
      default: {
        futureVision: '通过识别和突破{tag}相关的认知盲区，你将获得全新的思维框架和行动能力',
        todayAction: '明天开始反思{tag}中的思维模式，记录阻碍你的内在信念',
        milestones: ['识别认知障碍', '重构思维框架', '建立新行为模式', '实现突破性进展']
      }
    },
    [SCENARIO_TYPES.PERCEPTION_EXPANSION]: {
      // 感知扩张场景模板
      default: {
        futureVision: '你将拥有敏锐的{tag}能力，能够发现生活中被忽视的美好和深层意义',
        todayAction: '明天开始进行{tag}相关的观察练习，每天记录3个新发现',
        milestones: ['建立观察习惯', '提升感知敏锐度', '发现隐藏之美', '重燃生活热情']
      }
    },
    [SCENARIO_TYPES.PERSONALITY_RESHAPE]: {
      // 人格重塑场景模板
      default: {
        futureVision: '你将成为一个具备{tag}特质的人，拥有强大的内在力量和领导魅力',
        todayAction: '明天开始实践{tag}相关的微习惯，每天完成一个小挑战',
        milestones: ['建立新习惯', '强化意志力', '塑造新身份', '展现领导力']
      }
    },
    [SCENARIO_TYPES.MEMORY_RECONSTRUCTION]: {
      // 记忆重构场景模板
      default: {
        futureVision: '你将从{tag}的困扰中解脱，建立健康的自我认知和情感模式',
        todayAction: '明天开始写下关于{tag}的新叙述，从成长的角度重新解读过去',
        milestones: ['识别情绪锚点', '重写记忆叙述', '释放负面情感', '建立新的自我认知']
      }
    },
    [SCENARIO_TYPES.SOUL_CONNECTION]: {
      // 灵魂连接场景模板
      default: {
        futureVision: '你将找到与你{tag}的灵魂伙伴，建立深度而有意义的人际连接',
        todayAction: '明天开始主动寻找{tag}相关的社群和平台，开始真实的自我表达',
        milestones: ['明确内在需求', '找到合适平台', '建立真实连接', '形成深度关系']
      }
    },
    // 保留原有的future_vision模板作为备用
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
  
  return templates[scenarioType] || templates.general
}

// 生成解决方案
const generateSolutions = async () => {
  isLoading.value = true
  currentStep.value = 'solutions'
  
  // 调用AI生成解决方案（或使用备用方案）
  try {
    solutions.value = await generateDynamicSolutions()
    console.log('✅ 解决方案生成完成:', solutions.value.length, '个方案')
  } catch (error) {
    console.error('❌ 生成解决方案失败:', error)
    // 确保有备用数据
    solutions.value = []
  }
  
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
  
  // 🔍 第一步：分析问题场景（但保持统一流程）
  detectedScenario.value = analyzeScenario(query)
  console.log('📝 用户问题:', query)
  console.log('🎯 检测到的场景类型:', detectedScenario.value)
  
  // 所有问题都走标准流程：标签选择 → 可能性展示 → 解决方案
  console.log('📋 进入标准三步骤流程')
  currentStep.value = 'tags'
  
  // 立即开始生成AI数据（会根据场景类型生成不同的标签和内容）
  await generateDynamicTags(query)
}

const handleEditQuery = () => {
  currentStep.value = 'query'
}

const setExampleQuery = async (text) => {
  userQuery.value = text
  
  // 🔍 第一步：分析问题场景（但保持统一流程）
  detectedScenario.value = analyzeScenario(text)
  console.log('📝 示例问题:', text)
  console.log('🎯 检测到的场景类型:', detectedScenario.value)
  
  // 所有问题都走标准流程：标签选择 → 可能性展示 → 解决方案
  console.log('📋 进入标准三步骤流程')
  currentStep.value = 'tags'
  
  // 立即开始生成AI数据（会根据场景类型生成不同的标签和内容）
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
  possibilityCardsOrder.value = []
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