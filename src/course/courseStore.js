/**
 * 課程引擎（靜態）：載入課程、維護當前步驟、提供下一步/上一步/結束。
 * 課程內容由外部導入或動態更新，引擎只解析符合格式的物件。
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/** 內建示範課程（可運行實例；正式課程建議從外部 JSON 導入） */
const DEFAULT_LESSON = {
  version: 1,
  id: 'ide-quick-start',
  name: 'IDE 快速入門',
  steps: [
    {
      id: 'blockly-var',
      targetBlocklyCategory: '變數',
      title: '變數分類',
      content: '點這裡展開「變數」積木，可建立或使用變數。',
      placement: 'right',
    },
    {
      id: 'workspace',
      target: '[data-tour="workspace"]',
      title: '工作區',
      content: '在此拖放積木編寫程式。從左側工具箱選擇積木，拖到這裡組合。',
      placement: 'right',
    },
    {
      id: 'sidebar-code',
      target: '[data-tour="sidebar-code"]',
      title: '代碼預覽',
      content: '生成的 Arduino 代碼會顯示在這裡，可下載或複製。',
      placement: 'left',
    },
    {
      id: 'topbar-upload',
      target: '[data-tour="topbar-upload"]',
      title: '上傳到板子',
      content: '連接板子後，在此選擇埠口並點擊綠色按鈕上傳程式。',
      placement: 'bottom',
    },
    {
      id: 'bottombar-serial',
      target: '[data-tour="bottombar-serial"]',
      title: '串口監視器',
      content: '上傳後可在此連接串口，查看板子輸出的內容或發送指令。',
      placement: 'top',
    },
  ],
}

export const useCourseStore = defineStore('course', () => {
  const lesson = ref(null)
  const currentStepIndex = ref(0)
  const running = ref(false)

  const steps = computed(() => lesson.value?.steps ?? [])
  const currentStep = computed(() => {
    const s = steps.value
    const i = currentStepIndex.value
    return i >= 0 && i < s.length ? s[i] : null
  })
  const canPrev = computed(() => currentStepIndex.value > 0)
  const canNext = computed(() => currentStepIndex.value < steps.value.length - 1)
  const lessonName = computed(() => lesson.value?.name ?? '')

  /**
   * 開始一門課程（可傳入內建示範或外部導入的課程物件）
   * @param {Object} lessonObj - 符合格式的課程 { version, id, name, steps }
   */
  function startLesson(lessonObj) {
    if (!lessonObj || !Array.isArray(lessonObj.steps) || lessonObj.steps.length === 0) {
      console.warn('[course] 課程格式無效，需有 steps 陣列')
      return
    }
    lesson.value = lessonObj
    currentStepIndex.value = 0
    running.value = true
  }

  /** 開始內建示範課程 */
  function startDefaultLesson() {
    startLesson(DEFAULT_LESSON)
  }

  function nextStep() {
    if (currentStepIndex.value >= steps.value.length - 1) {
      end()
      return
    }
    currentStepIndex.value += 1
  }

  function prevStep() {
    if (currentStepIndex.value > 0) currentStepIndex.value -= 1
  }

  function end() {
    running.value = false
    lesson.value = null
    currentStepIndex.value = 0
  }

  return {
    lesson,
    currentStepIndex,
    running,
    steps,
    currentStep,
    canPrev,
    canNext,
    lessonName,
    startLesson,
    startDefaultLesson,
    nextStep,
    prevStep,
    end,
  }
})
