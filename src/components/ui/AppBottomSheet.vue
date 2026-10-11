<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
  open: boolean
  hideAbove?: 'md' | 'lg'
  panelClass?: string
}>()

defineEmits<{ close: [] }>()

const hiddenClass = computed(() => {
  if (props.hideAbove === 'md') return 'md:hidden'
  if (props.hideAbove === 'lg') return 'lg:hidden'
  return ''
})

watch(
  () => props.open,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        :class="hiddenClass"
        @click.self="$emit('close')"
      />
    </Transition>

    <Transition name="sheet-up">
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl"
        :class="[hiddenClass, panelClass]"
      >
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <slot />
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

.sheet-up-enter-active {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.sheet-up-leave-active {
  transition: transform 0.2s ease, opacity 0.15s ease;
}
.sheet-up-enter-from,
.sheet-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
