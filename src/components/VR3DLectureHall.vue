<template>
  <div class="simple-vr" ref="vrContainer">
    <!-- 简洁的讲座厅：只有屏幕和座位 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Star, 
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Building,
  Lightbulb,
  Trophy
} from 'lucide-vue-next'

const vrContainer = ref(null)

// 场景变量
let scene, camera, renderer
let screenMesh, screenGroup
let directionalScreens = [] // 存储八个方向的屏幕
let seats = []
let animationId, clock
let mouseX = 0, mouseY = 0
let currentSlide = 0
let previousSlide = -1

// VR 相机控制变量
let cameraRotationY = 0
let targetRotationY = 0
let cameraRotationX = 0
let targetRotationX = 0
let isVRDragging = false
let lastMouseX = 0
let lastMouseY = 0

// 滑动控制变量
let touchStartX = 0
let touchStartY = 0
let isDragging = false

// 屏幕缩放控制变量
let screenScale = 1.0
let targetScreenScale = 1.0
const minScale = 0.3
const maxScale = 2.5

// 双指缩放变量
let initialPinchDistance = 0
let isPinching = false

// 点击交互变量
let raycaster, mouse

// 移除未使用的SVG图标函数，以避免纹理单元使用

// 屏幕内容数据 - 基于家庭、事业、社交的生活数据 - 增强价值版
const slides = [
  {
    title: "家庭生活",
    subtitle: "Life Balance Score: 8.7/10",
    iconPath: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    iconColor: "#F59E0B",
    insights: {
      score: 87,
      target: 90,
      priority: "HIGH",
      nextAction: "Plan weekend family trip"
    },
    metrics: [
      { 
        label: "Parent-Child Time", 
        value: "2.5h/day", 
        target: "3h",
        efficiency: 83,
        color: "#10B981", 
        trend: "+30min",
        impact: "High bonding quality",
        suggestion: "Add 30min bedtime stories"
      },
      { 
        label: "Family Meals", 
        value: "5x/week", 
        target: "6x",
        efficiency: 83,
        color: "#3B82F6", 
        trend: "+1",
        impact: "Better communication",
        suggestion: "Plan Sunday brunch"
      },
      { 
        label: "Task Balance", 
        value: "92%", 
        target: "95%",
        efficiency: 97,
        color: "#F59E0B", 
        trend: "+8%",
        impact: "Reduced stress",
        suggestion: "Automate bill payments"
      }
    ]
  },
  {
    title: "事业发展",
    subtitle: "Career Growth Index: 9.2/10",
    iconPath: "M22 12h-4l-3 9L9 3l-3 9H2",
    iconColor: "#3B82F6",
    insights: {
      score: 92,
      target: 95,
      priority: "MEDIUM",
      nextAction: "Apply for senior role"
    },
    metrics: [
      { 
        label: "Work Efficiency", 
        value: "87%", 
        target: "90%",
        efficiency: 97,
        color: "#10B981", 
        trend: "+12%",
        impact: "Earlier project delivery",
        suggestion: "Use time-blocking method"
      },
      { 
        label: "Projects Done", 
        value: "15", 
        target: "12",
        efficiency: 125,
        color: "#3B82F6", 
        trend: "+3",
        impact: "Exceeded targets",
        suggestion: "Delegate routine tasks"
      },
      { 
        label: "Skill Growth", 
        value: "4 new", 
        target: "3",
        efficiency: 133,
        color: "#F59E0B", 
        trend: "This month",
        impact: "Market value +15%",
        suggestion: "Pursue AI certification"
      }
    ]
  },
  {
    title: "社交网络",
    subtitle: "Social Health Score: 8.4/10",
    iconPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    iconColor: "#10B981",
    insights: {
      score: 84,
      target: 88,
      priority: "LOW",
      nextAction: "Organize networking event"
    },
    metrics: [
      { 
        label: "Friend Interaction", 
        value: "8x/week", 
        target: "10x",
        efficiency: 80,
        color: "#10B981", 
        trend: "+2",
        impact: "Stronger relationships",
        suggestion: "Weekly coffee meetups"
      },
      { 
        label: "Social Events", 
        value: "3/month", 
        target: "4",
        efficiency: 75,
        color: "#3B82F6", 
        trend: "Stable",
        impact: "Good social presence",
        suggestion: "Join hobby groups"
      },
      { 
        label: "Network Growth", 
        value: "6 new", 
        target: "4",
        efficiency: 150,
        color: "#F59E0B", 
        trend: "+150%",
        impact: "Expanded opportunities",
        suggestion: "Follow up connections"
      }
    ]
  }
]

// 创建八方向屏幕环境
const createMultipleScreens = () => {
  // 八个方向的屏幕配置（以相机为中心）
  const distance = 20 // 增加距离防止重叠
  const height = 8    // 屏幕高度
  const directions = [
    { name: 'FRONT', angle: 0, label: '前方' },           // 正前方
    { name: 'FRONT_RIGHT', angle: Math.PI/4, label: '右前方' },     // 右前方
    { name: 'RIGHT', angle: Math.PI/2, label: '右侧' },            // 正右方
    { name: 'BACK_RIGHT', angle: Math.PI*3/4, label: '右后方' },   // 右后方
    { name: 'BACK', angle: Math.PI, label: '后方' },             // 正后方
    { name: 'BACK_LEFT', angle: Math.PI*5/4, label: '左后方' },   // 左后方
    { name: 'LEFT', angle: Math.PI*3/2, label: '左侧' },          // 正左方
    { name: 'FRONT_LEFT', angle: Math.PI*7/4, label: '左前方' }   // 左前方
  ]
  
  directions.forEach((direction, index) => {
    const x = Math.sin(direction.angle) * distance
    const z = Math.cos(direction.angle) * distance
    
    const screenConfig = {
      position: [x, height, z],
      rotation: [0, direction.angle + Math.PI, 0], // 面向中心
      scale: 1.3, // 增加基础尺寸提高可见性
      id: direction.name,
      label: direction.label,
      angle: direction.angle,
      index: index
    }
    
    createDirectionalScreen(screenConfig, index)
  })
}

// 创建方向性屏幕
const createDirectionalScreen = (config, index) => {
  // 创建canvas纹理
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  const ctx = canvas.getContext('2d')
  
  // 绘制屏幕内容
  const drawDirectionalContent = () => {
    // 黑色背景
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 绘制方向性内容
    drawDirectionalScreenContent(ctx, config)
  }
  
  // 创建屏幕几何体和材质 - 增大尺寸提高可见性
  const screenGeometry = new THREE.PlaneGeometry(20, 11.25)
  const texture = new THREE.CanvasTexture(canvas)
  texture.flipY = true
  
  const screenMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: false,
    emissive: 0x444444, // 增强自发光提高可见性
    emissiveIntensity: 0.5
  })
  
  // 创建屏幕组合
  const directionalScreenGroup = new THREE.Group()
  directionalScreenGroup.position.set(...config.position)
  directionalScreenGroup.rotation.set(...config.rotation)
  directionalScreenGroup.scale.setScalar(config.scale)
  scene.add(directionalScreenGroup)
  
  // 屏幕网格
  const directionalScreenMesh = new THREE.Mesh(screenGeometry, screenMaterial)
  directionalScreenGroup.add(directionalScreenMesh)
  
  // 创建边框
  createScreenFrameForAdditional(directionalScreenGroup)
  
  // 存储绘制函数和配置
  directionalScreenMesh.userData = {
    drawScreenContent: drawDirectionalContent,
    texture: texture,
    config: config
  }
  
  // 初始绘制
  drawDirectionalContent()
  
  // 存储到方向屏幕数组
  directionalScreens.push({
    group: directionalScreenGroup,
    mesh: directionalScreenMesh,
    config: config,
    baseScale: config.scale,
    currentScale: config.scale
  })
}

// 获取屏幕内容类型
const getScreenContentType = (screenId) => {
  if (screenId.includes('left')) return 'family_details'
  if (screenId.includes('right')) return 'career_details'
  if (screenId.includes('back')) return 'social_details'
  if (screenId.includes('top')) return 'overview'
  if (screenId.includes('ground')) return 'realtime'
  return 'summary'
}

// 根据类型绘制内容
const drawScreenContentByType = (ctx, contentType, screenId) => {
  const centerX = ctx.canvas.width / 2
  const centerY = ctx.canvas.height / 2
  
  // 标题
  ctx.fillStyle = '#00ff88'
  ctx.font = 'bold 60px SF Mono, Consolas, Monaco, monospace'
  ctx.textAlign = 'center'
  
  switch (contentType) {
    case 'family_details':
      ctx.fillText('FAMILY ANALYTICS', centerX, 200)
      drawFamilyDetails(ctx)
      break
    case 'career_details':
      ctx.fillText('CAREER METRICS', centerX, 200)
      drawCareerDetails(ctx)
      break
    case 'social_details':
      ctx.fillText('SOCIAL INSIGHTS', centerX, 200)
      drawSocialDetails(ctx)
      break
    case 'overview':
      ctx.fillText('LIFE OVERVIEW', centerX, 200)
      drawLifeOverview(ctx)
      break
    case 'realtime':
      ctx.fillText('LIVE MONITORING', centerX, 200)
      drawRealtimeData(ctx)
      break
    default:
      ctx.fillText('DATA DISPLAY', centerX, 200)
      drawSummaryData(ctx, screenId)
      break
  }
}

// 绘制家庭详情
const drawFamilyDetails = (ctx) => {
  const details = [
    'Quality Time: 2.5h daily',
    'Happiness Index: 8.7/10',
    'Family Events: 12 this month',
    'Home Projects: 3 completed'
  ]
  
  details.forEach((detail, index) => {
    ctx.fillStyle = '#ffffff'
    ctx.font = '36px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(detail, ctx.canvas.width / 2, 350 + index * 80)
  })
}

// 绘制事业详情
const drawCareerDetails = (ctx) => {
  const details = [
    'Projects Delivered: 15',
    'Skills Acquired: 4 new',
    'Performance: 94%',
    'Team Impact: +25%'
  ]
  
  details.forEach((detail, index) => {
    ctx.fillStyle = '#ffffff'
    ctx.font = '36px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(detail, ctx.canvas.width / 2, 350 + index * 80)
  })
}

// 绘制社交详情
const drawSocialDetails = (ctx) => {
  const details = [
    'Active Connections: 127',
    'New Friends: 6 this month',
    'Social Events: 3 attended',
    'Network Growth: +18%'
  ]
  
  details.forEach((detail, index) => {
    ctx.fillStyle = '#ffffff'
    ctx.font = '36px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(detail, ctx.canvas.width / 2, 350 + index * 80)
  })
}

// 绘制生活概览
const drawLifeOverview = (ctx) => {
  const overview = [
    'Overall Score: 8.8/10',
    'Life Balance: OPTIMAL',
    'Growth Trend: +15%',
    'Next Goal: Family Trip'
  ]
  
  overview.forEach((item, index) => {
    ctx.fillStyle = '#00ff88'
    ctx.font = '36px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(item, ctx.canvas.width / 2, 350 + index * 80)
  })
}

// 绘制实时数据
const drawRealtimeData = (ctx) => {
  const now = new Date()
  const time = now.toLocaleTimeString('zh-CN', { hour12: false })
  
  ctx.fillStyle = '#ff6666'
  ctx.font = '48px SF Mono, Consolas, Monaco, monospace'
  ctx.fillText(time, ctx.canvas.width / 2, 350)
  
  const stats = [
    'CPU: 23%',
    'Memory: 67%',
    'Network: 12KB/s'
  ]
  
  stats.forEach((stat, index) => {
    ctx.fillStyle = '#ffffff'
    ctx.font = '32px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(stat, ctx.canvas.width / 2, 450 + index * 60)
  })
}

// 绘制摘要数据
const drawSummaryData = (ctx, screenId) => {
  const summaries = [
    `Screen ID: ${screenId.toUpperCase()}`,
    'Status: ACTIVE',
    'Data: SYNCHRONIZED',
    'Mode: DISPLAY'
  ]
  
  summaries.forEach((summary, index) => {
    ctx.fillStyle = '#888888'
    ctx.font = '32px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(summary, ctx.canvas.width / 2, 350 + index * 80)
  })
}

// 绘制方向性屏幕内容
const drawDirectionalScreenContent = (ctx, config) => {
  const centerX = ctx.canvas.width / 2
  const centerY = ctx.canvas.height / 2
  
  // 标题 - 显示方向
  ctx.fillStyle = '#00ff88'
  ctx.font = 'bold 64px SF Mono, Consolas, Monaco, monospace'
  ctx.textAlign = 'center'
  ctx.fillText(config.label, centerX, 200)
  
  // 方向标识
  ctx.fillStyle = '#666666'
  ctx.font = '32px SF Mono, Consolas, Monaco, monospace'
  ctx.fillText(`DIRECTION: ${config.id}`, centerX, 260)
  
  // 根据方向显示不同的数据
  const contentData = getDirectionalContent(config.id, config.index)
  
  contentData.forEach((item, index) => {
    ctx.fillStyle = item.color || '#ffffff'
    ctx.font = '36px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(item.text, centerX, 350 + index * 70)
  })
  
  // 显示角度信息
  ctx.fillStyle = '#444444'
  ctx.font = '24px SF Mono, Consolas, Monaco, monospace'
  ctx.fillText(`ANGLE: ${Math.round(config.angle * 180 / Math.PI)}°`, centerX, centerY + 200)
  
  // 实时时间
  const now = new Date()
  const time = now.toLocaleTimeString('zh-CN', { hour12: false })
  ctx.fillStyle = '#0088ff'
  ctx.font = '28px SF Mono, Consolas, Monaco, monospace'
  ctx.fillText(time, centerX, centerY + 250)
}

// 获取方向性内容
const getDirectionalContent = (directionId, index) => {
  const baseContent = [
    { text: `Screen Index: ${index + 1}/8`, color: '#ffffff' },
    { text: `Status: ACTIVE`, color: '#00ff88' },
    { text: `Mode: DIRECTIONAL`, color: '#0088ff' },
  ]
  
  // 根据方向添加特定内容
  switch (directionId) {
    case 'FRONT':
      return [
        ...baseContent,
        { text: 'Primary Display Zone', color: '#ffaa00' },
        { text: 'Focus Area: HIGH', color: '#00ff88' }
      ]
    case 'BACK':
      return [
        ...baseContent,
        { text: 'Background Monitoring', color: '#ffaa00' },
        { text: 'Activity: PASSIVE', color: '#888888' }
      ]
    case 'LEFT':
      return [
        ...baseContent,
        { text: 'Navigation Panel', color: '#ffaa00' },
        { text: 'Controls: AVAILABLE', color: '#00ff88' }
      ]
    case 'RIGHT':
      return [
        ...baseContent,
        { text: 'Data Analytics', color: '#ffaa00' },
        { text: 'Insights: UPDATING', color: '#0088ff' }
      ]
    default:
      return [
        ...baseContent,
        { text: 'Multi-angle View', color: '#ffaa00' },
        { text: 'Coverage: 360°', color: '#ff6666' }
      ]
  }
}

// 创建简洁地板 - 可单独控制每个区域
const createSciFiFloor = () => {
  // 创建八个方向的地板区域，每个都可单独控制
  createDirectionalFloorSections()
  
  // 中心区域
  createCenterFloorSection()
}

// 创建八个方向的地板区域
const createDirectionalFloorSections = () => {
  const floorSections = []
  
  // 八个方向的地板扇形区域
  for (let i = 0; i < 8; i++) {
    const startAngle = (i * Math.PI) / 4 - Math.PI / 8
    const endAngle = ((i + 1) * Math.PI) / 4 - Math.PI / 8
    
    // 创建扇形地板
    const sectionGeometry = createSectorGeometry(12, 25, startAngle, endAngle)
    const sectionMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.6,
      emissive: 0x002244,
      emissiveIntensity: 0.2
    })
    
    const floorSection = new THREE.Mesh(sectionGeometry, sectionMaterial)
    floorSection.rotation.x = -Math.PI / 2
    floorSection.position.y = -1.6
    floorSection.userData = { 
      sectionId: i, 
      direction: ['FRONT', 'FRONT_RIGHT', 'RIGHT', 'BACK_RIGHT', 'BACK', 'BACK_LEFT', 'LEFT', 'FRONT_LEFT'][i]
    }
    
    scene.add(floorSection)
    floorSections.push(floorSection)
  }
  
  // 存储地板区域以便单独控制
  scene.userData.floorSections = floorSections
}

// 创建中心地板区域
const createCenterFloorSection = () => {
  const centerGeometry = new THREE.CircleGeometry(12, 32)
  const centerMaterial = new THREE.MeshLambertMaterial({
    color: 0x0f1419,
    transparent: true,
    opacity: 0.8,
    emissive: 0x003366,
    emissiveIntensity: 0.3
  })
  
  const centerFloor = new THREE.Mesh(centerGeometry, centerMaterial)
  centerFloor.rotation.x = -Math.PI / 2
  centerFloor.position.y = -1.55
  centerFloor.userData = { sectionId: 'center' }
  
  scene.add(centerFloor)
  scene.userData.centerFloor = centerFloor
}

// 创建扇形几何体的辅助函数
const createSectorGeometry = (innerRadius, outerRadius, startAngle, endAngle) => {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 16, 1, startAngle, endAngle - startAngle)
  return geometry
}

// 控制特定地板区域的函数
const controlFloorSection = (sectionId, properties) => {
  if (sectionId === 'center' && scene.userData.centerFloor) {
    const floor = scene.userData.centerFloor
    updateFloorProperties(floor, properties)
  } else if (scene.userData.floorSections && scene.userData.floorSections[sectionId]) {
    const floor = scene.userData.floorSections[sectionId]
    updateFloorProperties(floor, properties)
  }
}

// 更新地板属性的辅助函数
const updateFloorProperties = (floor, properties) => {
  if (properties.color) floor.material.color.setHex(properties.color)
  if (properties.emissive) floor.material.emissive.setHex(properties.emissive)
  if (properties.emissiveIntensity !== undefined) floor.material.emissiveIntensity = properties.emissiveIntensity
  if (properties.opacity !== undefined) floor.material.opacity = properties.opacity
}

// 更新地板区域高亮 - 与屏幕方向联动
const updateFloorSectionHighlight = (currentScreen) => {
  if (!scene.userData.floorSections) return
  
  scene.userData.floorSections.forEach((floorSection, index) => {
    const isCurrentDirection = currentScreen && currentScreen.config.index === index
    
    if (isCurrentDirection) {
      // 当前方向地板高亮
      controlFloorSection(index, {
        color: 0x2a3f5f,
        emissive: 0x004499,
        emissiveIntensity: 0.4,
        opacity: 0.9
      })
    } else {
      // 其他方向地板恢复默认
      controlFloorSection(index, {
        color: 0x1a1a2e,
        emissive: 0x002244,
        emissiveIntensity: 0.2,
        opacity: 0.6
      })
    }
  })
  
  // 中心区域根据是否有活跃屏幕调整
  const centerIntensity = currentScreen ? 0.5 : 0.3
  controlFloorSection('center', {
    emissiveIntensity: centerIntensity
  })
}

// 创建演讲台装饰元素
const createLectureStageDecorations = () => {
  // 演讲台基座
  const podiumGeometry = new THREE.CylinderGeometry(1.5, 2, 0.3, 16)
  const podiumMaterial = new THREE.MeshLambertMaterial({
    color: 0x2c3e50,
    transparent: true,
    opacity: 0.8
  })
  const podium = new THREE.Mesh(podiumGeometry, podiumMaterial)
  podium.position.set(0, -1.35, -6)
  scene.add(podium)
  
  // 演讲台发光边缘
  const podiumEdgeGeometry = new THREE.RingGeometry(1.8, 2.2, 32)
  const podiumEdgeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowColor: { value: new THREE.Color(0xffd700) }
    },
    vertexShader: `
      uniform float time;
      varying float vOpacity;
      
      void main() {
        vOpacity = sin(time * 0.003 + position.x * 0.5) * 0.3 + 0.7;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float vOpacity;
      
      void main() {
        gl_FragColor = vec4(glowColor, vOpacity * 0.8);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  
  const podiumEdge = new THREE.Mesh(podiumEdgeGeometry, podiumEdgeMaterial)
  podiumEdge.rotation.x = -Math.PI / 2
  podiumEdge.position.y = -1.2
  podiumEdge.position.z = -6
  scene.add(podiumEdge)
  
  // 座椅区域指示线
  const createSeatRowMarkers = () => {
    for (let row = 0; row < 8; row++) {
      const z = 8 + row * 4
      const rowWidth = 30 - row * 2 // 梯形排列
      
      // 左右两条座椅行标线
      for (let side = -1; side <= 1; side += 2) {
        const markerGeometry = new THREE.PlaneGeometry(0.1, rowWidth)
        const markerMaterial = new THREE.MeshLambertMaterial({
          color: 0x4a5568,
          transparent: true,
          opacity: 0.6
        })
        const marker = new THREE.Mesh(markerGeometry, markerMaterial)
        marker.rotation.x = -Math.PI / 2
        marker.position.set(side * (rowWidth / 2 + 1), -1.45, z)
        scene.add(marker)
      }
    }
  }
  
  createSeatRowMarkers()
  
  // 中央走道标线
  const aisleGeometry = new THREE.PlaneGeometry(2, 35)
  const aisleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowColor: { value: new THREE.Color(0x3182ce) }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vGlow;
      
      void main() {
        vUv = uv;
        vGlow = sin(time * 0.002 + uv.y * 10.0) * 0.2 + 0.8;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec2 vUv;
      varying float vGlow;
      
      void main() {
        float centerLine = 1.0 - smoothstep(0.45, 0.55, vUv.x);
        float intensity = centerLine * vGlow;
        gl_FragColor = vec4(glowColor, intensity * 0.5);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  
  const aisle = new THREE.Mesh(aisleGeometry, aisleMaterial)
  aisle.rotation.x = -Math.PI / 2
  aisle.position.set(0, -1.4, 15)
  scene.add(aisle)
  
  // 存储装饰元素以便动画更新
  scene.userData.lectureDecorations = {
    podiumEdge: { mesh: podiumEdge, material: podiumEdgeMaterial },
    aisle: { mesh: aisle, material: aisleMaterial }
  }
}

// 初始化场景
const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)  // 纯黑色背景
  
  // VR相机设置 - 更宽的视野角度，模拟真实VR头盔
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 3, 4) // 降低相机高度，后移一点，更像观众席视角
  
  // 渲染器设置 - 优化VR渲染
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // 禁用阴影系统以避免纹理单元限制
  renderer.shadowMap.enabled = false
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  vrContainer.value.appendChild(renderer.domElement)
  
  // 创建科幻地板（移除粒子效果）
  createSciFiFloor()
  
  // 所有装饰效果已移除以简化场景

  // 初始化射线检测器
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  clock = new THREE.Clock()
}

// 创建3D屏幕
const createScreen = () => {
  // 创建Canvas纹理来显示内容
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  const ctx = canvas.getContext('2d')
  
  // 极简极客风格绘制屏幕内容
  const drawScreenContent = () => {
    // 纯黑背景 - 极简主义
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 获取当前幻灯片数据
    const slide = slides[currentSlide] || slides[0]
    
    // 实用功能元素绘制函数
    const drawFunctionalElements = (slide) => {
      // 顶部状态栏 - 显示实用信息
      drawStatusBar()
      
      // 左侧导航指示器
      drawNavigationDots()
      
      // 右侧快捷操作区
      drawQuickActions()
      
      // 底部数据时间线
      drawDataTimeline()
      
      // 实时数据流
      drawDataStream()
    }
    
    // 状态栏功能实现
    const drawStatusBar = () => {
      const now = new Date()
      const time = now.toLocaleTimeString('zh-CN', { hour12: false })
      const date = now.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      
      // 时间显示
      ctx.fillStyle = '#00ff88'
      ctx.font = '32px SF Mono, Consolas, Monaco, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(time, canvas.width - 40, 60)
      
      // 日期显示
      ctx.fillStyle = '#666666'
      ctx.font = '24px SF Mono, Consolas, Monaco, monospace'
      ctx.fillText(date, canvas.width - 40, 90)
      
      // 系统指示器
      ctx.fillStyle = '#00ff88'
      ctx.font = '20px SF Mono, Consolas, Monaco, monospace'
      ctx.textAlign = 'left'
      ctx.fillText('● LIVE', 40, 60)
      
      // 数据源指示
      ctx.fillStyle = '#666666'
      ctx.fillText('Personal Analytics', 40, 90)
    }
    
    // 导航点功能实现
    const drawNavigationDots = () => {
      const dotSize = 8
      const spacing = 24
      const startY = 200
      
      for (let i = 0; i < slides.length; i++) {
        ctx.beginPath()
        ctx.arc(30, startY + i * spacing, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = i === currentSlide ? '#00ff88' : '#333333'
        ctx.fill()
        
        // 当前页标识
        if (i === currentSlide) {
          ctx.strokeStyle = '#00ff88'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(30, startY + i * spacing, dotSize + 4, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
    
    // 快捷操作区功能实现
    const drawQuickActions = () => {
      const actions = ['EXPORT', 'SHARE', 'SYNC']
      const startX = canvas.width - 150
      const startY = 200
      
      actions.forEach((action, index) => {
        const y = startY + index * 40
        
        // 操作按钮背景
        ctx.strokeStyle = '#333333'
        ctx.lineWidth = 1
        ctx.strokeRect(startX, y - 15, 120, 25)
        
        // 操作文字
        ctx.fillStyle = '#888888'
        ctx.font = '16px SF Mono, Consolas, Monaco, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(action, startX + 60, y)
      })
    }
    
    // 数据时间线功能实现
    const drawDataTimeline = () => {
      const timelineY = canvas.height - 100
      const timelineWidth = canvas.width - 160
      const timelineX = 80
      
      // 时间线轴
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(timelineX, timelineY)
      ctx.lineTo(timelineX + timelineWidth, timelineY)
      ctx.stroke()
      
      // 时间标记
      const timeLabels = ['6M', '3M', '1M', '1W', 'NOW']
      timeLabels.forEach((label, index) => {
        const x = timelineX + (index * timelineWidth) / (timeLabels.length - 1)
        
        // 时间点
        ctx.beginPath()
        ctx.arc(x, timelineY, 4, 0, Math.PI * 2)
        ctx.fillStyle = index === timeLabels.length - 1 ? '#00ff88' : '#666666'
        ctx.fill()
        
        // 时间标签
        ctx.fillStyle = '#666666'
        ctx.font = '18px SF Mono, Consolas, Monaco, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(label, x, timelineY + 25)
      })
    }
    
    // 实时数据流功能实现 - 增强版
    const drawDataStream = () => {
      const streamX = canvas.width - 220
      const streamY = 400
      const streamWidth = 170
      
      // 数据流标题
      ctx.fillStyle = '#666666'
      ctx.font = '18px SF Mono, Consolas, Monaco, monospace'
      ctx.textAlign = 'left'
      ctx.fillText('ANALYTICS LIVE', streamX, streamY)
      
      // 生活质量指标实时数据
      const currentSlideIndex = currentSlide
      let dataPoints = []
      
      if (currentSlideIndex === 0) { // 家庭生活
        dataPoints = [
          { label: 'HAPPINESS', value: '8.7', color: '#00ff88', unit: '/10' },
          { label: 'STRESS', value: '3.2', color: '#ffaa00', unit: '/10' },
          { label: 'BALANCE', value: '87%', color: '#00aaff', unit: '' },
          { label: 'GROWTH', value: '+12%', color: '#00ff88', unit: '' }
        ]
      } else if (currentSlideIndex === 1) { // 事业发展
        dataPoints = [
          { label: 'PRODUCTIVITY', value: '94%', color: '#00ff88', unit: '' },
          { label: 'LEARNING', value: '8.9', color: '#00aaff', unit: '/10' },
          { label: 'INNOVATION', value: '76%', color: '#ffaa00', unit: '' },
          { label: 'IMPACT', value: '+25%', color: '#00ff88', unit: '' }
        ]
      } else { // 社交网络
        dataPoints = [
          { label: 'CONNECTION', value: '8.4', color: '#00ff88', unit: '/10' },
          { label: 'INFLUENCE', value: '67%', color: '#ffaa00', unit: '' },
          { label: 'SUPPORT', value: '9.1', color: '#00aaff', unit: '/10' },
          { label: 'NETWORK', value: '+18%', color: '#00ff88', unit: '' }
        ]
      }
      
      dataPoints.forEach((point, index) => {
        const y = streamY + 40 + index * 35
        
        ctx.fillStyle = '#666666'
        ctx.font = '14px SF Mono, Consolas, Monaco, monospace'
        ctx.textAlign = 'left'
        ctx.fillText(point.label, streamX, y - 10)
        
        ctx.fillStyle = point.color
        ctx.font = 'bold 20px SF Mono, Consolas, Monaco, monospace'
        ctx.textAlign = 'right'
        ctx.fillText(point.value + point.unit, streamX + streamWidth, y)
        
        // 小型趋势指示器
        ctx.fillStyle = point.color + '40'
        ctx.fillRect(streamX, y + 5, streamWidth, 2)
        
        // 实时波动效果
        const fluctuation = Math.sin(Date.now() * 0.001 + index) * 0.1 + 0.9
        ctx.fillStyle = point.color
        ctx.fillRect(streamX, y + 5, streamWidth * fluctuation, 2)
      })
      
      // 数据更新时间戳
      ctx.fillStyle = '#444444'
      ctx.font = '12px SF Mono, Consolas, Monaco, monospace'
      ctx.textAlign = 'left'
      const now = new Date()
      const timestamp = now.toLocaleTimeString('zh-CN', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
      ctx.fillText(`UPDATED: ${timestamp}`, streamX, streamY + 200)
    }
    
    drawFunctionalElements(slide)
    
    // 极简风格绘制函数
    const drawRoundedCard = (x, y, width, height, radius, fillStyle, strokeStyle = null, strokeWidth = 0) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      
      if (fillStyle) {
        ctx.fillStyle = fillStyle
        ctx.fill()
      }
      
      if (strokeStyle && strokeWidth > 0) {
        ctx.strokeStyle = strokeStyle
        ctx.lineWidth = strokeWidth
        ctx.stroke()
      }
    }
    
    // 极简主内容区 - 去除多余装饰
    const contentX = 300
    const contentY = 200
    const contentWidth = canvas.width - 600
    
    // 标题区域 - 简洁展示
    ctx.fillStyle = '#ffffff'
    ctx.font = '48px SF Mono, Consolas, Monaco, monospace'
    ctx.textAlign = 'left'
    ctx.fillText(slide.title.toUpperCase(), contentX, contentY)
    
    // 分隔线
    ctx.strokeStyle = slide.iconColor
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(contentX, contentY + 20)
    ctx.lineTo(contentX + 200, contentY + 20)
    ctx.stroke()
    
    // 副标题与评分
    ctx.fillStyle = slide.insights.score >= 90 ? '#00ff88' : 
                   slide.insights.score >= 80 ? '#ffaa00' : '#ff6666'
    ctx.font = '24px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(slide.subtitle, contentX, contentY + 60)
    
    // 优先级标识
    const priorityColor = slide.insights.priority === 'HIGH' ? '#ff4444' :
                         slide.insights.priority === 'MEDIUM' ? '#ffaa00' : '#00ff88'
    ctx.fillStyle = priorityColor
    ctx.font = '18px SF Mono, Consolas, Monaco, monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`PRIORITY: ${slide.insights.priority}`, contentX + contentWidth, contentY + 60)
    ctx.textAlign = 'left'
    
    // 下一个行动项
    ctx.fillStyle = '#666666'
    ctx.font = '20px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText('NEXT ACTION:', contentX, contentY + 100)
    
    ctx.fillStyle = '#00ff88'
    ctx.font = '20px SF Mono, Consolas, Monaco, monospace'
    ctx.fillText(slide.insights.nextAction.toUpperCase(), contentX + 150, contentY + 100)
    
    // 增强指标显示 - 更有价值的信息
    const metricsStartY = contentY + 150
    const rowHeight = 80
    
    slide.metrics.forEach((metric, index) => {
      const y = metricsStartY + index * rowHeight
      
      // 指标标签
      ctx.fillStyle = '#cccccc'
      ctx.font = '20px SF Mono, Consolas, Monaco, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(metric.label.toUpperCase(), contentX, y - 20)
      
      // 当前值 vs 目标值
      ctx.fillStyle = metric.color
      ctx.font = 'bold 32px SF Mono, Consolas, Monaco, monospace'
      ctx.fillText(metric.value, contentX, y)
      
      ctx.fillStyle = '#666666'
      ctx.font = '20px SF Mono, Consolas, Monaco, monospace'
      ctx.fillText(`/ ${metric.target}`, contentX + 120, y)
      
      // 效率评分
      const efficiencyColor = metric.efficiency >= 100 ? '#00ff88' :
                             metric.efficiency >= 80 ? '#ffaa00' : '#ff6666'
      ctx.fillStyle = efficiencyColor
      ctx.font = '20px SF Mono, Consolas, Monaco, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`EFF: ${metric.efficiency}%`, contentX + 350, y - 20)
      
      // 趋势
      const trendColor = metric.trend.includes('+') ? '#00ff88' : 
                        metric.trend.includes('-') ? '#ff4444' : '#888888'
      ctx.fillStyle = trendColor
      ctx.fillText(metric.trend, contentX + 350, y)
      
      // 影响分析
      ctx.fillStyle = '#888888'
      ctx.font = '16px SF Mono, Consolas, Monaco, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`IMPACT: ${metric.impact}`, contentX, y + 20)
      
      // 建议
      ctx.fillStyle = '#00ff88'
      ctx.font = '16px SF Mono, Consolas, Monaco, monospace'
      ctx.fillText(`→ ${metric.suggestion}`, contentX, y + 40)
      
      // 进度条 - 目标达成度
      const targetProgress = metric.efficiency
      const barX = contentX + 400
      const barY = y - 10
      const barWidth = 200
      const barHeight = 6
      
      // 进度条背景
      ctx.fillStyle = '#333333'
      ctx.fillRect(barX, barY, barWidth, barHeight)
      
      // 进度条填充
      ctx.fillStyle = efficiencyColor
      ctx.fillRect(barX, barY, (barWidth * Math.min(targetProgress, 150)) / 150, barHeight)
      
      // 目标线
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(barX + (barWidth * 100) / 150, barY - 2)
      ctx.lineTo(barX + (barWidth * 100) / 150, barY + barHeight + 2)
      ctx.stroke()
      
      // 分隔线
      if (index < slide.metrics.length - 1) {
        ctx.strokeStyle = '#333333'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(contentX, y + 55)
        ctx.lineTo(contentX + contentWidth, y + 55)
        ctx.stroke()
        ctx.setLineDash([])
      }
    })
    
    // 底部增强功能状态栏
    const bottomY = canvas.height - 150
    
    // 总体评分
    ctx.fillStyle = '#666666'
    ctx.font = '18px SF Mono, Consolas, Monaco, monospace'
    ctx.textAlign = 'left'
    ctx.fillText('OVERALL SCORE:', contentX, bottomY - 30)
    
    const overallColor = slide.insights.score >= 90 ? '#00ff88' :
                        slide.insights.score >= 80 ? '#ffaa00' : '#ff6666'
    ctx.fillStyle = overallColor
    ctx.fillText(`${slide.insights.score}/100`, contentX + 160, bottomY - 30)
    
    // 目标进度
    ctx.fillStyle = '#666666'
    ctx.fillText('TARGET PROGRESS:', contentX + 280, bottomY - 30)
    
    const targetProgress = Math.round((slide.insights.score / slide.insights.target) * 100)
    ctx.fillStyle = targetProgress >= 100 ? '#00ff88' : '#ffaa00'
    ctx.fillText(`${targetProgress}%`, contentX + 450, bottomY - 30)
    
    // 数据同步状态
    ctx.fillStyle = '#666666'
    ctx.fillText('SYNC:', contentX, bottomY)
    
    ctx.fillStyle = '#00ff88'
    ctx.fillText('LIVE', contentX + 60, bottomY)
    
    // 数据准确性
    ctx.fillStyle = '#666666'
    ctx.fillText('ACCURACY:', contentX + 150, bottomY)
    
    ctx.fillStyle = '#00ff88'
    ctx.fillText('98.7%', contentX + 250, bottomY)
    
    // AI 预测置信度
    ctx.fillStyle = '#666666'
    ctx.fillText('AI CONFIDENCE:', contentX + 350, bottomY)
    
    ctx.fillStyle = '#00ff88'
    ctx.fillText('94%', contentX + 500, bottomY)
    
    // 操作提示和快捷键
    ctx.fillStyle = '#444444'
    ctx.font = '16px SF Mono, Consolas, Monaco, monospace'
    ctx.textAlign = 'right'
    ctx.fillText('← → NAVIGATE • SPACE EXPORT • R REFRESH', canvas.width - 40, bottomY)
  }
  
  // 创建3D屏幕几何体
  const screenGeometry = new THREE.PlaneGeometry(16, 9)
  const texture = new THREE.CanvasTexture(canvas)
  texture.flipY = true
  
  const screenMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true
  })
  
  // 创建屏幕组合
  screenGroup = new THREE.Group()
  screenGroup.position.set(0, 8, -8)
  scene.add(screenGroup)
  
  screenMesh = new THREE.Mesh(screenGeometry, screenMaterial)
  screenMesh.position.set(0, 0, 0) // 相对于组合的位置
  screenGroup.add(screenMesh)
  
  // 创建屏幕边框（添加到组合中）
  createScreenFrame()
  
  // 存储绘制函数以便更新
  screenMesh.userData = {
    drawScreenContent,
    texture
  }
  
  // 初始绘制
  drawScreenContent()
}

// 创建屏幕边框装饰
const createScreenFrame = () => {
  // 主边框 - 金属质感
  const frameThickness = 0.2
  const frameWidth = 16.8
  const frameHeight = 9.6
  
  // 边框材质 - 深色金属
  const frameMaterial = new THREE.MeshLambertMaterial({
    color: 0x2c3e50,
    metalness: 0.8,
    roughness: 0.2
  })
  
  // 四条边框
  const frames = [
    // 上边框
    { geo: new THREE.BoxGeometry(frameWidth, frameThickness, frameThickness), pos: [0, (frameHeight - frameThickness) / 2, 0] },
    // 下边框
    { geo: new THREE.BoxGeometry(frameWidth, frameThickness, frameThickness), pos: [0, -(frameHeight - frameThickness) / 2, 0] },
    // 左边框
    { geo: new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), pos: [-(frameWidth - frameThickness) / 2, 0, 0] },
    // 右边框
    { geo: new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), pos: [(frameWidth - frameThickness) / 2, 0, 0] }
  ]
  
  frames.forEach(frame => {
    const frameMesh = new THREE.Mesh(frame.geo, frameMaterial)
    frameMesh.position.set(frame.pos[0], frame.pos[1], frame.pos[2]) // 相对于组合的位置
    screenGroup.add(frameMesh)
  })
  
  // 发光边缘装饰
  const edgeGeometry = new THREE.PlaneGeometry(frameWidth + 0.4, frameHeight + 0.4)
  const edgeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowColor: { value: new THREE.Color(0x00ff88) }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vGlow;
      
      void main() {
        vUv = uv;
        vGlow = sin(time * 0.002) * 0.3 + 0.7;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec2 vUv;
      varying float vGlow;
      
      void main() {
        // 创建边框效果
        float borderX = smoothstep(0.0, 0.02, vUv.x) * smoothstep(1.0, 0.98, vUv.x);
        float borderY = smoothstep(0.0, 0.02, vUv.y) * smoothstep(1.0, 0.98, vUv.y);
        float border = 1.0 - (borderX * borderY);
        
        // 边缘发光效果
        float edgeGlow = border * vGlow * 0.3;
        
        gl_FragColor = vec4(glowColor, edgeGlow);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  
  const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial)
  edgeMesh.position.set(0, 0, 0.05) // 相对于组合的位置，稍微向前避免z-fighting
  screenGroup.add(edgeMesh)
  
  // 存储边框材质以便动画更新
  scene.userData.screenFrame = {
    edgeMaterial: edgeMaterial
  }
  
  // 角落装饰 - 科技感
  createCornerDecorations()
}

// 创建屏幕角落装饰
const createCornerDecorations = () => {
  const cornerSize = 0.8
  const corners = [
    [-8, 4.2], [8, 4.2], [-8, -4.2], [8, -4.2] // 四个角的位置
  ]
  
  corners.forEach(([x, y]) => {
    // 角落发光点
    const cornerGeometry = new THREE.CircleGeometry(0.1, 8)
    const cornerMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff88,
      emissive: 0x004422,
      transparent: true,
      opacity: 0.8
    })
    
    const cornerMesh = new THREE.Mesh(cornerGeometry, cornerMaterial)
    cornerMesh.position.set(x, y, 0.1) // 相对于组合的位置
    screenGroup.add(cornerMesh)
    
    // 角落装饰线
    const lineGeometry = new THREE.PlaneGeometry(cornerSize, 0.02)
    const lineMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6
    })
    
    // 水平装饰线
    const hLine = new THREE.Mesh(lineGeometry, lineMaterial)
    hLine.position.set(x - (x > 0 ? cornerSize/2 : -cornerSize/2), y, 0.05) // 相对于组合的位置
    screenGroup.add(hLine)
    
    // 垂直装饰线
    const vLineGeometry = new THREE.PlaneGeometry(0.02, cornerSize)
    const vLine = new THREE.Mesh(vLineGeometry, lineMaterial)
    vLine.position.set(x, y - (y > 0 ? cornerSize/2 : -cornerSize/2), 0.05) // 相对于组合的位置
    screenGroup.add(vLine)
  })
}

// 为附加屏幕创建边框
const createScreenFrameForAdditional = (screenGroup) => {
  // 简化的边框 - 只有发光边缘，匹配新屏幕尺寸
  const frameWidth = 20.5
  const frameHeight = 11.75
  
  const edgeGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight)
  const edgeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowColor: { value: new THREE.Color(0x00ffff) } // 更明亮的青色
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vGlow;
      
      void main() {
        vUv = uv;
        vGlow = sin(time * 0.003) * 0.2 + 0.8;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec2 vUv;
      varying float vGlow;
      
      void main() {
        // 创建边框效果
        float borderX = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
        float borderY = smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
        float border = 1.0 - (borderX * borderY);
        
        // 边缘发光效果 - 增强亮度
        float edgeGlow = border * vGlow * 0.6;
        
        gl_FragColor = vec4(glowColor, edgeGlow);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  
  const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial)
  edgeMesh.position.set(0, 0, -0.01) // 稍微向后，避免z-fighting
  screenGroup.add(edgeMesh)
  
  // 存储材质以便动画更新
  if (!screenGroup.userData) {
    screenGroup.userData = {}
  }
  screenGroup.userData.edgeMaterial = edgeMaterial
}
  
// 移除建筑轮廓以简化背景

  // 建筑结构已移除
  const createArchitecture = () => {
    // 后墙
    const wallGeometry = new THREE.PlaneGeometry(50, 20)
    
    // 使用暖色材质，明亮温馨
    const sharedWallMaterial = new THREE.MeshPhongMaterial({
      color: 0xf2e6d9,  // 温暖的奶茶色
      shininess: 60,
      specular: 0xddcc99  // 暖色反射
    })
    
    // 后墙 - 使用共享材质
    const backWall = new THREE.Mesh(wallGeometry, sharedWallMaterial)
    backWall.position.set(0, 9, -12)
    // 移除阴影以避免纹理单元限制
    scene.add(backWall)
    
    // 侧墙 - 使用共享材质
    const sideWallGeometry = new THREE.PlaneGeometry(30, 20)
    
    const leftWall = new THREE.Mesh(sideWallGeometry, sharedWallMaterial)
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-25, 9, 3)
    leftWall// 移除阴影以避免纹理单元限制
    scene.add(leftWall)
    
    const rightWall = new THREE.Mesh(sideWallGeometry, sharedWallMaterial)
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(25, 9, 3)
    // 移除阴影以避免纹理单元限制
    scene.add(rightWall)

    // 简化墙面，保持专业演讲台风格
    
    // 添加装饰性壁龛
    for (let i = 0; i < 3; i++) {
      const nicheGeometry = new THREE.BoxGeometry(4, 6, 0.5)
      const nicheMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        shininess: 40
      })
      const niche = new THREE.Mesh(nicheGeometry, nicheMaterial)
      niche.position.set(-15 + i * 15, 8, -11.7)
      // 移除阴影以避免纹理单元限制
      // 移除阴影以避免纹理单元限制
      scene.add(niche)
      
      // 壁龛内部照明
      const nicheLight = new THREE.PointLight(0x60a5fa, 0.3, 8)
      nicheLight.position.set(-15 + i * 15, 8, -11.5)
      scene.add(nicheLight)
    }
    
    // 添加结构梁系统
    const createBeamSystem = () => {
      for (let i = 0; i < 8; i++) {
        const x = -20 + i * 5.7
        
        // 主横梁
        const beamGeometry = new THREE.BoxGeometry(0.3, 0.8, 35)
        const beamMaterial = new THREE.MeshPhongMaterial({
          color: 0xccbbaa,
          shininess: 40
        })
        const beam = new THREE.Mesh(beamGeometry, beamMaterial)
        beam.position.set(x, 18, 3)
        beam// 移除阴影以避免纹理单元限制
        scene.add(beam)
        
        // 支撑柱
        const supportGeometry = new THREE.CylinderGeometry(0.2, 0.3, 18, 8)
        const support = new THREE.Mesh(supportGeometry, beamMaterial)
        support.position.set(x, 9, -8)
        support// 移除阴影以避免纹理单元限制
        support// 移除阴影以避免纹理单元限制
        scene.add(support)
      }
    }
    
    createBeamSystem()
    
    // 添加天花板灯具
    const createCeilingLights = () => {
      for (let i = 0; i < 12; i++) {
        const x = -20 + (i % 6) * 8
        const z = -8 + Math.floor(i / 6) * 16
        
        // 灯具外壳
        const lightGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 12)
        const lightMaterial = new THREE.MeshPhongMaterial({
          color: 0x888888,
          shininess: 120,
          emissive: 0x111111
        })
        const lightFixture = new THREE.Mesh(lightGeometry, lightMaterial)
        lightFixture.position.set(x, 17.5, z)
        lightFixture// 移除阴影以避免纹理单元限制
        scene.add(lightFixture)
        
        // 灯光面板
        const panelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 12)
        const panelMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0x444444,
          transparent: true,
          opacity: 0.9
        })
        const panel = new THREE.Mesh(panelGeometry, panelMaterial)
        panel.position.set(x, 17.35, z)
        scene.add(panel)
        
        // 灯光源
        const ceilingSpotLight = new THREE.PointLight(0xffffff, 0.4, 15)
        ceilingSpotLight.position.set(x, 17, z)
        // 移除阴影配置以避免纹理单元限制
        scene.add(ceilingSpotLight)
      }
    }
    
    createCeilingLights()
  }


// 创建照明系统 - 优化VR环境
const createLighting = () => {
  // 主环境光 - 增强亮度，暖色系
  const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.6) // 温暖的环境光
  scene.add(ambientLight)

  // 主要方向光 - 暖色系，模拟自然光
  const directionalLight = new THREE.DirectionalLight(0xfff8dc, 0.8) // 温暖的白光
  directionalLight.position.set(10, 20, 10)
  directionalLight.target.position.set(0, 0, 0)
  // 禁用阴影以避免纹理单元限制
  scene.add(directionalLight)
  scene.add(directionalLight.target)

  // 屏幕照明 - 突出屏幕区域
  const screenLight = new THREE.PointLight(0x87ceeb, 0.5, 25) // 柔和的蓝白光
  screenLight.position.set(0, 8, -5)
  scene.add(screenLight)

  // 观众席照明 - 增强观看体验
  const audienceLight1 = new THREE.PointLight(0xfff4e6, 0.4, 20)
  audienceLight1.position.set(-5, 4, 2)
  scene.add(audienceLight1)

  const audienceLight2 = new THREE.PointLight(0xfff4e6, 0.4, 20)
  audienceLight2.position.set(5, 4, 2)
  scene.add(audienceLight2)

  // 后方补光 - 避免过暗
  const backLight = new THREE.PointLight(0xf5f5dc, 0.3, 30)
  backLight.position.set(0, 8, 15)
  scene.add(backLight)
}

// 更新屏幕内容
const updateScreenContent = () => {
  if (screenMesh && screenMesh.userData && screenMesh.userData.drawScreenContent) {
    screenMesh.userData.drawScreenContent()
    screenMesh.userData.texture.needsUpdate = true
  }
}

// 获取当前相机朝向的屏幕
const getCurrentDirectionScreen = () => {
  if (directionalScreens.length === 0) return null
  
  // 获取相机的Y轴旋转角度
  let cameraAngle = cameraRotationY
  if (cameraAngle < 0) cameraAngle += Math.PI * 2
  if (cameraAngle > Math.PI * 2) cameraAngle -= Math.PI * 2
  
  // 找到最接近的方向
  let closestScreen = directionalScreens[0]
  let minDifference = Math.PI * 2
  
  directionalScreens.forEach(screen => {
    let screenAngle = screen.config.angle
    let difference = Math.abs(cameraAngle - screenAngle)
    
    // 处理角度环绕
    if (difference > Math.PI) {
      difference = Math.PI * 2 - difference
    }
    
    if (difference < minDifference) {
      minDifference = difference
      closestScreen = screen
    }
  })
  
  return closestScreen
}

// 更新方向性屏幕缩放和地板控制
const updateDirectionalScreensScaling = () => {
  const currentScreen = getCurrentDirectionScreen()
  const scaleLerpSpeed = 0.1
  
  // 更新地板区域 - 当前方向高亮
  updateFloorSectionHighlight(currentScreen)
  
  directionalScreens.forEach(screenData => {
    let targetScale = screenData.baseScale
    
    // 如果是当前朝向的屏幕，应用目标缩放
    if (currentScreen && screenData.config.id === currentScreen.config.id) {
      // 限制最大缩放防止重叠
      const maxAllowedScale = Math.min(targetScreenScale, 1.8)
      targetScale = screenData.baseScale * maxAllowedScale
      
      // 动态调整位置避免重叠
      const currentDistance = 20
      const adjustedDistance = currentDistance + (maxAllowedScale - 1.0) * 8
      const angle = screenData.config.angle
      const newX = Math.sin(angle) * adjustedDistance
      const newZ = Math.cos(angle) * adjustedDistance
      screenData.group.position.set(newX, screenData.config.position[1], newZ)
    } else {
      // 其他屏幕保持基础缩放，但在全局缩小时同步缩小
      if (targetScreenScale < 1.0) {
        targetScale = screenData.baseScale * targetScreenScale
      } else {
        // 其他屏幕在当前屏幕放大时稍微缩小以避免干扰
        targetScale = screenData.baseScale * Math.max(0.7, 2.0 - targetScreenScale)
      }
      
      // 恢复原始位置
      screenData.group.position.set(...screenData.config.position)
    }
    
    // 平滑插值
    screenData.currentScale += (targetScale - screenData.currentScale) * scaleLerpSpeed
    screenData.group.scale.setScalar(screenData.currentScale)
  })
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)
  const elapsedTime = clock.getElapsedTime()

  // 基本VR相机控制
  const rotationLerpSpeed = 0.08
  cameraRotationY += (targetRotationY - cameraRotationY) * rotationLerpSpeed
  cameraRotationX += (targetRotationX - cameraRotationX) * rotationLerpSpeed

  camera.rotation.order = 'YXZ'
  camera.rotation.y = cameraRotationY
  camera.rotation.x = cameraRotationX

  // 粒子效果已移除
  
  // 更新科幻地板动画
  if (scene.userData.sciFiFloor) {
    scene.userData.sciFiFloor.material.uniforms.time.value = elapsedTime
  }
  
  if (scene.userData.sciFiFloorEdge) {
    scene.userData.sciFiFloorEdge.material.uniforms.time.value = elapsedTime
  }
  
  // 更新演讲台装饰动画
  if (scene.userData.lectureDecorations) {
    if (scene.userData.lectureDecorations.podiumEdge) {
      scene.userData.lectureDecorations.podiumEdge.material.uniforms.time.value = elapsedTime
    }
    if (scene.userData.lectureDecorations.aisle) {
      scene.userData.lectureDecorations.aisle.material.uniforms.time.value = elapsedTime
    }
  }
  
  // 更新屏幕边框动画
  if (scene.userData.screenFrame && scene.userData.screenFrame.edgeMaterial) {
    scene.userData.screenFrame.edgeMaterial.uniforms.time.value = elapsedTime
  }
  
  // 更新方向性屏幕动画和内容
  directionalScreens.forEach(screenData => {
    // 更新边框动画
    if (screenData.group.userData.edgeMaterial) {
      screenData.group.userData.edgeMaterial.uniforms.time.value = elapsedTime
    }
    
    // 更新实时屏幕内容（所有屏幕都实时更新时间）
    screenData.mesh.userData.drawScreenContent()
    screenData.mesh.userData.texture.needsUpdate = true
  })

  // 更新屏幕缩放动画 - 缩放整个屏幕组合
  if (screenGroup) {
    const scaleLerpSpeed = 0.1
    screenScale += (targetScreenScale - screenScale) * scaleLerpSpeed
    screenGroup.scale.setScalar(screenScale)
  }
  
  // 更新方向性屏幕缩放
  updateDirectionalScreensScaling()

  // 更新屏幕内容（仅数据，无动画）
  updateScreenContent()

  renderer.render(scene, camera)
}

// 滑动手势处理
const handleSwipeGesture = (deltaX, deltaY) => {
  const swipeThreshold = 50 // 滑动阈值
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // 水平滑动 - 切换内容
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        // 右滑 - 上一页
        if (currentSlide > 0) {
          currentSlide--
          updateScreenContent()
        }
      } else {
        // 左滑 - 下一页  
        if (currentSlide < slides.length - 1) {
          currentSlide++
          updateScreenContent()
        }
      }
    }
  }
}

// 鼠标事件处理
const onMouseDown = (event) => {
  if (event.button === 0) { // 左键
    isVRDragging = true
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }
}

const onMouseMove = (event) => {
  if (isVRDragging) {
    const deltaX = event.clientX - lastMouseX
    const deltaY = event.clientY - lastMouseY
    
    targetRotationY -= deltaX * 0.005
    targetRotationX -= deltaY * 0.005
    
    // 限制垂直旋转范围
    targetRotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetRotationX))
    
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }
}

const onMouseUp = (event) => {
  if (event.button === 0) { // 左键
    isVRDragging = false
  }
}

// 触摸事件处理
const onTouchStart = (event) => {
  event.preventDefault()
  
  if (event.touches.length === 1) {
    // 单指触摸
    isDragging = true
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
    lastMouseX = touchStartX
    lastMouseY = touchStartY
  } else if (event.touches.length === 2) {
    // 双指缩放
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    initialPinchDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    isPinching = true
  }
}

const onTouchMove = (event) => {
  event.preventDefault()
  
  if (event.touches.length === 1 && isDragging && !isPinching) {
    const touch = event.touches[0]
    const deltaX = touch.clientX - lastMouseX
    const deltaY = touch.clientY - lastMouseY
    
    targetRotationY -= deltaX * 0.005
    targetRotationX -= deltaY * 0.005
    
    // 限制垂直旋转范围
    targetRotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetRotationX))
    
    lastMouseX = touch.clientX
    lastMouseY = touch.clientY
  } else if (event.touches.length === 2 && isPinching) {
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    
    const scaleChange = currentDistance / initialPinchDistance
    const newScale = screenScale * scaleChange
    targetScreenScale = Math.max(minScale, Math.min(maxScale, newScale))
    
    initialPinchDistance = currentDistance
  }
}

const onTouchEnd = (event) => {
  if (event.touches.length === 0) {
    if (isDragging && !isPinching) {
      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY
      
      handleSwipeGesture(deltaX, deltaY)
    }
    
    isDragging = false
    isPinching = false
  } else if (event.touches.length === 1) {
    isPinching = false
  }
}

// 滚轮事件处理
const onWheel = (event) => {
  event.preventDefault()
  
  const delta = event.deltaY * -0.001
  const newScale = targetScreenScale + delta
  targetScreenScale = Math.max(minScale, Math.min(maxScale, newScale))
}

// 键盘事件处理
const onKeyDown = (event) => {
  switch (event.code) {
    case 'ArrowLeft':
      event.preventDefault()
      if (currentSlide > 0) {
        currentSlide--
        updateScreenContent()
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (currentSlide < slides.length - 1) {
        currentSlide++
        updateScreenContent()
      }
      break
    case 'KeyR':
      event.preventDefault()
      targetScreenScale = 1.0
      break
    case 'Escape':
      event.preventDefault()
      targetRotationY = 0
      targetRotationX = 0
      break
  }
}

// 窗口大小调整处理
const onWindowResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

onMounted(() => {
  initScene()
  createMultipleScreens()
  createLighting()
  animate()
  
  // 添加事件监听器
  window.addEventListener('resize', onWindowResize)
  
  // 鼠标事件
  renderer.domElement.addEventListener('mousedown', onMouseDown)
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  renderer.domElement.addEventListener('mouseup', onMouseUp)
  
  // 触摸事件
  renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false })
  renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false })
  renderer.domElement.addEventListener('touchend', onTouchEnd)
  
  // 滚轮事件
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
  
  // 键盘事件
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  // 清理动画
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', onWindowResize)
  
  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('mousedown', onMouseDown)
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.domElement.removeEventListener('mouseup', onMouseUp)
    
    renderer.domElement.removeEventListener('touchstart', onTouchStart)
    renderer.domElement.removeEventListener('touchmove', onTouchMove)
    renderer.domElement.removeEventListener('touchend', onTouchEnd)
    
    renderer.domElement.removeEventListener('wheel', onWheel)
  }
  
  window.removeEventListener('keydown', onKeyDown)
  
  // 清理Three.js资源
  if (renderer) {
    renderer.dispose()
  }
  
  // 清理屏幕组合
  if (screenGroup) {
    screenGroup.clear()
    screenGroup = null
  }
  
  // 清理方向性屏幕
  directionalScreens.forEach(screenData => {
    if (screenData.group) {
      screenData.group.clear()
    }
  })
  directionalScreens = []
  
  if (scene) {
    scene.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose()
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
})
</script>

<style scoped>
.simple-vr {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
  cursor: grab;
}

.simple-vr:active {
  cursor: grabbing;
}
</style>
