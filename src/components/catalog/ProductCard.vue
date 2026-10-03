<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Product } from '@/types'

const props = defineProps<{ product: Product }>()

const formattedPrice = computed(() =>
  new Intl.NumberFormat(props.product.currency === 'JPY' ? 'ja-JP' : 'ko-KR', {
    style: 'currency',
    currency: props.product.currency,
    minimumFractionDigits: 0,
  }).format(props.product.price),
)

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-amber-100 text-amber-700',
  New: 'bg-green-100 text-green-700',
  Limited: 'bg-rose-100 text-rose-700',
}
</script>

<template>
  <RouterLink :to="`/product/${product.id}`" class="group flex flex-col gap-2.5">
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-if="!product.inStock"
        class="absolute inset-0 bg-white/70 flex items-center justify-center"
      >
        <span class="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border">
          Out of Stock
        </span>
      </div>
      <span
        v-if="product.badge"
        class="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full"
        :class="badgeColors[product.badge] ?? 'bg-indigo-100 text-indigo-700'"
      >
        {{ product.badge }}
      </span>
      <span
        class="absolute top-2 right-2 text-xs font-medium bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-gray-600"
      >
        {{ product.origin === 'Japan' ? '🇯🇵' : '🇰🇷' }}
      </span>
    </div>

    <!-- Info -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {{ product.name }}
      </p>
      <p class="text-sm text-gray-400 line-clamp-2">{{ product.description }}</p>
      <p class="text-sm font-bold text-indigo-600 mt-1">{{ formattedPrice }}</p>
    </div>
  </RouterLink>
</template>
