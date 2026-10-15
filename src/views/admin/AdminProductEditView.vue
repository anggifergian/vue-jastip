<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Package, CheckCircle2 } from '@lucide/vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import ProductEditForm from '@/components/admin/ProductEditForm.vue'
import { getAdminProduct } from '@/services/admin/product'
import type { AdminProduct } from '@/services/admin/product'

const route  = useRoute()
const router = useRouter()

const product    = ref<AdminProduct | null>(null)
const isLoading  = ref(true)
const fetchError = ref('')
const saveSuccess = ref(false)

onMounted(async () => {
  try {
    product.value = await getAdminProduct(route.params.id as string)
  } catch {
    fetchError.value = 'Produk tidak ditemukan atau gagal dimuat.'
  } finally {
    isLoading.value = false
  }
})

async function onSuccess() {
  try {
    product.value = await getAdminProduct(route.params.id as string)
  } catch {
    // keep existing product data if refetch fails
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
  saveSuccess.value = true
}
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-400 mb-6">
      <button
        @click="router.push({ name: 'admin-products' })"
        class="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <ArrowLeft :size="13" />
        Produk
      </button>
      <span>/</span>
      <span class="text-gray-600 font-medium truncate max-w-[200px]">
        {{ product?.name ?? 'Edit Produk' }}
      </span>
    </div>

    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
        <Package :size="20" class="text-indigo-600" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Edit Produk</h1>
        <p class="text-sm text-gray-400">Ubah informasi produk</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="animate-pulse space-y-6">
      <div class="h-4 bg-gray-100 rounded w-1/3" />
      <div class="h-10 bg-gray-100 rounded-xl" />
      <div class="h-24 bg-gray-100 rounded-xl" />
      <div class="h-10 bg-gray-100 rounded-xl w-1/2" />
    </div>

    <!-- Error -->
    <div
      v-else-if="fetchError"
      class="text-center py-20"
    >
      <p class="text-sm text-rose-500 mb-4">{{ fetchError }}</p>
      <AppButton variant="outline" @click="router.push({ name: 'admin-products' })">
        Kembali ke Produk
      </AppButton>
    </div>

    <!-- Success -->
    <Transition v-else-if="saveSuccess" name="content-fade" mode="out-in">
      <div class="text-center py-20">
        <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 :size="32" class="text-emerald-500" />
        </div>
        <h2 class="text-lg font-bold text-gray-900 mb-1">Perubahan berhasil disimpan!</h2>
        <p class="text-sm text-gray-400 mb-6">Data produk sudah diperbarui.</p>
        <div class="flex items-center justify-center gap-3">
          <AppButton variant="outline" @click="router.push({ name: 'admin-products' })">
            Kembali ke Produk
          </AppButton>
          <AppButton @click="saveSuccess = false">Edit Lagi</AppButton>
        </div>
      </div>
    </Transition>

    <!-- Form -->
    <ProductEditForm
      v-else-if="product"
      :key="product.id + String(saveSuccess)"
      :product="product"
      @success="onSuccess"
    />
  </AppContainer>
</template>

