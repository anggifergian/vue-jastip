import { heicTo, isHeic } from 'heic-to'

export async function isHeicFile(file: File): Promise<boolean> {
  return isHeic(file)
}

export async function convertIfHeic(file: File, quality = 0.9): Promise<File> {
  const heic = await isHeic(file)

  if (!heic) {
    return file
  }

  const jpegBlob = await heicTo({ blob: file, type: 'image/jpeg', quality })

  const jpegName = file.name.replace(/\.(heic|heif)$/i, '.jpg')

  return new File([jpegBlob], jpegName, { type: 'image/jpeg' })
}

export const HEIC_CONVERSION_FAILED = 'HEIC_CONVERSION_FAILED'

export interface ValidationResult {
  ok: boolean
  reason?: 'type' | 'size'
}

export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]

export function validateFile(file: File, maxSizeMb: number): ValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
    return { ok: false, reason: 'type' }
  }

  const maxFileSize = maxSizeMb * 1024 * 1024
  if (file.size > maxFileSize) {
    return { ok: false, reason: 'size' }
  }

  return { ok: true }
}
