// Arduino 專用基礎控件 blocks 定義（僅外觀 JSON，不含 generator）

export const arduinoBlockJson = [
  {
    type: 'controls_digital_write',
    message0: '數字輸出 引腳 %1 狀態 %2',
    args0: [
      { type: 'field_input', name: 'PIN', text: '13' },
      {
        type: 'field_dropdown',
        name: 'STAT',
        options: [
          ['高', 'HIGH'],
          ['低', 'LOW'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '向指定引腳輸出高電平或低電平',
  },
  {
    type: 'controls_digital_read',
    message0: '數字輸入 引腳 %1',
    args0: [{ type: 'field_input', name: 'PIN', text: '13' }],
    output: 'Boolean',
    colour: 120,
    tooltip: '讀取指定引腳的電平狀態',
  },
  {
    type: 'controls_delay',
    message0: '延時 %1 毫秒',
    args0: [
      {
        type: 'input_value',
        name: 'DELAY_TIME',
        check: 'Number',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: '程式暫停指定的時間',
  },
]

