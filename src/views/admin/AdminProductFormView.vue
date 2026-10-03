<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Package, CheckCircle2 } from '@lucide/vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import ProductForm from '@/components/admin/ProductForm.vue'

const router = useRouter()

const submitSuccess = ref(false)
const formKey       = ref(0)

function onSuccess() {
  submitSuccess.value = true
}

function addAnother() {
  submitSuccess.value = false
  formKey.value++
}
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-400 mb-6">
      <button @click="router.push('/')" class="hover:text-indigo-600 transition-colors">
        Home
      </button>
      <ArrowRight :size="12" />
      <span class="text-gray-600 font-medium">Tambah Produk</span>
    </div>

    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
        <Package :size="20" class="text-indigo-600" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Tambah Produk</h1>
        <p class="text-sm text-gray-400">Isi detail produk yang akan ditampilkan di catalog</p>
      </div>
    </div>

    <!-- Success state -->
    <Transition name="content-fade" mode="out-in">
      <div v-if="submitSuccess" key="success" class="text-center py-20">
        <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 :size="32" class="text-emerald-500" />
        </div>
        <h2 class="text-lg font-bold text-gray-900 mb-1">Produk berhasil ditambahkan!</h2>
        <p class="text-sm text-gray-400 mb-6">
          Produk akan muncul di catalog setelah diverifikasi.
        </p>
        <div class="flex items-center justify-center gap-3">
          <AppButton variant="outline" @click="router.push({ name: 'admin-products' })">Lihat Catalog</AppButton>
          <AppButton @click="addAnother">Tambah Lagi</AppButton>
        </div>
      </div>

      <ProductForm v-else :key="formKey" @success="onSuccess" />
    </Transition>
  </AppContainer>
</template>

<style scoped>
.content-fade-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.content-fade-leave-active {
  transition: opacity 0.2s ease;
}
.content-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.content-fade-leave-to {
  opacity: 0;
}
</style>
