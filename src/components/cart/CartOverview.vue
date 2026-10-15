<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle, Info } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import AppButton from '@/components/ui/AppButton.vue'
import { waLink, buildCartMessage } from '@/lib/whatsapp'

defineProps<{
  compact?: boolean
  checkout?: boolean
}>()

const router = useRouter()
const cartStore = useCartStore()

const cartWaLink = computed(() => waLink(buildCartMessage(cartStore.items)))
</script>

<template>
  <div>
    <h3 class="font-bold text-gray-800 mb-4">
      {{ checkout ? 'Ringkasan Pesanan' : 'Ringkasan Titipan' }}
    </h3>

    <!-- Item count -->
    <div class="flex items-center justify-between py-3 border-b border-gray-100 mb-4">
      <span class="text-sm text-gray-600">Total item dititipkan</span>
      <span class="font-bold text-gray-900">{{ cartStore.totalItems }} item</span>
    </div>

    <!-- Per-item list -->
    <div class="space-y-1.5 mb-4">
      <div
        v-for="item in cartStore.items"
        :key="item.id"
        class="flex items-start justify-between gap-2 text-xs text-gray-500"
      >
        <span class="line-clamp-1 flex-1">{{ item.name }}</span>
        <span class="shrink-0 font-medium text-gray-700">×{{ item.quantity }}</span>
      </div>
    </div>

    <!-- Info box -->
    <div class="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5">
      <Info :size="14" class="text-amber-500 mt-0.5 shrink-0" />
      <p class="text-xs text-amber-700 leading-relaxed">
        Harga final dihitung berdasarkan <strong>kurs hari pembelian</strong>, bea masuk, ongkir internasional, dan jasa titip. Kami akan kirimkan invoice setelah request dikonfirmasi.
      </p>
    </div>

    <!-- Cart mode: send via WhatsApp -->
    <template v-if="!checkout">
      <a :href="cartWaLink" target="_blank" rel="noopener noreferrer" class="block">
        <AppButton class="w-full" size="lg" :disabled="cartStore.totalItems === 0">
          <MessageCircle :size="18" />
          Kirim Request via WhatsApp
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
