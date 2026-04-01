<template>
  <div
    class="h-full w-full flex items-center justify-between px-5 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm gap-6"
  >
    <!-- 品牌区：Logo + 标题 -->
    <div class="flex items-center gap-3 shrink-0">
      <div
        class="w-9 h-9 bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
      >
        E
      </div>
      <div class="flex flex-col">
        <h1 class="text-sm font-semibold tracking-wide text-slate-900 leading-tight">
          EDone <span class="text-blue-500 text-xs align-middle">易通科创编程</span>
        </h1>
        <p class="text-[11px] text-slate-500 leading-tight">
          积木 · 代码 · AI · 创客
        </p>
      </div>
    </div>

    <!-- 工作区保存/读取 + 导入积木 -->
    <div class="flex items-center gap-2 shrink-0 px-2 py-1 rounded-full bg-slate-50/80 border border-slate-200 shadow-sm">
      <input
        ref="workspaceFileInputRef"
        type="file"
        class="hidden"
        accept=".workspace.json,.json"
        @change="onWorkspaceFileSelected"
      />
      <button
        type="button"
        class="inline-flex items-center h-8 px-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium tracking-wide transition-colors"
        @click="saveProject"
      >
        保存项目
      </button>
      <button
        type="button"
        class="inline-flex items-center h-8 px-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium tracking-wide transition-colors"
        @click="workspaceFileInputRef?.click()"
      >
        打开项目
      </button>
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        multiple
        accept=".json,.js,.mjs"
        @change="onFilesSelected"
      />
      <div class="flex items-center gap-1.5">
        <button
          class="inline-flex items-center h-8 px-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium tracking-wide shadow-sm transition-colors"
          @click="onClickImport"
        >
          导入积木
        </button>
        <button
          type="button"
          class="inline-flex items-center h-8 px-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium tracking-wide shadow-sm transition-colors"
          @click="onClickCourse"
        >
          课程
        </button>
        <button
          type="button"
          class="inline-flex items-center h-8 px-3 rounded-full bg-slate-500 hover:bg-slate-600 text-white text-xs font-medium tracking-wide transition-colors"
          title="复制积木说明到剪贴板，可贴到云端 AI 对话"
          @click="onCopyBlocksSpec"
        >
          {{ copyBlocksSpecMessage || '复制积木说明' }}
        </button>
      </div>
    </div>

    <!-- 上傳到板子：主按鈕 + 右側端口下拉 + 上傳狀態氣泡 -->
    <div ref="uploadTriggerRef" class="flex items-center min-w-0 flex-1 justify-end relative" data-tour="topbar-upload">
      <div class="relative">
        <div class="flex rounded-full border border-emerald-500/70 overflow-visible bg-emerald-50/80 shadow-sm">
          <button
            type="button"
            class="rounded-l-full px-3.5 h-9 bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0 max-w-[260px] truncate"
            :disabled="uploading || !canUpload"
            :title="uploadLog || mainButtonText"
            @click="doUpload"
          >
            {{ mainButtonText }}
          </button>
          <div class="relative rounded-r-full border-l border-emerald-400/60 bg-emerald-50">
            <button
              type="button"
              class="h-9 rounded-r-full px-3 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-medium flex items-center gap-1"
              :disabled="uploading"
              :title="localStore.ports.length ? '选择端口' : '点击刷新端口'"
              @click="onPortDropdownToggle"
            >
              <span class="max-w-[90px] truncate">
                {{ localStore.selectedUploadPort || '选择端口' }}
              </span>
              <span class="text-[10px]">▼</span>
            </button>
            <div
              v-if="showPortDropdown"
              class="absolute right-0 top-full mt-0.5 py-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[200px] max-h-56 overflow-y-auto"
            >
              <div class="px-2 py-1.5 text-[10px] text-gray-500 border-b border-gray-100">
                打开后已刷新端口 · 点击选择
              </div>
              <div
                v-if="localStore.portsLoading"
                class="px-3 py-2 text-xs text-gray-500"
              >
                读取中…
              </div>
              <template v-else-if="localStore.ports.length">
                <button
                  v-for="p in localStore.ports"
                  :key="p.port"
                  type="button"
                  class="w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5"
                  :class="[
                    p.port.toUpperCase() === 'COM1'
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : localStore.selectedUploadPort === p.port
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-100',
                  ]"
                  :disabled="p.port.toUpperCase() === 'COM1'"
                  @click="p.port.toUpperCase() !== 'COM1' && localStore.setSelectedUploadPort(p.port); showPortDropdown = false"
                >
                  <span class="font-medium">{{ p.port }}</span>
                  <span v-if="p.board" class="text-[10px] opacity-90">{{ p.board }}</span>
                  <span v-if="p.port.toUpperCase() === 'COM1'" class="text-[10px] text-amber-600">锁定（系统端口）</span>
                  <span v-else-if="localStore.selectedUploadPort === p.port" class="text-[10px] text-blue-600">已选</span>
                </button>
              </template>
              <div
                v-else
                class="px-3 py-2 text-xs text-gray-500"
              >
                {{ localStore.portsError || '未检测到设备' }}
              </div>
            </div>
          </div>
        </div>
        <!-- 上傳狀態氣泡：按鈕下方 -->
        <div
          v-if="showUploadBubble"
          class="absolute right-0 top-full mt-1.5 w-56 py-2 px-3 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
        >
          <div class="space-y-1.5 text-xs">
            <div
              v-for="(step, i) in uploadSteps"
              :key="i"
              class="flex items-center gap-2"
            >
              <span class="w-4 h-4 flex items-center justify-center shrink-0">
                <span v-if="step.status === 'running'" class="upload-spinner w-3.5 h-3.5 border-2 border-gray-300 border-t-green-500 rounded-full" />
                <span v-else-if="step.status === 'success'" class="text-green-600 font-bold">✓</span>
                <span v-else-if="step.status === 'error'" class="text-red-600 font-bold">✗</span>
                <span v-else class="w-3.5 h-3.5 rounded-full border border-gray-300 bg-gray-100" />
              </span>
              <span :class="step.status === 'error' ? 'text-red-600' : 'text-gray-700'">{{ step.label }}</span>
            </div>
          </div>
          <div v-if="uploadBubbleMessage" class="mt-2 pt-2 border-t border-gray-100 text-xs" :class="uploadBubbleSuccess ? 'text-green-600' : 'text-red-600'">
            {{ uploadBubbleMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBlocklyStore } from '../../stores/blocklyStore'
import { useLocalStore } from '../../stores/localStore'
import { useCourseStore } from '../../course/courseStore'
import { getSpecTextForCopy } from '../../blockly/workspaceSpecForAi'
import { installBlockPack } from '../../blockly/dynamic/installPack'
import { saveWorkspace, loadWorkspace, WORKSPACE_FILE_EXT } from '../../blockly/files/workspaceSaveLoad'
import { postCode, compile, upload } from '../../api/localAgent'

const fileInputRef = ref<HTMLInputElement | null>(null)
const workspaceFileInputRef = ref<HTMLInputElement | null>(null)
const blocklyStore = useBlocklyStore()
const localStore = useLocalStore()
const courseStore = useCourseStore()

function onClickCourse() {
  courseStore.startDefaultLesson()
}

const copyBlocksSpecMessage = ref('')
let copyBlocksSpecTimer: ReturnType<typeof setTimeout> | null = null
async function onCopyBlocksSpec() {
  try {
    const text = getSpecTextForCopy()
    await navigator.clipboard.writeText(text)
    copyBlocksSpecMessage.value = '已复制'
    if (copyBlocksSpecTimer) clearTimeout(copyBlocksSpecTimer)
    copyBlocksSpecTimer = setTimeout(() => {
      copyBlocksSpecMessage.value = ''
      copyBlocksSpecTimer = null
    }, 2000)
  } catch (e) {
    copyBlocksSpecMessage.value = '复制失败'
    if (copyBlocksSpecTimer) clearTimeout(copyBlocksSpecTimer)
    copyBlocksSpecTimer = setTimeout(() => {
      copyBlocksSpecMessage.value = ''
      copyBlocksSpecTimer = null
    }, 2000)
  }
}

const showPortDropdown = ref(false)
const uploadTriggerRef = ref<HTMLElement | null>(null)
const uploading = ref(false)
const uploadStep = ref<'写入项目' | '编译' | '上传' | ''>('')
const uploadLog = ref('')

type StepStatus = 'pending' | 'running' | 'success' | 'error'
const uploadSteps = ref<{ label: string; status: StepStatus }[]>([
  { label: '写入项目', status: 'pending' },
  { label: '编译', status: 'pending' },
  { label: '上传', status: 'pending' },
])
const uploadBubbleMessage = ref('')
const uploadBubbleSuccess = ref(false)
const showUploadBubble = ref(false)
let uploadBubbleTimer: ReturnType<typeof setTimeout> | null = null

function setStepStatus(index: number, status: StepStatus) {
  if (uploadSteps.value[index]) uploadSteps.value[index].status = status
}

function resetUploadBubble() {
  uploadSteps.value = [
    { label: '写入项目', status: 'pending' },
    { label: '编译', status: 'pending' },
    { label: '上传', status: 'pending' },
  ]
  uploadBubbleMessage.value = ''
  uploadBubbleSuccess.value = false
}

function showBubbleTemporarily() {
  showUploadBubble.value = true
  if (uploadBubbleTimer) clearTimeout(uploadBubbleTimer)
  uploadBubbleTimer = setTimeout(() => {
    showUploadBubble.value = false
    uploadBubbleTimer = null
  }, 4000)
}

const selectedBoardName = computed(() => {
  if (!localStore.selectedUploadPort || !localStore.ports.length) return ''
  const p = localStore.ports.find((x) => x.port === localStore.selectedUploadPort)
  return p?.board || (localStore.ports[0]?.board ?? '')
})

const mainButtonText = computed(() => {
  if (uploading.value) return `上传中（${uploadStep.value}）…`
  if (localStore.portsLoading && !localStore.ports.length) return '读取中…'
  if (!localStore.ports.length) return localStore.portsError || '连线失败'
  return selectedBoardName.value ? `上传到 ${selectedBoardName.value}` : '上传到 Arduino (UNO R4 WiFi)'
})

const canUpload = computed(() => {
  const code = blocklyStore.generatedCode
  const port = localStore.selectedUploadPort?.toUpperCase()
  return (
    !!code &&
    code !== '还没有代码...' &&
    code !== '错误：工作区未初始化' &&
    !!localStore.selectedUploadPort &&
    port !== 'COM1'
  )
})

const FQBN = 'arduino:renesas_uno:unor4wifi'

function onPortDropdownToggle() {
  showPortDropdown.value = !showPortDropdown.value
  if (showPortDropdown.value) localStore.loadPorts()
}

async function doUpload() {
  if (!canUpload.value || uploading.value) return
  const code = blocklyStore.generatedCode
  uploading.value = true
  uploadStep.value = ''
  uploadLog.value = ''
  resetUploadBubble()
  showUploadBubble.value = true
  try {
    uploadStep.value = '写入项目'
    setStepStatus(0, 'running')
    const codeRes = await postCode(code, 'EDoneSketch')
    if (!codeRes.ok || !codeRes.path) {
      setStepStatus(0, 'error')
      uploadBubbleMessage.value = codeRes.error || '写入项目失败'
      uploadBubbleSuccess.value = false
      uploadLog.value = `失败（写入项目）：\n${codeRes.error || '写入项目失败'}`
      showBubbleTemporarily()
      return
    }
    setStepStatus(0, 'success')

    uploadStep.value = '编译'
    setStepStatus(1, 'running')
    const compileRes = await compile(codeRes.path, FQBN)
    if (!compileRes.ok) {
      setStepStatus(1, 'error')
      uploadBubbleMessage.value = (compileRes.log || '编译失败').split('\n')[0] || '编译失败'
      uploadBubbleSuccess.value = false
      uploadLog.value = `失败（编译）：\n${compileRes.log || ''}`
      showBubbleTemporarily()
      return
    }
    setStepStatus(1, 'success')

    uploadStep.value = '上传'
    setStepStatus(2, 'running')
    const uploadRes = await upload(codeRes.path, localStore.selectedUploadPort, FQBN)
    if (!uploadRes.ok) {
      setStepStatus(2, 'error')
      uploadBubbleMessage.value = (uploadRes.log || '上传失败').split('\n')[0] || '上传失败'
      uploadBubbleSuccess.value = false
      uploadLog.value = `失败（上传）：\n${uploadRes.log || ''}`
      showBubbleTemporarily()
      return
    }
    setStepStatus(2, 'success')
    uploadBubbleMessage.value = '上传成功'
    uploadBubbleSuccess.value = true
    uploadLog.value = '上传成功。\n' + (uploadRes.log || '')
    showBubbleTemporarily()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    uploadBubbleMessage.value = uploadStep.value ? `失败（${uploadStep.value}）：${msg}` : msg
    uploadBubbleSuccess.value = false
    uploadLog.value = (uploadStep.value ? `失败（${uploadStep.value}）：\n` : '错误：') + msg
    if (uploadStep.value === '写入项目') setStepStatus(0, 'error')
    else if (uploadStep.value === '编译') setStepStatus(1, 'error')
    else setStepStatus(2, 'error')
    showBubbleTemporarily()
  } finally {
    uploading.value = false
    uploadStep.value = ''
  }
}

function onDocumentClick(e: MouseEvent) {
  if (uploadTriggerRef.value && !uploadTriggerRef.value.contains(e.target as Node)) {
    showPortDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  if (uploadBubbleTimer) clearTimeout(uploadBubbleTimer)
  if (copyBlocksSpecTimer) clearTimeout(copyBlocksSpecTimer)
})

async function saveProject() {
  try {
    const workspace = await blocklyStore.getWorkspaceReady(5000)
    if (!workspace) {
      console.error('工作区未就绪，无法保存')
      return
    }
    const state = saveWorkspace(workspace)
    if (!state) return
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `EDoneWorkspace${WORKSPACE_FILE_EXT}`
    a.click()
    URL.revokeObjectURL(a.href)
  } catch (e) {
    console.error('保存项目失败：', e)
  }
}

async function onWorkspaceFileSelected(e: Event) {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const state = JSON.parse(text)
    const workspace = await blocklyStore.getWorkspaceReady(5000)
    if (!workspace) {
      console.error('工作区未就绪，无法载入项目')
      if (input) input.value = ''
      return
    }
    loadWorkspace(state, workspace, { clearFirst: true })
    blocklyStore.generateCode()
  } catch (err) {
    console.error('载入项目失败：', err)
  } finally {
    if (input) input.value = ''
  }
}

const onClickImport = () => {
  fileInputRef.value?.click()
}

const onFilesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const files = input?.files
  if (!files || files.length === 0) return

  // 寻找 blocks 与 generator 文件
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
    console.error('请选择一个 *.blocks.json 和一个 *.gen.js / *.gen.mjs 文件')
    // 清空选择，避免下次不触发 change
    if (input) input.value = ''
    return
  }

  try {
    // 1. 读取 blocks.json
    const text = await blocksFile!.text()
    const blocksJson = JSON.parse(text)

    // 2. 动态载入 generator 模块
    const url = URL.createObjectURL(generatorFile)
    const generatorModule = await import(
      /* @vite-ignore */ url
    )

    // 3. 等待 workspace 就绪（避免在 Blockly 尚未 inject 完成时就读到 null）
    let workspace: any
    try {
      workspace = await blocklyStore.getWorkspaceReady(5000)
    } catch (e) {
      console.error('Workspace 尚未初始化，无法安装积木包（超时）')
      URL.revokeObjectURL(url)
      if (input) input.value = ''
      return
    }
    if (!workspace) {
      console.error('Workspace 尚未初始化，无法安装积木包')
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
    console.error('导入积木包失败：', err)
  } finally {
    if (input) input.value = ''
  }
}
</script>

<style scoped>
.upload-spinner {
  animation: upload-spin 0.7s linear infinite;
}
@keyframes upload-spin {
  to { transform: rotate(360deg); }
}
</style>