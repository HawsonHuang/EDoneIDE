const { getDriver } = require('../drivers')

function createPortsRouter(config) {
  return async function portsRouter(req, res) {
    console.log('[API] GET /api/ports')
    try {
      const driver = getDriver('arduino', config)
      const ports = await driver.listPorts()
      console.log('[API] 埠口列表', ports.length, '個', ports.map(p => p.port).join(', ') || '(無)')
      res.json({ ok: true, ports })
    } catch (err) {
      console.log('[API] 埠口列表失敗', err.message)
      res.status(500).json({
        ok: false,
        ports: [],
        error: err.message || String(err),
      })
    }
  }
}

module.exports = { createPortsRouter }
