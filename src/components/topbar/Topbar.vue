<template>
  <div
    class="h-full w-full flex items-center justify-between px-4 bg-gray-100 border-b border-gray-300"
  >
    <div class="flex items-center gap-4">
      <div
        class="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white"
      >
        E
      </div>
      <h1 class="text-sm font-semibold tracking-wider text-gray-800">
        EDone <span class="text-blue-500 text-xs">易通科创编程</span>
      </h1>
    </div>

    <div
      class="flex items-center bg-gray-200 rounded-lg p-1 gap-1 border border-gray-300"
    >
      <button class="px-3 py-1 text-xs hover:bg-gray-300 rounded transition">
        选择
      </button>
      <button
        class="px-3 py-1 text-xs bg-blue-600 text-white rounded shadow-sm"
      >
        节点
      </button>
      <button class="px-3 py-1 text-xs hover:bg-gray-300 rounded transition">
        连线
      </button>
    </div>

    <div class="flex items-center gap-3">
      <button class="text-xs text-gray-600 hover:text-black">撤销</button>

      <!-- 匯入自訂積木 -->
      <div class="flex items-center gap-2">
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          multiple
          accept=".json,.js,.mjs"
          @change="onFilesSelected"
        />
        <button
          class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md transition-colors"
          @click="onClickImport"
        >
          导入积木
        </button>
      </div>

      <button
        class="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-md transition-colors"
      >
        RUN
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBlocklyStore } from '../../stores/blocklyStore'
import { installBlockPack } from '../../blockly/dynamic/installPack'

const fileInputRef = ref<HTMLInputElement | null>(null)
const blocklyStore = useBlocklyStore()

const onClickImport = () => {
  fileInputRef.value?.click()
}

const onFilesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const files = input?.files
  if (!files || files.length === 0) return

  // 尋找 blocks 與 generator 檔案
  let blocksFile: any = null
  let generatorFile: any = null

  Array.from(files).forEach((f) => {
    if (f.name.endsWith('.blocks.json')) {
      blocksFile = f
    } else if (f.name.endsWith('.gen.js') || f.name.endsWith('.gen.mjs')) {
      generatorFile = f
    }
  })

  if (!blocksFile || !generatorFile) {
    console.error('請選擇一個 *.blocks.json 和一個 *.gen.js / *.gen.mjs 檔案')
    // 清空選擇，避免下次不觸發 change
    if (input) input.value = ''
    return
  }

  try {
    // 1. 讀取 blocks.json
    const text = await blocksFile!.text()
    const blocksJson = JSON.parse(text)

    // 2. 動態載入 generator 模組
    const url = URL.createObjectURL(generatorFile)
    const generatorModule = await import(
      /* @vite-ignore */ url
    )

    // 3. 等待 workspace 就緒（避免在 Blockly 尚未 inject 完成時就讀到 null）
    let workspace: any
    try {
      workspace = await blocklyStore.getWorkspaceReady(5000)
    } catch (e) {
      console.error('Workspace 尚未初始化，無法安裝積木包（逾時）')
      URL.revokeObjectURL(url)
      if (input) input.value = ''
      return
    }
    if (!workspace) {
      console.error('Workspace 尚未初始化，無法安裝積木包')
      URL.revokeObjectURL(url)
      if (input) input.value = ''
      return
    }

    installBlockPack(
      {
        blocks: blocksJson,
        generatorModule,
      },
      workspace as any
    )

    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('匯入積木包失敗：', err)
  } finally {
    if (input) input.value = ''
  }
}
</script>