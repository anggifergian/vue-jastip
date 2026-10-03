import { ref, toValue, type MaybeRefOrGetter } from 'vue'

interface UseDragDropOptions {
  onFiles: (files: File[]) => void
  isAccepted: (file: File) => Promise<boolean> | boolean
  maxSizeMb: MaybeRefOrGetter<number>
  remainingSlots?: MaybeRefOrGetter<number>
  canDrop?: MaybeRefOrGetter<boolean>
}

export function useDragDrop(options: UseDragDropOptions) {
  const isDragOver = ref(false)
  const error = ref('')

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    if (toValue(options.canDrop) === false) return
    isDragOver.value = true
  }

  function onDragLeave(e: DragEvent) {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      isDragOver.value = false
    }
  }

  async function onDrop(e: DragEvent) {
    e.preventDefault()
    isDragOver.value = false
    error.value = ''

    if (toValue(options.canDrop) === false) return

    const slots = toValue(options.remainingSlots) ?? Infinity
    const all = Array.from(e.dataTransfer?.files ?? [])
    if (!all.length) return

    const toProcess = slots === Infinity ? all : all.slice(0, slots)
    const valid: File[] = []

    for (const file of toProcess) {
      if (!(await options.isAccepted(file))) {
        error.value = `"${file.name}" bukan format gambar yang didukung.`
        continue
      }
      const maxBytes = toValue(options.maxSizeMb) * 1024 * 1024
      if (file.size > maxBytes) {
        error.value = `"${file.name}" melebihi batas ${toValue(options.maxSizeMb)} MB.`
        continue
      }
      valid.push(file)
    }

    if (slots !== Infinity && all.length > slots) {
      error.value = `Hanya ${slots} foto lagi yang bisa ditambahkan.`
    }

    if (valid.length) options.onFiles(valid)
  }

  return { isDragOver, error, onDragOver, onDragLeave, onDrop }
}
