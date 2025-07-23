<template>
  <div class="about-view">
    <!-- iOS导航栏 -->
    <div class="navbar">
      <button class="navbar-btn back" @click="goBack">
        <ChevronLeft />
        <span>返回</span>
      </button>
      <div class="navbar-title">理解系统</div>
      <button v-show="hasChanges" class="navbar-btn save" @click="saveChanges">
        保存
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div class="content">
      <!-- 自定义Tooltip -->
      <div 
        v-if="showCustomTooltip" 
        class="custom-tooltip"
        :style="tooltipStyle"
        @mouseenter="tooltipHovered = true"
        @mouseleave="tooltipHovered = false"
      >
        <div class="tooltip-header">
          <div class="tooltip-title">{{ tooltipData.title }}</div>
          <button class="tooltip-close" @click="hideCustomTooltip">
            <X />
          </button>
        </div>
        <div class="tooltip-content">
          <div class="tooltip-section">
            <div class="section-title">相关人物 ({{ tooltipData.relationships.length }}人)</div>
            <div class="relationships-list">
              <div 
                v-for="(rel, index) in tooltipData.relationships" 
                :key="rel.id"
                class="relationship-item"
              >
                <div class="relationship-info">
                  <div class="relationship-name">{{ rel.name }}</div>
                  <div class="relationship-details">{{ rel.type }} · {{ rel.role }}</div>
                  <div v-if="rel.interests && rel.interests.length > 0" class="person-interests">
                    <div class="interests-label">兴趣爱好:</div>
                    <div class="interests-tags">
                      <span v-for="interest in rel.interests" :key="interest" class="interest-tag">
                        {{ interest }}
                      </span>
                    </div>
                  </div>
                  <div v-if="getCommonInterests(rel.id, tooltipData.identityId).length > 0" class="common-interests">
                    共同兴趣: {{ getCommonInterests(rel.id, tooltipData.identityId).join(', ') }}
                  </div>
                </div>
                <div class="relationship-strength">
                  <div class="strength-value" :class="getStrengthClass(rel.strength)">
                    {{ Math.round(rel.strength * 100) }}%
                  </div>
                  <div class="strength-label">交集度</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 身份图谱 -->
      <div class="card">
        <div class="card-header">
          <h2>身份图谱</h2>
          <span class="card-subtitle">立体身份图谱</span>
          <div class="toggle-controls">
            <button 
              class="toggle-btn" 
              :class="{ active: currentIdentityGraph === 'v1' }"
              @click="switchIdentityGraph('v1')"
            >
              力导向图
            </button>
            <button 
              class="toggle-btn" 
              :class="{ active: currentIdentityGraph === 'v2' }"
              @click="switchIdentityGraph('v2')"
            >
              圆形布局
            </button>

          </div>
        </div>
        
        <div class="identity-graph-content">
          <IdentityGraphCard 
            v-if="currentIdentityGraph === 'v1'"
          ></IdentityGraphCard>
          <IdentityGraphCardV2 
            v-if="currentIdentityGraph === 'v2'"
          ></IdentityGraphCardV2>

        </div>
      </div>
      
      <OrganDiagramCard></OrganDiagramCard>
      
      <!-- 个人数据中心 -->
      <div class="card">
        <div class="card-header">
          <h2>个人数据中心</h2>
          <span class="card-subtitle">整合的第三方数据视图</span>
        </div>
        
        <div class="data-dashboard">
          <div class="data-source-status">
            <div class="source-item" v-for="source in userData.dataSources" :key="source.id">
              <div class="source-icon" :class="source.status">
                <component :is="source.icon" />
              </div>
              <div class="source-info">
                <div class="source-name">{{ source.name }}</div>
                <div class="source-status">{{ source.lastSync }}</div>
              </div>
              <div class="source-actions">
                <button class="action-btn" @click="manageSource(source)">
                  <Settings />
                </button>
              </div>
            </div>
          </div>
          
          <div class="data-summary">
            <div class="summary-card financial">
              <div class="summary-header">
                <DollarSign />
                <span>财务快照</span>
              </div>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="label">总资产</span>
                  <span class="value">¥128,450</span>
                </div>
                <div class="summary-item">
                  <span class="label">本月支出</span>
                  <span class="value">¥8,230</span>
                </div>
              </div>
            </div>
            
            <div class="summary-card health">
              <div class="summary-header">
                <Activity />
                <span>健康数据</span>
              </div>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="label">今日步数</span>
                  <span class="value">8,456</span>
                </div>
                <div class="summary-item">
                  <span class="label">睡眠时长</span>
                  <span class="value">7.5h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 智能管家 -->
      <div class="card">
        <div class="card-header">
          <h2>智能管家</h2>
          <span class="card-subtitle">稳定可靠的生活管理</span>
        </div>
        
        <div class="life-management">
          <div class="management-module" v-for="module in userData.lifeModules" :key="module.id">
            <div class="module-header">
              <component :is="module.icon" />
              <span>{{ module.name }}</span>
              <div class="module-status" :class="module.status">
                {{ module.statusText }}
              </div>
            </div>
            <div class="module-content">
              <div class="module-summary">{{ module.summary }}</div>
              <div class="module-actions">
                <button class="action-btn" @click="openModule(module)">
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 能力地图 -->
      <div class="card">
        <div class="card-header">
          <h2>能力地图</h2>
          <span class="card-subtitle">AI能力边界与操作台</span>
        </div>
        
        <div class="capability-center">
          <div class="capability-tree">
            <div class="capability-category" v-for="category in userData.capabilities" :key="category.id">
              <div class="category-header">
                <component :is="category.icon" />
                <span>{{ category.name }}</span>
                <span class="capability-count">{{ category.skills.length }}</span>
              </div>
              <div class="capability-skills">
                <div class="skill-item" v-for="skill in category.skills" :key="skill.id">
                  <div class="skill-info">
                    <div class="skill-name">{{ skill.name }}</div>
                    <div class="skill-description">{{ skill.description }}</div>
                  </div>
                  <div class="skill-status" :class="skill.status">
                    {{ skill.statusText }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="operation-desk" v-if="currentOperation">
            <div class="desk-header">
              <Zap />
              <span>正在执行</span>
            </div>
            <div class="desk-content">
              <div class="operation-task">{{ currentOperation.task }}</div>
              <div class="operation-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: currentOperation.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ currentOperation.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  ChevronLeft, 
  Edit,
  Settings,
  DollarSign,
  Activity,
  Zap,
  Briefcase,
  User,
  Heart,
  Home,
  Camera,
  BookOpen,
  ShoppingCart,
  Calendar,
  FileText,
  Users,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Search,
  MessageCircle,
  PlusCircle,
  TrendingUp,
  Palette,
  Crown,
  Sword,
  X,
  Link,
  Type,
  RefreshCw
} from 'lucide-vue-next'
import IdentityGraphCard from '@/components/IdentityGraphCard.vue'
import IdentityGraphCardV2 from '@/components/IdentityGraphCardV2.vue'

import OrganDiagramCard from '@/components/OrganDiagramCard.vue'

import userProfileData from '@/data/userProfile.json'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart, TreeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册必须的组件
use([
  CanvasRenderer,
  GraphChart,
  TreeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export default {
  name: 'AboutView',
  components: {
    VChart,
    IdentityGraphCard,
    IdentityGraphCardV2,

    OrganDiagramCard,

    ChevronLeft,
    Edit,
    Settings,
    DollarSign,
    Activity,
    Zap,
    Briefcase,
    User,
    Heart,
    Home,
    Camera,
    BookOpen,
    ShoppingCart,
    Calendar,
    FileText,
    Users,
    Shield,
    CheckCircle,
    Clock,
    AlertCircle,
    Mail,
    Search,
    MessageCircle,
    PlusCircle,
    TrendingUp,
    Palette,
    Crown,
    Sword,
    X,
    Link,
    Type,
    RefreshCw
  },
  data() {
    return {
      hasChanges: false,
      userData: userProfileData,
      currentOperation: null,
      currentIdentityId: 'work', // 默认当前主导身份为工作身份
      showCustomTooltip: false,
      tooltipHovered: false,
      tooltipData: {
        title: '',
        relationships: []
      },
      tooltipStyle: {
        left: '0px',
        top: '0px'
      },
      currentIdentityGraph: 'v1', // 默认显示力导向图
      

    }
  },
  mounted() {
    // 移除原来的initIdentityGraph调用
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    switchIdentityGraph(version) {
      this.currentIdentityGraph = version
      console.log('切换到身份图谱版本:', version)
    },
    

    

    saveChanges() {
      console.log('保存理解系统配置')
      this.hasChanges = false
      alert('保存成功')
    },
    initIdentityGraph() {
      // 确保canvas元素存在
      const canvas = this.$refs.identityCanvas
      if (!canvas) {
        console.warn('Canvas element not found')
        return
      }
      
      // 模拟关系网数据
      const graphData = {
        nodes: [
          { id: 'user', name: '我', group: 'center', size: 20 },
          { id: 'work', name: '工作', group: 'work', size: 15 },
          { id: 'life', name: '生活', group: 'life', size: 15 },
          { id: 'hobby', name: '兴趣', group: 'hobby', size: 15 },
          { id: 'social', name: '社交', group: 'social', size: 15 },
          { id: 'colleague1', name: '同事A', group: 'work', size: 10 },
          { id: 'colleague2', name: '同事B', group: 'work', size: 10 },
          { id: 'spouse', name: '配偶', group: 'life', size: 12 },
          { id: 'child', name: '孩子', group: 'life', size: 10 },
          { id: 'friend1', name: '朋友A', group: 'social', size: 10 },
          { id: 'friend2', name: '朋友B', group: 'social', size: 10 },
          { id: 'camera', name: '摄影', group: 'hobby', size: 12 }
        ],
        links: [
          { source: 'user', target: 'work', strength: 0.8 },
          { source: 'user', target: 'life', strength: 0.9 },
          { source: 'user', target: 'hobby', strength: 0.6 },
          { source: 'user', target: 'social', strength: 0.7 },
          { source: 'work', target: 'colleague1', strength: 0.5 },
          { source: 'work', target: 'colleague2', strength: 0.5 },
          { source: 'life', target: 'spouse', strength: 0.9 },
          { source: 'life', target: 'child', strength: 0.8 },
          { source: 'social', target: 'friend1', strength: 0.6 },
          { source: 'social', target: 'friend2', strength: 0.6 },
          { source: 'hobby', target: 'camera', strength: 0.7 }
        ]
      }

      // 获取画布尺寸
      const width = canvas.offsetWidth || 300
      const height = canvas.offsetHeight || 200

      // 创建SVG元素
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', width)
      svg.setAttribute('height', height)
      svg.style.background = 'transparent'
      canvas.appendChild(svg)

      // 创建连接线
      const links = graphData.links.map(link => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('stroke', '#007AFF')
        line.setAttribute('stroke-width', link.strength * 2)
        line.setAttribute('opacity', 0.3)
        svg.appendChild(line)
        return { element: line, source: link.source, target: link.target }
      })

      // 创建节点
      const nodes = graphData.nodes.map(node => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('r', node.size)
        
        // 根据组设置颜色
        const colors = {
          center: '#007AFF',
          work: '#34C759',
          life: '#FF9500',
          hobby: '#AF52DE',
          social: '#FF2D55'
        }
        circle.setAttribute('fill', colors[node.group])
        circle.setAttribute('stroke', '#fff')
        circle.setAttribute('stroke-width', 2)
        
        // 设置初始位置
        const x = Math.random() * (width - 100) + 50
        const y = Math.random() * (height - 100) + 50
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
        
        svg.appendChild(circle)
        
        return { 
          element: circle, 
          x: x, 
          y: y, 
          vx: 0, 
          vy: 0,
          id: node.id,
          group: node.group
        }
      })

      // 简单的力导向布局模拟
      const simulation = () => {
        // 重力
        nodes.forEach(node => {
          const dx = width / 2 - node.x
          const dy = height / 2 - node.y
          node.vx += dx * 0.0001
          node.vy += dy * 0.0001
        })

        // 节点间斥力
        nodes.forEach((node, i) => {
          nodes.forEach((other, j) => {
            if (i !== j) {
              const dx = other.x - node.x
              const dy = other.y - node.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > 0) {
                const force = 1000 / (distance * distance)
                node.vx -= (dx / distance) * force
                node.vy -= (dy / distance) * force
              }
            }
          })
        })

        // 连接力
        links.forEach(link => {
          const source = nodes.find(n => n.id === link.source)
          const target = nodes.find(n => n.id === link.target)
          if (source && target) {
            const dx = target.x - source.x
            const dy = target.y - source.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 0) {
              const force = (distance - 100) * 0.001
              source.vx += (dx / distance) * force
              source.vy += (dy / distance) * force
              target.vx -= (dx / distance) * force
              target.vy -= (dy / distance) * force
            }
          }
        })

        // 更新位置
        nodes.forEach(node => {
          node.x += node.vx
          node.y += node.vy
          node.vx *= 0.9
          node.vy *= 0.9
          
          // 边界检查
          node.x = Math.max(node.size, Math.min(width - node.size, node.x))
          node.y = Math.max(node.size, Math.min(height - node.size, node.y))
          
          node.element.setAttribute('cx', node.x)
          node.element.setAttribute('cy', node.y)
        })

        // 更新连接线
        links.forEach(link => {
          const source = nodes.find(n => n.id === link.source)
          const target = nodes.find(n => n.id === link.target)
          if (source && target) {
            link.element.setAttribute('x1', source.x)
            link.element.setAttribute('y1', source.y)
            link.element.setAttribute('x2', target.x)
            link.element.setAttribute('y2', target.y)
          }
        })

        requestAnimationFrame(simulation)
      }

      simulation()
    },
    editIdentity(identity) {
      console.log('编辑身份', identity)
    },
    manageSource(source) {
      console.log('管理数据源', source)
    },
    openModule(module) {
      console.log('打开模块', module)
    },
    switchIdentity(identity) {
      this.currentIdentityId = identity.id
      console.log('切换到身份:', identity.name)
    },
    addCustomIdentity() {
      console.log('添加自定义身份')
    },
    manageRelationships() {
      console.log('管理关系网络')
    },
    viewAnalytics() {
      console.log('查看身份分析')
    },
    onGraphClick(params) {
      console.log('图表点击:', params)
      if (params.dataType === 'node') {
        const node = params.data
        if (node.id === 'work' || node.id === 'life' || node.id === 'social') {
          this.showIdentityDetails(node.id)
        }
      }
    },
    
    onGraphMouseOver(params) {
      if (params.dataType === 'node') {
        const node = params.data
        if (node.id === 'work' || node.id === 'life' || node.id === 'social') {
          this.showCustomTooltipForNode(node, params.event)
        }
      }
    },
    
    onGraphMouseOut(params) {
      // 延迟隐藏，给用户时间移动到tooltip
      setTimeout(() => {
        if (!this.tooltipHovered) {
          this.hideCustomTooltip()
        }
      }, 100)
    },
    
    showCustomTooltipForNode(node, event) {
      const identity = this.userData.identities.find(id => id.id === node.id)
      if (identity) {
        this.tooltipData = {
          title: node.name,
          relationships: identity.relationships,
          identityId: identity.id
        }
        
        // 计算tooltip位置
        const rect = event.target.getBoundingClientRect()
        const tooltipWidth = 320
        const tooltipHeight = Math.min(400, 100 + identity.relationships.length * 60)
        
        let left = rect.left + rect.width / 2 - tooltipWidth / 2
        let top = rect.top - tooltipHeight - 10
        
        // 确保tooltip不超出视窗
        if (left < 10) left = 10
        if (left + tooltipWidth > window.innerWidth - 10) {
          left = window.innerWidth - tooltipWidth - 10
        }
        if (top < 10) {
          top = rect.bottom + 10
        }
        
        this.tooltipStyle = {
          left: left + 'px',
          top: top + 'px'
        }
        
        this.showCustomTooltip = true
      }
    },
    
    hideCustomTooltip() {
      this.showCustomTooltip = false
      this.tooltipHovered = false
    },
    
    getStrengthClass(strength) {
      if (strength >= 0.8) return 'strength-high'
      if (strength >= 0.6) return 'strength-medium'
      if (strength >= 0.4) return 'strength-low'
      return 'strength-weak'
    },
    
    showIdentityDetails(identityId) {
      const identity = this.userData.identities.find(id => id.id === identityId)
      if (identity) {
        let details = `身份详情：${identity.name}\n\n`
        details += `角色：${identity.role}\n`
        details += `描述：${identity.description}\n`
        details += `上下文：${identity.context}\n\n`
        details += `相关人物：\n`
        
        identity.relationships.forEach(rel => {
          const strengthPercent = Math.round(rel.strength * 100)
          details += `• ${rel.name} (${rel.type}) - 交集度: ${strengthPercent}% - 角色: ${rel.role}\n`
        })
        
        alert(details)
      }
    },
    getGraphNodes() {
      return [
        // 核心身份节点
        {
          id: 'me',
          name: '用户',
          category: 0,
          value: 25,
          symbolSize: 30,
          itemStyle: { color: '#007AFF' }
        },
        // 工作身份节点
        {
          id: 'work',
          name: '工作身份',
          category: 1,
          value: 20,
          symbolSize: 22,
          itemStyle: { color: '#34C759' }
        },
        {
          id: 'colleague1',
          name: '张明',
          category: 1,
          value: 12,
          symbolSize: 14,
          itemStyle: { color: '#34C759' }
        },
        {
          id: 'colleague2',
          name: '李华',
          category: 1,
          value: 11,
          symbolSize: 13,
          itemStyle: { color: '#34C759' }
        },
        {
          id: 'boss',
          name: '王总',
          category: 1,
          value: 15,
          symbolSize: 16,
          itemStyle: { color: '#34C759' }
        },
        {
          id: 'mentor',
          name: '陈导师',
          category: 1,
          value: 14,
          symbolSize: 15,
          itemStyle: { color: '#34C759' }
        },
        {
          id: 'client1',
          name: '客户A',
          category: 1,
          value: 8,
          symbolSize: 10,
          itemStyle: { color: '#34C759' }
        },
        {
          id: 'client2',
          name: '客户B',
          category: 1,
          value: 7,
          symbolSize: 9,
          itemStyle: { color: '#34C759' }
        },
        // 生活身份节点
        {
          id: 'life',
          name: '生活身份',
          category: 2,
          value: 20,
          symbolSize: 22,
          itemStyle: { color: '#FF9500' }
        },
        {
          id: 'spouse',
          name: '妻子',
          category: 2,
          value: 18,
          symbolSize: 18,
          itemStyle: { color: '#FF9500' }
        },
        {
          id: 'child',
          name: '小明',
          category: 2,
          value: 15,
          symbolSize: 16,
          itemStyle: { color: '#FF9500' }
        },
        {
          id: 'parent',
          name: '父母',
          category: 2,
          value: 14,
          symbolSize: 15,
          itemStyle: { color: '#FF9500' }
        },
        {
          id: 'sibling',
          name: '兄弟姐妹',
          category: 2,
          value: 10,
          symbolSize: 12,
          itemStyle: { color: '#FF9500' }
        },
        {
          id: 'inlaw',
          name: '岳父母',
          category: 2,
          value: 9,
          symbolSize: 11,
          itemStyle: { color: '#FF9500' }
        },
        // 社交身份节点
        {
          id: 'social',
          name: '社交身份',
          category: 3,
          value: 18,
          symbolSize: 20,
          itemStyle: { color: '#AF52DE' }
        },
        {
          id: 'friend1',
          name: '老友A',
          category: 3,
          value: 13,
          symbolSize: 15,
          itemStyle: { color: '#AF52DE' }
        },
        {
          id: 'friend2',
          name: '老友B',
          category: 3,
          value: 12,
          symbolSize: 14,
          itemStyle: { color: '#AF52DE' }
        },
        {
          id: 'classmate',
          name: '同学',
          category: 3,
          value: 8,
          symbolSize: 10,
          itemStyle: { color: '#AF52DE' }
        },
        {
          id: 'neighbor',
          name: '邻居',
          category: 3,
          value: 6,
          symbolSize: 8,
          itemStyle: { color: '#AF52DE' }
        },
        {
          id: 'online_friend',
          name: '网友',
          category: 3,
          value: 5,
          symbolSize: 7,
          itemStyle: { color: '#AF52DE' }
        }
      ]
    },
    getGraphLinks() {
      const links = [
        // 核心身份连接
        { source: 'me', target: 'work', value: 0.9, lineStyle: { width: 3, color: '#007AFF' } },
        { source: 'me', target: 'life', value: 0.9, lineStyle: { width: 3, color: '#007AFF' } },
        { source: 'me', target: 'social', value: 0.8, lineStyle: { width: 2, color: '#007AFF' } },
        
        // 工作身份关系
        { source: 'work', target: 'colleague1', value: 0.7, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'colleague2', value: 0.6, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'boss', value: 0.8, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'mentor', value: 0.9, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'client1', value: 0.5, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'client2', value: 0.4, lineStyle: { color: '#34C759' } },
        
        // 生活身份关系
        { source: 'life', target: 'spouse', value: 0.9, lineStyle: { color: '#FF9500' } },
        { source: 'life', target: 'child', value: 0.8, lineStyle: { color: '#FF9500' } },
        { source: 'life', target: 'parent', value: 0.7, lineStyle: { color: '#FF9500' } },
        { source: 'life', target: 'sibling', value: 0.6, lineStyle: { color: '#FF9500' } },
        { source: 'life', target: 'inlaw', value: 0.5, lineStyle: { color: '#FF9500' } },
        
        // 社交身份关系
        { source: 'social', target: 'friend1', value: 0.8, lineStyle: { color: '#AF52DE' } },
        { source: 'social', target: 'friend2', value: 0.7, lineStyle: { color: '#AF52DE' } },
        { source: 'social', target: 'classmate', value: 0.5, lineStyle: { color: '#AF52DE' } },
        { source: 'social', target: 'neighbor', value: 0.4, lineStyle: { color: '#AF52DE' } },
        { source: 'social', target: 'online_friend', value: 0.3, lineStyle: { color: '#AF52DE' } }
      ]
      
      // 根据控制面板状态添加跨身份连接
      if (this.showCrossConnections) {
        links.push(
          // 跨身份关系 - 工作与社交
          { source: 'colleague1', target: 'friend1', value: 0.4, lineStyle: { color: '#34C759' } },
          { source: 'colleague2', target: 'friend2', value: 0.3, lineStyle: { color: '#34C759' } },
          
          // 跨身份关系 - 生活身份与社交
          { source: 'spouse', target: 'friend1', value: 0.5, lineStyle: { color: '#FF9500' } },
          { source: 'child', target: 'neighbor', value: 0.3, lineStyle: { color: '#FF9500' } },
          
          // 跨身份关系 - 工作与生活身份
          { source: 'boss', target: 'spouse', value: 0.2, lineStyle: { color: '#34C759' } },
          { source: 'mentor', target: 'parent', value: 0.3, lineStyle: { color: '#34C759' } }
        )
      }
      
      // 根据控制面板状态添加基于共同兴趣的连接
      if (this.showInterestConnections) {
        const interestLinks = this.getInterestBasedLinks()
        links.push(...interestLinks)
      }
      
      return links
    },
    
    getInterestBasedLinks() {
      const interestLinks = []
      const allPeople = []
      
      // 收集所有人物及其兴趣
      this.userData.identities.forEach(identity => {
        identity.relationships.forEach(person => {
          if (person.interests && person.interests.length > 0) {
            allPeople.push({
              id: person.id,
              name: person.name,
              identity: identity.id,
              interests: person.interests
            })
          }
        })
      })
      
      // 查找共同兴趣
      for (let i = 0; i < allPeople.length; i++) {
        for (let j = i + 1; j < allPeople.length; j++) {
          const person1 = allPeople[i]
          const person2 = allPeople[j]
          
          // 找到共同兴趣
          const commonInterests = person1.interests.filter(interest => 
            person2.interests.includes(interest)
          )
          
          if (commonInterests.length > 0) {
            // 计算基于共同兴趣的连接强度
            const strength = Math.min(0.6, commonInterests.length * 0.2)
            
            // 避免重复连接（如果已经有直接连接）
            const existingLink = this.findExistingLink(person1.id, person2.id)
            if (!existingLink) {
              interestLinks.push({
                source: person1.id,
                target: person2.id,
                value: strength,
                lineStyle: { 
                  width: 1,
                  type: 'dashed',
                  color: '#FF9500'
                },
                emphasis: {
                  lineStyle: {
                    width: 2,
                    color: '#FF9500'
                  }
                }
              })
            }
          }
        }
      }
      
      return interestLinks
    },
    
    findExistingLink(sourceId, targetId) {
      // 检查是否已经存在连接
      const existingLinks = [
        { source: 'colleague1', target: 'friend1' },
        { source: 'colleague2', target: 'friend2' },
        { source: 'spouse', target: 'friend1' },
        { source: 'child', target: 'neighbor' },
        { source: 'boss', target: 'spouse' },
        { source: 'mentor', target: 'parent' }
      ]
      
      return existingLinks.some(link => 
        (link.source === sourceId && link.target === targetId) ||
        (link.source === targetId && link.target === sourceId)
      )
    },
    
    getCommonInterests(personId, currentIdentityId) {
      const currentPerson = this.findPersonById(personId)
      if (!currentPerson || !currentPerson.interests) return []
      
      const commonInterests = []
      
      // 查找与其他身份中人物的共同兴趣
      this.userData.identities.forEach(identity => {
        if (identity.id !== currentIdentityId) {
          identity.relationships.forEach(otherPerson => {
            if (otherPerson.interests && otherPerson.id !== personId) {
              const shared = currentPerson.interests.filter(interest => 
                otherPerson.interests.includes(interest)
              )
              if (shared.length > 0) {
                commonInterests.push(...shared)
              }
            }
          })
        }
      })
      
      // 去重并返回
      return [...new Set(commonInterests)]
    },
    
    findPersonById(personId) {
      for (const identity of this.userData.identities) {
        const person = identity.relationships.find(rel => rel.id === personId)
        if (person) return person
      }
      return null
    },
    
    getInterestConnections(personId) {
      const currentPerson = this.findPersonById(personId)
      if (!currentPerson || !currentPerson.interests) return []
      
      const connections = []
      
      // 查找所有基于共同兴趣的连接
      this.userData.identities.forEach(identity => {
        identity.relationships.forEach(otherPerson => {
          if (otherPerson.id !== personId && otherPerson.interests) {
            const commonInterests = currentPerson.interests.filter(interest => 
              otherPerson.interests.includes(interest)
            )
            
            if (commonInterests.length > 0) {
              // 检查是否存在兴趣连接
              const strength = Math.min(0.6, commonInterests.length * 0.2)
              
              connections.push({
                targetId: otherPerson.id,
                targetName: otherPerson.name,
                targetType: otherPerson.type,
                targetRole: otherPerson.role,
                commonInterests: commonInterests,
                strength: strength
              })
            }
          }
        })
      })
      
      return connections
    },
    
    toggleInterestConnections() {
      this.showInterestConnections = !this.showInterestConnections
      this.updateGraphDisplay()
    },
    
    toggleCrossConnections() {
      this.showCrossConnections = !this.showCrossConnections
      this.updateGraphDisplay()
    },
    
    toggleLabels() {
      this.showLabels = !this.showLabels
      this.updateGraphDisplay()
    },
    
    resetLayout() {
      // 触发图表重新布局
      this.$nextTick(() => {
        const chart = this.$refs.identityChart
        if (chart) {
          chart.resize()
        }
      })
    },
    
    focusOnIdentity(identityId) {
      // 聚焦到特定身份
      console.log('聚焦到身份:', identityId)
      // 这里可以添加聚焦逻辑
    },
    
    updateGraphDisplay() {
      // 更新图表显示
      this.$nextTick(() => {
        const chart = this.$refs.identityChart
        if (chart) {
          chart.setOption(this.identityGraphOption)
        }
      })
    },
    

    

  }
}
</script>

<style scoped>
/* iOS风格设计 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.about-view {
  background-color: #f2f2f7;
  color: #000;
  line-height: 1.5;
  padding-top: 44px;
  padding-bottom: 80px;
  min-height: 100vh;
}

/* iOS导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  background-color: rgba(249, 249, 251, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
  justify-content: space-between;
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
}

.navbar-btn {
  background: none;
  border: none;
  font-size: 17px;
  color: #007AFF;
  z-index: 10;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar-btn.back {
  padding-right: 16px;
}

.navbar-btn.save {
  padding-left: 16px;
}

.navbar-btn svg {
  width: 16px;
  height: 16px;
}

/* 内容区域 */
.content {
  padding: 16px 0;
  animation: fadeIn 0.3s ease-out;
}

/* iOS卡片样式 */
.card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 16px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.card-header {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  position: relative;
}

.card-header h2 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
            padding-right: 200px;
}

.card-subtitle {
  font-size: 13px;
  color: #8E8E93;
}



/* 数据中心 */
.data-dashboard {
  padding: 16px;
}

.data-source-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.source-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.source-icon.connected {
  background: #34C759;
}

.source-icon.disconnected {
  background: #FF3B30;
}

.source-icon.pending {
  background: #FF9500;
}

.source-icon svg {
  width: 16px;
  height: 16px;
}

.source-info {
  flex: 1;
}

.source-name {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.source-status {
  font-size: 13px;
  color: #8E8E93;
}

.data-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-card {
  padding: 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.summary-card.financial {
  border-left: 4px solid #34C759;
}

.summary-card.health {
  border-left: 4px solid #007AFF;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 12px;
}

.summary-header svg {
  width: 16px;
  height: 16px;
  color: #007AFF;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  font-size: 13px;
  color: #8E8E93;
}

.summary-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

/* 智能管家 */
.life-management {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.management-module {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 4px solid #007AFF;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.module-header svg {
  width: 18px;
  height: 18px;
  color: #007AFF;
}

.module-header span {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  flex: 1;
}

.module-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.module-status.active {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

.module-status.pending {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

.module-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-summary {
  font-size: 13px;
  color: #666;
}

/* 能力地图 */
.capability-center {
  padding: 16px;
}

.capability-tree {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.capability-category {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 122, 255, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.category-header svg {
  width: 16px;
  height: 16px;
  color: #007AFF;
}

.category-header span {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  flex: 1;
}

.capability-count {
  background: #007AFF;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.capability-skills {
  padding: 8px 0;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.skill-item:last-child {
  border-bottom: none;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 2px;
}

.skill-description {
  font-size: 12px;
  color: #8E8E93;
}

.skill-status {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.skill-status.available {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

.skill-status.limited {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

.skill-status.unavailable {
  background: rgba(142, 142, 147, 0.1);
  color: #8E8E93;
}

.operation-desk {
  margin-top: 16px;
  padding: 16px;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.desk-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #007AFF;
  margin-bottom: 12px;
}

.desk-header svg {
  width: 16px;
  height: 16px;
}

.operation-task {
  font-size: 13px;
  color: #000;
  margin-bottom: 8px;
}

.operation-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007AFF;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #8E8E93;
  min-width: 30px;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 自定义Tooltip样式 */
.custom-tooltip {
  position: fixed;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #E5E5EA;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  max-width: 320px;
  max-height: 400px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #F2F2F7;
  background: #F9F9F9;
}

.tooltip-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D1D1F;
}

.tooltip-close {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  color: #8E8E93;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #FF3B30;
}

.tooltip-content {
  padding: 12px 16px;
  max-height: 300px;
  overflow-y: auto;
}

.tooltip-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.relationships-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relationship-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #F2F2F7;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.relationship-item:hover {
  background: #E5E5EA;
}

.relationship-info {
  flex: 1;
}

.relationship-name {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  margin-bottom: 2px;
}

.relationship-details {
  font-size: 12px;
  color: #666;
}

.relationship-strength {
  text-align: right;
  margin-left: 12px;
}

.strength-value {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.strength-label {
  font-size: 11px;
  color: #8E8E93;
}

.strength-high {
  color: #34C759;
}

.strength-medium {
  color: #FF9500;
}

.strength-low {
  color: #FF3B30;
}

.strength-weak {
  color: #8E8E93;
}

.common-interests {
  font-size: 11px;
  color: #FF9500;
  margin-top: 4px;
  font-style: italic;
}

.person-interests {
  margin-top: 6px;
}

.interests-label {
  font-size: 11px;
  color: #FF9500;
  font-weight: 600;
  margin-bottom: 4px;
}

.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.interest-tag {
  background: #FF9500;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  white-space: nowrap;
}

/* 图表控制面板 */
.graph-controls {
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.control-group {
  margin-bottom: 12px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.control-btn {
  background: none;
  border: 1px solid rgba(0, 122, 255, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  color: #007AFF;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007AFF;
}

.control-btn.active {
  background: #007AFF;
  color: white;
  border-color: #007AFF;
}

.control-btn svg {
  width: 14px;
  height: 14px;
}





.toggle-controls {
  display: flex;
  gap: 6px;
  position: absolute;
  top: 16px;
  right: 16px;
}

.toggle-btn {
  background: none;
  border: 1px solid rgba(0, 122, 255, 0.3);
  padding: 6px 12px;
  border-radius: 8px;
  color: #007AFF;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007AFF;
}

.toggle-btn.active {
  background: #007AFF;
  color: white;
  border-color: #007AFF;
}

.identity-graph-content {
  padding: 16px;
  height: 600px;
}


</style>
