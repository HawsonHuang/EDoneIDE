/**
 * 本地服務 API：送程式碼、編譯、上傳、列埠口。
 * 基址可透過 VITE_LOCAL_AGENT_URL 配置，預設 http://127.0.0.1:8765
 */

const BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_LOCAL_AGENT_URL) ||
  'http://127.0.0.1:8765'

const api = (path: string, options?: RequestInit) =>
  fetch(`${BASE_URL.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

export interface CodeResponse {
  ok: boolean
  path?: string
  name?: string
  error?: string
}

export interface CompileOrUploadResponse {
  ok: boolean
  log: string
}

export interface PortsResponse {
  ok: boolean
  ports: { port: string; board?: string; fqbn?: string | null }[]
  error?: string
}

/** 寫入 .ino 到本地專案目錄 */
export async function postCode(ino: string, name = 'EDoneSketch'): Promise<CodeResponse> {
  const res = await api('/api/code', {
    method: 'POST',
    body: JSON.stringify({ ino, name }),
  })
  return res.json()
}

/** 編譯專案 */
export async function compile(projectPath: string, fqbn?: string): Promise<CompileOrUploadResponse> {
  const res = await api('/api/compile', {
    method: 'POST',
    body: JSON.stringify({ path: projectPath, fqbn }),
  })
  return res.json()
}

/** 上傳到板子 */
export async function upload(
  projectPath: string,
  port: string,
  fqbn?: string
): Promise<CompileOrUploadResponse> {
  const res = await api('/api/upload', {
    method: 'POST',
    body: JSON.stringify({ path: projectPath, port, fqbn }),
  })
  return res.json()
}

/** 取得埠口列表 */
export async function getPorts(): Promise<PortsResponse> {
  const res = await api('/api/ports')
  return res.json()
}

/** 一鍵：送碼 -> 編譯 -> 上傳 */
export async function uploadSketch(
  ino: string,
  port: string,
  options?: { name?: string; fqbn?: string }
): Promise<{ ok: boolean; log: string; step: 'code' | 'compile' | 'upload' }> {
  const name = options?.name ?? 'EDoneSketch'
  const fqbn = options?.fqbn

  const codeRes = await postCode(ino, name)
  if (!codeRes.ok || !codeRes.path) {
    return { ok: false, log: codeRes.error || '寫入專案失敗', step: 'code' }
  }

  const compileRes = await compile(codeRes.path, fqbn)
  if (!compileRes.ok) {
    return { ok: false, log: compileRes.log, step: 'compile' }
  }

  const uploadRes = await upload(codeRes.path, port, fqbn)
  if (!uploadRes.ok) {
    return { ok: false, log: uploadRes.log, step: 'upload' }
  }

  return { ok: true, log: uploadRes.log, step: 'upload' }
}
