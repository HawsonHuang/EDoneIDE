const path = require('path')

module.exports = {
  port: parseInt(process.env.LOCAL_PORT || '8765', 10),
  workspaceDir: path.resolve(__dirname, 'workspace'),
  arduinoCliPath: process.env.ARDUINO_CLI_PATH || 'arduino-cli',
  // Arduino UNO R4 WiFi
  defaultFqbn: process.env.ARDUINO_FQBN || 'arduino:renesas_uno:unor4wifi',
  corsOrigin: process.env.CORS_ORIGIN || '*',
}
