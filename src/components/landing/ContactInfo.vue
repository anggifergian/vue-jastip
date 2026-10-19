<script setup lang="ts">
import { MessageCircle, Phone, MapPin } from '@lucide/vue'
import { waLink, WA_NUMBER } from '@/lib/whatsapp'

const INSTAGRAM = import.meta.env.VITE_INSTAGRAM as string
</script>

<template>
  <section id="contact" class="py-8 lg:py-10 bg-gray-50 h-80">
    <div class="md:max-w-6xl mx-auto w-full px-4 lg:px-8">
      <div class="text-center mb-10">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Hubungi Kami</h2>
        <p class="text-gray-500 mt-3 text-sm lg:text-base max-w-md mx-auto">
          Ada pertanyaan? Kami siap membantu! Hubungi kami via WhatsApp untuk respons tercepat.
        </p>
      </div>

      <div class="flex flex-col items-center gap-5">
        <!-- Primary CTA: WhatsApp -->
        <a
          :href="waLink()"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <MessageCircle :size="24" />
          Chat via WhatsApp
        </a>
      </div>
    </div>
  </section>
</template>
