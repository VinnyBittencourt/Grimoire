// Cliente HTTP da API local. Erros viram ApiError com a mensagem do servidor
// ({ error: { code, message, fields } }).
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error?.message ?? `Erro ${status}`)
    this.status = status
    this.code = body?.error?.code
    this.fields = body?.error?.fields
  }
}

async function request(method, url, body, headers = {}) {
  const init = { method, headers: { ...headers } }
  if (body instanceof Blob) {
    init.body = body
    init.headers['Content-Type'] = body.type
  } else if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers['Content-Type'] = 'application/json'
  }
  let res
  try {
    res = await fetch(url, init)
  } catch {
    throw new ApiError(0, { error: { code: 'offline', message: 'Servidor do Grimoire não está respondendo (npm run dev:api)' } })
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const api = {
  get: url => request('GET', url),
  post: (url, body) => request('POST', url, body ?? {}),
  patch: (url, body) => request('PATCH', url, body),
  put: (url, body) => request('PUT', url, body),
  del: url => request('DELETE', url),
}

export const photoUrl = file => (file ? `/photos/${file}` : null)

// Baixa um JSON como arquivo (export)
export async function downloadJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null))
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'grimoire.json'
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/**
 * Reduz uma imagem para no máximo `max` px no maior lado e converte para webp.
 * Fotos de 5 MB viram ~50 KB — o v1 guardava o original em base64 dentro do banco.
 */
export async function resizeImage(file, max = 640, quality = 0.85) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return new Promise((resolve, reject) => canvas.toBlob(
    blob => (blob ? resolve(blob) : reject(new Error('toBlob falhou'))), 'image/webp', quality))
}
