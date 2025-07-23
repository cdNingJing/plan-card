<template>
  <div class="identity-graph-content">
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
</template>

<script>

import { identityGraphData, getGraphLinks } from '@/data/identityGraphData.js'
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
    VChart
  },

  data() {
    return {
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
        if (node.id === 'work' || node.id === 'life' || node.id === 'social') {
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
      return identityGraphData.nodes
    },
    
    getGraphLinks() {
      return getGraphLinks(this.showCrossConnections, this.showInterestConnections)
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
              // 如果是连接线，显示连接信息
              const link = params.data
              const sourceNode = this.getGraphNodes().find(n => n.id === link.source)
              const targetNode = this.getGraphNodes().find(n => n.id === link.target)
              
              if (sourceNode && targetNode) {
                return `
                  <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1D1D1F;">关系连接</div>
                    <div style="margin-bottom: 8px;">
                      <div style="font-size: 13px; color: #666; margin-bottom: 4px;">${sourceNode.name} ↔ ${targetNode.name}</div>
                      <div style="font-size: 12px; color: #8E8E93;">连接强度: ${Math.round(link.value * 100)}%</div>
                    </div>
                  </div>
                `
              }
              return ''
            } else if (params.dataType === 'node') {
              const node = params.data
              let tooltipContent = `
                <div style="padding: 16px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
                  <div style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #1D1D1F;">${node.name}</div>
              `
              
              // 显示基本信息
              tooltipContent += `
                <div style="margin-bottom: 12px;">
                  <div style="font-weight: 600; color: #666; margin-bottom: 8px; font-size: 14px;">节点信息</div>
                  <div style="background: #F2F2F7; padding: 12px; border-radius: 8px;">
                    <div style="margin-bottom: 8px;">
                      <div style="font-size: 13px; color: #666;">关系强度: ${Math.round(node.value)}</div>
                      <div style="font-size: 13px; color: #666;">分类: ${identityGraphData.categories[node.category].name}</div>
                    </div>
                  </div>
                </div>
              `
              
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
            { name: '生活身份', itemStyle: { color: '#FF9500' } },
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
            categories: identityGraphData.categories,
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
.identity-graph-content {
  width: 100%;
  height: 100%;
}

.identity-graph {
  width: 100%;
  height: 100%;
}
</style> 