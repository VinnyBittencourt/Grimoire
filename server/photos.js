import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { randomUUID } from 'crypto'

export const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

export function savePhotoBuffer(photosDir, buffer, ext) {
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
