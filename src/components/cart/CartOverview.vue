<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle, Info } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import AppButton from '@/components/ui/AppButton.vue'

defineProps<{ compact?: boolean }>()

const cartStore = useCartStore()

// Update this to your WhatsApp number (format: 628xxxxxxxxxx)
const WA_NUMBER = '628123456789'

const waMessage = computed(() => {
  const lines = cartStore.items.map((item, i) => {
    const price = new Intl.NumberFormat(item.currency === 'JPY' ? 'ja-JP' : 'ko-KR', {
      style: 'currency',
      currency: item.currency,
      minimumFractionDigits: 0,
    }).format(item.price)
    const notes = item.notes ? `\n   Catatan: ${item.notes}` : ''
    return `${i + 1}. ${item.name} (x${item.quantity}) — ${price}${notes}`
  })

  return [
    'Halo, saya ingin menitipkan barang berikut:',
    '',
    ...lines,
    '',
    'Mohon info estimasi total harga (kurs + ongkir + jasa titip) dan ketersediaan barang. Terima kasih! 🙏',
  ].join('\n')
})

const waLink = computed(
  () => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage.value)}`,
)
</script>

<template>
  <div>
    <h3 class="font-bold text-gray-800 mb-4">Ringkasan Titipan</h3>

    <!-- Item count -->
    <div class="flex items-center justify-between py-3 border-b border-gray-100 mb-4">
      <span class="text-sm text-gray-600">Total item dititipkan</span>
      <span class="font-bold text-gray-900">
        {{ cartStore.totalItems }} item
      </span>
    </div>

    <!-- Per-item currency summary -->
    <div class="space-y-1.5 mb-4">
      <div
        v-for="item in cartStore.items"
        :key="item.id"
        class="flex items-start justify-between gap-2 text-xs text-gray-500"
      >
        <span class="line-clamp-1 flex-1">{{ item.name }}</span>
        <span class="shrink-0 font-medium text-gray-700">
          ×{{ item.quantity }}
        </span>
      </div>
    </div>

    <!-- Info box -->
    <div class="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5">
      <Info :size="14" class="text-amber-500 mt-0.5 shrink-0" />
      <p class="text-xs text-amber-700 leading-relaxed">
        Harga final dihitung berdasarkan <strong>kurs hari pembelian</strong>, bea masuk, ongkir internasional, dan jasa titip. Kami akan kirimkan invoice setelah request dikonfirmasi.
      </p>
    </div>

    <!-- WhatsApp CTA -->
    <a :href="waLink" target="_blank" rel="noopener noreferrer">
      <AppButton class="w-full" size="lg" :disabled="cartStore.totalItems === 0">
        <MessageCircle :size="18" />
        Kirim Request via WhatsApp
      </AppButton>
    </a>

    <p class="text-xs text-gray-400 text-center mt-3">
      Request dikirim ke tim JastipKu untuk dikonfirmasi
    </p>
  </div>
</template>
