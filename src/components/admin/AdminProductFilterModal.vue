<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RotateCcw } from '@lucide/vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{
  open: boolean
  category: string
  status: string
  featured: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [category: string, status: string, featured: boolean]
}>()

const pendingCategory = ref(props.category)
const pendingStatus = ref(props.status)
const pendingFeatured = ref(props.featured)

const hasPending = computed(() => !!pendingCategory.value || !!pendingStatus.value || pendingFeatured.value)

function reset() {
  pendingCategory.value = ''
  pendingStatus.value = ''
  pendingFeatured.value = false
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      pendingCategory.value = props.category
      pendingStatus.value = props.status
      pendingFeatured.value = props.featured
    }
  },
)

const categories = [
  { id: 'skincare-beauty', name: 'Skincare & Beauty' },
  { id: 'food-snacks', name: 'Food & Snacks' },
  { id: 'merchandise', name: 'Merchandise & Action Figures' },
  { id: 'stationery', name: 'Stationery' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'gadget-electronics', name: 'Gadget & Electronics' },
]

const statuses = [
  { id: 'draft', name: 'Draft' },
  { id: 'published', name: 'Published' },
  { id: 'archived', name: 'Archived' },
]
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        @click.self="emit('close')"
      />
    </Transition>

    <Transition name="modal-up">
      <div
        v-if="open"
        class="fixed inset-x-4 bottom-4 z-50 bg-white rounded-2xl shadow-xl p-5 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">Filter Produk</h3>
          <button
            v-if="hasPending"
            @click="reset"
            class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            title="Reset filter"
          >
            <RotateCcw :size="12" />
            Reset
          </button>
        </div>

        <div class="space-y-4">
          <!-- Category -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Kategori</label>
            <select
              v-model="pendingCategory"
              class="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 appearance-none"
            >
              <option value="">Semua kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
            <select
              v-model="pendingStatus"
              class="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 appearance-none"
            >
              <option value="">Semua status</option>
              <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <!-- Featured -->
          <div>
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="pendingFeatured"
                class="cursor-pointer"
              />
              <span class="text-sm text-gray-700">Featured saja</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5">
          <AppButton variant="ghost" @click="emit('close')">Cancel</AppButton>
          <AppButton @click="emit('apply', pendingCategory, pendingStatus, pendingFeatured)">Apply</AppButton>
        </div>
      </div>
    </Transition>
  </Teleport>
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

.modal-up-enter-active {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.modal-up-leave-active {
  transition: transform 0.18s ease, opacity 0.15s ease;
}
.modal-up-enter-from,
.modal-up-leave-to {
  transform: translateY(16px);
  opacity: 0;
}
</style>
