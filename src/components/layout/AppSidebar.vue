<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { X, User, Home, ShoppingBag, ShoppingCart, Grid3X3, Package } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{
  close: []
  openCategories: []
}>()

const cartStore = useCartStore()
const { session } = useAuth()
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="lg:hidden fixed inset-0 bg-black/50 z-40"
      @click="emit('close')"
    />
  </Transition>

  <Transition name="slide-left">
    <aside
      v-if="isOpen"
      class="lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span class="font-bold text-xl text-indigo-600 tracking-tight">JastipKu</span>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X :size="22" />
        </button>
      </div>

      <div class="px-5 py-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <User :size="20" class="text-indigo-600" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">Guest User</p>
            <p class="text-xs text-gray-400">Sign in for better experience</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          to="/"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          active-class="bg-indigo-50 text-indigo-600 font-semibold"
        >
          <Home :size="18" />
          <span class="text-sm">Home</span>
        </RouterLink>

        <RouterLink
          to="/catalog"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          active-class="bg-indigo-50 text-indigo-600 font-semibold"
        >
          <ShoppingBag :size="18" />
          <span class="text-sm">Catalog</span>
        </RouterLink>

        <RouterLink
          to="/cart"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          active-class="bg-indigo-50 text-indigo-600 font-semibold"
        >
          <ShoppingCart :size="18" />
          <span class="text-sm">Cart</span>
          <span
            v-if="cartStore.totalItems > 0"
            class="ml-auto bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold"
          >
            {{ cartStore.totalItems }}
          </span>
        </RouterLink>

        <div class="border-t border-gray-100 pt-3 mt-2">
          <button
            @click="() => { emit('close'); emit('openCategories') }"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Grid3X3 :size="18" />
            <span class="text-sm">Browse Categories</span>
          </button>
        </div>

        <div v-if="session" class="border-t border-gray-100 pt-3 mt-2">
          <p class="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Admin</p>
          <RouterLink
            to="/admin/products"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            active-class="bg-indigo-50 text-indigo-600 font-semibold"
          >
            <Package :size="18" />
            <span class="text-sm">Kelola Produk</span>
          </RouterLink>
        </div>
      </nav>
    </aside>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
