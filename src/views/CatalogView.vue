<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ShoppingBag, SlidersHorizontal, X } from '@lucide/vue'
import { fetchProducts, fetchCategories } from '@/services/catalog'
import ProductCard from '@/components/catalog/ProductCard.vue'
import CatalogFilter from '@/components/catalog/CatalogFilter.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppBottomSheet from '@/components/ui/AppBottomSheet.vue'

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
          :class="selectedCategory !== 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary'"
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
          <div v-if="isLoading" key="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-2.5 gap-y-4">
            <div v-for="n in 6" :key="n" class="animate-pulse space-y-3">
              <div class="h-44 md:h-52 bg-gray-200 rounded-lg" />
              <div class="h-3 bg-gray-200 rounded w-3/4" />
              <div class="h-3 bg-gray-200 rounded w-1/2" />
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
            <p class="text-xs text-muted-foreground mb-3">
              {{ displayedProducts.length }} produk tersedia
            </p>
            <TransitionGroup name="card" tag="div" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-2.5 gap-y-4">
              <div
                v-for="(product, i) in displayedProducts"
                :key="product.id"
                :style="{ '--i': i }"
                class="h-full"
              >
                <ProductCard :product="product" />
              </div>
            </TransitionGroup>
          </div>

        </Transition>
      </div>
    </div>
  </AppContainer>

  <!-- Mobile filter sheet -->
  <AppBottomSheet
    :open="isFilterOpen"
    hide-above="lg"
    panel-class="max-h-[80vh] flex flex-col"
    @close="isFilterOpen = false"
  >
    <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
      <h3 class="font-bold text-gray-800">Filter Kategori</h3>
      <button @click="isFilterOpen = false" class="text-gray-400 hover:text-foreground transition-colors">
        <X :size="18" />
      </button>
    </div>
    <div class="overflow-y-auto flex-1 px-5 py-5">
      <CatalogFilter
        :category="selectedCategory"
        :categories="categories ?? []"
        @update:category="selectedCategory = $event; isFilterOpen = false"
      />
    </div>
  </AppBottomSheet>
</template>

<style scoped>
.page-enter {
  animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.card-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i, 0) * 35ms);
}
.card-leave-active { transition: opacity 0.2s ease; }
.card-enter-from { opacity: 0; transform: translateY(16px); }
.card-leave-to  { opacity: 0; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
