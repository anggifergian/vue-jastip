<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadCloud, ImageIcon, CheckCircle2, AlertCircle, X, Loader2 } from '@lucide/vue'
import UploaderDropZone from './UploaderDropZone.vue'
import { convertIfHeic } from '@/utils/image'

const props = defineProps<{
  acceptTypes: string
  maxSizeMb: number
  isAccepted: (file: File) => Promise<boolean>
  uploadFn: (file: File, onProgress?: (percent: number) => void) => Promise<string>
}>()

const emit = defineEmits<{
  success: [url: string, file: File]
  error: [message: string]
}>()

// ── State ───────────────────────────────────────────────
type State = 'idle' | 'uploading' | 'success' | 'error'
const state = ref<State>('idle')
const progress = ref(0)
const preview = ref<string | null>(null)
const errorMsg = ref('')

const canDrop = computed(() => state.value !== 'uploading' && state.value !== 'success')
const fileInputRef = ref<HTMLInputElement | null>(null)
function triggerPicker() {
  fileInputRef.value?.click()
}

// ── Upload flow ─────────────────────────────────────────
async function processFile(file: File) {
  errorMsg.value = ''

  if (!(await props.isAccepted(file))) {
    state.value = 'error'
    errorMsg.value = 'Format tidak didukung. Gunakan gambar (JPG, PNG, WEBP, GIF, HEIC).'
    emit('error', errorMsg.value)
    return
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    state.value = 'error'
    errorMsg.value = `Ukuran file melebihi batas ${props.maxSizeMb} MB.`
    emit('error', errorMsg.value)
    return
  }

  state.value = 'uploading'
  progress.value = 0
  const converted = await convertIfHeic(file)
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = URL.createObjectURL(converted)

  try {
    const key = await props.uploadFn(converted, (pct) => { progress.value = pct })
    state.value = 'success'
    emit('success', key, converted)
  } catch {
    state.value = 'error'
    errorMsg.value = 'Upload gagal. Coba ulangi.'
    emit('error', errorMsg.value)
  }
}

function reset() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = null
  errorMsg.value = ''
  progress.value = 0
  state.value = 'idle'
}

function onFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    state.value = 'idle'
    processFile(file)
  }
  input.value = ''
}
</script>

<template>
  <div class="w-full">
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptTypes"
      class="hidden"
      @change="onFileInputChange"
    />

    <UploaderDropZone
      :is-accepted="isAccepted"
      :max-size-mb="maxSizeMb"
      :remaining-slots="1"
      :can-drop="canDrop"
      class="relative overflow-hidden"
      :class="{
        'border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-accent/30 cursor-pointer':
          state === 'idle',
        'border-indigo-200 bg-gray-50': state === 'uploading',
        'border-emerald-200': state === 'success',
        'border-rose-200 bg-rose-50/40 cursor-pointer': state === 'error',
      }"
      active-class="border-indigo-400 bg-indigo-50 scale-[1.01]"
      @files="
        (files) => {
          state = 'idle'
          if (files[0]) processFile(files[0])
        }
      "
      @click="state === 'idle' || state === 'error' ? triggerPicker() : undefined"
    >
      <template #default="{ isDragOver }">
        <!-- Preview image -->
        <Transition name="preview-fade">
          <img
            v-if="preview"
            :src="preview"
            alt="Preview"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </Transition>

        <!-- Upload blur overlay -->
        <div
          v-if="preview && state === 'uploading'"
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <!-- Content (non-success) -->
        <div
          v-if="state !== 'success'"
          class="relative z-10 flex flex-col items-center justify-center gap-3 py-12 px-6 text-center min-h-[200px]"
        >
          <template v-if="state === 'idle' || isDragOver">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors"
              :class="isDragOver ? 'bg-indigo-100' : 'bg-white shadow-sm'"
            >
              <UploadCloud :size="28" :class="isDragOver ? 'text-indigo-600' : 'text-gray-400'" />
            </div>
            <div>
              <p
                class="text-sm font-semibold"
                :class="isDragOver ? 'text-indigo-700' : 'text-gray-700'"
              >
                {{ isDragOver ? 'Lepaskan untuk upload' : 'Klik atau drag & drop gambar' }}
              </p>
              <p class="text-xs mt-1" :class="isDragOver ? 'text-indigo-500' : 'text-gray-400'">
                JPG, PNG, WEBP, GIF, HEIC · Maks. {{ maxSizeMb }} MB
              </p>
            </div>
          </template>

          <template v-else-if="state === 'uploading'">
            <div
              class="w-14 h-14 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center"
            >
              <Loader2 :size="26" class="text-indigo-500 animate-spin" />
            </div>
            <div class="w-full max-w-xs">
              <div class="flex justify-between mb-1.5">
                <p class="text-sm font-semibold text-white drop-shadow">Mengupload...</p>
                <span class="text-xs font-bold text-white drop-shadow">{{ progress }}%</span>
              </div>
              <div class="w-full bg-white/30 rounded-full h-1.5">
                <div
                  class="bg-white rounded-full h-1.5 transition-all duration-300"
                  :style="{ width: `${progress}%` }"
                />
              </div>
            </div>
          </template>

          <template v-else-if="state === 'error'">
            <div class="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
              <AlertCircle :size="28" class="text-rose-500" />
            </div>
            <div>
              <p class="text-sm font-semibold text-rose-700">Upload gagal</p>
              <p class="text-xs text-rose-500 mt-0.5 max-w-xs leading-relaxed">{{ errorMsg }}</p>
            </div>
            <button
              @click.stop="reset"
              class="text-xs font-semibold text-rose-600 hover:text-danger underline underline-offset-2 transition-colors"
            >
              Coba lagi
            </button>
          </template>
        </div>

        <!-- Success badges -->
        <Transition name="success-in">
          <div v-if="state === 'success'" class="relative z-10 min-h-50">
            <div
              class="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1.5"
            >
              <CheckCircle2 :size="13" class="text-emerald-400 shrink-0" />
              <span class="text-xs font-semibold text-white">Upload berhasil</span>
            </div>
            <button
              @click.stop="reset"
              class="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white text-xs font-medium rounded-full px-2.5 py-1.5 transition-colors"
            >
              <UploadCloud :size="12" />
              Ganti
            </button>
          </div>
        </Transition>

        <!-- X button -->
        <button
          v-if="preview && state !== 'uploading' && state !== 'success'"
          @click.stop="reset"
          class="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
        >
          <X :size="14" />
        </button>
      </template>
    </UploaderDropZone>

    <div v-if="state === 'idle'" class="flex items-center gap-1.5 mt-2.5 px-1">
      <ImageIcon :size="12" class="text-gray-300" />
      <p class="text-xs text-gray-300">Hanya format gambar yang diterima</p>
    </div>
  </div>
</template>

<style scoped>
.preview-fade-enter-active {
  transition: opacity 0.3s ease;
}
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}
.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.success-in-enter-active {
  transition: opacity 0.3s ease 0.1s;
}
.success-in-enter-from {
  opacity: 0;
}
</style>
