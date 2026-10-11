<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Package, RefreshCw, SlidersHorizontal } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AdminProductTable from '@/components/admin/AdminProductTable.vue'
import AdminProductFilterModal from '@/components/admin/AdminProductFilterModal.vue'
import { getAdminProducts } from '@/services/admin/product'
import type { AdminProduct } from '@/services/admin/product'

const router = useRouter()

// ── State ────────────────────────────────────────────────
const products = ref<AdminProduct[]>([])
const isLoading = ref(true)
const fetchError = ref('')

// ── Filter ───────────────────────────────────────────────
const isFilterOpen = ref(false)
const filterCategory = ref('')
const filterStatus = ref('')

const filterCount = computed(
  () => [filterCategory.value, filterStatus.value].filter(Boolean).length,
)
const hasActiveFilter = computed(() => filterCount.value > 0)

function onFilterApply(category: string, status: string) {
  filterCategory.value = category
  filterStatus.value = status
  isFilterOpen.value = false
  load()
}

function clearFilter() {
  filterCategory.value = ''
  filterStatus.value = ''
  load()
}

// ── Fetch ────────────────────────────────────────────────
async function load() {
  isLoading.value = true
  fetchError.value = ''
  try {
    const params: Record<string, string> = {}
    if (filterCategory.value) params.category = filterCategory.value
    if (filterStatus.value) params.status = filterStatus.value
    products.value = await getAdminProducts(params)
  } catch {
    fetchError.value = 'Gagal memuat produk. Periksa koneksi dan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

// ── Actions ──────────────────────────────────────────────
function handleDelete(product: AdminProduct) {
  products.value = products.value.filter((p) => p.id !== product.id)
}

function onPublished(product: AdminProduct) {
  const target = products.value.find((p) => p.id === product.id)
  if (target) target.status = 'published'
}

function onArchived(product: AdminProduct) {
  const target = products.value.find((p) => p.id === product.id)
  if (target) target.status = 'archived'
}

function openFilter() {
  isFilterOpen.value = !isFilterOpen.value
}
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Package :size="20" class="text-indigo-600" />
        </div>
        <div>
          <p class="text-gray-400 text-sm">
            {{ isLoading ? '...' : `${products.length} produk` }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="load"
          :disabled="isLoading"
          class="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw :size="14" :class="isLoading ? 'animate-spin' : ''" />
        </button>
        <AppButton size="sm" class="rounded-md" @click="router.push({ name: 'admin-product-new' })">
          <Plus :size="14" class="-ml-0.5" />
          Tambah Produk
        </AppButton>
      </div>
    </div>

    <div class="mb-4 flex items-center justify-end">
      <button
        @click="openFilter"
        class="px-3 gap-1.5 h-8 flex items-center justify-center rounded-md border text-xs transition-colors"
        :class="
          hasActiveFilter
            ? 'border-primary/40 text-primary bg-primary/5 hover:bg-primary/10'
            : 'border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30'
        "
        title="Filter"
      >
        <SlidersHorizontal :size="13" />
        <span>Filter</span>
        <span
          v-if="filterCount > 0"
          class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none"
        >
          {{ filterCount }}
        </span>
      </button>
    </div>

    <!-- Error -->
    <div
      v-if="fetchError"
      class="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 mb-6"
    >
      <p class="text-sm text-rose-600">{{ fetchError }}</p>
      <button
        @click="load"
        class="text-xs font-semibold text-rose-600 hover:text-danger underline underline-offset-2"
      >
        Coba lagi
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="isLoading" class="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div class="h-11 bg-gray-50 border-b border-gray-100" />
      <div
        v-for="n in 5"
        :key="n"
        class="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0"
      >
        <div class="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-100 rounded w-2/3" />
          <div class="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div class="h-6 w-16 bg-gray-100 rounded-full hidden sm:block" />
        <div class="h-7 w-20 bg-gray-100 rounded-lg" />
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

    <!-- Table -->
    <AdminProductTable
      v-else
      :products="products"
      @published="onPublished"
      @delete="handleDelete"
      @archived="onArchived"
    />
  </AppContainer>

  <AdminProductFilterModal
    :open="isFilterOpen"
    :category="filterCategory"
    :status="filterStatus"
    @close="isFilterOpen = false"
    @apply="onFilterApply"
  />
</template>
