/**
 * 助创客体系 - Arduino 代码生成器完整版 (修复嵌套问题)
 * 功能：支持逻辑、数学、变量、控件模块，自动管理 setup 初始化与代码结构
 */

const arduinoGenerator = new Blockly.Generator('ARDUINO');

// 1. 定义 C++ 操作符优先级
arduinoGenerator.ORDER_ATOMIC = 0;         
arduinoGenerator.ORDER_UNARY_POSTFIX = 1;  
arduinoGenerator.ORDER_MULTIPLICATIVE = 3; 
arduinoGenerator.ORDER_ADDITIVE = 4;       
arduinoGenerator.ORDER_RELATIONAL = 6;     
arduinoGenerator.ORDER_EQUALITY = 7;       
arduinoGenerator.ORDER_LOGICAL_AND = 11;    
arduinoGenerator.ORDER_LOGICAL_OR = 12;     
arduinoGenerator.ORDER_ASSIGNMENT = 15;     
arduinoGenerator.ORDER_NONE = 99;           

arduinoGenerator.INDENT = '  '; 
arduinoGenerator.setups_ = {}; // 用于存储 setup() 中的初始化代码

// 2. 辅助函数：向 setup 注入代码
arduinoGenerator.addSetup = function(setupName, code) {
  arduinoGenerator.setups_[setupName] = code;
};

// 3. 拼接逻辑
arduinoGenerator.scrub_ = function(block, code, opt_thisOnly) {
  const nextBlock = block.getNextBlock();
  const nextCode = opt_thisOnly ? '' : arduinoGenerator.blockToCode(nextBlock);
  return code + nextCode;
};

// 4. 核心修复：最终代码合成函数
// 这个函数会生成一个完整的 .ino 文件结构
arduinoGenerator.finish = function(code) {
  var setupCode = "";
  for (var name in arduinoGenerator.setups_) {
    setupCode += arduinoGenerator.INDENT + arduinoGenerator.setups_[name] + '\n';
  }
  
  var finalCode = "// 助创客体系 自动生成代码\n";
  finalCode += "void setup() {\n" + setupCode + "}\n\n";
  finalCode += "void loop() {\n";
  if (code) {
    // 对 loop 内部的代码进行缩进处理
    finalCode += arduinoGenerator.INDENT + code.replace(/\n/g, '\n' + arduinoGenerator.INDENT);
  }
  finalCode += "\n}";
  
  // 生成后清理缓存，防止重复叠加
  arduinoGenerator.setups_ = {};
  return finalCode;
};

// ==================== [逻辑 (Logic) 模块] ====================
arduinoGenerator.forBlock['controls_if'] = function(block, generator) {
  let n = 0;
  let code = '';
  do {
    const conditionCode = generator.valueToCode(block, 'IF' + n, arduinoGenerator.ORDER_NONE) || 'false';
    const branchCode = generator.statementToCode(block, 'DO' + n);
    code += (n > 0 ? ' else ' : '') + `if (${conditionCode}) {\n${branchCode}}`;
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    const branchCode = generator.statementToCode(block, 'ELSE');
    code += ` else {\n${branchCode}}`;
  }
  return code + '\n';
};

arduinoGenerator.forBlock['logic_compare'] = function(block, generator) {
  const OPERATORS = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = arduinoGenerator.ORDER_RELATIONAL;
  const argument0 = generator.valueToCode(block, 'A', order) || '0';
  const argument1 = generator.valueToCode(block, 'B', order) || '0';
  return [argument0 + ' ' + operator + ' ' + argument1, order];
};

// ==================== [数字 (Math) 模块] ====================
arduinoGenerator.forBlock['math_number'] = function(block) {
  return [parseFloat(block.getFieldValue('NUM')), arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_arithmetic'] = function(block, generator) {
  const OPERATORS = { 
    'ADD': [' + ', arduinoGenerator.ORDER_ADDITIVE], 
    'MINUS': [' - ', arduinoGenerator.ORDER_ADDITIVE], 
    'MULTIPLY': [' * ', arduinoGenerator.ORDER_MULTIPLICATIVE], 
    'DIVIDE': [' / ', arduinoGenerator.ORDER_MULTIPLICATIVE] 
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = generator.valueToCode(block, 'A', order) || '0';
  const argument1 = generator.valueToCode(block, 'B', order) || '0';
  return [argument0 + operator + argument1, order];
};

// ==================== [变量 (Variables) 模块] ====================
arduinoGenerator.forBlock['variables_get'] = function(block) {
  return [block.getFieldValue('VAR'), arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['variables_set'] = function(block, generator) {
  const argument0 = generator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
  const varName = block.getFieldValue('VAR');
  return varName + ' = ' + argument0 + ';\n';
};

// ==================== [控件 (Controls) 模块] ====================
arduinoGenerator.forBlock['controls_digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var stat = block.getFieldValue('STAT'); 
  arduinoGenerator.addSetup('pinMode_' + pin, `pinMode(${pin}, OUTPUT);`);
  return `digitalWrite(${pin}, ${stat});\n`;
};

arduinoGenerator.forBlock['controls_digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  arduinoGenerator.addSetup('pinMode_' + pin, `pinMode(${pin}, INPUT);`);
  return [`digitalRead(${pin})`, arduinoGenerator.ORDER_ATOMIC]; 
};

arduinoGenerator.forBlock['controls_delay'] = function(block, generator) {
  const delayTime = generator.valueToCode(block, 'DELAY_TIME', arduinoGenerator.ORDER_NONE) || '0';
  return `delay(${delayTime});\n`;
};