<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <div class="flex flex-col bg-background">
    <AppNavbar />
    <main class="flex-1 min-h-dvh lg:min-h-[90dvh] pt-nav">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
