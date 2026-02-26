import * as Blockly from 'blockly'
import { registerBlocksFromJson } from './registerBlocks.js'
import {
  addDynamicBlocks,
  buildToolboxConfigWithDynamic,
} from './toolbox.js'
import { getArduinoGenerator, Order } from '../generators/arduino.js'

/**
 * 安裝一包 blocks + generator。
 *
 * @typedef {Object} BlockPack
 * @property {any[]} blocks - 從 *.blocks.json 解析出的陣列。
 * @property {{ register?: Function }} generatorModule - 動態 import 出來的模組，需提供 register。
 */

/**
 * 安裝一包積木：
 * 1. 註冊 blocks 外觀
 * 2. 呼叫 generatorModule.register(...) 註冊 generator
 * 3. 更新 toolbox，把這些 block 加到「自訂」分類
 *
 * @param {BlockPack} pack
 * @param {Blockly.WorkspaceSvg} workspace
 */
export function installBlockPack(pack, workspace) {
  if (!pack || !Array.isArray(pack.blocks)) {
    throw new Error('installBlockPack: 無效的 BlockPack，缺少 blocks 陣列')
  }

  // 1. 註冊積木外觀
  const newTypes = registerBlocksFromJson(pack.blocks)

  // 2. 註冊 generator（若有提供 register 函式）
  const arduinoGenerator = getArduinoGenerator()
  if (
    pack.generatorModule &&
    typeof pack.generatorModule.register === 'function'
  ) {
    pack.generatorModule.register(arduinoGenerator, Blockly, Order)
  } else {
    console.warn(
      'installBlockPack: BlockPack 沒有提供 generatorModule.register，僅註冊了外觀'
    )
  }

  // 3. 更新 toolbox：加入自訂分類
  addDynamicBlocks(newTypes)

  if (workspace && typeof workspace.updateToolbox === 'function') {
    const newToolboxConfig = buildToolboxConfigWithDynamic()
    workspace.updateToolbox(newToolboxConfig)
  }
}

