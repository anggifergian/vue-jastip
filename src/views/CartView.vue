<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ShoppingCart, ShoppingBag, MessageCircle } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import CartItemRow from '@/components/cart/CartItemRow.vue'
import CartOverview from '@/components/cart/CartOverview.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { waLink, buildCartMessage } from '@/lib/whatsapp'

const cartStore = useCartStore()

const cartWaLink = computed(() => waLink(buildCartMessage(cartStore.items)))
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10 pb-28 lg:pb-10">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-6 page-enter">
      <ShoppingCart :size="20" class="text-primary" />
      <h1 class="text-xl lg:text-2xl font-bold">
        Daftar Titipan
        <Transition name="count-swap" mode="out-in">
          <span v-if="cartStore.totalItems > 0" :key="cartStore.totalItems" class="text-primary">
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
        <div class="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
          <ShoppingBag :size="36" class="text-primary/40" />
        </div>
        <div class="text-center">
          <p class="font-semibold">Belum ada titipan</p>
          <p class="text-sm text-muted-foreground mt-1">Temukan produk dari Jepang & Korea dan mulai titip</p>
        </div>
        <RouterLink
          to="/catalog"
          class="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
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
            <RouterLink to="/catalog" class="text-sm text-primary font-medium hover:underline">
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
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 pt-3 pb-3 pb-safe z-30 shadow-xl"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs text-muted-foreground">Daftar Titipan</p>
          <p class="text-base font-bold">{{ cartStore.totalItems }} item</p>
        </div>
        <a :href="cartWaLink" target="_blank" rel="noopener noreferrer">
          <AppButton>
            <MessageCircle :size="16" />
            Kirim via WhatsApp
          </AppButton>
        </a>
      </div>
    </div>
  </Transition>

</template>

<style scoped>
.count-swap-enter-active { transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.22, 1, 0.36, 1); }
.count-swap-leave-active { transition: opacity 0.1s ease; position: absolute; }
.count-swap-enter-from { opacity: 0; transform: translateY(-4px); }
.count-swap-leave-to  { opacity: 0; }

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
</style>
