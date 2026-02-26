<template>
  <div class="h-full flex flex-col bg-gray-50">
    <div class="flex-1 overflow-y-auto p-3 space-y-3">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words"
          :class="
            msg.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          "
        >
          {{ msg.content }}
        </div>
      </div>
      <div v-if="loading && !streamingContent" class="flex justify-start">
        <div class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500">
          正在回覆…
        </div>
      </div>
    </div>
    <form class="p-3 border-t border-gray-200 flex gap-2" @submit.prevent="send">
      <input
        v-model="input"
        type="text"
        class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="輸入訊息…"
        :disabled="loading"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="loading || !input.trim()"
      >
        發送
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { chatStream } from '../../api/ollama'

const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const input = ref('')
const loading = ref(false)
const streamingContent = ref('')

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  loading.value = true
  streamingContent.value = ''
  const assistantIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '' })
  try {
    await chatStream({
      messages: messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      onChunk(delta) {
        streamingContent.value += delta
        messages.value[assistantIndex] = {
          role: 'assistant',
          content: streamingContent.value,
        }
      },
    })
    if (!streamingContent.value)
      messages.value[assistantIndex] = { role: 'assistant', content: '(無回覆)' }
  } catch (e) {
    messages.value[assistantIndex] = {
      role: 'assistant',
      content: '錯誤：' + (e instanceof Error ? e.message : String(e)),
    }
  } finally {
    loading.value = false
    streamingContent.value = ''
  }
}
</script>
