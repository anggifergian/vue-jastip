<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { CatalogProduct } from '@/services/catalog'
import { cn } from '@/lib/utils'

const props = defineProps<{ product: CatalogProduct; hideIdrPrice?: boolean }>()

const isAvailable = computed(() => props.product.availability.status !== 'OUT_OF_STOCK')
const isLowStock = computed(() => props.product.availability.status === 'LOW_STOCK')

const primaryImage = computed(
  () => props.product.images.find((img) => img.imageType === 'PRIMARY') ?? props.product.images[0],
)
</script>

<template>
  <RouterLink
    :to="`/product/${product.slug}`"
    class="group flex flex-col h-full overflow-hidden rounded-lg bg-background transition-transform duration-200 group"
  >
    <!-- Image -->
    <div
      class="relative h-44 md:h-52 overflow-hidden bg-gray-100 rounded-lg"
      :class="!isAvailable && 'grayscale opacity-50'"
    >
      <img
        v-if="primaryImage"
        :src="primaryImage.url"
        :alt="primaryImage.altText ?? product.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 img-lazy"
        loading="lazy"
        @load="(e) => (e.target as HTMLElement).classList.add('loaded')"
      />
      <div v-else class="w-full h-full bg-gray-100" />

      <span
        v-if="!isAvailable"
        class="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500"
      >
        Stok Habis
      </span>
    </div>

    <!-- Info -->
    <div class="px-1 py-2.5 flex-1">
      <div class="mb-1">
        <p class="text-sm leading-5 line-clamp-2 text-neutral-800 hover:text-primary">
          {{ product.name }}
        </p>
      </div>

      <p class="font-semibold text-neutral-800 text-base mt-0.5 leading-6">
        {{ product.price.formattedValue }}
      </p>

      <div v-if="!hideIdrPrice" class="text-neutral-600 flex items-center gap-0.5 mt-0.5">
        <span class="text-[10px]">&asymp;</span>
        <p class="text-sm">{{ product.price.idr.formattedValue }}</p>
      </div>

      <!-- Availability status Low stock -->
      <p v-if="isLowStock" class="text-xs font-medium text-primary pt-1.5">
        Sisa {{ Number(product.availability.remaining) }} item
      </p>

      <!-- Availability status Out-of-stock -->
      <p v-else-if="!isAvailable" class="text-xs font-medium text-rose-500 pt-1.5">
        Tidak tersedia
      </p>
    </div>
  </RouterLink>
</template>
