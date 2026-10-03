<script setup lang="ts">
import { X } from '@lucide/vue'
import CartOverview from './CartOverview.vue'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="lg:hidden fixed inset-0 bg-black/40 z-40"
      @click="emit('close')"
    />
  </Transition>

  <!-- Sheet -->
  <Transition name="slide-up">
    <div
      v-if="isOpen"
      class="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
    >
      <!-- Handle -->
      <div class="pt-3 pb-1 flex justify-center shrink-0">
        <div class="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
        <h3 class="font-bold text-gray-800">Ringkasan Titipan</h3>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <X :size="20" />
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="overflow-y-auto flex-1 px-4 py-4">
        <CartOverview :compact="true" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
