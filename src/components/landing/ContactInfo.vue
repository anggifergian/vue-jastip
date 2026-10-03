<script setup lang="ts">
import { MessageCircle, Phone, MapPin } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'
</script>

<template>
  <section id="contact" class="py-14 lg:py-20 bg-indigo-600">
    <AppContainer>
      <div class="text-center mb-10">
        <p class="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-2">Get in Touch</p>
        <h2 class="text-2xl lg:text-3xl font-bold text-white">Hubungi Kami</h2>
        <p class="text-indigo-200 mt-3 text-sm lg:text-base max-w-md mx-auto">
          Ada pertanyaan? Kami siap membantu! Hubungi kami via WhatsApp untuk respons tercepat.
        </p>
      </div>

      <div class="flex flex-col items-center gap-5">
        <!-- Primary CTA: WhatsApp -->
        <a
          href="https://wa.me/628123456789"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <MessageCircle :size="24" />
          Chat via WhatsApp
        </a>

        <p class="text-indigo-200 text-sm">atau</p>

        <!-- Secondary contacts -->
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm">
            <Phone :size="16" class="text-indigo-200" />
            <span>+62 812-3456-789</span>
          </div>
          <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm">
            <MessageCircle :size="16" class="text-indigo-200" />
            <span>@jastipku.id (Instagram)</span>
          </div>
          <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm">
            <MapPin :size="16" class="text-indigo-200" />
            <span>Senin–Sabtu, 09:00–21:00 WIB</span>
          </div>
        </div>
      </div>
    </AppContainer>
  </section>
</template>
