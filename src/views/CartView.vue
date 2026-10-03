<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ShoppingCart, ShoppingBag, ChevronUp } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import CartItemRow from '@/components/cart/CartItemRow.vue'
import CartOverview from '@/components/cart/CartOverview.vue'
import CartBottomSheet from '@/components/cart/CartBottomSheet.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'

const cartStore = useCartStore()
const isSheetOpen = ref(false)
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10 pb-28 lg:pb-10">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-6 page-enter">
      <ShoppingCart :size="20" class="text-indigo-600" />
      <h1 class="text-xl lg:text-2xl font-bold text-gray-900">
        Daftar Titipan
        <Transition name="count-swap" mode="out-in">
          <span v-if="cartStore.totalItems > 0" :key="cartStore.totalItems" class="text-indigo-600">
            ({{ cartStore.totalItems }})
          </span>
        </Transition>
      </h1>
    </div>

    <!-- Empty ↔ cart content crossfade -->
    <Transition name="content-fade" mode="out-in">

      <!-- Empty state -->
      <div
        v-if="cartStore.items.length === 0"
        key="empty"
        class="flex flex-col items-center justify-center py-24 gap-5"
      >
        <div class="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
          <ShoppingBag :size="36" class="text-indigo-300" />
        </div>
        <div class="text-center">
          <p class="font-semibold text-gray-700">Belum ada titipan</p>
          <p class="text-sm text-gray-400 mt-1">Temukan produk dari Jepang & Korea dan mulai titip</p>
        </div>
        <RouterLink
          to="/catalog"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Lihat Catalog
        </RouterLink>
      </div>

      <!-- Cart content -->
      <div v-else key="content" class="lg:grid lg:grid-cols-3 lg:gap-8">
        <!-- Cart items (2/3) -->
        <div class="lg:col-span-2">
          <TransitionGroup name="cart-item" tag="div">
            <CartItemRow
              v-for="item in cartStore.items"
              :key="item.id"
              :item="item"
            />
          </TransitionGroup>

          <div class="mt-4 flex items-center justify-between">
            <RouterLink to="/catalog" class="text-sm text-indigo-600 font-medium hover:underline">
              ← Tambah item lain
            </RouterLink>
            <AppButton variant="danger" size="sm" @click="cartStore.clearCart()">
              Kosongkan
            </AppButton>
          </div>
        </div>

        <!-- Cart overview (1/3) — Desktop only -->
        <div class="hidden lg:block lg:col-span-1 cart-overview-enter">
          <CartOverview />
        </div>
      </div>

    </Transition>
  </AppContainer>

  <!-- Mobile: fixed bottom bar -->
  <Transition name="bottom-bar">
    <div
      v-if="cartStore.items.length > 0"
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-30 shadow-xl"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs text-gray-500">Daftar Titipan</p>
          <p class="text-base font-bold text-gray-900">
            {{ cartStore.totalItems }} item
          </p>
        </div>
        <AppButton @click="isSheetOpen = true">
          <ChevronUp :size="16" />
          Kirim Request
        </AppButton>
      </div>
    </div>
  </Transition>

  <!-- Mobile: slide-up bottom sheet -->
  <CartBottomSheet :is-open="isSheetOpen" @close="isSheetOpen = false" />
</template>

<style scoped>
.page-enter {
  animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.count-swap-enter-active { transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.22, 1, 0.36, 1); }
.count-swap-leave-active { transition: opacity 0.1s ease; position: absolute; }
.count-swap-enter-from { opacity: 0; transform: translateY(-4px); }
.count-swap-leave-to  { opacity: 0; }

.content-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.content-fade-leave-active { transition: opacity 0.2s ease; }
.content-fade-enter-from { opacity: 0; transform: translateY(12px); }
.content-fade-leave-to  { opacity: 0; }

.cart-item-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.cart-item-enter-from { opacity: 0; transform: translateX(-12px); }

.cart-item-leave-active {
  transition: opacity 0.25s ease, max-height 0.3s ease 0.05s, padding 0.3s ease 0.05s, margin 0.3s ease 0.05s;
  overflow: hidden;
  max-height: 200px;
}
.cart-item-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.cart-overview-enter {
  animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}

.bottom-bar-enter-active { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease; }
.bottom-bar-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.bottom-bar-enter-from { transform: translateY(100%); opacity: 0; }
.bottom-bar-leave-to  { transform: translateY(100%); opacity: 0; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
