<template>
  <div class="identity-graph-content">
    <v-chart 
      ref="identityChartV2"
      class="identity-graph" 
      :option="identityGraphOptionV2" 
      :autoresize="true"
      @click="onGraphClick"
      @mouseover="onGraphMouseOver"
      @mouseout="onGraphMouseOut"
    />
  </div>
</template>

<script>

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart } from 'echarts/charts'
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
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export default {
  name: 'IdentityGraphCardV2',
  components: {
    VChart
  },



  data() {
    return {
      showLabels: true,
      showCrossConnections: true,
      showInterestConnections: true
    }
  },
  methods: {
    onGraphClick(params) {
      console.log('图表点击:', params)
      if (params.dataType === 'node') {
        const node = params.data
        if (node.id === 'work_identity' || node.id === 'life_identity' || node.id === 'social_identity') {
          this.showIdentityDetails(node.id)
        } else if (node.id.startsWith('company_') || node.id.startsWith('client_') || node.id.startsWith('partner_') || 
                   node.id.startsWith('cofounder_') || node.id.startsWith('investor_') || node.id.startsWith('employee_') ||
                   node.id.startsWith('manager_') || node.id.startsWith('ceo_') || node.id.startsWith('startup_') ||
                   node.id.startsWith('incubator_')) {
          this.showPersonDetails(node)
        }
      }
    },
    
    onGraphMouseOver(params) {
      // 鼠标悬停处理
    },
    
    onGraphMouseOut(params) {
      // 鼠标离开处理
    },
    
    showIdentityDetails(identityId) {
      // V2版本使用独立数据
      const identityData = {
        'real_identity': {
          name: '真实身份',
          description: '我的真实身份，用于正式场合和法律事务',
          type: 'real',
          metadata: {
            legalName: '王小明',
            documents: ['身份证', '户口本', '结婚证'],
            verificationLevel: '已验证'
          }
        },
        'work_identity': {
          name: '工作身份',
          description: '多重身份：创业公司创始人、大公司顾问、创业导师，展现多元化职业发展',
          type: 'professional',
          metadata: {
            skills: ['JavaScript', 'Vue.js', 'Node.js', 'Python', 'Docker', '产品设计', '团队管理'],
            experience: 8,
            organizations: [
              {
                id: 'company_techstart',
                name: '科技创业公司',
                role: '创始人兼CEO',
                relationship: '创业公司',
                strength: 0.95,
                startDate: '2023-01',
                equity: '60%',
                teamSize: 15,
                focus: 'AI技术产品'
              },
              {
                id: 'company_bigtech',
                name: '大科技公司',
                role: '技术顾问',
                relationship: '顾问身份',
                strength: 0.75,
                startDate: '2023-06',
                contract: '年度顾问',
                focus: '技术架构优化'
              },
              {
                id: 'company_startup',
                name: '创业孵化器',
                role: '导师',
                relationship: '导师身份',
                strength: 0.7,
                startDate: '2023-03',
                focus: '创业指导'
              }
            ],
            clients: [
              {
                id: 'client_ali',
                name: '阿里巴巴',
                role: '技术顾问',
                relationship: '重要客户',
                strength: 0.8,
                project: '云原生架构设计',
                value: '200万'
              },
              {
                id: 'client_tencent',
                name: '腾讯',
                role: '产品顾问',
                relationship: '战略客户',
                strength: 0.85,
                project: '社交产品优化',
                value: '300万'
              },
              {
                id: 'client_baidu',
                name: '百度',
                role: 'AI顾问',
                relationship: '技术合作伙伴',
                strength: 0.7,
                project: 'AI算法优化',
                value: '150万'
              }
            ],
            partners: [
              {
                id: 'partner_cloud',
                name: '云服务公司',
                role: '技术合作伙伴',
                relationship: '云服务商',
                strength: 0.6,
                project: '云架构合作',
                value: '100万'
              },
              {
                id: 'partner_investment',
                name: '投资机构',
                role: '投资顾问',
                relationship: '投资合作伙伴',
                strength: 0.75,
                project: '项目评估',
                value: '50万'
              }
            ]
          }
        },
        'life_identity': {
          name: '生活身份',
          description: '在生活中的身份，作为丈夫和父亲，承担家庭责任和个人生活',
          type: 'life',
          metadata: {
            familyRole: '丈夫',
            spouse: '李小美',
            children: [
              { name: '王小糖', age: 3, gender: '女' }
            ]
          }
        },
        'social_identity': {
          name: '社交身份',
          description: '在朋友和社交圈中的身份，更加轻松随意',
          type: 'social',
          metadata: {
            nickname: '小明',
            interests: ['编程', '游戏', '音乐', '电影'],
            personality: '内向但友善，技术宅'
          }
        }
      }
      
      const identity = identityData[identityId]
      if (identity) {
        let details = `身份详情：${identity.name}\n\n`
        details += `描述：${identity.description}\n`
        details += `类型：${identity.type}\n\n`
        
        if (identity.metadata) {
          details += `详细信息：\n`
          Object.entries(identity.metadata).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              details += `• ${key}: ${value.join(', ')}\n`
            } else if (typeof value === 'object') {
              details += `• ${key}: ${JSON.stringify(value)}\n`
            } else {
              details += `• ${key}: ${value}\n`
            }
          })
        }
        
        alert(details)
      }
    },
    
    showPersonDetails(node) {
      let details = `${node.name}\n\n`
      
      if (node.metadata) {
        if (node.metadata.role) {
          details += `角色：${node.metadata.role}\n`
        }
        if (node.metadata.position) {
          details += `职位：${node.metadata.position}\n`
        }
        if (node.metadata.relationship) {
          details += `关系：${node.metadata.relationship}\n`
        }
        if (node.metadata.startDate) {
          details += `开始时间：${node.metadata.startDate}\n`
        }
        if (node.metadata.focus) {
          details += `专注领域：${node.metadata.focus}\n`
        }
        if (node.metadata.equity) {
          details += `股权：${node.metadata.equity}\n`
        }
        if (node.metadata.teamSize) {
          details += `团队规模：${node.metadata.teamSize}人\n`
        }
        if (node.metadata.contract) {
          details += `合同类型：${node.metadata.contract}\n`
        }
        if (node.metadata.skills && node.metadata.skills.length > 0) {
          details += `技能：${node.metadata.skills.join(', ')}\n`
        }
        if (node.metadata.projects && node.metadata.projects.length > 0) {
          details += `项目：${node.metadata.projects.join(', ')}\n`
        }
        if (node.metadata.project) {
          details += `项目：${node.metadata.project}\n`
        }
        if (node.metadata.investment) {
          details += `投资：${node.metadata.investment}\n`
        }
        if (node.metadata.contact) {
          details += `联系人：${node.metadata.contact}\n`
        }
        if (node.metadata.value) {
          details += `价值：${node.metadata.value}\n`
        }
        details += `关系强度：${Math.round(node.value)}%\n\n`
        
        // 添加更多详细信息
        if (node.id.startsWith('company_')) {
          details += `组织信息:\n`
          details += `• 组织类型: ${node.metadata.relationship}\n`
          details += `• 参与程度: ${Math.round(node.value)}%\n`
          details += `• 时间分配: 主要工作\n`
          details += `• 决策权限: 高\n`
        } else if (node.id.startsWith('client_')) {
          details += `客户信息:\n`
          details += `• 服务类型: 专业顾问\n`
          details += `• 合作历史: 长期\n`
          details += `• 价值贡献: 技术指导\n`
          details += `• 未来潜力: 高\n`
        } else if (node.id.startsWith('partner_')) {
          details += `合作伙伴信息:\n`
          details += `• 合作领域: 技术合作\n`
          details += `• 合作模式: 战略联盟\n`
          details += `• 互惠价值: 资源共享\n`
          details += `• 发展前景: 良好\n`
        } else if (node.id.startsWith('cofounder_') || node.id.startsWith('employee_')) {
          details += `团队成员信息:\n`
          details += `• 工作性质: 直接合作\n`
          details += `• 沟通频率: 日常\n`
          details += `• 项目协作: 紧密\n`
          details += `• 信任程度: 高\n`
        } else if (node.id.startsWith('investor_')) {
          details += `投资人信息:\n`
          details += `• 投资阶段: 早期\n`
          details += `• 投资金额: ${node.metadata.investment}\n`
          details += `• 投资重点: ${node.metadata.focus}\n`
          details += `• 支持程度: 积极\n`
        }
      }
      
      alert(details)
    },
    
    // 生成图表节点数据（V2独立数据）
    getGraphNodes() {
      const nodes = []
      
      // 添加核心用户节点
      nodes.push({
        id: 'me',
        name: '王小明',
        category: 0,
        value: 100,
        symbolSize: 35,
        itemStyle: { color: '#007AFF' }
      })
      
      // 添加身份角色节点
      const identityRoles = [
        {
          id: 'real_identity',
          name: '真实身份',
          type: 'real',
          isDefault: true,
          isActive: true,
          metadata: {
            legalName: '王小明',
            documents: ['身份证', '户口本', '结婚证'],
            verificationLevel: '已验证'
          }
        },
        {
          id: 'work_identity',
          name: '工作身份',
          type: 'professional',
          isDefault: false,
          isActive: true,
          metadata: {
            skills: ['JavaScript', 'Vue.js', 'Node.js', 'Python', 'Docker', '产品设计', '团队管理'],
            experience: 8,
            // 多重身份关系
            organizations: [
              {
                id: 'company_techstart',
                name: '科技创业公司',
                role: '创始人兼CEO',
                relationship: '创业公司',
                strength: 0.95,
                startDate: '2023-01',
                equity: '60%',
                teamSize: 15,
                focus: 'AI技术产品',
                contacts: [
                  {
                    id: 'cofounder_li_ming',
                    name: '李明',
                    role: '联合创始人',
                    position: 'CTO',
                    relationship: '创业伙伴',
                    strength: 0.9,
                    skills: ['AI算法', '机器学习', 'Python']
                  },
                  {
                    id: 'investor_wang_zong',
                    name: '王总',
                    role: '天使投资人',
                    position: '投资总监',
                    relationship: '投资人',
                    strength: 0.8,
                    investment: '500万',
                    focus: '早期投资'
                  },
                  {
                    id: 'employee_zhang_dev',
                    name: '张开发',
                    role: '核心员工',
                    position: '高级工程师',
                    relationship: '团队成员',
                    strength: 0.7,
                    skills: ['React', 'Node.js', '数据库']
                  }
                ]
              },
              {
                id: 'company_bigtech',
                name: '大科技公司',
                role: '技术顾问',
                relationship: '顾问身份',
                strength: 0.75,
                startDate: '2023-06',
                contract: '年度顾问',
                focus: '技术架构优化',
                contacts: [
                  {
                    id: 'manager_chen_li',
                    name: '陈丽',
                    role: '项目经理',
                    position: '技术总监',
                    relationship: '项目对接人',
                    strength: 0.8,
                    projects: ['系统重构', '性能优化']
                  },
                  {
                    id: 'ceo_liu_zong',
                    name: '刘总',
                    role: '公司高管',
                    position: 'CEO',
                    relationship: '决策层',
                    strength: 0.85,
                    focus: '战略规划'
                  }
                ]
              },
              {
                id: 'company_startup',
                name: '创业孵化器',
                role: '导师',
                relationship: '导师身份',
                strength: 0.7,
                startDate: '2023-03',
                focus: '创业指导',
                contacts: [
                  {
                    id: 'startup_founder_zhang',
                    name: '张创业者',
                    role: '被指导者',
                    position: '创始人',
                    relationship: '创业学员',
                    strength: 0.6,
                    project: '电商平台'
                  },
                  {
                    id: 'incubator_director_wang',
                    name: '王主任',
                    role: '孵化器负责人',
                    position: '主任',
                    relationship: '合作伙伴',
                    strength: 0.7,
                    focus: '项目孵化'
                  }
                ]
              }
            ],
            // 独立客户关系
            clients: [
              {
                id: 'client_ali',
                name: '阿里巴巴',
                role: '技术顾问',
                relationship: '重要客户',
                strength: 0.8,
                project: '云原生架构设计',
                value: '200万',
                contact: '张技术总监'
              },
              {
                id: 'client_tencent',
                name: '腾讯',
                role: '产品顾问',
                relationship: '战略客户',
                strength: 0.85,
                project: '社交产品优化',
                value: '300万',
                contact: '李产品总监'
              },
              {
                id: 'client_baidu',
                name: '百度',
                role: 'AI顾问',
                relationship: '技术合作伙伴',
                strength: 0.7,
                project: 'AI算法优化',
                value: '150万',
                contact: '王AI总监'
              }
            ],
            // 合作伙伴关系
            partners: [
              {
                id: 'partner_cloud',
                name: '云服务公司',
                role: '技术合作伙伴',
                relationship: '云服务商',
                strength: 0.6,
                project: '云架构合作',
                value: '100万',
                contact: '陈技术总监'
              },
              {
                id: 'partner_investment',
                name: '投资机构',
                role: '投资顾问',
                relationship: '投资合作伙伴',
                strength: 0.75,
                project: '项目评估',
                value: '50万',
                contact: '赵投资总监'
              }
            ]
          }
        },
        {
          id: 'life_identity',
          name: '生活身份',
          type: 'life',
          isDefault: false,
          isActive: true,
          metadata: {
            familyRole: '丈夫',
            spouse: '李小美',
            children: [
              { name: '王小糖', age: 3, gender: '女' }
            ],
            homeAddress: '北京市海淀区中关村大街100号',
            homePhone: '138****5678'
          }
        },
        {
          id: 'social_identity',
          name: '社交身份',
          type: 'social',
          isDefault: false,
          isActive: true,
          metadata: {
            nickname: '小明',
            interests: ['编程', '游戏', '音乐', '电影'],
            socialPlatforms: {
              wechat: 'xiaoming_tech',
              weibo: 'tech_xiaoming',
              github: 'xiaoming-dev',
              linkedin: 'xiaoming-wang'
            },
            hobbies: ['打游戏', '听音乐', '看电影', '写代码'],
            personality: '内向但友善，技术宅'
          }
        }
      ]
      
      identityRoles.forEach((identity, index) => {
        const categoryIndex = this.getCategoryIndex(identity.type)
        
        nodes.push({
          id: identity.id,
          name: identity.name,
          category: categoryIndex,
          value: this.calculateIdentityValue(identity),
          symbolSize: this.calculateSymbolSize(identity),
          itemStyle: { color: this.getCategoryColor(identity.type) }
        })
        
        // 为每个身份添加相关人物节点
        if (identity.metadata) {
          this.addRelatedPeople(nodes, identity)
        }
      })
      
      return nodes
    },
    
    // 生成图表连接数据（V2独立数据）
    getGraphLinks() {
      const links = []
      
      // 定义身份角色数据
      const identityRoles = [
        {
          id: 'real_identity',
          name: '真实身份',
          type: 'real',
          isDefault: true,
          isActive: true
        },
        {
          id: 'work_identity',
          name: '工作身份',
          type: 'professional',
          isDefault: false,
          isActive: true,
          metadata: {
            skills: ['JavaScript', 'Vue.js', 'Node.js', 'Python', 'Docker', '产品设计', '团队管理'],
            organizations: [
              {
                id: 'company_techstart',
                name: '科技创业公司',
                role: '创始人兼CEO',
                relationship: '创业公司',
                strength: 0.95,
                startDate: '2023-01',
                equity: '60%',
                teamSize: 15,
                focus: 'AI技术产品',
                contacts: [
                  {
                    id: 'cofounder_li_ming',
                    name: '李明',
                    role: '联合创始人',
                    position: 'CTO',
                    relationship: '创业伙伴',
                    strength: 0.9,
                    skills: ['AI算法', '机器学习', 'Python']
                  },
                  {
                    id: 'investor_wang_zong',
                    name: '王总',
                    role: '天使投资人',
                    position: '投资总监',
                    relationship: '投资人',
                    strength: 0.8,
                    investment: '500万',
                    focus: '早期投资'
                  },
                  {
                    id: 'employee_zhang_dev',
                    name: '张开发',
                    role: '核心员工',
                    position: '高级工程师',
                    relationship: '团队成员',
                    strength: 0.7,
                    skills: ['React', 'Node.js', '数据库']
                  }
                ]
              },
              {
                id: 'company_bigtech',
                name: '大科技公司',
                role: '技术顾问',
                relationship: '顾问身份',
                strength: 0.75,
                startDate: '2023-06',
                contract: '年度顾问',
                focus: '技术架构优化',
                contacts: [
                  {
                    id: 'manager_chen_li',
                    name: '陈丽',
                    role: '项目经理',
                    position: '技术总监',
                    relationship: '项目对接人',
                    strength: 0.8,
                    projects: ['系统重构', '性能优化']
                  },
                  {
                    id: 'ceo_liu_zong',
                    name: '刘总',
                    role: '公司高管',
                    position: 'CEO',
                    relationship: '决策层',
                    strength: 0.85,
                    focus: '战略规划'
                  }
                ]
              },
              {
                id: 'company_startup',
                name: '创业孵化器',
                role: '导师',
                relationship: '导师身份',
                strength: 0.7,
                startDate: '2023-03',
                focus: '创业指导',
                contacts: [
                  {
                    id: 'startup_founder_zhang',
                    name: '张创业者',
                    role: '被指导者',
                    position: '创始人',
                    relationship: '创业学员',
                    strength: 0.6,
                    project: '电商平台'
                  },
                  {
                    id: 'incubator_director_wang',
                    name: '王主任',
                    role: '孵化器负责人',
                    position: '主任',
                    relationship: '合作伙伴',
                    strength: 0.7,
                    focus: '项目孵化'
                  }
                ]
              }
            ],
            clients: [
              {
                id: 'client_ali',
                name: '阿里巴巴',
                role: '技术顾问',
                relationship: '重要客户',
                strength: 0.8,
                project: '云原生架构设计',
                value: '200万',
                contact: '张技术总监'
              },
              {
                id: 'client_tencent',
                name: '腾讯',
                role: '产品顾问',
                relationship: '战略客户',
                strength: 0.85,
                project: '社交产品优化',
                value: '300万',
                contact: '李产品总监'
              },
              {
                id: 'client_baidu',
                name: '百度',
                role: 'AI顾问',
                relationship: '技术合作伙伴',
                strength: 0.7,
                project: 'AI算法优化',
                value: '150万',
                contact: '王AI总监'
              }
            ],
            partners: [
              {
                id: 'partner_cloud',
                name: '云服务公司',
                role: '技术合作伙伴',
                relationship: '云服务商',
                strength: 0.6,
                project: '云架构合作',
                value: '100万',
                contact: '陈技术总监'
              },
              {
                id: 'partner_investment',
                name: '投资机构',
                role: '投资顾问',
                relationship: '投资合作伙伴',
                strength: 0.75,
                project: '项目评估',
                value: '50万',
                contact: '赵投资总监'
              }
            ]
          }
        },
        {
          id: 'life_identity',
          name: '生活身份',
          type: 'life',
          isDefault: false,
          isActive: true,
          metadata: {
            children: [
              { name: '王小糖', age: 3, gender: '女' }
            ]
          }
        },
        {
          id: 'social_identity',
          name: '社交身份',
          type: 'social',
          isDefault: false,
          isActive: true,
          metadata: {
            interests: ['编程', '游戏', '音乐', '电影']
          }
        }
      ]
      
      // 核心身份连接
      identityRoles.forEach(identity => {
        links.push({
          source: 'me',
          target: identity.id,
          value: identity.isDefault ? 0.95 : 0.85,
          lineStyle: { 
            width: identity.isDefault ? 4 : 3, 
            color: '#007AFF' 
          },
          relationType: '核心身份连接',
          relationDesc: `用户与${identity.name}的核心连接`
        })
      })
      
      // 添加跨身份连接
      if (this.showCrossConnections) {
        this.addCrossIdentityLinks(links, identityRoles)
      }
      
      // 添加兴趣连接
      if (this.showInterestConnections) {
        this.addInterestLinks(links, identityRoles)
      }
      
      // 添加工作身份的特殊连接
      this.addWorkIdentityLinks(links, identityRoles)
      
      return links
    },
    

    
    // 获取分类颜色
    getCategoryColor(type) {
      const colorMap = {
        'real': '#007AFF',
        'professional': '#34C759',
        'life': '#FF9500',
        'social': '#AF52DE',
        'client': '#FF6B35',
        'partner': '#4ECDC4'
      }
      return colorMap[type] || '#007AFF'
    },
    
    // 计算身份价值
    calculateIdentityValue(identity) {
      let value = 50 // 基础值
      
      if (identity.isDefault) value += 20
      if (identity.isActive) value += 15
      
      // 根据类型调整
      switch (identity.type) {
        case 'professional':
          if (identity.metadata?.experience) value += identity.metadata.experience * 2
          break
        case 'life':
          if (identity.metadata?.children) value += identity.metadata.children.length * 5
          break
        case 'social':
          if (identity.metadata?.interests) value += identity.metadata.interests.length * 3
          break
        case 'virtual':
          if (identity.metadata?.reputation) {
            const totalRep = Object.values(identity.metadata.reputation).reduce((a, b) => a + b, 0)
            value += totalRep / 100
          }
          break
        case 'creative':
          if (identity.metadata?.contentStats) {
            const stats = identity.metadata.contentStats
            value += (stats.articles + stats.videos) / 10
          }
          break
      }
      
      return Math.min(100, Math.max(20, value))
    },
    
    // 计算节点大小
    calculateSymbolSize(identity) {
      let size = 15 // 基础大小
      
      if (identity.isDefault) size += 10
      if (identity.isActive) size += 5
      
      // 根据类型调整
      switch (identity.type) {
        case 'professional':
          if (identity.metadata?.experience) size += identity.metadata.experience
          break
        case 'life':
          if (identity.metadata?.children) size += identity.metadata.children.length * 3
          break
        case 'social':
          if (identity.metadata?.interests) size += identity.metadata.interests.length * 2
          break
      }
      
      return Math.min(30, Math.max(12, size))
    },
    
    // 添加相关人物
    addRelatedPeople(nodes, identity) {
      if (!identity.metadata) return
      
      switch (identity.type) {
        case 'professional':

          
          // 添加组织节点
          if (identity.metadata.organizations) {
            identity.metadata.organizations.forEach((org, orgIndex) => {
              // 添加组织节点
              nodes.push({
                id: org.id,
                name: org.name,
                category: this.getCategoryIndex(identity.type),
                value: Math.round(org.strength * 100),
                symbolSize: 18 + Math.round(org.strength * 8),
                itemStyle: { color: this.getCategoryColor(identity.type) },
                metadata: {
                  role: org.role,
                  relationship: org.relationship,
                  startDate: org.startDate,
                  focus: org.focus,
                  equity: org.equity,
                  teamSize: org.teamSize,
                  contract: org.contract
                }
              })
              
              // 添加组织内联系人节点
              if (org.contacts) {
                org.contacts.forEach((contact, contactIndex) => {
                  nodes.push({
                    id: contact.id,
                    name: contact.name,
                    category: this.getCategoryIndex(identity.type),
                    value: Math.round(contact.strength * 100),
                    symbolSize: 10 + Math.round(contact.strength * 8),
                    itemStyle: { color: this.getCategoryColor(identity.type) },
                    metadata: {
                      role: contact.role,
                      position: contact.position,
                      relationship: contact.relationship,
                      skills: contact.skills,
                      projects: contact.projects,
                      investment: contact.investment,
                      focus: contact.focus,
                      project: contact.project
                    }
                  })
                })
              }
            })
          }
          
          // 添加客户节点
          if (identity.metadata.clients) {
            identity.metadata.clients.forEach((client, index) => {
              nodes.push({
                id: client.id,
                name: client.name,
                category: this.getCategoryIndex('client'),
                value: Math.round(client.strength * 100),
                symbolSize: 10 + Math.round(client.strength * 8),
                itemStyle: { color: '#FF6B35' }, // 客户用橙色
                metadata: {
                  contact: client.contact,
                  project: client.project,
                  relationship: client.relationship,
                  value: client.value
                }
              })
            })
          }
          
          // 添加合作伙伴节点
          if (identity.metadata.partners) {
            identity.metadata.partners.forEach((partner, index) => {
              nodes.push({
                id: partner.id,
                name: partner.name,
                category: this.getCategoryIndex('partner'),
                value: Math.round(partner.strength * 100),
                symbolSize: 10 + Math.round(partner.strength * 8),
                itemStyle: { color: '#4ECDC4' }, // 合作伙伴用青色
                metadata: {
                  contact: partner.contact,
                  project: partner.project,
                  relationship: partner.relationship,
                  value: partner.value
                }
              })
            })
          }
          break
          
        case 'life':
          if (identity.metadata.children) {
            identity.metadata.children.forEach((child, index) => {
              nodes.push({
                id: `${identity.id}_child_${index}`,
                name: child.name,
                category: this.getCategoryIndex(identity.type),
                value: 40 + child.age * 2,
                symbolSize: 10 + child.age,
                itemStyle: { color: this.getCategoryColor(identity.type) }
              })
            })
          }
          break
          
        case 'social':
          if (identity.metadata.interests) {
            identity.metadata.interests.forEach((interest, index) => {
              nodes.push({
                id: `${identity.id}_interest_${index}`,
                name: interest,
                category: this.getCategoryIndex(identity.type),
                value: 25 + index * 3,
                symbolSize: 6 + index,
                itemStyle: { color: this.getCategoryColor(identity.type) }
              })
            })
          }
          break
      }
    },
    
    // 添加跨身份连接
    addCrossIdentityLinks(links, identityRoles) {
      // 工作与社交的交叉
      const workIdentity = identityRoles.find(id => id.type === 'professional')
      const socialIdentity = identityRoles.find(id => id.type === 'social')
      
      // 生活与社交的交叉
      const lifeIdentity = identityRoles.find(id => id.type === 'life')
      if (lifeIdentity && socialIdentity) {
        links.push({
          source: lifeIdentity.id,
          target: socialIdentity.id,
          value: 0.5,
          lineStyle: { color: '#FF9500' }
        })
      }
    },
    
    // 添加兴趣连接
    addInterestLinks(links, identityRoles) {
      const socialIdentity = identityRoles.find(id => id.type === 'social')
      if (!socialIdentity || !socialIdentity.metadata?.interests) return
      
      identityRoles.forEach(identity => {
        if (identity.type !== 'social' && identity.metadata) {
          let commonInterests = []
          
          switch (identity.type) {
            case 'professional':
              if (identity.metadata.skills) {
                commonInterests = identity.metadata.skills.filter(skill => 
                  socialIdentity.metadata.interests.includes(skill)
                )
              }
              break
            case 'creative':
              if (identity.metadata.specialties) {
                commonInterests = identity.metadata.specialties.filter(specialty => 
                  socialIdentity.metadata.interests.includes(specialty)
                )
              }
              break
          }
          
          if (commonInterests.length > 0) {
            links.push({
              source: identity.id,
              target: socialIdentity.id,
              value: Math.min(0.6, commonInterests.length * 0.2),
              lineStyle: { 
                width: 1,
                type: 'dashed',
                color: '#FF9500'
              }
            })
          }
        }
      })
    },
    
    // 添加工作身份的特殊连接
    addWorkIdentityLinks(links, identityRoles) {
      const workIdentity = identityRoles.find(id => id.type === 'professional')
      if (!workIdentity || !workIdentity.metadata) return
      
      // 添加与组织的连接
      if (workIdentity.metadata.organizations) {
        workIdentity.metadata.organizations.forEach(org => {
          links.push({
            source: 'work_identity',
            target: org.id,
            value: org.strength,
            lineStyle: { 
              width: Math.round(org.strength * 4),
              color: '#34C759'
            },
            relationType: '组织身份',
            relationDesc: `在${org.name}担任${org.role}`
          })
          
          // 添加组织内联系人的连接
          if (org.contacts) {
            org.contacts.forEach(contact => {
              links.push({
                source: org.id,
                target: contact.id,
                value: contact.strength,
                lineStyle: { 
                  width: Math.round(contact.strength * 2),
                  color: '#34C759'
                },
                relationType: '组织内部关系',
                relationDesc: `${contact.relationship}：${contact.role}`
              })
            })
          }
        })
      }
      
      // 添加与客户的连接
      if (workIdentity.metadata.clients) {
        workIdentity.metadata.clients.forEach(client => {
          links.push({
            source: 'work_identity',
            target: client.id,
            value: client.strength,
            lineStyle: { 
              width: Math.round(client.strength * 3),
              color: '#FF6B35'
            },
            relationType: '客户关系',
            relationDesc: `为${client.name}提供${client.role}服务`
          })
        })
      }
      
      // 添加与合作伙伴的连接
      if (workIdentity.metadata.partners) {
        workIdentity.metadata.partners.forEach(partner => {
          links.push({
            source: 'work_identity',
            target: partner.id,
            value: partner.strength,
            lineStyle: { 
              width: Math.round(partner.strength * 3),
              color: '#4ECDC4'
            },
            relationType: '合作伙伴',
            relationDesc: `与${partner.name}的${partner.role}合作`
          })
        })
      }
      

    },
    
    // 获取图表分类
    getGraphCategories() {
      return [
        { name: '核心身份' },
        { name: '工作身份' },
        { name: '生活身份' },
        { name: '社交身份' },
        { name: '客户' },
        { name: '合作伙伴' }
      ]
    },
    
    // 获取分类索引（确保与getGraphCategories返回的数组索引一致）
    getCategoryIndex(type) {
      const categoryMap = {
        'real': 0,        // 核心身份
        'professional': 1, // 工作身份
        'life': 2,        // 生活身份
        'social': 3,      // 社交身份
        'client': 4,      // 客户
        'partner': 5      // 合作伙伴
      }
      return categoryMap[type] || 0
    }
  },
  computed: {
    identityGraphOptionV2() {
      const nodes = this.getGraphNodes()
      const links = this.getGraphLinks()
      const categories = this.getGraphCategories()
      

      
      // 为节点添加标签显示条件
      nodes.forEach(function (node) {
        node.label = {
          show: true
        };
      });
      
      return {
        tooltip: {
          trigger: 'item',
          confine: true,
          enterable: true,
          hideDelay: 200,
          showDelay: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderColor: '#e0e0e0',
          borderWidth: 1,
          textStyle: {
            color: '#333',
            fontSize: 12
          },
          extraCssText: 'width: 200px !important; max-width: 200px !important; white-space: pre-wrap !important; word-wrap: break-word !important;',
          formatter: (params) => {
            if (params.dataType === 'node') {
              return params.name
            } else if (params.dataType === 'edge') {
              // 显示连接线的关系信息
              const link = params.data
              let relationInfo = `${link.source} → ${link.target}\n`
              relationInfo += `强度: ${Math.round(link.value * 100)}%\n`
              
              if (link.relationType) {
                relationInfo += `类型: ${link.relationType}\n`
              }
              if (link.relationDesc) {
                relationInfo += `${link.relationDesc}\n`
              }
              
              // 添加更多详细信息
              if (link.source === 'work_identity') {
                if (link.target.startsWith('company_')) {
                  relationInfo += `\n组织详情:\n`
                  relationInfo += `• 身份: 主要工作身份\n`
                  relationInfo += `• 参与度: 高\n`
                  relationInfo += `• 时间投入: 主要精力\n`
                } else if (link.target.startsWith('client_')) {
                  relationInfo += `\n客户详情:\n`
                  relationInfo += `• 服务类型: 专业顾问\n`
                  relationInfo += `• 合作模式: 项目制\n`
                  relationInfo += `• 价值贡献: 技术指导\n`
                } else if (link.target.startsWith('partner_')) {
                  relationInfo += `\n合作详情:\n`
                  relationInfo += `• 合作领域: 技术合作\n`
                  relationInfo += `• 合作模式: 战略联盟\n`
                  relationInfo += `• 互惠价值: 资源共享\n`
                }
              } else if (link.source.startsWith('company_')) {
                relationInfo += `\n内部关系:\n`
                relationInfo += `• 工作性质: 直接合作\n`
                relationInfo += `• 沟通频率: 日常\n`
                relationInfo += `• 项目协作: 紧密\n`
              } else if (link.source === 'me') {
                relationInfo += `\n核心连接:\n`
                relationInfo += `• 身份重要性: 核心\n`
                relationInfo += `• 影响范围: 全局\n`
                relationInfo += `• 决策权重: 高\n`
              }
              
              return relationInfo
            }
            return params.name
          }
        },
        series: [
          {
            name: '立体身份图谱',
            type: 'graph',
            layout: 'circular',
            circular: {
              rotateLabel: true,
              center: ['50%', '50%'],
              radius: '60%'
            },
            data: nodes,
            links: links,
            categories: categories,
            roam: true,
            label: {
              position: 'right',
              formatter: '{b}',
              fontSize: 12,
              color: '#333',
              show: true
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3,
              width: 2,
              opacity: 0.6
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#fff'
            },
            emphasis: {
              focus: 'adjacency',
              scale: 1.2,
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                borderWidth: 2,
                borderColor: '#fff'
              },
              lineStyle: {
                width: 3,
                shadowBlur: 5,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            }
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.identity-graph-content {
  width: 100%;
  height: 100%;
}

.identity-graph {
  width: 100%;
  height: 100%;
}

/* 自定义 tooltip 样式 */
:deep(.echarts-tooltip) {
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  padding: 12px 16px !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
  width: 200px !important;
  max-width: 200px !important;
  min-width: 200px !important;
  max-height: 300px !important;
  overflow-y: auto !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  scrollbar-width: thin !important;
  scrollbar-color: #c0c0c0 transparent !important;
  display: block !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
}

:deep(.echarts-tooltip::-webkit-scrollbar) {
  width: 6px !important;
}

:deep(.echarts-tooltip::-webkit-scrollbar-track) {
  background: transparent !important;
}

:deep(.echarts-tooltip::-webkit-scrollbar-thumb) {
  background: #c0c0c0 !important;
  border-radius: 3px !important;
}

:deep(.echarts-tooltip .tooltip-item) {
  margin-bottom: 4px !important;
}

/* 强制限制tooltip宽度 */
:deep(.echarts-tooltip) {
  width: 200px !important;
  max-width: 200px !important;
  min-width: 200px !important;
  flex-basis: 200px !important;
}

/* 确保内容不会撑开tooltip */
:deep(.echarts-tooltip *) {
  max-width: 100% !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
}
</style> 