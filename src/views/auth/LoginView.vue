<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Loader2, ArrowRight } from '@lucide/vue'
import { supabase } from '@/lib/supabase'
import OtpVerifyModal from '@/components/auth/OtpVerifyModal.vue'

const router = useRouter()

const email = ref('')
const isSending = ref(false)
const sendError = ref('')
const showOtp = ref(false)

async function sendOtp() {
  if (!email.value.trim()) {
    sendError.value = 'Masukkan alamat email.'
    return
  }

  isSending.value = true
  sendError.value = ''

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value.trim(),
    options: { shouldCreateUser: false },
  })

  isSending.value = false

  if (error) {
    sendError.value = 'Gagal mengirim kode. Periksa email dan coba lagi.'
    return
  }

  showOtp.value = true
}

async function resend() {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value.trim(),
    options: { shouldCreateUser: false },
  })
  if (error) throw error
}

async function loginVerifyFn(otp: string) {
  const { error } = await supabase.auth.verifyOtp({
    email: email.value.trim(),
    token: otp,
    type: 'email',
  })
  if (error) throw error
}

function onVerified() {
  router.replace({ name: 'admin-product-new' })
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4"
  >
    <div class="w-full max-w-sm">
      <!-- Logo / brand mark -->
      <div class="text-center mb-10">
        <div
          class="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200"
        >
          <span class="text-white text-2xl font-black tracking-tight">J</span>
        </div>
        <h1 class="text-2xl font-black text-gray-900">Jastip Admin</h1>
        <p class="text-sm text-gray-400 mt-1">Masuk dengan email — tanpa password</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8">
        <h2 class="text-base font-bold text-gray-800 mb-5">Masukkan emailmu</h2>

        <form @submit.prevent="sendOtp" novalidate>
          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
            <div class="relative">
              <Mail
                :size="16"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              />
              <input
                v-model="email"
                type="email"
                placeholder="nama@email.com"
                autocomplete="email"
                autofocus
                class="w-full h-11 pl-10 pr-4 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                :class="
                  sendError
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-gray-200 focus:border-indigo-300'
                "
              />
            </div>
            <p v-if="sendError" class="mt-1.5 text-xs text-rose-500">{{ sendError }}</p>
          </div>

          <button
            type="submit"
            :disabled="isSending"
            class="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-primary disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
          >
            <Loader2 v-if="isSending" :size="16" class="animate-spin" />
            <template v-else>
              <span>Kirim kode OTP</span>
              <ArrowRight :size="15" />
            </template>
          </button>
        </form>

        <p class="text-center text-xs text-gray-300 mt-6">
          Kode OTP akan dikirim ke emailmu dan berlaku 10 menit.
        </p>
      </div>
    </div>

    <OtpVerifyModal v-model="showOtp" :email="email.trim()" :resend-fn="resend" :verify-fn="loginVerifyFn" @verified="onVerified" />
  </div>
</template>
