<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { X, Sparkles, Cookie, Star, PenLine, Shirt, Cpu } from '@lucide/vue'
import { fetchCategories } from '@/services/catalog'

const iconMap: Record<string, unknown> = { Sparkles, Cookie, Star, PenLine, Shirt, Cpu }

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()

const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
})

function selectCategory(id: string) {
  router.push({ path: '/catalog', query: { category: id } })
  emit('close')
}

function goToAll() {
  router.push('/catalog')
  emit('close')
}
</script>

<template>
  <Transition name="backdrop-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <Transition name="modal-pop">
        <div v-if="isOpen" class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-gray-800">Browse Categories</h2>
            <button
              @click="emit('close')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectCategory(cat.id)"
              class="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left group"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                :style="{ backgroundColor: cat.color + '20', color: cat.color }"
              >
                <component :is="iconMap[cat.icon]" :size="20" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-indigo-600 leading-tight">
                {{ cat.name }}
              </span>
            </button>
          </div>

          <button
            @click="goToAll"
            class="w-full py-2.5 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors"
          >
            View All Products
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.modal-pop-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.modal-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
