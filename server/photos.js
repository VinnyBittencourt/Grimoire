import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { randomUUID } from 'crypto'

export const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

// Extensão pelo conteúdo (magic bytes), nunca pelo que o cliente declara.
// Assim um .html/.svg disfarçado não vai parar na pasta servida em /photos.
export function detectImageExt(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  const head = buf.toString('latin1', 0, 6)
  if (head === 'GIF87a' || head === 'GIF89a') return 'gif'
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'webp'
  return null
}

// data URL base64 → { ext, buffer } se for uma imagem permitida; senão null
export function parseImageDataUrl(dataUrl) {
  const m = /^data:image\/[\w.+-]+;base64,(.+)$/s.exec(dataUrl ?? '')
  if (!m) return null
  const buffer = Buffer.from(m[1], 'base64')
  const ext = detectImageExt(buffer)
  return ext ? { ext, buffer } : null
}

export function savePhotoBuffer(photosDir, buffer, ext) {
  if (!Object.values(IMAGE_TYPES).includes(ext)) throw new Error(`Extensão de foto não permitida: ${ext}`)
  mkdirSync(photosDir, { recursive: true })
  const file = `${randomUUID()}.${ext}`
  writeFileSync(join(photosDir, file), buffer)
  return file
}

export function deletePhoto(photosDir, file) {
  if (!file) return
  const path = join(photosDir, basename(file))
  if (existsSync(path)) {
    try { unlinkSync(path) } catch { /* arquivo preso no Windows: fica órfão, sem impacto */ }
  }
}
