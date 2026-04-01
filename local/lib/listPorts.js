const { run } = require('./exec')

/** 只保留實際埠路徑（COM3、/dev/ttyUSB0），避免 "COM63 serial" 等導致開埠失敗 */
function normalizePort(s) {
  if (!s || typeof s !== 'string') return ''
  const t = s.trim()
  const com = t.match(/^(COM\d+)/i)
  if (com) return com[1].toUpperCase()
  const dev = t.match(/^(\/dev\/\S+)/)
  if (dev) return dev[1]
  return t.split(/\s+/)[0] || t
}

/**
 * 使用 arduino-cli 列舉已連接的板子與埠口。
 * 先嘗試 --format json，若無結果則解析純文字輸出；若仍無則回傳 []。
 */
async function listPortsFromArduinoCli(arduinoCliPath) {
  const result = await run(arduinoCliPath, ['board', 'list', '--format', 'json'])
  const stdout = (result.stdout || '').trim()
  const lines = stdout.split('\n').filter(Boolean)
  const ports = []

  for (const line of lines) {
    try {
      const row = JSON.parse(line)
      if (row.port && row.port.address) {
        const addr = normalizePort(row.port.address)
        if (!addr) continue
        ports.push({
          port: addr,
          board: row.matching_boards?.[0]?.name || row.port.label || addr,
          fqbn: row.matching_boards?.[0]?.fqbn || null,
        })
      }
    } catch (_) {}
  }

  if (ports.length > 0) return ports

  // 無 JSON 或舊版：改試純文字 "arduino-cli board list"
  const textResult = await run(arduinoCliPath, ['board', 'list'])
  const text = (textResult.stdout || textResult.stderr || '').trim()
  const textLines = text.split('\n').map((s) => s.trim()).filter(Boolean)
  if (textLines.length < 2) return []

  for (let i = 1; i < textLines.length; i++) {
    const line = textLines[i]
    let parts = line.split(/\s{2,}|\t/)
    let first = (parts[0] || '').trim()
    if (!first.match(/^COM\d+/i) && !first.startsWith('/dev/')) {
      parts = line.split(/\s+/)
      first = (parts.find((t) => t.match(/^COM\d+/i) || t.startsWith('/dev/')) || '').trim()
    }
    if (first.match(/^COM\d+/i) || first.startsWith('/dev/')) {
      const idx = parts.indexOf(first)
      const board = (parts[idx + 2] || parts[idx + 1] || first).trim()
      const fqbn = (parts[idx + 3] || parts.find((t) => t && t.includes(':')) || '').trim() || null
      ports.push({ port: normalizePort(first), board: board || first, fqbn: fqbn || null })
    }
  }
  return ports
}

/**
 * 使用 serialport 列舉系統串口（不識別板型，僅作備援）。
 */
async function listPortsFromSerialPort() {
  try {
    const { SerialPort } = require('serialport')
    const list = await SerialPort.list()
    return list.map((p) => ({
      port: normalizePort(p.path),
      board: p.manufacturer || p.serialNumber ? `串口 (${p.manufacturer || p.serialNumber || ''})` : '串口 (未識別板型)',
      fqbn: null,
    })).filter((p) => p.port)
  } catch (err) {
    return []
  }
}

/**
 * 檢測現有板子：先 arduino-cli，若無則用 serialport 列舉埠口。
 */
async function listPorts(arduinoCliPath) {
  let ports = await listPortsFromArduinoCli(arduinoCliPath)
  if (ports.length === 0) {
    ports = await listPortsFromSerialPort()
  }
  return ports
}

module.exports = { listPorts, listPortsFromArduinoCli, listPortsFromSerialPort }
