/**
 * 串口單例：開關、讀寫、向 SSE 客戶端廣播收到的資料。
 */
let serialPort = null
const sseClients = []

function broadcast(data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  const line = `data: ${payload}\n\n`
  const info = data && data.text !== undefined ? `${data.text.length} 字元` : (data && data.error ? 'error' : (data && data.event) || '')
  console.log('[串口] SSE 廣播 →', sseClients.length, '個客戶端', info)
  sseClients.forEach(({ res }) => {
    try {
      res.write(line)
    } catch (_) {}
  })
}

function getState() {
  if (!serialPort || !serialPort.isOpen) {
    return { open: false }
  }
  return {
    open: true,
    port: serialPort.path,
    baudRate: serialPort.baudRate,
  }
}

/**
 * @param {string} port - 例如 COM3、/dev/ttyUSB0
 * @param {number} baudRate - 例如 9600、115200
 */
async function open(port, baudRate = 9600) {
  console.log('[串口] 打開', port, baudRate)
  if (serialPort && serialPort.isOpen) {
    await close()
  }
  const { SerialPort } = require('serialport')
  return new Promise((resolve, reject) => {
    serialPort = new SerialPort(
      { path: port, baudRate },
      (err) => {
        if (err) {
          serialPort = null
          console.log('[串口] 打開失敗', err.message)
          reject(err)
          return
        }
        console.log('[串口] 已打開', port)
        resolve()
      }
    )
    serialPort.on('data', (chunk) => {
      const str = chunk.toString()
      console.log('[串口] 收到', chunk.length, '字節', str.length > 80 ? str.slice(0, 80) + '…' : str)
      broadcast({ text: str })
    })
    serialPort.on('error', (err) => {
      console.log('[串口] 錯誤', err.message)
      broadcast({ error: err.message })
    })
    serialPort.on('close', () => {
      serialPort = null
      console.log('[串口] 埠已關閉')
      broadcast({ event: 'closed' })
    })
  })
}

async function close() {
  if (!serialPort) return
  console.log('[串口] 關閉')
  return new Promise((resolve) => {
    serialPort.close(() => {
      serialPort = null
      resolve()
    })
  })
}

function write(text) {
  if (!serialPort || !serialPort.isOpen) {
    throw new Error('串口未打開')
  }
  const buf = Buffer.from(String(text), 'utf8')
  console.log('[串口] 發送', buf.length, '字節', text.length > 60 ? text.slice(0, 60) + '…' : text)
  return new Promise((resolve, reject) => {
    serialPort.write(buf, (err) => (err ? reject(err) : resolve()))
  })
}

function registerSSE(res) {
  sseClients.push({ res })
  console.log('[串口] SSE 客戶端連上，當前', sseClients.length, '個')
  res.on('close', () => {
    const i = sseClients.findIndex((c) => c.res === res)
    if (i !== -1) sseClients.splice(i, 1)
    console.log('[串口] SSE 客戶端斷開，剩餘', sseClients.length, '個')
  })
}

module.exports = {
  open,
  close,
  write,
  getState,
  registerSSE,
}
