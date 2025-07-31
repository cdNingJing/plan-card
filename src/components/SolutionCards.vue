<template>
  <div class="solutions-step">
    <!-- 简化的页面头部 -->
    <div class="step-header">
      <div class="header-content">
        <h2>行动计划书</h2>
        <p class="header-subtitle">为您定制的行动方案</p>
      </div>
    </div>

    <!-- 移动端优化的卡片展示 -->
    <div class="solutions-container">
      <!-- 骨架屏显示 -->
      <div v-if="isLoading" class="skeleton-container">
        <div 
          v-for="index in 3" 
          :key="`skeleton-${index}`"
          class="skeleton-card"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <!-- 骨架屏头部 -->
          <div class="skeleton-header">
            <div class="skeleton-icon"></div>
            <div class="skeleton-header-text">
              <div class="skeleton-title"></div>
              <div class="skeleton-badge"></div>
            </div>
          </div>

          <!-- 骨架屏内容 -->
          <div class="skeleton-content">
            <!-- 5年后愿景骨架 -->
            <div class="skeleton-section">
              <div class="skeleton-section-title"></div>
              <div class="skeleton-vision-box">
                <div class="skeleton-line long"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>

            <!-- 明天行动骨架 -->
            <div class="skeleton-section">
              <div class="skeleton-section-title"></div>
              <div class="skeleton-action-box">
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>

            <!-- 执行计划骨架 -->
            <div class="skeleton-section">
              <div class="skeleton-section-title"></div>
              <div class="skeleton-plan">
                <div v-for="planIndex in 4" :key="planIndex" class="skeleton-plan-item">
                  <div class="skeleton-timeline"></div>
                  <div class="skeleton-plan-content">
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line long"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 成功指标骨架 -->
            <div class="skeleton-section">
              <div class="skeleton-section-title"></div>
              <div class="skeleton-metrics">
                <div v-for="metricIndex in 5" :key="metricIndex" class="skeleton-metric"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实际内容 -->
      <div 
        v-else
        v-for="(solution, index) in solutions"
        :key="solution.id"
        class="solution-card"
        :class="`solution-${solution.type}`"
        :style="{ animationDelay: `${index * 200}ms` }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="solution-icon">
            <component :is="getSolutionIcon(solution.title)" class="w-8 h-8" />
          </div>
          <div class="header-info">
            <h3 class="solution-title">{{ solution.title }}</h3>
            <span class="solution-badge">{{ getTypeName(solution.type) }}</span>
          </div>
        </div>

        <!-- 计划结局类型的详细内容 -->
        <div v-if="solution.type === 'plan_ending'" class="plan-ending-content">
          
          <!-- 5年后愿景 -->
          <div class="vision-section">
            <div class="section-header">
              <h4><StarIcon class="inline w-5 h-5 mr-2" />你的5年后</h4>
            </div>
            <div class="vision-box">
              <p class="vision-text">{{ solution.planEndingData?.futureVision || solution.futureVision }}</p>
            </div>
          </div>

          <!-- 立即行动计划 -->
          <div class="action-section">
            <div class="section-header">
              <h4><BoltIcon class="inline w-5 h-5 mr-2" />立即开始行动</h4>
            </div>
            <div class="action-box">
              <div 
                v-for="action in (solution.planEndingData?.immediateActions || solution.immediateActions || [])"
                :key="action"
                class="immediate-action-item"
              >
                {{ action }}
              </div>
            </div>
          </div>

          <!-- 关键里程碑 -->
          <div class="milestones-section">
            <div class="section-header">
              <h4><ClipboardDocumentListIcon class="inline w-5 h-5 mr-2" />关键里程碑</h4>
            </div>
            <div class="milestones-content">
              <div 
                v-for="(milestone, index) in (solution.planEndingData?.keyMilestones || solution.keyMilestones || [])"
                :key="index"
                class="milestone-item"
              >
                <div class="milestone-timeline">{{ milestone.timeframe }}</div>
                <div class="milestone-content">
                  <div class="milestone-title">{{ milestone.title }}</div>
                  <div class="milestone-description">{{ milestone.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 核心发展方向 -->
          <div class="development-section">
            <div class="section-header">
              <h4><TrophyIcon class="inline w-5 h-5 mr-2" />核心发展方向</h4>
            </div>
            <div class="development-content">
              <div 
                v-for="area in (solution.planEndingData?.developmentAreas || solution.developmentAreas || [])"
                :key="area.title"
                class="development-item"
                :class="`priority-${area.priority}`"
              >
                <div class="development-title">{{ area.title }}</div>
                <div class="development-description">{{ area.description }}</div>
                <div class="priority-badge" :class="`badge-${area.priority}`">
                  {{ getPriorityText(area.priority) }}
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 其他场景类型的内容 -->
        <div v-else-if="solution.type && solution.type.includes('_')" class="scenario-content">
          
          <!-- 愿景区域 -->
          <div class="vision-section">
            <div class="section-header">
              <h4><StarIcon class="inline w-5 h-5 mr-2" />愿景目标</h4>
            </div>
            <div class="vision-box">
              <p class="vision-text">{{ solution.futureVision || getDetailedVision(solution.title) }}</p>
            </div>
          </div>

          <!-- 立即行动 -->
          <div class="action-section">
            <div class="section-header">
              <h4><BoltIcon class="inline w-5 h-5 mr-2" />立即开始</h4>
            </div>
            <div class="action-box">
              <p class="action-text">{{ solution.todayAction || getDetailedAction(solution.title) }}</p>
            </div>
          </div>

          <!-- 里程碑 -->
          <div class="milestones-section" v-if="solution.milestones && solution.milestones.length > 0">
            <div class="section-header">
              <h4><ClipboardDocumentListIcon class="inline w-5 h-5 mr-2" />关键里程碑</h4>
            </div>
            <div class="milestones-content">
              <div 
                v-for="(milestone, index) in solution.milestones"
                :key="index"
                class="milestone-item simple"
              >
                {{ milestone }}
              </div>
            </div>
          </div>

        </div>

        <!-- 未来愿景类型的详细内容 -->
        <div v-else-if="solution.type === 'future_action'" class="future-content">
          
          <!-- 5年后的你 -->
          <div class="vision-section">
            <div class="section-header">
              <h4><StarIcon class="inline w-5 h-5 mr-2" />你的5年后</h4>
            </div>
            <div class="vision-box">
              <p class="vision-text">{{ solution.futureVision || getDetailedVision(solution.title) }}</p>
            </div>
          </div>

          <!-- 明天开始行动 -->
          <div class="action-section">
            <div class="section-header">
              <h4><BoltIcon class="inline w-5 h-5 mr-2" />明天开始</h4>
            </div>
            <div class="action-box">
              <p class="action-text">{{ solution.todayAction || getDetailedAction(solution.title) }}</p>
            </div>
          </div>

          <!-- 详细执行计划 -->
          <div class="plan-section">
            <div class="section-header">
              <h4><ClipboardDocumentListIcon class="inline w-5 h-5 mr-2" />执行计划</h4>
            </div>
            <div class="plan-content">
              <div 
                v-for="(step, stepIndex) in (solution.executionPlan || getExecutionPlan(solution.title))"
                :key="stepIndex"
                class="plan-step"
              >
                <div class="step-timeline">{{ step.time }}</div>
                <div class="step-content">
                  <div class="step-title">{{ step.title }}</div>
                  <div class="step-description">{{ step.description }}</div>
                  <div class="step-actions">
                    <div 
                      v-for="action in step.actions"
                      :key="action"
                      class="action-item"
                    >
                      {{ action }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 成功指标 -->
          <div class="metrics-section">
            <div class="section-header">
              <h4><TrophyIcon class="inline w-5 h-5 mr-2" />成功指标</h4>
            </div>
            <div class="metrics-content">
              <div 
                v-for="metric in (solution.successMetrics || getSuccessMetrics(solution.title))"
                :key="metric"
                class="metric-item"
              >
                {{ metric }}
              </div>
            </div>
          </div>

        </div>

        <!-- 其他类型的原有组件保持不变 -->
        <div v-else class="other-content">
          <p class="solution-description">{{ solution.description }}</p>
          
          <AllergyTracker 
            v-if="solution.type === 'allergy'" 
            :foods="solution.foods"
            :selected-foods="allergyFoods"
            @toggle-food="toggleFoodAllergy"
          />

          <ActivityLogger 
            v-if="solution.type === 'activity'" 
            :activities="solution.activities"
            @log-activity="logActivity"
          />

          <MoodTracker 
            v-if="solution.type === 'mood'" 
            :moods="solution.moods"
            :current-mood="currentMood"
            @log-mood="logMood"
          />

          <ReminderWidget 
            v-if="solution.type === 'reminder'" 
            :solution="solution"
            @set-reminder="setReminder"
          />

          <MedicalWidget 
            v-if="solution.type === 'medical'" 
            @open-advice="openMedicalAdvice"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
// Heroicons 导入
import {
  StarIcon,
  BoltIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  PaintBrushIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  HeartIcon,
  FaceSmileIcon,
  BellIcon,
  UserIcon
} from '@heroicons/vue/24/outline'
import AllergyTracker from './solution-widgets/AllergyTracker.vue'
import ActivityLogger from './solution-widgets/ActivityLogger.vue'
import MoodTracker from './solution-widgets/MoodTracker.vue'
import ReminderWidget from './solution-widgets/ReminderWidget.vue'
import MedicalWidget from './solution-widgets/MedicalWidget.vue'

const props = defineProps({
  solutions: {
    type: Array,
    default: () => []
  },
  selectedContext: {
    type: Array,
    default: () => []
  },
  allergyFoods: {
    type: Array,
    default: () => []
  },
  currentMood: {
    type: String,
    default: ''
  },
  currentQuery: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  possibilityCardsOrder: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'reset-flow', 
  'toggle-food-allergy', 
  'log-activity', 
  'log-mood', 
  'set-reminder', 
  'open-medical-advice'
])

// 获取类型名称
const getTypeName = (type) => {
  const typeNames = {
    plan_ending: '计划结局',
    future_action: '未来规划',
    dynamic: '动态解决',
    allergy: '饮食管理',
    activity: '活动记录',
    mood: '情绪追踪',
    reminder: '提醒服务',
    medical: '医疗建议'
  }
  return typeNames[type] || '未知类型'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const priorityTexts = {
    high: '高优先级',
    medium: '中优先级',  
    low: '低优先级'
  }
  return priorityTexts[priority] || '中优先级'
}

// 获取解决方案图标
const getSolutionIcon = (title) => {
  const iconMap = {
    'Python编程': CodeBracketIcon,
    '写技术博客': PencilSquareIcon,
    '学设计软件': PaintBrushIcon,
    '读心理学书': BookOpenIcon,
    '练英语口语': ChatBubbleLeftRightIcon,
    'allergy': HeartIcon,
    'activity': CogIcon,
    'mood': FaceSmileIcon,
    'reminder': BellIcon,
    'medical': UserIcon
  }
  return iconMap[title] || CogIcon
}

// 获取详细的未来愿景（写死的内容）
const getDetailedVision = (title) => {
  const visions = {
    'Python编程': '5年后，你将成为Python全栈开发专家，能够独立开发复杂的AI应用和企业级系统。你将精通Django/Flask框架、数据科学库（pandas、numpy、scikit-learn）、机器学习框架（TensorFlow、PyTorch），并能设计高性能的后端架构。你的GitHub将拥有50+个优质项目，技术博客月访问量超过10万，年薪达到50万+。',
    '写技术博客': '5年后，你将拥有20万+忠实读者的技术博客，成为行业内具有影响力的技术意见领袖。你的文章将被各大技术平台推荐，每月收入超过3万元。你将出版2本技术书籍，受邀参加国内外技术大会演讲，建立自己的技术社区和知识付费课程体系。',
    '学设计软件': '5年后，你将精通Photoshop、Illustrator、Figma、Sketch等主流设计工具，能够独立完成品牌设计、UI/UX设计、插画创作等多种设计需求。你将拥有自己的设计工作室，服务过100+企业客户，设计作品获得国际奖项认可，年收入超过80万。',
    '读心理学书': '5年后，你将深度理解人性和心理机制，拥有卓越的人际交往、情绪管理和自我成长能力。你将获得心理咨询师资格证，帮助200+人解决心理困扰，开设个人成长工作坊，成为企业管理顾问，用心理学知识指导商业决策和团队管理。',
    '练英语口语': '5年后，你将能够流利地用英语进行商务谈判、学术交流和日常生活。你将通过雅思8分、托福110分，在国际会议上发表演讲，与全球客户建立深度合作关系，获得海外工作机会，年薪增长300%以上。'
  }
  return visions[title] || `5年后，你在${title}领域将达到专业水平，成为这个领域的专家，拥有丰富的实践经验和深厚的理论基础。`
}

// 获取详细的明天行动（写死的内容）
const getDetailedAction = (title) => {
  const actions = {
    'Python编程': '明天立即开始编程实践：打开PyCharm，创建第一个Python文件，写出你的第一个程序。每天坚持写代码1小时，从变量声明开始，逐步掌握函数、循环和条件语句。专注于实际编写代码，而不是观看教程。',
    '写技术博客': '明天就开始写作：选定一个技术话题，写出第一篇800字的技术文章。每周固定发布2篇高质量文章，建立稳定的写作节奏。专注于分享实际的技术经验和解决方案，持续输出有价值的内容。',
    '学设计软件': '明天开始动手设计：打开Figma或Photoshop，创建第一个设计项目。每天练习设计2小时，从临摹优秀作品开始，逐步形成自己的设计风格。专注于大量的实际练习，不断提升设计技能。',
    '读心理学书': '明天开始系统阅读：每天固定阅读心理学书籍30分钟，做详细的读书笔记。将理论知识应用到日常生活中，观察和分析身边的人际关系。坚持每天学习，建立扎实的心理学知识基础。',
    '练英语口语': '明天开始大声说英语：每天进行30分钟的口语练习，从朗读英文文章开始。坚持用英语进行日常思考，逐步提升语言表达能力。专注于实际的口语输出，而不是被动的听力输入。'
  }
  return actions[title] || `明天立即开始${title}的实践，每天坚持练习，专注于技能的实际应用和提升。`
}

// 获取执行计划（写死的内容）
const getExecutionPlan = (title) => {
  const plans = {
    'Python编程': [
      {
        time: '第1个月',
        title: '编程基础建立',
        description: '掌握Python核心语法，养成编程习惯',
        actions: ['每天写代码1小时，无例外', '完成100个基础练习', '构建第一个计算器程序', '掌握Git版本控制']
      },
      {
        time: '第3个月',
        title: '项目实战开始',
        description: '通过真实项目验证技能水平',
        actions: ['独立完成网络爬虫项目', '构建个人作品网站', '熟练操作数据库', '为开源项目贡献代码']
      },
      {
        time: '第6个月',
        title: '框架技能提升',
        description: '掌握主流框架，提升开发效率',
        actions: ['精通Django Web开发', '学会前后端协作', '部署线上Web应用', '开始写技术博客']
      },
      {
        time: '第1年',
        title: '专业水平达成',
        description: '达到初级工程师标准，开始职业发展',
        actions: ['完成5个完整商业项目', '参与技术大会演讲', '通过技术面试', '持续贡献开源社区']
      }
    ],
    '写技术博客': [
      {
        time: '第1个月',
        title: '写作习惯确立',
        description: '建立稳定高质量的写作输出',
        actions: ['每周必发2篇技术文章', '建立个人写作工作流', '优化文章SEO表现', '积极回复读者评论']
      },
      {
        time: '第3个月',
        title: '内容深度突破',
        description: '提升文章质量和技术深度',
        actions: ['专注深度技术解析', '制作系列教程内容', '主导技术话题讨论', '培养忠实读者群体']
      },
      {
        time: '第6个月',
        title: '影响力快速扩大',
        description: '在技术社区建立个人品牌',
        actions: ['多平台同步发布内容', '受邀参与技术会议', '开设个人技术专栏', '与知名博主深度合作']
      },
      {
        time: '第1年',
        title: '商业价值实现',
        description: '将技术影响力转化为商业收益',
        actions: ['推出高价值付费课程', '接受优质商业合作', '出版个人技术书籍', '建立完整个人品牌']
      }
    ]
  }
  return plans[title] || [
    { time: '第1个月', title: '技能基础建立', description: '掌握核心技能', actions: ['每天坚持练习', '建立学习习惯'] },
    { time: '第3个月', title: '实战能力提升', description: '应用所学技能', actions: ['完成实际项目', '积累实战经验'] },
    { time: '第6个月', title: '专业技能突破', description: '达到专业标准', actions: ['掌握高级技能', '建立个人作品'] },
    { time: '第1年', title: '专业地位确立', description: '成为领域专家', actions: ['持续技能提升', '分享经验帮助他人'] }
  ]
}

// 获取成功指标（写死的内容）
const getSuccessMetrics = (title) => {
  const metrics = {
    'Python编程': [
      '您将独立开发复杂的企业级应用程序',
      'GitHub展示30+个高质量开源项目',
      '精通Django、Flask、FastAPI等主流框架',
      '年薪突破30万，成为高级开发工程师',
      '在技术社区拥有数千名关注者'
    ],
    '写技术博客': [
      '每月博客访问量稳定超过10万',
      '培养3万+忠实技术读者群体',
      '文章频繁被各大技术平台推荐首页',
      '通过内容创作月收入超过2万元',
      '确立个人技术意见领袖地位'
    ],
    '学设计软件': [
      '精通Photoshop、Illustrator、Figma等8款设计工具',
      '设计作品集展示100+优秀项目案例',
      '建立完整的个人设计品牌体系',
      '客户满意度保持99%以上',
      '设计服务月收入稳定超过1.5万元'
    ],
    '读心理学书': [
      '深度阅读200+本心理学专业书籍',
      '获得国家二级心理咨询师资格证书',
      '成功帮助100+人解决心理困扰',
      '开设个人心理成长工作坊',
      '担任多家企业心理健康顾问'
    ],
    '练英语口语': [
      '雅思口语达到8分专业水平',
      '与外国客户无障碍商务沟通',
      '受邀在国际会议上英语演讲',
      '获得跨国公司海外工作机会',
      '成为企业内部英语培训专家'
    ]
  }
  return metrics[title] || [
    `您将在${title}领域达到专业水平`,
    '获得权威资格认证',
    '建立强大的个人品牌影响力',
    '实现显著的收入增长',
    '成为能够指导他人成长的专家'
  ]
}

const handleReset = () => {
  emit('reset-flow')
}

const toggleFoodAllergy = (food) => {
  emit('toggle-food-allergy', food)
}

const logActivity = (activity) => {
  emit('log-activity', activity)
}

const logMood = (mood) => {
  emit('log-mood', mood)
}

const setReminder = (solution) => {
  emit('set-reminder', solution)
}

const openMedicalAdvice = () => {
  emit('open-medical-advice')
}
</script>

<style scoped>
.solutions-step {
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
}

/* 页面头部 */
.step-header {
  text-align: center;
  margin-bottom: 24px;
}

.header-content h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.header-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 解决方案容器 */
.solutions-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

/* 解决方案卡片 */
.solution-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.solution-plan_ending {
  border-left: 4px solid #722ed1;
  background: linear-gradient(135deg, #fff 0%, #f9f0ff 100%);
}

.solution-future_action {
  border-left: 4px solid #52c41a;
  background: linear-gradient(135deg, #fff 0%, #f6ffed 100%);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.solution-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 8px;
  flex-shrink: 0;
  color: #52c41a;
}

.solution-icon svg {
  width: 28px;
  height: 28px;
}

.header-info {
  flex: 1;
}

.solution-title {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.solution-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f9ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 未来内容区域 */
.future-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 区域头部 */
.section-header {
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.section-header h4 svg {
  color: #52c41a;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-right: 8px;
}

/* 愿景区域 */
.vision-box {
  padding: 16px;
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  border-radius: 8px;
  border: 1px solid #b7eb8f;
}

.vision-text {
  margin: 0;
  color: #389e0d;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 500;
}

/* 行动区域 */
.action-box {
  padding: 16px;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 8px;
  border: 1px solid #91d5ff;
}

.action-text {
  margin: 0;
  color: #0958d9;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 500;
}

/* 执行计划 */
.plan-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plan-step {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #1890ff;
}

.step-timeline {
  flex-shrink: 0;
  width: 80px;
  font-size: 12px;
  font-weight: 600;
  color: #1890ff;
  background: #e6f7ff;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.step-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.step-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-item {
  font-size: 12px;
  color: #999;
  padding: 2px 0;
  position: relative;
  padding-left: 12px;
}

.action-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #1890ff;
}

/* 成功指标 */
.metrics-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-item {
  padding: 8px 12px;
  background: #fff2e8;
  border: 1px solid #ffd591;
  border-radius: 6px;
  font-size: 13px;
  color: #d4380d;
  position: relative;
  padding-left: 24px;
}

.metric-item::before {
  content: '✓';
  position: absolute;
  left: 8px;
  color: #52c41a;
  font-weight: bold;
}

/* 其他内容 */
.other-content {
  margin-top: 16px;
}

.solution-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

/* 底部区域 */
.bottom-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.original-question {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.question-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.question-text {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  font-style: italic;
}

.action-buttons {
  text-align: center;
}

.reset-button {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

/* 动画 */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 骨架屏样式 */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.skeleton-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #f0f0f0;
  animation: skeletonFadeIn 0.6s ease forwards;
  opacity: 0;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.5s infinite;
}

.skeleton-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  width: 120px;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.skeleton-badge {
  width: 80px;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.skeleton-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-section-title {
  width: 100px;
  height: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.skeleton-vision-box {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-action-box {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.long {
  width: 100%;
}

.skeleton-line.medium {
  width: 75%;
}

.skeleton-line.short {
  width: 50%;
}

.skeleton-plan {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-plan-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.skeleton-timeline {
  width: 80px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  flex-shrink: 0;
  animation: shimmer 1.5s infinite;
}

.skeleton-plan-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-metric {
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

/* 骨架屏动画 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes skeletonFadeIn {
  to {
    opacity: 1;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .solutions-step {
    padding: 12px;
  }
  
  .header-content h2 {
    font-size: 20px;
  }
  
  .solution-card {
    padding: 16px;
  }
  
  .solution-icon {
    width: 40px;
    height: 40px;
  }
  
  .solution-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .solution-title {
    font-size: 16px;
  }
  
  .plan-step {
    flex-direction: column;
    gap: 8px;
  }
  
  .step-timeline {
    width: auto;
    align-self: flex-start;
  }
  
  /* 骨架屏移动端优化 */
  .skeleton-card {
    padding: 16px;
  }
  
  .skeleton-icon {
    width: 40px;
    height: 40px;
  }
  
  .skeleton-plan-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .skeleton-timeline {
    width: auto;
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .solutions-step {
    padding: 8px;
  }
  
  .header-content h2 {
    font-size: 18px;
  }
  
  .solution-card {
    padding: 12px;
  }
  
  .vision-text,
  .action-text {
    font-size: 14px;
  }
  
  .step-title {
    font-size: 13px;
  }
  
  .step-description {
    font-size: 12px;
  }
  
  .section-header h4 svg {
    width: 18px;
    height: 18px;
  }
  
  /* 骨架屏小屏幕优化 */
  .skeleton-card {
    padding: 12px;
  }
  
  .skeleton-icon {
    width: 32px;
    height: 32px;
  }
  
  .skeleton-vision-box,
  .skeleton-action-box {
    padding: 12px;
  }
  
  .skeleton-plan-item {
    padding: 12px;
  }
}

/* 计划结局专用样式 */
.plan-ending-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 立即行动项样式 */
.immediate-action-item {
  padding: 8px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  font-size: 13px;
  color: #0958d9;
  margin-bottom: 8px;
  position: relative;
  padding-left: 24px;
}

.immediate-action-item::before {
  content: '⚡';
  position: absolute;
  left: 8px;
  color: #1890ff;
  font-weight: bold;
}

/* 里程碑项样式 */
.milestones-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.milestone-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f6f6f6;
  border-radius: 8px;
  border-left: 3px solid #722ed1;
}

.milestone-timeline {
  flex-shrink: 0;
  width: 80px;
  font-size: 12px;
  font-weight: 600;
  color: #722ed1;
  background: #f9f0ff;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}

.milestone-content {
  flex: 1;
}

.milestone-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.milestone-description {
  font-size: 13px;
  color: #666;
}

/* 发展方向样式 */
.development-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.development-item {
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  position: relative;
}

.development-item.priority-high {
  border-left: 3px solid #ff4d4f;
  background: #fff2f0;
}

.development-item.priority-medium {
  border-left: 3px solid #fa8c16;
  background: #fff7e6;
}

.development-item.priority-low {
  border-left: 3px solid #52c41a;
  background: #f6ffed;
}

.development-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.development-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.priority-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  position: absolute;
  top: 8px;
  right: 8px;
}

.priority-badge.badge-high {
  background: #ffebee;
  color: #d32f2f;
}

.priority-badge.badge-medium {
  background: #fff3e0;
  color: #f57c00;
}

.priority-badge.badge-low {
  background: #e8f5e8;
  color: #388e3c;
}

/* 移动端计划结局样式优化 */
@media (max-width: 768px) {
  .milestone-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .milestone-timeline {
    width: auto;
    align-self: flex-start;
  }
  
  .development-item {
    padding: 10px 12px;
  }
  
  .priority-badge {
    position: static;
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .plan-ending-content {
    gap: 20px;
  }
  
  .immediate-action-item {
    font-size: 12px;
    padding: 6px 10px 6px 20px;
  }
  
  .milestone-item {
    padding: 12px;
  }
  
  .milestone-title {
    font-size: 13px;
  }
  
  .milestone-description {
    font-size: 12px;
  }
  
  .development-title {
    font-size: 13px;
  }
  
  .development-description {
    font-size: 12px;
  }
}

/* 场景内容样式 */
.scenario-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 简单里程碑样式 */
.milestone-item.simple {
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 6px;
  font-size: 13px;
  color: #0958d9;
  position: relative;
  padding-left: 24px;
}

.milestone-item.simple::before {
  content: '🎯';
  position: absolute;
  left: 8px;
  color: #1890ff;
  font-weight: bold;
}
</style>