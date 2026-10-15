<script setup lang="ts">
defineProps<{
  type?: string
  placeholder?: string
  min?: number | string
  autocomplete?: string
  error?: boolean
}>()

const model = defineModel<string | number | ''>()
</script>

<template>
  <input
    v-model="model"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :min="min"
    :autocomplete="autocomplete"
    class="w-full h-10 px-3 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
    :class="error ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
  />
</template>
