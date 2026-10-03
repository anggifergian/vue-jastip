<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ShoppingCart, User, Grid3X3, Menu, LogOut } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import CategoryModal from '@/components/common/CategoryModal.vue'
import AppSidebar from './AppSidebar.vue'

const cartStore = useCartStore()
const { session, signOut } = useAuth()
const router = useRouter()
const isCategoryModalOpen = ref(false)
const isSidebarOpen = ref(false)

async function handleSignOut() {
  await signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <!-- Desktop navbar -->
  <nav class="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
      <!-- Desktop: profile / logout -->
      <div v-if="session" class="flex items-center gap-2">
        <User :size="16" class="text-gray-400 shrink-0" />
        <span class="text-sm text-gray-600 font-medium max-w-[160px] truncate">
          {{ session.user.email }}
        </span>
        <button
          @click="handleSignOut"
          class="ml-1 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-rose-500 transition-colors"
          title="Logout"
        >
          <LogOut :size="15" />
          Logout
        </button>
      </div>
      <RouterLink
        v-else
        to="/"
        class="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <User :size="20" />
        <span class="font-medium">Profile</span>
      </RouterLink>

      <RouterLink
        to="/"
        class="font-bold text-2xl text-indigo-600 tracking-tight select-none"
      >
        JastipKu
      </RouterLink>

      <div class="flex items-center gap-5">
        <button
          @click="isCategoryModalOpen = true"
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
        >
          <Grid3X3 :size="18" />
          <span>Categories</span>
        </button>

        <RouterLink to="/cart" class="relative text-gray-600 hover:text-indigo-600 transition-colors">
          <ShoppingCart :size="22" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none"
          >
            {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
          </span>
        </RouterLink>
      </div>
    </div>
  </nav>

  <!-- Mobile top navbar -->
  <nav
    class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm"
  >
    <div class="flex items-center justify-between px-4 h-14">
      <div class="flex items-center gap-1 -ml-1">
        <button
          @click="isSidebarOpen = true"
          class="text-gray-600 hover:text-indigo-600 transition-colors p-1"
          aria-label="Open menu"
        >
          <Menu :size="24" />
        </button>
        <button
          v-if="session"
          @click="handleSignOut"
          class="text-gray-400 hover:text-rose-500 transition-colors p-1"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut :size="18" />
        </button>
      </div>

      <RouterLink
        to="/"
        class="font-bold text-xl text-indigo-600 tracking-tight select-none"
      >
        JastipKu
      </RouterLink>

      <RouterLink
        to="/cart"
        class="relative text-gray-600 hover:text-indigo-600 transition-colors p-1 -mr-1"
      >
        <ShoppingCart :size="22" />
        <span
          v-if="cartStore.totalItems > 0"
          class="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none"
        >
          {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
        </span>
      </RouterLink>
    </div>
  </nav>

  <AppSidebar
    :is-open="isSidebarOpen"
    @close="isSidebarOpen = false"
    @open-categories="isCategoryModalOpen = true"
  />

  <CategoryModal :is-open="isCategoryModalOpen" @close="isCategoryModalOpen = false" />
</template>
