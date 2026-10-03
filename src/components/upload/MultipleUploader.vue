<script setup lang="ts">
import { ref, computed } from 'vue'
import { ImageIcon, CheckCircle2, AlertCircle, X, Loader2, Plus, Eye } from '@lucide/vue'
import UploaderDropZone from './UploaderDropZone.vue'
import PhotoPreviewModal from './PhotoPreviewModal.vue'
import { useImageUpload } from '@/composables/useImageUpload'

const props = defineProps<{
  acceptTypes: string
  maxSizeMb: number
  maxPhotos: number
  isAccepted: (file: File) => Promise<boolean>
  uploadFn: (file: File, onProgress?: (percent: number) => void) => Promise<string>
}>()

const emit = defineEmits<{
  change: [keys: string[]]
  error: [message: string]
}>()

const dropError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const { photos, successPhotos, canAddMore, uploadedKeys, addFiles, retryPhoto, removePhoto } =
  useImageUpload({
    maxSizeMb: props.maxSizeMb,
    maxPhotos: props.maxPhotos,
    uploadFn: props.uploadFn,
    onSuccess: () => emit('change', uploadedKeys.value),
    onValidationError: (file, result) => {
      dropError.value =
        result.reason === 'size'
          ? `"${file.name}" melebihi batas ${props.maxSizeMb} MB.`
          : `"${file.name}" bukan format gambar yang didukung.`
    },
  })

const remainingSlots = computed(() => props.maxPhotos - photos.value.length)

// ── Preview ─────────────────────────────────────────────
const isPreviewOpen = ref(false)
const previewIndex = ref(0)

function openPreview(index: number) {
  previewIndex.value = index
  isPreviewOpen.value = true
}

// ── File picker ─────────────────────────────────────────
function triggerPicker() {
  fileInputRef.value?.click()
}

async function onFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const slots = remainingSlots.value
  const files = Array.from(input.files)
  dropError.value = ''

  if (files.length > slots) {
    dropError.value = `Hanya ${slots} foto lagi yang bisa ditambahkan (maks. ${props.maxPhotos}).`
  }

  await addFiles(files)
  input.value = ''
}
</script>

<template>
  <div class="w-full">
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptTypes"
      multiple
      class="hidden"
      @change="onFileInputChange"
    />

    <UploaderDropZone
      :is-accepted="isAccepted"
      :max-size-mb="maxSizeMb"
      :remaining-slots="remainingSlots"
      :can-drop="canAddMore"
      class="p-3 border-gray-200 bg-gray-50"
      active-class="border-indigo-400 bg-indigo-50"
      @files="(files) => addFiles(files)"
      @drop-error="(msg) => (dropError = msg)"
    >
      <template #default="{ isDragOver }">
        <!-- Photo grid -->
        <TransitionGroup name="photo" tag="div" class="grid grid-cols-3 sm:grid-cols-5 gap-2">
          <div
            v-for="photo in photos"
            :key="photo.id"
            class="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
          >
            <img
              :src="photo.previewUrl"
              :alt="photo.file.name"
              class="w-full h-full object-cover"
            />

            <!-- Uploading overlay -->
            <div
              v-if="photo.state === 'uploading'"
              class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1"
            >
              <Loader2 :size="18" class="text-white animate-spin" />
              <span class="text-[10px] font-semibold text-white">{{ photo.progress }}%</span>
            </div>

            <!-- Error overlay -->
            <div
              v-else-if="photo.state === 'error'"
              class="absolute inset-0 bg-rose-900/60 flex flex-col items-center justify-center gap-1 cursor-pointer"
              @click="retryPhoto(photo.id)"
            >
              <AlertCircle :size="18" class="text-rose-200" />
              <span class="text-[10px] text-rose-200 font-medium">Ulangi</span>
            </div>

            <!-- Success: preview button -->
            <button
              v-if="photo.state === 'success'"
              @click.stop="openPreview(successPhotos.findIndex((p) => p.id === photo.id))"
              class="absolute inset-0 w-full h-full cursor-zoom-in"
              aria-label="Preview foto"
            />

            <!-- Success: delete button -->
            <button
              v-if="photo.state === 'success'"
              @click.stop="removePhoto(photo.id)"
              class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Hapus foto"
            >
              <X :size="11" />
            </button>

            <!-- Success indicator -->
            <div
              v-if="photo.state === 'success'"
              class="absolute bottom-1.5 left-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <CheckCircle2 :size="10" class="text-white" />
            </div>
          </div>

          <!-- Add slot -->
          <button
            v-if="canAddMore"
            key="add-slot"
            type="button"
            @click.stop="triggerPicker"
            class="relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            :class="
              isDragOver
                ? 'border-indigo-400 bg-indigo-100 text-indigo-600'
                : 'border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500'
            "
          >
            <Plus :size="20" />
            <span class="text-[10px] font-medium leading-none">Tambah</span>
          </button>
        </TransitionGroup>

        <!-- Drag-over hint -->
        <Transition name="drag-hint">
          <div
            v-if="isDragOver && canAddMore"
            class="mt-2 text-center text-xs font-semibold text-indigo-600"
          >
            Lepaskan untuk menambah foto
          </div>
        </Transition>
      </template>
    </UploaderDropZone>

    <!-- Footer -->
    <div class="flex items-center justify-between mt-2 px-1 gap-2">
      <p v-if="dropError" class="text-xs text-rose-500 flex-1">{{ dropError }}</p>
      <p v-else class="text-xs text-gray-400 flex items-center gap-1 flex-1">
        <ImageIcon :size="11" />
        Drag & drop · maks. {{ maxPhotos }} foto, {{ maxSizeMb }} MB per foto
      </p>

      <button
        v-if="successPhotos.length > 0"
        @click="openPreview(0)"
        class="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        <Eye :size="13" />
        Preview
      </button>

      <span
        class="shrink-0 text-xs font-medium"
        :class="photos.length >= maxPhotos ? 'text-indigo-600' : 'text-gray-400'"
      >
        {{ photos.length }}/{{ maxPhotos }}
      </span>
    </div>

    <PhotoPreviewModal
      v-model="isPreviewOpen"
      :photos="successPhotos"
      :initial-index="previewIndex"
    />
  </div>
</template>

<style scoped>
.photo-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.photo-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.photo-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.photo-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.drag-hint-enter-active,
.drag-hint-leave-active {
  transition: opacity 0.15s ease;
}
.drag-hint-enter-from,
.drag-hint-leave-to {
  opacity: 0;
}
</style>
