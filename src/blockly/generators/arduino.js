// src/blockly/generators/arduino.js
import * as Blockly from 'blockly'

const arduinoGenerator = new Blockly.CodeGenerator('ARDUINO')

const Order = {
  ATOMIC: 0,
  UNARY_POSTFIX: 1,
  MULTIPLICATIVE: 3,
  ADDITIVE: 4,
  RELATIONAL: 6,
  EQUALITY: 7,
  LOGICAL_AND: 11,
  LOGICAL_OR: 12,
  ASSIGNMENT: 15,
  NONE: 99
}

arduinoGenerator.INDENT = '  '
arduinoGenerator.setups_ = {}

arduinoGenerator.addSetup = function(name, code) {
  arduinoGenerator.setups_[name] = code
}

arduinoGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock = block.nextConnection?.targetBlock()
  const nextCode = thisOnly ? '' : arduinoGenerator.blockToCode(nextBlock ?? null)
  return code + nextCode
}

arduinoGenerator.finish = function(code) {
  let setupCode = ''
  for (const name in arduinoGenerator.setups_) {
    setupCode += arduinoGenerator.INDENT + arduinoGenerator.setups_[name] + '\n'
  }
  let finalCode = '// 助創客體系 自動生成代碼\n'
  finalCode += 'void setup() {\n' + setupCode + '}\n\n'
  finalCode += 'void loop() {\n'
  if (code) {
    finalCode += arduinoGenerator.INDENT + code.replace(/\n/g, '\n' + arduinoGenerator.INDENT)
  }
  finalCode += '\n}'
  arduinoGenerator.setups_ = {}
  return finalCode
}

// 邏輯
arduinoGenerator.forBlock['controls_if'] = function(block, generator) {
  let n = 0
  let code = ''
  do {
    const cond = generator.valueToCode(block, 'IF' + n, Order.NONE) || 'false'
    const branch = generator.statementToCode(block, 'DO' + n)
    code += (n > 0 ? ' else ' : '') + `if (${cond}) {\n${branch}}`
    n++
  } while (block.getInput('IF' + n))
  if (block.getInput('ELSE')) {
    const branch = generator.statementToCode(block, 'ELSE')
    code += ` else {\n${branch}}`
  }
  return code + '\n'
}

arduinoGenerator.forBlock['logic_compare'] = function(block, generator) {
  const OP = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }
  const op = OP[block.getFieldValue('OP')]
  const a = generator.valueToCode(block, 'A', Order.RELATIONAL) || '0'
  const b = generator.valueToCode(block, 'B', Order.RELATIONAL) || '0'
  return [a + ' ' + op + ' ' + b, Order.RELATIONAL]
}

// 數學
arduinoGenerator.forBlock['math_number'] = function(block) {
  return [String(parseFloat(block.getFieldValue('NUM'))), Order.ATOMIC]
}

// 字串（Blockly 內建 text 塊，用於串口列印等輸入）
arduinoGenerator.forBlock['text'] = function(block) {
  const raw = block.getFieldValue('TEXT') || ''
  const escaped = raw
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
  return [`"${escaped}"`, Order.ATOMIC]
}

arduinoGenerator.forBlock['math_arithmetic'] = function(block, generator) {
  const OP = {
    ADD: [' + ', Order.ADDITIVE],
    MINUS: [' - ', Order.ADDITIVE],
    MULTIPLY: [' * ', Order.MULTIPLICATIVE],
    DIVIDE: [' / ', Order.MULTIPLICATIVE]
  }
  const tuple = OP[block.getFieldValue('OP')] ?? [' + ', Order.ADDITIVE]
  const [op, order] = tuple
  const a = generator.valueToCode(block, 'A', order) || '0'
  const b = generator.valueToCode(block, 'B', order) || '0'
  return [a + op + b, order]
}

// 變數
arduinoGenerator.forBlock['variables_get'] = function(block) {
  return [block.getFieldValue('VAR'), Order.ATOMIC]
}

arduinoGenerator.forBlock['variables_set'] = function(block, generator) {
  const val = generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0'
  const varName = block.getFieldValue('VAR')
  return varName + ' = ' + val + ';\n'
}

// 控件（自訂 / Arduino 基礎）
arduinoGenerator.forBlock['controls_digital_write'] = function(block) {
  const pin = block.getFieldValue('PIN')
  const stat = block.getFieldValue('STAT')
  arduinoGenerator.addSetup('pinMode_' + pin, `pinMode(${pin}, OUTPUT);`)
  return `digitalWrite(${pin}, ${stat});\n` 
}

arduinoGenerator.forBlock['controls_digital_read'] = function(block) {
  const pin = block.getFieldValue('PIN')
  arduinoGenerator.addSetup('pinMode_' + pin, `pinMode(${pin}, INPUT);`)
  return [`digitalRead(${pin})`, Order.ATOMIC]
}

arduinoGenerator.forBlock['controls_delay'] = function(block, generator) {
  const t = generator.valueToCode(block, 'DELAY_TIME', Order.NONE) || '0'
  return `delay(${t});\n`
}

// 串口
arduinoGenerator.forBlock['serial_begin'] = function(block) {
  const baud = block.getFieldValue('BAUD') || '9600'
  arduinoGenerator.addSetup('serial_begin', `Serial.begin(${baud});`)
  return ''
}

arduinoGenerator.forBlock['serial_print'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || '""'
  return `Serial.print(${text});\n`
}

arduinoGenerator.forBlock['serial_println'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || '""'
  return `Serial.println(${text});\n`
}

arduinoGenerator.forBlock['serial_read'] = function() {
  return ['Serial.read()', Order.ATOMIC]
}

arduinoGenerator.forBlock['serial_available'] = function() {
  return ['Serial.available()', Order.ATOMIC]
}

export const generateArduinoCode = (workspace) => {
  return arduinoGenerator.workspaceToCode(workspace)
}

// 供動態擴充使用：取得共用的 Arduino generator 實例
export const getArduinoGenerator = () => arduinoGenerator

// 匯出運算子優先順序常數，方便外部 generator 使用
export { Order }
