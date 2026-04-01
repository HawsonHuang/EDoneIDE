const express = require('express')
const cors = require('cors')
const config = require('./config')
const { createRoutes } = require('./routes')

const app = express()
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.use('/api', createRoutes(config))

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'edoneide-local' })
})

app.listen(config.port, () => {
  console.log(`EDone 本地服務: http://127.0.0.1:${config.port}`)
  console.log(`  健康檢查: GET /health`)
  console.log(`  上傳流程: POST /api/code -> POST /api/compile -> POST /api/upload`)
  console.log(`  埠口列表: GET /api/ports`)
  console.log(`  串口: GET /api/serial/state, POST /api/serial/open|close|write, GET /api/serial/stream (SSE)`)
})
