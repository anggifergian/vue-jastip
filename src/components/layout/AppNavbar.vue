<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ShoppingCart, Menu, LogOut } from '@lucide/vue'
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
  <nav
    class="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-background border-b border-border items-center pt-safe"
  >
    <div class="w-full md:max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 shrink-0">
        <img
          src="/android-chrome-192x192.png"
          alt="JastipYuna.store"
          class="h-8 w-8 rounded-md object-cover"
        />
        <span class="text-base text-gray-800 font-bold tracking-tight">JastipYuna</span>
      </RouterLink>

      <!-- Nav links + cart -->
      <div class="flex items-center gap-6">
        <RouterLink
          to="/catalog"
          class="text-sm font-medium text-gray-800 hover:text-primary transition-colors"
        >
          Catalog
        </RouterLink>
        <RouterLink
          to="/orders"
          class="text-sm font-medium text-gray-800 hover:text-primary transition-colors hidden"
        >
          Orders
        </RouterLink>
        <RouterLink to="/cart" class="relative text-gray-800 hover:text-primary transition-colors">
          <ShoppingCart :size="22" :stroke-width="1.5" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none"
          >
            {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
          </span>
        </RouterLink>
        <button
          v-if="session"
          @click="handleSignOut"
          class="text-gray-800 hover:text-danger transition-colors"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut :size="18" />
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile top navbar -->
  <nav
    class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border pt-safe"
  >
    <div class="flex items-center justify-between px-4 h-14">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 shrink-0">
        <img
          src="/android-chrome-192x192.png"
          alt="JastipYuna.store"
          class="h-7 w-7 rounded-md object-cover"
        />
        <span class="text-base text-gray-800 font-bold tracking-tight">JastipYuna</span>
      </RouterLink>

      <!-- Cart + Hamburger -->
      <div class="flex items-center gap-2 -mr-1">
        <RouterLink
          to="/cart"
          class="relative text-muted-foreground hover:text-primary transition-colors p-1"
        >
          <ShoppingCart :size="22" :stroke-width="1.5" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none"
          >
            {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
          </span>
        </RouterLink>
        <button
          @click="isSidebarOpen = true"
          class="text-muted-foreground hover:text-primary transition-colors p-1"
          aria-label="Open menu"
        >
          <Menu :size="24" />
        </button>
      </div>
    </div>
  </nav>

  <AppSidebar
    :is-open="isSidebarOpen"
    @close="isSidebarOpen = false"
    @open-categories="isCategoryModalOpen = true"
  />

  <CategoryModal :is-open="isCategoryModalOpen" @close="isCategoryModalOpen = false" />
</template>
