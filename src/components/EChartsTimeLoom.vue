<template>
  <div class="echarts-time-loom">
    <!-- 右上角大脑图标控制面板 -->
    <div class="brain-controls">
      <button class="brain-btn" @click="toggleAnalysisMode" :class="{ active: isAnalysisMode }">
        <component :is="Brain" :size="20" />
        <span class="brain-text">智能分析</span>
      </button>
      <button class="reset-btn" @click="resetView">
        <component :is="RotateCcw" :size="18" />
      </button>
    </div>

    <!-- ECharts 3D图表 -->
    <div class="echarts-container" ref="chartContainer">
      <v-chart 
        class="chart" 
        :option="chartOption" 
        :autoresize="true"
        @click="handleBarClick"
        @mouseover="handleBarHover"
        @mouseout="handleBarLeave"
        ref="chartRef" />
    </div>


    <!-- 问题汇总弹出框 -->
    <div class="brain-popup active" v-if="isAnalysisMode && selectedBar">
      <div class="popup-arrow"></div>
      <div class="popup-header">
        <component :is="Brain" :size="16" />
        <span class="popup-title">当前问题汇总</span>
      </div>
      
      <div class="popup-content">
        <!-- 发现的问题 -->
        <div class="insight-card">
          <div class="insight-header">
            <strong>发现的问题</strong>
          </div>
          <p class="insight-content">{{ getCurrentIssues(selectedBar) }}</p>
        </div>

        <!-- 影响分析 -->
        <div class="insight-card">
          <div class="insight-header">
            <strong>影响分析</strong>
          </div>
          <p class="insight-content">{{ getImpactAnalysis(selectedBar) }}</p>
        </div>

        <!-- 数据对比 -->
        <div class="comparison-mini">
          <div class="comparison-title">与目标差距</div>
          <div class="comparison-row">
            <span class="comparison-label">同维度</span>
            <div class="comparison-mini-bar">
              <div class="comparison-mini-fill" :style="`width: ${getCategoryAverage(selectedBar.category) * 5}%`"></div>
            </div>
            <span class="comparison-mini-value">{{ getCategoryAverage(selectedBar.category).toFixed(1) }}</span>
          </div>
          <div class="comparison-row">
            <span class="comparison-label">理想值</span>
            <div class="comparison-mini-bar">
              <div class="comparison-mini-fill" :style="`width: 80%`"></div>
            </div>
            <span class="comparison-mini-value">8.0</span>
          </div>
        </div>

        <!-- 改进建议 -->
        <div class="actions-mini">
          <div class="actions-title">改进建议</div>
          <ul class="actions-mini-list">
            <li v-for="suggestion in getImprovementSuggestions(selectedBar).slice(0, 3)" :key="suggestion" class="action-mini-item">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components'
import 'echarts-gl'
import VChart from 'vue-echarts'
import { 
  RotateCcw, Maximize, Heart, Briefcase, Users, Target,
  Clock, Sparkles, Brain, Compass, Star, Home, Zap
} from 'lucide-vue-next'

// 注册ECharts组件
use([
  CanvasRenderer,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
])
// echarts-gl会自动注册3D组件

// 响应式数据
const chartContainer = ref(null)
const chartRef = ref(null)
const selectedDimension = ref('all')
const selectedNode = ref(null)
const selectedBar = ref(null)
const isFullscreen = ref(false)
const isAnalysisMode = ref(false)

// 可视化模式定义
const visualizationModes = ref([
  { id: 'nodes', name: '节点图', icon: Star },
  { id: 'heatmap', name: '热力图', icon: Clock }
])

const currentMode = ref('heatmap')

// 维度定义
const dimensions = ref([
  { id: 'all', name: '全部', icon: Star },
  { id: 'family', name: '家庭', icon: Heart },
  { id: 'career', name: '事业', icon: Briefcase },
  { id: 'social', name: '社交', icon: Users },
  { id: 'personal', name: '个人', icon: Sparkles }
])

// 3D空间中的节点数据
const nodes = ref([
  // X轴 - 家庭维度
  { name: '家庭和谐', value: 85, coord: [10, 5, 0], category: '家庭', dimension: 'family', icon: Heart, description: '维护良好的夫妻关系和亲子关系', status: '进行中' },
  { name: '亲子教育', value: 70, coord: [15, 8, 0], category: '家庭', dimension: 'family', icon: Home, description: '培养孩子的品格和能力', status: '计划中' },
  { name: '家庭财务', value: 60, coord: [12, 3, 0], category: '家庭', dimension: 'family', icon: Target, description: '合理规划家庭支出和储蓄', status: '进行中' },
  
  // Y轴 - 事业维度  
  { name: '职业发展', value: 75, coord: [0, 10, 5], category: '事业', dimension: 'career', icon: Briefcase, description: '提升专业技能，争取晋升机会', status: '进行中' },
  { name: '技能学习', value: 80, coord: [0, 15, 8], category: '事业', dimension: 'career', icon: Brain, description: '学习新技术和管理知识', status: '进行中' },
  { name: '人脉建设', value: 55, coord: [0, 12, 3], category: '事业', dimension: 'career', icon: Users, description: '扩展职业关系网络', status: '计划中' },
  
  // Z轴 - 个人成长维度
  { name: '健康管理', value: 65, coord: [5, 0, 10], category: '个人', dimension: 'personal', icon: Zap, description: '保持良好的身体和心理健康', status: '进行中' },
  { name: '兴趣爱好', value: 90, coord: [8, 0, 15], category: '个人', dimension: 'personal', icon: Sparkles, description: '培养和发展个人兴趣', status: '优秀' },
  { name: '精神追求', value: 45, coord: [3, 0, 12], category: '个人', dimension: 'personal', icon: Compass, description: '探索人生意义和价值', status: '思考中' },
  
  // 中心交汇点
  { name: '生活平衡', value: 70, coord: [5, 5, 5], category: '核心', dimension: 'all', icon: Star, description: '在各个维度间寻找最佳平衡', status: '持续优化' }
])

// 连接线数据（XYZ三条主轴线）
const connections = ref([
  // X轴线（家庭轴）- 红色
  { source: [0, 0, 0], target: [20, 0, 0], color: '#ef4444', name: 'X轴-家庭线' },
  // Y轴线（事业轴）- 蓝色  
  { source: [0, 0, 0], target: [0, 20, 0], color: '#3b82f6', name: 'Y轴-事业线' },
  // Z轴线（个人轴）- 绿色
  { source: [0, 0, 0], target: [0, 0, 20], color: '#10b981', name: 'Z轴-个人线' },
  
  // 节点间连接线
  { source: [10, 5, 0], target: [5, 5, 5], color: '#ef444466', name: '家庭-核心连线' },
  { source: [0, 10, 5], target: [5, 5, 5], color: '#3b82f666', name: '事业-核心连线' },
  { source: [5, 0, 10], target: [5, 5, 5], color: '#10b98166', name: '个人-核心连线' }
])

// 热力图数据 - 基于家庭、事业、社交的时间投入分析
const timeSlots = ref(['早晨', '上午', '中午', '下午', '傍晚', '晚上', '深夜'])

const categories = ref(['家庭生活', '事业发展', '社交活动'])

// 生活平衡数据：基于时间段和生活维度的投入程度
// 数据格式：[时间段索引, 类别索引, 投入程度(0-10)]
const heatmapData = ref([
  // 家庭生活 (类别0) - 各时间段的投入情况
  [0, 0, 9],  // 早晨：准备早餐、叫醒孩子、家庭晨间互动
  [1, 0, 3],  // 上午：家庭事务处理较少
  [2, 0, 6],  // 中午：家庭午餐时间
  [3, 0, 2],  // 下午：家庭活动较少
  [4, 0, 7],  // 傍晚：接孩子、准备晚餐
  [5, 0, 10], // 晚上：家庭团聚、陪伴孩子、夫妻交流
  [6, 0, 4],  // 深夜：哄孩子睡觉、夫妻私人时间
  
  // 事业发展 (类别1) - 工作和职业提升的时间分布
  [0, 1, 2],  // 早晨：查看邮件、规划当天工作
  [1, 1, 10], // 上午：核心工作时间、重要会议
  [2, 1, 5],  // 中午：工作午餐、同事交流
  [3, 1, 9],  // 下午：项目推进、技能学习
  [4, 1, 6],  // 傍晚：处理邮件、总结当天
  [5, 1, 3],  // 晚上：在线学习、阅读行业资料
  [6, 1, 1],  // 深夜：偶尔加班或思考工作规划
  
  // 社交活动 (类别2) - 朋友聚会、社交网络维护
  [0, 2, 1],  // 早晨：社交媒体浏览
  [1, 2, 2],  // 上午：偶尔的朋友交流
  [2, 2, 8],  // 中午：与朋友聚餐、商务午餐
  [3, 2, 4],  // 下午：社交媒体互动
  [4, 2, 5],  // 傍晚：朋友约会前的时段
  [5, 2, 9],  // 晚上：朋友聚会、社交活动高峰
  [6, 2, 3]   // 深夜：深度交流、夜生活
])

// 过滤后的节点
const filteredNodes = computed(() => {
  if (selectedDimension.value === 'all') {
    return nodes.value
  }
  return nodes.value.filter(node => 
    node.dimension === selectedDimension.value || node.dimension === 'all'
  )
})

// ECharts配置选项
const chartOption = computed(() => {
  if (currentMode.value === 'heatmap') {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove|click',
        enterable: true,
        hideDelay: 300,
        showDelay: 0,
        formatter: (params) => {
          if (params.componentType === 'series' && params.seriesType === 'bar3D') {
            const timeSlot = timeSlots.value[params.data.value[0]]
            const category = categories.value[params.data.value[1]]
            const value = params.data.value[2]
            
            // 生成具体的活动描述
            const getActivityDescription = (timeIndex, categoryIndex, intensity) => {
              const activities = {
                0: { // 家庭生活
                  0: '准备早餐、叫醒孩子、家庭晨间互动',
                  1: '家庭事务处理、日常沟通',
                  2: '家庭午餐时间、关怀家人',
                  3: '处理家庭琐事、准备晚饭',
                  4: '接孩子、准备晚餐、家庭聚餐',
                  5: '家庭团聚、陪伴孩子、夫妻交流',
                  6: '哄孩子睡觉、夫妻私人时间'
                },
                1: { // 事业发展
                  0: '查看邮件、规划当天工作',
                  1: '核心工作时间、重要会议',
                  2: '工作午餐、同事交流',
                  3: '项目推进、技能学习',
                  4: '处理邮件、总结当天工作',
                  5: '在线学习、阅读行业资料',
                  6: '偶尔加班或思考工作规划'
                },
                2: { // 社交活动
                  0: '社交媒体浏览、朋友问候',
                  1: '偶尔的朋友交流、工作社交',
                  2: '与朋友聚餐、商务午餐',
                  3: '社交媒体互动、朋友联系',
                  4: '朋友约会前时段、社交准备',
                  5: '朋友聚会、社交活动高峰',
                  6: '深度交流、夜生活、私密聚会'
                }
              }
              return activities[categoryIndex]?.[timeIndex] || '其他活动'
            }
            
            const description = getActivityDescription(params.data.value[0], params.data.value[1], value)
            const intensityText = value >= 8 ? '高投入' : value >= 5 ? '中等投入' : value >= 2 ? '低投入' : '很少投入'
            
            return `
              <div style="padding: 16px; max-width: 350px; min-width: 280px;">
                <strong style="color: #333; font-size: 16px; line-height: 1.4;">${timeSlot} - ${category}</strong><br/>
                <div style="margin: 10px 0; color: #666; font-size: 14px; line-height: 1.5;">${description}</div>
                <div style="display: flex; align-items: center; margin-top: 12px; padding: 8px; background: rgba(37, 99, 235, 0.1); border-radius: 6px;">
                  <span style="color: #6b7280; margin-right: 10px; font-size: 14px;">投入程度:</span>
                  <span style="color: #2563eb; font-weight: bold; font-size: 16px;">${value}/10</span>
                  <span style="margin-left: 12px; color: #059669; font-size: 13px; padding: 2px 6px; background: rgba(5, 150, 105, 0.1); border-radius: 4px;">${intensityText}</span>
                </div>
              </div>
            `
          }
          return ''
        }
      },
      visualMap: {
        max: 20,
        min: 0,
        orient: 'vertical',
        left: 20,
        bottom: 20,
        itemWidth: 20,
        itemHeight: 100,
        textGap: 15,
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026'
          ]
        },
        textStyle: {
          color: '#fff',
          fontSize: 12
        },
        text: ['高投入', '低投入']
      },
      xAxis3D: {
        type: 'category',
        data: timeSlots.value,
        name: '时间段',
        nameTextStyle: { color: '#fff', fontSize: 13 },
        axisLabel: { 
          color: '#fff', 
          fontSize: 10,
          interval: 0,
          rotate: 0
        }
      },
      yAxis3D: {
        type: 'category', 
        data: categories.value,
        name: '生活维度',
        nameTextStyle: { color: '#fff', fontSize: 13 },
        axisLabel: { 
          color: '#fff', 
          fontSize: 10,
          interval: 0
        }
      },
      zAxis3D: {
        type: 'value',
        name: '投入程度',
        nameTextStyle: { color: '#fff', fontSize: 13 },
        axisLabel: { color: '#fff', fontSize: 9 }
      },
      grid3D: {
        boxWidth: 150,
        boxDepth: 100,
        boxHeight: 60,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        light: {
          main: { intensity: 1.4 },
          ambient: { intensity: 0.4 }
        },
        viewControl: {
          autoRotate: false,
          distance: 180,
          alpha: 25,
          beta: 45,
          rotateSensitivity: 2,
          zoomSensitivity: 2,
          panSensitivity: 2,
          animation: true,
          animationDurationUpdate: 800,
          damping: 0.8,
          minDistance: 120,
          maxDistance: 300,
          minAlpha: -90,
          maxAlpha: 90,
          minBeta: -180,
          maxBeta: 180
        }
      },
      series: [{
        type: 'bar3D',
        data: heatmapData.value.map(item => ({
          value: [item[0], item[1], item[2]]
        })),
        shading: 'color',
        label: { show: false },
        itemStyle: { 
          opacity: 0.7,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        emphasis: {
          label: { 
            show: true,
            fontSize: 14, 
            color: '#fff',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 4,
            padding: [4, 8]
          },
          itemStyle: { 
            opacity: 1,
            color: '#ff6b6b',
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 15,
            shadowColor: 'rgba(255, 107, 107, 0.8)'
          }
        },
        select: {
          label: {
            show: true,
            fontSize: 14,
            color: '#fff',
            fontWeight: 'bold'
          },
          itemStyle: {
            opacity: 0.9,
            borderWidth: 2,
            borderColor: '#ffd700',
            shadowBlur: 15,
            shadowColor: 'rgba(255, 215, 0, 0.8)'
          }
        }
      }]
    }
  }
  
  // 原有的节点图模式
  return {
  backgroundColor: 'transparent',
  tooltip: {
    formatter: (params) => {
      if (params.componentType === 'series' && params.seriesType === 'scatter3D') {
        const data = params.data
        return `
          <div style="padding: 8px;">
            <strong>${data.name}</strong><br/>
            <span style="color: #666;">进度: ${data.value[3]}%</span><br/>
            <span style="color: #666;">类型: ${data.category}</span>
          </div>
        `
      }
      return ''
    }
  },
  xAxis3D: {
    type: 'value',
    name: '家庭维度',
    nameTextStyle: { color: '#ef4444', fontSize: 14 },
    axisLine: { lineStyle: { color: '#ef4444', width: 3 } },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    min: -2,
    max: 22
  },
  yAxis3D: {
    type: 'value', 
    name: '事业维度',
    nameTextStyle: { color: '#3b82f6', fontSize: 14 },
    axisLine: { lineStyle: { color: '#3b82f6', width: 3 } },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    min: -2,
    max: 22
  },
  zAxis3D: {
    type: 'value',
    name: '个人维度', 
    nameTextStyle: { color: '#10b981', fontSize: 14 },
    axisLine: { lineStyle: { color: '#10b981', width: 3 } },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
    min: -2,
    max: 22
  },
  grid3D: {
    boxWidth: 200,
    boxHeight: 200,
    boxDepth: 200,
    axisPointer: {
      show: false
    },
    light: {
      main: {
        intensity: 1.2,
        shadow: true
      },
      ambient: {
        intensity: 0.3
      }
    },
    viewControl: {
      autoRotate: false,
      distance: 300,
      alpha: 20,
      beta: 40,
      rotateSensitivity: 1,
      zoomSensitivity: 1,
      panSensitivity: 1,
      animation: true,
      animationDurationUpdate: 1000,
      damping: 0.9
    },
    postEffect: {
      enable: true,
      SSAO: {
        enable: true,
        intensity: 1.2
      }
    }
  },
  series: [
    // 节点散点图
    {
      type: 'scatter3D',
      coordinateSystem: 'cartesian3D',
      data: filteredNodes.value.map(node => ({
        name: node.name,
        value: [...node.coord, node.value],
        category: node.category,
        dimension: node.dimension,
        icon: node.icon,
        description: node.description,
        status: node.status,
        itemStyle: {
          color: getDimensionColor(node.dimension),
          opacity: 0.9
        }
      })),
      symbolSize: (data) => Math.max(8, data[3] / 5 + 5),
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff'
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{b}',
        fontSize: 11,
        color: '#333',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 4,
        padding: [2, 6]
      },
      emphasis: {
        itemStyle: {
          color: '#ffeb3b',
          borderColor: '#ff9800',
          borderWidth: 3
        },
        label: {
          fontSize: 13,
          color: '#ff9800'
        }
      }
    },
    
    // 连接线
    ...connections.value.map(conn => ({
      type: 'line3D',
      coordinateSystem: 'cartesian3D', 
      data: [
        { coord: conn.source, lineStyle: { color: conn.color, width: 4, opacity: 0.8 } },
        { coord: conn.target, lineStyle: { color: conn.color, width: 4, opacity: 0.8 } }
      ],
      lineStyle: {
        color: conn.color,
        width: 4,
        opacity: 0.8
      }
    }))
  ]
}
})

// 工具函数
const getDimensionColor = (dimension) => {
  const colors = {
    'family': '#ef4444',
    'career': '#3b82f6', 
    'personal': '#10b981',
    'social': '#f59e0b',
    'all': '#8b5cf6'
  }
  return colors[dimension] || '#6b7280'
}

const selectDimension = (dimId) => {
  selectedDimension.value = dimId
  selectedNode.value = null
}

const switchMode = (modeId) => {
  currentMode.value = modeId
  selectedNode.value = null
}

const handleBarClick = (params) => {
  if (params.componentType === 'series' && params.seriesType === 'bar3D') {
    const timeSlot = timeSlots.value[params.data.value[0]]
    const category = categories.value[params.data.value[1]]
    const value = params.data.value[2]
    
    // 生成活动描述的函数
    const getActivityDescription = (timeIndex, categoryIndex) => {
      const activities = {
        0: { // 家庭生活
          0: '准备早餐、叫醒孩子、家庭晨间互动',
          1: '家庭事务处理、日常沟通',
          2: '家庭午餐时间、关怀家人',
          3: '处理家庭琐事、准备晚饭',
          4: '接孩子、准备晚餐、家庭聚餐',
          5: '家庭团聚、陪伴孩子、夫妻交流',
          6: '哄孩子睡觉、夫妻私人时间'
        },
        1: { // 事业发展
          0: '查看邮件、规划当天工作',
          1: '核心工作时间、重要会议',
          2: '工作午餐、同事交流',
          3: '项目推进、技能学习',
          4: '处理邮件、总结当天工作',
          5: '在线学习、阅读行业资料',
          6: '偶尔加班或思考工作规划'
        },
        2: { // 社交活动
          0: '社交媒体浏览、朋友问候',
          1: '偶尔的朋友交流、工作社交',
          2: '与朋友聚餐、商务午餐',
          3: '社交媒体互动、朋友联系',
          4: '朋友约会前时段、社交准备',
          5: '朋友聚会、社交活动高峰',
          6: '深度交流、夜生活、私密聚会'
        }
      }
      return activities[categoryIndex]?.[timeIndex] || '其他活动'
    }

    selectedBar.value = {
      timeSlot,
      category,
      value,
      description: getActivityDescription(params.data.value[0], params.data.value[1])
    }
    
    // 为移动端提供触觉反馈
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // 轻微震动50ms
    }
    
    // 在移动端，点击时也显示tooltip
    if (isMobile()) {
      showMobileTooltip(params)
    }
  }
}

// 移动端hover效果模拟
const handleBarHover = (params) => {
  if (params.componentType === 'series' && params.seriesType === 'bar3D') {
    // 在移动端触摸时触发
    if (isMobile()) {
      showMobileTooltip(params)
    }
  }
}

const handleBarLeave = () => {
  if (isMobile()) {
    hideMobileTooltip()
  }
}

// 检测是否为移动设备
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0)
}

// 移动端tooltip显示
const showMobileTooltip = (params) => {
  if (chartRef.value) {
    chartRef.value.dispatchAction({
      type: 'showTip',
      seriesIndex: params.seriesIndex,
      dataIndex: params.dataIndex
    })
  }
}

// 移动端tooltip隐藏
const hideMobileTooltip = () => {
  if (chartRef.value) {
    chartRef.value.dispatchAction({
      type: 'hideTip'
    })
  }
}

// 原有的节点点击处理（保留兼容性）
const handleNodeClick = (params) => {
  if (params.componentType === 'series' && params.seriesType === 'scatter3D') {
    selectedNode.value = {
      name: params.data.name,
      value: params.data.value[3],
      category: params.data.category,
      description: params.data.description,
      status: params.data.status,
      icon: params.data.icon
    }
  }
}

const resetView = () => {
  if (chartRef.value) {
    chartRef.value.dispatchAction({
      type: 'restore'
    })
  }
  selectedNode.value = null
  selectedBar.value = null
}

const toggleAnalysisMode = () => {
  isAnalysisMode.value = !isAnalysisMode.value
  
  // 如果开启分析模式但没有选中数据，自动选择第一个数据点
  if (isAnalysisMode.value && !selectedBar.value && heatmapData.value.length > 0) {
    const firstData = heatmapData.value[0]
    selectedBar.value = {
      timeSlot: timeSlots.value[firstData[0]],
      category: categories.value[firstData[1]],
      value: firstData[2]
    }
  }
}

// 投入程度分析
const getInvestmentAnalysis = (value) => {
  if (value >= 9) return "极高投入，你在这个时段全身心投入，效果卓越"
  if (value >= 7) return "高投入状态，时间利用效率很高，值得保持"
  if (value >= 5) return "中等投入，有提升空间，可以考虑优化时间安排"
  if (value >= 3) return "低投入状态，建议重新审视这个时段的重要性"
  return "投入很少，可能存在时间浪费，需要重点关注"
}

// 优先级样式类
const getPriorityClass = (value) => {
  if (value >= 8) return 'high-priority'
  if (value >= 5) return 'medium-priority'
  if (value >= 2) return 'low-priority'
  return 'minimal-priority'
}

// 计算同类别平均值
const getCategoryAverage = (category) => {
  const categoryData = heatmapData.value.filter(item => {
    const categoryIndex = categories.value.indexOf(category)
    return item[1] === categoryIndex
  })
  const total = categoryData.reduce((sum, item) => sum + item[2], 0)
  return categoryData.length > 0 ? total / categoryData.length : 0
}

// 计算同时段平均值
const getTimeSlotAverage = (timeSlot) => {
  const timeIndex = timeSlots.value.indexOf(timeSlot)
  const timeData = heatmapData.value.filter(item => item[0] === timeIndex)
  const total = timeData.reduce((sum, item) => sum + item[2], 0)
  return timeData.length > 0 ? total / timeData.length : 0
}

// 时间洞察分析
const getTimeInsight = (bar) => {
  const timeIndex = timeSlots.value.indexOf(bar.timeSlot)
  const categoryIndex = categories.value.indexOf(bar.category)
  
  const insights = {
    0: { // 早晨
      0: "早晨是家庭互动的黄金时间，温馨的晨间时光能为全天带来正能量",
      1: "早晨规划工作有助于提高全天效率，建议保持这个习惯",
      2: "早晨社交活动相对较少，可以专注于个人成长或家庭时间"
    },
    1: { // 上午
      0: "上午家庭时间较少属于正常情况，工作日的必要安排",
      1: "上午是工作效率的高峰期，保持专注投入是明智选择",
      2: "上午适度的工作社交有助于建立职业关系网"
    },
    2: { // 中午
      0: "中午的家庭用餐时间很珍贵，增进家人感情的好机会",
      1: "工作午餐是职场社交的重要时段，平衡工作与休息",
      2: "午餐社交是维护人际关系的最佳时机"
    },
    3: { // 下午
      0: "下午家庭时间投入较少，可考虑增加与家人的互动",
      1: "下午是深度工作的好时段，继续保持高效产出",
      2: "下午的社交互动有助于缓解工作压力"
    },
    4: { // 傍晚
      0: "傍晚是家庭责任的重要时段，接送孩子、准备晚餐都很关键",
      1: "傍晚处理工作收尾事项，为第二天做好准备",
      2: "傍晚社交活动为夜间聚会做铺垫"
    },
    5: { // 晚上
      0: "晚上是家庭团聚的核心时间，珍贵的亲子时光",
      1: "晚上学习充电是自我提升的好时机",
      2: "晚上社交是放松身心、维护友谊的最佳时段"
    },
    6: { // 深夜
      0: "深夜家庭时间多为私密时光，夫妻关系维护的重要时段",
      1: "深夜工作需要注意健康平衡，避免过度疲劳",
      2: "深夜社交往往是深度交流的宝贵时间"
    }
  }
  
  return insights[timeIndex]?.[categoryIndex] || "这个时段的安排具有个人特色，继续保持你的节奏"
}

// 优化建议
const getOptimizationSuggestion = (bar) => {
  if (bar.value >= 8) {
    return "投入度很高，建议保持现状，注意避免过度消耗导致疲劳"
  } else if (bar.value >= 5) {
    return "可以尝试提高效率，通过优化流程或专注度来提升投入质量"
  } else if (bar.value >= 2) {
    return "建议重新评估这个时段的活动安排，考虑是否需要调整优先级"
  } else {
    return "投入度偏低，建议分析原因并制定具体的改进计划"
  }
}

// 平衡分析
const getBalanceAnalysis = (bar) => {
  const categoryAvg = getCategoryAverage(bar.category)
  const timeAvg = getTimeSlotAverage(bar.timeSlot)
  
  let analysis = ""
  
  if (bar.value > categoryAvg + 2) {
    analysis += "在此维度投入超出平均水平，显示出重点关注。"
  } else if (bar.value < categoryAvg - 2) {
    analysis += "在此维度投入低于平均水平，可能需要更多关注。"
  } else {
    analysis += "在此维度投入处于合理范围内。"
  }
  
  if (bar.value > timeAvg + 2) {
    analysis += "在此时段的活跃度高于常态，时间利用充分。"
  } else if (bar.value < timeAvg - 2) {
    analysis += "在此时段相对不够活跃，可考虑优化安排。"
  }
  
  return analysis || "时间分配较为均衡，保持当前的节奏即可。"
}

// 行动建议
const getActionSuggestions = (bar) => {
  const suggestions = []
  
  // 基于投入程度的建议
  if (bar.value >= 8) {
    suggestions.push("保持现有的高投入状态，注意劳逸结合")
    suggestions.push("可以将成功经验复制到其他时段")
  } else if (bar.value >= 5) {
    suggestions.push("尝试提高专注度，减少干扰因素")
    suggestions.push("设定更具体的目标来提升投入效果")
  } else {
    suggestions.push("制定明确的时间安排和目标")
    suggestions.push("消除可能的时间浪费因素")
  }
  
  // 基于类别的建议
  if (bar.category === '家庭生活') {
    suggestions.push("增加家庭互动的质量，而不仅仅是时间")
    if (bar.value < 5) suggestions.push("考虑安排更多家庭活动时间")
  } else if (bar.category === '事业发展') {
    suggestions.push("保持学习和成长的动力")
    if (bar.value < 5) suggestions.push("制定具体的职业发展计划")
  } else if (bar.category === '社交活动') {
    suggestions.push("维护深度友谊比扩大社交圈更重要")
    if (bar.value < 5) suggestions.push("主动安排与朋友的聚会时间")
  }
  
  // 基于时段的建议
  const timeIndex = timeSlots.value.indexOf(bar.timeSlot)
  if (timeIndex <= 1 && bar.value < 5) { // 早晨和上午
    suggestions.push("考虑调整作息，提高早间时段的活力")
  } else if (timeIndex >= 5 && bar.value < 5) { // 晚上和深夜
    suggestions.push("合理安排晚间活动，避免过度疲劳")
  }
  
  return suggestions.slice(0, 3) // 最多返回3个建议
}

// 获取当前问题
const getCurrentIssues = (bar) => {
  if (bar.value >= 7) {
    return `${bar.timeSlot}的${bar.category}投入度较高，需关注是否存在过度投入导致其他方面失衡的风险。`
  } else if (bar.value >= 4) {
    return `${bar.timeSlot}的${bar.category}投入度中等，存在进一步优化的空间，需要找出阻碍效率提升的具体因素。`
  } else {
    return `${bar.timeSlot}的${bar.category}投入度明显偏低，可能存在时间管理问题或缺乏明确目标的情况。`
  }
}

// 获取影响分析
const getImpactAnalysis = (bar) => {
  const categoryAvg = getCategoryAverage(bar.category)
  const timeAvg = getTimeSlotAverage(bar.timeSlot)
  
  if (bar.value < categoryAvg && bar.value < timeAvg) {
    return `该时段的低投入度不仅影响了${bar.category}整体表现，还拖累了${bar.timeSlot}的整体效率，形成负反馈循环。`
  } else if (bar.value < categoryAvg) {
    return `该时段表现拉低了${bar.category}的整体水平，需要重点关注以提升该维度的综合表现。`
  } else if (bar.value < timeAvg) {
    return `在${bar.timeSlot}这个时段内，${bar.category}的表现相对较弱，影响了该时段的整体效率。`
  } else {
    return `该时段表现良好，但仍需要关注是否影响了其他时段或维度的投入分配。`
  }
}

// 获取改进建议
const getImprovementSuggestions = (bar) => {
  const suggestions = []
  
  // 基于投入程度的改进建议
  if (bar.value < 3) {
    suggestions.push("制定具体的时间管理计划，明确该时段的核心目标")
    suggestions.push("识别并消除主要的时间浪费因素")
    suggestions.push("设置提醒和检查点，确保按计划执行")
  } else if (bar.value < 6) {
    suggestions.push("提升专注度，减少多任务切换")
    suggestions.push("优化工作环境，减少外界干扰")
    suggestions.push("设定更具挑战性但可达成的阶段性目标")
  } else {
    suggestions.push("保持现有水准，探索进一步优化的可能性")
    suggestions.push("考虑将成功经验复制到表现较弱的时段")
    suggestions.push("注意劳逸结合，避免过度投入导致倦怠")
  }
  
  return suggestions
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    chartContainer.value.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

onMounted(() => {
  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  
  // 添加移动端触摸事件监听
  if (isMobile() && chartContainer.value) {
    // 启用触摸事件
    chartContainer.value.style.touchAction = 'manipulation'
    
    // 添加触摸开始事件 - 模拟hover开始
    chartContainer.value.addEventListener('touchstart', (e) => {
      // 防止默认的滚动行为干扰图表交互
      if (e.target.closest('.chart')) {
        e.preventDefault()
      }
    }, { passive: false })
    
    // 添加触摸结束事件 - 模拟hover结束
    chartContainer.value.addEventListener('touchend', (e) => {
      // 延迟隐藏tooltip，给用户时间查看
      setTimeout(() => {
        hideMobileTooltip()
      }, 2000)
    })
  }
})
</script>

<style scoped>
.echarts-time-loom {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 右上角大脑控制面板 */
.brain-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.brain-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 24px;
  color: #6b46c1;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}

.brain-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.25);
}

.brain-btn.active {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  border-color: #8b5cf6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.brain-text {
  white-space: nowrap;
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(107, 114, 128, 0.3);
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(107, 114, 128, 0.6);
  color: #374151;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* ECharts容器 */
.echarts-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart {
  width: 100%;
  height: 100% !important;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}


/* 大脑分析弹出框 */
.brain-popup {
  position: fixed;
  top: 50px;
  right: 20px;
  width: 350px;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 150;
  overflow: hidden;
  transform: translateY(-10px) scale(0.95);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.brain-popup.active {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: all;
}

.popup-arrow {
  position: absolute;
  top: -8px;
  right: 30px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid rgba(139, 92, 246, 0.2);
}

.popup-arrow::after {
  content: '';
  position: absolute;
  top: 1px;
  left: -7px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid rgba(255, 255, 255, 0.15);
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05));
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
}

.popup-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #000000;
  text-shadow: none;
}

.popup-content {
  padding: 16px 20px;
  max-height: calc(80vh - 70px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
}

.popup-content::-webkit-scrollbar {
  width: 4px;
}

.popup-content::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 2px;
}

.insight-card {
  margin-bottom: 16px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border-left: 3px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #000000;
  text-shadow: none;
}

.insight-emoji {
  font-size: 1rem;
}

.insight-content {
  font-size: 0.8rem;
  color: #333333;
  line-height: 1.5;
  margin: 0;
  text-shadow: none;
}

.comparison-mini {
  margin: 16px 0;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border-left: 3px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.comparison-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
  text-shadow: none;
}

.comparison-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comparison-row:last-child {
  margin-bottom: 0;
}

.comparison-label {
  font-size: 0.75rem;
  color: #666666;
  width: 50px;
  flex-shrink: 0;
  text-shadow: none;
}

.comparison-mini-bar {
  flex: 1;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.comparison-mini-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.6s ease;
}

.comparison-mini-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #000000;
  width: 28px;
  text-align: right;
  flex-shrink: 0;
  text-shadow: none;
}

.actions-mini {
  margin: 16px 0 0 0;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border-left: 3px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.actions-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
  text-shadow: none;
}

.actions-mini-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.action-mini-item {
  font-size: 0.75rem;
  color: #333333;
  line-height: 1.4;
  margin-bottom: 6px;
  padding-left: 12px;
  position: relative;
  text-shadow: none;
}

.action-mini-item:last-child {
  margin-bottom: 0;
}

.action-mini-item::before {
  content: "•";
  color: #666666;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.bar-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.category-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.bar-text {
  flex: 1;
}

.bar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.bar-desc {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.panel-body {
  padding: 20px;
  max-height: calc(80vh - 80px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
}

.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 3px;
}

.panel-body::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}

.investment-section {
  margin-bottom: 20px;
}

.investment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.investment-label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.investment-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
}

.investment-bar {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.investment-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.6s ease;
}

.bar-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 投入程度分析 */
.investment-analysis {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.analysis-text {
  font-size: 0.8rem;
  color: #1e40af;
  line-height: 1.4;
  font-style: italic;
}

/* 详细统计信息 */
.detailed-stats {
  margin: 20px 0;
}

.stat-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-row .stat-item {
  flex: 1;
  margin: 0;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-badge.high-priority {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.priority-badge.medium-priority {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.priority-badge.low-priority {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.priority-badge.minimal-priority {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

/* 智能分析区域 */
.analysis-section {
  margin: 24px 0;
  padding: 16px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #6b46c1;
  margin: 0 0 16px 0;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border-left: 3px solid #8b5cf6;
}

.insight-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.insight-text {
  flex: 1;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #374151;
}

.insight-text strong {
  color: #6b46c1;
}

/* 数据对比区域 */
.comparison-section {
  margin: 20px 0;
  padding: 16px;
  background: rgba(34, 197, 94, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.comparison-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #059669;
  margin: 0 0 12px 0;
}

.comparison-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comparison-label {
  font-size: 0.8rem;
  color: #6b7280;
  min-width: 80px;
  flex-shrink: 0;
}

.comparison-bar {
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.comparison-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.6s ease;
}

.comparison-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #059669;
  min-width: 32px;
  text-align: right;
}

/* 行动建议区域 */
.action-section {
  margin: 20px 0 0 0;
  padding: 16px;
  background: rgba(245, 158, 11, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.1);
}

.action-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #d97706;
  margin: 0 0 12px 0;
}

.action-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  font-size: 0.8rem;
  color: #374151;
  line-height: 1.4;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
  position: relative;
}

.action-item::before {
  content: "→";
  color: #f59e0b;
  font-weight: bold;
  margin-right: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.stat-value {
  font-size: 0.8rem;
  font-weight: 500;
  color: #1f2937;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 12px;
}


/* 动画 */
@keyframes slideInUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .echarts-time-loom {
    position: relative;
    width: 100%;
    height: 100vh;
  }

  .brain-controls {
    top: 15px;
    right: 15px;
    gap: 8px;
  }
  
  .brain-btn {
    padding: 8px 12px;
    font-size: 0.75rem;
  }
  
  .brain-text {
    display: none;
  }
  
  .reset-btn {
    width: 40px;
    height: 40px;
  }

  .echarts-container {
    width: 100%;
    height: calc(100vh - 80px);
    padding: 10px;
    box-sizing: border-box;
  }
  
  .chart {
    width: 100% !important;
    height: 100% !important;
    min-height: 400px;
  }
  

  /* 移动端脑部分析弹窗适配 */
  .brain-popup {
    position: fixed !important;
    top: 60px !important;
    right: 15px !important;
    bottom: auto !important;
    left: 15px !important;
    width: auto !important;
    max-width: none !important;
    max-height: 70vh !important;
    margin-top: 0 !important;
    overflow-y: auto;
    
    .popup-arrow {
      display: none; /* 移动端隐藏箭头 */
    }
    
    .popup-header {
      padding: 12px 16px;
    }
    
    .popup-body {
      padding: 16px;
      max-height: calc(70vh - 60px);
    }
    
    .insight-card,
    .comparison-item,
    .action-item {
      padding: 12px;
      margin-bottom: 8px;
    }
    
    .insight-title,
    .comparison-title,
    .action-title {
      font-size: 0.9rem;
    }
    
    .insight-description,
    .comparison-description,
    .action-description {
      font-size: 0.8rem;
      line-height: 1.4;
    }
  }
  
  .panel-body {
    max-height: calc(70vh - 80px);
  }
  
  .analysis-section {
    margin: 16px 0;
    padding: 12px;
  }
  
  .comparison-section {
    margin: 16px 0;
    padding: 12px;
  }
  
  .action-section {
    margin: 16px 0 0 0;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .echarts-container {
    padding: 5px;
  }
  
  .brain-controls {
    top: 10px;
    right: 10px;
  }
  

  .brain-popup {
    top: 60px !important;
    right: 10px !important;
    left: 10px !important;
    max-height: 60vh !important;
    margin-top: 0 !important;
    
    .popup-body {
      padding: 12px;
      max-height: calc(60vh - 50px);
    }
    
    .insight-card,
    .comparison-item,
    .action-item {
      padding: 10px;
      margin-bottom: 6px;
    }
  }
  
  .panel-body {
    padding: 15px;
    max-height: calc(65vh - 70px);
  }
}
</style>