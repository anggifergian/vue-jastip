<script setup lang="ts">
defineProps<{
  placeholder?: string
  rows?: number
  error?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <textarea
    v-model="model"
    :placeholder="placeholder"
    :rows="rows ?? 3"
    class="w-full px-3 py-2.5 rounded-md border text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
    :class="error ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
  />
</template>
