<template>
  <Teleport to="body">
    <div
      v-if="courseStore.running && courseStore.currentStep"
      class="course-overlay"
      @click.self="() => {}"
    >
      <!-- 挖空高亮區：用 box-shadow 做遮罩挖洞 -->
      <div
        v-if="targetRect"
        class="course-spotlight"
        :style="spotlightStyle"
      />
      <!-- 提示框 -->
      <div
        v-if="targetRect && courseStore.currentStep"
        class="course-tooltip"
        :class="`course-tooltip--${courseStore.currentStep.placement || 'bottom'}`"
        :style="tooltipStyle"
      >
        <div class="course-tooltip-title">{{ courseStore.currentStep.title }}</div>
        <div class="course-tooltip-content">{{ courseStore.currentStep.content }}</div>
        <div class="course-tooltip-actions">
          <button
            v-if="courseStore.canPrev"
            type="button"
            class="course-btn course-btn-secondary"
            @click="courseStore.prevStep()"
          >
            上一步
          </button>
          <button
            type="button"
            class="course-btn course-btn-primary"
            @click="courseStore.nextStep()"
          >
            {{ courseStore.canNext ? '下一步' : '结束' }}
          </button>
          <button
            type="button"
            class="course-btn course-btn-text"
            @click="courseStore.end()"
          >
            结束
          </button>
        </div>
      </div>
      <!-- 目標不存在時的 fallback -->
      <div
        v-else-if="courseStore.currentStep"
        class="course-fallback"
      >
        <div class="course-tooltip course-tooltip--center">
          <div class="course-tooltip-title">{{ courseStore.currentStep.title }}</div>
          <div class="course-tooltip-content">{{ courseStore.currentStep.content }}</div>
          <p class="text-xs text-amber-600 mt-2">未找到目標元素，請確認頁面已載入。</p>
          <div class="course-tooltip-actions mt-3">
            <button
              v-if="courseStore.canPrev"
              type="button"
              class="course-btn course-btn-secondary"
              @click="courseStore.prevStep()"
            >
              上一步
            </button>
            <button
              type="button"
              class="course-btn course-btn-primary"
              @click="courseStore.nextStep()"
            >
              {{ courseStore.canNext ? '下一步' : '结束' }}
            </button>
            <button
              type="button"
              class="course-btn course-btn-text"
              @click="courseStore.end()"
            >
              结束
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCourseStore } from './courseStore'

const courseStore = useCourseStore()

const PADDING = 8
const TOOLTIP_OFFSET = 12

/** 依步驟取得目標 DOM：支援 (1) targetBlocklyCategory (2) target 前綴 blockly: (3) target 為 CSS 選擇器 */
function resolveStepTarget(step: { target?: string; targetBlocklyCategory?: string } | null): HTMLElement | null {
  if (!step) return null
  const blocklyName = step.targetBlocklyCategory ?? (typeof step.target === 'string' && step.target.startsWith('blockly:') ? step.target.slice(8).trim() : null)
  if (blocklyName) {
    const categories = document.querySelectorAll('.blocklyToolboxCategory')
    for (const el of categories) {
      const label = (el.textContent || '').trim()
      if (label === blocklyName) return el as HTMLElement
    }
    return null
  }
  if (step.target && typeof step.target === 'string') {
    const el = document.querySelector(step.target)
    return el ? (el as HTMLElement) : null
  }
  return null
}

const targetRect = computed(() => {
  const step = courseStore.currentStep
  const el = resolveStepTarget(step)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  }
})

const spotlightStyle = computed(() => {
  const r = targetRect.value
  if (!r) return {}
  return {
    position: 'fixed',
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    boxShadow: `0 0 0 9999px rgba(0,0,0,0.45)`,
    pointerEvents: 'none',
    borderRadius: '6px',
  }
})

const tooltipStyle = computed(() => {
  const step = courseStore.currentStep
  const r = targetRect.value
  if (!step || !r) return {}
  const placement = step.placement || 'bottom'
  const o = TOOLTIP_OFFSET
  const maxW = 320
  let top = 0
  let left = r.left
  if (placement === 'top') {
    top = r.top - o
    left = r.left + r.width / 2
    return { top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, -100%)', maxWidth: `${maxW}px` }
  }
  if (placement === 'bottom') {
    top = r.top + r.height + o
    left = r.left + r.width / 2
    return { top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, 0)', maxWidth: `${maxW}px` }
  }
  if (placement === 'left') {
    top = r.top + r.height / 2
    left = r.left - o
    return { top: `${top}px`, left: `${left}px`, transform: 'translate(-100%, -50%)', maxWidth: `${maxW}px` }
  }
  if (placement === 'right') {
    top = r.top + r.height / 2
    left = r.left + r.width + o
    return { top: `${top}px`, left: `${left}px`, transform: 'translate(0, -50%)', maxWidth: `${maxW}px` }
  }
  return { maxWidth: `${maxW}px` }
})

watch(
  () => [courseStore.running, courseStore.currentStepIndex],
  () => {},
  { flush: 'post' }
)
</script>

<style scoped>
.course-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: auto;
}

.course-spotlight {
  pointer-events: none;
}

.course-tooltip {
  position: fixed;
  z-index: 10000;
  pointer-events: auto;
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}

.course-tooltip-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 6px;
}

.course-tooltip-content {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.45;
}

.course-tooltip-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.course-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: background 0.15s;
}

.course-btn-primary {
  background: #2563eb;
  color: #fff;
}

.course-btn-primary:hover {
  background: #1d4ed8;
}

.course-btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.course-btn-secondary:hover {
  background: #d1d5db;
}

.course-btn-text {
  background: transparent;
  color: #6b7280;
}

.course-btn-text:hover {
  background: #f3f4f6;
  color: #374151;
}

.course-tooltip--center {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.course-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}
</style>
