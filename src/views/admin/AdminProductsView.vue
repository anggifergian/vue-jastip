<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Package, Trash2, Globe, ImageIcon, MoreVertical, RefreshCw } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { getAdminProducts, deleteProduct, updateProductStatus } from '@/services/product'
import type { Product } from '@/services/product'

const router = useRouter()

// ── State ────────────────────────────────────────────────
const products = ref<Product[]>([])
const isLoading = ref(true)
const fetchError = ref('')

// Per-card action loading: keyed by product id + action
const pending = ref<Record<string, boolean>>({})
function isPending(id: string, action: string) {
  return !!pending.value[`${id}:${action}`]
}
function setPending(id: string, action: string, val: boolean) {
  pending.value[`${id}:${action}`] = val
}

// ── Fetch ────────────────────────────────────────────────
async function load() {
  isLoading.value = true
  fetchError.value = ''
  try {
    products.value = await getAdminProducts()
  } catch {
    fetchError.value = 'Gagal memuat produk. Periksa koneksi dan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

// ── Actions ──────────────────────────────────────────────
async function handleDelete(product: Product) {
  if (!confirm(`Hapus "${product.name}"? Tindakan ini tidak dapat dibatalkan.`)) return

  setPending(product.id, 'delete', true)
  try {
    await deleteProduct(product.id)
    products.value = products.value.filter((p) => p.id !== product.id)
  } catch {
    alert('Gagal menghapus produk. Coba lagi.')
  } finally {
    setPending(product.id, 'delete', false)
  }
}

async function handlePublish(product: Product) {
  setPending(product.id, 'publish', true)
  try {
    await updateProductStatus(product.id, 'published')
    const target = products.value.find((p) => p.id === product.id)
    if (target) target.status = 'published'
  } catch {
    alert('Gagal mengubah status produk. Coba lagi.')
  } finally {
    setPending(product.id, 'publish', false)
  }
}

// ── Helpers ──────────────────────────────────────────────
function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ts))
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-gray-100   text-gray-500   border-gray-200',
  archived: 'bg-amber-50   text-amber-700  border-amber-200',
}
function statusStyle(s: string) {
  return STATUS_STYLE[s] ?? STATUS_STYLE.draft
}
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Package :size="20" class="text-indigo-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Produk</h1>
          <p class="text-sm text-gray-400">
            {{ isLoading ? '...' : `${products.length} produk` }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="load"
          :disabled="isLoading"
          class="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw :size="15" :class="isLoading ? 'animate-spin' : ''" />
        </button>
        <AppButton @click="router.push({ name: 'admin-product-new' })">
          <Plus :size="16" class="-ml-0.5" />
          Tambah Produk
        </AppButton>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="fetchError"
      class="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 mb-6"
    >
      <p class="text-sm text-rose-600">{{ fetchError }}</p>
      <button
        @click="load"
        class="text-xs font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2"
      >
        Coba lagi
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="n in 6"
        :key="n"
        class="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
      >
        <div class="aspect-[4/3] bg-gray-100" />
        <div class="p-4 space-y-2.5">
          <div class="h-3.5 bg-gray-100 rounded-full w-3/4" />
          <div class="h-3 bg-gray-100 rounded-full w-1/2" />
          <div class="h-3 bg-gray-100 rounded-full w-1/3 mt-3" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!fetchError && products.length === 0" class="text-center py-24">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Package :size="28" class="text-gray-300" />
      </div>
      <p class="text-sm font-medium text-gray-500 mb-1">Belum ada produk</p>
      <p class="text-xs text-gray-400 mb-5">Tambahkan produk pertamamu</p>
      <AppButton @click="router.push({ name: 'admin-product-new' })">
        <Plus :size="15" />
        Tambah Produk
      </AppButton>
    </div>

    <!-- Grid -->
    <TransitionGroup
      v-else
      name="card"
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200"
      >
        <!-- Image -->
        <div class="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          <img
            v-if="product.main_image"
            :src="product.main_image"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <ImageIcon :size="32" class="text-gray-200" />
          </div>

          <!-- Status badge -->
          <span
            class="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize"
            :class="statusStyle(product.status)"
          >
            {{ product.status }}
          </span>

          <!-- Image count -->
          <span
            v-if="product.images.length > 1"
            class="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm"
          >
            +{{ product.images.length - 1 }} foto
          </span>
        </div>

        <!-- Body -->
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
              {{ product.name }}
            </h3>
          </div>

          <p class="text-xs text-gray-400 mb-3">{{ product.category }}</p>

          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-bold text-indigo-600">{{ formatPrice(product.price) }}</span>
            <span class="text-xs text-gray-400">
              Stok: <span class="font-medium text-gray-600">{{ product.stock }}</span>
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-3 border-t border-gray-50">
            <!-- Publish -->
            <button
              v-if="product.status !== 'published'"
              @click="handlePublish(product)"
              :disabled="isPending(product.id, 'publish') || isPending(product.id, 'delete')"
              class="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Globe v-if="!isPending(product.id, 'publish')" :size="13" />
              <RefreshCw v-else :size="13" class="animate-spin" />
              Publish
            </button>
            <div
              v-else
              class="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold"
            >
              <Globe :size="13" />
              Published
            </div>

            <!-- Delete -->
            <button
              @click="handleDelete(product)"
              :disabled="isPending(product.id, 'delete') || isPending(product.id, 'publish')"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors disabled:opacity-50 shrink-0"
              title="Hapus produk"
            >
              <RefreshCw v-if="isPending(product.id, 'delete')" :size="13" class="animate-spin" />
              <Trash2 v-else :size="13" />
            </button>
          </div>

          <p class="text-[10px] text-gray-300 mt-2.5 text-right">
            {{ formatDate(product.created_at) }}
          </p>
        </div>
      </div>
    </TransitionGroup>
  </AppContainer>
</template>

<style scoped>
.card-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.card-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.card-enter-from {
  opacity: 0;
  transform: scale(0.97);
}
.card-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
.card-leave-active {
  position: absolute;
  width: 100%;
}
</style>
