<script setup lang="ts">
import { ShoppingBag, CreditCard, Package, Truck, CheckCircle2, ArrowRight } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'

const steps = [
  {
    icon: ShoppingBag,
    title: 'Pilih Produk',
    desc: 'Browse katalog dan pilih produk yang kamu inginkan dari Jepang atau Korea.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: ArrowRight,
    title: 'Buat Pesanan',
    desc: 'Isi form pesanan dengan detail produk, ukuran, dan alamat pengiriman.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: CreditCard,
    title: 'Bayar DP',
    desc: 'Lakukan pembayaran uang muka via transfer bank atau QRIS untuk konfirmasi pesanan.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Package,
    title: 'Kami Belikan',
    desc: 'Tim kami langsung membelikan produk pilihan kamu dari toko di Jepang/Korea.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Truck,
    title: 'Pengiriman',
    desc: 'Produk dikirim via jalur udara atau laut dari negara asal ke Indonesia.',
    color: 'bg-teal-100 text-teal-600',
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
      <div class="text-center mb-10">
        <p class="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-2">
          Simple & Easy
        </p>
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Cara Pesan</h2>
        <p class="text-gray-500 mt-3 text-sm lg:text-base max-w-md mx-auto">
          Hanya 6 langkah mudah untuk mendapatkan produk impianmu dari Jepang & Korea.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4"
        >
          <div class="shrink-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="step.color">
              <component :is="step.icon" :size="20" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold text-gray-400">{{ String(i + 1).padStart(2, '0') }}</span>
              <h3 class="text-sm font-bold text-gray-800">{{ step.title }}</h3>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </AppContainer>
  </section>
</template>
