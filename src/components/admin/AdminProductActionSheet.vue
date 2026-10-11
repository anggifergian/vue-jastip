<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Globe, Pencil, Eye, Trash2, Archive, RefreshCw, Loader2 } from '@lucide/vue'
import { AxiosError } from 'axios'
import Swal from 'sweetalert2'
import { publishProduct, deleteProduct, archiveProduct } from '@/services/admin/product'
import type { AdminProduct } from '@/services/admin/product'
import AppBottomSheet from '@/components/ui/AppBottomSheet.vue'

const props = defineProps<{
  open: boolean
  product: AdminProduct | null
}>()

const emit = defineEmits<{
  close: []
  view: [product: AdminProduct]
  edit: [product: AdminProduct]
  published: [product: AdminProduct]
  delete: [product: AdminProduct]
  archived: [product: AdminProduct]
}>()

const router = useRouter()
const isPublishing = ref(false)
const isDeleting = ref(false)
const isArchiving = ref(false)

function close() {
  emit('close')
}

function onView() {
  if (!props.product) return
  emit('view', props.product)
  close()
}

function onEdit() {
  if (!props.product) return
  router.push({ name: 'admin-product-edit', params: { id: props.product.id } })
  close()
}

async function onPublish() {
  if (!props.product || isPublishing.value) return
  isPublishing.value = true
  try {
    await publishProduct(props.product.id)
    emit('published', { ...props.product, status: 'published' })
    close()
    Swal.fire({ icon: 'success', title: 'Produk dipublish!', text: `"${props.product.name}" sekarang sudah live.`, timer: 2500, showConfirmButton: false })
  } catch (err: unknown) {
    const msg = (err instanceof AxiosError ? err.response?.data?.error : undefined) ?? 'Terjadi kesalahan. Periksa koneksi dan coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal publish', text: msg })
  } finally {
    isPublishing.value = false
  }
}

async function onDelete() {
  if (!props.product || isDeleting.value) return
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    title: 'Hapus produk?',
    text: `"${props.product.name}" akan dihapus permanen.`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm delete',
    confirmButtonColor: '#ef4444',
  })
  if (!isConfirmed) return

  isDeleting.value = true
  try {
    await deleteProduct(props.product.id)
    emit('delete', props.product)
    close()
  } catch (err: unknown) {
    const msg = (err instanceof AxiosError ? err.response?.data?.error : undefined) ?? 'Gagal menghapus produk. Coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal hapus', text: msg })
  } finally {
    isDeleting.value = false
  }
}

async function onArchive() {
  if (!props.product || isArchiving.value) return
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    title: 'Arsipkan produk?',
    text: `"${props.product.name}" akan diarsipkan dan tidak terlihat di katalog.`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Continue archive',
    confirmButtonColor: '#f59e0b',
  })
  if (!isConfirmed) return

  isArchiving.value = true
  try {
    await archiveProduct(props.product.id)
    emit('archived', props.product)
    close()
  } catch (err: unknown) {
    const msg = (err instanceof AxiosError ? err.response?.data?.error : undefined) ?? 'Gagal mengarsipkan produk. Coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal arsipkan', text: msg })
  } finally {
    isArchiving.value = false
  }
}
</script>

<template>
  <AppBottomSheet :open="open" hide-above="md" @close="close">
    <!-- Product name -->
    <div class="px-5 pt-2 pb-3 border-b border-gray-100">
      <p class="text-xs text-gray-400 mb-0.5">Aksi untuk</p>
      <p class="text-sm font-semibold text-gray-900 line-clamp-1">{{ product?.name }}</p>
    </div>

    <!-- Action list -->
    <div class="px-4 py-3 space-y-1">
      <!-- View -->
      <button
        @click="onView"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Eye :size="17" class="text-gray-400 shrink-0" />
        Lihat Detail
      </button>

      <!-- Edit -->
      <button
        @click="onEdit"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Pencil :size="17" class="text-gray-400 shrink-0" />
        Edit Produk
      </button>

      <!-- Publish -->
      <button
        v-if="product && product.status !== 'published'"
        @click="onPublish"
        :disabled="isPublishing"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
      >
        <Loader2 v-if="isPublishing" :size="17" class="animate-spin shrink-0" />
        <Globe v-else :size="17" class="shrink-0" />
        Publish
      </button>
      <div
        v-else-if="product"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-600 bg-emerald-50/60"
      >
        <Globe :size="17" class="shrink-0" />
        Live
      </div>

      <!-- Delete (draft / archived) -->
      <button
        v-if="product && (product.status === 'draft' || product.status === 'archived')"
        @click="onDelete"
        :disabled="isDeleting"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
      >
        <Loader2 v-if="isDeleting" :size="17" class="animate-spin shrink-0" />
        <Trash2 v-else :size="17" class="shrink-0" />
        Hapus Produk
      </button>

      <!-- Archive (published only) -->
      <button
        v-if="product && product.status === 'published'"
        @click="onArchive"
        :disabled="isArchiving"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
      >
        <Loader2 v-if="isArchiving" :size="17" class="animate-spin shrink-0" />
        <Archive v-else :size="17" class="shrink-0" />
        Arsipkan
      </button>
    </div>

    <div class="h-4" />
  </AppBottomSheet>
</template>
