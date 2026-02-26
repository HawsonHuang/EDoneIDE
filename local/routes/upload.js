const { getDriver } = require('../drivers')

function createUploadRouter(config) {
  return async function uploadRouter(req, res) {
    const { path: projectPath, port, fqbn } = req.body || {}
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ ok: false, log: '缺少 path' })
    }
    if (!port || typeof port !== 'string') {
      return res.status(400).json({ ok: false, log: '缺少 port（例如 COM3）' })
    }
    try {
      const driver = getDriver('arduino', config)
      const result = await driver.upload(projectPath, port, fqbn || config.defaultFqbn)
      res.json({ ok: result.ok, log: result.log })
    } catch (err) {
      res.status(500).json({
        ok: false,
        log: err.message || String(err),
      })
    }
  }
}

module.exports = { createUploadRouter }
