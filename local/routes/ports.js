const { getDriver } = require('../drivers')

function createPortsRouter(config) {
  return async function portsRouter(req, res) {
    try {
      const driver = getDriver('arduino', config)
      const ports = await driver.listPorts()
      res.json({ ok: true, ports })
    } catch (err) {
      res.status(500).json({
        ok: false,
        ports: [],
        error: err.message || String(err),
      })
    }
  }
}

module.exports = { createPortsRouter }
