<template>
  <div class="organ-diagram-card">
    <div class="card-header">
      <h2>健康体检报告可视化</h2>
      <span class="card-subtitle">基于最新体检数据的器官健康状态分析</span>
    </div>
    
    
    <div class="chart-container">
      <div class="scroll-container">
        <div ref="chartRef" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'OrganDiagramCard',
  data() {
    return {
      chart: null,
      option: null,
      popupTimer: null,
      hidePopupTimer: null,
      currentHoveredOrgan: null,
      currentDisplayedOrgan: null,
      // 健康数据 - 基于体检报告
      healthData: {
        'heart': { 
          name: '心脏', 
          value: 85, 
          status: 'normal',
          details: '心率正常，血压偏高，建议控制盐分摄入',
          risk: 'medium',
          lastCheck: '2024-01-15'
        },
        'large-intestine': { 
          name: '大肠', 
          value: 92, 
          status: 'excellent',
          details: '肠道功能良好，菌群平衡',
          risk: 'low',
          lastCheck: '2024-01-15'
        },
        'small-intestine': { 
          name: '小肠', 
          value: 78, 
          status: 'normal',
          details: '吸收功能正常，但消化效率有待提升',
          risk: 'medium',
          lastCheck: '2024-01-15'
        },
        'spleen': { 
          name: '脾脏', 
          value: 95, 
          status: 'excellent',
          details: '免疫功能强，血细胞生成正常',
          risk: 'low',
          lastCheck: '2024-01-15'
        },
        'kidney': { 
          name: '肾脏', 
          value: 88, 
          status: 'good',
          details: '肾功能正常，但尿酸偏高，建议多喝水',
          risk: 'medium',
          lastCheck: '2024-01-15'
        },
        'lung': { 
          name: '肺部', 
          value: 82, 
          status: 'normal',
          details: '肺活量正常，但存在轻微炎症',
          risk: 'medium',
          lastCheck: '2024-01-15'
        },
        'liver': { 
          name: '肝脏', 
          value: 75, 
          status: 'warning',
          details: '肝功能轻度异常，脂肪肝倾向，建议戒酒',
          risk: 'high',
          lastCheck: '2024-01-15'
        }
      }
    }
  },
  mounted() {
    this.initChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    // 根据健康指数计算颜色渐变
    getHealthColor(value) {
      if (value >= 90) return '#52c41a' // 优秀 - 绿色
      if (value >= 80) return '#1890ff' // 良好 - 蓝色
      if (value >= 70) return '#faad14' // 正常 - 黄色
      if (value >= 60) return '#fa541c' // 警告 - 橙色
      return '#f5222d' // 危险 - 红色
    },
    
    // 根据状态获取文本描述
    getStatusText(status) {
      const statusText = {
        'excellent': '状态优秀',
        'good': '状态良好',
        'normal': '状态正常',
        'warning': '状态警告',
        'danger': '状态危险'
      }
      return statusText[status] || '状态未知'
    },
    
    initChart() {
      if (this.chart) {
        this.chart.dispose()
      }
      
      this.chart = echarts.init(this.$refs.chartRef)
      
      // 直接使用原始代码
      const ROOT_PATH = '/echarts-svg'
      
      // 使用fetch获取SVG文件，处理CORS问题
      fetch(ROOT_PATH + '/data/asset/geo/Veins_Medical_Diagram_clip_art.svg')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.text()
        })
        .then(svg => {
          console.log('成功获取远程SVG文件')
          echarts.registerMap('organ_diagram', { svg: svg })
          this.setupChart()
        })
        .catch(error => {
          console.log('无法获取远程SVG文件:', error.message)
          // 如果获取失败，显示错误信息
          this.showError('无法加载器官图表，请检查网络连接')
        })
      
      window.addEventListener('resize', this.handleResize)
    },
    
    setupChart() {
      // 准备数据
      const organNames = ['heart', 'large-intestine', 'small-intestine', 'spleen', 'kidney', 'lung', 'liver']
      const healthValues = organNames.map(organ => this.healthData[organ].value)
      const healthColors = organNames.map(organ => this.getHealthColor(this.healthData[organ].value))
      
      this.option = {
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          hideDelay: 0,
          enterable: true,
          confine: true,
          formatter: (params) => {
            if (params.componentType === 'geo') {
              const organ = this.healthData[params.name]
              if (organ) {
                const statusText = {
                  'excellent': '优秀',
                  'good': '良好', 
                  'normal': '正常',
                  'warning': '警告',
                  'danger': '危险'
                }
                const riskText = {
                  'low': '低风险',
                  'medium': '中风险',
                  'high': '高风险'
                }
                return `<div style="padding: 12px; max-width: 300px;">
                  <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #333;">${organ.name}</div>
                  <div style="color: #666; margin-bottom: 6px;">健康指数: <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold;">${organ.value}</span></div>
                  <div style="color: #666; margin-bottom: 6px;">状态: <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold;">${statusText[organ.status]}</span></div>
                  <div style="color: #666; margin-bottom: 6px;">风险等级: <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold;">${riskText[organ.risk]}</span></div>
                  <div style="color: #999; margin-bottom: 8px; font-size: 12px;">${organ.details}</div>
                  <div style="color: #999; font-size: 11px;">最后检查: ${organ.lastCheck}</div>
                </div>`
              }
            }
            // 如果是柱状图的数据
            if (params.componentType === 'series' && params.seriesType === 'bar') {
              const organNames = ['heart', 'large-intestine', 'small-intestine', 'spleen', 'kidney', 'lung', 'liver']
              const organKey = organNames[params.dataIndex]
              const organ = this.healthData[organKey]
              if (organ) {
                const statusText = {
                  'excellent': '优秀',
                  'good': '良好', 
                  'normal': '正常',
                  'warning': '警告',
                  'danger': '危险'
                }
                const riskText = {
                  'low': '低风险',
                  'medium': '中风险',
                  'high': '高风险'
                }
                
                // 计算距离健康目标的分数
                const targetDistance = organ.value < 80 ? (80 - organ.value) : 0
                const isHighRisk = organ.risk === 'high'
                
                return `<div style="padding: 16px; max-width: 350px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                  <!-- 标题 -->
                  <div style="font-weight: bold; margin-bottom: 12px; font-size: 16px; color: #333; border-bottom: 2px solid ${this.getHealthColor(organ.value)}; padding-bottom: 8px;">
                    ${organ.name}健康报告
                  </div>
                  
                  <!-- 健康指数 -->
                  <div style="margin-bottom: 12px;">
                    <div style="color: #666; margin-bottom: 6px; font-size: 14px;">健康指数: <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold; font-size: 18px;">${organ.value}</span>/100</div>
                    
                    <!-- 进度条 -->
                    <div style="height: 8px; background-color: #e0e0e0; border-radius: 4px; position: relative; margin: 8px 0;">
                      <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${organ.value}%; background-color: ${this.getHealthColor(organ.value)}; border-radius: 4px;"></div>
                      <div style="position: absolute; top: 0; left: 80%; width: 2px; height: 100%; background-color: #52c41a; border-radius: 1px;"></div>
                    </div>
                    
                    <!-- 距离目标 -->
                    ${targetDistance > 0 ? `<div style="color: #52c41a; font-size: 12px; margin-top: 4px;">距离健康目标: ${targetDistance}分</div>` : ''}
                  </div>
                  
                  <!-- 状态信息 -->
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <div style="color: #666; font-size: 13px;">状态: <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold;">${statusText[organ.status]}</span></div>
                    <div style="color: #666; font-size: 13px;">风险: <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold;">${riskText[organ.risk]}</span></div>
                  </div>
                  
                  <!-- 详细分析 -->
                  <div style="color: #666; margin-bottom: 12px; font-size: 13px; line-height: 1.4; background-color: rgba(0,0,0,0.03); padding: 8px; border-radius: 4px;">
                    ${organ.details}
                  </div>
                  
                  <!-- 高风险警告 -->
                  ${isHighRisk ? `<div style="background-color: rgba(245, 34, 45, 0.1); border: 1px solid #f5222d; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
                    <div style="color: #f5222d; font-weight: bold; font-size: 13px;">⚠️ 需要重点关注</div>
                  </div>` : ''}
                  
                  <!-- 健康目标说明 -->
                  <div style="color: #52c41a; font-size: 12px; margin-bottom: 8px;">
                    🎯 健康目标: 80分以上
                  </div>
                  
                  <!-- 最后检查时间 -->
                  <div style="color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 8px;">
                    最后检查: ${organ.lastCheck}
                  </div>
                </div>`
              }
            }
            return `<div style="padding: 8px;">${params.name || '未知器官'}</div>`
          }
        },
        geo: {
          left: 10,
          right: '50%',
          map: 'organ_diagram',
          selectedMode: 'multiple',
          emphasis: {
            focus: 'self',
            itemStyle: {
              color: null
            },
            label: {
              position: 'bottom',
              distance: 0,
              textBorderColor: '#fff',
              textBorderWidth: 2
            }
          },
          blur: {},
          select: {
            itemStyle: {
              color: '#b50205'
            },
            label: {
              show: false,
              textBorderColor: '#fff',
              textBorderWidth: 2
            }
          }
        },
        grid: {
          left: '60%',
          top: '20%',
          bottom: '20%'
        },
        xAxis: {
          name: '健康指数',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            color: '#666'
          },
          max: 100,
          min: 0
        },
        yAxis: {
          data: organNames.map(organ => this.healthData[organ].name),
          axisLabel: {
            color: '#666',
            fontSize: 12
          }
        },
        series: [
          {
            type: 'bar',
            emphasis: {
              focus: 'self'
            },
            data: healthValues.map((value, index) => ({
              value: value,
              itemStyle: {
                color: healthColors[index]
              }
            }))
          }
        ]
      }
      
      this.chart.setOption(this.option)
      
      // 右侧柱状图的hover效果 - 与左侧器官图表联动
      this.chart.on('mouseover', { seriesIndex: 0 }, (event) => {
        // 防止重复触发
        if (this.currentHoveredOrgan === event.name) {
          return
        }
        
        console.log('Hover器官(右侧):', event.name)
        this.currentHoveredOrgan = event.name
        
        this.chart.dispatchAction({
          type: 'highlight',
          geoIndex: 0,
          name: event.name
        })
      })
      
      this.chart.on('mouseout', { seriesIndex: 0 }, (event) => {
        console.log('Mouseout器官(右侧):', event.name)
        this.currentHoveredOrgan = null
        
        this.chart.dispatchAction({
          type: 'downplay',
          geoIndex: 0,
          name: event.name
        })
      })
      
      // 左侧器官图表的hover效果
      this.chart.on('mouseover', { geoIndex: 0 }, (params) => {
        // 防止重复触发
        if (this.currentHoveredOrgan === params.name) {
          return
        }
        
        console.log('Hover器官(左侧):', params.name, params)
        this.currentHoveredOrgan = params.name
        
          const organ = this.healthData[params.name]
          if (organ) {
            this.showOrganDetails(organ)
        } else {
          // 尝试其他可能的器官名称匹配
          const organKey = this.findOrganKey(params.name)
          if (organKey) {
            const organ = this.healthData[organKey]
            if (organ) {
              this.showOrganDetails(organ)
            }
          }
        }
      })
      
      // 左侧器官图表的mouseout效果
      this.chart.on('mouseout', { geoIndex: 0 }, (params) => {
        console.log('Mouseout器官(左侧):', params.name)
        this.currentHoveredOrgan = null
        this.currentDisplayedOrgan = null
        
        // 清除定时器
        if (this.popupTimer) {
          clearTimeout(this.popupTimer)
          this.popupTimer = null
        }
        
        // 延迟移除弹出层，给用户一些时间查看
        this.hidePopupTimer = setTimeout(() => {
          const existingPopup = document.querySelector('.organ-popup')
          if (existingPopup && !existingPopup.matches(':hover')) {
            existingPopup.remove()
          }
        }, 500)
      })
    },
    
    showError(message) {
      // 显示错误信息
      console.error(message)
      // 可以在界面上显示错误信息，这里暂时用console输出
    },
    
    // 查找器官键名
    findOrganKey(name) {
      // 器官名称映射表
      const organMapping = {
        'heart': ['heart', '心脏', '心'],
        'lung': ['lung', 'lungs', '肺部', '肺'],
        'liver': ['liver', '肝脏', '肝'],
        'kidney': ['kidney', 'kidneys', '肾脏', '肾'],
        'spleen': ['spleen', '脾脏', '脾'],
        'small-intestine': ['small-intestine', 'small_intestine', '小肠'],
        'large-intestine': ['large-intestine', 'large_intestine', '大肠']
      }
      
      // 遍历映射表查找匹配
      for (const [key, names] of Object.entries(organMapping)) {
        if (names.includes(name.toLowerCase())) {
          return key
        }
      }
      
      // 如果没有找到，尝试模糊匹配
      const lowerName = name.toLowerCase()
      for (const [key, names] of Object.entries(organMapping)) {
        for (const organName of names) {
          if (organName.includes(lowerName) || lowerName.includes(organName)) {
            return key
          }
        }
      }
      
      return null
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },

    showOrganDetails(organ) {
      const statusText = {
        'excellent': '优秀',
        'good': '良好', 
        'normal': '正常',
        'warning': '警告',
        'danger': '危险'
      }
      const riskText = {
        'low': '低风险',
        'medium': '中风险',
        'high': '高风险'
      }
      
      // 创建弹出层显示详细信息
      this.showPopup(organ, statusText, riskText)
    },
    
    showPopup(organ, statusText, riskText) {
      // 如果当前显示的器官相同，不重复创建
      if (this.currentDisplayedOrgan === organ.name) {
        return
      }
      
      // 清除隐藏定时器
      if (this.hidePopupTimer) {
        clearTimeout(this.hidePopupTimer)
        this.hidePopupTimer = null
      }
      
      // 移除已存在的弹出层
      const existingPopup = document.querySelector('.organ-popup')
      if (existingPopup) {
        existingPopup.remove()
      }
      
      // 添加延迟，避免频繁创建弹出层
      if (this.popupTimer) {
        clearTimeout(this.popupTimer)
      }
      
      this.popupTimer = setTimeout(() => {
        this.createPopup(organ, statusText, riskText)
        this.currentDisplayedOrgan = organ.name
      }, 150)
    },
    
    createPopup(organ, statusText, riskText) {
      
      // 获取鼠标位置
      const mouseX = event?.clientX || window.innerWidth / 2
      const mouseY = event?.clientY || window.innerHeight / 2
      
      // 创建弹出层
      const popup = document.createElement('div')
      popup.className = 'organ-popup'
      popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 99999;
        pointer-events: auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
      `
      popup.innerHTML = `
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">${organ.name}健康报告</h3>
            <span class="close-btn" style="font-size: 24px; color: #999; cursor: pointer; padding: 4px; border-radius: 4px;">&times;</span>
          </div>
          <div>
            <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
              <span style="color: #666; margin-right: 8px; min-width: 70px;">健康指数:</span>
              <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold; font-size: 16px;">${organ.value}</span>
              <span style="color: #999; margin-left: 4px;">/100</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
              <span style="color: #666; margin-right: 8px; min-width: 70px;">状态:</span>
              <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold;">${statusText[organ.status]}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
              <span style="color: #666; margin-right: 8px; min-width: 70px;">风险等级:</span>
              <span style="color: ${this.getHealthColor(organ.value)}; font-weight: bold;">${riskText[organ.risk]}</span>
            </div>
            <div style="margin: 16px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #007bff;">
              <p style="margin: 0; color: #666; line-height: 1.5; font-size: 13px;">${organ.details}</p>
            </div>
            <div style="text-align: center; color: #999; font-size: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee;">
              <span>最后检查: ${organ.lastCheck}</span>
            </div>
          </div>
        </div>
      `
      
      // 添加到页面
      document.body.appendChild(popup)
      console.log('弹出层已创建:', organ.name, popup)
      
      // 添加关闭事件
      const closeBtn = popup.querySelector('.close-btn')
      closeBtn.addEventListener('click', () => {
        popup.remove()
        if (this.hidePopupTimer) {
          clearTimeout(this.hidePopupTimer)
          this.hidePopupTimer = null
        }
      })
      
      // 点击外部关闭
      popup.addEventListener('click', (e) => {
        if (e.target === popup) {
          popup.remove()
          if (this.hidePopupTimer) {
            clearTimeout(this.hidePopupTimer)
            this.hidePopupTimer = null
          }
        }
      })
      
      // 鼠标进入弹出层时，清除隐藏定时器
      popup.addEventListener('mouseenter', () => {
        console.log('鼠标进入弹出层')
        if (this.hidePopupTimer) {
          clearTimeout(this.hidePopupTimer)
          this.hidePopupTimer = null
        }
      })
      
      // 鼠标离开弹出层时，重新设置隐藏定时器
      popup.addEventListener('mouseleave', () => {
        console.log('鼠标离开弹出层')
        this.hidePopupTimer = setTimeout(() => {
          const existingPopup = document.querySelector('.organ-popup')
          if (existingPopup) {
            existingPopup.remove()
          }
        }, 1000)
      })
      
      // 3秒后自动关闭
      setTimeout(() => {
        if (popup.parentNode) {
          popup.remove()
          if (this.hidePopupTimer) {
            clearTimeout(this.hidePopupTimer)
            this.hidePopupTimer = null
          }
        }
      }, 3000)
    },

    testHover() {
      // 模拟鼠标悬停事件
      const organNames = ['heart', 'large-intestine', 'small-intestine', 'spleen', 'kidney', 'lung', 'liver']
      const randomOrgan = organNames[Math.floor(Math.random() * organNames.length)]
      const organ = this.healthData[randomOrgan]

      if (organ) {
        this.chart.dispatchAction({
          type: 'highlight',
          geoIndex: 0,
          name: organ.name
        })
        alert(`模拟鼠标悬停成功！当前高亮器官: ${organ.name}`)
      } else {
        alert('模拟鼠标悬停失败，未找到该器官。')
      }
    }
  }
}
</script>

<style scoped>
.organ-diagram-card {
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
  color: #1D1D1F;
}

.card-subtitle {
  font-size: 13px;
  color: #8E8E93;
}

.test-section {
  padding: 16px;
  border-top: 0.5px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.test-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.test-btn:hover {
  background-color: #0056b3;
}

.test-info {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: #8E8E93;
}

.chart-container {
  padding: 16px;
  height: 600px;
  overflow: hidden;
}

.scroll-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
  background: #f8f9fa;
}

.scroll-container::-webkit-scrollbar {
  width: 8px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.chart {
  width: 100%;
  min-height: 1000px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* 弹出层样式 */
.organ-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  animation: fadeIn 0.3s ease;
  pointer-events: auto;
}

.popup-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #eee;
  color: #666;
}

.popup-body {
  padding: 20px;
}

.health-score, .health-status, .health-risk {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.score-label, .status-label, .risk-label {
  color: #666;
  margin-right: 8px;
  min-width: 70px;
}

.score-value, .status-value, .risk-value {
  font-weight: bold;
  font-size: 16px;
}

.score-max {
  color: #999;
  margin-left: 4px;
}

.health-details {
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.health-details p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 13px;
}

.last-check {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style> 