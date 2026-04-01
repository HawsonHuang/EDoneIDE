// src/stores/localStore.js
// 本地服務狀態：埠口列表、上傳/串口選中埠、串口開關與收發，供 Topbar / Bottombar 共用
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getPorts,
  openSerial as apiOpenSerial,
  closeSerial as apiCloseSerial,
  writeSerial as apiWriteSerial,
  getSerialState,
} from '../api/localAgent'

export const useLocalStore = defineStore('local', () => {
  // 埠口列表（與 Local API 同步）
  const ports = ref(/** @type {{ port: string; board?: string; fqbn?: string | null }[]} */ ([]))
  const portsLoading = ref(false)
  const portsError = ref('')

  // 上傳用選中埠（Topbar）
  const selectedUploadPort = ref('')
  // 串口監視器用選中埠（Bottombar）
  const selectedSerialPort = ref('')
  const serialOpen = ref(false)
  const serialBaudRate = ref(9600)
  const serialReceiveText = ref('')

  /** 過濾掉 COM1 的埠口列表（供串口下拉等使用） */
  const portsExcludingCom1 = computed(() =>
    ports.value.filter((p) => (p.port || '').toUpperCase() !== 'COM1')
  )

  async function loadPorts() {
    portsLoading.value = true
    portsError.value = ''
    try {
      const res = await getPorts()
      if (res.ok && res.ports?.length) {
        ports.value = res.ports
        const selectable = res.ports.filter((p) => (p.port || '').toUpperCase() !== 'COM1')
        if (!selectedUploadPort.value && selectable[0])
          selectedUploadPort.value = selectable[0].port
        if (!selectedSerialPort.value && selectable[0])
          selectedSerialPort.value = selectable[0].port
      } else {
        ports.value = []
        portsError.value = res.ok ? '未检测到设备' : (res.error || '读取端口失败')
      }
    } catch (e) {
      ports.value = []
      portsError.value = e instanceof Error && e.message ? e.message : '无法连接本地服务'
    } finally {
      portsLoading.value = false
    }
  }

  function setSelectedUploadPort(port) {
    selectedUploadPort.value = port || ''
  }

  function setSelectedSerialPort(port) {
    selectedSerialPort.value = port || ''
  }

  async function openSerial(port, baudRate = 9600) {
    const res = await apiOpenSerial(port, baudRate)
    if (res.ok && res.open) {
      serialOpen.value = true
      selectedSerialPort.value = port
      serialBaudRate.value = res.baudRate ?? baudRate
      return { ok: true }
    }
    return { ok: false, error: res.error }
  }

  async function closeSerial() {
    await apiCloseSerial()
    serialOpen.value = false
  }

  async function writeSerial(text) {
    return apiWriteSerial(text)
  }

  function appendSerialReceive(text) {
    serialReceiveText.value += text
  }

  function appendSerialError(message) {
    serialReceiveText.value += `[错误] ${message}\n`
  }

  function clearSerialReceive() {
    serialReceiveText.value = ''
  }

  /** 還原串口狀態（頁面載入時後端已打開，僅同步狀態，不呼叫 open API） */
  function setSerialRestored(port, baudRate) {
    serialOpen.value = true
    selectedSerialPort.value = port || ''
    serialBaudRate.value = baudRate || 9600
  }

  /** 取得後端串口狀態（用於頁面載入時還原） */
  async function fetchSerialState() {
    return getSerialState()
  }

  return {
    ports,
    portsLoading,
    portsError,
    selectedUploadPort,
    selectedSerialPort,
    serialOpen,
    serialBaudRate,
    serialReceiveText,
    portsExcludingCom1,
    loadPorts,
    setSelectedUploadPort,
    setSelectedSerialPort,
    openSerial,
    closeSerial,
    writeSerial,
    appendSerialReceive,
    appendSerialError,
    clearSerialReceive,
    setSerialRestored,
    fetchSerialState,
  }
})
