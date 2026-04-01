const serialManager = require('../lib/serialManager')

/** 只保留實際埠路徑（COM3、/dev/ttyUSB0 等），避免 "COM63 serial" 導致 File not found */
function normalizePort(s) {
  if (!s || typeof s !== 'string') return ''
  const t = s.trim()
  const com = t.match(/^(COM\d+)/i)
  if (com) return com[1].toUpperCase()
  const dev = t.match(/^(\/dev\/\S+)/)
  if (dev) return dev[1]
  return t.split(/\s+/)[0] || t
}

function createSerialRouter() {
  const router = require('express').Router()

  /** GET /api/serial/state - 當前串口狀態 */
  router.get('/state', (req, res) => {
    console.log('[API] GET /api/serial/state')
    res.json({ ok: true, ...serialManager.getState() })
  })

  /** POST /api/serial/open - 打開串口，body: { port, baudRate? } */
  router.post('/open', async (req, res) => {
    const { port, baudRate = 9600 } = req.body || {}
    const normalizedPort = normalizePort(port)
    console.log('[API] POST /api/serial/open', normalizedPort, baudRate)
    if (!normalizedPort) {
      return res.status(400).json({ ok: false, error: '缺少 port（例如 COM3）' })
    }
    try {
      await serialManager.open(normalizedPort, Number(baudRate) || 9600)
      res.json({ ok: true, ...serialManager.getState() })
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) })
    }
  })

  /** POST /api/serial/close - 關閉串口 */
  router.post('/close', async (req, res) => {
    console.log('[API] POST /api/serial/close')
    try {
      await serialManager.close()
      res.json({ ok: true, open: false })
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) })
    }
  })

  /** POST /api/serial/write - 發送字串，body: { text } */
  router.post('/write', async (req, res) => {
    const { text } = req.body || {}
    console.log('[API] POST /api/serial/write', text != null ? String(text).length + ' 字元' : '0')
    try {
      await serialManager.write(text != null ? String(text) : '')
      res.json({ ok: true })
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message || String(err) })
    }
  })

  /** GET /api/serial/stream - SSE 串口資料流 */
  router.get('/stream', (req, res) => {
    console.log('[API] GET /api/serial/stream (SSE 連線)')
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()
    serialManager.registerSSE(res)
  })

  return router
}

module.exports = { createSerialRouter }
