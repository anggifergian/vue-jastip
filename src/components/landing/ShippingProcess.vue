<script setup lang="ts">
import { Package, Truck, CheckCircle2 } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'

const steps = [
  {
    emoji: '🛒',
    label: 'Pembelian',
    desc: 'Agen kami membeli produk langsung di Jepang 🇯🇵 atau Korea 🇰🇷',
    icon: Package,
    color: 'bg-indigo-600',
  },
  {
    emoji: '📦',
    label: 'Konsolidasi',
    desc: 'Semua barang dikumpulkan dan dikemas di gudang lokal negara asal',
    icon: Package,
    color: 'bg-violet-600',
  },
  {
    emoji: '✈️',
    label: 'Pengiriman',
    desc: 'Dikirim via jalur udara (air freight) atau laut (sea freight) ke Indonesia',
    icon: Truck,
    color: 'bg-pink-600',
  },
  {
    emoji: '🏢',
    label: 'Bea Cukai',
    desc: 'Proses customs & bea cukai di Indonesia ditangani oleh tim kami',
    icon: Package,
    color: 'bg-amber-600',
  },
  {
    emoji: '🚚',
    label: 'Kurir Lokal',
    desc: 'Paket diserahkan ke kurir lokal untuk pengiriman ke alamat kamu',
    icon: Truck,
    color: 'bg-teal-600',
  },
  {
    emoji: '🏠',
    label: 'Sampai!',
    desc: 'Produk tiba di depan pintu rumahmu dalam kondisi sempurna',
    icon: CheckCircle2,
    color: 'bg-green-600',
  },
]
</script>

<template>
  <section id="shipping-process" class="py-14 lg:py-20 bg-white">
    <AppContainer>
      <div class="text-center mb-12">
        <p class="text-indigo-600 text-sm font-semibold uppercase mb-2">
          Transparansi Proses
        </p>
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Proses Pengiriman</h2>
        <p class="text-gray-500 mt-3 text-sm lg:text-base max-w-md mx-auto">
          Dari tangan penjual di Jepang/Korea hingga ke tanganmu — kami pastikan setiap tahap berjalan aman.
        </p>
      </div>

      <!-- Timeline (mobile: vertical, desktop: horizontal) -->
      <div class="hidden lg:flex items-start gap-0">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="flex-1 flex flex-col items-center text-center relative"
        >
          <!-- Connector line -->
          <div
            v-if="i < steps.length - 1"
            class="absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-violet-200"
          />
          <!-- Circle -->
          <div
            class="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md"
            :class="step.color"
          >
            {{ step.emoji }}
          </div>
          <h3 class="text-sm font-bold text-gray-800 mb-1">{{ step.label }}</h3>
          <p class="text-xs text-gray-500 px-2 leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>

      <!-- Mobile vertical timeline -->
      <div class="lg:hidden space-y-0">
        <div v-for="(step, i) in steps" :key="i" class="flex gap-4">
          <!-- Left: dot + line -->
          <div class="flex flex-col items-center">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-md text-base"
              :class="step.color"
            >
              {{ step.emoji }}
            </div>
            <div v-if="i < steps.length - 1" class="w-0.5 flex-1 bg-gradient-to-b from-indigo-200 to-violet-200 my-1" />
          </div>
          <!-- Right: content -->
          <div class="pb-6 pt-1.5">
            <h3 class="text-sm font-bold text-gray-800 mb-1">{{ step.label }}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Shipping times -->
      <div class="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="bg-indigo-50 rounded-2xl p-4 text-center">
          <p class="text-2xl font-bold text-indigo-600">7–14</p>
          <p class="text-xs text-gray-600 mt-1">Hari (Air Freight)</p>
        </div>
        <div class="bg-violet-50 rounded-2xl p-4 text-center">
          <p class="text-2xl font-bold text-violet-600">21–30</p>
          <p class="text-xs text-gray-600 mt-1">Hari (Sea Freight)</p>
        </div>
        <div class="bg-green-50 rounded-2xl p-4 text-center">
          <p class="text-2xl font-bold text-green-600">100%</p>
          <p class="text-xs text-gray-600 mt-1">Produk Original</p>
        </div>
        <div class="bg-amber-50 rounded-2xl p-4 text-center">
          <p class="text-2xl font-bold text-amber-600">24/7</p>
          <p class="text-xs text-gray-600 mt-1">Update Tracking</p>
        </div>
      </div>
    </AppContainer>
  </section>
</template>
