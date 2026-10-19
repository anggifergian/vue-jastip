<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import { fetchFeaturedProducts } from '@/services/catalog'
import ProductCard from '@/components/catalog/ProductCard.vue'

const { data: products, isLoading } = useQuery({
  queryKey: ['featured'],
  queryFn: fetchFeaturedProducts,
})
</script>

<template>
  <section class="py-8 lg:py-12">
    <div class="md:max-w-6xl mx-auto w-full px-4 lg:px-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-grey-900 text-base md:text-lg font-semibold mb-1">Pilihan Terbaik</p>
        </div>
        <RouterLink
          to="/catalog"
          class="flex items-center gap-1 text-sm font-medium text-primary transition-colors shrink-0"
        >
          Lihat semua
          <ArrowRight :size="15" />
        </RouterLink>
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        <div v-for="i in 4" :key="i" class="animate-pulse shrink-0 w-40 sm:w-44">
          <div class="h-40 sm:h-44 bg-gray-200 rounded-lg mb-3" />
          <div class="h-3 bg-gray-200 rounded w-3/4 mb-2" />
          <div class="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      <!-- Products -->
      <div v-else-if="products?.length" class="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        <div v-for="product in products" :key="product.id" class="shrink-0 w-40 sm:w-44">
          <ProductCard :product="product" hide-idr-price />
        </div>
      </div>
    </div>
  </section>
</template>
