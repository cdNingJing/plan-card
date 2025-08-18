<template>
  <div class="lecture-hall">


    <!-- 3D曲面带鱼屏显示器 -->
    <div class="ultrawide-screen" @click="showInfo('screen')">
      <div class="screen-3d-container">
        <!-- 屏幕分段，创建3D弯曲效果 -->
        <div class="screen-segment screen-left">
          <div class="screen-frame">
            <div class="screen-content-segment">
              <div class="segment-viewport">
                <div class="segment-slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                  <div class="segment-slide">
                    <div class="slide-header">
                      <BarChart3 :size="18" class="header-icon" />
                      <div class="slide-title">项目数据</div>
                    </div>
                    <div class="metrics-grid-3d">
                      <div class="metric-card" v-for="(item, index) in screenData.slice(0, 2)" :key="index">
                        <component :is="item.icon" :size="16" class="metric-icon" />
                        <div class="metric-name">{{ item.category }}</div>
                        <div class="metric-value">{{ item.value }}/10</div>
                      </div>
                    </div>
                  </div>
                  <div class="segment-slide">
                    <div class="slide-header">
                      <Briefcase :size="18" class="header-icon" />
                      <div class="slide-title">发展状况</div>
                    </div>
                    <div class="progress-bars-3d">
                      <div class="progress-item" v-for="(item, index) in screenData.slice(0, 2)" :key="index">
                        <div class="progress-label">
                          <component :is="item.icon" :size="14" />
                          {{ item.category }}
                        </div>
                        <div class="progress-bar">
                          <div class="progress-fill" :style="`width: ${item.value * 10}%`"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="segment-slide">
                    <div class="slide-header">
                      <MessageCircle :size="18" class="header-icon" />
                      <div class="slide-title">未来计划</div>
                    </div>
                    <div class="goals-list-3d">
                      <div class="goal-item">
                        <div class="goal-icon">✓</div>
                        <div class="goal-text">产品原型完成</div>
                      </div>
                      <div class="goal-item">
                        <div class="goal-icon">○</div>
                        <div class="goal-text">市场推广启动</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="screen-segment screen-center">
          <div class="screen-frame">
            <div class="screen-bezel">
              <div class="power-indicator">
                <Circle :size="6" class="power-light" />
              </div>
            </div>
            <div class="screen-content-segment">
              <div class="segment-viewport">
                <div class="segment-slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                  <div class="segment-slide">
                    <div class="slide-header">
                      <BarChart3 :size="20" class="header-icon" />
                      <div class="slide-title">核心数据</div>
                    </div>
                    <div class="metrics-grid-3d center-grid">
                      <div class="metric-card" v-for="(item, index) in screenData.slice(2, 3)" :key="index">
                        <component :is="item.icon" :size="20" class="metric-icon" />
                        <div class="metric-name">{{ item.category }}</div>
                        <div class="metric-value">{{ item.value }}/10</div>
                      </div>
                    </div>
                  </div>
                  <div class="segment-slide">
                    <div class="slide-header">
                      <Briefcase :size="20" class="header-icon" />
                      <div class="slide-title">关键进度</div>
                    </div>
                    <div class="progress-bars-3d center-progress">
                      <div class="progress-item" v-for="(item, index) in screenData.slice(2, 3)" :key="index">
                        <div class="progress-label">
                          <component :is="item.icon" :size="16" />
                          {{ item.category }}
                        </div>
                        <div class="progress-bar large">
                          <div class="progress-fill" :style="`width: ${item.value * 10}%`"></div>
                          <span class="progress-text">{{ item.value * 10 }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="segment-slide">
                    <div class="slide-header">
                      <MessageCircle :size="20" class="header-icon" />
                      <div class="slide-title">重点目标</div>
                    </div>
                    <div class="goals-list-3d center-goals">
                      <div class="goal-item large">
                        <div class="goal-icon">✓</div>
                        <div class="goal-text">团队组建完成</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="screen-segment screen-right">
          <div class="screen-frame">
            <div class="screen-content-segment">
              <div class="segment-viewport">
                <div class="segment-slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                  <div class="segment-slide">
                    <div class="slide-header">
                      <BarChart3 :size="18" class="header-icon" />
                      <div class="slide-title">发展数据</div>
                    </div>
                    <div class="metrics-grid-3d">
                      <div class="metric-card" v-for="(item, index) in screenData.slice(3, 5)" :key="index">
                        <component :is="item.icon" :size="16" class="metric-icon" />
                        <div class="metric-name">{{ item.category }}</div>
                        <div class="metric-value">{{ item.value }}/10</div>
                      </div>
                    </div>
                  </div>
                  <div class="segment-slide">
                    <div class="slide-header">
                      <Briefcase :size="18" class="header-icon" />
                      <div class="slide-title">增长趋势</div>
                    </div>
                    <div class="progress-bars-3d">
                      <div class="progress-item" v-for="(item, index) in screenData.slice(3, 5)" :key="index">
                        <div class="progress-label">
                          <component :is="item.icon" :size="14" />
                          {{ item.category }}
                        </div>
                        <div class="progress-bar">
                          <div class="progress-fill" :style="`width: ${item.value * 10}%`"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="segment-slide">
                    <div class="slide-header">
                      <MessageCircle :size="18" class="header-icon" />
                      <div class="slide-title">发展规划</div>
                    </div>
                    <div class="goals-list-3d">
                      <div class="goal-item">
                        <div class="goal-icon">○</div>
                        <div class="goal-text">扩大市场份额</div>
                      </div>
                      <div class="goal-item">
                        <div class="goal-icon">○</div>
                        <div class="goal-text">获得融资轮次</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3D导航控制 -->
        <div class="nav-3d-controls">
          <button class="nav-3d-btn prev" @click="previousSlide" :disabled="currentSlide === 0">‹</button>
          <div class="slide-indicators-3d">
            <div 
              class="indicator-3d" 
              v-for="n in 3" 
              :key="n-1"
              :class="{ active: currentSlide === n-1 }"
              @click="currentSlide = n-1"
            ></div>
          </div>
          <button class="nav-3d-btn next" @click="nextSlide" :disabled="currentSlide === 2">›</button>
        </div>
      </div>
    </div>

    <!-- 讲台区域 -->
    <div class="podium-area">
      <div class="podium" @click="showInfo('podium')">
        <div class="podium-top">
          <Laptop :size="16" class="laptop-icon" />
          <Mic :size="14" class="microphone" />
        </div>
        <div class="podium-base">
          <div class="podium-logo">
            <GraduationCap :size="20" />
          </div>
        </div>
        <div class="podium-shadow"></div>
      </div>
      
      <!-- 演讲者 -->
      <div class="speaker" :class="{ presenting: isPresenting }" @click="showInfo('speaker')">
        <div class="speaker-head">
          <User :size="14" />
        </div>
        <div class="speaker-body"></div>
        <div class="speaker-shadow"></div>
      </div>
    </div>

    <!-- 座位区域 -->
    <div class="seating-area">
      <!-- 前排座位 -->
      <div class="seating-row front-row">
        <div class="row-number">A</div>
        <div class="seat" 
             v-for="n in 8" 
             :key="'front-' + n" 
             :class="{ occupied: seatOccupancy.front[n-1] }"
             @click="handleSeatClick('front', n-1)"
             @contextmenu.prevent="showInfo('seat')">
          <div class="seat-back"></div>
          <div class="seat-cushion"></div>
          <div class="seat-number">{{ n }}</div>
          <div class="occupant" v-if="seatOccupancy.front[n-1]">
            <Users :size="10" />
          </div>
        </div>
      </div>
      
      <!-- 中排座位 -->
      <div class="seating-row middle-row">
        <div class="row-number">B</div>
        <div class="seat" 
             v-for="n in 10" 
             :key="'middle-' + n" 
             :class="{ occupied: seatOccupancy.middle[n-1] }"
             @click="handleSeatClick('middle', n-1)"
             @contextmenu.prevent="showInfo('seat')">
          <div class="seat-back"></div>
          <div class="seat-cushion"></div>
          <div class="seat-number">{{ n }}</div>
          <div class="occupant" v-if="seatOccupancy.middle[n-1]">
            <Users :size="10" />
          </div>
        </div>
      </div>
      
      <!-- 后排座位 -->
      <div class="seating-row back-row">
        <div class="row-number">C</div>
        <div class="seat" 
             v-for="n in 12" 
             :key="'back-' + n" 
             :class="{ occupied: seatOccupancy.back[n-1] }"
             @click="handleSeatClick('back', n-1)"
             @contextmenu.prevent="showInfo('seat')">
          <div class="seat-back"></div>
          <div class="seat-cushion"></div>
          <div class="seat-number">{{ n }}</div>
          <div class="occupant" v-if="seatOccupancy.back[n-1]">
            <Users :size="10" />
          </div>
        </div>
      </div>
    </div>

    <!-- 过道和地毯 -->
    <div class="aisle">
      <div class="aisle-carpet">
        <div class="carpet-pattern"></div>
      </div>
    </div>


    <!-- 控制面板 -->
    <div class="control-panel">
      <button class="control-button" @click="togglePresenting">
        <Play v-if="!isPresenting" :size="16" />
        <Pause v-else :size="16" />
        {{ isPresenting ? '暂停' : '开始' }}路演
      </button>
      <button class="control-button" @click="resetSeating">
        <RotateCcw :size="16" />
        重置投资者
      </button>
    </div>

    <!-- 信息弹窗 -->
    <div v-if="showInfoPanel" class="info-panel" @click.self="hideInfo">
      <div class="info-content">
        <div class="info-header">
          <component :is="infoData.icon" :size="20" />
          <h3>{{ infoData.title }}</h3>
          <button class="close-btn" @click="hideInfo">
            <X :size="16" />
          </button>
        </div>
        <div class="info-body">
          <p class="info-description">{{ infoData.description }}</p>
          <div class="info-features">
            <h4>主要功能：</h4>
            <ul>
              <li v-for="feature in infoData.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>
          <div class="info-interaction" v-if="infoData.interaction">
            <h4>交互方式：</h4>
            <p>{{ infoData.interaction }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
// 导入 Lucide 图标
import { 
  Settings, Circle, BarChart3, Play, Pause, Volume2, Maximize,
  Laptop, Mic, GraduationCap, User, Users, RotateCcw,
  Briefcase, MessageCircle, X, Monitor, Presentation
} from 'lucide-vue-next'

// 屏幕显示的数据 - 创业相关
const screenData = reactive([
  { category: '市场调研', value: 8, icon: BarChart3 },
  { category: '资金筹备', value: 6, icon: Briefcase },
  { category: '团队建设', value: 7, icon: Users },
  { category: '产品开发', value: 9, icon: Settings },
  { category: '营销推广', value: 5, icon: MessageCircle }
])

// 当前幻灯片索引
const currentSlide = ref(0)
const screenViewport = ref(null)

// 座位占用状态
const seatOccupancy = reactive({
  front: Array(8).fill(false).map(() => Math.random() > 0.3),
  middle: Array(10).fill(false).map(() => Math.random() > 0.4),
  back: Array(12).fill(false).map(() => Math.random() > 0.5)
})

// 演讲状态
const isPresenting = ref(true)

// 信息弹窗状态
const showInfoPanel = ref(false)
const infoData = ref({})

// 信息配置
const infoConfig = {
  screen: {
    icon: Monitor,
    title: '创业项目展示屏幕',
    description: '圆形大屏幕用于展示创业项目进度报告，包含市场调研、资金筹备、团队建设等关键指标。',
    features: [
      '创业各阶段进度实时监控',
      '多维度项目数据可视化',
      '高清圆形显示屏设计',
      '智能创业数据分析和预测'
    ],
    interaction: '点击屏幕可查看创业项目详细分析，支持数据钻取。'
  },
  podium: {
    icon: Presentation,
    title: '创业演讲台',
    description: '专为创业路演设计的现代化演讲台，提供完整的项目展示和投资者沟通工具。',
    features: [
      '集成商业计划书展示系统',
      '财务数据实时计算工具',
      '投资者互动控制面板',
      '专业演讲辅助设备'
    ],
    interaction: '创业者可使用台上设备进行项目路演，展示商业计划。'
  },
  speaker: {
    icon: User,
    title: '创业者',
    description: '正在进行创业项目路演的主讲人，向投资者和观众展示创业项目。',
    features: [
      '创业项目深度解析能力',
      '商业模式清晰表达',
      '投资者问答和互动',
      '市场前景分析展示'
    ],
    interaction: '点击可切换路演状态，观察创业者的演讲姿态。'
  },
  seat: {
    icon: Users,
    title: '投资者席位',
    description: '专为投资者和合作伙伴设计的舒适座椅系统，提供最佳的项目展示观看角度。按排次分为A、B、C三排。',
    features: [
      '投资者专属座位设计',
      '最佳项目展示视角',
      '座位编号和预约系统',
      '实时参会状态显示'
    ],
    interaction: '左键点击可切换投资者入席状态，右键点击查看座位详情。'
  }
}

// 显示信息弹窗
const showInfo = (type) => {
  infoData.value = infoConfig[type]
  showInfoPanel.value = true
}

// 隐藏信息弹窗
const hideInfo = () => {
  showInfoPanel.value = false
}

// 处理座位点击
const handleSeatClick = (row, index) => {
  seatOccupancy[row][index] = !seatOccupancy[row][index]
}

// 重置座位
const resetSeating = () => {
  seatOccupancy.front = Array(8).fill(false).map(() => Math.random() > 0.3)
  seatOccupancy.middle = Array(10).fill(false).map(() => Math.random() > 0.4)
  seatOccupancy.back = Array(12).fill(false).map(() => Math.random() > 0.5)
}

// 切换演讲状态
const togglePresenting = () => {
  isPresenting.value = !isPresenting.value
}

// 幻灯片切换功能
const nextSlide = () => {
  if (currentSlide.value < 2) {
    currentSlide.value++
  }
}

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}
</script>

<style lang="scss" scoped>
.lecture-hall {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, 
    #0f172a 0%,
    #1e293b 50%,
    #334155 100%
  );
  position: relative;
  overflow: hidden;
  perspective: 1000px;
  perspective-origin: center 40%;
  padding-bottom: 6rem;
  box-sizing: border-box;
}


/* 圆形演讲大屏幕 */
.ultrawide-screen {
  position: absolute;
  top: 5px;
  left: 50%;
  width: 130vw; /* 超宽屏效果 */
  height: 450px; /* 进一步增加高度 */
  z-index: 15;
  transform-origin: center center;
  transform: translateX(-50%) rotateX(-15deg);
  perspective: 2500px;
}


/* 3D屏幕容器 */
.screen-3d-container {
  display: flex;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  perspective: 2000px;
}

/* 屏幕分段 */
.screen-segment {
  flex: 1;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: center center;
}

.screen-left {
  transform: rotateY(25deg) translateZ(-50px);
  opacity: 0.9;
}

.screen-center {
  transform: rotateY(0deg) translateZ(0px);
  z-index: 2;
}

.screen-right {
  transform: rotateY(-25deg) translateZ(-50px);
  opacity: 0.9;
}

.screen-frame {
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background: linear-gradient(145deg, 
    #2c2c2c 0%,
    #1a1a1a 30%,
    #0d0d0d  70%,
    #000000 100%
  );
  padding: 6px;
  box-shadow: 
    0 0 80px rgba(0, 0, 0, 0.8),
    inset 0 6px 15px rgba(255, 255, 255, 0.12),
    inset 0 -8px 20px rgba(0, 0, 0, 0.6),
    0 30px 100px rgba(0,0,0,0.5);
  position: relative;
  border: 3px solid #333333;
  transform-style: preserve-3d;
}

.screen-bezel {
  position: absolute;
  top: 12px;
  right: 20px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.8),
    0 1px 2px rgba(255, 255, 255, 0.1);
}

.power-indicator {
  .power-light {
    color: #22c55e;
    filter: drop-shadow(0 0 3px #22c55e);
    animation: powerPulse 3s ease-in-out infinite;
  }
}

/* 3D屏幕内容分段 */
.screen-content-segment {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, 
    #ffffff 0%,
    #f8fafc 40%,
    #e2e8f0 80%,
    #cbd5e1 100%
  );
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 
    inset 0 3px 12px rgba(255, 255, 255, 0.9),
    inset 0 -3px 12px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;
}

/* 分段视窗 */
.segment-viewport {
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.segment-slides {
  display: flex;
  width: 300%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.segment-slide {
  width: 33.333%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  box-sizing: border-box;
}

/* 3D屏幕布局样式 */
.slide-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  
  .header-icon {
    color: #3b82f6;
  }
  
  .slide-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
  }
}

/* 3D项目总览网格 */
.metrics-grid-3d {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  height: 100%;
  
  &.center-grid {
    grid-template-columns: 1fr;
    place-items: center;
  }
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    transform: translateZ(5px);
  }
}

.metric-icon {
  color: #3b82f6;
}

.metric-name {
  font-size: 0.6rem;
  color: #64748b;
  text-align: center;
  font-weight: 500;
}

.metric-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
}

/* 3D进度条 */
.progress-bars-3d {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  justify-content: center;
  
  &.center-progress {
    gap: 12px;
  }
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #475569;
  font-weight: 500;
  
  svg {
    color: #3b82f6;
  }
}

.progress-bar {
  height: 12px;
  background: rgba(226, 232, 240, 0.8);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  
  &.large {
    height: 16px;
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 6px;
  transition: width 0.8s ease;
  position: relative;
}

.progress-text {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.65rem;
  font-weight: 600;
  color: #1e293b;
  z-index: 1;
}

/* 3D目标列表 */
.goals-list-3d {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  justify-content: center;
  
  &.center-goals {
    gap: 8px;
  }
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 4px;
  border-left: 2px solid #e2e8f0;
  
  &.large {
    padding: 8px 12px;
    border-left-width: 3px;
  }
  
  &:has(.goal-icon:contains("✓")) {
    border-left-color: #22c55e;
    background: rgba(34, 197, 94, 0.05);
  }
}

.goal-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  
  &:contains("✓") {
    background: #22c55e;
    color: white;
  }
  
  &:contains("○") {
    background: #e2e8f0;
    color: #64748b;
  }
}

.goal-text {
  font-size: 0.75rem;
  color: #334155;
  font-weight: 500;
}

/* 3D导航控制 */
.nav-3d-controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.slide-indicators-3d {
  display: flex;
  gap: 6px;
}

.indicator-3d {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.active {
    background: #3b82f6;
    transform: scale(1.3);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  }
}

/* 3D导航按钮 */
.nav-3d-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  
  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.25);
    transform: scale(1.1) translateZ(5px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
}


/* 讲台区域 */
.podium-area {
  position: absolute;
  bottom: 480px; /* 调整位置以适应更高的屏幕 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: end;
  gap: 20px;
}

.podium {
  width: 140px;
  height: 80px;
  position: relative;
}

.podium-top {
  width: 100%;
  height: 25px;
  background: linear-gradient(135deg, #8b4513, #a0522d);
  border-radius: 8px 8px 4px 4px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  
  .laptop-icon, .microphone {
    color: #2c3e50;
  }
}

.podium-base {
  width: 120px;
  height: 55px;
  background: linear-gradient(135deg, #654321, #8b4513);
  border-radius: 6px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
}

.podium-logo {
  color: #d4af37;
}

.podium-shadow {
  position: absolute;
  bottom: -10px;
  left: 10px;
  right: 10px;
  height: 8px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%);
  border-radius: 50%;
}

/* 演讲者 */
.speaker {
  width: 20px;
  height: 60px;
  position: relative;
  transition: all 0.5s ease;
}

.speaker-head {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #f4d1ae, #e8b896);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  svg {
    color: #2c3e50;
  }
}

.speaker-body {
  width: 16px;
  height: 40px;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 0 0 8px 8px;
  margin: 0 auto;
}

.speaker-shadow {
  position: absolute;
  bottom: -5px;
  left: 2px;
  right: 2px;
  height: 4px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
  border-radius: 50%;
}

.speaker.presenting {
  animation: speakerGesture 3s ease-in-out infinite;
}

/* 座位区域 */
.seating-area {
  position: absolute;
  bottom: 360px; /* 调整位置以适应更高的屏幕和讲台位置 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform-origin: center bottom;
  transform: translateX(-50%) perspective(800px) rotateX(35deg);
}

.seating-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  position: relative;
}

.row-number {
  position: absolute;
  left: -30px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #95a5a6;
  background: rgba(52, 73, 94, 0.8);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seat {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.seat-back {
  width: 20px;
  height: 25px;
  background: linear-gradient(135deg, #6c757d, #5a6169);
  border-radius: 6px 6px 2px 2px;
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2),
    inset 0 1px 2px rgba(255,255,255,0.1);
}

.seat-cushion {
  width: 18px;
  height: 6px;
  background: linear-gradient(135deg, #6c757d, #5a6169);
  border-radius: 2px;
  margin: 2px auto 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.seat.occupied {
  .seat-back, .seat-cushion {
    background: linear-gradient(135deg, #28a745, #20903c);
  }
}

.seat-number {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6rem;
  color: #95a5a6;
  font-weight: 500;
}

.occupant {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  color: #2c3e50;
  animation: occupantMove 4s ease-in-out infinite;
}

/* 前排座位（更大） */
.front-row .seat {
  .seat-back { width: 24px; height: 28px; }
  .seat-cushion { width: 22px; height: 7px; }
}

/* 中排座位 */
.middle-row .seat {
  .seat-back { width: 22px; height: 26px; }
  .seat-cushion { width: 20px; height: 6px; }
}

/* 后排座位（稍小） */
.back-row .seat {
  .seat-back { width: 20px; height: 24px; }
  .seat-cushion { width: 18px; height: 6px; }
}

/* 过道和地毯 */
.aisle {
  position: absolute;
  bottom: 256px; /* 调整位置以适应新布局 */
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 250px;
}

.aisle-carpet {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(52, 58, 64, 0.1) 0%,
    rgba(139, 69, 19, 0.3) 30%,
    rgba(139, 69, 19, 0.5) 100%
  );
  border-radius: 50px 50px 0 0;
}

.carpet-pattern {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent 0px,
    transparent 5px,
    rgba(160, 82, 45, 0.1) 5px,
    rgba(160, 82, 45, 0.1) 10px
  );
  border-radius: 50px 50px 0 0;
}


/* 控制面板 */
.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(52, 73, 94, 0.9);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(52, 152, 219, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  }
}

/* 信息弹窗 */
.info-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

.info-content {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 2px solid #e9ecef;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  
  svg {
    color: white;
  }
  
  h3 {
    flex: 1;
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
  }
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

.info-body {
  padding: 24px;
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}

.info-description {
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 20px;
}

.info-features {
  margin-bottom: 20px;
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    padding: 8px 0 8px 24px;
    position: relative;
    font-size: 0.9rem;
    color: #495057;
    line-height: 1.5;
    
    &::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #27ae60;
      font-weight: bold;
    }
  }
}

.info-interaction {
  background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
  border-radius: 10px;
  padding: 16px;
  border-left: 4px solid #3498db;
  
  h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 0.9rem;
    color: #495057;
    line-height: 1.5;
    margin: 0;
  }
}

/* 添加可点击元素的悬停效果 */
.ultrawide-screen {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(-50%) rotateX(-15deg) scale(1.01);
    filter: brightness(1.08);
  }
}

.podium,
.speaker {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    filter: brightness(1.08);
  }
}

.seat {
  cursor: pointer;
  
  &:hover {
    transform: scale(1.15);
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 动画效果 */


@keyframes powerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}


@keyframes speakerGesture {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotateY(-10deg); }
  75% { transform: translateX(5px) rotateY(10deg); }
}

@keyframes occupantMove {
  0%, 100% { transform: translateX(-50%) rotateZ(0deg); }
  50% { transform: translateX(-50%) rotateZ(5deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ultrawide-screen {
    width: 120vw;
    height: 360px;
    top: 5px;
  }
  
  .slide-title { font-size: 1rem; }
  .metric-name { font-size: 0.65rem; }
  .progress-label { font-size: 0.75rem; }
  .goal-text { font-size: 0.8rem; }
  
  .podium-area {
    bottom: 440px;
  }
  
  .seating-area {
    bottom: 340px;
    gap: 10px;
  }
  
  .aisle {
    bottom: 236px;
  }
  
  .seating-row { gap: 6px; }
  
  .control-panel {
    top: 10px;
    right: 10px;
  }
  
  .control-button {
    padding: 6px 10px;
    font-size: 0.7rem;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  
  .metric-card {
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .ultrawide-screen {
    width: 115vw;
    height: 320px;
  }
  
  .slide-title { font-size: 0.9rem; }
  .metric-name { font-size: 0.6rem; }
  .metric-value { font-size: 0.8rem; }
  
  .podium-area {
    bottom: 400px;
  }
  
  .seating-area {
    bottom: 300px;
  }
  
  .aisle {
    bottom: 206px;
  }
  
  .front-row .seat {
    .seat-back { width: 20px; height: 24px; }
    .seat-cushion { width: 18px; height: 6px; }
  }
  
  .middle-row .seat {
    .seat-back { width: 18px; height: 22px; }
    .seat-cushion { width: 16px; height: 5px; }
  }
  
  .back-row .seat {
    .seat-back { width: 16px; height: 20px; }
    .seat-cushion { width: 14px; height: 5px; }
  }
  
  .metrics-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  
  .nav-btn {
    width: 20px;
    height: 20px;
    font-size: 14px;
  }
}
</style>