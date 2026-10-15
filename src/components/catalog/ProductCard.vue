<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { CatalogProduct } from '@/services/catalog'
import { cn } from '@/lib/utils'

const props = defineProps<{ product: CatalogProduct }>()

const isAvailable = computed(() => props.product.availability.status !== 'OUT_OF_STOCK')
const isLowStock = computed(() => props.product.availability.status === 'LOW_STOCK')

const primaryImage = computed(
  () => props.product.images.find((img) => img.imageType === 'PRIMARY') ?? props.product.images[0],
)
</script>

<template>
  <RouterLink
    :to="`/product/${product.slug}`"
    class="group flex flex-col h-full overflow-hidden rounded-lg border border-gray-200 bg-background transition-transform duration-200 hover:-translate-y-1 hover:shadow-xs"
  >
    <!-- Image -->
    <div
      class="relative h-44 md:h-52 overflow-hidden bg-gray-100"
      :class="!isAvailable && 'grayscale opacity-50'"
    >
      <img
        v-if="primaryImage"
        :src="primaryImage.url"
        :alt="primaryImage.altText ?? product.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
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
    <div class="flex flex-col gap-1 px-3 py-2.5 flex-1">
      <p class="text-sm leading-snug line-clamp-2 text-secondary-foreground">
        {{ product.name }}
      </p>

      <!-- Availability status -->
      <p v-if="isLowStock" class="text-[11px] font-medium text-amber-600">
        Sisa {{ Number(product.availability.remaining) }} item
      </p>
      <p v-else-if="!isAvailable" class="text-[11px] font-medium text-rose-500">
        Tidak tersedia
      </p>

      <p
        class="text-lg font-bold mt-0.5 text-primary"
      >
        {{ product.price.formattedValue }}
      </p>
    </div>
  </RouterLink>
</template>
