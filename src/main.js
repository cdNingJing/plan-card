import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import AppRouter from './AppRouter.vue'

// 导入图标样式
import './assets/icons.css'
// 导入全局CSS变量
import './assets/variables.css'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入ECharts组件
import * as echarts from 'echarts/core'
import { SankeyChart, GraphChart, SunburstChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  SankeyChart,
  GraphChart,
  SunburstChart,
  CanvasRenderer
])

const app = createApp(AppRouter)
const pinia = createPinia()

// 注册Element Plus
app.use(ElementPlus)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)

app.mount('#app') 