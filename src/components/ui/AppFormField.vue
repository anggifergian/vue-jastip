<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  error?: string
}>()
</script>

<template>
  <div>
    <label class="block text-xs font-semibold text-gray-500 mb-1.5">
      {{ label }}<span v-if="required" class="text-rose-400 ml-0.5">*</span>
    </label>
    <slot />
    <p v-if="error" class="mt-1 text-xs text-rose-500">{{ error }}</p>
  </div>
</template>
