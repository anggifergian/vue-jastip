<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Globe,
  ImageIcon,
  RefreshCw,
  Trash2,
  Archive,
  Pencil,
  Eye,
  MoreHorizontal,
} from '@lucide/vue'
import { AxiosError } from 'axios'
import { swal } from '@/lib/swal'
import { publishProduct, deleteProduct, archiveProduct } from '@/services/admin/product'
import type { AdminProduct } from '@/services/admin/product'
import AdminProductDetailModal from '@/components/product/AdminProductDetailModal.vue'
import AdminProductActionSheet from '@/components/admin/AdminProductActionSheet.vue'

const props = defineProps<{
  products: AdminProduct[]
}>()

const emit = defineEmits<{
  published: [product: AdminProduct]
  delete: [product: AdminProduct]
  archived: [product: AdminProduct]
}>()

const router = useRouter()
const publishingIds = ref<Set<string>>(new Set())
const deletingIds = ref<Set<string>>(new Set())
const archivingIds = ref<Set<string>>(new Set())
const previewProductId = ref<string | null>(null)
const isDetailOpen = ref(false)
const actionSheetProduct = ref<AdminProduct | null>(null)
const isActionSheetOpen = ref(false)

function openActionSheet(product: AdminProduct) {
  actionSheetProduct.value = product
  isActionSheetOpen.value = true
}

function closeActionSheet() {
  isActionSheetOpen.value = false
}

async function handlePublish(product: AdminProduct) {
  publishingIds.value = new Set([...publishingIds.value, product.id])
  try {
    await publishProduct(product.id)
    emit('published', { ...product, status: 'published' })
    swal.fire({
      icon: 'success',
      title: 'Produk dipublish!',
      text: `"${product.name}" sekarang sudah live.`,
      timer: 2500,
      showConfirmButton: false,
    })
  } catch (err: unknown) {
    const msg =
      (err instanceof AxiosError ? err.response?.data?.error : undefined) ??
      'Terjadi kesalahan. Periksa koneksi dan coba lagi.'
    swal.fire({ icon: 'error', title: 'Gagal publish', text: msg })
  } finally {
    const next = new Set(publishingIds.value)
    next.delete(product.id)
    publishingIds.value = next
  }
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-gray-100 text-gray-500 border-gray-200',
  archived: 'bg-amber-50 text-amber-700 border-amber-200',
}

function statusStyle(s: string) {
  return STATUS_STYLE[s] ?? STATUS_STYLE.draft
}

function formatDate(ts: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

function onDetailView(id: string) {
  previewProductId.value = id
  isDetailOpen.value = true
}

async function handleDeleteAction(product: AdminProduct) {
  const { isConfirmed } = await swal.fire({
    icon: 'warning',
    title: 'Hapus produk?',
    text: `"${product.name}" akan dihapus permanen.`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm delete',
    confirmButtonColor: '#ef4444',
  })
  if (!isConfirmed) return

  deletingIds.value = new Set([...deletingIds.value, product.id])
  try {
    await deleteProduct(product.id)
    emit('delete', product)
  } catch (err: unknown) {
    const msg =
      (err instanceof AxiosError ? err.response?.data?.error : undefined) ??
      'Gagal menghapus produk. Coba lagi.'
    swal.fire({ icon: 'error', title: 'Gagal hapus', text: msg })
  } finally {
    const next = new Set(deletingIds.value)
    next.delete(product.id)
    deletingIds.value = next
  }
}

async function handleArchiveAction(product: AdminProduct) {
  const { isConfirmed } = await swal.fire({
    icon: 'warning',
    title: 'Arsipkan produk?',
    text: `"${product.name}" akan diarsipkan dan tidak terlihat di katalog.`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Continue archive',
    confirmButtonColor: '#f59e0b',
  })
  if (!isConfirmed) return

  archivingIds.value = new Set([...archivingIds.value, product.id])
  try {
    await archiveProduct(product.id)
    emit('archived', product)
  } catch (err: unknown) {
    const msg =
      (err instanceof AxiosError ? err.response?.data?.error : undefined) ??
      'Gagal mengarsipkan produk. Coba lagi.'
    swal.fire({ icon: 'error', title: 'Gagal arsipkan', text: msg })
  } finally {
    const next = new Set(archivingIds.value)
    next.delete(product.id)
    archivingIds.value = next
  }
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-gray-100">
    <table class="w-full text-sm">
      <thead>
        <tr
          class="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-400"
        >
          <th class="px-4 py-3 w-16">Foto</th>
          <th class="px-4 py-3">Produk</th>
          <th class="px-4 py-3 hidden md:table-cell">Kategori</th>
          <th class="px-4 py-3 hidden sm:table-cell">Harga</th>
          <th class="px-4 py-3 hidden lg:table-cell">Stok</th>
          <th class="px-4 py-3 hidden lg:table-cell">Update</th>
          <th class="px-4 py-3 text-right">Aksi</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="product in products"
          :key="product.id"
          class="bg-white hover:bg-gray-50/60 transition-colors"
        >
          <!-- Image -->
          <td class="px-4 py-3">
            <div
              class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center"
            >
              <img
                v-if="product.main_image"
                :src="product.main_image"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
              <ImageIcon v-else :size="18" class="text-gray-300" />
            </div>
          </td>

          <!-- Name + Status -->
          <td class="px-4 py-3">
            <div class="flex items-center gap-1 mb-1">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize"
                :class="statusStyle(product.status)"
              >
                {{ product.status }}
              </span>
              <span
                v-if="product.featured_order != null"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200"
              >
                ★ #{{ product.featured_order }}
              </span>
            </div>
            <p
              @click="onDetailView(product.id)"
              class="font-medium text-gray-900 line-clamp-2 leading-snug max-w-[200px] cursor-pointer hover:text-primary transition-colors"
            >
              {{ product.name }}
            </p>
            <p class="text-xs text-gray-800 mt-0.5 sm:hidden">
              {{ product.price.formattedValue }}
            </p>
            <div class="text-neutral-600 flex items-center gap-0.5 mt-0.5">
              <span class="text-[10px]">&asymp;</span>
              <p class="text-xs">{{ product.price.idr.formattedValue }}</p>
            </div>
          </td>

          <!-- Category -->
          <td class="px-4 py-3 hidden md:table-cell text-gray-500">
            {{ product.category }}
          </td>

          <!-- Price -->
          <td class="px-4 py-3 hidden sm:table-cell">
            <div class="font-medium text-gray-800">{{ product.price.formattedValue }}</div>
            <div class="text-neutral-600 flex items-center gap-0.5 mt-0.5">
              <span class="text-[10px]">&asymp;</span>
              <p class="text-xs">{{ product.price.idr.formattedValue }}</p>
            </div>
          </td>

          <!-- Stock -->
          <td class="px-4 py-3 hidden lg:table-cell text-gray-600">
            {{ product.stock }}
          </td>

          <!-- Created -->
          <td class="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs whitespace-nowrap">
            {{ formatDate(product.updated_at ?? product.created_at) }}
          </td>

          <!-- Actions -->
          <td class="px-4 py-3">
            <!-- Mobile: ellipsis trigger -->
            <div class="flex justify-end md:hidden">
              <button
                @click="openActionSheet(product)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-accent hover:text-primary transition-colors"
                title="Aksi"
              >
                <MoreHorizontal :size="15" />
              </button>
            </div>

            <!-- Desktop: inline buttons -->
            <div class="hidden md:flex items-center justify-end gap-2">
              <!-- View -->
              <button
                @click="onDetailView(product.id)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-accent hover:text-primary transition-colors"
                title="Lihat detail"
              >
                <Eye :size="13" />
              </button>

              <!-- Edit -->
              <button
                @click="router.push({ name: 'admin-product-edit', params: { id: product.id } })"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-accent hover:text-primary transition-colors"
                title="Edit produk"
              >
                <Pencil :size="13" />
              </button>

              <!-- Publish -->
              <button
                v-if="product.status !== 'published'"
                @click="handlePublish(product)"
                :disabled="publishingIds.has(product.id)"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
                title="Publish"
              >
                <RefreshCw v-if="publishingIds.has(product.id)" :size="12" class="animate-spin" />
                <Globe v-else :size="12" />
                <span>Publish</span>
              </button>
              <span
                v-else
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600"
              >
                <Globe :size="12" />
                <span>Live</span>
              </span>

              <!-- Delete (draft / archived) -->
              <button
                v-if="product.status === 'draft' || product.status === 'archived'"
                @click="handleDeleteAction(product)"
                :disabled="deletingIds.has(product.id)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-danger/10 transition-colors disabled:opacity-40"
                title="Hapus"
              >
                <RefreshCw v-if="deletingIds.has(product.id)" :size="12" class="animate-spin" />
                <Trash2 v-else :size="13" />
              </button>

              <!-- Archive (published only) -->
              <button
                v-if="product.status === 'published'"
                @click="handleArchiveAction(product)"
                :disabled="archivingIds.has(product.id)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors disabled:opacity-40"
                title="Arsipkan"
              >
                <RefreshCw v-if="archivingIds.has(product.id)" :size="12" class="animate-spin" />
                <Archive v-else :size="13" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <AdminProductDetailModal
    :open="isDetailOpen"
    :product-id="previewProductId"
    @close="isDetailOpen = false"
    @edit="
      (p) => {
        isDetailOpen = false
        router.push({ name: 'admin-product-edit', params: { id: p.id } })
      }
    "
    @published="(p) => emit('published', p)"
    @delete="
      (p) => {
        isDetailOpen = false
        emit('delete', p)
      }
    "
    @archived="
      (p) => {
        isDetailOpen = false
        emit('archived', p)
      }
    "
  />

  <AdminProductActionSheet
    :open="isActionSheetOpen"
    :product="actionSheetProduct"
    @close="closeActionSheet"
    @view="
      (p) => {
        onDetailView(p.id)
      }
    "
    @published="(p) => emit('published', p)"
    @delete="(p) => emit('delete', p)"
    @archived="(p) => emit('archived', p)"
  />
</template>
