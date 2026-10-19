<script setup lang="ts">
import HeroBanner from '@/components/landing/HeroBanner.vue'
import FeaturedProducts from '@/components/landing/FeaturedProducts.vue'
import ContactInfo from '@/components/landing/ContactInfo.vue'
</script>

<template>
  <div>
    <!-- Section 1: Hero slider -->
    <HeroBanner />

    <!-- Section 2: Featured products -->
    <FeaturedProducts />

    <!-- Section 4: Contact -->
    <ContactInfo />
  </div>
</template>
