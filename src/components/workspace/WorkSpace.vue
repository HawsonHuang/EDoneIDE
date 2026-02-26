<template>
  <div class="h-full w-full overflow-hidden bg-white relative">
    <!-- Blockly 畫布區域 -->
    <div id="blocklyDiv" class="absolute inset-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as BlocklyNS from 'blockly'
import { inject as coreInject, svgResize as coreSvgResize } from 'blockly/core'
import { useBlocklyStore } from '../../stores/blocklyStore'  // 导入 Pinia store
import { toolboxConfig } from '../../blockly/toolbox/index'  // ← 修改为新路径

// Blockly 12 主入口在部分環境下 inject 未正確掛載，優先從 blockly/core 取得
const Blockly = (BlocklyNS as any).default ?? BlocklyNS
const inject = Blockly?.inject ?? (BlocklyNS as any).inject ?? coreInject
const svgResize = Blockly?.svgResize ?? (BlocklyNS as any).svgResize ?? coreSvgResize
const TOOLBOX_AT_LEFT = Blockly?.TOOLBOX_AT_LEFT ?? (BlocklyNS as any).TOOLBOX_AT_LEFT ?? 'start'

const blocklyStore = useBlocklyStore()
const resizeCleanupRef = ref<(() => void) | null>(null)

onMounted(async () => {
  const container = document.getElementById('blocklyDiv')
  if (!container) {
    console.error('blocklyDiv 未找到！')
    return
  }

  console.log('容器尺寸：', container.offsetWidth, 'x', container.offsetHeight)

  try {
    console.log('開始初始化 Blockly...')
    if (typeof inject !== 'function') {
      throw new Error('Blockly.inject 未載入，請確認 blockly 套件已正確安裝')
    }

    const workspace = inject('blocklyDiv', {
      toolbox: toolboxConfig as any,
      toolboxPosition: TOOLBOX_AT_LEFT,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      trashcan: true,
      renderer: 'geras',
      sounds: false,
    })

    blocklyStore.setWorkspace(workspace)
    // 每次積木變更（增刪改）自動生成代碼
    workspace.addChangeListener(() => blocklyStore.generateCode())
    blocklyStore.generateCode()

    console.log('初始化成功！工作區塊數：', workspace.getAllBlocks().length)

    await nextTick()
    svgResize(workspace)

    setTimeout(() => svgResize(workspace), 300)
    setTimeout(() => svgResize(workspace), 800)

    const resizeListener = () => svgResize(workspace)
    window.addEventListener('resize', resizeListener)
    resizeCleanupRef.value = () => window.removeEventListener('resize', resizeListener)
  } catch (err) {
    console.error('注入失敗：', err)
  }
})

onUnmounted(() => {
  resizeCleanupRef.value?.()
  blocklyStore.disposeWorkspace()
})
</script>

<style scoped>
/* 強制覆蓋，確保可見 */
:deep(.blocklySvg) {
  background-color: #ffffff !important;
}

:deep(.blocklyToolboxDiv) {
  background-color: #f3f4f6 !important;
  width: 260px !important;
}

/* 隱藏飛出欄關閉後的殘留滾動條 */
:deep(.blocklyFlyoutScrollbar) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* 飛出背景 */
:deep(.blocklyFlyoutBackground) {
  fill: #e5e7eb !important;
}

/* 文字顏色 */
:deep(.blocklyText) {
  fill: #1f2937 !important;
}

/* 類別顏色 */
:deep(.blocklyToolboxCategory) {
  color: #1f2937 !important;
}
</style>