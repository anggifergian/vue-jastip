<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const router = useRouter()

const slides = [
  {
    id: 1,
    headline: 'Belanja dari Jepang',
    sub: 'Produk asli langsung dari sumbernya — kosmetik, makanan, hingga merchandise eksklusif.',
    cta: 'Lihat Katalog',
    gradient: 'from-indigo-600 to-violet-700',
  },
  {
    id: 2,
    headline: 'Skincare & Beauty Haul',
    sub: 'Hada Labo, COSRX, DHC, Innisfree — ratusan pilihan produk kecantikan asli.',
    cta: 'Shop Skincare',
    gradient: 'from-pink-500 to-rose-600',
    category: 'skincare-beauty',
  },
  {
    id: 3,
    headline: 'Merchandise Eksklusif',
    sub: 'Ghibli, Demon Slayer — koleksi merchandise resmi & action figure terbaru.',
    cta: 'Shop Merch',
    gradient: 'from-amber-500 to-orange-600',
    category: 'merchandise',
  },
]

const current = ref(0)
let timer: ReturnType<typeof setInterval>

function next() {
  current.value = (current.value + 1) % slides.length
}

function prev() {
  current.value = (current.value - 1 + slides.length) % slides.length
}

function goTo(index: number) {
  current.value = index
}

function handleCta(slide: (typeof slides)[0]) {
  if ('scrollTo' in slide && slide.scrollTo) {
    document.getElementById(slide.scrollTo as string)?.scrollIntoView({ behavior: 'smooth' })
  } else if (slide.category) {
    router.push({ path: '/catalog', query: { category: slide.category } })
  } else {
    router.push('/catalog')
  }
}

function resetTimer() {
  clearInterval(timer)
  timer = setInterval(next, 4500)
}

onMounted(() => {
  timer = setInterval(next, 4500)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <section class="relative overflow-hidden h-80 md:h-90 lg:h-100">
    <!-- Slides -->
    <TransitionGroup name="slide-fade" tag="div" class="relative h-full">
      <div
        v-for="(slide, i) in slides"
        :key="slide.id"
        v-show="current === i"
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-br text-white px-6"
        :class="slide.gradient"
      >
        <div class="max-w-2xl text-center space-y-5">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            {{ slide.headline }}
          </h1>
          <p class="text-sm sm:text-base text-white/80 max-w-lg mx-auto leading-relaxed">
            {{ slide.sub }}
          </p>
          <button
            @click="handleCta(slide)"
            class="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg text-sm"
          >
            {{ slide.cta }}
          </button>
        </div>
      </div>
    </TransitionGroup>

    <!-- Arrows -->
    <button
      @click="
        () => {
          prev()
          resetTimer()
        }
      "
      class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
    >
      <ChevronLeft :size="18" />
    </button>
    <button
      @click="
        () => {
          next()
          resetTimer()
        }
      "
      class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
    >
      <ChevronRight :size="18" />
    </button>

    <!-- Dots -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      <button
        v-for="(_, i) in slides"
        :key="i"
        @click="
          () => {
            goTo(i)
            resetTimer()
          }
        "
        class="h-1.5 rounded-full transition-all"
        :class="current === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'"
      />
    </div>
  </section>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
