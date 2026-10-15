<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ChevronUp, ShoppingBag, Loader2 } from '@lucide/vue'

import { AxiosError } from 'axios'
import Swal from 'sweetalert2'
import { useCartStore } from '@/stores/cart'
import {
  validateOrder,
  requestOtp,
  verifyOtp,
  createOrder,
  cartItemsToOrderItems,
} from '@/services/order'
import type { Order } from '@/services/order'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBottomSheet from '@/components/ui/AppBottomSheet.vue'
import CartOverview from '@/components/cart/CartOverview.vue'
import OtpVerifyModal from '@/components/auth/OtpVerifyModal.vue'

const router = useRouter()
const cartStore = useCartStore()

const email = ref('')
const phone = ref('')
const emailError = ref('')
const phoneError = ref('')
const isSubmitting = ref(false)
const showOtp = ref(false)
const orderToken = ref('')
const pendingOrder = ref<Order | null>(null)
const isSheetOpen = ref(false)

function validate(): boolean {
  emailError.value = ''
  phoneError.value = ''
  let ok = true
  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    emailError.value = 'Masukkan alamat email yang valid.'
    ok = false
  }
  if (!phone.value.trim() || phone.value.trim().length < 8) {
    phoneError.value = 'Masukkan nomor telepon yang valid.'
    ok = false
  }
  return ok
}

watch(showOtp, (val) => {
  if (!val) isSheetOpen.value = false
})

function openCheckoutSheet() {
  if (!validate()) return
  isSheetOpen.value = true
}

async function submit() {
  if (isSubmitting.value) return
  if (cartStore.items.length === 0) return

  isSubmitting.value = true
  const items = cartItemsToOrderItems(cartStore.items)

  try {
    await validateOrder(email.value.trim(), items)
  } catch (err: unknown) {
    isSubmitting.value = false
    const msg =
      (err instanceof AxiosError ? err.response?.data?.error : undefined) ??
      'Gagal memvalidasi pesanan. Periksa koneksi dan coba lagi.'
    Swal.fire({ icon: 'error', title: 'Pesanan tidak valid', text: msg })
    return
  }

  try {
    await requestOtp(email.value.trim())
  } catch (err: unknown) {
    isSubmitting.value = false
    const msg =
      (err instanceof AxiosError ? err.response?.data?.error : undefined) ??
      'Gagal mengirim kode OTP. Coba lagi.'
    Swal.fire({ icon: 'error', title: 'Gagal kirim OTP', text: msg })
    return
  }

  isSubmitting.value = false
  showOtp.value = true
}

async function resendOtp() {
  await requestOtp(email.value.trim())
}

async function checkoutVerifyFn(otp: string) {
  const result = await verifyOtp(email.value.trim(), otp)
  orderToken.value = result.token
}

async function onOtpVerified() {
  showOtp.value = false
  isSheetOpen.value = false
  const items = cartItemsToOrderItems(cartStore.items)
  try {
    const order = await createOrder({
      token: orderToken.value,
      email: email.value.trim(),
      phone: phone.value.trim(),
      items,
    })
    pendingOrder.value = order
    cartStore.clearCart()
    Swal.fire({
      icon: 'success',
      title: 'Pesanan berhasil!',
      text: `Nomor pesananmu: ${order.orderNumber}`,
      timer: 2000,
      showConfirmButton: false,
    })
    router.replace({ name: 'order-confirmation', params: { orderNumber: order.orderNumber } })
  } catch (err: unknown) {
    const msg =
      (err instanceof AxiosError ? err.response?.data?.error : undefined) ??
      'Gagal membuat pesanan. Hubungi admin.'
    Swal.fire({ icon: 'error', title: 'Gagal membuat pesanan', text: msg })
  }
}
</script>

<template>
  <AppContainer spacing="py-6 lg:py-10 pb-28 lg:pb-10">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8 page-enter">
      <button
        @click="router.back()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft :size="18" />
      </button>
      <h1 class="text-xl font-bold">Checkout</h1>
    </div>

    <!-- Empty guard -->
    <Transition name="content-fade" mode="out-in">
    <div
      v-if="cartStore.items.length === 0"
      key="empty"
      class="flex flex-col items-center justify-center py-24 gap-5 text-center"
    >
      <div class="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
        <ShoppingBag :size="36" class="text-primary/40" />
      </div>
      <div>
        <p class="font-semibold">Keranjang kosong</p>
        <p class="text-sm text-muted-foreground mt-1">
          Tambahkan produk ke keranjang terlebih dahulu.
        </p>
      </div>
      <AppButton @click="router.push({ name: 'catalog' })">Lihat Catalog</AppButton>
    </div>

    <!-- Checkout content -->
    <div v-else key="content" class="lg:grid lg:grid-cols-[1fr_340px] lg:gap-10 lg:items-start">
      <!-- Form -->
      <div class="space-y-5">
        <h2 class="text-sm font-semibold text-gray-500 uppercase">
          Informasi Kontak
        </h2>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="nama@email.com"
            autocomplete="email"
            class="w-full h-11 px-4 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
            :class="
              emailError ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'
            "
          />
          <p v-if="emailError" class="mt-1.5 text-xs text-rose-500">{{ emailError }}</p>
          <p class="mt-1.5 text-xs text-gray-400">
            Kode OTP akan dikirim ke email ini untuk verifikasi.
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon</label>
          <input
            v-model="phone"
            type="tel"
            placeholder="+62 812 3456 7890"
            autocomplete="tel"
            class="w-full h-11 px-4 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
            :class="
              phoneError ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'
            "
          />
          <p v-if="phoneError" class="mt-1.5 text-xs text-rose-500">{{ phoneError }}</p>
        </div>
      </div>

      <!-- Desktop: cart overview sidebar -->
      <div class="hidden lg:block">
        <div class="sticky top-20">
          <p class="text-sm font-semibold text-gray-500 uppercase mb-4">
            Ringkasan Pesanan
          </p>
          <CartOverview checkout />
        </div>
      </div>
    </div>
    </Transition>
  </AppContainer>

  <!-- Mobile: sticky bottom bar -->
  <div
    v-if="cartStore.items.length > 0"
    class="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 pt-3 pb-3 pb-safe z-30 shadow-xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs text-muted-foreground">Daftar Titipan</p>
        <p class="text-base font-bold">{{ cartStore.totalItems }} item</p>
      </div>
      <AppButton @click="openCheckoutSheet">
        <ChevronUp :size="15" />
        Kirim Request
      </AppButton>
    </div>
  </div>

  <!-- Mobile: checkout overview sheet -->
  <AppBottomSheet
    :open="isSheetOpen"
    hide-above="lg"
    panel-class="max-h-[85vh] flex flex-col"
    @close="isSheetOpen = false"
  >
    <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
      <h3 class="font-bold text-gray-800">Ringkasan Pesanan</h3>
      <p class="text-xs text-gray-400">{{ cartStore.totalItems }} item</p>
    </div>
    <div class="overflow-y-auto flex-1 px-4 py-4">
      <CartOverview :compact="true" checkout />
    </div>
    <div class="px-4 py-4 border-t border-gray-100 shrink-0">
      <AppButton class="w-full" :disabled="isSubmitting" @click="submit">
        <Loader2 v-if="isSubmitting" :size="15" class="animate-spin" />
        Konfirmasi &amp; Kirim Request
      </AppButton>
      <p class="text-xs text-gray-400 mt-2 text-center">
        Kode OTP akan dikirim ke {{ email || 'emailmu' }}
      </p>
    </div>
  </AppBottomSheet>

  <!-- OTP Modal -->
  <OtpVerifyModal
    v-model="showOtp"
    :email="email.trim()"
    :resend-fn="resendOtp"
    :verify-fn="checkoutVerifyFn"
    @verified="onOtpVerified"
  />
</template>
