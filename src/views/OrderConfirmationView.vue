<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, ShoppingBag, ClipboardList } from '@lucide/vue'
import AppButton from '@/components/ui/AppButton.vue'

const route = useRoute()
const router = useRouter()
const orderNumber = route.params.orderNumber as string
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-4">
    <div class="w-full max-w-sm text-center page-enter">
      <!-- Success icon -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 :size="40" class="text-emerald-500" />
        </div>
      </div>

      <h1 class="text-2xl font-black text-gray-900 mb-2">Pesanan Berhasil!</h1>
      <p class="text-sm text-gray-500 leading-relaxed mb-6">
        Request titipanmu sudah kami terima. Kami akan segera menghubungimu untuk konfirmasi lebih lanjut.
      </p>

      <!-- Order number -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-8">
        <p class="text-xs font-semibold text-gray-400 uppercase mb-1">Nomor Pesanan</p>
        <p class="text-xl font-black text-gray-900">{{ orderNumber }}</p>
      </div>

      <!-- CTAs -->
      <div class="flex flex-col gap-3">
        <AppButton class="w-full" @click="router.push({ name: 'catalog' })">
          <ShoppingBag :size="16" />
          Kembali ke Catalog
        </AppButton>
        <AppButton variant="outline" class="w-full" @click="router.push({ name: 'orders' })">
          <ClipboardList :size="16" />
          Cek Pesanan
        </AppButton>
      </div>
    </div>
  </div>
</template>
