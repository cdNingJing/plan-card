<template>
  <div class="task-home-container">
    <!-- 第二屏组件 -->
    <SecondScreen
      :dreams="dreams"
      :activeDreamIndex="activeDreamIndex"
      :verticalTranslateY="verticalTranslateY"
    />

    <!-- 可移动的内容区（title + 卡片） -->
    <div 
      class="movable-content"
      :style="{ transform: `translateY(${verticalTranslateY}px)` }"
    >
      <!-- 梦想标题组件 -->
      <DreamHeader
        :dreams="dreams"
        :activeDreamIndex="activeDreamIndex"
        :dreamTitleTranslateX="dreamTitleTranslateX"
        :isDreamFollowing="isDreamFollowing"
        :verticalTranslateY="verticalTranslateY"
        :containerHeight="containerHeight"
        @setActiveDream="setActiveDream"
      />

      <!-- 主内容区域组件 -->
      <MainContentArea
        :dreams="dreams"
        :activeDreamIndex="activeDreamIndex"
        :cardsTranslateX="cardsTranslateX"
      />
    </div>

    <!-- 固定底部对话框组件 -->
    <FixedBottomBar
      :dreams="dreams"
      :activeDreamIndex="activeDreamIndex"
      :verticalTranslateY="verticalTranslateY"
      :containerHeight="containerHeight"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SecondScreen from '@/components/task-home/SecondScreen.vue'
import DreamHeader from '@/components/task-home/DreamHeader.vue'
import MainContentArea from '@/components/task-home/MainContentArea.vue'
import FixedBottomBar from '@/components/task-home/FixedBottomBar.vue'

// 数据定义
const dreams = ref([
  {
    id: 1,
    title: '年底前减重20斤，重拾健康活力',
    cards: [
      { 
        quadrant: 'important-urgent', 
        priority: '重要紧急',
        tasks: [
          { title: '立即停止暴饮暴食', description: '每天晚8点后禁食，戒掉奶茶、炸鸡等高热量食物，建立饮食自律' },
          { title: '办健身房年卡', description: '本周内选定离家最近的健身房，办理年卡并预约私教课程，确保每周至少去3次' },
          { title: '买跑鞋', description: '专业跑步鞋一双' }
        ]
      },
      { 
        quadrant: 'important-not-urgent', 
        priority: '重要不紧急',
        tasks: [
          { title: '学会做健康餐', description: '每周学一道低脂高蛋白菜品，掌握蒸煮炖等健康烹饪方式，逐步替代外卖依赖' },
          { title: '建立运动习惯', description: '制定详细的运动时间表：周一三五跑步，周二四做力量训练，周末爬山或游泳，形成稳定的运动节奏' },
          { title: '早睡早起', description: '11点前上床睡觉' }
        ]
      },
      { 
        quadrant: 'not-important-urgent', 
        priority: '不重要紧急',
        tasks: [
          { title: '处理体检异常指标', description: '尽快复查血脂和血糖偏高问题，预约营养师咨询，调整饮食结构，避免发展成慢性病' },
          { title: '戒掉熬夜追剧', description: '删除手机上的视频APP' }
        ]
      },
      { 
        quadrant: 'not-important-not-urgent', 
        priority: '不重要不紧急',
        tasks: [
          { title: '研究减脂知识', description: '系统学习营养学基础、卡路里计算方法、基础代谢率等专业知识，建立科学的减重认知体系' },
          { title: '买体脂秤', description: '精准监测体重变化' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: '3年内晋升技术主管，实现年薪50万目标',
    cards: [
      { 
        quadrant: 'important-urgent', 
        priority: '重要紧急',
        tasks: [
          { title: '完成电商系统重构项目', description: '本月底前交付用户管理模块和支付系统的微服务改造，确保性能提升30%以上，为升职加薪创造条件' },
          { title: '处理线上支付bug', description: '紧急修复支付回调异常' },
          { title: '准备晋升述职', description: '整理过去一年的工作成果、技术贡献和团队管理经验，准备详细的晋升材料' }
        ]
      },
      { 
        quadrant: 'important-not-urgent', 
        priority: '重要不紧急',
        tasks: [
          { title: '深度学习微服务架构', description: '系统掌握Spring Cloud、Docker、Kubernetes等核心技术，能够独立设计和实施大型分布式系统架构' },
          { title: '建立个人技术品牌', description: '开始写技术博客，在GitHub上维护开源项目，参加技术会议分享，在行业内建立影响力' },
          { title: '学英语', description: '每天背50个单词' }
        ]
      },
      { 
        quadrant: 'not-important-urgent', 
        priority: '不重要紧急',
        tasks: [
          { title: '参加公司季度培训', description: '完成公司要求的管理培训和合规培训课程，获取相应的内部认证' },
          { title: '准备部门技术分享', description: '下周三做微服务实践分享' }
        ]
      },
      { 
        quadrant: 'not-important-not-urgent', 
        priority: '不重要不紧急',
        tasks: [
          { title: '整理过往项目文档', description: '系统整理和归档过去两年参与的所有项目资料，包括需求文档、技术方案、代码注释等，建立完整的个人项目档案' },
          { title: '升级开发工具', description: '更新IDE和插件版本' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: '攒够100万首付买房',
    cards: [
      { 
        quadrant: 'important-urgent', 
        priority: '重要紧急',
        tasks: [
          { title: '还清所有信用卡债务', description: '优先偿清年利率18%的招行信用卡3.2万欠款，再处理建行1.8万，彻底摆脱高利息负担' },
          { title: '申请房贷预审', description: '到银行申请房贷预审批，了解可贷额度和利率，为买房做准备' }
        ]
      },
      { 
        quadrant: 'important-not-urgent', 
        priority: '重要不紧急',
        tasks: [
          { title: '建立稳健投资组合', description: '配置60%指数基金+30%债券基金+10%股票的投资组合，每月定投5000元，通过复利实现财富增长' },
          { title: '深度学习理财知识', description: '系统学习《聪明的投资者》等经典书籍，掌握价值投资理念和风险管理策略' },
          { title: '存应急资金', description: '存够10万应急资金' }
        ]
      },
      { 
        quadrant: 'not-important-urgent', 
        priority: '不重要紧急',
        tasks: [
          { title: '续缴重疾险保费', description: '本月底前缴纳年保费1.2万，确保保障不中断，为家庭提供风险保障' },
          { title: '更新银行预留信息', description: '更新手机号和地址' }
        ]
      },
      { 
        quadrant: 'not-important-not-urgent', 
        priority: '不重要不紧急',
        tasks: [
          { title: '建立详细记账系统', description: '使用专业记账软件记录每一笔收支，分析消费结构，找出节流空间，为实现储蓄目标制定计划' },
          { title: '整理银行卡', description: '注销不用的银行卡账户' }
        ]
      }
    ]
  },
  {
    id: 4,
    title: '2年内考取PMP证书和AWS架构师认证',
    cards: [
      { 
        quadrant: 'important-urgent', 
        priority: '重要紧急',
        tasks: [
          { title: '考取AWS架构师认证', description: '6个月内通过AWS Solutions Architect Professional考试，提升云计算专业技能和市场竞争力' },
          { title: '准备PMP考试', description: '整理项目管理知识体系' }
        ]
      },
      { 
        quadrant: 'important-not-urgent', 
        priority: '重要不紧急',
        tasks: [
          { title: '系统阅读管理类书籍', description: '深度阅读《从优秀到卓越》《原则》等经典管理书籍，建立完整的管理思维框架和领导力体系' },
          { title: '建立知识管理系统', description: '搭建个人知识库，系统整理学习笔记和心得体会，形成可复用的知识资产' },
          { title: '加入学习社群', description: '参加技术管理类读书会' }
        ]
      },
      { 
        quadrant: 'not-important-urgent', 
        priority: '不重要紧急',
        tasks: [
          { title: '参加行业技术大会', description: '参加QCon、ArchSummit等顶级技术大会，了解行业前沿趋势和最佳实践' },
          { title: '完成极客时间课程', description: '完成已购买的架构课程' }
        ]
      },
      { 
        quadrant: 'not-important-not-urgent', 
        priority: '不重要不紧急',
        tasks: [
          { title: '建立学习档案', description: '系统整理过去5年的学习资料、证书、项目经验等，建立完整的个人成长档案' },
          { title: '优化学习工具', description: '升级Notion等知识管理工具' }
        ]
      }
    ]
  },
  {
    id: 5,
    title: '修复家庭关系，建立深度友谊圈',
    cards: [
      { 
        quadrant: 'important-urgent', 
        priority: '重要紧急',
        tasks: [
          { title: '修复与父母的关系', description: '主动与父母进行深度沟通，理解他们的想法与不安，解决多年来的误解和隔阙' },
          { title: '组织家庭团聚', description: '每月至少一次家庭聚餐' }
        ]
      },
      { 
        quadrant: 'important-not-urgent', 
        priority: '重要不紧急',
        tasks: [
          { title: '深化核心朋友圈', description: '与5-8个最重要的朋友建立更深层次的连接，定期深度交流，建立相互支持的友谊' },
          { title: '加入专业社群', description: '加入技术管理者的交流群体，扩大职业人脈网络，学习行业最佳实践' },
          { title: '参加技术聚会', description: '定期参加本地技术 meetup' }
        ]
      },
      { 
        quadrant: 'not-important-urgent', 
        priority: '不重要紧急',
        tasks: [
          { title: '及时处理工作沟通', description: '在24小时内回复所有工作相关的消息和邀请，维持专业形象' },
          { title: '精选参加活动', description: '合理筛选社交活动' }
        ]
      },
      { 
        quadrant: 'not-important-not-urgent', 
        priority: '不重要不紧急',
        tasks: [
          { title: '维护个人形象', description: '定期更新个人简历和职业社交媒体资料，展示专业成就和成长经历，建立良好的职业形象' },
          { title: '学习沟通技巧', description: '阅读沟通类书籍' }
        ]
      }
    ]
  }
])

// 响应式状态
const activeDreamIndex = ref(0) // 默认第一个（最左侧）为激活状态
const dreamTitleTranslateX = ref(0)
const cardsTranslateX = ref(0)

// 垂直移动相关
const verticalTranslateY = ref(0) // 长方形容器的垂直位移
const pullDownProgress = ref(0) // 下拉进度 (0-1)
const isSecondScreenVisible = ref(false) // 第二屏是否可见

// 梦想文字跟随效果
const isDreamFollowing = ref(false)
const dreamFollowProgress = ref(0)

// 计算属性
const containerWidth = ref(window.innerWidth || 375)
const containerHeight = ref(window.innerHeight || 812)
const dreamTitleSpacing = ref(32) // 2rem间距，固定间距而非固定宽度


// 设置激活的梦想
const setActiveDream = (index) => {
  if (index === activeDreamIndex.value) return
  
  activeDreamIndex.value = index
  updateDreamTitlePosition()
  updateCardsPosition()
}

// 更新梦想标题位置（以左侧为主排列）- 固定间距移动
const updateDreamTitlePosition = () => {
  // 使用固定间距而不是动态宽度计算
  const leftMargin = dreamTitleSpacing.value // 2rem左边距
  const fixedTitleWidth = 260 // 固定标题宽度，约16.25rem
  const titleSpacing = dreamTitleSpacing.value // 标题之间的固定间距
  
  // 计算选中项之前的固定偏移距离
  const offsetBeforeActive = activeDreamIndex.value * (fixedTitleWidth + titleSpacing)
  
  // 将选中的标题移动到左侧位置
  dreamTitleTranslateX.value = leftMargin - offsetBeforeActive
}

// 更新卡片位置 - 一张纸的不同区域
const updateCardsPosition = () => {
  // 将整个卡片区域想象成一张长纸，我们只是在看不同的部分
  const cardContainerWidth = containerWidth.value
  // 平滑移动到对应的纸张区域
  cardsTranslateX.value = -activeDreamIndex.value * cardContainerWidth
}

// 手势处理
let touchStartX = 0
let touchStartY = 0
let touchCurrentX = 0
let touchCurrentY = 0
let isHorizontalSwipe = false
let isVerticalSwipe = false
let isDragging = false

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchCurrentX = touchStartX
  touchCurrentY = touchStartY
  isHorizontalSwipe = false
  isVerticalSwipe = false
  isDragging = false
}

const handleTouchMove = (e) => {
  touchCurrentX = e.touches[0].clientX
  touchCurrentY = e.touches[0].clientY
  
  const deltaX = touchCurrentX - touchStartX
  const deltaY = touchCurrentY - touchStartY
  
  // 判断滑动方向
  if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
    isDragging = true
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      isHorizontalSwipe = true
    } else {
      isVerticalSwipe = true
    }
  }
  
  if (isHorizontalSwipe) {
    // 水平滑动 - 切换梦想
    handleHorizontalSwipe(deltaX)
  } else if (isVerticalSwipe) {
    // 垂直滑动 - 移动长方形容器
    handleVerticalSwipe(deltaY)
  }
}

const handleTouchEnd = () => {
  if (isHorizontalSwipe) {
    // 完成水平滑动切换
    finishHorizontalSwipe()
  } else if (isVerticalSwipe) {
    // 完成垂直滑动切换
    finishVerticalSwipe()
  }
  
  // 重置状态
  isDragging = false
  isHorizontalSwipe = false
  isVerticalSwipe = false
}

// 处理水平滑动 - 纸张水平移动
const handleHorizontalSwipe = (deltaX) => {
  // 检查边界限制
  const direction = deltaX > 0 ? 1 : -1 // 右滑为1，左滑为-1
  const nextIndex = activeDreamIndex.value - direction
  
  // 如果到达边界，限制移动距离
  let limitedDeltaX = deltaX
  if (nextIndex < 0 && deltaX > 0) {
    // 到达左边界，限制右滑距离
    limitedDeltaX = Math.max(0, Math.min(deltaX, containerWidth.value * 0.3))
  } else if (nextIndex >= dreams.value.length && deltaX < 0) {
    // 到达右边界，限制左滑距离
    limitedDeltaX = Math.min(0, Math.max(deltaX, -containerWidth.value * 0.3))
  }
  
  // 实时跟随手指移动，像移动纸张一样
  const cardCurrentPosition = -activeDreamIndex.value * containerWidth.value
  
  // 临时移动卡片位置，跟随手势
  cardsTranslateX.value = cardCurrentPosition + limitedDeltaX
  
  // 同时移动标题位置，保持同步
  // 使用固定间距计算基础位置
  const leftMargin = dreamTitleSpacing.value
  const fixedTitleWidth = 260 // 固定标题宽度
  const titleSpacing = dreamTitleSpacing.value // 标题之间的固定间距
  
  // 计算选中项之前的固定偏移距离
  const offsetBeforeActive = activeDreamIndex.value * (fixedTitleWidth + titleSpacing)
  const baseTitlePosition = leftMargin - offsetBeforeActive
  
  // 标题跟随手势移动，但移动幅度小一些，增加层次感
  dreamTitleTranslateX.value = baseTitlePosition + (limitedDeltaX * 0.3)
}

// 完成水平滑动 - 纸张停靠到最近的位置
const finishHorizontalSwipe = () => {
  const deltaX = touchCurrentX - touchStartX
  const threshold = containerWidth.value * 0.2 // 20%的屏幕宽度作为阈值
  const direction = deltaX > 0 ? 1 : -1 // 右滑为1，左滑为-1
  
  if (Math.abs(deltaX) > threshold) {
    let newIndex = activeDreamIndex.value - direction
    
    // 移除无缝循环，边界处理
    if (newIndex < 0) {
      newIndex = 0 // 到达左边界，停留在第一个
    } else if (newIndex >= dreams.value.length) {
      newIndex = dreams.value.length - 1 // 到达右边界，停留在最后一个
    }
    
    // 只有索引真的改变了才切换
    if (newIndex !== activeDreamIndex.value) {
      setActiveDream(newIndex)
    } else {
      // 到达边界，回弹到当前位置
      updateCardsPosition()
      updateDreamTitlePosition()
    }
  } else {
    // 回弹到当前位置
    updateCardsPosition()
    updateDreamTitlePosition()
  }
}

// 处理垂直滑动 - 移动title和卡片
const handleVerticalSwipe = (deltaY) => {
  const screenHeight = window.innerHeight || 812
  
  if (deltaY > 0 && !isSecondScreenVisible.value) {
    // 第一屏向下滑动 - 可移动内容向下移动
    const maxDistance = screenHeight * 0.4 // 40%屏高为完全切换的阈值
    const progress = Math.min(deltaY / maxDistance, 1)
    
    // 更新下拉进度
    pullDownProgress.value = progress
    
    // 限制最大移动距离
    const maxMove = screenHeight * 0.8
    const actualMove = Math.min(deltaY, maxMove)
    
    // 可移动内容（title + 卡片）向下移动
    verticalTranslateY.value = actualMove
    
    // 当下拉进度达到50%时，标记第二屏为可见状态
    if (progress >= 0.5) {
      isSecondScreenVisible.value = true
    }
  } else if (deltaY < 0 && isSecondScreenVisible.value) {
    // 第二屏向上滑动 - 可移动内容向上移动
    const currentTranslate = verticalTranslateY.value
    const upwardMove = Math.abs(deltaY)
    const newTranslate = Math.max(0, currentTranslate - upwardMove)
    
    verticalTranslateY.value = newTranslate
    
    // 更新进度
    const progress = newTranslate / screenHeight
    pullDownProgress.value = progress
    
    // 如果移动到接近第一屏位置，更新可见状态
    if (newTranslate < screenHeight * 0.5) {
      isSecondScreenVisible.value = false
    }
  } else if (deltaY > 0 && isSecondScreenVisible.value) {
    // 第二屏向下滑动 - 有边界限制，只允许少量移动
    const currentTranslate = verticalTranslateY.value
    const maxBoundary = screenHeight * 1.1 // 允许超出10%作为边界反馈
    const limitedMove = Math.min(deltaY * 0.3, screenHeight * 0.1) // 限制移动幅度
    const newTranslate = Math.min(maxBoundary, currentTranslate + limitedMove)
    
    verticalTranslateY.value = newTranslate
  }
}

// 完成垂直滑动 - 决定最终位置
const finishVerticalSwipe = () => {
  const deltaY = touchCurrentY - touchStartY
  const screenHeight = window.innerHeight || 812
  const threshold = screenHeight * 0.25 // 25%屏高作为切换阈值
  
  if (!isSecondScreenVisible.value && deltaY > threshold) {
    // 从第一屏向下滑动超过阈值 - 切换到第二屏
    switchToSecondScreen()
  } else if (isSecondScreenVisible.value && deltaY < -threshold) {
    // 从第二屏向上滑动超过阈值 - 切换到第一屏
    switchToFirstScreen()
  } else if (isSecondScreenVisible.value) {
    // 第二屏的滑动没有超过阈值 - 回弹到第二屏位置
    switchToSecondScreen()
  } else {
    // 第一屏的滑动没有超过阈值 - 回到第一屏
    switchToFirstScreen()
  }
}

// 切换到第二屏
const switchToSecondScreen = () => {
  const screenHeight = window.innerHeight || 812
  
  // 可移动内容向下移动一个屏高，显示第二屏
  verticalTranslateY.value = screenHeight
  
  // 标记第二屏为可见状态
  isSecondScreenVisible.value = true
  pullDownProgress.value = 1
}

// 切换到第一屏
const switchToFirstScreen = () => {
  // 长方形容器回到原位
  verticalTranslateY.value = 0
  
  // 重置状态
  pullDownProgress.value = 0
  isSecondScreenVisible.value = false
}


// 绑定事件
const bindEvents = () => {
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
  
  window.addEventListener('resize', () => {
    containerWidth.value = window.innerWidth
    containerHeight.value = window.innerHeight
    updateDreamTitlePosition()
    updateCardsPosition()
  })
}

// 解绑事件
const unbindEvents = () => {
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  window.removeEventListener('resize', () => {})
}

// 生命周期
onMounted(() => {
  containerWidth.value = window.innerWidth || 375
  containerHeight.value = window.innerHeight || 812
  updateDreamTitlePosition()
  updateCardsPosition()
  bindEvents()
})

onUnmounted(() => {
  unbindEvents()
})
</script>

<style lang="scss" scoped>
.task-home-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

// 长方形容器
.rectangle-container {
  position: absolute;
  top: -100vh; // 向上偏移一个屏高，让第一屏（下方）显示在视窗中
  left: 0;
  width: 100%;
  height: 200vh; // 两倍屏高，包含两个屏幕
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  .screen-section {
    width: 100%;
    height: 50%; // 每个屏幕占50%高度（即一个屏幕高度）
    position: relative;
  }
  
  // 第一屏（下方）
  .first-screen {
    
    // dream-header移动到第二屏时的位置
    .dream-header.dream-header-moved {
      top: auto !important;
      bottom: 5rem !important; // 在底部输入框上方
      z-index: 150 !important;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    }
    
    .fixed-bottom-bar {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      height: 3rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 2rem;
      border: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      
      .bottom-content {
        font-size: 1rem;
        font-weight: 500;
        color: #333;
        text-align: center;
      }
    }
  }
}


// 可移动的内容区（title + 卡片）
.movable-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: white;
  z-index: 10;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

</style>