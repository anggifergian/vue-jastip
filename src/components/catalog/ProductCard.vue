<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

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
  <component
    :is="product.inStock ? RouterLink : 'div'"
    :to="product.inStock ? `/product/${product.id}` : undefined"
    :class="
      cn(
        'group flex flex-col h-full overflow-hidden rounded-lg border border-gray-200 bg-background transition-transform duration-200',
        product.inStock ? 'hover:-translate-y-1 hover:shadow-xs' : 'cursor-not-allowed',
      )
    "
  >
    <!-- Image -->
    <div
      :class="
        cn(
          'relative h-44 md:h-52 overflow-hidden bg-gray-100',
          !product.inStock && 'grayscale opacity-50',
        )
      "
    >
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <span
        v-if="product.badge && product.inStock"
        :class="
          cn(
            'absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full',
            badgeColors[product.badge] ?? 'bg-accent text-accent-foreground',
          )
        "
      >
        {{ product.badge }}
      </span>
      <span
        v-if="product.inStock"
        class="absolute top-2 right-2 text-xs font-medium bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-gray-600"
      >
        {{ product.origin === 'Japan' ? '🇯🇵' : '🇰🇷' }}
      </span>
      <span
        v-if="!product.inStock"
        class="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500"
      >
        Stok Habis
      </span>
    </div>

    <!-- Info -->
    <div :class="cn('flex flex-col gap-1 px-3 py-2.5 flex-1', !product.inStock && 'opacity-40')">
      <p class="text-sm leading-snug line-clamp-2">
        {{ product.name }}
      </p>
      <p
        :class="
          cn('text-sm font-bold mt-0.5', product.inStock ? 'text-primary' : 'text-muted-foreground')
        "
      >
        {{ formattedPrice }}
      </p>
    </div>
  </component>
</template>
