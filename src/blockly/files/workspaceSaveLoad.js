// src/blockly/files/workspaceSaveLoad.js
// 工作區保存與讀取（僅 workspace 序列化，不含專案格式、自定義塊等，之後可擴展）
import * as Blockly from 'blockly'

/** 工作區專案檔副檔名 */
export const WORKSPACE_FILE_EXT = '.workspace.json'

/**
 * 將當前工作區序列化為可儲存的 state 物件（Blockly JSON 格式）。
 * @param {Blockly.Workspace} workspace - Blockly 工作區實例
 * @returns {{ [key: string]: any } | null} 序列化結果，workspace 無效時回傳 null
 */
export function saveWorkspace(workspace) {
  if (!workspace) return null
  try {
    return Blockly.serialization.workspaces.save(workspace)
  } catch (err) {
    console.error('工作區保存失敗：', err)
    return null
  }
}

/**
 * 將 state 載入到指定工作區。
 * @param {{ [key: string]: any }} state - 由 saveWorkspace 或載入專案檔得到的 state
 * @param {Blockly.Workspace} workspace - 要載入的目標工作區
 * @param {{ clearFirst?: boolean, recordUndo?: boolean }} [options]
 * @param {boolean} [options.clearFirst] - 是否先清空工作區再載入，預設 true
 * @param {boolean} [options.recordUndo] - 是否記錄為可復原操作，預設 false
 */
export function loadWorkspace(state, workspace, options = {}) {
  const { clearFirst = true, recordUndo = false } = options
  if (!state || !workspace) {
    console.error('loadWorkspace: state 或 workspace 無效')
    return
  }
  try {
    if (clearFirst) {
      workspace.clear()
    }
    Blockly.serialization.workspaces.load(state, workspace, { recordUndo })
  } catch (err) {
    console.error('工作區載入失敗：', err)
    throw err
  }
}
