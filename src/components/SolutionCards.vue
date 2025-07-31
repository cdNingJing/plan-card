<template>
  <div class="solutions-step">
    <!-- 简化的页面头部 -->
    <div class="step-header">
      <div class="header-content">
        <h2>个性化解决方案</h2>
        <p class="header-subtitle">基于您的选择，为您定制的行动方案</p>
      </div>
    </div>

    <!-- 移动端优化的卡片展示 -->
    <div class="solutions-container">
      <div 
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

        <!-- 未来愿景类型的详细内容 -->
        <div v-if="solution.type === 'future_action'" class="future-content">
          
          <!-- 5年后的你 -->
          <div class="vision-section">
            <div class="section-header">
              <h4><StarIcon class="inline w-5 h-5 mr-2" />你的5年后</h4>
            </div>
            <div class="vision-box">
              <p class="vision-text">{{ getDetailedVision(solution.title) }}</p>
            </div>
          </div>

          <!-- 明天开始行动 -->
          <div class="action-section">
            <div class="section-header">
              <h4><BoltIcon class="inline w-5 h-5 mr-2" />明天开始</h4>
            </div>
            <div class="action-box">
              <p class="action-text">{{ getDetailedAction(solution.title) }}</p>
            </div>
          </div>

          <!-- 详细执行计划 -->
          <div class="plan-section">
            <div class="section-header">
              <h4><ClipboardDocumentListIcon class="inline w-5 h-5 mr-2" />执行计划</h4>
            </div>
            <div class="plan-content">
              <div 
                v-for="(step, stepIndex) in getExecutionPlan(solution.title)"
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
                v-for="metric in getSuccessMetrics(solution.title)"
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
    'Python编程': '明天下载并安装Python 3.9+和PyCharm IDE，注册GitHub账号，完成第一个"Hello World"程序。花30分钟学习Python基础语法：变量、数据类型、条件语句。加入3个Python学习群，关注5个技术博主，下载《Python编程从入门到实践》电子书。',
    '写技术博客': '明天选择博客平台（推荐掘金+个人博客），注册账号并完善个人资料。写下第一篇300字的技术总结，可以是今天学到的任何技术点。制定写作计划：每周2篇文章，每篇不少于800字。关注10个优秀技术博主，分析他们的写作风格。',
    '学设计软件': '明天下载Adobe Creative Suite试用版或Figma免费版，观看3个入门教程视频。完成第一个简单设计：制作个人名片或海报。加入5个设计师社群，关注Dribbble和Behance平台，收藏100个优秀设计作品作为灵感库。',
    '读心理学书': '明天去书店或网上购买《心理学与生活》和《社会心理学》两本入门书籍。制定读书计划：每天读10页，做读书笔记。下载心理学相关APP，关注3个心理学博主，加入心理学爱好者群组。',
    '练英语口语': '明天下载英语学习APP（推荐多邻国+扇贝），完成第一个15分钟的口语练习。选择一个英语播客节目开始收听，购买《赖世雄美语音标》教材。找到1个英语学习伙伴或加入英语角活动群。'
  }
  return actions[title] || `明天开始制定${title}的学习计划，搜集相关资源，完成第一个小目标。`
}

// 获取执行计划（写死的内容）
const getExecutionPlan = (title) => {
  const plans = {
    'Python编程': [
      {
        time: '第1个月',
        title: '基础语法掌握',
        description: '掌握Python核心语法和编程思维',
        actions: ['每天1小时学习', '完成100道练习题', '制作第一个计算器程序', '学习Git基础操作']
      },
      {
        time: '第3个月',
        title: '项目实战',
        description: '通过实际项目巩固所学知识',
        actions: ['完成爬虫项目', '制作个人网站', '学习数据库操作', '参与开源项目']
      },
      {
        time: '第6个月',
        title: '框架学习',
        description: '学习主流框架，提升开发效率',
        actions: ['掌握Django基础', '学习前端技术', '部署第一个Web应用', '建立技术博客']
      },
      {
        time: '第1年',
        title: '专业能力',
        description: '达到初级工程师水平',
        actions: ['完成5个完整项目', '参加技术会议', '开始求职准备', '贡献开源代码']
      }
    ],
    '写技术博客': [
      {
        time: '第1个月',
        title: '写作习惯养成',
        description: '建立稳定的写作节奏',
        actions: ['每周发布2篇文章', '建立写作素材库', '学习SEO优化', '互动回复读者']
      },
      {
        time: '第3个月',
        title: '内容质量提升',
        description: '提高文章质量和影响力',
        actions: ['深度技术文章', '制作技术教程', '参与技术讨论', '建立读者群体']
      },
      {
        time: '第6个月',
        title: '影响力扩大',
        description: '扩大在技术社区的影响力',
        actions: ['跨平台发布', '参与技术会议', '开设专栏', '合作其他博主']
      },
      {
        time: '第1年',
        title: '商业化探索',
        description: '开始探索内容变现',
        actions: ['推出付费课程', '接受商业合作', '出版技术书籍', '建立个人品牌']
      }
    ]
  }
  return plans[title] || [
    { time: '第1个月', title: '入门阶段', description: '建立基础', actions: ['制定学习计划', '搜集学习资源'] },
    { time: '第3个月', title: '进步阶段', description: '深入学习', actions: ['实践练习', '总结经验'] },
    { time: '第6个月', title: '提升阶段', description: '技能提升', actions: ['项目实战', '经验分享'] },
    { time: '第1年', title: '专业阶段', description: '达到专业水平', actions: ['持续优化', '帮助他人'] }
  ]
}

// 获取成功指标（写死的内容）
const getSuccessMetrics = (title) => {
  const metrics = {
    'Python编程': [
      '能独立完成中等复杂度的项目开发',
      'GitHub上有20+个优质项目',
      '掌握3个以上主流框架',
      '月薪达到15K以上',
      '在技术社区有一定影响力'
    ],
    '写技术博客': [
      '月访问量超过5万',
      '拥有1万+忠实读者',
      '文章被主流平台推荐',
      '月收入超过5000元',
      '建立个人技术品牌'
    ],
    '学设计软件': [
      '熟练使用5个以上设计工具',
      '完成50+个设计项目',
      '建立个人设计作品集',
      '获得客户好评率95%以上',
      '月收入超过8000元'
    ],
    '读心理学书': [
      '阅读100+本心理学书籍',
      '获得心理咨询师证书',
      '帮助50+人解决问题',
      '开设个人成长课程',
      '成为企业心理顾问'
    ],
    '练英语口语': [
      '雅思口语7分以上',
      '能流利进行商务对话',
      '参与国际会议发言',
      '获得海外工作机会',
      '成为双语专业人士'
    ]
  }
  return metrics[title] || [
    `在${title}领域达到专业水平`,
    '获得相关资格认证',
    '建立个人品牌影响力',
    '实现收入增长',
    '帮助他人成长'
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
}
</style>