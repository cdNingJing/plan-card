<template>
  <div class="new-home-container">
    <!-- 现实维度层（首页） -->
    <div class="reality-dimension-layer">
      <!-- 顶部滑动区域（梦想块） -->
      <div class="dream-slider-area">
        <DreamBlockSlider 
          :dreams="dreams" 
          @change="handleDreamChange"
          @show-hyper-time="handleShowHyperTime"
        />
      </div>
      
      <!-- 卡片展示区域 -->
      <div class="cards-area">
        <CardGrid 
          :active-dream="activeDream"
          :universal-cards="universalCards"
          :specific-cards="specificCards"
        />
      </div>
    </div>
    
    <!-- 超时间维度层（渐进式覆盖） -->
    <div 
      class="hyper-time-dimension-layer"
      :class="{ 
        'expanded': isHyperTimeExpanded, 
        'closing': isHyperTimeClosing,
        'gesture-driven': hyperTimeProgress > 0 && !isHyperTimeExpanded 
      }"
      :style="{ 
        opacity: isHyperTimeExpanded ? 1 : Math.max(0, hyperTimeProgress * 0.8),
        transform: `translateY(${isHyperTimeExpanded ? 0 : (-100 + hyperTimeProgress * 100)}%)`
      }"
    >
      <HyperTimeDimensionLayer 
        :dream="activeDream"
        :current-index="activeDreamIndex"
        :total-cards="dreams.length"
        @close="closeHyperTimeLayer"
      />
    </div>
    
    <!-- 底部固定输入框 -->
    <div class="bottom-input-area">
      <BottomInputBox 
        :is-hyper-time-expanded="isHyperTimeExpanded"
        :gesture-progress="hyperTimeProgress"
        @voice-command="handleVoiceCommand"
        @text-command="handleTextCommand"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import DreamBlockSlider from '@/components/DreamBlockSlider.vue'
import CardGrid from '@/components/CardGrid.vue'
import HyperTimeDimensionLayer from '@/components/HyperTimeDimensionLayer.vue'
import BottomInputBox from '@/components/BottomInputBox.vue'

export default {
  name: 'NewHomeView',
  components: {
    DreamBlockSlider,
    CardGrid,
    HyperTimeDimensionLayer,
    BottomInputBox
  },
  setup() {
    
    // 响应式数据
    const dreams = ref([])
    const activeDreamIndex = ref(0)
    const isHyperTimeExpanded = ref(false)
    const isHyperTimeClosing = ref(false)
    const universalCards = ref([])
    const specificCards = ref([])
    
    // 手势驱动动画相关
    const isLongPressing = ref(false)
    const hyperTimeProgress = ref(0)
    
    // 计算属性
    const activeDream = computed(() => {
      return dreams.value[activeDreamIndex.value] || null
    })
    
    // 事件处理
    const handleDreamChange = (index) => {
      activeDreamIndex.value = index
      loadSpecificCards(dreams.value[index])
    }
    
    const handleVoiceCommand = (command) => {
      // 处理语音命令
      console.log('Voice command:', command)
      // TODO: 实现语音命令处理逻辑
    }
    
    const handleTextCommand = (command) => {
      // 处理文本命令
      console.log('Text command:', command)
      // TODO: 实现文本命令处理逻辑
    }
    
    const handleShowHyperTime = (dream) => {
      // 点击梦想块时展开超时间层
      activeDreamIndex.value = dreams.value.findIndex(d => d.id === dream.id)
      isHyperTimeExpanded.value = true
    }
    
    const closeHyperTimeLayer = () => {
      isHyperTimeClosing.value = true
      // 延迟设置expanded为false，让收起动画先执行
      setTimeout(() => {
        isHyperTimeExpanded.value = false
        isHyperTimeClosing.value = false
      }, 400) // 400ms对应收起动画时长
    }
    
    // 数据加载方法
    const loadDreams = async () => {
      // TODO: 从API或存储加载梦想数据
      dreams.value = [
        { 
          id: 1, 
          title: '孩子考哈佛', 
          description: '全面培养孩子学术能力，冲刺世界顶尖名校', 
          progress: 65,
          tags: ['教育', '学习', '成长'],
          totalSteps: 12,
          deadline: '2026-06-01',
          hyperTimeData: {
            history: [
              { date: '2023-01-15', title: '制定教育规划', description: '与教育顾问制定详细的升学计划', status: 'completed' },
              { date: '2023-06-20', title: 'SAT首次考试', description: '首次SAT考试得分1480分', status: 'completed' },
              { date: '2023-09-10', title: '课外活动启动', description: '开始参与机器人竞赛和志愿服务', status: 'completed' },
              { date: '2024-01-15', title: 'SAT二次考试', description: '提升至1520分', status: 'completed' },
              { date: '2024-03-20', title: '暑期项目申请', description: '成功申请哈佛暑期学术项目', status: 'current' }
            ],
            analysis: {
              strengths: ['学术能力强', '多元发展', '坚持不懈'],
              challenges: ['竞争激烈', '压力管理', '时间平衡'],
              keyFactors: ['学术成绩', '课外活动', '个人特色', '推荐信质量']
            },
            future: [
              { date: '2024-08-01', title: '哈佛暑期项目', description: '参加哈佛大学暑期学术项目', priority: 'high' },
              { date: '2024-10-15', title: '早申请提交', description: '提交哈佛早期申请材料', priority: 'critical' },
              { date: '2024-12-15', title: '早申请结果', description: '接收早申请录取结果', priority: 'high' },
              { date: '2025-01-15', title: '常规申请', description: '如需要，提交其他学校申请', priority: 'medium' },
              { date: '2025-05-01', title: '最终决定', description: '确定入学学校', priority: 'critical' }
            ],
            connections: [
              { type: '健康管理', strength: 85, description: '身心健康是学业成功的基础' },
              { type: '家庭和谐', strength: 95, description: '家庭支持对孩子发展至关重要' },
              { type: '财务规划', strength: 70, description: '教育投资需要充足的资金支持' }
            ]
          }
        },
        { 
          id: 2, 
          title: '事业发展', 
          description: '职业技能提升，争取管理岗位晋升机会', 
          progress: 40,
          tags: ['职场', '技能', '晋升'],
          totalSteps: 8,
          deadline: '2025-12-31',
          hyperTimeData: {
            history: [
              { date: '2022-03-01', title: '晋升为高级工程师', description: '技术能力得到认可，晋升为高级职位', status: 'completed' },
              { date: '2022-09-15', title: '领导力培训', description: '参加公司管理培训项目', status: 'completed' },
              { date: '2023-01-10', title: '项目经理认证', description: '获得PMP项目管理认证', status: 'completed' },
              { date: '2023-06-01', title: '跨部门项目', description: '成功领导跨部门产品开发项目', status: 'completed' },
              { date: '2024-01-15', title: '团队管理经验', description: '开始管理5人技术团队', status: 'current' }
            ],
            analysis: {
              strengths: ['技术扎实', '学习能力强', '沟通协调好'],
              challenges: ['管理经验不足', '行业竞争激烈', '工作生活平衡'],
              keyFactors: ['技术深度', '管理能力', '团队合作', '业务理解']
            },
            future: [
              { date: '2024-06-01', title: 'MBA学习启动', description: '开始在职MBA课程学习', priority: 'high' },
              { date: '2024-09-01', title: '大型项目主导', description: '主导公司年度重点项目', priority: 'critical' },
              { date: '2025-01-01', title: '部门经理面试', description: '参与部门经理岗位竞聘', priority: 'critical' },
              { date: '2025-06-01', title: '战略规划参与', description: '参与公司年度战略规划制定', priority: 'high' },
              { date: '2025-12-31', title: '晋升目标达成', description: '成功晋升为部门经理', priority: 'critical' }
            ],
            connections: [
              { type: '学习成长', strength: 90, description: '持续学习是职业发展的核心' },
              { type: '人际网络', strength: 75, description: '良好的人际关系助力职业发展' },
              { type: '家庭支持', strength: 80, description: '家庭理解和支持事业发展' }
            ]
          }
        },
        { 
          id: 3, 
          title: '健康管理', 
          description: '建立健康的生活方式，身心全面发展', 
          progress: 80,
          tags: ['运动', '饮食', '睡眠'],
          totalSteps: 10,
          deadline: '2024-12-31',
          hyperTimeData: {
            history: [
              { date: '2023-01-01', title: '健身计划启动', description: '开始规律的健身锻炼', status: 'completed' },
              { date: '2023-03-15', title: '饮食调整', description: '制定健康饮食计划，减少外食', status: 'completed' },
              { date: '2023-06-01', title: '首次马拉松', description: '完成人生第一个半程马拉松', status: 'completed' },
              { date: '2023-09-10', title: '睡眠优化', description: '建立规律作息，提升睡眠质量', status: 'completed' },
              { date: '2024-01-01', title: '体检指标改善', description: '年度体检各项指标显著改善', status: 'current' }
            ],
            analysis: {
              strengths: ['运动习惯良好', '营养意识强', '自律性高'],
              challenges: ['工作压力大', '时间安排紧', '天气影响'],
              keyFactors: ['运动频率', '饮食质量', '睡眠充足', '压力管理']
            },
            future: [
              { date: '2024-05-01', title: '全程马拉松挑战', description: '参加城市马拉松比赛', priority: 'high' },
              { date: '2024-07-01', title: '营养师咨询', description: '寻求专业营养指导', priority: 'medium' },
              { date: '2024-09-01', title: '健身教练指导', description: '制定更科学的训练计划', priority: 'medium' },
              { date: '2024-11-01', title: '年度体检', description: '全面健康检查和评估', priority: 'high' },
              { date: '2024-12-31', title: '健康目标达成', description: '实现全年健康管理目标', priority: 'high' }
            ],
            connections: [
              { type: '工作效率', strength: 85, description: '良好体魄提升工作表现' },
              { type: '家庭活动', strength: 80, description: '健康生活方式影响全家' },
              { type: '心理状态', strength: 90, description: '身体健康促进心理健康' }
            ]
          }
        },
        { 
          id: 4, 
          title: '财务自由', 
          description: '积累财富，实现财务独立的长期目标', 
          progress: 30,
          tags: ['投资', '理财', '储蓄'],
          totalSteps: 15,
          deadline: '2030-01-01',
          hyperTimeData: {
            history: [
              { date: '2022-01-01', title: '理财规划启动', description: '开始系统性理财规划', status: 'completed' },
              { date: '2022-06-01', title: '紧急基金建立', description: '建立6个月生活费应急基金', status: 'completed' },
              { date: '2022-12-01', title: '投资组合构建', description: '开始股票和基金定投', status: 'completed' },
              { date: '2023-06-01', title: '房产投资', description: '购买首套投资性房产', status: 'completed' },
              { date: '2024-01-01', title: '投资知识提升', description: '系统学习价值投资理论', status: 'current' }
            ],
            analysis: {
              strengths: ['储蓄意识强', '风险控制好', '学习能力强'],
              challenges: ['市场波动大', '通胀压力', '投资经验不足'],
              keyFactors: ['收入增长', '支出控制', '投资回报', '风险管理']
            },
            future: [
              { date: '2024-06-01', title: '投资策略优化', description: '调整投资组合配置', priority: 'high' },
              { date: '2025-01-01', title: '副业收入开发', description: '开展线上课程等副业', priority: 'medium' },
              { date: '2025-12-01', title: '第二套房产', description: '考虑购买第二套投资房产', priority: 'medium' },
              { date: '2027-01-01', title: '投资规模扩大', description: '投资组合达到关键规模', priority: 'high' },
              { date: '2030-01-01', title: '财务自由实现', description: '被动收入覆盖生活支出', priority: 'critical' }
            ],
            connections: [
              { type: '职业发展', strength: 85, description: '收入增长是财富积累基础' },
              { type: '教育规划', strength: 75, description: '为孩子教育预留充足资金' },
              { type: '退休规划', strength: 90, description: '财务自由为退休生活保障' }
            ]
          }
        },
        { 
          id: 5, 
          title: '家庭和谐', 
          description: '增进家庭感情，创造温馨幸福的家庭环境', 
          progress: 90,
          tags: ['沟通', '陪伴', '关爱'],
          totalSteps: 6,
          deadline: '2024-12-31',
          hyperTimeData: {
            history: [
              { date: '2023-01-01', title: '家庭时间规划', description: '制定家庭共处时间计划', status: 'completed' },
              { date: '2023-03-15', title: '沟通技巧学习', description: '参加家庭沟通技巧课程', status: 'completed' },
              { date: '2023-06-01', title: '家庭旅行', description: '组织全家海外旅行', status: 'completed' },
              { date: '2023-09-10', title: '家庭传统建立', description: '建立每周家庭聚餐传统', status: 'completed' },
              { date: '2024-01-01', title: '亲子关系提升', description: '与孩子建立更深层次的连接', status: 'current' }
            ],
            analysis: {
              strengths: ['沟通能力强', '责任心强', '耐心包容'],
              challenges: ['工作时间长', '代际差异', '个性差异'],
              keyFactors: ['陪伴质量', '沟通效果', '情感支持', '共同成长']
            },
            future: [
              { date: '2024-05-01', title: '家庭活动增加', description: '每月组织一次家庭户外活动', priority: 'high' },
              { date: '2024-07-01', title: '夫妻关系深化', description: '参加夫妻关系提升课程', priority: 'medium' },
              { date: '2024-09-01', title: '孩子兴趣培养', description: '支持孩子发展个人兴趣爱好', priority: 'high' },
              { date: '2024-11-01', title: '家庭价值观统一', description: '建立家庭共同价值观和目标', priority: 'high' },
              { date: '2024-12-31', title: '和谐家庭目标', description: '实现家庭成员间深度理解和支持', priority: 'critical' }
            ],
            connections: [
              { type: '孩子教育', strength: 95, description: '家庭和谐是孩子成长的土壤' },
              { type: '事业发展', strength: 80, description: '家庭支持促进事业发展' },
              { type: '健康管理', strength: 85, description: '家庭和睦有益身心健康' }
            ]
          }
        }
      ]
    }
    
    const loadUniversalCards = async () => {
      // 加载通用卡片数据
      universalCards.value = [
        { 
          type: 'time', 
          data: {},
          priority: 5
        },
        { 
          type: 'weather', 
          data: {
            temperature: 22,
            condition: '晴朗',
            location: '北京'
          },
          priority: 6
        },
        { 
          type: 'alarm', 
          data: {
            time: '07:30',
            label: '起床闹钟',
            enabled: true
          },
          priority: 7
        },
        { 
          type: 'calendar', 
          data: {
            events: [
              { id: 1, title: '团队会议', time: '10:00' },
              { id: 2, title: '项目评审', time: '14:30' }
            ]
          },
          priority: 8
        }
      ]
    }
    
    const loadSpecificCards = async (dream) => {
      if (!dream) return
      
      // 根据梦想类型加载特定卡片
      const cardMapping = {
        1: [ // 孩子考哈佛
          { 
            type: 'exam-countdown', 
            data: { 
              name: '哈佛申请截止', 
              date: '2025-01-01' 
            },
            priority: 1
          },
          { 
            type: 'study-progress', 
            data: { 
              subject: 'SAT准备', 
              progress: 78,
              totalChapters: 15,
              completedChapters: 12
            },
            priority: 2
          }
        ],
        2: [ // 事业发展
          { 
            type: 'project-progress', 
            data: { 
              name: '管理技能提升', 
              progress: 45,
              totalTasks: 20,
              completedTasks: 9,
              dueDate: '2025-03-31'
            },
            priority: 1
          }
        ],
        3: [ // 健康管理
          { 
            type: 'exercise-record', 
            data: { 
              type: '跑步', 
              distance: 5.2,
              distanceUnit: '公里',
              duration: 28,
              calories: 245,
              date: new Date().toISOString()
            },
            priority: 1
          }
        ],
        4: [ // 财务自由
          { 
            type: 'project-progress', 
            data: { 
              name: '投资学习计划', 
              progress: 32,
              totalTasks: 25,
              completedTasks: 8,
              dueDate: '2025-06-30'
            },
            priority: 1
          }
        ],
        5: [ // 家庭和谐
          { 
            type: 'study-progress', 
            data: { 
              subject: '亲子沟通技巧', 
              progress: 88,
              totalChapters: 8,
              completedChapters: 7
            },
            priority: 1
          }
        ]
      }
      
      specificCards.value = cardMapping[dream.id] || []
    }
    
    // 手势处理 - 全局手势控制超时间层
    const setupGestures = () => {
      let startY = 0
      let startX = 0
      let currentY = 0
      let currentX = 0
      let isScrolling = false
      let isHorizontalSwipe = false
      let startTime = 0
      let hasStartedDrag = false
      
      const handleTouchStart = (e) => {
        startY = e.touches[0].clientY
        startX = e.touches[0].clientX
        currentY = startY
        currentX = startX
        isScrolling = false
        isHorizontalSwipe = false
        startTime = Date.now()
        hasStartedDrag = false
      }
      
      const handleTouchMove = (e) => {
        currentY = e.touches[0].clientY
        currentX = e.touches[0].clientX
        const diffY = currentY - startY
        const diffX = Math.abs(currentX - startX)
        
        // 判断手势方向
        if (Math.abs(diffY) > 10 || diffX > 10) {
          if (diffX > Math.abs(diffY)) {
            isHorizontalSwipe = true
          } else {
            isScrolling = true
          }
        }
        
        // 只在非展开状态下处理下滑手势
        if (!isHyperTimeExpanded.value) {
          // 检测下滑手势的开始
          if (!hasStartedDrag && isScrolling && diffY > 20) {
            hasStartedDrag = true
            isLongPressing.value = true
          }
          
          // 手势驱动的过渡动画 - 下滑时触发
          if (hasStartedDrag && isScrolling && diffY > 0) {
            // 计算进度 (0-1)
            const maxDistance = 300 // 完全展开需要的滑动距离
            const progress = Math.min(diffY / maxDistance, 1)
            hyperTimeProgress.value = progress
            
            // 只在事件可取消且进度较大时才尝试阻止默认行为
            if (e.cancelable && progress > 0.1) {
              e.preventDefault()
            }
          }
        }
      }
      
      const handleTouchEnd = () => {
        const diffY = currentY - startY
        const diffX = Math.abs(currentX - startX)
        const touchDuration = Date.now() - startTime
        
        if (isHyperTimeExpanded.value) {
          // 超时间层已展开时的手势处理
          // 暂时屏蔽上滑关闭功能
          // if (isScrolling && diffY < -50) {
          //   // 上滑超过50px关闭超时间层
          //   closeHyperTimeLayer()
          // } else 
          if (isHorizontalSwipe && diffX > 80) {
            // 左右滑切换梦想内容
            const direction = currentX > startX ? 1 : -1 // 右滑为1，左滑为-1
            const newIndex = (activeDreamIndex.value - direction + dreams.value.length) % dreams.value.length
            activeDreamIndex.value = newIndex
            loadSpecificCards(dreams.value[newIndex])
          }
        } else {
          // 普通状态下的手势处理
          if (hasStartedDrag && isScrolling && diffY > 0) {
            // 手势驱动的过渡动画完成判断
            if (hyperTimeProgress.value >= 0.7) {
              // 进度超过70%，完成沉浸式过渡
              isHyperTimeExpanded.value = true
            }
          } else if (isScrolling && diffY > 100 && touchDuration < 200) {
            // 快速下滑手势（非拖拽模式）
            isHyperTimeExpanded.value = true
          }
        }
        
        // 重置所有状态 - 支持无缝过渡
        isLongPressing.value = false
        hyperTimeProgress.value = 0
        isScrolling = false
        isHorizontalSwipe = false
        hasStartedDrag = false
      }
      
      // 绑定到整个文档，确保全局响应
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
    
    // 生命周期
    onMounted(async () => {
      await loadDreams()
      await loadUniversalCards()
      if (dreams.value.length > 0) {
        await loadSpecificCards(dreams.value[0])
      }
      setupGestures()
    })
    
    return {
      dreams,
      activeDreamIndex,
      activeDream,
      isHyperTimeExpanded,
      isHyperTimeClosing,
      universalCards,
      specificCards,
      isLongPressing,
      hyperTimeProgress,
      handleDreamChange,
      handleVoiceCommand,
      handleTextCommand,
      handleShowHyperTime,
      closeHyperTimeLayer
    }
  }
}
</script>

<style lang="scss" scoped>
.new-home-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  
  // 禁用移动端点击高亮和双击缩放
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  touch-action: manipulation;
  
  .reality-dimension-layer {
    position: relative;
    width: 100%;
    height: calc(100vh - 4rem); // 减去底部输入框高度
    display: flex;
    flex-direction: column;
    
    .dream-slider-area {
      flex-shrink: 0;
    }
    
    .cards-area {
      flex: 1;
      padding: 0 1rem 1rem;
      overflow-y: auto;
    }
  }
  
  .hyper-time-dimension-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(12, 12, 12, 0.95) 0%, rgba(26, 26, 46, 0.95) 50%, rgba(22, 33, 62, 0.95) 100%);
    transform: translateY(-100%); // 初始从上方隐藏
    opacity: 0;
    z-index: 10;
    overflow: hidden;
    
    // 默认收起动画
    transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    
    // 添加细微的纹理效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.08) 0%, transparent 50%);
      pointer-events: none;
    }
    
    &.expanded {
      transform: translateY(0);
      opacity: 1;
      // 展开时使用不同的缓动函数，更加柔和
      transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    &.closing {
      transform: translateY(-100%);
      opacity: 0;
      // 收起时使用更快的缓动函数，感觉更敏捷
      transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    &.gesture-driven {
      // 手势驱动状态下不使用transition，实时跟随
      transition: none;
      
      // 添加手势驱动时的边缘发光效果
      box-shadow: 
        0 0 2rem rgba(102, 126, 234, 0.2),
        0 0 4rem rgba(118, 75, 162, 0.1);
    }
  }
  
  .bottom-input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4rem;
    background: #fff;
    z-index: 100;
  }
}

// 现实维度层样式
.reality-dimension-layer {
  background: linear-gradient(135deg, #fff5f0 0%, #fff 80%); // 暖米色渐变
  position: relative;
  
  // 添加微妙的纹理效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, transparent 50%, rgba(0, 0, 0, 0.01) 100%);
    pointer-events: none;
  }
  
  .dream-slider-area {
    position: relative;
    z-index: 2;
    border-radius: 0 0 1.5rem 1.5rem;
    margin: 0 -1rem;
  }
  
  .cards-area {
    position: relative;
    z-index: 2;
    margin-top: 1rem;
  }
}

// 超时间维度层样式
.hyper-time-dimension-layer {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e0e0;
}

</style>