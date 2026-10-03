import { convertIfHeic, HEIC_CONVERSION_FAILED, validateFile } from '@/utils/image'
import type { ValidationResult } from '@/utils/image'
import { computed, ref } from 'vue'

export interface PhotoEntry {
  id: string
  file: File
  previewUrl: string
  state: 'uploading' | 'success' | 'error'
  progress: number
  key: string
  error?: string
}

export interface UseImageUploadOptions {
  maxSizeMb?: number
  maxPhotos?: number
  quality?: number
  uploadFn: (file: File, onProgress?: (percent: number) => void) => Promise<string>
  onSuccess?: (entry: PhotoEntry) => void
  onError?: (entry: PhotoEntry, err: unknown) => void
  onValidationError?: (file: File, result: ValidationResult) => void
}

export function useImageUpload(options: UseImageUploadOptions) {
  const {
    maxSizeMb = 5,
    maxPhotos = 5,
    quality = 0.9,
    uploadFn,
    onError,
    onSuccess,
    onValidationError,
  } = options

  const photos = ref<PhotoEntry[]>([])

  const successPhotos = computed(() => photos.value.filter((p) => p.state === 'success'))
  const canAddMore = computed(() => photos.value.length < maxPhotos)
  const uploadedKeys = computed(() => successPhotos.value.map((p) => p.key))

  // ── Internal helpers ────────────────────────────────────
  function createEntry(file: File): PhotoEntry {
    return {
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      state: 'uploading',
      key: '',
    }
  }

  function patchEntry(id: string, patch: Partial<PhotoEntry>) {
    const photo = photos.value.find((p) => p.id === id)
    if (photo) Object.assign(photo, patch)
  }

  async function uploadEntry(id: string) {
    const entry = photos.value.find((p) => p.id === id)
    if (!entry) return

    try {
      const key = await uploadFn(entry.file, (percent) => {
        patchEntry(id, { progress: percent })
      })

      patchEntry(id, { key, state: 'success' })

      const succeeded = photos.value.find((p) => p.id === entry.id)
      if (succeeded) {
        onSuccess?.(succeeded)
      }
    } catch (err) {
      patchEntry(id, { state: 'error', error: 'UPLOAD_FAILED' })

      const failed = photos.value.find((p) => p.id === entry.id)
      if (failed) {
        onError?.(failed, err)
      }
    }
  }

  // ── Public API ──────────────────────────────────────────
  async function addFiles(rawFiles: File[]) {
    const allowed = maxPhotos - photos.value.length
    if (allowed <= 0) return

    const batch = rawFiles.slice(0, allowed)

    const valid = batch.filter((raw) => {
      const result = validateFile(raw, maxSizeMb)
      if (!result.ok) {
        onValidationError?.(raw, result)
        return false
      }
      return true
    })

    const placeholders = valid.map((raw) => {
      const entry = createEntry(raw)
      photos.value.push(entry)
      return { id: entry.id, raw }
    })

    await Promise.all(
      placeholders.map(async ({ id, raw }) => {
        let file: File

        try {
          file = await convertIfHeic(raw, quality)
        } catch (err) {
          patchEntry(id, { state: 'error', error: HEIC_CONVERSION_FAILED })
          const failed = photos.value.find((p) => p.id === id)
          if (failed) onError?.(failed, err)
          return
        }

        const old = photos.value.find((p) => p.id === id)
        if (old) URL.revokeObjectURL(old.previewUrl)

        patchEntry(id, {
          file,
          previewUrl: URL.createObjectURL(file),
        })

        await uploadEntry(id)
      }),
    )
  }

  function retryPhoto(id: string) {
    uploadEntry(id)
  }

  function removePhoto(id: string) {
    const index = photos.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      const photo = photos.value[index]
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl)
        photos.value.splice(index, 1)
      }
    }
  }

  function reset() {
    photos.value.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    photos.value = []
  }

  return {
    photos,
    successPhotos,
    canAddMore,
    uploadedKeys,
    addFiles,
    retryPhoto,
    removePhoto,
    reset,
  }
}
