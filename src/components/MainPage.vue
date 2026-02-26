<script setup lang="ts">
import { ref, reactive } from 'vue'
import Topbar from './topbar/Topbar.vue'
import Sidebar from './sidebar/Sidebar.vue'
import WorkSpace from './workspace/WorkSpace.vue'
import BottomBar from './bottombar/Bottombar.vue'

const layout = reactive({
  topBarHeight: 48,
  sidebarWidth: 280,
  bottomBarHeight: 180,
})

const isResizingRight = ref(false)
const isResizingBottom = ref(false)

const startResizeRight = () => { isResizingRight.value = true }
const startResizeBottom = () => { isResizingBottom.value = true }

const handleMouseMove = (e: MouseEvent) => {
  if (isResizingRight.value) {
    const newWidth = window.innerWidth - e.clientX
    layout.sidebarWidth = Math.max(150, Math.min(newWidth, 600))
  }
  if (isResizingBottom.value) {
    const newHeight = window.innerHeight - e.clientY
    layout.bottomBarHeight = Math.max(80, Math.min(newHeight, 500))
  }
}

const stopResize = () => {
  isResizingRight.value = false
  isResizingBottom.value = false
}
</script>

<template>
  <div 
    class="h-screen w-screen flex flex-col overflow-hidden bg-white text-gray-900 select-none"
    @mousemove="handleMouseMove"
    @mouseup="stopResize"
    @mouseleave="stopResize"
  >
    <div :style="{ height: `${layout.topBarHeight}px` }" class="w-full shrink-0 border-b border-gray-200">
      <Topbar />
    </div>

    <div class="flex flex-1 min-h-0 w-full overflow-hidden">
      <!-- 中间区域：WorkSpace + BottomBar -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="flex-1 min-h-0 relative overflow-hidden">
          <WorkSpace />
        </div>

        <div 
          class="h-1 w-full cursor-row-resize hover:bg-blue-500 transition-colors bg-gray-200"
          @mousedown="startResizeBottom"
        ></div>

        <div :style="{ height: `${layout.bottomBarHeight}px` }" class="w-full overflow-hidden">
          <BottomBar />
        </div>
      </div>

      <!-- 右侧拖拽条 + Sidebar -->
      <div 
        class="w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors bg-gray-200"
        @mousedown="startResizeRight"
      ></div>

      <div :style="{ width: `${layout.sidebarWidth}px` }" class="shrink-0 overflow-hidden bg-white">
        <Sidebar />
      </div>
    </div>
  </div>
</template>

<style scoped>
.select-none { user-select: none; }
</style>