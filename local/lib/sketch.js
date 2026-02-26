const fs = require('fs')
const path = require('path')

/**
 * 將 .ino 內容寫入 workspace/<name>/<name>.ino（目錄名與主檔名一致，符合 Arduino CLI 要求）。
 * @param {string} workspaceDir - 專案根目錄
 * @param {string} name - 專案名稱（用作目錄名與主檔名）
 * @param {string} inoContent - 程式碼內容
 * @returns {string} 專案目錄的絕對路徑
 */
function write(workspaceDir, name, inoContent) {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Sketch'
  const dir = path.join(workspaceDir, safeName)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const inoPath = path.join(dir, `${safeName}.ino`)
  fs.writeFileSync(inoPath, inoContent, 'utf8')
  return dir
}

/**
 * 取得專案目錄路徑（不寫入）。
 */
function getPath(workspaceDir, name) {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Sketch'
  return path.join(workspaceDir, safeName)
}

module.exports = { write, getPath }
