<template>
  <div 
    class="dream-vision-screen"
    :style="{ transform: `translateY(${verticalTranslateY}px)` }"
  >
    <div class="dream-vision-content">
      <!-- 顶部导航栏 -->
      <div class="top-navigation">
        <div class="nav-left">
          <button class="back-button" @click="handleBack">
            <ArrowLeft :size="20" />
            <span>返回</span>
          </button>
        </div>
        <div class="nav-center">
          <div class="dream-indicator">
            <div class="indicator-dots">
              <div 
                v-for="(dream, index) in dreams" 
                :key="index"
                class="dot"
                :class="{ active: index === activeDreamIndex }"
                @click="setActiveDream(index)"
              ></div>
            </div>
          </div>
        </div>
        <div class="nav-right">
          <button class="share-button" @click="handleShare">
            <Share2 :size="18" />
          </button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 梦想标题区域 -->
        <div class="dream-header-section">
          <div class="dream-icon">
            <component :is="currentDreamVision?.icon || Target" :size="32" />
          </div>
          <h1 class="dream-title">{{ currentDreamVision?.title || '探索未来的可能性' }}</h1>
          <p class="dream-subtitle">{{ currentDreamVision?.subtitle || '每一个梦想都是新世界的开始' }}</p>
        </div>

        <!-- 可滚动内容区域 -->
        <div class="scrollable-content">
          <!-- 未来愿景卡片 -->
          <div class="vision-card">
            <div class="card-header">
              <Sparkles :size="18" class="card-icon" />
              <h3 class="card-title">未来愿景</h3>
            </div>
            <div class="card-content">
              <p class="vision-text">{{ currentDreamVision?.futureState || '想象一个更好的自己，从今天开始行动。' }}</p>
            </div>
          </div>

          <!-- 核心洞察卡片 -->
          <div class="insights-card">
            <div class="card-header">
              <Lightbulb :size="18" class="card-icon" />
              <h3 class="card-title">核心洞察</h3>
            </div>
            <div class="insights-grid">
              <div 
                v-for="(insight, index) in currentInsights" 
                :key="index"
                class="insight-item"
                :class="{ 'highlight': insight.highlight }"
                @click="toggleInsightDetail(index)"
              >
                <div class="insight-header">
                  <div class="insight-icon">
                    <component :is="insight.icon" :size="16" />
                  </div>
                  <h4 class="insight-title">{{ insight.title }}</h4>
                  <div class="insight-toggle">
                    <ChevronDown :size="16" :class="{ 'rotated': insight.expanded }" />
                  </div>
                </div>
                <div class="insight-description" :class="{ 'expanded': insight.expanded }">
                  {{ insight.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- 行动计划卡片 -->
          <div class="actions-card">
            <div class="card-header">
              <Zap :size="18" class="card-icon" />
              <h3 class="card-title">关键行动</h3>
            </div>
            <div class="actions-list">
              <div 
                v-for="(action, index) in currentActions" 
                :key="index"
                class="action-item"
                :class="{ 'priority': action.priority }"
                @click="toggleActionDetail(index)"
              >
                <div class="action-header">
                  <div class="action-number">{{ String(index + 1).padStart(2, '0') }}</div>
                  <div class="action-content">
                    <h4 class="action-title">{{ action.title }}</h4>
                    <div class="action-toggle">
                      <ChevronDown :size="16" :class="{ 'rotated': action.expanded }" />
                    </div>
                  </div>
                </div>
                <div class="action-description" :class="{ 'expanded': action.expanded }">
                  {{ action.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- 深度思考卡片 -->
          <div class="reflection-card">
            <div class="card-header">
              <Brain :size="18" class="card-icon" />
              <h3 class="card-title">深度思考</h3>
            </div>
            <div class="reflection-content">
              <div class="quote-marks">"</div>
              <p class="reflection-text">{{ currentDreamVision?.reflection || '成功不是终点，而是不断超越自己的过程。' }}</p>
              <div class="quote-marks">"</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-actions">
        <button class="action-btn primary" @click="handleStartPlanning">
          <Play :size="18" />
          <span>开始规划</span>
        </button>
        <button class="action-btn secondary" @click="handleSaveDream">
          <Bookmark :size="18" />
          <span>收藏梦想</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { 
  Target, Sparkles, Lightbulb, Zap, Brain, TrendingUp, Clock, Users, 
  Heart, BookOpen, Briefcase, DollarSign, Trophy, Star, ArrowLeft, 
  Share2, ChevronDown, Play, Bookmark 
} from 'lucide-vue-next'


const props = defineProps({
  dreams: {
    type: Array,
    required: true
  },
  activeDreamIndex: {
    type: Number,
    required: true
  },
  verticalTranslateY: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['back', 'setActiveDream', 'startPlanning', 'saveDream', 'share'])

// 梦想愿景数据
const dreamVisions = {
  0: { // 年底前减重20斤，重拾健康活力
    title: "重拾生命活力",
    subtitle: "不只是减重，而是重新定义人生",
    icon: Heart,
    futureState: "想象一年后的你：精力充沛地工作，自信地面对每一个挑战，拥有掌控生活的力量。健康的身体成为你最大的财富，每一天都充满活力与自信。",
    insights: [
      { 
        title: "身体是革命的本钱", 
        description: "健康不是一切，但没有健康就没有一切。投资健康是最有价值的投资，它会在未来的每一天为你带来复利收益。",
        icon: Heart,
        highlight: true,
        expanded: false
      },
      { 
        title: "习惯的力量", 
        description: "每一次的坚持都在塑造更好的自己。小小的改变积累起来，就能创造奇迹般的转变。",
        icon: TrendingUp,
        highlight: false,
        expanded: false
      },
      { 
        title: "自律即自由", 
        description: "短期的约束换来长期的自由。当你掌控了身体，你就掌控了人生的主动权。",
        icon: Trophy,
        highlight: false,
        expanded: false
      }
    ],
    actions: [
      {
        title: "建立晨练习惯",
        description: "每天早上6点起床，进行30分钟的有氧运动。让身体在新的一天开始时就充满活力，这种状态会延续整天。",
        priority: true,
        expanded: false
      },
      {
        title: "制定饮食计划",
        description: "告别无节制的饮食，学会营养搭配。每一餐都是对身体的投资，每一次选择都在塑造未来的自己。",
        priority: false,
        expanded: false
      },
      {
        title: "记录身体变化",
        description: "用数据见证自己的蜕变。体重、体脂率、精神状态的记录，让进步变得可视化，让坚持变得有意义。",
        priority: false,
        expanded: false
      }
    ],
    reflection: "成功减重不仅仅是数字的改变，更是生活方式的重构和自我价值的重新发现。每一次的选择都在告诉自己：我值得拥有更好的生活，我有能力实现想要的改变。"
  },
  1: { // 3年内晋升技术主管，实现年薪50万目标
    title: "技术领导力的蜕变",
    subtitle: "从代码执行者到战略思考者",
    icon: Briefcase,
    futureState: "3年后的你：站在技术大会的演讲台上，分享着自己带领团队攻克关键项目的经验，台下是仰慕的目光和热烈的掌声。你不仅是技术专家，更是团队的精神领袖。",
    insights: [
      { 
        title: "技术深度与管理广度并重", 
        description: "优秀的技术领导者既要有深厚的技术功底，也要具备宏观的管理视野。技术是基础，管理是杠杆。",
        icon: Briefcase,
        highlight: true,
        expanded: false
      },
      { 
        title: "人才是最大的资产", 
        description: "技术可以学习，但培养人才需要智慧。懂得发现每个人的潜力，帮助他们成长，这是领导者的核心能力。",
        icon: Users,
        highlight: false,
        expanded: false
      },
      { 
        title: "持续学习是生存之道", 
        description: "技术日新月异，停止学习就意味着倒退。保持对新技术的敏感度和学习热情，是技术人员的生命线。",
        icon: BookOpen,
        highlight: false,
        expanded: false
      }
    ],
    actions: [
      {
        title: "深化技术专长",
        description: "在现有的技术栈基础上，选择1-2个前沿方向深入研究。成为公司在这个领域的专家和权威，建立不可替代的技术壁垒。",
        priority: true,
        expanded: false
      },
      {
        title: "培养团队管理能力", 
        description: "主动承担项目管理职责，学习如何协调资源、管理进度、激励团队。从管理事到管理人，逐步建立领导力。",
        priority: true,
        expanded: false
      },
      {
        title: "建立行业影响力",
        description: "通过技术博客、开源项目、行业演讲等方式建立个人品牌。让更多人认识你的专业能力，为职业发展创造更多机会。",
        priority: false,
        expanded: false
      }
    ],
    reflection: "技术领导者的价值不在于写了多少行代码，而在于能够指引方向、解决问题、成就他人。每一次技术决策都关系到项目的成败，每一次人员安排都影响着团队的效率。"
  },
  2: { // 攒够100万首付买房
    title: "财富自由的起点",
    subtitle: "第一桶金不只是数字，是选择的自由",
    icon: DollarSign,
    futureState: "当你手握那张100万的银行存单时，你感受到的不仅仅是数字的增长，更是选择的自由和安全感的获得。你可以从容地选择心仪的房子，不用再为房租上涨而焦虑。",
    insights: [
      { 
        title: "理财是一种生活态度", 
        description: "理财不是为了限制生活，而是为了让生活更有质量。每一分钱的合理安排，都是对未来的负责任投资。",
        icon: DollarSign,
        highlight: true,
        expanded: false
      },
      { 
        title: "复利是世界第八大奇迹", 
        description: "时间是最好的朋友，复利是最强的武器。早一天开始投资，就多一天享受复利的魔力。",
        icon: TrendingUp,
        highlight: false,
        expanded: false
      },
      { 
        title: "财务自由始于财务自律", 
        description: "控制欲望不是压抑自己，而是为了获得更大的自由。今天的节制是为了明天的从容。",
        icon: Trophy,
        highlight: false,
        expanded: false
      }
    ],
    actions: [
      {
        title: "制定详细的储蓄计划",
        description: "设定明确的月度储蓄目标，自动化转账让储蓄成为习惯。把储蓄当作必要开支来对待，优先满足。",
        priority: true,
        expanded: false
      },
      {
        title: "学习投资理财知识",
        description: "系统学习基金、股票、债券等投资工具，建立适合自己的投资组合。不把鸡蛋放在一个篮子里。",
        priority: true,
        expanded: false
      },
      {
        title: "增加收入来源",
        description: "在本职工作之外，探索副业机会或技能变现。多元化的收入结构能够加速财富积累的进程。",
        priority: false,
        expanded: false
      }
    ],
    reflection: "财富积累是一个漫长的过程，需要耐心、纪律和智慧。每一次的消费决策都是在选择当下的享受还是未来的自由。当你学会延迟满足，学会让金钱为你工作而不是你为金钱工作时，你就掌握了财富的密码。"
  },
  3: { // 2年内考取PMP证书和AWS架构师认证
    title: "终身学习的复利效应",
    subtitle: "每一个证书都是新能力的证明",
    icon: BookOpen,
    futureState: "2年后的你：桌上摆放着PMP和AWS架构师认证的证书，这不仅仅是两张纸，而是你不断学习和成长的见证。你拥有了项目管理和云计算架构的双重能力，成为市场上稀缺的复合型人才。",
    insights: [
      { 
        title: "学习是最好的投资", 
        description: "知识是唯一不会贬值的资产。每一次学习都在为未来的自己增值，每一个技能都是竞争力的提升。",
        icon: BookOpen,
        highlight: true,
        expanded: false
      },
      { 
        title: "认证是能力的证明", 
        description: "在信息爆炸的时代，权威认证是快速建立信任的方式。它让你的能力可视化，让机会更容易发现你。",
        icon: Star,
        highlight: false,
        expanded: false
      },
      { 
        title: "持续学习是核心竞争力", 
        description: "在快速变化的时代，学习能力比已有知识更重要。保持学习的热情和能力，才能在变化中保持不变的竞争优势。",
        icon: Trophy,
        highlight: false,
        expanded: false
      }
    ],
    actions: [
      {
        title: "制定系统学习计划",
        description: "将学习目标分解为具体的学习任务，设定每日、每周的学习计划。把学习当作工作一样认真对待。",
        priority: true,
        expanded: false
      },
      {
        title: "实践与理论结合",
        description: "在工作中寻找应用所学知识的机会，通过实践深化理解。理论指导实践，实践验证理论。",
        priority: true,
        expanded: false
      },
      {
        title: "建立学习社群",
        description: "加入相关的学习群体，与同样在学习路上的人互相鼓励和交流。集体学习的氛围能够提高学习效率。",
        priority: false,
        expanded: false
      }
    ],
    reflection: "学习是一场马拉松，不是短跑。每一次的坚持都在积累能量，每一个知识点的掌握都在扩展可能性的边界。认证只是学习成果的一种体现，更重要的是在学习过程中培养的思维方式和解决问题的能力。"
  },
  4: { // 修复家庭关系，建立深度友谊圈
    title: "人生支持系统的重建",
    subtitle: "关系是人生最大的财富",
    icon: Users,
    futureState: "当你拥有深度的人际关系时，生活的意义变得完全不同。每个重要时刻都有人分享你的喜悦，每个困难时刻都有人给予你支持。家人的理解让你感到温暖，朋友的陪伴让你不再孤单。",
    insights: [
      { 
        title: "关系需要用心经营", 
        description: "好的关系不会自然而然地维持，它需要时间、精力和真心的投入。每一次的关怀都是在为关系账户存款。",
        icon: Heart,
        highlight: true,
        expanded: false
      },
      { 
        title: "真诚是最好的沟通方式", 
        description: "人与人之间的信任建立在真诚的基础上。放下防备，真诚地表达自己，也真诚地倾听他人。",
        icon: Users,
        highlight: false,
        expanded: false
      },
      { 
        title: "给予比得到更快乐", 
        description: "在人际关系中，主动给予关爱和帮助的人往往收获更多。播种善意，收获友谊。",
        icon: Star,
        highlight: false,
        expanded: false
      }
    ],
    actions: [
      {
        title: "主动修复家庭关系",
        description: "放下过去的误解和芥蒂，主动与家人沟通。理解他们的想法，表达自己的关爱。血浓于水的亲情值得用一生去珍惜。",
        priority: true,
        expanded: false
      },
      {
        title: "深化现有友谊",
        description: "对现有的朋友投入更多时间和关注，从表面的社交深入到心灵的交流。质量比数量更重要。",
        priority: true,
        expanded: false
      },
      {
        title: "扩展社交圈子",
        description: "参加有意义的社交活动，结识志同道合的新朋友。在共同的兴趣和价值观基础上建立新的友谊。",
        priority: false,
        expanded: false
      }
    ],
    reflection: "人是社会性动物，没有人能够完全独立地生活。我们需要爱与被爱，需要理解与被理解，需要支持与被支持。建立深度的人际关系不仅仅是为了获得帮助，更是为了让生命变得更加丰富和有意义。"
  }
}

// 计算属性
const currentDreamVision = computed(() => {
  return dreamVisions[props.activeDreamIndex] || dreamVisions[0]
})

const currentInsights = computed(() => {
  return currentDreamVision.value?.insights || []
})

const currentActions = computed(() => {
  return currentDreamVision.value?.actions || []
})

// 方法
const handleBack = () => {
  emit('back')
}

const handleShare = () => {
  emit('share', {
    dream: currentDreamVision.value,
    index: props.activeDreamIndex
  })
}

const setActiveDream = (index) => {
  emit('setActiveDream', index)
}

const toggleInsightDetail = (index) => {
  if (currentInsights.value[index]) {
    currentInsights.value[index].expanded = !currentInsights.value[index].expanded
  }
}

const toggleActionDetail = (index) => {
  if (currentActions.value[index]) {
    currentActions.value[index].expanded = !currentActions.value[index].expanded
  }
}

const handleStartPlanning = () => {
  emit('startPlanning', {
    dream: currentDreamVision.value,
    index: props.activeDreamIndex
  })
}

const handleSaveDream = () => {
  emit('saveDream', {
    dream: currentDreamVision.value,
    index: props.activeDreamIndex
  })
}
</script>

<style lang="scss" scoped>
.dream-vision-screen {
  position: fixed;
  top: -100vh;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 15;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  // 背景图片
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('@/assets/xk (2).jpg') center center/cover;
    z-index: -1;
    pointer-events: none;
  }
  
  .dream-vision-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    
    // 顶部导航栏
    .top-navigation {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      .nav-left {
        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          padding: 0.5rem 1rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          
          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(-2px);
          }
          
          &:active {
            transform: translateX(-1px);
          }
        }
      }
      
      .nav-center {
        .dream-indicator {
          .indicator-dots {
            display: flex;
            gap: 0.5rem;
            
            .dot {
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.3);
              transition: all 0.3s ease;
              cursor: pointer;
              
              &:hover {
                background: rgba(255, 255, 255, 0.5);
                transform: scale(1.2);
              }
              
              &.active {
                background: rgba(255, 255, 255, 0.9);
                transform: scale(1.3);
                box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
              }
            }
          }
        }
      }
      
      .nav-right {
        .share-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
          cursor: pointer;
          
          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
          }
          
          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
    
    // 主要内容区域
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      // 星球动画区域
      .planet-animation-section {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem 0;
        margin-bottom: 1rem;
        
        // 星球动画容器样式
        :deep(.planet-orbit-container) {
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 0 30px rgba(74, 144, 226, 0.2),
            inset 0 0 30px rgba(74, 144, 226, 0.1);
        }
      }
      
      // 梦想标题区域
      .dream-header-section {
        padding: 2rem 1.5rem 1.5rem;
        text-align: center;
        
        .dream-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.9);
          animation: iconFloat 3s ease-in-out infinite;
        }
        
        .dream-title {
          font-size: 2rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }
        
        .dream-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          line-height: 1.4;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
      }
      
      // 可滚动内容区域
      .scrollable-content {
        flex: 1;
        overflow-y: auto;
        padding: 0 1.5rem 1rem;
        
        // 自定义滚动条
        &::-webkit-scrollbar {
          width: 4px;
        }
        
        &::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          
          &:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        }
        
        // 卡片通用样式
        .vision-card,
        .insights-card,
        .actions-card,
        .reflection-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          }
          
          .card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1.25rem 1.5rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            
            .card-icon {
              color: rgba(255, 255, 255, 0.7);
              animation: iconPulse 2s ease-in-out infinite;
            }
            
            .card-title {
              font-size: 1.1rem;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.9);
              margin: 0;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
          }
          
          .card-content {
            padding: 1rem 1.5rem 1.5rem;
            
            .vision-text {
              font-size: 0.95rem;
              color: rgba(255, 255, 255, 0.85);
              line-height: 1.6;
              margin: 0;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
          }
        }
        
        // 洞察卡片特殊样式
        .insights-card {
          .insights-grid {
            padding: 1rem 1.5rem 1.5rem;
            
            .insight-item {
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 0.75rem;
              margin-bottom: 1rem;
              overflow: hidden;
              transition: all 0.3s ease;
              cursor: pointer;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              &:hover {
                border-color: rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.03);
              }
              
              &.highlight {
                border-color: rgba(59, 130, 246, 0.4);
                background: rgba(59, 130, 246, 0.05);
                
                .insight-header .insight-icon {
                  color: #3b82f6;
                  animation: highlightGlow 2s ease-in-out infinite;
                }
              }
              
              .insight-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                
                .insight-icon {
                  color: rgba(255, 255, 255, 0.7);
                  flex-shrink: 0;
                }
                
                .insight-title {
                  flex: 1;
                  font-size: 0.9rem;
                  font-weight: 600;
                  color: rgba(255, 255, 255, 0.95);
                  margin: 0;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }
                
                .insight-toggle {
                  color: rgba(255, 255, 255, 0.6);
                  transition: transform 0.3s ease;
                  
                  .rotated {
                    transform: rotate(180deg);
                  }
                }
              }
              
              .insight-description {
                max-height: 0;
                overflow: hidden;
                padding: 0 1rem;
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.5;
                transition: all 0.3s ease;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                
                &.expanded {
                  max-height: 200px;
                  padding: 0 1rem 1rem;
                }
              }
            }
          }
        }
        
        // 行动卡片特殊样式
        .actions-card {
          .actions-list {
            padding: 1rem 1.5rem 1.5rem;
            
            .action-item {
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 0.75rem;
              margin-bottom: 1rem;
              overflow: hidden;
              transition: all 0.3s ease;
              cursor: pointer;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              &:hover {
                border-color: rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.03);
              }
              
              &.priority {
                border-color: rgba(34, 197, 94, 0.4);
                background: rgba(34, 197, 94, 0.05);
                
                .action-header .action-number {
                  background: #22c55e;
                  color: white;
                  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
                }
              }
              
              .action-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                
                .action-number {
                  width: 2rem;
                  height: 2rem;
                  background: rgba(255, 255, 255, 0.2);
                  color: rgba(255, 255, 255, 0.9);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 0.8rem;
                  font-weight: 600;
                  flex-shrink: 0;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }
                
                .action-content {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  
                  .action-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.95);
                    margin: 0;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                  }
                  
                  .action-toggle {
                    color: rgba(255, 255, 255, 0.6);
                    transition: transform 0.3s ease;
                    
                    .rotated {
                      transform: rotate(180deg);
                    }
                  }
                }
              }
              
              .action-description {
                max-height: 0;
                overflow: hidden;
                padding: 0 1rem;
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.5;
                transition: all 0.3s ease;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                
                &.expanded {
                  max-height: 200px;
                  padding: 0 1rem 1rem;
                }
              }
            }
          }
        }
        
        // 反思卡片特殊样式
        .reflection-card {
          .reflection-content {
            position: relative;
            padding: 1.5rem;
            text-align: center;
            
            .quote-marks {
              position: absolute;
              font-size: 3rem;
              color: rgba(255, 255, 255, 0.2);
              font-family: serif;
              
              &:first-child {
                top: 0.5rem;
                left: 1rem;
              }
              
              &:last-child {
                bottom: -0.5rem;
                right: 1rem;
              }
            }
            
            .reflection-text {
              font-size: 0.95rem;
              color: rgba(255, 255, 255, 0.85);
              line-height: 1.6;
              margin: 0;
              font-style: italic;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
          }
        }
      }
    }
    
    // 底部操作栏
    .bottom-actions {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.5rem 1.5rem;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      
      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        border-radius: 0.75rem;
        font-size: 0.9rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
        
        &.secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
          
          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
}

// 动画效果
@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes iconPulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes highlightGlow {
  0%, 100% {
    color: #3b82f6;
    filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.3));
  }
  50% {
    color: #60a5fa;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
}
</style>