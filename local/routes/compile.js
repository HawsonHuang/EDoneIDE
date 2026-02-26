const path = require('path')
const { getDriver } = require('../drivers')

function createCompileRouter(config) {
  return async function compileRouter(req, res) {
    const { path: projectPath, fqbn } = req.body || {}
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ ok: false, log: '缺少 path' })
    }
    try {
      const driver = getDriver('arduino', config)
      const result = await driver.compile(projectPath, fqbn || config.defaultFqbn)
      res.json({ ok: result.ok, log: result.log })
    } catch (err) {
      res.status(500).json({
        ok: false,
        log: err.message || String(err),
      })
    }
  }
}

module.exports = { createCompileRouter }
