const { spawn } = require('child_process')

/**
 * 執行外部指令，回傳 stdout + stderr 與是否成功。
 * @param {string} command - 可執行檔名稱或路徑
 * @param {string[]} args - 參數陣列
 * @param {Object} [options] - 可選 { cwd }
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
 */
function run(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
    })
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString() })
    proc.on('close', (code) => {
      resolve({
        ok: code === 0,
        stdout,
        stderr,
        code: code ?? -1,
      })
    })
    proc.on('error', (err) => {
      resolve({
        ok: false,
        stdout: '',
        stderr: err.message || String(err),
        code: -1,
      })
    })
  })
}

module.exports = { run }
