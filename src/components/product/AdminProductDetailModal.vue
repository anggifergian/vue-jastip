<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { X, Package, Pencil, ImagePlus, Globe, Trash2, Archive, Loader2 } from '@lucide/vue'
import { AxiosError } from 'axios'
import Swal from 'sweetalert2'
import { getAdminProduct, publishProduct, deleteProduct, archiveProduct } from '@/services/admin/product'
import type { AdminProduct } from '@/services/admin/product'
import ProductImageGallery from '@/components/product/ProductImageGallery.vue'
import ProductImagesModal from '@/components/product/ProductImagesModal.vue'
import { MAX_PRODUCT_PHOTOS } from '@/constants/product'

const props = defineProps<{
  open: boolean
  productId: string | null
}>()

const emit = defineEmits<{
  close: []
  edit: [product: AdminProduct]
  published: [product: AdminProduct]
  delete: [product: AdminProduct]
  archived: [product: AdminProduct]
}>()

const isUploadOpen = ref(false)
const isPublishing = ref(false)
const isDeleting = ref(false)
const isArchiving = ref(false)

const {
  data: product,
  isLoading,
  isError,
  refetch,
} = useQuery({
  queryKey: computed(() => ['admin-product', props.productId]),
  queryFn: () => getAdminProduct(props.productId!),
  enabled: computed(() => props.open),
})

const remainingPhotoSlots = computed(() => MAX_PRODUCT_PHOTOS - (product.value?.images.length ?? 0))

async function handlePublish() {
  if (!product.value || isPublishing.value) return
  isPublishing.value = true
  try {
    await publishProduct(product.value.id)
    emit('published', { ...product.value, status: 'published' })
    await refetch()
    Swal.fire({ icon: 'success', title: 'Produk dipublish!', text: `"${product.value.name}" sekarang sudah live.`, timer: 2500, showConfirmButton: false })
  } catch (err: unknown) {
    const msg = err instanceof AxiosError ? err.response?.data?.error : undefined
    const text = msg ?? 'Terjadi kesalahan. Periksa koneksi dan coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal publish', text: text })
  } finally {
    isPublishing.value = false
  }
}

async function onImagesUpdated() {
  isUploadOpen.value = false
  await refetch()
}

async function handleDelete() {
  if (!product.value || isDeleting.value) return
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    title: 'Hapus produk?',
    text: `"${product.value.name}" akan dihapus permanen.`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm delete',
    confirmButtonColor: '#ef4444',
  })
  if (!isConfirmed) return

  isDeleting.value = true
  try {
    await deleteProduct(product.value.id)
    emit('delete', product.value)
  } catch (err: unknown) {
    const msg = (err instanceof AxiosError ? err.response?.data?.error : undefined) ?? 'Gagal menghapus produk. Coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal hapus', text: msg })
  } finally {
    isDeleting.value = false
  }
}

async function handleArchive() {
  if (!product.value || isArchiving.value) return
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    title: 'Arsipkan produk?',
    text: `"${product.value.name}" akan diarsipkan dan tidak terlihat di katalog.`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Continue archive',
    confirmButtonColor: '#f59e0b',
  })
  if (!isConfirmed) return

  isArchiving.value = true
  try {
    await archiveProduct(product.value.id)
    emit('archived', product.value)
  } catch (err: unknown) {
    const msg = (err instanceof AxiosError ? err.response?.data?.error : undefined) ?? 'Gagal mengarsipkan produk. Coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal arsipkan', text: msg })
  } finally {
    isArchiving.value = false
  }
}

const galleryImages = computed(() => {
  if (!product.value) return []
  return product.value.images?.length
    ? product.value.images.map((img) => ({ url: img.url, alt: img.alt ?? undefined }))
    : product.value.main_image
      ? [{ url: product.value.main_image, alt: product.value.name }]
      : []
})

const formattedPrice = computed(() => {
  if (!product.value) return ''
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(product.value.price)
})

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-gray-100 text-gray-500 border-gray-200',
  archived: 'bg-amber-50 text-amber-700 border-amber-200',
}

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        @click.self="emit('close')"
      />
    </Transition>

    <Transition name="modal-up">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex flex-col bg-background lg:inset-6 lg:rounded-2xl overflow-hidden shadow-2xl"
      >
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <h2 class="text-sm font-semibold text-foreground truncate flex-1">
            {{ product?.name ?? 'Detail Produk' }}
          </h2>
          <button
            @click="emit('close')"
            class="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1">
          <!-- Loading -->
          <div v-if="isLoading" class="p-6 animate-pulse lg:grid lg:grid-cols-[340px_1fr] lg:gap-8">
            <div class="h-52 bg-muted rounded-xl mb-6 lg:mb-0" />
            <div class="space-y-3">
              <div class="h-4 bg-muted rounded w-32" />
              <div class="h-6 bg-muted rounded w-2/3" />
              <div class="h-8 bg-muted rounded w-1/3" />
              <div class="h-4 bg-muted rounded w-full mt-4" />
              <div class="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>

          <!-- Error -->
          <div
            v-else-if="isError || !product"
            class="flex flex-col items-center justify-center h-full py-20 text-center px-5"
          >
            <Package :size="40" class="mb-3 text-muted-foreground/40" />
            <p class="font-semibold text-sm">Produk tidak ditemukan</p>
          </div>

          <!-- Content -->
          <div v-else class="lg:grid lg:grid-cols-[340px_1fr] lg:gap-8 lg:p-6">
            <!-- Gallery + image actions -->
            <div class="shrink-0 flex flex-col gap-3">
              <ProductImageGallery :images="galleryImages" :in-stock="product.stock > 0" compact />
              <div class="flex items-center gap-2 px-5 lg:px-0">
                <button
                  @click="emit('edit', product)"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-accent transition-colors"
                >
                  <Pencil :size="14" />
                  Edit
                </button>
                <button
                  @click="isUploadOpen = true"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-accent transition-colors"
                >
                  <ImagePlus :size="14" />
                  Kelola Foto
                </button>
              </div>
            </div>

            <!-- Details -->
            <div class="px-5 lg:px-0 pt-5 lg:pt-0 flex flex-col gap-4">
              <!-- Badges -->
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full border capitalize"
                  :class="STATUS_STYLE[product.status] ?? STATUS_STYLE.draft"
                >
                  {{ product.status }}
                </span>
                <span
                  class="text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
                >
                  Stok: {{ product.stock }}
                </span>
                <span
                  v-if="product.category"
                  class="text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
                >
                  {{ product.category }}
                </span>
              </div>

              <!-- Name -->
              <h3 class="text-xl font-bold leading-snug">{{ product.name }}</h3>

              <!-- Price -->
              <p class="text-3xl font-bold text-primary">{{ formattedPrice }}</p>

              <!-- Description -->
              <p v-if="product.description" class="text-sm text-muted-foreground leading-relaxed">
                {{ product.description }}
              </p>

              <!-- Image count -->
              <p v-if="product.images.length > 1" class="text-xs text-muted-foreground">
                {{ product.images.length }} foto tersedia
              </p>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div
          class="shrink-0 border-t border-border px-5 py-3 flex items-center justify-end gap-2 bg-background"
        >
          <!-- Primary actions -->
          <div class="flex items-center gap-2">
            <!-- Publish -->
            <button
              v-if="product && product.status !== 'published'"
              @click="handlePublish"
              :disabled="isPublishing"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Loader2 v-if="isPublishing" :size="14" class="animate-spin" />
              <Globe v-else :size="14" />
              <span class="inline">Publish</span>
            </button>
            <span
              v-else-if="product"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700"
            >
              <Globe :size="14" />
              <span class="inline">Live</span>
            </span>

            <!-- Delete (draft only) -->
            <button
              v-if="product && (product.status === 'draft' || product.status === 'archived')"
              @click="handleDelete"
              :disabled="isDeleting"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-rose-50 text-rose-600 hover:bg-danger/10 transition-colors disabled:opacity-60"
            >
              <Loader2 v-if="isDeleting" :size="14" class="animate-spin" />
              <Trash2 v-else :size="14" />
              <span class="inline">Hapus</span>
            </button>

            <!-- Archive (published only) -->
            <button
              v-if="product && product.status === 'published'"
              @click="handleArchive"
              :disabled="isArchiving"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-60"
            >
              <Loader2 v-if="isArchiving" :size="14" class="animate-spin" />
              <Archive v-else :size="14" />
              <span class="inline">Arsipkan</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <ProductImagesModal
    v-if="product"
    :open="isUploadOpen"
    :product-id="product.id"
    :images="product.images"
    :remaining-slots="remainingPhotoSlots"
    @close="isUploadOpen = false"
    @updated="onImagesUpdated"
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
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}
.modal-up-leave-active {
  transition:
    transform 0.22s ease,
    opacity 0.2s ease;
}
.modal-up-enter-from,
.modal-up-leave-to {
  transform: translateY(32px);
  opacity: 0;
}

@media (min-width: 1024px) {
  .modal-up-enter-from,
  .modal-up-leave-to {
    transform: scale(0.98) translateY(12px);
  }
}
</style>
