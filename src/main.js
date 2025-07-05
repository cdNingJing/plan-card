import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import AppRouter from './AppRouter.vue'

const app = createApp(AppRouter)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app') 