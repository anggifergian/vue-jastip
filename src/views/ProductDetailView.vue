<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  MessageCircle,
  Loader2,
} from '@lucide/vue'
import { fetchProductBySlug } from '@/services/catalog'
import { useCartStore } from '@/stores/cart'
import { waLink } from '@/lib/whatsapp'
import AppButton from '@/components/ui/AppButton.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import ProductImageGallery from '@/components/product/ProductImageGallery.vue'
import { cn } from '@/lib/utils'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const slug = computed(() => route.params.slug as string)

const {
  data: product,
  isLoading,
  isError,
} = useQuery({
  queryKey: computed(() => ['product', slug.value]),
  queryFn: () => fetchProductBySlug(slug.value),
  placeholderData: (prev) => prev,
})

const isAvailable = computed(() => product.value?.availability.status !== 'OUT_OF_STOCK')
const isLowStock = computed(() => product.value?.availability.status === 'LOW_STOCK')
const qty = computed(() => (product.value ? cartStore.getQuantity(product.value.id) : 0))

const productWaLink = computed(() => {
  if (!product.value) return waLink()
  const msg = `Halo Yuna, saya tertarik dengan produk *${product.value.name}* tapi stoknya habis. Apakah ada restok?`
  return waLink(msg)
})

const galleryImages = computed(() => {
  if (!product.value) return []
  return product.value.images.map((img) => ({ url: img.url, alt: img.altText ?? undefined }))
})
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10 pb-24 lg:pb-10 overflow-x-hidden">
    <!-- Back -->
    <button
      @click="router.back()"
      class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
    >
      <ArrowRight :size="14" class="rotate-180" />
      Back
    </button>

    <Transition name="page-fade" mode="out-in">
      <!-- Loading skeleton -->
      <div v-if="isLoading" key="loading" class="lg:grid lg:grid-cols-2 lg:gap-12 animate-pulse">
        <div class="h-72 lg:aspect-square lg:h-auto bg-gray-200 rounded-xl mb-6 lg:mb-0" />
        <div class="space-y-4">
          <div class="h-4 bg-gray-200 rounded w-24" />
          <div class="h-7 bg-gray-200 rounded w-3/4" />
          <div class="h-7 bg-gray-200 rounded w-1/2" />
          <div class="h-4 bg-gray-200 rounded w-full mt-6" />
          <div class="h-4 bg-gray-200 rounded w-5/6" />
          <div class="h-12 bg-gray-200 rounded-xl mt-8" />
        </div>
      </div>

      <!-- Not found -->
      <div v-else-if="isError || !product" key="error" class="text-center py-24">
        <Package :size="48" class="mx-auto mb-4 text-muted-foreground/40" />
        <p class="font-semibold">Product not found</p>
        <AppButton variant="outline" class="mt-5" @click="router.push('/catalog')">
          Back to Catalog
        </AppButton>
      </div>

      <!-- Product detail -->
      <div v-else key="product" class="lg:grid lg:grid-cols-2 lg:gap-12">
        <!-- Image gallery -->
        <div class="mb-6 lg:mb-0 img-reveal" :class="!isAvailable && 'grayscale opacity-60'">
          <ProductImageGallery :images="galleryImages" :in-stock="isAvailable" />
        </div>

        <!-- Details -->
        <div class="flex flex-col gap-3">
          <!-- Name: i=1 -->
          <div class="detail-stagger" style="--i: 1">
            <h1 class="text-base lg:text-lg font-semibold leading-snug text-gray-800">
              {{ product.name }}
            </h1>
            <div class="flex items-center gap-2 mt-1.5">
              <span
                v-if="product.availability.status === 'IN_STOCK'"
                class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
              >
                Tersedia
              </span>
              <span
                v-else-if="isLowStock"
                class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
              >
                Sisa {{ Number(product.availability.remaining) }} item
              </span>
              <span
                v-else
                class="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full"
              >
                Stok Habis
              </span>
            </div>
          </div>

          <!-- Price: i=2 -->
          <div class="detail-stagger" style="--i: 2">
            <div>
              <p class="text-xl font-semibold text-gray-800">{{ product.price.formattedValue }}</p>

              <div class="text-gray-600 flex items-center gap-0.5 mt-0.5">
                <span class="text-[10px]">&asymp;</span>
                <p class="text-base">{{ product.price.idr.formattedValue }}</p>
              </div>
            </div>
          </div>

          <!-- Description: i=3 -->
          <div class="detail-stagger" style="--i: 3">
            <p class="text-sm text-muted-foreground leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- CTA desktop only: i=4 -->
          <div
            class="hidden lg:block detail-stagger border-t border-border pt-4 mt-auto"
            style="--i: 4"
          >
            <div v-if="isAvailable">
              <Transition name="cart-swap" mode="out-in">
                <AppButton
                  v-if="qty === 0"
                  key="add"
                  size="lg"
                  class="w-full rounded-full"
                  :disabled="isLoading"
                  @click="cartStore.addItem(product)"
                >
                  <Loader2 v-if="isLoading" :size="18" class="animate-spin" />
                  <ShoppingCart v-else :size="18" />
                  Titip Ini
                </AppButton>

                <div v-else key="qty" class="flex items-center gap-4">
                  <div
                    class="flex items-center bg-white rounded-full overflow-hidden border border-gray-100"
                  >
                    <button
                      @click="
                        qty === 1
                          ? cartStore.removeItem(product.id)
                          : cartStore.updateQuantity(product.id, qty - 1)
                      "
                      class="w-10 h-9 flex items-center justify-center transition-colors hover:bg-secondary"
                      :class="qty === 1 ? 'text-gray-400' : 'text-primary'"
                    >
                      <Trash2 v-if="qty === 1" :size="15" />
                      <Minus v-else :size="15" :stroke-width="2.5" />
                    </button>
                    <span class="w-9 text-center text-sm font-semibold text-gray-800">{{
                      qty
                    }}</span>
                    <button
                      @click="cartStore.addItem(product)"
                      class="w-10 h-9 flex items-center justify-center text-primary hover:bg-secondary transition-colors"
                    >
                      <Plus :size="15" :stroke-width="2.5" />
                    </button>
                  </div>
                  <AppButton
                    variant="outline"
                    size="lg"
                    class="flex-1 rounded-full"
                    @click="router.push('/cart')"
                  >
                    Lihat Keranjang
                  </AppButton>
                </div>
              </Transition>
            </div>
            <a v-else :href="productWaLink" target="_blank" rel="noopener noreferrer">
              <AppButton size="lg" class="w-full rounded-full">
                <MessageCircle :size="18" />
                Hubungi Yuna
              </AppButton>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </AppContainer>

  <!-- Mobile fixed bottom CTA -->
  <Teleport to="body">
    <div
      v-if="product || isLoading"
      class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border px-4 pt-4 pb-4 flex items-center justify-end"
    >
      <a
        v-if="!isLoading && !isAvailable"
        :href="productWaLink"
        target="_blank"
        rel="noopener noreferrer"
      >
        <AppButton size="lg" class="rounded-full w-56">
          <MessageCircle :size="18" />
          Hubungi Yuna
        </AppButton>
      </a>
      <div v-else class="w-full flex items-center justify-end">
        <Transition name="cart-swap" mode="out-in">
          <!-- qty = 0: just the CTA button -->
          <div v-if="qty === 0" key="add" class="w-full">
            <AppButton
              size="lg"
              class="rounded-full w-full"
              :disabled="isLoading"
              @click="cartStore.addItem(product!)"
            >
              <Loader2 v-if="isLoading" :size="18" class="animate-spin" />
              <ShoppingCart v-else :size="18" />
              Titip Ini
            </AppButton>
          </div>

          <!-- qty > 0: qty control + view cart -->
          <div v-else key="qty" class="flex items-center justify-between w-full">
            <div
              class="flex items-center bg-white rounded-full overflow-hidden border border-gray-100"
            >
              <button
                @click="
                  qty === 1
                    ? cartStore.removeItem(product!.id)
                    : cartStore.updateQuantity(product!.id, qty - 1)
                "
                class="w-10 h-9 flex items-center justify-center transition-colors hover:bg-secondary"
                :class="qty === 1 ? 'text-gray-400' : 'text-primary'"
              >
                <Trash2 v-if="qty === 1" :size="15" />
                <Minus v-else :size="15" :stroke-width="2.5" />
              </button>
              <span class="w-9 text-center text-sm font-semibold text-gray-800">{{ qty }}</span>
              <button
                @click="cartStore.addItem(product!)"
                class="w-10 h-9 flex items-center justify-center text-primary hover:bg-secondary transition-colors"
              >
                <Plus :size="15" :stroke-width="2.5" />
              </button>
            </div>
            <AppButton
              variant="outline"
              size="lg"
              class="rounded-full w-60"
              @click="router.push('/cart')"
            >
              Lihat Keranjang
            </AppButton>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.page-fade-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.page-fade-leave-active {
  transition: opacity 0.1s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
}

.img-reveal {
  animation: imgReveal 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes imgReveal {
  from {
    opacity: 0;
    transform: scale(1.03);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.detail-stagger {
  animation: staggerUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 40ms + 60ms);
}

@keyframes staggerUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-swap-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.cart-swap-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.cart-swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.cart-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
