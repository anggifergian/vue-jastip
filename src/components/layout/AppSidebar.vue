<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { X, Home, ShoppingBag, ShoppingCart, Grid3X3, Package, LogOut } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{
  close: []
  openCategories: []
}>()

const cartStore = useCartStore()
const { session, signOut } = useAuth()
const router = useRouter()

async function handleSignOut() {
  emit('close')
  await signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="lg:hidden fixed inset-0 bg-black/40 z-40" @click="emit('close')" />
  </Transition>

  <Transition name="slide-right">
    <aside
      v-if="isOpen"
      class="lg:hidden fixed right-0 top-0 h-full w-72 bg-background z-50 shadow-2xl flex flex-col border-l border-border rounded-l-lg"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-border">
        <RouterLink to="/" @click="emit('close')" class="flex items-center gap-2.5">
          <img
            src="/android-chrome-192x192.png"
            alt="JastipYuna.store"
            class="h-7 w-7 rounded-md object-cover"
          />
          <span class="text-base font-bold tracking-tight">JastipYuna</span>
        </RouterLink>
        <button
          @click="emit('close')"
          class="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          to="/"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
          active-class="bg-accent text-primary font-semibold"
        >
          <Home :size="18" />
          <span class="text-sm">Home</span>
        </RouterLink>

        <RouterLink
          to="/catalog"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
          active-class="bg-accent text-primary font-semibold"
        >
          <ShoppingBag :size="18" />
          <span class="text-sm">Catalog</span>
        </RouterLink>

        <RouterLink
          to="/orders"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
          active-class="bg-accent text-primary font-semibold"
        >
          <Package :size="18" />
          <span class="text-sm">Orders</span>
        </RouterLink>

        <RouterLink
          to="/cart"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
          active-class="bg-accent text-primary font-semibold"
        >
          <ShoppingCart :size="18" />
          <span class="text-sm">Cart</span>
          <span
            v-if="cartStore.totalItems > 0"
            class="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-semibold"
          >
            {{ cartStore.totalItems }}
          </span>
        </RouterLink>

        <div class="border-t border-border pt-3 mt-2">
          <button
            @click="
              () => {
                emit('close')
                emit('openCategories')
              }
            "
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
          >
            <Grid3X3 :size="18" />
            <span class="text-sm">Browse Categories</span>
          </button>
        </div>

        <div v-if="session" class="border-t border-border pt-3 mt-2">
          <p
            class="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Admin
          </p>
          <RouterLink
            to="/admin/products"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
            active-class="bg-accent text-primary font-semibold"
          >
            <Package :size="18" />
            <span class="text-sm">Kelola Produk</span>
          </RouterLink>
        </div>
      </nav>

      <!-- Logout pinned at bottom -->
      <div v-if="session" class="px-4 py-4 border-t border-border">
        <button
          @click="handleSignOut"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut :size="18" />
          <span class="text-sm">Logout</span>
        </button>
      </div>
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

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
