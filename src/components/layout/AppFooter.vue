<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { MessageCircle, Phone, MapPin } from '@lucide/vue'
import AppContainer from '@/components/layout/AppContainer.vue'
</script>

<template>
  <footer class="bg-gray-900 text-gray-300 mt-16">
    <!-- Business info section (before tax & fee notes) -->
    <div class="border-b border-gray-800">
      <AppContainer spacing="py-8">
        <div class="bg-gray-800 rounded-2xl p-5 lg:p-6">
          <h3 class="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
            Informasi Penting / Important Notes
          </h3>
          <p class="text-sm text-gray-400 leading-relaxed mb-3">
            Harga produk yang tertera adalah harga asli dari negara asal. Harga akhir yang Anda
            bayarkan sudah mencakup komponen berikut:
          </p>
          <ul class="space-y-1.5 text-sm text-gray-400 mb-4">
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 mt-0.5">•</span>
              <span>Harga produk + <strong class="text-gray-300">biaya jasa titip</strong> (personal shopping fee)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 mt-0.5">•</span>
              <span><strong class="text-gray-300">Ongkos kirim internasional</strong> dari Jepang/Korea ke Indonesia</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 mt-0.5">•</span>
              <span><strong class="text-gray-300">Bea cukai & pajak impor</strong> (PPN 11%) jika berlaku</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 mt-0.5">•</span>
              <span><strong class="text-gray-300">Biaya handling & packaging</strong> — semua produk dikemas aman</span>
            </li>
          </ul>
          <p class="text-xs text-gray-500">
            ⚡ Nilai tukar mengacu pada kurs tengah BI +5% pada tanggal pembelian. Harga dapat berubah
            mengikuti fluktuasi kurs.
          </p>
        </div>
      </AppContainer>
    </div>

    <!-- Main footer -->
    <AppContainer spacing="py-10">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Brand -->
        <div>
          <h2 class="font-bold text-2xl text-white tracking-tight mb-3">JastipKu</h2>
          <p class="text-sm text-gray-400 leading-relaxed">
            Layanan jasa titip terpercaya dari Jepang dan Korea langsung ke pintu rumah Anda.
            Produk asli, pengiriman aman.
          </p>
        </div>

        <!-- Quick links -->
        <div>
          <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/" class="text-gray-400 hover:text-white transition-colors">Home</RouterLink>
            </li>
            <li>
              <RouterLink to="/catalog" class="text-gray-400 hover:text-white transition-colors">Catalog</RouterLink>
            </li>
            <li>
              <RouterLink to="/cart" class="text-gray-400 hover:text-white transition-colors">Cart</RouterLink>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                Terms & Conditions
                <span class="text-xs text-gray-600 ml-1">(Coming soon)</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact Us</h4>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center gap-3 text-gray-400">
              <MessageCircle :size="16" class="text-green-400 shrink-0" />
              <a href="https://wa.me/628123456789" class="hover:text-white transition-colors">
                WhatsApp: +62 812-3456-789
              </a>
            </li>
            <li class="flex items-center gap-3 text-gray-400">
              <Phone :size="16" class="text-indigo-400 shrink-0" />
              <span>Instagram: @jastipku.id</span>
            </li>
            <li class="flex items-start gap-3 text-gray-400">
              <MapPin :size="16" class="text-rose-400 shrink-0 mt-0.5" />
              <span>Senin–Sabtu, 09:00–21:00 WIB</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <p>© {{ new Date().getFullYear() }} JastipKu. All rights reserved.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-gray-400 transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-gray-400 transition-colors">Terms & Conditions</a>
        </div>
      </div>
    </AppContainer>
  </footer>
</template>
