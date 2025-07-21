<template>
  <div class="identity-graph-card">
    <div class="filter-controls">
      <button @click="toggleFilter" class="filter-btn">
        <span class="filter-icon">🔍</span>
        过滤
      </button>
      <div v-if="showFilter" class="filter-dropdown">
        <div class="filter-item">
          <label>身份类型：</label>
          <select v-model="selectedIdentity" @change="updateChart">
            <option value="all">全部身份</option>
            <option value="tech">技术专家</option>
            <option value="family">家庭支柱</option>
            <option value="startup">创业者</option>
            <option value="social">社交达人</option>
            <option value="versatile">多面手</option>
          </select>
        </div>
        <div class="filter-item">
          <label>数据视图：</label>
          <select v-model="selectedView" @change="updateChart">
            <option value="view1">视图1 - 工作关系</option>
            <option value="view2">视图2 - 技能关系</option>
          </select>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <div ref="chartRef" class="chart"></div>
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn">+</button>
        <button @click="zoomOut" class="zoom-btn">-</button>
        <button @click="resetZoom" class="zoom-btn">重置</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { TreeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TreeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

export default {
  name: 'IdentityGraphCardV3',
  data() {
    return {
      chart: null,
      currentZoom: 1,
      showFilter: false,
      selectedIdentity: 'all',
      selectedView: 'view1',
      treeData: {
        name: '身份图谱',
        itemStyle: {
          color: '#1890ff'
        },
        children: [
          {
            name: '技术专家',
            itemStyle: {
              color: '#52c41a'
            },
            children: [
              {
                name: '网络公司A',
                itemStyle: {
                  color: '#ffa940'
                },
                children: [
                  {
                    name: '技术部',
                    itemStyle: {
                      color: '#ffc53d'
                    },
                    children: [
                      {
                        name: 'iOS团队',
                        itemStyle: {
                          color: '#ffe58f'
                        },
                        children: [
                          {
                            name: 'iOS组长-张三',
                            itemStyle: {
                              color: '#fff1b8'
                            },
                            children: [
                              {
                                name: '项目协作',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              },
                              {
                                name: '技术指导',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              }
                            ]
                          },
                          {
                            name: 'iOS开发-李四',
                            itemStyle: {
                              color: '#fff1b8'
                            },
                            children: [
                              {
                                name: '代码审查',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              },
                              {
                                name: '技术交流',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        name: '安卓团队',
                        itemStyle: {
                          color: '#d46b08'
                        },
                        children: [
                          {
                            name: '安卓组长-赵六',
                            itemStyle: {
                              color: '#fa8c16'
                            },
                            children: [
                              {
                                name: '架构设计',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              },
                              {
                                name: '团队管理',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              }
                            ]
                          },
                          {
                            name: '安卓开发-钱七',
                            itemStyle: {
                              color: '#fa8c16'
                            },
                            children: [
                              {
                                name: '性能优化',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              },
                              {
                                name: 'UI开发',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: '家庭支柱',
            itemStyle: {
              color: '#fa8c16'
            },
            children: [
              {
                name: '核心家庭',
                itemStyle: {
                  color: '#ffa940'
                },
                children: [
                  {
                    name: '配偶',
                    itemStyle: {
                      color: '#ffc53d'
                    },
                    children: [
                      {
                        name: '生活照顾',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      },
                      {
                        name: '情感支持',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      }
                    ]
                  },
                  {
                    name: '子女',
                    itemStyle: {
                      color: '#ffa940'
                    },
                    children: [
                      {
                        name: '教育指导',
                        itemStyle: {
                          color: '#ffc53d'
                        }
                      },
                      {
                        name: '生活陪伴',
                        itemStyle: {
                          color: '#ffc53d'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: '创业者',
            itemStyle: {
              color: '#eb2f96'
            },
            children: [
              {
                name: '创业公司C',
                itemStyle: {
                  color: '#f759ab'
                },
                children: [
                  {
                    name: '联合创始人-林二十一',
                    itemStyle: {
                      color: '#ff85c0'
                    },
                    children: [
                      {
                        name: '战略规划',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      },
                      {
                        name: '融资对接',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      }
                    ]
                  },
                  {
                    name: '技术合伙人-杨二十二',
                    itemStyle: {
                      color: '#ff85c0'
                    },
                    children: [
                      {
                        name: '技术架构',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      },
                      {
                        name: '团队建设',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  mounted() {
    this.initChart()
    this.addZoomControls()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose()
    }
    this.removeZoomControls()
  },
  methods: {
    toggleFilter() {
      this.showFilter = !this.showFilter
    },
    
    getFilteredData() {
      if (this.selectedView === 'view1') {
        return this.getWorkRelationshipData()
      } else {
        return this.getSkillRelationshipData()
      }
    },
    
    getWorkRelationshipData() {
      return {
        name: '工作关系图谱',
        itemStyle: {
          color: '#1890ff'
        },
        children: [
          {
            name: '技术专家',
            itemStyle: {
              color: '#52c41a'
            },
            children: [
              {
                name: '网络公司A',
                itemStyle: {
                  color: '#ffa940'
                },
                children: [
                  {
                    name: '技术部',
                    itemStyle: {
                      color: '#ffc53d'
                    },
                    children: [
                      {
                        name: 'iOS团队',
                        itemStyle: {
                          color: '#ffe58f'
                        },
                        children: [
                          {
                            name: 'iOS组长-张三',
                            itemStyle: {
                              color: '#fff1b8'
                            },
                            children: [
                              {
                                name: '项目协作',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              },
                              {
                                name: '技术指导',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              }
                            ]
                          },
                          {
                            name: 'iOS开发-李四',
                            itemStyle: {
                              color: '#fff1b8'
                            },
                            children: [
                              {
                                name: '代码审查',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              },
                              {
                                name: '技术交流',
                                itemStyle: {
                                  color: '#fffbe6'
                                }
                              }
                            ]
                          }
                        ]
                      },
                      {
                        name: '安卓团队',
                        itemStyle: {
                          color: '#d46b08'
                        },
                        children: [
                          {
                            name: '安卓组长-赵六',
                            itemStyle: {
                              color: '#fa8c16'
                            },
                            children: [
                              {
                                name: '架构设计',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              },
                              {
                                name: '团队管理',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              }
                            ]
                          },
                          {
                            name: '安卓开发-钱七',
                            itemStyle: {
                              color: '#fa8c16'
                            },
                            children: [
                              {
                                name: '性能优化',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              },
                              {
                                name: 'UI开发',
                                itemStyle: {
                                  color: '#ffa940'
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: '创业者',
            itemStyle: {
              color: '#eb2f96'
            },
            children: [
              {
                name: '创业公司C',
                itemStyle: {
                  color: '#f759ab'
                },
                children: [
                  {
                    name: '联合创始人-林二十一',
                    itemStyle: {
                      color: '#ff85c0'
                    },
                    children: [
                      {
                        name: '战略规划',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      },
                      {
                        name: '融资对接',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      }
                    ]
                  },
                  {
                    name: '技术合伙人-杨二十二',
                    itemStyle: {
                      color: '#ff85c0'
                    },
                    children: [
                      {
                        name: '技术架构',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      },
                      {
                        name: '团队建设',
                        itemStyle: {
                          color: '#ffadd2'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: '多面手',
            itemStyle: {
              color: '#13c2c2'
            },
            children: [
              {
                name: '金融公司B',
                itemStyle: {
                  color: '#36cfc9'
                },
                children: [
                  {
                    name: '技术部',
                    itemStyle: {
                      color: '#5cdbd3'
                    },
                    children: [
                      {
                        name: 'Java开发-马十八',
                        itemStyle: {
                          color: '#87e8de'
                        },
                        children: [
                          {
                            name: '核心系统',
                            itemStyle: {
                              color: '#b5f5ec'
                            }
                          },
                          {
                            name: '风控系统',
                            itemStyle: {
                              color: '#b5f5ec'
                            }
                          }
                        ]
                      },
                      {
                        name: 'Python开发-朱十九',
                        itemStyle: {
                          color: '#87e8de'
                        },
                        children: [
                          {
                            name: '数据分析',
                            itemStyle: {
                              color: '#b5f5ec'
                            }
                          },
                          {
                            name: '机器学习',
                            itemStyle: {
                              color: '#b5f5ec'
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    
    getSkillRelationshipData() {
      return {
        name: '技能关系图谱',
        itemStyle: {
          color: '#722ed1'
        },
        children: [
          {
            name: '移动开发',
            itemStyle: {
              color: '#9254de'
            },
            children: [
              {
                name: 'iOS开发',
                itemStyle: {
                  color: '#b37feb'
                },
                children: [
                  {
                    name: 'Swift',
                    itemStyle: {
                      color: '#d3adf7'
                    },
                    children: [
                      {
                        name: 'UI开发',
                        itemStyle: {
                          color: '#f9f0ff'
                        }
                      },
                      {
                        name: '网络请求',
                        itemStyle: {
                          color: '#f9f0ff'
                        }
                      }
                    ]
                  },
                  {
                    name: 'Objective-C',
                    itemStyle: {
                      color: '#b37feb'
                    },
                    children: [
                      {
                        name: '底层开发',
                        itemStyle: {
                          color: '#d3adf7'
                        }
                      },
                      {
                        name: '性能优化',
                        itemStyle: {
                          color: '#d3adf7'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Android开发',
                itemStyle: {
                  color: '#b37feb'
                },
                children: [
                  {
                    name: 'Kotlin',
                    itemStyle: {
                      color: '#d3adf7'
                    },
                    children: [
                      {
                        name: '现代开发',
                        itemStyle: {
                          color: '#f9f0ff'
                        }
                      },
                      {
                        name: '协程编程',
                        itemStyle: {
                          color: '#f9f0ff'
                        }
                      }
                    ]
                  },
                  {
                    name: 'Java',
                    itemStyle: {
                      color: '#b37feb'
                    },
                    children: [
                      {
                        name: '传统开发',
                        itemStyle: {
                          color: '#d3adf7'
                        }
                      },
                      {
                        name: '企业级开发',
                        itemStyle: {
                          color: '#d3adf7'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: '前端开发',
            itemStyle: {
              color: '#13c2c2'
            },
            children: [
              {
                name: 'Vue.js',
                itemStyle: {
                  color: '#36cfc9'
                },
                children: [
                  {
                    name: '组件开发',
                    itemStyle: {
                      color: '#5cdbd3'
                    },
                    children: [
                      {
                        name: '单文件组件',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      },
                      {
                        name: '状态管理',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      }
                    ]
                  },
                  {
                    name: '路由管理',
                    itemStyle: {
                      color: '#5cdbd3'
                    },
                    children: [
                      {
                        name: '页面导航',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      },
                      {
                        name: '路由守卫',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                name: 'React',
                itemStyle: {
                  color: '#36cfc9'
                },
                children: [
                  {
                    name: 'Hooks',
                    itemStyle: {
                      color: '#5cdbd3'
                    },
                    children: [
                      {
                        name: '状态管理',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      },
                      {
                        name: '副作用处理',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      }
                    ]
                  },
                  {
                    name: '组件模式',
                    itemStyle: {
                      color: '#5cdbd3'
                    },
                    children: [
                      {
                        name: '函数组件',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      },
                      {
                        name: '类组件',
                        itemStyle: {
                          color: '#87e8de'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: '后端开发',
            itemStyle: {
              color: '#fa8c16'
            },
            children: [
              {
                name: 'Java',
                itemStyle: {
                  color: '#ffa940'
                },
                children: [
                  {
                    name: 'Spring Boot',
                    itemStyle: {
                      color: '#ffc53d'
                    },
                    children: [
                      {
                        name: '微服务',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      },
                      {
                        name: 'REST API',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      }
                    ]
                  },
                  {
                    name: 'Spring Cloud',
                    itemStyle: {
                      color: '#ffa940'
                    },
                    children: [
                      {
                        name: '服务治理',
                        itemStyle: {
                          color: '#ffc53d'
                        }
                      },
                      {
                        name: '配置中心',
                        itemStyle: {
                          color: '#ffc53d'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Python',
                itemStyle: {
                  color: '#ffa940'
                },
                children: [
                  {
                    name: 'Django',
                    itemStyle: {
                      color: '#ffc53d'
                    },
                    children: [
                      {
                        name: 'Web框架',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      },
                      {
                        name: 'ORM操作',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      }
                    ]
                  },
                  {
                    name: 'Flask',
                    itemStyle: {
                      color: '#ffc53d'
                    },
                    children: [
                      {
                        name: '轻量级框架',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      },
                      {
                        name: 'API开发',
                        itemStyle: {
                          color: '#ffe58f'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    
    initChart() {
      if (this.chart) {
        this.chart.dispose()
      }
      
      this.chart = echarts.init(this.$refs.chartRef)
      this.updateChart()
      
      window.addEventListener('resize', this.handleResize)
    },
    
    updateChart() {
      const filteredData = this.getFilteredData()
      
      const option = {
        title: {
          text: '',
          subtext: '',
          top: 'top',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: (params) => {
            return this.getTooltipContent(params)
          }
        },
        series: [
          {
            type: 'tree',
            data: [filteredData],
            top: '18%',
            bottom: '14%',
            layout: 'radial',
            symbol: 'emptyCircle',
            symbolSize: 7,
            initialTreeDepth: 5,
            animationDurationUpdate: 750,
            emphasis: {
              focus: 'ancestor',
              itemStyle: {
                color: '#ff4d4f',
                borderColor: '#ff7875',
                borderWidth: 2
              },
              lineStyle: {
                color: '#ff4d4f',
                width: 3
              },
              label: {
                color: '#ff4d4f',
                fontSize: 12,
                fontWeight: 'bold'
              }
            },
            lineStyle: {
              color: '#ccc',
              width: 1
            },
            label: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 10,
              color: '#333',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 3,
              padding: [2, 4],
              formatter: (params) => {
                // 根据节点层级调整标签显示
                const name = params.name
                if (name.length > 10) {
                  return name.substring(0, 10) + '...'
                }
                return name
              },
              rotate: 'radial'
            },
            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left',
                fontSize: 9,
                color: '#666',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: 2,
                padding: [1, 3],
                rotate: 'radial'
              }
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationEasing: 'quinticInOut',
            // 优化径向布局参数
            // 调整节点间距和布局
            nodeAlign: 'justify',
            // 优化标签布局
            labelLayout: {
              hideOverlap: false,
              moveOverlap: 'shiftY'
            },
            // 调整径向布局的半径
            radius: ['15%', '85%']
          }
        ]
      }
      
      this.chart.setOption(option)
      
      // 添加点击事件
      this.chart.on('click', (params) => {
        this.handleNodeClick(params)
      })
      
      // 添加鼠标悬停事件
      this.chart.on('mouseover', (params) => {
        this.handleMouseOver(params)
      })
      
      this.chart.on('mouseout', (params) => {
        this.handleMouseOut(params)
      })
    },
    
    addZoomControls() {
      const chartContainer = this.$refs.chartRef
      
      // 鼠标滚轮缩放
      chartContainer.addEventListener('wheel', (e) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        this.zoomAtPoint(e.clientX, e.clientY, delta)
      })
      
      // 鼠标拖拽
      let isDragging = false
      let lastX = 0
      let lastY = 0
      
      chartContainer.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左键
          isDragging = true
          lastX = e.clientX
          lastY = e.clientY
          chartContainer.style.cursor = 'grabbing'
        }
      })
      
      chartContainer.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaX = e.clientX - lastX
          const deltaY = e.clientY - lastY
          this.pan(deltaX, deltaY)
          lastX = e.clientX
          lastY = e.clientY
        }
      })
      
      chartContainer.addEventListener('mouseup', () => {
        isDragging = false
        chartContainer.style.cursor = 'grab'
      })
      
      chartContainer.addEventListener('mouseleave', () => {
        isDragging = false
        chartContainer.style.cursor = 'grab'
      })
      
      // 双击重置
      chartContainer.addEventListener('dblclick', () => {
        this.resetZoom()
      })
      
      // 设置初始光标样式
      chartContainer.style.cursor = 'grab'
    },
    
    removeZoomControls() {
      const chartContainer = this.$refs.chartRef
      if (chartContainer) {
        chartContainer.removeEventListener('wheel', this.handleWheel)
        chartContainer.removeEventListener('mousedown', this.handleMouseDown)
        chartContainer.removeEventListener('mousemove', this.handleMouseMove)
        chartContainer.removeEventListener('mouseup', this.handleMouseUp)
        chartContainer.removeEventListener('dblclick', this.handleDoubleClick)
      }
    },
    
    zoomAtPoint(x, y, scale) {
      const newZoom = Math.max(0.1, Math.min(5, this.currentZoom * scale))
      const zoomRatio = newZoom / this.currentZoom
      
      // 获取图表容器相对于视口的位置
      const rect = this.$refs.chartRef.getBoundingClientRect()
      const centerX = x - rect.left
      const centerY = y - rect.top
      
      // 应用缩放变换
      this.applyTransform(centerX, centerY, zoomRatio)
      this.currentZoom = newZoom
    },
    
    pan(deltaX, deltaY) {
      const chartContainer = this.$refs.chartRef
      const transform = chartContainer.style.transform || ''
      const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
      
      let translateX = 0
      let translateY = 0
      
      if (translateMatch) {
        translateX = parseFloat(translateMatch[1])
        translateY = parseFloat(translateMatch[2])
      }
      
      const newTranslateX = translateX + deltaX
      const newTranslateY = translateY + deltaY
      
      this.applyTransform(0, 0, 1, newTranslateX, newTranslateY)
    },
    
    applyTransform(centerX = 0, centerY = 0, scale = 1, translateX = null, translateY = null) {
      const chartContainer = this.$refs.chartRef
      const transform = chartContainer.style.transform || ''
      
      let currentTranslateX = 0
      let currentTranslateY = 0
      let currentScale = 1
      
      // 解析当前变换
      const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
      const scaleMatch = transform.match(/scale\(([^)]+)\)/)
      
      if (translateMatch) {
        currentTranslateX = parseFloat(translateMatch[1])
        currentTranslateY = parseFloat(translateMatch[2])
      }
      
      if (scaleMatch) {
        currentScale = parseFloat(scaleMatch[1])
      }
      
      // 计算新的变换
      const newScale = currentScale * scale
      const newTranslateX = translateX !== null ? translateX : currentTranslateX
      const newTranslateY = translateY !== null ? translateY : currentTranslateY
      
      // 应用变换
      chartContainer.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px) scale(${newScale})`
    },
    
    zoomIn() {
      const chartContainer = this.$refs.chartRef
      const rect = chartContainer.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      this.zoomAtPoint(centerX, centerY, 1.2)
    },
    
    zoomOut() {
      const chartContainer = this.$refs.chartRef
      const rect = chartContainer.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      this.zoomAtPoint(centerX, centerY, 0.8)
    },
    
    resetZoom() {
      const chartContainer = this.$refs.chartRef
      chartContainer.style.transform = 'translate(0px, 0px) scale(1)'
      this.currentZoom = 1
    },
    
    getTooltipContent(params) {
      const node = params.data
      let content = `<div style="padding: 12px; max-width: 300px;">
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #333;">${node.name}</div>`
      
      // 根据节点类型显示不同的交集信息
      if (node.name === '技术专家') {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">💻 <strong>技术交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技术栈：iOS、Android、前端、后端</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 项目经验：5年+移动端开发</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 开源贡献：GitHub 100+ stars</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技术分享：技术会议主讲人</div>
        </div>`
      } else if (node.name === '家庭支柱') {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">🏠 <strong>家庭交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 家庭责任：主要经济来源</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 情感支持：家庭情感支柱</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 教育指导：子女教育负责人</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 赡养义务：父母赡养责任</div>
        </div>`
      } else if (node.name === '创业者') {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">🚀 <strong>创业交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 战略规划：公司发展方向</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 融资对接：投资人关系维护</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 团队建设：核心团队管理</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技术架构：产品技术路线</div>
        </div>`
      } else if (node.name === '社交达人') {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">🤝 <strong>社交交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 朋友网络：50+亲密朋友</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 职业网络：前同事关系维护</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 同学关系：校友网络建设</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 兴趣爱好：共同爱好群体</div>
        </div>`
      } else if (node.name === '多面手') {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">🎯 <strong>多面交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技术跨界：移动端+金融技术</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 业务理解：技术+业务双重视角</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 行业经验：互联网+金融行业</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技能互补：技术+管理能力</div>
        </div>`
      } else if (node.name.includes('公司') || node.name.includes('团队') || node.name.includes('部')) {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">📊 <strong>工作交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 项目协作：共同参与3个核心项目</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技术交流：每周技术分享会议</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 代码审查：相互review代码质量</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 团队建设：团建活动参与度90%</div>
        </div>`
      } else if (node.name.includes('组长') || node.name.includes('经理') || node.name.includes('开发')) {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">👥 <strong>个人交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 直接协作：${this.getCollaborationLevel(node.name)}</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技能互补：${this.getSkillComplement(node.name)}</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 沟通频率：${this.getCommunicationFreq(node.name)}</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 信任程度：${this.getTrustLevel(node.name)}</div>
        </div>`
      } else if (node.name.includes('创始人') || node.name.includes('合伙人')) {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">🤝 <strong>合作交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 战略合作：共同制定技术路线</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 资源整合：技术资源共享</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 风险共担：项目风险分担</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 收益共享：技术成果转化</div>
        </div>`
      } else if (node.name.includes('博主') || node.name.includes('开发者')) {
        content += `<div style="color: #666; margin-bottom: 8px; font-size: 12px;">
          <div style="margin-bottom: 4px;">💡 <strong>知识交集：</strong></div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 技术分享：共同参与技术会议</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 内容创作：合作技术文章</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 社区建设：技术社区贡献</div>
          <div style="margin-left: 16px; margin-bottom: 4px;">• 知识付费：课程合作开发</div>
        </div>`
      }
      
      // 添加来源信息
      content += `<div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee;">
        <div style="color: #999; font-size: 11px; margin-bottom: 6px;">📋 数据来源：</div>
        <div style="color: #666; font-size: 12px;">📄 身份档案数据</div>
        <div style="color: #666; font-size: 12px; margin-top: 4px;">🔗 关系网络数据</div>
        <div style="color: #666; font-size: 12px; margin-top: 4px;">📊 项目记录数据</div>
      </div>
      </div>`
      
      return content
    },
    
    getCollaborationLevel(name) {
      const levels = {
        '组长': '高度协作 - 直接汇报关系',
        '经理': '密切协作 - 项目负责人',
        '开发': '日常协作 - 同组开发',
        '设计师': '项目协作 - 设计评审',
        '产品': '需求协作 - 产品规划'
      }
      for (const [key, value] of Object.entries(levels)) {
        if (name.includes(key)) return value
      }
      return '一般协作 - 跨部门合作'
    },
    
    getSkillComplement(name) {
      const skills = {
        'iOS': '移动端开发技能互补',
        '安卓': 'Android开发技能互补',
        '前端': '前端技术栈互补',
        '后台': '后端架构技能互补',
        'Java': '企业级开发技能互补',
        'Python': '数据分析技能互补'
      }
      for (const [key, value] of Object.entries(skills)) {
        if (name.includes(key)) return value
      }
      return '技术栈互补合作'
    },
    
    getCommunicationFreq(name) {
      const freqs = {
        '组长': '每日沟通 - 工作汇报',
        '经理': '每周沟通 - 项目进度',
        '开发': '实时沟通 - 技术讨论',
        '设计师': '定期沟通 - 设计评审',
        '产品': '需求沟通 - 功能规划'
      }
      for (const [key, value] of Object.entries(freqs)) {
        if (name.includes(key)) return value
      }
      return '按需沟通 - 项目协作'
    },
    
    getTrustLevel(name) {
      const levels = {
        '组长': '高度信任 - 直接领导',
        '经理': '充分信任 - 项目合作',
        '开发': '相互信任 - 技术伙伴',
        '创始人': '深度信任 - 创业伙伴',
        '合伙人': '战略信任 - 商业合作'
      }
      for (const [key, value] of Object.entries(levels)) {
        if (name.includes(key)) return value
      }
      return '一般信任 - 工作关系'
    },
    
    handleNodeClick(params) {
      const node = params.data
      console.log('点击了节点:', node.name)
      
      // 移除页面跳转功能，只保留日志记录
    },
    
    handleMouseOver(params) {
      const node = params.data
      
      // 如果是人员节点，高亮显示到用户的路径
      if (this.isPersonNode(node.name)) {
        this.highlightPathToUser(node)
      }
    },
    
    handleMouseOut(params) {
      // 清除高亮效果
      this.clearHighlight()
    },
    
    isPersonNode(name) {
      // 判断是否为人员节点（包含具体人名或特定职位）
      const personKeywords = ['组长', '经理', '开发', '设计师', '产品', '创始人', '合伙人', '博主', '开发者']
      return personKeywords.some(keyword => name.includes(keyword)) || name.includes('-')
    },
    
    highlightPathToUser(node) {
      // 获取从用户到当前节点的路径
      const path = this.getPathToUser(node)
      
      // 高亮路径上的所有节点和连接线
      this.chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: path.map(n => n.dataIndex)
      })
    },
    
    getPathToUser(node) {
      // 这里简化实现，实际应该遍历树结构找到路径
      // 返回从用户到当前节点的路径
      const path = []
      let current = node
      
      // 向上遍历到根节点
      while (current && current.name !== '我') {
        path.unshift(current)
        current = current.parent
      }
      
      return path
    },
    
    clearHighlight() {
      // 清除所有高亮效果
      this.chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0
      })
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style scoped>
.identity-graph-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.filter-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-btn {
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.2s ease;
}

.filter-btn:hover {
  background: #40a9ff;
}

.filter-btn:active {
  transform: scale(0.98);
}

.filter-dropdown {
  position: absolute;
  top: 40px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 999;
  min-width: 200px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-size: 14px;
  color: #555;
  font-weight: bold;
}

.filter-item select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-item select:focus {
  outline: none;
  border-color: #1890ff;
}

.filter-icon {
  font-size: 18px;
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 600px;
  position: relative;
  overflow: hidden;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 600px;
  transition: transform 0.1s ease-out;
}

.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 1000;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.zoom-btn:active {
  transform: scale(0.95);
}
</style>
