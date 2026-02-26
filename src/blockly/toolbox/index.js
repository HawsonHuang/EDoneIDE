// src/blockly/toolbox/index.js
export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '邏輯',
      colour: '#5b80a5',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_null' },
        { kind: 'block', type: 'logic_ternary' }
      ]
    },
    {
      kind: 'category',
      name: '循環',
      colour: '#5ba55b',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 10 } } } } },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' }
      ]
    },
    {
      kind: 'category',
      name: '數字',
      colour: '#5b67a5',
      contents: [
        { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
        { kind: 'block', type: 'math_trig' },
        { kind: 'block', type: 'math_constant' },
        { kind: 'block', type: 'math_number_property' },
        { kind: 'block', type: 'math_round' },
        { kind: 'block', type: 'math_modulo' },
        { kind: 'block', type: 'math_constrain' },
        { kind: 'block', type: 'math_random_int' }
      ]
    },
    { kind: 'sep' },
    {
      kind: 'category',
      name: '變數',
      colour: '#a55b80',
      custom: 'VARIABLE'
    },
    { kind: 'sep' },
    {
      kind: 'category',
      name: '控件',
      colour: '#57945a',
      contents: [
        { kind: 'block', type: 'controls_digital_write' },
        { kind: 'block', type: 'controls_digital_read' },
        {
          kind: 'block',
          type: 'controls_delay',
          inputs: { DELAY_TIME: { shadow: { type: 'math_number', fields: { NUM: 1000 } } } }
        }
      ]
    }
  ]
}
