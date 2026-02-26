// src/blockly/blocks/index.js
import * as Blockly from 'blockly'
import { baseBlockJson } from './base'
import { arduinoBlockJson } from './arduino'

// 將 base（通用邏輯）與 arduino（Arduino 基礎控件）的 blocks JSON 合併，
// 統一轉成 Blockly 的 block 定義並註冊。
const allJson = [...baseBlockJson, ...arduinoBlockJson]

if (allJson.length > 0) {
  const defs = Blockly.common.createBlockDefinitionsFromJsonArray(allJson)
  Blockly.common.defineBlocks(defs)
}
