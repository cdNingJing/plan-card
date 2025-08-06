<template>
  <div class="main-content-area">
    <!-- 内容区域 -->
    <div class="content-container">
      <div
        class="dreams-content"
        :style="{ transform: `translateX(${cardsTranslateX}px)` }"
      >
        <div
          v-for="(dream, dreamIndex) in dreams"
          :key="`dream-${dream.id}`"
          class="dream-workspace"
          :class="{ 'active': dreamIndex === activeDreamIndex }"
        >
          <div class="grid-layout">
            <!-- 时间卡片 - 1x1 -->
            <div class="flow-item time-module" style="grid-column: 1; grid-row: 1; grid-column: span 1; grid-row: span 1;">
              <div class="card-content compact">
                <div class="compact-content">
                  <div class="compact-main">14:30</div>
                  <div class="compact-sub">TIME</div>
                </div>
              </div>
            </div>

            <!-- 日期卡片 - 1x1 -->
            <div class="flow-item date-module" style="grid-column: 2; grid-row: 1; grid-column: span 1; grid-row: span 1;">
              <div class="card-content compact">
                <div class="compact-content">
                  <div class="compact-main">DEC 15</div>
                  <div class="compact-sub">SUNDAY</div>
                </div>
              </div>
            </div>

            <!-- 天气信息 - 2x2 -->
            <div class="flow-item weather-module" style="grid-column: 3; grid-row: 1; grid-column: span 2; grid-row: span 2;">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon">
                    <Sun class="icon" />
                  </div>
                  <div class="header-content">
                    <div class="card-title">WEATHER</div>
                    <div class="card-subtitle">北京 · 实时</div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="weather-info">
                    <div class="weather-grid">
                      <div class="weather-item main-temp">
                        <div class="weather-content">
                          <div class="weather-value">22°</div>
                          <div class="weather-label">TEMP</div>
                        </div>
                      </div>
                      <div class="weather-item humidity">
                        <div class="weather-content">
                          <div class="weather-value">65%</div>
                          <div class="weather-label">HUMID</div>
                        </div>
                      </div>
                      <div class="weather-item wind">
                        <div class="weather-content">
                          <div class="weather-value">3</div>
                          <div class="weather-label">WIND</div>
                        </div>
                      </div>
                      <div class="weather-item visibility">
                        <div class="weather-content">
                          <div class="weather-value">15</div>
                          <div class="weather-label">VISIB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 健康数据 - 2x1 -->
            <div class="flow-item heart-rate-module" style="grid-column: 3; grid-row: 8; grid-column: span 2; grid-row: span 1;">
              <div class="card-content">
                <div class="card-icon">
                  <Heart class="icon" />
                </div>
                <div class="card-body">
                  <div class="health-info">
                    <div class="health-item">
                      <div class="health-value">72</div>
                      <div class="health-label">BPM</div>
                    </div>
                    <div class="health-item">
                      <div class="health-value">8.4K</div>
                      <div class="health-label">STEPS</div>
                    </div>
                    <div class="health-item">
                      <div class="health-value">95%</div>
                      <div class="health-label">O2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重要紧急 - 2x2 -->
            <div class="flow-item urgent-important-module" style="grid-column: 1; grid-row: 2; grid-column: span 2; grid-row: span 2;">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon">
                    <Flame class="icon" />
                  </div>
                  <div class="header-content">
                    <div class="card-title">URGENT</div>
                    <div class="card-subtitle">优先级 · 高</div>
                  </div>
                  <div class="header-status">
                    <div class="status-dot urgent"></div>
                    <span class="status-text">2项</span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="task-list">
                    <div class="task-item">
                      <div class="task-title">客户会议</div>
                      <div class="task-desc">准备演示文稿</div>
                    </div>
                    <div class="task-item">
                      <div class="task-title">项目截止</div>
                      <div class="task-desc">完成最终测试</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重要不紧急 - 2x2 -->
            <div class="flow-item important-not-urgent-module" style="grid-column: 3; grid-row: 3; grid-column: span 2; grid-row: span 2;">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon">
                    <Star class="icon" />
                  </div>
                  <div class="header-content">
                    <div class="card-title">IMPORTANT</div>
                    <div class="card-subtitle">优先级 · 中</div>
                  </div>
                  <div class="header-status">
                    <div class="status-dot important"></div>
                    <span class="status-text">2项</span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="task-list">
                    <div class="task-item">
                      <div class="task-title">学习新技能</div>
                      <div class="task-desc">Vue3 高级特性</div>
                    </div>
                    <div class="task-item">
                      <div class="task-title">团队建设</div>
                      <div class="task-desc">组织团建活动</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 今日笔记 - 4x2 -->
            <div class="flow-item notes-module" style="grid-column: 1; grid-row: 4; grid-column: span 4; grid-row: span 2;">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon">
                    <Edit class="icon" />
                  </div>
                  <div class="header-content">
                    <div class="card-title">NOTES</div>
                    <div class="card-subtitle">今日 · 3条</div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="notes-content">
                    今天需要完成项目规划，包括技术选型和架构设计。团队会议安排在下午2点。
                    需要准备演示文稿，完成最终测试，并回复重要邮件。
                  </div>
                </div>
              </div>
            </div>

            <!-- 今日日程 - 2x2 -->
            <div class="flow-item schedule-module" style="grid-column: 1; grid-row: 6; grid-column: span 2; grid-row: span 2;">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon">
                    <CalendarDays class="icon" />
                  </div>
                  <div class="header-content">
                    <div class="card-title">SCHEDULE</div>
                    <div class="card-subtitle">今日 · 3个</div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="schedule-list">
                    <div class="schedule-item">
                      <div class="schedule-time">09:00</div>
                      <div class="schedule-content">晨会</div>
                    </div>
                    <div class="schedule-item">
                      <div class="schedule-time">14:00</div>
                      <div class="schedule-content">客户会议</div>
                    </div>
                    <div class="schedule-item">
                      <div class="schedule-time">16:00</div>
                      <div class="schedule-content">代码评审</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 项目统计 - 2x2 -->
            <div class="flow-item stats-module" style="grid-column: 3; grid-row: 6; grid-column: span 2; grid-row: span 2;">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon">
                    <TrendingUp class="icon" />
                  </div>
                  <div class="header-content">
                    <div class="card-title">STATS</div>
                    <div class="card-subtitle">本周 · 更新</div>
                  </div>
                  <div class="header-progress">
                    <div class="progress-circle">
                      <span class="progress-text">85%</span>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-number">12</div>
                      <div class="stat-label">DONE</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">5</div>
                      <div class="stat-label">PROGRESS</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">3</div>
                      <div class="stat-label">PENDING</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">Smart</div>
                      <div class="stat-label">PROJECT</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">75%</div>
                      <div class="stat-label">COMPLETE</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">92%</div>
                      <div class="stat-label">EFF</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 音乐播放 - 2x1 -->
            <div class="flow-item music-module" style="grid-column: 1; grid-row: 8; grid-column: span 2; grid-row: span 1;">
              <div class="card-content">
                <div class="card-body">
                  <div class="music-info">
                    <div class="music-left">
                      <Music class="music-icon" />
                    </div>
                    <div class="music-right">
                      <div class="song-title">Light Music</div>
                      <div class="song-artist">Relaxing Mood</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 步数卡片 - 1x1 -->
            <div class="flow-item steps-module" style="grid-column: 1; grid-row: 9; grid-column: span 1; grid-row: span 1;">
              <div class="card-content compact">
                <div class="compact-icon">
                  <Footprints class="icon" />
                </div>
                <div class="compact-content">
                  <div class="compact-main">8,432</div>
                  <div class="compact-sub">STEPS</div>
                </div>
              </div>
            </div>

            <!-- 电池卡片 - 1x1 -->
            <div class="flow-item battery-module" style="grid-column: 2; grid-row: 9; grid-column: span 1; grid-row: span 1;">
              <div class="card-content compact">
                <div class="compact-content">
                  <div class="compact-main">85%</div>
                  <div class="compact-sub">BATTERY</div>
                </div>
              </div>
            </div>

            <!-- 闹钟卡片 - 1x1 -->
            <div class="flow-item alarm-module" style="grid-column: 3; grid-row: 9; grid-column: span 1; grid-row: span 1;">
              <div class="card-content compact">
                <div class="compact-content">
                  <div class="compact-main">08:30</div>
                  <div class="compact-sub">ALARM</div>
                </div>
              </div>
            </div>

            <!-- 温度卡片 - 1x1 -->
            <div class="flow-item temp-module" style="grid-column: 4; grid-row: 9; grid-column: span 1; grid-row: span 1;">
              <div class="card-content compact">
                <div class="compact-icon">
                  <Sun class="icon" />
                </div>
                <div class="compact-content">
                  <div class="compact-main">22°</div>
                  <div class="compact-sub">TEMP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Flame, Star, Zap, FileText, Target, TrendingUp, Clock, Users, 
  Mail, MessageCircle, Home, Sun, Calendar, Edit, Music, 
  Footprints, Heart, Battery, CalendarDays, Cloud, Wind, 
  Droplets, Eye, Thermometer, CloudRain
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
  cardsTranslateX: {
    type: Number,
    required: true
  }
})

// 展开相关功能已移除

// 切换任务完成状态
const toggleTask = (dreamIndex, cardIndex, taskIndex) => {
  // 这里可以添加任务状态切换逻辑
  console.log(`Toggle task: ${dreamIndex}-${cardIndex}-${taskIndex}`)
}

// 获取梦想进度百分比
const getProgressPercentage = (dream) => {
  const totalTasks = dream.cards.reduce((sum, card) => sum + card.tasks.length, 0)
  const completedTasks = dream.cards.reduce((sum, card) => 
    sum + card.tasks.filter(task => task.completed).length, 0)
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
}

// 获取紧急任务数量
const getUrgentTasksCount = (dream) => {
  return dream.cards
    .filter(card => card.quadrant.includes('urgent'))
    .reduce((sum, card) => sum + card.tasks.length, 0)
}

// 获取重要任务数量
const getImportantTasksCount = (dream) => {
  return dream.cards
    .filter(card => card.quadrant.includes('important'))
    .reduce((sum, card) => sum + card.tasks.length, 0)
}

// 获取总任务数量
const getTotalTasksCount = (dream) => {
  return dream.cards.reduce((sum, card) => sum + card.tasks.length, 0)
}

// 获取优先级样式类
const getPriorityClass = (quadrant) => {
  const classMap = {
    'important-urgent': 'priority-critical',
    'important-not-urgent': 'priority-high',
    'not-important-urgent': 'priority-medium',
    'not-important-not-urgent': 'priority-low'
  }
  return classMap[quadrant] || 'priority-low'
}

// 获取优先级图标
const getPriorityIcon = (quadrant) => {
  const iconMap = {
    'important-urgent': Flame,
    'important-not-urgent': Star,
    'not-important-urgent': Zap,
    'not-important-not-urgent': FileText
  }
  return iconMap[quadrant] || FileText
}

</script>

<style lang="scss" scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}
.main-content-area {
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  
  .content-container {
    width: 100%;
    height: 100%;
    padding: 1rem .5rem 0;
    overflow-y: auto;
    
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    -ms-overflow-style: none;
    scrollbar-width: none;
    
    .dreams-content {
      display: flex;
      width: 500%;
      height: 100%;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      
      .dream-workspace {
        width: 20%;
        height: 100%;
        opacity: 0.4;
        transition: opacity 0.3s ease;
        padding: 0 0.5rem;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
        
        // 隐藏滚动条
        &::-webkit-scrollbar {
          display: none;
        }
        
        -ms-overflow-style: none;
        scrollbar-width: none;
        
        &.active {
          opacity: 1;
        }
        
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
           grid-auto-rows: minmax(80px, 80px);
           gap: 0.8rem 0.5rem;
           width: 100%;
           height: auto;
           margin-bottom: 2rem;
         }
         
          .flow-item {
           background: #F5F5F5;
           border-radius: 1.8rem;
           padding: .4rem .5rem;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
           backdrop-filter: blur(10px);
           border: 1px solid rgba(255, 255, 255, 0.3);
           overflow: hidden;
           width: 100%;
          height: 100%;
           
                                   // 紧凑卡片样式 - 基础样式
            .card-content.compact {
              height: 100%;
              background: transparent;
              padding: 0;
              border-radius: 18px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              
              .compact-icon {
                position: absolute;
                top: 0.15rem;
                right: 0.15rem;
                width: 1.25rem;
                height: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                opacity: 0.7;
                z-index: 1;
                
                .icon {
                  width: 100%;
                  height: 100%;
                  stroke-width: 2;
                  color: #2C3E50;
                }
              }
              
              .compact-content {
                text-align: center;
                z-index: 2;
                padding: 0.2rem;
                
                .compact-main {
                  font-size: 0.75rem;
                  font-weight: 700;
                  color: #2C3E50;
                  line-height: 1;
                  margin-bottom: 0.3rem;
                }
                
                .compact-sub {
                  font-size: 0.4rem;
                  color: #7F8C8D;
                  line-height: 1;
                }
              }
            }
            
              // 时间卡片布局 - 数字时钟风格
              &.time-module .card-content.compact {
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                
                .compact-content {
                  text-align: center;
                  
                  .compact-main {
                    font-size: 1.3rem;
                    font-weight: 900;
                    color: white;
                    margin-bottom: 0.3rem;
                    line-height: 1;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                  }
                  
                  .compact-sub {
                    font-size: 0.35rem;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 500;
                  }
                }
              }
              
              // 日期卡片布局 - 日历风格
              &.date-module .card-content.compact {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #2d3748;
                
                .compact-content {
                  text-align: center;
                  
                  .compact-main {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 0.3rem;
                    line-height: 1;
                  }
                  
                  .compact-sub {
                    font-size: 0.4rem;
                    color: #4a5568;
                    font-style: italic;
                  }
                }
              }
              
              // 步数卡片布局 - 大数字设计
              &.steps-module .card-content.compact {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                
                .compact-content {
                  text-align: center;
                  z-index: 2;
                  
                  .compact-main {
                    font-size: 0.9rem;
                    font-weight: 900;
                    color: #2C3E50;
                    margin-bottom: 0.3rem;
                    line-height: 1;
                  }
                  
                  .compact-sub {
                    font-size: 0.35rem;
                    color: #7F8C8D;
                    text-transform: uppercase;
                    font-weight: 500;
                  }
                }
                
                .compact-icon {
                  position: absolute;
                  top: 0.1rem;
                  right: 0.1rem;
                  opacity: 0.5;
                  transform: scale(0.7);
                }
              }
              
              // 电池卡片布局 - 进度条风格
              &.battery-module .card-content.compact {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
                color: white;
                
                .compact-content {
                  text-align: center;
                  z-index: 2;
                  
                  .compact-main {
                    font-size: 1rem;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 0.3rem;
                    line-height: 1;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                  }
                  
                  .compact-sub {
                    font-size: 0.35rem;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: uppercase;
                    font-weight: 500;
                  }
                }
                
                // 添加电池电量指示
                &::after {
                  content: '';
                  position: absolute;
                  bottom: 0.3rem;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 70%;
                  height: 3px;
                  background: linear-gradient(90deg, #ffffff 0%, #ffffff 85%, rgba(255, 255, 255, 0.3) 85%, rgba(255, 255, 255, 0.3) 100%);
                  border-radius: 1.5px;
                  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }
              }
              
              // 闹钟卡片布局 - 闹钟风格
              &.alarm-module .card-content.compact {
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                color: white;
                
                .compact-content {
                  text-align: center;
                  
                  .compact-main {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 0.3rem;
                    line-height: 1;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                  }
                  
                  .compact-sub {
                    font-size: 0.4rem;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 600;
                    text-transform: uppercase;
                  }
                }
              }
              
              // 温度卡片布局 - 温度计风格
              &.temp-module .card-content.compact {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                
                .compact-content {
                  text-align: center;
                  z-index: 2;
                  
                  .compact-main {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #E67E22;
                    margin-bottom: 0.3rem;
                    line-height: 1;
                  }
                  
                  .compact-sub {
                    font-size: 0.35rem;
                    color: #7F8C8D;
                    text-transform: uppercase;
                    font-weight: 500;
                  }
                }
                
                .compact-icon {
                  position: absolute;
                  top: 0.1rem;
                  right: 0.1rem;
                  opacity: 0.5;
                  transform: scale(0.7);
                  color: #E67E22;
                }
                
                // 添加温度计效果
                &::before {
                  content: '';
                  position: absolute;
                  right: 0.1rem;
                  bottom: 0.1rem;
                  width: 3px;
                  height: 60%;
                  background: linear-gradient(to top, #E67E22 0%, #E67E22 70%, #E0E0E0 70%, #E0E0E0 100%);
                  border-radius: 1.5px;
                }
            }
            
            .card-content {
              height: 100%;
              display: flex;
              flex-direction: column;
             background: transparent;
             border-radius: 0.75rem;
             padding: 0.5rem;
              
              .card-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                background: #fafafabf;
                border-radius: 2rem;
                padding: 0.5rem;
                margin: -0.5rem -0.5rem 0.5rem -0.5rem;
                

                .card-title {
                   font-size: 0.7rem;
                   font-weight: 600;
                   color: #2C3E50;
                   margin-bottom: -4px;
                }
                
                .card-subtitle {
                   font-size: 0.6rem;
                   font-weight: 400;
                   color: #7F8C8D;
                   text-transform: uppercase;
                   letter-spacing: 0.3px;
                }
                
                .header-content {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                }
                
                .header-status {
                  display: flex;
                  align-items: center;
                  gap: 0.3rem;
                  
                  .status-dot {
                    width: 0.4rem;
                    height: 0.4rem;
                    border-radius: 50%;
                    
                    &.urgent {
                      background: #FF3B30;
                    }
                    
                    &.important {
                      background: #FFCC00;
                    }
                  }
                  
                  .status-text {
                    font-size: 0.6rem;
                    color: #7F8C8D;
                    font-weight: 500;
                  }
                }
                
                .header-progress {
                  display: flex;
                  align-items: center;
                  
                  .progress-circle {
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #34C759, #30D158);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    .progress-text {
                      font-size: 0.5rem;
                      color: white;
                      font-weight: 700;
                    }
                  }
                }
              }

              .card-icon {
                font-size: 0.7rem;
                width: 1.75rem;
                height: 1.75rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: #4A90E2;
                flex-shrink: 0;
                
                .icon {
                  width: 0.8rem;
                  height: 0.8rem;
                  stroke-width: 2;
                  color: white;
                  flex-shrink: 0;
                }
              }
              
              .card-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                
                .weather-info {
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  
                  .weather-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    gap: 0.4rem;
                    width: 100%;
                    height: 100%;
                    
                    .weather-item {
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      gap: 0.1rem;
                      padding: 0.4rem 0.3rem;
                      background: rgb(255 255 255 / 30%);
                      border-radius: 0.5rem;
                      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                      
                      .weather-content {
                        text-align: center;
                        
                        .weather-value {
                          font-size: 0.9rem;
                          font-weight: 700;
                          color: #2C3E50;
                          line-height: 1;
                          margin-bottom: 0.05rem;
                        }
                        
                        .weather-label {
                          font-size: 0.5rem;
                          color: #7F8C8D;
                          font-weight: 500;
                          text-transform: uppercase;
                          letter-spacing: 0.3px;
                          line-height: 1;
                        }
                      }
                      
                      &.main-temp {
                        .weather-value {
                          color: #FF3B30;
                        }
                      }
                      
                      &.humidity {
                        .weather-value {
                          color: #007AFF;
                        }
                      }
                      
                      &.wind {
                        .weather-value {
                          color: #34C759;
                        }
                      }
                      
                      &.visibility {
                        .weather-value {
                          color: #AF52DE;
                        }
                      }
                    }
                  }
                }
                
                .time-info, .date-info {
                   font-size: .8rem;
                  font-weight: 600;
                   color: #2C3E50;
                  text-align: center;
                }
                
                .stats-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 0.3rem;
                  margin-bottom: 0.5rem;
                  
                  .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.1rem;
                    padding: 0.3rem 0.2rem;
                    
                    .stat-number {
                      font-size: 0.85rem;
                      font-weight: 700;
                      line-height: 1;
                      margin-bottom: 0.05rem;
                      color: #2C3E50;
                    }
                    
                    .stat-label {
                      font-size: 0.45rem;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.3px;
                      line-height: 1;
                      color: #7F8C8D;
                    }
                  }
                }
                
                .task-list {
                  .task-item {
                    margin-bottom: 0.5rem;
                    
                    &:last-child {
                      margin-bottom: 0;
                    }
                    
                    .task-title {
                       font-size: 0.8rem;
                      font-weight: 600;
                       color: #2C3E50;
                      margin-bottom: 0.25rem;
                    }
                    
                    .task-desc {
                       font-size: 0.7rem;
                       color: #7F8C8D;
                    }
                  }
                }
                
                .notes-content {
                   font-size: 0.8rem;
                   color: #7F8C8D;
                  line-height: 1.4;
                 }
                
                                                 .music-info {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  height: 100%;
                  padding: 0.3rem 0;
                  
                                        .music-left {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        
                        .music-icon {
                          width: 1.5rem;
                          height: 1.5rem;
                          color: #FF2D92;
                          stroke-width: 2;
                        }
                      }
                  
                  .music-right {
                    flex: 3;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: left;
                    padding-left: 0.5rem;
                    
                    .song-title {
                      font-size: 0.85rem;
                      font-weight: 600;
                      color: #2C3E50;
                      margin-bottom: 0.1rem;
                      line-height: 1.2;
                    }
                    
                    .song-artist {
                      font-size: 0.6rem;
                      color: #7F8C8D;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.3px;
                      line-height: 1.2;
                    }
                  }
                }
                
                .health-info {
                  display: flex;
                  flex-direction: row;
                  justify-content: space-around;
                  align-items: center;
                  height: 100%;
                  padding: 0.3rem 0;
                  
                  .health-item {
                    text-align: center;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    
                    .health-value {
                      font-size: 0.9rem;
                      font-weight: 700;
                      color: #2C3E50;
                      margin-bottom: 0.05rem;
                    }
                    
                    .health-label {
                      font-size: 0.55rem;
                      color: #7F8C8D;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.3px;
                    }
                  }
                }
                
                .steps-info, .heart-rate-info, .battery-info {
                  font-size: 0.9rem;
                  font-weight: 600;
                  color: #2C3E50;
                  text-align: center;
                }
                
                .schedule-list {
                  .schedule-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    
                    &:last-child {
                      margin-bottom: 0;
                    }
                    
                    .schedule-time {
                       font-size: 0.8rem;
                      font-weight: 600;
                       color: #2C3E50;
                      min-width: 3rem;
                    }
                    
                    .schedule-content {
                       font-size: 0.8rem;
                       color: #7F8C8D;
                     }
                  }
                }
                

                
                .team-members {
                  display: flex;
                  justify-content: center;
                  gap: 0.5rem;
                  margin-bottom: 0.5rem;
                  
                  .member-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid white;
                  }
                }
                
                                 .team-status {
                   font-size: 0.8rem;
                   color: #7F8C8D;
                   text-align: center;
                 }
              }
            }
            
              // 特殊模块样式 - 统一使用灰色背景
              &.weather-module,
              &.urgent-important-module,
              &.important-not-urgent-module,
              &.not-important-urgent-module,
              &.not-important-not-urgent-module,
              &.notes-module,
              &.schedule-module,
              &.stats-module,
              &.project-module,
              &.team-module,
              &.music-module,
              &.steps-module,
              &.heart-rate-module,
              &.battery-module,
              &.time-module,
              &.date-module {
                background: #f5f5f54a;
              }
              
              // 时间模块 - 深蓝色
              &.time-module .card-icon {
                background: #007AFF !important;
              }
              
              // 日期模块 - 紫色
              &.date-module .card-icon {
                background: #AF52DE !important;
              }
              
              // 天气模块 - 橙色
              &.weather-module .card-icon {
                background: #FF9500 !important;
              }
              
              // 重要紧急 - 红色
              &.urgent-important-module .card-icon {
                background: #FF3B30 !important;
              }
              
              // 重要不紧急 - 黄色
              &.important-not-urgent-module .card-icon {
                background: #FFCC00 !important;
              }
              
              // 笔记模块 - 绿色
              &.notes-module .card-icon {
                background: #34C759 !important;
              }
              
              // 日程模块 - 青色
              &.schedule-module .card-icon {
                background: #5AC8FA !important;
              }
              
              // 统计模块 - 深绿色
              &.stats-module .card-icon {
                background: #30D158 !important;
              }
              
              // 音乐模块 - 粉色
              &.music-module {
                .card-content {
                  background: transparent;
                  color: #2C3E50;
                  position: relative;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  padding: 0.5rem;
                  
                  .card-body {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    .music-info {
                      width: 100%;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      
                      .music-left {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        
                        .music-icon {
                          width: 1.5rem;
                          height: 1.5rem;
                          color: #FF2D92;
                          stroke-width: 2;
                        }
                      }
                      
                      .music-right {
                        flex: 3;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        text-align: left;
                        padding-left: 0.5rem;
                        
                        .song-title {
                          color: #2C3E50;
                          font-size: 0.85rem;
                        }
                        
                        .song-artist {
                          color: #7F8C8D;
                          font-size: 0.6rem;
                        }
                      }
                    }
                  }
                }
                

              }
              
              // 健康数据 - 珊瑚色
              &.heart-rate-module {
                .card-content {
                  background: transparent;
                  color: #2C3E50;
                  position: relative;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  padding: 0.5rem;
                  
                  .card-icon {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 1.35rem;
                    height: 1.35rem;
                    background: #FF6B6B;
                    z-index: 2;
                    
                    .icon {
                      color: white;
                    }
                  }
                  
                  .card-body {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    .health-info {
                      width: 100%;
                      display: flex;
                      flex-direction: row;
                      justify-content: space-around;
                      align-items: center;
                      
                      .health-item {
                        text-align: center;
                        flex: 1;
                        
                        .health-value {
                          color: #2C3E50;
                          font-size: 0.9rem;
                        }
                        
                        .health-label {
                          color: #7F8C8D;
                          font-size: 0.55rem;
                        }
                      }
                    }
                  }
                }
                
                .card-icon {
                  background: #FF6B6B !important;
                }
              }
              
              // 步数模块 - 薄荷绿
              &.steps-module .card-icon {
                background: #4ECDC4 !important;
              }
              
                             // 电池模块 - 柠檬绿
               &.battery-module .card-icon {
                 background: #A8E6CF !important;
               }
               
               
        }
      }
    }
  }
}
 
</style>