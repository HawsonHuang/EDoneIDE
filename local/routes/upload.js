const { getDriver } = require('../drivers')

function createUploadRouter(config) {
  return async function uploadRouter(req, res) {
    const { path: projectPath, port, fqbn } = req.body || {}
    console.log('[API] POST /api/upload', projectPath, port)
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ ok: false, log: '缺少 path' })
    }
    if (!port || typeof port !== 'string') {
      return res.status(400).json({ ok: false, log: '缺少 port（例如 COM3）' })
    }
    try {
      const driver = getDriver('arduino', config)
      const result = await driver.upload(projectPath, port, fqbn || config.defaultFqbn)
      console.log('[API] 上傳', result.ok ? '成功' : '失敗', result.log ? result.log.slice(0, 120) + (result.log.length > 120 ? '…' : '') : '')
      res.json({ ok: result.ok, log: result.log })
    } catch (err) {
      console.log('[API] 上傳異常', err.message)
      res.status(500).json({
        ok: false,
        log: err.message || String(err),
      })
    }
  }
}

module.exports = { createUploadRouter }
