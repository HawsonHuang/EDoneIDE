<template>
  <div class="toolbox-panel h-full bg-gray-900 border-r border-gray-700 overflow-hidden" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick } from 'vue'
import * as Blockly from 'blockly'
import { toolboxConfig } from './toolboxconfig'

let workspace: Blockly.WorkspaceSvg | null = null

onMounted(async () => {
  const container = document.getElementById('blocklyDiv')
  if (!container) {
    console.error('blocklyDiv 未找到！请检查 WorkSpace.vue 是否包含 <div id="blocklyDiv">')
    return
  }

  console.log('容器初始尺寸：', container.offsetWidth, 'x', container.offsetHeight)

  if (container.offsetHeight <= 0 || container.offsetWidth <= 0) {
    console.warn('容器尺寸为0，可能是父容器尚未渲染完成')
  }

  try {
    console.log('开始初始化 Blockly...')

    workspace = Blockly.inject('blocklyDiv', {
      toolbox: toolboxConfig as any,
      toolboxPosition: 'start',
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
      grid: {
        spacing: 30,
        length: 5,
        colour: '#334155',
        snap: true,
      },
      renderer: 'geras',  // 较稳定的渲染器
      sounds: false,
    })

    console.log('Blockly 初始化成功！当前工作区块数量：', workspace.getAllBlocks().length)

    // 多次 resize 确保尺寸更新
    await nextTick()
    Blockly.svgResize(workspace!)

    setTimeout(() => {
      Blockly.svgResize(workspace!)
      console.log('延迟 300ms resize 后尺寸：', container.offsetWidth, 'x', container.offsetHeight)
    }, 300)

    setTimeout(() => {
      Blockly.svgResize(workspace!)
    }, 800)

    const resizeListener = () => Blockly.svgResize(workspace!)
    window.addEventListener('resize', resizeListener)

    onUnmounted(() => {
      window.removeEventListener('resize', resizeListener)
    })
  } catch (err) {
    console.error('Blockly 注入失败：', err)
  }
})

onUnmounted(() => {
  if (workspace) {
    workspace.dispose()
    workspace = null
  }
})
</script>

<style scoped>
.toolbox-panel {
  width: 260px;
  flex-shrink: 0;
}

/* 强制覆盖，确保可见 */
:deep(.blocklySvg) {
  background-color: #0f172a !important;
}

:deep(.blocklyToolboxDiv) {
  background-color: #111827 !important;
}

:deep(.blocklyFlyoutBackground) {
  fill: #1e293b !important;
}

:deep(.blocklyText) {
  fill: #e5e7eb !important;
}
</style>