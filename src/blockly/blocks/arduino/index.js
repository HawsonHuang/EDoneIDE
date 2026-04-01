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
  // ---------- 串口 ----------
  {
    type: 'serial_begin',
    message0: '串口初始化 波特率 %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'BAUD',
        options: [
          ['9600', '9600'],
          ['19200', '19200'],
          ['38400', '38400'],
          ['57600', '57600'],
          ['115200', '115200'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 200,
    tooltip: '在 setup 中初始化串口，需與監視器波特率一致',
  },
  {
    type: 'serial_print',
    message0: '串口列印 %1',
    args0: [
      {
        type: 'input_value',
        name: 'TEXT',
        check: ['String', 'Number'],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 200,
    tooltip: '向串口發送內容（不換行）',
  },
  {
    type: 'serial_println',
    message0: '串口列印（換行）%1',
    args0: [
      {
        type: 'input_value',
        name: 'TEXT',
        check: ['String', 'Number'],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 200,
    tooltip: '向串口發送內容並換行',
  },
  {
    type: 'serial_read',
    message0: '串口讀取',
    output: 'Number',
    colour: 200,
    tooltip: '讀取一個字節，無資料時回傳 -1',
  },
  {
    type: 'serial_available',
    message0: '串口可讀字節數',
    output: 'Number',
    colour: 200,
    tooltip: '回傳緩衝區中可讀取的字節數量',
  },
]

