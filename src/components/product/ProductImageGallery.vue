<script setup lang="ts">
import { ref } from 'vue'
import { useSwipe } from '@vueuse/core'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { ProductImage } from '@/types'
import { cn } from '@/lib/utils'

const props = defineProps<{
  images: ProductImage[]
  inStock?: boolean
  compact?: boolean
}>()

const activeIndex = ref(0)
const trackRef = ref<HTMLElement>()

const { direction } = useSwipe(trackRef, {
  onSwipeEnd() {
    if (direction.value === 'left' && activeIndex.value < props.images.length - 1) {
      activeIndex.value++
    } else if (direction.value === 'right' && activeIndex.value > 0) {
      activeIndex.value--
    }
  },
})

function goTo(index: number) {
  activeIndex.value = index
}
</script>

<template>
  <!-- -mx-4 breaks out of AppContainer's mobile padding; lg:mx-0 restores it -->
  <div class="-mx-4 lg:mx-0">
    <!-- Slider track -->
    <div
      ref="trackRef"
      :class="cn('relative overflow-hidden lg:rounded-xl select-none', compact ? 'h-52 lg:h-64' : 'h-72 lg:h-[420px]')"
    >
      <div
        class="flex h-full transition-transform duration-300 ease-out"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
      >
        <div
          v-for="(img, i) in images"
          :key="i"
          class="w-full shrink-0 h-full"
        >
          <img
            :src="img.url"
            :alt="img.alt ?? `Image ${i + 1}`"
            :class="cn('w-full h-full object-cover img-lazy', !inStock && 'grayscale opacity-60')"
            loading="lazy"
            draggable="false"
            @load="(e) => (e.target as HTMLElement).classList.add('loaded')"
          />
        </div>
      </div>

      <!-- Out of stock overlay -->
      <div
        v-if="!inStock"
        class="absolute inset-0 bg-background/50 flex items-center justify-center"
      >
        <span class="text-sm font-semibold text-muted-foreground bg-background px-4 py-2 rounded-full border border-border">
          Stok Habis
        </span>
      </div>

      <!-- Desktop prev / next -->
      <template v-if="images.length > 1">
        <button
          v-if="activeIndex > 0"
          @click="goTo(activeIndex - 1)"
          class="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border items-center justify-center text-foreground hover:bg-background transition-colors shadow-sm"
        >
          <ChevronLeft :size="18" />
        </button>
        <button
          v-if="activeIndex < images.length - 1"
          @click="goTo(activeIndex + 1)"
          class="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border items-center justify-center text-foreground hover:bg-background transition-colors shadow-sm"
        >
          <ChevronRight :size="18" />
        </button>
      </template>
    </div>

    <!-- Dot indicators -->
    <div v-if="images.length > 1" class="flex justify-center items-center gap-1.5 mt-3 px-4 lg:px-0">
      <button
        v-for="(_, i) in images"
        :key="i"
        @click="goTo(i)"
        :class="cn(
          'rounded-full transition-all duration-200',
          i === activeIndex ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-border hover:bg-muted-foreground',
        )"
        :aria-label="`Go to image ${i + 1}`"
      />
    </div>
  </div>
</template>
