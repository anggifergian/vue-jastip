<script setup lang="ts">
defineProps<{
  prefix: string
  placeholder?: string
  min?: number | string
  error?: boolean
}>()

const model = defineModel<number | ''>()
</script>

<template>
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
      {{ prefix }}
    </span>
    <input
      v-model="model"
      type="number"
      :placeholder="placeholder ?? '0'"
      :min="min"
      class="w-full h-10 pl-12 pr-3 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
      :class="error ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
    />
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
