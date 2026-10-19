<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ClipboardList, RefreshCw, Search, ChevronLeft, ChevronRight } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import AdminOrderTable from '@/components/admin/AdminOrderTable.vue'
import { getAdminOrders } from '@/services/admin/orders'
import type { AdminOrder, OrderStatus, Pagination } from '@/services/admin/orders'

// ── State ─────────────────────────────────────────────────
const orders = ref<AdminOrder[]>([])
const isLoading = ref(true)
const fetchError = ref('')
const pagination = ref<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })

// ── Filters ───────────────────────────────────────────────
const search = ref('')
const filterStatus = ref<OrderStatus | ''>('')
const currentPage = ref(1)

const statusOptions: { value: OrderStatus | ''; label: string }[] = [
  { value: '',                  label: 'Semua Status' },
  { value: 'pending',           label: 'Pending' },
  { value: 'payment_uploaded',  label: 'Bukti Dikirim' },
  { value: 'payment_confirmed', label: 'Pembayaran OK' },
  { value: 'acknowledged',      label: 'Diproses' },
  { value: 'purchased',         label: 'Dibeli' },
  { value: 'arrived',           label: 'Tiba' },
  { value: 'shipped',           label: 'Dikirim' },
  { value: 'delivered',         label: 'Diterima' },
  { value: 'completed',         label: 'Selesai' },
  { value: 'cancelled',         label: 'Dibatalkan' },
  { value: 'refund_requested',  label: 'Refund Diminta' },
  { value: 'refunded',          label: 'Direfund' },
]

const hasFilter = computed(() => !!filterStatus.value || !!search.value)

// ── Fetch ─────────────────────────────────────────────────
async function load() {
  isLoading.value = true
  fetchError.value = ''
  try {
    const result = await getAdminOrders({
      page: currentPage.value,
      limit: 20,
      ...(filterStatus.value ? { status: filterStatus.value } : {}),
      ...(search.value.trim() ? { search: search.value.trim() } : {}),
    })
    orders.value = result.data
    pagination.value = result.pagination
  } catch {
    fetchError.value = 'Gagal memuat pesanan. Periksa koneksi dan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

function resetAndLoad() {
  currentPage.value = 1
  load()
}

watch(filterStatus, resetAndLoad)

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(resetAndLoad, 400)
})

onMounted(load)

// ── Actions ───────────────────────────────────────────────
function handleDelete(order: AdminOrder) {
  orders.value = orders.value.filter((o) => o.id !== order.id)
  pagination.value.total = Math.max(0, pagination.value.total - 1)
}

function prevPage() {
  if (currentPage.value <= 1) return
  currentPage.value--
  load()
}

function nextPage() {
  if (currentPage.value >= pagination.value.totalPages) return
  currentPage.value++
  load()
}
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <ClipboardList :size="18" class="text-indigo-600" />
        </div>
        <p class="text-gray-400 text-sm">
          {{ isLoading ? '...' : `${pagination.total} pesanan` }}
        </p>
      </div>

      <button
        @click="load"
        :disabled="isLoading"
        class="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-40"
        title="Refresh"
      >
        <RefreshCw :size="14" :class="isLoading ? 'animate-spin' : ''" />
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-2 mb-4">
      <!-- Search -->
      <div class="relative flex-1">
        <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          v-model="search"
          type="search"
          placeholder="Cari email atau nomor HP..."
          class="w-full h-8 pl-8 pr-3 rounded-md border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
        />
      </div>

      <!-- Status filter -->
      <select
        v-model="filterStatus"
        class="h-8 px-3 rounded-md border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <!-- Clear -->
      <button
        v-if="hasFilter"
        @click="search = ''; filterStatus = ''"
        class="h-8 px-3 rounded-md border border-gray-200 text-xs text-gray-400 hover:text-primary hover:border-primary/30 transition-colors"
      >
        Reset
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
        v-for="n in 8"
        :key="n"
        class="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0"
      >
        <div class="w-20 h-3 bg-gray-100 rounded" />
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-100 rounded w-2/3" />
          <div class="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div class="h-6 w-20 bg-gray-100 rounded-full hidden sm:block" />
        <div class="h-7 w-8 bg-gray-100 rounded-lg" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!fetchError && orders.length === 0" class="text-center py-24">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <ClipboardList :size="28" class="text-gray-300" />
      </div>
      <p class="text-sm font-medium text-gray-500 mb-1">Belum ada pesanan</p>
      <p class="text-xs text-gray-400">Pesanan dari customer akan muncul di sini</p>
    </div>

    <!-- Table -->
    <AdminOrderTable
      v-else
      :orders="orders"
      @delete="handleDelete"
    />

    <!-- Pagination -->
    <div
      v-if="!isLoading && pagination.totalPages > 1"
      class="flex items-center justify-between mt-4"
    >
      <p class="text-xs text-gray-400">
        Halaman {{ currentPage }} dari {{ pagination.totalPages }}
      </p>
      <div class="flex items-center gap-1.5">
        <button
          @click="prevPage"
          :disabled="currentPage <= 1"
          class="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-40"
        >
          <ChevronLeft :size="14" />
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage >= pagination.totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-40"
        >
          <ChevronRight :size="14" />
        </button>
      </div>
    </div>
  </AppContainer>
</template>
