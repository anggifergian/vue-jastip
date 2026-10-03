<script setup lang="ts">
import HeroBanner from '@/components/landing/HeroBanner.vue'
import HowToOrder from '@/components/landing/HowToOrder.vue'
import ShippingProcess from '@/components/landing/ShippingProcess.vue'
import ContactInfo from '@/components/landing/ContactInfo.vue'
</script>

<template>
  <div>
    <!-- Section 1: Hero slider -->
    <HeroBanner />

    <!-- Section 2: How to order -->
    <HowToOrder />

    <!-- Section 3: Shipping process -->
    <ShippingProcess />

    <!-- Section 4: Contact -->
    <ContactInfo />
  </div>
</template>
