<template>
  <div class="identity-graph-card">
    <!-- 立体身份图谱 -->
    <div class="card">
      <div class="card-header">
        <h2>立体身份图谱</h2>
        <span class="card-subtitle">您的多重身份与关系网络</span>
      </div>
      
      <div class="identity-section">
        
        <!-- 图表控制面板 -->
        <div class="graph-controls">
          <div class="control-group">
            <label class="control-label">显示选项:</label>
            <div class="control-buttons">
              <button 
                class="control-btn" 
                :class="{ active: showInterestConnections }"
                @click="toggleInterestConnections"
              >
                <Users />
                兴趣连接
              </button>
              <button 
                class="control-btn" 
                :class="{ active: showCrossConnections }"
                @click="toggleCrossConnections"
              >
                <Link />
                跨身份连接
              </button>
              <button 
                class="control-btn" 
                :class="{ active: showLabels }"
                @click="toggleLabels"
              >
                <Type />
                显示标签
              </button>
            </div>
          </div>
        </div>
        
        <!-- ECharts关系网图表 -->
        <div class="identity-graph-container">
          <v-chart 
            ref="identityChart"
            class="identity-graph" 
            :option="identityGraphOption" 
            :autoresize="true"
            @click="onGraphClick"
            @mouseover="onGraphMouseOver"
            @mouseout="onGraphMouseOut"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Users, Link, Type } from 'lucide-vue-next'
import userProfileData from '@/data/userProfile.json'
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
  name: 'IdentityGraphCard',
  components: {
    VChart,
    Users,
    Link,
    Type
  },
  data() {
    return {
      userData: userProfileData,
      showInterestConnections: true,
      showCrossConnections: true,
      showLabels: true,
    }
  },
  methods: {
    onGraphClick(params) {
      console.log('图表点击:', params)
      if (params.dataType === 'node') {
        const node = params.data
        if (node.id === 'work' || node.id === 'family' || node.id === 'social') {
          this.showIdentityDetails(node.id)
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
        // 家庭身份节点
        {
          id: 'family',
          name: '家庭身份',
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
        { source: 'me', target: 'family', value: 0.9, lineStyle: { width: 3, color: '#007AFF' } },
        { source: 'me', target: 'social', value: 0.8, lineStyle: { width: 2, color: '#007AFF' } },
        
        // 工作身份关系
        { source: 'work', target: 'colleague1', value: 0.7, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'colleague2', value: 0.6, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'boss', value: 0.8, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'mentor', value: 0.9, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'client1', value: 0.5, lineStyle: { color: '#34C759' } },
        { source: 'work', target: 'client2', value: 0.4, lineStyle: { color: '#34C759' } },
        
        // 家庭身份关系
        { source: 'family', target: 'spouse', value: 0.9, lineStyle: { color: '#FF9500' } },
        { source: 'family', target: 'child', value: 0.8, lineStyle: { color: '#FF9500' } },
        { source: 'family', target: 'parent', value: 0.7, lineStyle: { color: '#FF9500' } },
        { source: 'family', target: 'sibling', value: 0.6, lineStyle: { color: '#FF9500' } },
        { source: 'family', target: 'inlaw', value: 0.5, lineStyle: { color: '#FF9500' } },
        
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
          
          // 跨身份关系 - 家庭与社交
          { source: 'spouse', target: 'friend1', value: 0.5, lineStyle: { color: '#FF9500' } },
          { source: 'child', target: 'neighbor', value: 0.3, lineStyle: { color: '#FF9500' } },
          
          // 跨身份关系 - 工作与家庭
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
    
    updateGraphDisplay() {
      // 更新图表显示
      this.$nextTick(() => {
        const chart = this.$refs.identityChart
        if (chart) {
          chart.setOption(this.identityGraphOption)
        }
      })
    }
  },
  computed: {
    identityGraphOption() {
      return {
        title: {
          text: '',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E5E5EA',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          trigger: 'item',
          enterable: true,
          confine: true,
          hideDelay: 100,
          showDelay: 0,
          formatter: (params) => {
            if (params.dataType === 'edge') {
              // 如果是连接线，显示共同兴趣信息
              const link = params.data
              if (link.lineStyle && link.lineStyle.type === 'dashed') {
                const sourcePerson = this.findPersonById(link.source)
                const targetPerson = this.findPersonById(link.target)
                
                if (sourcePerson && targetPerson && sourcePerson.interests && targetPerson.interests) {
                  const commonInterests = sourcePerson.interests.filter(interest => 
                    targetPerson.interests.includes(interest)
                  )
                  
                  if (commonInterests.length > 0) {
                    return `
                      <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
                        <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1D1D1F;">共同兴趣连接</div>
                        <div style="margin-bottom: 8px;">
                          <div style="font-size: 13px; color: #666; margin-bottom: 4px;">${sourcePerson.name} ↔ ${targetPerson.name}</div>
                          <div style="font-size: 12px; color: #8E8E93;">${sourcePerson.type} · ${sourcePerson.role} ↔ ${targetPerson.type} · ${targetPerson.role}</div>
                        </div>
                        <div style="background: #F2F2F7; padding: 8px; border-radius: 6px;">
                          <div style="font-size: 12px; color: #FF9500; font-weight: 600; margin-bottom: 4px;">共同兴趣:</div>
                          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                            ${commonInterests.map(interest => `
                              <span style="background: #FF9500; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px;">${interest}</span>
                            `).join('')}
                          </div>
                        </div>
                        <div style="margin-top: 8px; text-align: center;">
                          <div style="font-weight: 700; color: #FF9500; font-size: 14px;">连接强度: ${Math.round(link.value * 100)}%</div>
                        </div>
                      </div>
                    `
                  }
                }
              }
              return ''
            } else if (params.dataType === 'node') {
              const node = params.data
              let tooltipContent = `
                <div style="padding: 16px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
                  <div style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #1D1D1F;">${node.name}</div>
              `
              
              // 如果是身份节点，显示相关人物列表
              if (node.id === 'work' || node.id === 'family' || node.id === 'social') {
                const identity = this.userData.identities.find(id => id.id === node.id)
                if (identity) {
                  tooltipContent += `
                    <div style="margin-bottom: 12px;">
                      <div style="font-weight: 600; color: #666; margin-bottom: 8px; font-size: 14px;">相关人物 (${identity.relationships.length}人)</div>
                      <div style="max-height: 240px; overflow-y: auto; background: #F2F2F7; border-radius: 8px; padding: 8px;">
                  `
                  
                  identity.relationships.forEach((rel, index) => {
                    const strengthPercent = Math.round(rel.strength * 100)
                    const strengthColor = rel.strength >= 0.8 ? '#34C759' : 
                                       rel.strength >= 0.6 ? '#FF9500' : 
                                       rel.strength >= 0.4 ? '#FF3B30' : '#8E8E93'
                    
                    // 获取共同兴趣信息
                    const commonInterests = this.getCommonInterests(rel.id, identity.id)
                    const hasCommonInterests = commonInterests.length > 0
                    
                    tooltipContent += `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 6px; margin-bottom: ${index < identity.relationships.length - 1 ? '6px' : '0'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #1D1D1F; font-size: 14px;">${rel.name}</div>
                          <div style="font-size: 12px; color: #666; margin-top: 2px;">${rel.type} · ${rel.role}</div>
                          ${hasCommonInterests ? `<div style="font-size: 11px; color: #FF9500; margin-top: 2px;">共同兴趣: ${commonInterests.join(', ')}</div>` : ''}
                        </div>
                        <div style="text-align: right; margin-left: 12px;">
                          <div style="font-weight: 700; color: ${strengthColor}; font-size: 16px;">${strengthPercent}%</div>
                          <div style="font-size: 11px; color: #8E8E93;">交集度</div>
                        </div>
                      </div>
                    `
                  })
                  
                  tooltipContent += `
                      </div>
                    </div>
                  `
                }
              } else {
                // 如果是人物节点，显示详细信息和兴趣爱好
                const person = this.findPersonById(node.id)
                if (person) {
                  tooltipContent += `
                    <div style="margin-bottom: 12px;">
                      <div style="font-weight: 600; color: #666; margin-bottom: 8px; font-size: 14px;">个人信息</div>
                      <div style="background: #F2F2F7; padding: 12px; border-radius: 8px;">
                        <div style="margin-bottom: 8px;">
                          <div style="font-size: 13px; color: #666;">关系强度: ${Math.round(node.value)}</div>
                          <div style="font-size: 13px; color: #666;">身份: ${person.type} · ${person.role}</div>
                        </div>
                        ${person.interests && person.interests.length > 0 ? `
                          <div style="margin-top: 8px;">
                            <div style="font-size: 12px; color: #FF9500; font-weight: 600; margin-bottom: 4px;">兴趣爱好:</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                              ${person.interests.map(interest => `
                                <span style="background: #FF9500; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px;">${interest}</span>
                              `).join('')}
                            </div>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `
                  
                  // 显示基于共同兴趣的连接
                  const interestConnections = this.getInterestConnections(node.id)
                  if (interestConnections.length > 0) {
                    tooltipContent += `
                      <div style="margin-bottom: 12px;">
                        <div style="font-weight: 600; color: #666; margin-bottom: 8px; font-size: 14px;">共同兴趣连接</div>
                        <div style="max-height: 200px; overflow-y: auto; background: #F2F2F7; border-radius: 8px; padding: 8px;">
                    `
                    
                    interestConnections.forEach((connection, index) => {
                      tooltipContent += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 6px; margin-bottom: ${index < interestConnections.length - 1 ? '6px' : '0'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                          <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1D1D1F; font-size: 14px;">${connection.targetName}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 2px;">${connection.targetType} · ${connection.targetRole}</div>
                            <div style="font-size: 11px; color: #FF9500; margin-top: 4px;">共同兴趣: ${connection.commonInterests.join(', ')}</div>
                          </div>
                          <div style="text-align: right; margin-left: 12px;">
                            <div style="font-weight: 700; color: #FF9500; font-size: 16px;">${Math.round(connection.strength * 100)}%</div>
                            <div style="font-size: 11px; color: #8E8E93;">连接度</div>
                          </div>
                        </div>
                      `
                    })
                    
                    tooltipContent += `
                        </div>
                      </div>
                    `
                  }
                }
              }
              
              tooltipContent += `
                </div>
              `
              return tooltipContent
            }
            return params.data.name
          }
        },
        legend: {
          data: [
            { name: '核心身份', itemStyle: { color: '#007AFF' } },
            { name: '工作身份', itemStyle: { color: '#34C759' } },
            { name: '家庭身份', itemStyle: { color: '#FF9500' } },
            { name: '社交身份', itemStyle: { color: '#AF52DE' } }
          ],
          left: 10,
          top: 'middle',
          orient: 'vertical',
          textStyle: {
            fontSize: 12
          }
        },
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            name: '身份关系',
            type: 'graph',
            layout: 'force',
            data: this.getGraphNodes(),
            links: this.getGraphLinks(),
            categories: [
              { name: '核心身份' },
              { name: '工作身份' },
              { name: '家庭身份' },
              { name: '社交身份' }
            ],
            roam: true,
            label: {
              show: this.showLabels,
              position: 'right',
              formatter: '{b}',
              fontSize: 12,
              color: '#333'
            },
            force: {
              repulsion: 200,
              edgeLength: 120,
              gravity: 0.05,
              layoutAnimation: true
            },
            emphasis: {
              focus: 'adjacency',
              scale: true,
              itemStyle: {
                shadowBlur: 15,
                shadowColor: 'rgba(0, 0, 0, 0.4)',
                borderWidth: 3,
                borderColor: '#fff'
              },
              lineStyle: {
                width: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            lineStyle: {
              curveness: 0.3
            }
          }
        ]
      }
    }
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

.identity-graph-card {
  background-color: #f2f2f7;
  color: #000;
  line-height: 1.5;
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
}

.card-header h2 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}

.card-subtitle {
  font-size: 13px;
  color: #8E8E93;
}

/* 身份图谱 */
.identity-section {
  padding: 16px;
}

.identity-graph-container {
  height: 600px;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.identity-graph {
  width: 100%;
  height: 100%;
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
</style> 