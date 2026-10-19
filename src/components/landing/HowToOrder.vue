<script setup lang="ts">
import { ShoppingBag, ShoppingCart, MessageCircle, CheckCircle2 } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'

const steps = [
  {
    icon: ShoppingBag,
    title: 'Browse Katalog',
    desc: 'Jelajahi katalog produk dari Jepang & Korea dan temukan yang kamu inginkan.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: ShoppingCart,
    title: 'Tambah ke Keranjang',
    desc: 'Pilih produk dan masukkan ke keranjang titipan kamu.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: MessageCircle,
    title: 'Kirim via WhatsApp',
    desc: 'Request titipan langsung dikirim ke Yuna via WhatsApp. Konfirmasi & bayar DP 50%.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: CheckCircle2,
    title: 'Terima di Rumah',
    desc: 'Produk tiba di alamat kamu dalam kondisi aman dan terkemas rapi.',
    color: 'bg-green-100 text-green-600',
  },
]
</script>

<template>
  <section id="how-to-order" class="py-14 lg:py-20 bg-gray-50">
    <AppContainer>
      <div class="text-center mb-6">
        <p class="text-indigo-600 text-sm font-semibold uppercase mb-2">Simple & Easy</p>
        <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Cara Pesan</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="bg-white rounded-lg p-5 border border-gray-100 flex gap-4"
        >
          <div class="shrink-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="step.color">
              <component :is="step.icon" :size="20" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-semibold text-gray-900">{{ step.title }}</h3>
            </div>
            <p class="text-xs text-gray-700 leading-normal">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </AppContainer>
  </section>
</template>
