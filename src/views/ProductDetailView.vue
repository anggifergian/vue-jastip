<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ArrowRight, ShoppingCart, Plus, Minus, Package } from '@lucide/vue'
import { fetchProduct } from '@/services/catalog'
import { useCartStore } from '@/stores/cart'
import AppButton from '@/components/ui/AppButton.vue'
import AppContainer from '@/components/layout/AppContainer.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const id = computed(() => route.params.id as string)

const { data: product, isLoading, isError } = useQuery({
  queryKey: computed(() => ['product', id.value]),
  queryFn: () => fetchProduct(id.value),
})

const qty = computed(() => (product.value ? cartStore.getQuantity(product.value.id) : 0))

const formattedPrice = computed(() => {
  if (!product.value) return ''
  return new Intl.NumberFormat(product.value.currency === 'JPY' ? 'ja-JP' : 'ko-KR', {
    style: 'currency',
    currency: product.value.currency,
    minimumFractionDigits: 0,
  }).format(product.value.price)
})

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-amber-100 text-amber-700',
  New: 'bg-green-100 text-green-700',
  Limited: 'bg-rose-100 text-rose-700',
}
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10">
    <!-- Back -->
    <button
      @click="router.back()"
      class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
    >
      <ArrowRight :size="14" class="rotate-180" />
      Back
    </button>

    <!-- Loading ↔ error ↔ product crossfade -->
    <Transition name="page-fade" mode="out-in">

      <!-- Loading skeleton -->
      <div v-if="isLoading" key="loading" class="lg:grid lg:grid-cols-2 lg:gap-12 animate-pulse">
        <div class="aspect-square bg-gray-100 rounded-2xl mb-6 lg:mb-0" />
        <div class="space-y-4">
          <div class="h-4 bg-gray-100 rounded w-24" />
          <div class="h-7 bg-gray-100 rounded w-3/4" />
          <div class="h-7 bg-gray-100 rounded w-1/2" />
          <div class="h-4 bg-gray-100 rounded w-full mt-6" />
          <div class="h-4 bg-gray-100 rounded w-5/6" />
          <div class="h-12 bg-gray-100 rounded-xl mt-8" />
        </div>
      </div>

      <!-- Not found -->
      <div v-else-if="isError || !product" key="error" class="text-center py-24">
        <Package :size="48" class="mx-auto mb-4 text-gray-300" />
        <p class="font-semibold text-gray-700">Product not found</p>
        <AppButton variant="outline" class="mt-5" @click="router.push('/catalog')">
          Back to Catalog
        </AppButton>
      </div>

      <!-- Product detail -->
      <div v-else key="product" class="lg:grid lg:grid-cols-2 lg:gap-12">

        <!-- Image -->
        <div class="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-6 lg:mb-0 img-reveal">
          <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
          <div
            v-if="!product.inStock"
            class="absolute inset-0 bg-white/70 flex items-center justify-center"
          >
            <span class="text-sm font-semibold text-gray-500 bg-white px-4 py-2 rounded-full border">
              Out of Stock
            </span>
          </div>
        </div>

        <!-- Details -->
        <div class="flex flex-col gap-4">

          <!-- Badges: i=0 -->
          <div class="detail-stagger" style="--i: 0">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                v-if="product.badge"
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="badgeColors[product.badge] ?? 'bg-indigo-100 text-indigo-700'"
              >
                {{ product.badge }}
              </span>
              <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {{ product.origin === 'Japan' ? '🇯🇵' : '🇰🇷' }} {{ product.origin }}
              </span>
            </div>
          </div>

          <!-- Name: i=1 -->
          <div class="detail-stagger" style="--i: 1">
            <h1 class="text-xl lg:text-2xl font-bold text-gray-900 leading-snug">
              {{ product.name }}
            </h1>
          </div>

          <!-- Price: i=2 -->
          <div class="detail-stagger" style="--i: 2">
            <div>
              <p class="text-2xl font-bold text-indigo-600">{{ formattedPrice }}</p>
              <p class="text-xs text-gray-400 mt-1">
                Harga di toko asal · Harga final dikonfirmasi via invoice
              </p>
            </div>
          </div>

          <!-- Description: i=3 -->
          <div class="detail-stagger" style="--i: 3">
            <p class="text-sm text-gray-500 leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Meta: i=4 -->
          <div class="detail-stagger" style="--i: 4">
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span>⚖️ {{ product.weight }}g</span>
              <span class="text-gray-200">|</span>
              <span>📦 Est. 7–21 hari kerja</span>
            </div>
          </div>

          <!-- CTA: i=5 -->
          <div class="detail-stagger border-t border-gray-100 pt-4 mt-auto" style="--i: 5">
            <div v-if="product.inStock">
              <Transition name="cart-swap" mode="out-in">
                <AppButton
                  v-if="qty === 0"
                  key="add"
                  size="lg"
                  class="w-full"
                  @click="cartStore.addItem(product)"
                >
                  <ShoppingCart :size="18" />
                  Titip Ini
                </AppButton>

                <div v-else key="qty" class="flex items-center gap-4">
                  <div class="flex items-center bg-indigo-50 rounded-xl p-1.5 gap-2">
                    <button
                      @click="cartStore.updateQuantity(product.id, qty - 1)"
                      :disabled="qty === 1"
                      class="w-9 h-9 rounded-lg bg-white border border-indigo-100 flex items-center justify-center transition-colors shadow-sm"
                      :class="qty === 1 ? 'text-indigo-200 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'"
                    >
                      <Minus :size="16" />
                    </button>
                    <span class="w-8 text-center font-bold text-indigo-700">{{ qty }}</span>
                    <button
                      @click="cartStore.addItem(product)"
                      class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
                    >
                      <Plus :size="16" />
                    </button>
                  </div>
                  <AppButton variant="outline" size="lg" class="flex-1" @click="router.push('/cart')">
                    Lihat Daftar
                  </AppButton>
                </div>
              </Transition>
            </div>

            <p v-else class="text-sm text-gray-400 text-center py-2">
              This item is currently out of stock
            </p>
          </div>

        </div>
      </div>
    </Transition>
  </AppContainer>
</template>

<style scoped>
.page-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.page-fade-leave-active { transition: opacity 0.2s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(14px); }
.page-fade-leave-to  { opacity: 0; }

.img-reveal {
  animation: imgReveal 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 80ms;
}

@keyframes imgReveal {
  from { opacity: 0; transform: scale(1.05); }
  to   { opacity: 1; transform: scale(1); }
}

.detail-stagger {
  animation: staggerUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 120ms);
}

@keyframes staggerUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cart-swap-enter-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.cart-swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.cart-swap-enter-from { opacity: 0; transform: translateY(8px); }
.cart-swap-leave-to  { opacity: 0; transform: translateY(-6px); }
</style>
