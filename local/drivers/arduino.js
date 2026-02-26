const path = require('path')
const { run } = require('../lib/exec')
const { listPorts: detectPorts } = require('../lib/listPorts')

/** 傳給 arduino-cli 的路徑：解析為絕對路徑，Windows 下改為正斜線，避免 bossac 收到被拆開的參數 */
function pathForCli(projectPath) {
  const resolved = path.resolve(projectPath)
  return process.platform === 'win32' ? resolved.replace(/\\/g, '/') : resolved
}

/**
 * Arduino 驅動：透過 arduino-cli 編譯、上傳；列埠口時先走 arduino-cli 再備援 serialport 檢測現有板。
 * 測試板型：Arduino UNO R4 WiFi (arduino:renesas_uno:unor4wifi)
 */
function createArduinoDriver(config) {
  const cli = config.arduinoCliPath
  const defaultFqbn = config.defaultFqbn

  async function compile(projectPath, fqbn = defaultFqbn) {
    const result = await run(cli, ['compile', '--fqbn', fqbn, pathForCli(projectPath)])
    const log = [result.stdout, result.stderr].filter(Boolean).join('\n')
    return { ok: result.ok, log }
  }

  /** 只取埠口識別碼（COM3、COM63、/dev/ttyUSB0 等），避免 "COM63 serial" 造成 bossac 報 extra arguments */
  function normalizePort(port) {
    const s = (port || '').trim()
    const m = s.match(/^(COM\d+)/i) || s.match(/^(\/dev\/[^\s]+)/)
    return m ? m[1] : s.split(/\s+/)[0] || s
  }

  async function upload(projectPath, port, fqbn = defaultFqbn) {
    const portOnly = normalizePort(port)
    if (!portOnly) {
      return { ok: false, log: '未指定埠口 (port)' }
    }
    const result = await run(cli, [
      'upload',
      '--verbose',
      pathForCli(projectPath),
      '-p', portOnly,
      '-b', fqbn,
    ])
    const log = [result.stdout, result.stderr].filter(Boolean).join('\n')
    return { ok: result.ok, log }
  }

  /** 檢測現有板：先 arduino-cli board list，若無則用 serialport 列舉系統串口 */
  async function listPorts() {
    return detectPorts(cli)
  }

  return { compile, upload, listPorts }
}

module.exports = { createArduinoDriver }
