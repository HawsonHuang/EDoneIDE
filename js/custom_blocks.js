// js/custom_blocks.js

// 1. 数字输出（控件）
Blockly.Blocks['controls_digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("数字输出 引脚")
        .appendField(new Blockly.FieldTextInput("13"), "PIN")
        .appendField("状态")
        .appendField(new Blockly.FieldDropdown([["高","HIGH"], ["低","LOW"]]), "STAT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#57945a");
    this.setTooltip("向指定引脚输出高电平或低电平");
  }
};

// 2. 数字输入（控件）
Blockly.Blocks['controls_digital_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("数字输入 引脚")
        .appendField(new Blockly.FieldTextInput("13"), "PIN");
    this.setOutput(true, "Boolean");
    this.setColour("#57945a");
    this.setTooltip("读取指定引脚的电平状态");
  }
};

// 3. 延时（控件）
Blockly.Blocks['controls_delay'] = {
  init: function() {
    this.appendValueInput("DELAY_TIME")
        .setCheck("Number")
        .appendField("延时");
    this.appendDummyInput()
        .appendField("毫秒");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#57945a");
    this.setTooltip("程序暂停指定的时间");
  }
};