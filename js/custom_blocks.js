// 4. 定义你之前报错的自定义积木
// 防止出现 "Invalid block definition" 错误
Blockly.Blocks['arduino_digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("数字输出 引脚")
        .appendField(new Blockly.FieldTextInput("13"), "PIN")
        .appendField("状态")
        .appendField(new Blockly.FieldDropdown([["高","HIGH"], ["低","LOW"]]), "STAT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
  }
};

Blockly.Blocks['arduino_digital_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("数字读取 引脚")
        .appendField(new Blockly.FieldTextInput("13"), "PIN");
    this.setOutput(true, "Boolean");
    this.setColour(230);
  }
};

// 5. 定义对应的代码生成器
javascript.javascriptGenerator.forBlock['arduino_digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var stat = block.getFieldValue('STAT');
  return `digitalWrite(${pin}, ${stat});\n`;
};
