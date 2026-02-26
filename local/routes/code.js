const { write } = require('../lib/sketch')

function createCodeRouter(config) {
  const { workspaceDir } = config

  return function codeRouter(req, res) {
    const { ino, name } = req.body || {}
    if (!ino || typeof ino !== 'string') {
      return res.status(400).json({ ok: false, error: '缺少 ino 程式碼' })
    }
    const sketchName = (name && typeof name === 'string') ? name : 'EDoneSketch'
    try {
      const projectPath = write(workspaceDir, sketchName, ino)
      res.json({ ok: true, path: projectPath, name: sketchName })
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: err.message || String(err),
      })
    }
  }
}

module.exports = { createCodeRouter }
