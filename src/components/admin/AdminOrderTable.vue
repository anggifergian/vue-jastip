<script setup lang="ts">
import { Trash2, RefreshCw } from '@lucide/vue'
import { AxiosError } from 'axios'
import Swal from 'sweetalert2'
import { deleteOrder } from '@/services/admin/orders'
import type { AdminOrder, OrderStatus } from '@/services/admin/orders'
import { ref } from 'vue'

defineProps<{ orders: AdminOrder[] }>()

const emit = defineEmits<{
  delete: [order: AdminOrder]
}>()

const deletingIds = ref<Set<string>>(new Set())

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending:           'bg-gray-100 text-gray-500 border-gray-200',
  payment_uploaded:  'bg-sky-50 text-sky-600 border-sky-200',
  payment_confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
  acknowledged:      'bg-indigo-50 text-indigo-600 border-indigo-200',
  purchased:         'bg-violet-50 text-violet-600 border-violet-200',
  arrived:           'bg-amber-50 text-amber-600 border-amber-200',
  shipped:           'bg-purple-50 text-purple-600 border-purple-200',
  delivered:         'bg-teal-50 text-teal-600 border-teal-200',
  completed:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:         'bg-rose-50 text-rose-500 border-rose-200',
  refund_requested:  'bg-orange-50 text-orange-600 border-orange-200',
  refunded:          'bg-pink-50 text-pink-600 border-pink-200',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:           'Pending',
  payment_uploaded:  'Bukti Dikirim',
  payment_confirmed: 'Pembayaran OK',
  acknowledged:      'Diproses',
  purchased:         'Dibeli',
  arrived:           'Tiba',
  shipped:           'Dikirim',
  delivered:         'Diterima',
  completed:         'Selesai',
  cancelled:         'Dibatalkan',
  refund_requested:  'Refund Diminta',
  refunded:          'Direfund',
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(ts))
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(amount)
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

async function handleDelete(order: AdminOrder) {
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    title: 'Hapus pesanan?',
    text: `Pesanan dari ${order.user_email} akan dihapus permanen.`,
    showCancelButton: true,
    cancelButtonText: 'Batal',
    confirmButtonText: 'Hapus',
    confirmButtonColor: '#ef4444',
  })
  if (!isConfirmed) return

  deletingIds.value = new Set([...deletingIds.value, order.id])
  try {
    await deleteOrder(order.id)
    emit('delete', order)
  } catch (err: unknown) {
    const msg = (err instanceof AxiosError ? err.response?.data?.error : undefined)
      ?? 'Gagal menghapus pesanan. Coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal hapus', text: msg })
  } finally {
    const next = new Set(deletingIds.value)
    next.delete(order.id)
    deletingIds.value = next
  }
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-gray-100">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-400">
          <th class="px-4 py-3">ID</th>
          <th class="px-4 py-3">Customer</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3 hidden md:table-cell">Total</th>
          <th class="px-4 py-3 hidden lg:table-cell">DP</th>
          <th class="px-4 py-3 hidden lg:table-cell">Tanggal</th>
          <th class="px-4 py-3 text-right">Aksi</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="order in orders"
          :key="order.id"
          class="bg-white hover:bg-gray-50/60 transition-colors"
        >
          <!-- ID -->
          <td class="px-4 py-3">
            <span class="font-mono text-xs text-gray-500">{{ shortId(order.id) }}</span>
            <p v-if="order.tracking_number" class="text-[10px] text-gray-400 mt-0.5">
              📦 {{ order.tracking_number }}
            </p>
          </td>

          <!-- Customer -->
          <td class="px-4 py-3">
            <p class="font-medium text-gray-900 text-xs">{{ order.user_email }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ order.user_phone }}</p>
          </td>

          <!-- Status -->
          <td class="px-4 py-3">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize"
              :class="STATUS_STYLE[order.status]"
            >
              {{ STATUS_LABEL[order.status] }}
            </span>
          </td>

          <!-- Total -->
          <td class="px-4 py-3 hidden md:table-cell">
            <p class="font-medium text-gray-800 text-xs">{{ formatIDR(order.total_price) }}</p>
            <p v-if="order.flat_fee_total" class="text-[11px] text-gray-400 mt-0.5">
              +{{ formatIDR(order.flat_fee_total) }} fee
            </p>
          </td>

          <!-- DP -->
          <td class="px-4 py-3 hidden lg:table-cell text-xs text-gray-600">
            {{ formatIDR(order.dp_amount) }}
          </td>

          <!-- Date -->
          <td class="px-4 py-3 hidden lg:table-cell text-xs text-gray-400 whitespace-nowrap">
            {{ formatDate(order.created_at) }}
          </td>

          <!-- Actions -->
          <td class="px-4 py-3">
            <div class="flex items-center justify-end">
              <button
                @click="handleDelete(order)"
                :disabled="deletingIds.has(order.id)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-400 hover:bg-danger/10 transition-colors disabled:opacity-40"
                title="Hapus"
              >
                <RefreshCw v-if="deletingIds.has(order.id)" :size="12" class="animate-spin" />
                <Trash2 v-else :size="13" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
