/**
 * Ollama 本地 API 封裝，與 UI 解耦。
 * 預設模型：gemma3:4b；baseUrl 可配置。
 */

const DEFAULT_BASE_URL = 'http://localhost:11434'
const DEFAULT_MODEL = 'gemma3:4b'

/**
 * @typedef {{ role: 'user'|'assistant'|'system', content: string }} ChatMessage
 * @typedef {{ message: { role: string, content: string }, done: boolean }} ChatResponse
 */

/**
 * 發送聊天請求（非串流）。
 * @param {Object} options
 * @param {ChatMessage[]} options.messages - 對話歷史
 * @param {string} [options.model] - 模型名稱，預設 gemma3:4b
 * @param {string} [options.baseUrl] - Ollama 服務地址
 * @returns {Promise<{ content: string }>} 助手回覆內容
 */
export async function chat({ messages, model = DEFAULT_MODEL, baseUrl = DEFAULT_BASE_URL }) {
  const url = `${baseUrl.replace(/\/$/, '')}/api/chat`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Ollama 請求失敗 (${res.status}): ${errText || res.statusText}`)
  }
  const data = await res.json()
  return { content: data.message?.content ?? '' }
}

/**
 * 串流聊天：每收到一段內容就呼叫 onChunk(delta)，適合即時顯示。
 * @param {Object} options
 * @param {ChatMessage[]} options.messages - 對話歷史
 * @param {string} [options.model] - 模型名稱
 * @param {string} [options.baseUrl] - Ollama 服務地址
 * @param {(delta: string) => void} options.onChunk - 每收到一段內容時呼叫（delta 可能為空字串）
 * @returns {Promise<void>}
 */
export async function chatStream({
  messages,
  model = DEFAULT_MODEL,
  baseUrl = DEFAULT_BASE_URL,
  onChunk,
}) {
  const url = `${baseUrl.replace(/\/$/, '')}/api/chat`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Ollama 請求失敗 (${res.status}): ${errText || res.statusText}`)
  }
  const reader = res.body?.getReader()
  if (!reader) throw new Error('不支援串流回應')
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const data = JSON.parse(trimmed)
          const content = data.message?.content ?? ''
          if (content && typeof onChunk === 'function') onChunk(content)
        } catch (_) {}
      }
    }
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer.trim())
        const content = data.message?.content ?? ''
        if (content && typeof onChunk === 'function') onChunk(content)
      } catch (_) {}
    }
  } finally {
    reader.releaseLock()
  }
}

export { DEFAULT_MODEL, DEFAULT_BASE_URL }
