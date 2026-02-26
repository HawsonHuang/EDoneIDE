import { toolboxConfig as baseToolboxConfig } from '../toolbox'

// 動態註冊進來的 block type 清單，會出現在「自訂」分類中
let dynamicBlockTypes = []

/**
 * 將新的 block type 加入動態清單（避免重複）。
 *
 * @param {string[]} types
 */
export function addDynamicBlocks(types) {
  for (const t of types) {
    if (t && !dynamicBlockTypes.includes(t)) {
      dynamicBlockTypes.push(t)
    }
  }
}

/**
 * 取得目前所有動態 block type 的複本。
 */
export function getDynamicBlockTypes() {
  return [...dynamicBlockTypes]
}

/**
 * 在原本的 toolboxConfig 上，附加一個「自訂」分類。
 *
 * @returns {import('../toolbox').toolboxConfig} 新的 toolbox 設定物件
 */
export function buildToolboxConfigWithDynamic() {
  const contents = [...baseToolboxConfig.contents]

  if (dynamicBlockTypes.length > 0) {
    contents.push({
      kind: 'category',
      name: '自訂',
      colour: '#ff9800',
      contents: dynamicBlockTypes.map((type) => ({
        kind: 'block',
        type,
      })),
    })
  }

  return {
    ...baseToolboxConfig,
    contents,
  }
}

