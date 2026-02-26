import * as Blockly from 'blockly'

/**
 * 從 JSON 註冊一組積木外觀，回傳這次註冊到的 type 名稱清單。
 *
 * @param {any[]} blocksJson
 * @returns {string[]} 已註冊的 block type 名稱
 */
export function registerBlocksFromJson(blocksJson) {
  if (!Array.isArray(blocksJson)) {
    throw new Error('registerBlocksFromJson: blocksJson 必須是陣列')
  }

  const defs = Blockly.common.createBlockDefinitionsFromJsonArray(blocksJson)
  Blockly.common.defineBlocks(defs)

  return blocksJson
    .map((b) => b && b.type)
    .filter((t) => typeof t === 'string')
}

