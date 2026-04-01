<template>
  <div class="h-full w-full flex flex-col bg-gray-100 overflow-hidden border-l border-gray-300" data-tour="sidebar-code">
    <!-- 可選雙頁：AI 頁（預設）/ 代碼頁 -->
    <div class="flex shrink-0 border-b border-gray-200 bg-white">
      <button
        class="flex-1 py-2.5 text-xs font-medium transition-colors"
        :class="activeTab === 'ai' ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
        @click="activeTab = 'ai'"
      >
        AI
      </button>
      <button
        class="flex-1 py-2.5 text-xs font-medium transition-colors"
        :class="activeTab === 'code' ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
        @click="activeTab = 'code'"
      >
        代码
      </button>
    </div>

    <div class="flex-1 min-h-0 overflow-hidden">
      <!-- AI 頁：聊天 -->
      <div v-show="activeTab === 'ai'" class="h-full">
        <SidebarChat />
      </div>

      <!-- 代碼頁：下載代碼 + 可選取複製 -->
      <div v-show="activeTab === 'code'" class="h-full flex flex-col p-4 overflow-y-auto">
        <label class="block text-[11px] text-gray-600 font-medium mb-2">代码</label>
        <button
          type="button"
          class="w-full px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canDownload"
          @click="downloadCodeFile"
        >
          下载代码文件
        </button>
        <pre
          class="mt-3 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-auto min-h-[120px] max-h-[200px] whitespace-pre-wrap pre-code"
        >{{ blocklyStore.generatedCode }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBlocklyStore } from '../../stores/blocklyStore'
import SidebarChat from './SidebarChat.vue'

const blocklyStore = useBlocklyStore()
const activeTab = ref<'ai' | 'code'>('ai')

const canDownload = computed(() => {
  const code = blocklyStore.generatedCode
  return (
    !!code &&
    code !== '还没有代码...' &&
    code !== '错误：工作区未初始化'
  )
})

function downloadCodeFile() {
  if (!canDownload.value) return
  const code = blocklyStore.generatedCode
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'EDoneSketch.ino'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.pre-code {
  user-select: text;
}
</style>
