<template>
  <div class="h-full w-full bg-gray-100 flex flex-col border-t border-gray-300">
    <div class="flex items-center px-4 gap-4 border-b border-gray-200 text-[11px] h-9 shrink-0 bg-gray-50" data-tour="bottombar-serial">
      <span class="font-medium text-gray-700">串口</span>
      <select
        v-model="localStore.selectedSerialPort"
        class="border border-gray-300 rounded px-2 py-1 text-xs bg-white min-w-[100px]"
        :disabled="localStore.serialOpen"
      >
        <option value="">选择端口</option>
        <option v-for="p in localStore.portsExcludingCom1" :key="p.port" :value="p.port">{{ p.port }}</option>
      </select>
      <select
        v-model="localStore.serialBaudRate"
        class="border border-gray-300 rounded px-2 py-1 text-xs bg-white w-[90px]"
        :disabled="localStore.serialOpen"
      >
        <option v-for="b in baudRates" :key="b" :value="b">{{ b }}</option>
      </select>
      <button
        v-if="!localStore.serialOpen"
        type="button"
        class="px-3 py-1 rounded text-xs bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!localStore.selectedSerialPort || localStore.portsLoading"
        @click="connect"
      >
        连接
      </button>
      <button
        v-else
        type="button"
        class="px-3 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-500"
        @click="disconnect"
      >
        断开
      </button>
      <button
        type="button"
        class="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-200"
        :disabled="localStore.serialOpen"
        @click="localStore.loadPorts()"
      >
        刷新
      </button>
      <span v-if="localStore.portsLoading" class="text-gray-500 text-xs">读取中…</span>
      <span v-else-if="localStore.serialOpen" class="text-green-600 text-xs">{{ localStore.selectedSerialPort }} @ {{ localStore.serialBaudRate }}</span>
    </div>

    <div class="flex-1 flex flex-col min-h-0">
      <div
        ref="receiveRef"
        class="flex-1 p-3 font-mono text-xs text-gray-800 overflow-y-auto whitespace-pre-wrap break-all bg-white"
      >
        <span v-if="!localStore.serialOpen && localStore.serialReceiveText === ''" class="text-gray-400">连接串口后，此处显示板子发送的数据。</span>
        <span v-else>{{ localStore.serialReceiveText }}</span>
      </div>
      <div class="flex items-center gap-2 p-2 border-t border-gray-200 bg-gray-50 shrink-0">
        <input
          v-model="sendText"
          type="text"
          class="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
          placeholder="输入要发送的内容..."
          :disabled="!localStore.serialOpen"
          @keydown.enter.prevent="doSend"
        />
        <label class="flex items-center gap-1 text-[11px] text-gray-600 shrink-0">
          <input v-model="sendNewline" type="checkbox" class="rounded" />
          发送时加换行
        </label>
        <button
          type="button"
          class="px-3 py-1.5 rounded text-xs bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!localStore.serialOpen"
          @click="doSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useLocalStore } from '../../stores/localStore'
import { getSerialStreamUrl } from '../../api/localAgent'

const localStore = useLocalStore()
const baudRates = [9600, 19200, 38400, 57600, 115200]
const sendText = ref('')
const sendNewline = ref(true)
const receiveRef = ref<HTMLElement | null>(null)
let eventSource: EventSource | null = null

function startStream() {
  const url = getSerialStreamUrl()
  eventSource = new EventSource(url)
  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      if (data.text) localStore.appendSerialReceive(data.text)
      if (data.error) localStore.appendSerialError(data.error)
      if (data.event === 'closed') {
        localStore.serialOpen = false
        stopStream()
      }
      nextTickScroll()
    } catch {
      localStore.appendSerialReceive(e.data + '\n')
      nextTickScroll()
    }
  }
  eventSource.onerror = () => {
    stopStream()
  }
}

function stopStream() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

function nextTickScroll() {
  nextTick(() => {
    if (receiveRef.value) receiveRef.value.scrollTop = receiveRef.value.scrollHeight
  })
}

async function connect() {
  if (!localStore.selectedSerialPort) return
  try {
    const res = await localStore.openSerial(localStore.selectedSerialPort, localStore.serialBaudRate)
    if (res.ok) {
      startStream()
    } else {
      localStore.appendSerialError(res.error || '未知错误')
    }
  } catch (e) {
    localStore.appendSerialError(e instanceof Error ? e.message : String(e))
  }
}

async function disconnect() {
  stopStream()
  try {
    await localStore.closeSerial()
  } catch (_) {}
}

async function doSend() {
  if (!localStore.serialOpen) return
  let text = sendText.value
  if (sendNewline.value) text += '\n'
  if (text === '') return
  try {
    const res = await localStore.writeSerial(text)
    if (!res.ok) localStore.appendSerialError(res.error || '发送失败')
    else sendText.value = ''
  } catch (e) {
    localStore.appendSerialError(e instanceof Error ? e.message : String(e))
  }
  nextTickScroll()
}

// 當 serialReceiveText 變化時捲到底（SSE 推送）
watch(
  () => localStore.serialReceiveText,
  () => nextTickScroll(),
  { flush: 'post' }
)

onMounted(async () => {
  await localStore.loadPorts()
  const s = await localStore.fetchSerialState()
  if (s.ok && s.open && s.port) {
    localStore.setSerialRestored(s.port, s.baudRate)
    startStream()
  }
})

onUnmounted(() => {
  if (localStore.serialOpen) {
    stopStream()
    localStore.closeSerial().catch(() => {})
  }
})
</script>
