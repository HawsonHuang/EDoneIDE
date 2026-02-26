// src/stores/blocklyStore.js
import { shallowRef, ref } from 'vue'
import { defineStore } from 'pinia'
import { generateArduinoCode } from '../blockly/generators/arduino'

export const useBlocklyStore = defineStore('blockly', () => {
  const workspace = shallowRef(null)
  const generatedCode = ref('还没有代码...')
  let workspaceReadyResolve = null
  let workspaceReadyPromise = new Promise((r) => { workspaceReadyResolve = r })

  const setWorkspace = (ws) => {
    workspace.value = ws
    if (workspaceReadyResolve) {
      workspaceReadyResolve(ws)
      workspaceReadyResolve = null
    }
  }

  /** 等待 workspace 就緒後回傳，若已就緒則立即 resolve；逾時則 reject */
  const getWorkspaceReady = (timeoutMs = 5000) => {
    if (workspace.value) return Promise.resolve(workspace.value)
    return Promise.race([
      workspaceReadyPromise,
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error('Workspace 初始化逾時')), timeoutMs)
      ),
    ]).then(() => workspace.value)
  }

  const disposeWorkspace = () => {
    workspace.value?.dispose()
    workspace.value = null
    workspaceReadyPromise = new Promise((r) => { workspaceReadyResolve = r })
  }

  const generateCode = () => {
    if (!workspace.value) {
      generatedCode.value = '错误：工作区未初始化'
      console.error('workspace 未初始化')
      return
    }

    try {
      const code = generateArduinoCode(workspace.value)
      generatedCode.value = code || '// 无内容生成'
      console.log('生成的 Arduino 代码：\n', generatedCode.value)
    } catch (err) {
      let message = '未知错误'
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      }
      generatedCode.value = `生成失败：${message}`
      console.error('代码生成失败：', err)
    }
  }

  return { workspace, generatedCode, setWorkspace, disposeWorkspace, generateCode, getWorkspaceReady }
})
