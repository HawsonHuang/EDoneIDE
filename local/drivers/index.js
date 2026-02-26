const { createArduinoDriver } = require('./arduino')

function getDriver(boardType, config) {
  const type = (boardType || 'arduino').toLowerCase()
  if (type === 'arduino') {
    return createArduinoDriver(config)
  }
  throw new Error(`不支援的板型: ${boardType}`)
}

module.exports = { getDriver }
