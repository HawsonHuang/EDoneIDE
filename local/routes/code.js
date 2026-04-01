const { write } = require('../lib/sketch')

function createCodeRouter(config) {
  const { workspaceDir } = config

  return function codeRouter(req, res) {
    const { ino, name } = req.body || {}
    const sketchName = (name && typeof name === 'string') ? name : 'EDoneSketch'
    console.log('[API] POST /api/code', sketchName, ino ? ino.length + ' 字元' : '')
    if (!ino || typeof ino !== 'string') {
      return res.status(400).json({ ok: false, error: '缺少 ino 程式碼' })
    }
    try {
      const projectPath = write(workspaceDir, sketchName, ino)
      console.log('[API] 寫入專案成功', projectPath)
      res.json({ ok: true, path: projectPath, name: sketchName })
    } catch (err) {
      console.log('[API] 寫入專案失敗', err.message)
      res.status(500).json({
        ok: false,
        error: err.message || String(err),
      })
    }
  }
}

module.exports = { createCodeRouter }
