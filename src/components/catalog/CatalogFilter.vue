<script setup lang="ts">
import type { Category } from '@/types'

defineProps<{
  category: string
  categories: Category[]
}>()

const emit = defineEmits<{
  'update:category': [value: string]
}>()
</script>

<template>
  <div>
    <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Kategori</p>
    <ul class="space-y-0.5">
      <li>
        <button
          @click="emit('update:category', 'all')"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
          :class="
            category === 'all'
              ? 'bg-indigo-50 text-indigo-600 font-semibold'
              : 'text-gray-600 hover:bg-muted'
          "
        >
          Semua Produk
        </button>
      </li>
      <li v-for="cat in categories" :key="cat.id">
        <button
          @click="emit('update:category', cat.id)"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
          :class="
            category === cat.id
              ? 'bg-indigo-50 text-indigo-600 font-semibold'
              : 'text-gray-600 hover:bg-muted'
          "
        >
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" />
          {{ cat.name }}
        </button>
      </li>
    </ul>
  </div>
</template>
