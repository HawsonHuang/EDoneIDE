const path = require('path')
const { getDriver } = require('../drivers')

function createCompileRouter(config) {
  return async function compileRouter(req, res) {
    const { path: projectPath, fqbn } = req.body || {}
    console.log('[API] POST /api/compile', projectPath, fqbn || config.defaultFqbn)
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ ok: false, log: '缺少 path' })
    }
    try {
      const driver = getDriver('arduino', config)
      const result = await driver.compile(projectPath, fqbn || config.defaultFqbn)
      console.log('[API] 編譯', result.ok ? '成功' : '失敗', result.log ? result.log.slice(0, 120) + (result.log.length > 120 ? '…' : '') : '')
      res.json({ ok: result.ok, log: result.log })
    } catch (err) {
      console.log('[API] 編譯異常', err.message)
      res.status(500).json({
        ok: false,
        log: err.message || String(err),
      })
    }
  }
}

module.exports = { createCompileRouter }
