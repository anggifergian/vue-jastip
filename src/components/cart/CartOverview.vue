<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle, Info } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import AppButton from '@/components/ui/AppButton.vue'
import { waLink, buildCartMessage } from '@/lib/whatsapp'
import { formatMoney } from '@/lib/money'

defineProps<{
  compact?: boolean
  checkout?: boolean
}>()

const router = useRouter()
const cartStore = useCartStore()

const cartWaLink = computed(() => waLink(buildCartMessage(cartStore.items)))
</script>

<template>
  <div class="rounded-lg bg-neutral-50 text-neutral-600 py-4 px-6 border border-gray-100">
    <h3 class="font-bold text-gray-900 mb-2">
      {{ checkout ? 'Detail Pesanan' : 'Detail Titipan' }}
    </h3>

    <div class="mb-4">
      <!-- Summary -->
      <div class="border-b border-gray-200 py-4 mb-4 space-y-1.5">
        <div class="flex items-baseline justify-between gap-4">
          <span class="text-sm">Total item</span>
          <p class="text-sm shrink-0">{{ cartStore.totalItems }} item</p>
        </div>
        <div class="flex items-baseline justify-between gap-4">
          <span class="text-sm">Total barang (JPY)</span>
          <p class="text-sm shrink-0">{{ formatMoney(cartStore.totalPrice, 'JPY') }}</p>
        </div>
        <div class="flex items-baseline justify-between gap-4">
          <span class="text-sm">Estimasi total (IDR)</span>
          <div class="flex items-center gap-0.5 shrink-0">
            <span class="text-[10px]">&asymp;</span>
            <p class="text-sm">{{ formatMoney(cartStore.totalPriceIDR, 'IDR') }}</p>
          </div>
        </div>
      </div>

      <div class="text-gray-900">
        <span class="text-sm font-medium">Estimasi harga barang</span>
        <p class="text-lg font-bold">
          {{ formatMoney(cartStore.totalPriceIDR, 'IDR') }}
        </p>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <Info :size="14" />
        <p class="text-xs">Belum termasuk biaya Bea cukai dan ongkos kirim</p>
      </div>
    </div>

    <!-- Cart mode: send via WhatsApp -->
    <template v-if="!checkout">
      <a :href="cartWaLink" target="_blank" rel="noopener noreferrer" class="block">
        <AppButton class="w-full rounded-full" size="lg" :disabled="cartStore.totalItems === 0">
          <MessageCircle :size="18" />
          Kirim via WhatsApp
        </AppButton>
      </a>
      <p class="text-xs text-gray-400 text-center mt-3">
        Request dikirim ke tim JastipYuna untuk dikonfirmasi
      </p>
    </template>

    <!-- Checkout mode: edit cart link -->
    <template v-else>
      <button
        class="w-full text-xs text-primary font-medium hover:underline text-center"
        @click="router.push({ name: 'cart' })"
      >
        ← Edit keranjang
      </button>
    </template>
  </div>
</template>
