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
    
    <!-- 超时间维度层（下滑展开） -->
    <div 
      class="hyper-time-dimension-layer"
      :class="{ 'expanded': isHyperTimeExpanded }"
    >
      <HyperTimeDimensionLayer 
        :dream="activeDream"
        :is-expanded="isHyperTimeExpanded"
        @close="closeHyperTimeLayer"
      />
    </div>
    
    <!-- 底部固定输入框 -->
    <div class="bottom-input-area">
      <BottomInputBox 
        :is-hyper-time-expanded="isHyperTimeExpanded"
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
    const universalCards = ref([])
    const specificCards = ref([])
    
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
      isHyperTimeExpanded.value = false
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
          deadline: '2026-06-01'
        },
        { 
          id: 2, 
          title: '事业发展', 
          description: '职业技能提升，争取管理岗位晋升机会', 
          progress: 40,
          tags: ['职场', '技能', '晋升'],
          totalSteps: 8,
          deadline: '2025-12-31'
        },
        { 
          id: 3, 
          title: '健康管理', 
          description: '建立健康的生活方式，身心全面发展', 
          progress: 80,
          tags: ['运动', '饮食', '睡眠'],
          totalSteps: 10,
          deadline: '2024-12-31'
        },
        { 
          id: 4, 
          title: '财务自由', 
          description: '积累财富，实现财务独立的长期目标', 
          progress: 30,
          tags: ['投资', '理财', '储蓄'],
          totalSteps: 15,
          deadline: '2030-01-01'
        },
        { 
          id: 5, 
          title: '家庭和谐', 
          description: '增进家庭感情，创造温馨幸福的家庭环境', 
          progress: 90,
          tags: ['沟通', '陪伴', '关爱'],
          totalSteps: 6,
          deadline: '2024-12-31'
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
      
      const handleTouchStart = (e) => {
        startY = e.touches[0].clientY
        startX = e.touches[0].clientX
        currentY = startY
        currentX = startX
        isScrolling = false
        isHorizontalSwipe = false
      }
      
      const handleTouchMove = (e) => {
        currentY = e.touches[0].clientY
        currentX = e.touches[0].clientX
        const diffY = currentY - startY
        const diffX = Math.abs(currentX - startX)
        
        // 判断是垂直滑动还是水平滑动
        if (Math.abs(diffY) > 10 || diffX > 10) {
          if (diffX > Math.abs(diffY)) {
            isHorizontalSwipe = true
          } else {
            isScrolling = true
          }
        }
      }
      
      const handleTouchEnd = () => {
        const diffY = currentY - startY
        const diffX = Math.abs(currentX - startX)
        
        if (isHyperTimeExpanded.value) {
          // 超时间层已展开时的手势：上滑、左滑、右滑都可以关闭
          if ((isScrolling && diffY < -50) || // 上滑超过50px
              (isHorizontalSwipe && diffX > 80)) { // 左右滑超过80px
            isHyperTimeExpanded.value = false
          }
        } else {
          // 普通状态下的手势：下滑触发超时间层
          if (isScrolling && diffY > 80) {
            isHyperTimeExpanded.value = true
          }
        }
        
        isScrolling = false
        isHorizontalSwipe = false
      }
      
      // 绑定到整个文档，确保全局响应
      document.addEventListener('touchstart', handleTouchStart, { passive: false })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd, { passive: false })
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
      universalCards,
      specificCards,
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
    background: rgba(0, 0, 20, 0.95);
    transform: translateY(-100%); // 从上方隐藏
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 10;
    
    &.expanded {
      transform: translateY(0); // 从上到下滑入
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
    background: linear-gradient(135deg, #d4a574 0%, #b8956a 100%); // 暖棕色渐变
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
  
  // 添加星空效果
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(2px 2px at 20px 30px, #fff, transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 90px 40px, #fff, transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 160px 30px, #fff, transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: twinkle 4s linear infinite;
    pointer-events: none;
    opacity: 0.3;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
</style>