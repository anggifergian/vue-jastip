<script setup lang="ts">
defineProps<{
  /** Extra vertical padding classes, e.g. "py-6 lg:py-10" */
  spacing?: string
}>()
</script>

<template>
  <div class="md:max-w-7xl mx-auto w-full px-4 lg:px-8" :class="spacing">
    <slot />
  </div>
</template>
