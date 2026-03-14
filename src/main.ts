/**
 * 应用入口文件
 * 初始化 Vue 3 应用、Pinia 状态管理、全局样式和 rem 适配
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setRemBase } from '@/utils'

import '@/styles/global.scss'

// 设置 rem 基准值（1rem = 视口宽度/100）
setRemBase()

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
