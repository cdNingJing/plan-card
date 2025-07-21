import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import AppRouter from './AppRouter.vue'

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

app.use(pinia)
app.use(router)

app.mount('#app') 