<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  X,
  Upload,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ChevronLeft,
  Trash2,
} from '@lucide/vue'
import { useImageUpload } from '@/composables/useImageUpload'
import { useDragDrop } from '@/composables/useDragDrop'
import { cn } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  uploadFn: (file: File, onProgress?: (pct: number) => void) => Promise<string>
  saveFn: (keys: string[]) => Promise<void>
  maxPhotos?: number
  maxSizeMb?: number
}>()

const emit = defineEmits<{
  close: []
  saved: [keys: string[]]
}>()

const maxPhotos = computed(() => props.maxPhotos ?? 10)
const maxSizeMb = computed(() => props.maxSizeMb ?? 5)

const step = ref<1 | 2>(1)
const isSaving = ref(false)
const validationError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)

// ── Upload ───────────────────────────────────────────────
const {
  photos,
  successPhotos,
  canAddMore,
  uploadedKeys,
  addFiles,
  retryPhoto,
  removePhoto,
  reset,
} = useImageUpload({
  maxSizeMb: maxSizeMb.value,
  maxPhotos: maxPhotos.value,
  uploadFn: props.uploadFn,
  onValidationError: (file, result) => {
    validationError.value =
      result.reason === 'size'
        ? `"${file.name}" melebihi batas ${maxSizeMb.value} MB.`
        : `"${file.name}" bukan format yang didukung.`
  },
})

const remainingSlots = computed(() => maxPhotos.value - photos.value.length)
const hasSuccess = computed(() => successPhotos.value.length > 0)
const allSettled = computed(() => photos.value.every((p) => p.state !== 'uploading'))

// ── Drag & drop ──────────────────────────────────────────
function isAccepted(file: File) {
  return file.type.startsWith('image/')
}

const { isDragOver, onDragOver, onDragLeave, onDrop } = useDragDrop({
  onFiles: (files) => {
    validationError.value = ''
    addFiles(files)
  },
  isAccepted,
  maxSizeMb,
  remainingSlots,
  canDrop: canAddMore,
})

// ── File picker ──────────────────────────────────────────
async function onPickerChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  validationError.value = ''
  await addFiles(Array.from(input.files))
  input.value = ''
}

// ── Steps ────────────────────────────────────────────────
async function handleSave() {
  if (!hasSuccess.value || isSaving.value) return
  isSaving.value = true
  try {
    await props.saveFn(uploadedKeys.value)
    emit('saved', uploadedKeys.value)
    handleClose()
  } finally {
    isSaving.value = false
  }
}

// ── Lifecycle ────────────────────────────────────────────
watch(
  () => props.open,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
    if (!val) {
      setTimeout(() => {
        step.value = 1
        validationError.value = ''
        reset()
      }, 250)
    }
  },
)

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="modal-up">
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-[71] flex flex-col bg-background rounded-t-2xl h-[90dvh] overflow-hidden lg:inset-0 lg:m-auto lg:rounded-2xl lg:max-w-lg lg:h-[640px]"
      >
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <button
            v-if="step === 2"
            @click="step = 1"
            class="text-muted-foreground hover:text-foreground transition-colors -ml-1"
          >
            <ChevronLeft :size="20" />
          </button>
          <h2 class="text-sm font-semibold flex-1">
            {{ step === 1 ? 'Tambah Foto' : 'Preview Foto' }}
          </h2>
          <span v-if="step === 1" class="text-xs text-muted-foreground">
            {{ photos.length }}/{{ maxPhotos }}
          </span>
          <button
            @click="handleClose"
            class="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- ── Step 1: Upload ── -->
        <template v-if="step === 1">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onPickerChange"
          />

          <!-- Drop zone body -->
          <div
            ref="bodyRef"
            class="relative flex-1 overflow-y-auto p-5 flex flex-col gap-4"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <!-- Drag-over overlay -->
            <Transition name="drag-overlay">
              <div
                v-if="isDragOver && canAddMore"
                class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 m-3 rounded-xl border-2 border-dashed border-primary bg-primary/5"
              >
                <Upload :size="32" class="text-primary" />
                <p class="text-sm font-semibold text-primary">Lepaskan untuk menambah foto</p>
              </div>
            </Transition>

            <!-- Empty placeholder (no photos yet) -->
            <button
              v-if="photos.length === 0"
              type="button"
              @click="fileInputRef?.click()"
              :class="cn(
                'w-full flex-1 min-h-[220px] flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50',
              )"
            >
              <div class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <ImageIcon :size="22" class="text-muted-foreground" />
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-foreground">Drag & drop foto di sini</p>
                <p class="text-xs text-muted-foreground mt-0.5">atau klik untuk pilih file</p>
              </div>
              <p class="text-xs text-muted-foreground">
                Maks. {{ maxPhotos }} foto · {{ maxSizeMb }} MB per foto
              </p>
            </button>

            <!-- Thumbnail grid (photos exist) -->
            <TransitionGroup
              v-else
              name="photo"
              tag="div"
              class="grid grid-cols-3 sm:grid-cols-4 gap-2.5"
            >
              <div
                v-for="photo in photos"
                :key="photo.id"
                class="relative aspect-square rounded-xl overflow-hidden bg-muted"
              >
                <img
                  :src="photo.previewUrl"
                  :alt="photo.file.name"
                  class="w-full h-full object-cover"
                />

                <!-- Uploading -->
                <div
                  v-if="photo.state === 'uploading'"
                  class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1"
                >
                  <Loader2 :size="18" class="text-white animate-spin" />
                  <span class="text-[10px] font-semibold text-white">{{ photo.progress }}%</span>
                </div>

                <!-- Error -->
                <button
                  v-else-if="photo.state === 'error'"
                  class="absolute inset-0 bg-rose-900/60 flex flex-col items-center justify-center gap-1"
                  @click="retryPhoto(photo.id)"
                >
                  <AlertCircle :size="16" class="text-rose-200" />
                  <span class="text-[10px] text-rose-200 font-medium">Ulangi</span>
                </button>

                <!-- Success indicators -->
                <template v-if="photo.state === 'success'">
                  <div class="absolute bottom-1.5 left-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 :size="10" class="text-white" />
                  </div>
                  <button
                    @click="removePhoto(photo.id)"
                    class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <X :size="10" class="text-white" />
                  </button>
                </template>
              </div>

              <!-- Add slot -->
              <button
                v-if="canAddMore"
                key="add"
                type="button"
                @click="fileInputRef?.click()"
                :class="cn(
                  'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors',
                  isDragOver
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary',
                )"
              >
                <Plus :size="20" />
                <span class="text-[10px] font-medium">Tambah</span>
              </button>
            </TransitionGroup>

            <!-- Validation error -->
            <p v-if="validationError" class="text-xs text-danger">{{ validationError }}</p>
          </div>

          <!-- Footer step 1 -->
          <div class="shrink-0 border-t border-border px-5 py-3 flex items-center justify-between gap-3">
            <p class="text-xs text-muted-foreground">
              {{ maxPhotos }} foto · {{ maxSizeMb }} MB / foto · JPEG, PNG, HEIC
            </p>
            <button
              :disabled="!hasSuccess || !allSettled"
              @click="step = 2"
              :class="cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                hasSuccess && allSettled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
              )"
            >
              Lanjut ({{ successPhotos.length }})
            </button>
          </div>
        </template>

        <!-- ── Step 2: Preview ── -->
        <template v-else>
          <div class="flex-1 overflow-y-auto p-5">
            <p class="text-xs text-muted-foreground mb-4">
              {{ successPhotos.length }} foto siap diunggah. Pastikan foto sudah benar sebelum menyimpan.
            </p>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              <div
                v-for="photo in successPhotos"
                :key="photo.id"
                class="relative aspect-square rounded-xl overflow-hidden bg-muted group"
              >
                <img
                  :src="photo.previewUrl"
                  :alt="photo.file.name"
                  class="w-full h-full object-cover"
                />
                <button
                  @click="removePhoto(photo.id)"
                  class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 :size="10" class="text-white" />
                </button>
              </div>
            </div>
          </div>

          <!-- Footer step 2 -->
          <div class="shrink-0 border-t border-border px-5 py-3 flex items-center justify-end gap-2">
            <button
              @click="step = 1"
              class="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Kembali
            </button>
            <button
              :disabled="isSaving || !hasSuccess"
              @click="handleSave"
              :class="cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                isSaving || !hasSuccess
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )"
            >
              <Loader2 v-if="isSaving" :size="14" class="animate-spin" />
              Simpan {{ successPhotos.length }} Foto
            </button>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.modal-up-enter-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.modal-up-leave-active {
  transition: transform 0.22s ease, opacity 0.18s ease;
}
.modal-up-enter-from,
.modal-up-leave-to {
  transform: translateY(32px);
  opacity: 0;
}

@media (min-width: 1024px) {
  .modal-up-enter-from,
  .modal-up-leave-to {
    transform: scale(0.97) translateY(8px);
  }
}

.drag-overlay-enter-active,
.drag-overlay-leave-active {
  transition: opacity 0.15s ease;
}
.drag-overlay-enter-from,
.drag-overlay-leave-to {
  opacity: 0;
}

.photo-enter-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.photo-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.photo-enter-from,
.photo-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
