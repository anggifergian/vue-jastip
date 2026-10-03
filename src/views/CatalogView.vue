<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ShoppingBag, SlidersHorizontal, X } from '@lucide/vue'
import { fetchProducts, fetchCategories } from '@/services/catalog'
import ProductCard from '@/components/catalog/ProductCard.vue'
import CatalogFilter from '@/components/catalog/CatalogFilter.vue'
import AppContainer from '@/components/layout/AppContainer.vue'

const route = useRoute()
const router = useRouter()

const selectedCategory = ref<string>((route.query.category as string) ?? 'all')
const isFilterOpen = ref(false)

watch(
  () => route.query.category,
  (cat) => { selectedCategory.value = (cat as string) ?? 'all' },
)

watch(selectedCategory, (cat) => {
  router.replace({ query: cat !== 'all' ? { category: cat } : {} })
})

const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
})

const { data: products, isLoading } = useQuery({
  queryKey: computed(() => ['products', selectedCategory.value]),
  queryFn: () => fetchProducts(selectedCategory.value),
})

const displayedProducts = computed(() => products.value ?? [])

const gridKey = computed(() => `products-${selectedCategory.value}`)
</script>

<template>
  <AppContainer spacing="pt-6 lg:pt-10 pb-10">
    <!-- Header -->
    <div class="mb-4 page-enter">
      <div class="flex items-center gap-2 mb-1">
        <ShoppingBag :size="20" class="text-indigo-600" />
        <h1 class="text-xl lg:text-2xl font-bold text-gray-900">Catalog</h1>
      </div>
      <p class="text-sm text-gray-500">Produk asli dari Jepang & Korea pilihan terbaik untuk kamu</p>
    </div>

    <!-- Mobile: sticky top strip -->
    <div class="lg:hidden sticky top-14 z-20 bg-gray-50 -mx-4 px-4 py-3 mb-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          <button
            @click="selectedCategory = 'all'"
            class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
            :class="selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'"
          >
            Semua
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
            :class="selectedCategory === cat.id ? 'text-white' : 'bg-white text-gray-600 border border-gray-200'"
            :style="selectedCategory === cat.id ? { backgroundColor: cat.color } : {}"
          >
            {{ cat.name }}
          </button>
        </div>

        <button
          @click="isFilterOpen = true"
          class="relative shrink-0 flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors"
          :class="selectedCategory !== 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'"
        >
          <SlidersHorizontal :size="13" />
          Filter
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8 lg:items-start">

      <!-- Desktop sidebar -->
      <aside class="hidden lg:block">
        <div class="sticky top-20">
          <CatalogFilter
            :category="selectedCategory"
            :categories="categories ?? []"
            @update:category="selectedCategory = $event"
          />
        </div>
      </aside>

      <!-- Product area -->
      <div>
        <Transition name="content-fade" mode="out-in">

          <!-- Loading skeleton -->
          <div v-if="isLoading" key="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="animate-pulse space-y-3">
              <div class="aspect-square bg-gray-100 rounded-xl" />
              <div class="h-3 bg-gray-100 rounded w-3/4" />
              <div class="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="displayedProducts.length === 0"
            key="empty"
            class="text-center py-20 text-gray-400"
          >
            <ShoppingBag :size="40" class="mx-auto mb-3 opacity-30" />
            <p class="font-medium text-sm">Belum ada produk</p>
          </div>

          <!-- Products -->
          <div v-else :key="gridKey">
            <TransitionGroup name="card" tag="div" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div
                v-for="(product, i) in displayedProducts"
                :key="product.id"
                :style="{ '--i': i }"
              >
                <ProductCard :product="product" />
              </div>
            </TransitionGroup>

            <p class="text-xs text-gray-400 text-center mt-8">
              {{ displayedProducts.length }} produk tersedia
            </p>
          </div>

        </Transition>
      </div>
    </div>
  </AppContainer>

  <!-- Mobile filter sheet backdrop -->
  <Transition name="backdrop-fade">
    <div v-if="isFilterOpen" class="lg:hidden fixed inset-0 bg-black/40 z-40" @click="isFilterOpen = false" />
  </Transition>

  <!-- Mobile filter sheet -->
  <Transition name="sheet-up">
    <div
      v-if="isFilterOpen"
      class="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
    >
      <div class="pt-3 pb-1 flex justify-center shrink-0">
        <div class="w-10 h-1 bg-gray-200 rounded-full" />
      </div>
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
        <h3 class="font-bold text-gray-800">Filter Kategori</h3>
        <div class="flex items-center gap-3">
          <button
            v-if="selectedCategory !== 'all'"
            @click="selectedCategory = 'all'"
            class="text-xs text-indigo-600 font-medium hover:underline"
          >
            Reset
          </button>
          <button @click="isFilterOpen = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <X :size="18" />
          </button>
        </div>
      </div>
      <div class="overflow-y-auto flex-1 px-5 py-5">
        <CatalogFilter
          :category="selectedCategory"
          :categories="categories ?? []"
          @update:category="selectedCategory = $event"
        />
      </div>
      <div class="px-5 py-4 border-t border-gray-100 shrink-0">
        <button
          @click="isFilterOpen = false"
          class="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Tampilkan {{ displayedProducts.length }} produk
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.page-enter {
  animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.content-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.content-fade-leave-active { transition: opacity 0.18s ease; }
.content-fade-enter-from { opacity: 0; transform: translateY(10px); }
.content-fade-leave-to  { opacity: 0; }

.card-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i, 0) * 35ms);
}
.card-leave-active { transition: opacity 0.2s ease; }
.card-enter-from { opacity: 0; transform: translateY(16px); }
.card-leave-to  { opacity: 0; }

.backdrop-fade-enter-active, .backdrop-fade-leave-active { transition: opacity 0.2s ease; }
.backdrop-fade-enter-from, .backdrop-fade-leave-to { opacity: 0; }

.sheet-up-enter-active { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.sheet-up-leave-active { transition: transform 0.25s ease; }
.sheet-up-enter-from, .sheet-up-leave-to { transform: translateY(100%); }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
