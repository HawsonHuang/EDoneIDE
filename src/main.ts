// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'


// Blockly 12 在 inject() 時會自動注入內建 CSS，無需從 CDN 載入（避免 404/CORS）
import 'blockly/blocks'
import 'blockly/javascript'
import 'blockly/msg/zh-hans'
import './blockly/blocks'  // 自訂積木（需在 inject 前載入）

const app = createApp(App)
app.use(createPinia())
app.mount('#app')