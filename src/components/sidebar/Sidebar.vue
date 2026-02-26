<template>
  <div class="h-full w-full flex flex-col bg-gray-100 overflow-hidden border-l border-gray-300">
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

      <!-- 代碼頁：生成代碼 + 上傳到單片機 -->
      <div v-show="activeTab === 'code'" class="h-full flex flex-col p-4 overflow-y-auto">
        <label class="block text-[11px] text-gray-600 font-medium mb-2">生成代码</label>
        <button
          @click="blocklyStore.generateCode"
          class="w-full px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
        >
          生成 Arduino C/C++ 代码
        </button>
        <pre
          class="mt-3 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-auto min-h-[120px] max-h-[200px] whitespace-pre-wrap"
        >{{ blocklyStore.generatedCode }}</pre>

        <section class="mt-4 pt-3 border-t border-gray-200">
          <label class="block text-[11px] text-gray-600 font-medium mb-2">上传到单片机</label>
          <div class="flex gap-2 mb-2">
            <select
              v-model="selectedPort"
              class="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
            >
              <option value="">选择端口</option>
              <option v-for="p in ports" :key="p.port" :value="p.port">
                {{ p.port }} {{ p.board ? `(${p.board})` : '' }}
              </option>
            </select>
            <button
              type="button"
              class="px-2 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              :disabled="portsLoading"
              @click="loadPorts"
            >
              刷新
            </button>
          </div>
          <button
            type="button"
            class="w-full px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            :disabled="uploading || !canUpload"
            @click="doUpload"
          >
            {{ uploadButtonText }}
          </button>
          <pre
            v-if="uploadLog"
            class="mt-2 p-2 bg-gray-900 text-gray-300 rounded text-[10px] overflow-auto max-h-40 whitespace-pre-wrap"
          >{{ uploadLog }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBlocklyStore } from '../../stores/blocklyStore'
import { getPorts, postCode, compile, upload } from '../../api/localAgent'
import SidebarChat from './SidebarChat.vue'

const blocklyStore = useBlocklyStore()
const activeTab = ref<'ai' | 'code'>('ai')

const ports = ref<{ port: string; board?: string }[]>([])
const portsLoading = ref(false)
const selectedPort = ref('')
const uploading = ref(false)
const uploadStep = ref<'寫入專案' | '編譯' | '上傳' | ''>('')
const uploadLog = ref('')

const uploadButtonText = computed(() => {
  if (!uploading.value) return '上傳到 Arduino (UNO R4 WiFi)'
  if (uploadStep.value) return `上傳中（${uploadStep.value}）…`
  return '上傳中…'
})

const canUpload = computed(() => {
  const code = blocklyStore.generatedCode
  return (
    code &&
    code !== '还没有代码...' &&
    code !== '错误：工作区未初始化' &&
    !!selectedPort.value
  )
})

async function loadPorts() {
  portsLoading.value = true
  uploadLog.value = ''
  try {
    const res = await getPorts()
    if (res.ok && res.ports?.length) {
      const list = res.ports.filter((p) => p.port.toUpperCase() !== 'COM1')
      ports.value = list
      if (!selectedPort.value && list[0]) selectedPort.value = list[0].port
    } else {
      ports.value = []
      if (!res.ok) uploadLog.value = res.error || '無法取得埠口（請確認本地服務已啟動且已安裝 Arduino CLI）'
    }
  } catch (e) {
    ports.value = []
    uploadLog.value = '連線失敗：' + (e instanceof Error ? e.message : String(e))
  } finally {
    portsLoading.value = false
  }
}

const FQBN = 'arduino:renesas_uno:unor4wifi'

async function doUpload() {
  if (!canUpload.value || uploading.value) return
  const code = blocklyStore.generatedCode
  uploading.value = true
  uploadStep.value = ''
  uploadLog.value = ''
  try {
    uploadStep.value = '寫入專案'
    uploadLog.value = '正在寫入專案…\n'
    const codeRes = await postCode(code, 'EDoneSketch')
    if (!codeRes.ok || !codeRes.path) {
      uploadLog.value = `失敗（寫入專案）：\n${codeRes.error || '寫入專案失敗'}`
      return
    }

    uploadStep.value = '編譯'
    uploadLog.value = '正在編譯…\n'
    const compileRes = await compile(codeRes.path, FQBN)
    if (!compileRes.ok) {
      uploadLog.value = `失敗（編譯）：\n${compileRes.log || ''}`
      return
    }

    uploadStep.value = '上傳'
    uploadLog.value = '正在上傳…\n'
    const uploadRes = await upload(codeRes.path, selectedPort.value, FQBN)
    if (!uploadRes.ok) {
      uploadLog.value = `失敗（上傳）：\n${uploadRes.log || ''}`
      return
    }

    uploadLog.value = '上傳成功。\n' + (uploadRes.log || '')
  } catch (e) {
    uploadLog.value =
      (uploadStep.value ? `失敗（${uploadStep.value}）：\n` : '錯誤：') +
      (e instanceof Error ? e.message : String(e))
  } finally {
    uploading.value = false
    uploadStep.value = ''
  }
}

watch(activeTab, (tab) => {
  if (tab === 'code' && ports.value.length === 0 && !portsLoading.value) loadPorts()
})
</script>
