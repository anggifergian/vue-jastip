<script setup lang="ts">
defineProps<{
  error?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <select
    v-model="model"
    class="w-full h-10 px-3 rounded-md border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none"
    :class="error ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
  >
    <slot />
  </select>
</template>
