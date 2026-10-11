<script setup lang="ts">
import { X } from '@lucide/vue'
import AppBottomSheet from '@/components/ui/AppBottomSheet.vue'
import CartOverview from './CartOverview.vue'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppBottomSheet
    :open="isOpen"
    hide-above="lg"
    panel-class="max-h-[85vh] flex flex-col"
    @close="emit('close')"
  >
    <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
      <button
        @click="emit('close')"
        class="text-gray-400 hover:text-foreground transition-colors ml-auto"
      >
        <X :size="20" />
      </button>
    </div>
    <div class="overflow-y-auto flex-1 px-4 py-4">
      <CartOverview :compact="true" />
    </div>
  </AppBottomSheet>
</template>
