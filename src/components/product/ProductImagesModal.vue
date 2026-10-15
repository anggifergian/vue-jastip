<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AxiosError } from 'axios'
import { X, Plus, CheckCircle2, Circle, Trash2, Loader2, ImageIcon, CheckSquare } from '@lucide/vue'
import { deleteProductImages, addProductImages } from '@/services/admin/product'
import type { AdminProductImage } from '@/services/admin/product'
import { presignUpload } from '@/services/upload'
import ImageUploadModal from '@/components/common/ImageUploadModal.vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  productId: string
  images: AdminProductImage[]
  remainingSlots: number
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const isSelecting = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const isDeleting = ref(false)
const deleteError = ref('')
const isUploadOpen = ref(false)

const selectedCount = computed(() => selectedIds.value.size)
const hasSelection = computed(() => selectedIds.value.size > 0)

function toggleImage(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

function enterSelectMode() {
  isSelecting.value = true
  selectedIds.value = new Set()
}

function exitSelectMode() {
  isSelecting.value = false
  selectedIds.value = new Set()
  deleteError.value = ''
}

async function handleDelete() {
  if (!hasSelection.value || isDeleting.value) return
  if (!confirm(`Hapus ${selectedCount.value} foto? Tindakan ini tidak dapat dibatalkan.`)) return
  const keys = props.images.filter((img) => selectedIds.value.has(img.id)).map((img) => img.key)
  isDeleting.value = true
  deleteError.value = ''
  try {
    await deleteProductImages(props.productId, keys)
    exitSelectMode()
    emit('updated')
  } catch (err: unknown) {
    const apiError = err instanceof AxiosError ? err.response?.data?.error : undefined
    deleteError.value = apiError ?? 'Gagal menghapus foto. Coba lagi.'
  } finally {
    isDeleting.value = false
  }
}

async function saveUploadedImages(keys: string[]) {
  await addProductImages(props.productId, keys)
}

function onUploadSaved() {
  isUploadOpen.value = false
  emit('updated')
}

function handleClose() {
  exitSelectMode()
  emit('close')
}

watch(
  () => props.open,
  (val) => {
    if (!val) {
      setTimeout(() => {
        exitSelectMode()
        isUploadOpen.value = false
      }, 250)
    }
  },
)

</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="modal-up">
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-[61] flex flex-col bg-background rounded-t-2xl h-[90dvh] overflow-hidden lg:inset-0 lg:m-auto lg:rounded-2xl lg:max-w-lg lg:h-[640px]"
      >
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <h2 class="text-sm font-semibold flex-1">Kelola Foto</h2>
          <span class="text-xs text-muted-foreground">
            {{ images.length }} foto
          </span>

          <!-- Pilih toggle -->
          <button
            v-if="images.length > 0"
            @click="isSelecting ? exitSelectMode() : enterSelectMode()"
            :class="cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              isSelecting
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )"
          >
            <X v-if="isSelecting" :size="13" />
            <CheckSquare v-else :size="13" />
            {{ isSelecting ? 'Batal' : 'Pilih' }}
          </button>

          <button
            @click="handleClose"
            class="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-5">
          <!-- Empty -->
          <div
            v-if="images.length === 0"
            class="h-full flex flex-col items-center justify-center gap-3 text-center"
          >
            <div class="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <ImageIcon :size="24" class="text-muted-foreground" />
            </div>
            <p class="text-sm font-medium">Belum ada foto</p>
            <p class="text-xs text-muted-foreground">Tambahkan foto untuk produk ini</p>
            <button
              v-if="remainingSlots > 0"
              @click="isUploadOpen = true"
              class="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus :size="15" />
              Tambah Foto
            </button>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            <button
              v-for="img in images"
              :key="img.id"
              type="button"
              @click="isSelecting ? toggleImage(img.id) : undefined"
              :class="cn(
                'relative aspect-square rounded-xl overflow-hidden bg-muted transition-all',
                isSelecting ? 'cursor-pointer' : 'cursor-default',
                isSelecting && selectedIds.has(img.id) && 'ring-2 ring-primary ring-offset-2',
              )"
            >
              <img :src="img.url" :alt="img.alt ?? ''" class="w-full h-full object-cover" />

              <!-- Checklist overlay -->
              <Transition name="check-fade">
                <div
                  v-if="isSelecting"
                  class="absolute inset-0 bg-black/20 flex items-start justify-end p-1.5"
                >
                  <div
                    :class="cn(
                      'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                      selectedIds.has(img.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-black/40 text-white',
                    )"
                  >
                    <CheckCircle2 v-if="selectedIds.has(img.id)" :size="14" />
                    <Circle v-else :size="14" />
                  </div>
                </div>
              </Transition>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div
          :class="cn(
            'relative z-10 shrink-0 border-t px-5 py-3 flex items-center gap-2 transition-colors',
            deleteError ? 'border-danger/20 bg-danger/5' : 'border-border',
          )"
        >
          <!-- Normal mode -->
          <template v-if="!isSelecting">
            <p class="text-xs text-muted-foreground flex-1">
              {{ remainingSlots > 0 ? `${remainingSlots} slot tersisa` : 'Batas foto tercapai' }}
            </p>
            <button
              :disabled="remainingSlots <= 0"
              @click="isUploadOpen = true"
              :class="cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                remainingSlots > 0
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
              )"
            >
              <Plus :size="15" />
              Tambah Foto
            </button>
          </template>

          <!-- Select mode -->
          <template v-else>
            <div class="flex-1 min-w-0">
              <p v-if="deleteError" class="text-xs text-danger truncate">{{ deleteError }}</p>
              <p v-else class="text-xs text-muted-foreground">
                {{ hasSelection ? `${selectedCount} foto dipilih` : 'Pilih foto yang ingin dihapus' }}
              </p>
            </div>
            <button
              :disabled="!hasSelection || isDeleting"
              @click="handleDelete"
              :class="cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                hasSelection && !isDeleting
                  ? 'bg-danger text-white hover:bg-danger/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
              )"
            >
              <Loader2 v-if="isDeleting" :size="14" class="animate-spin" />
              <Trash2 v-else :size="14" />
              Hapus{{ hasSelection ? ` (${selectedCount})` : '' }}
            </button>
          </template>
        </div>


      </div>
    </Transition>
  </Teleport>

  <ImageUploadModal
    :open="isUploadOpen"
    :upload-fn="presignUpload"
    :save-fn="saveUploadedImages"
    :max-photos="remainingSlots"
    :max-size-mb="5"
    @close="isUploadOpen = false"
    @saved="onUploadSaved"
  />
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

.check-fade-enter-active,
.check-fade-leave-active {
  transition: opacity 0.15s ease;
}
.check-fade-enter-from,
.check-fade-leave-to {
  opacity: 0;
}

</style>
