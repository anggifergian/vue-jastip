<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { X, Mail, RotateCcw, Loader2, CheckCircle2 } from '@lucide/vue'

const props = defineProps<{
  modelValue: boolean
  email: string
  resendFn: () => Promise<void>
  verifyFn: (otp: string) => Promise<void>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  verified: []
}>()

const RESEND_SECONDS = 120

// ── OTP input (6 digits, split into separate boxes) ─────
const digits    = ref<string[]>(Array(6).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])

const otp = computed(() => digits.value.join(''))

// ── Countdown state ─────────────────────────────────────
const countdown  = ref(RESEND_SECONDS)
const canResend  = computed(() => countdown.value === 0)

let timer: ReturnType<typeof setInterval> | null = null

function startCountdown() {
  countdown.value = RESEND_SECONDS
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

const countdownLabel = computed(() => {
  const m = Math.floor(countdown.value / 60)
  const s = countdown.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

// ── UI state ────────────────────────────────────────────
const isVerifying = ref(false)
const isResending = ref(false)
const verifyError = ref('')
const isDone      = ref(false)

// Start countdown whenever modal opens
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      digits.value = Array(6).fill('')
      verifyError.value = ''
      isDone.value = false
      startCountdown()
      nextTick(() => inputRefs.value[0]?.focus())
    } else {
      if (timer) { clearInterval(timer); timer = null }
    }
  },
)

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ── Digit input handlers ────────────────────────────────
function onDigitInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  const val   = input.value.replace(/\D/g, '').slice(-1)
  digits.value[index] = val

  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }

  // Auto-verify when all 6 digits filled
  if (otp.value.length === 6) {
    verify()
  }
}

function onDigitKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

function onDigitPaste(e: ClipboardEvent) {
  const pasted = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
  if (!pasted) return
  e.preventDefault()
  pasted.split('').forEach((ch, i) => { digits.value[i] = ch })
  const next = Math.min(pasted.length, 5)
  nextTick(() => {
    inputRefs.value[next]?.focus()
    if (otp.value.length === 6) verify()
  })
}

// ── Verify ──────────────────────────────────────────────
async function verify() {
  if (otp.value.length !== 6 || isVerifying.value) return

  isVerifying.value = true
  verifyError.value = ''

  try {
    await props.verifyFn(otp.value)
  } catch {
    isVerifying.value = false
    verifyError.value = 'Kode OTP tidak valid atau sudah kedaluwarsa.'
    digits.value = Array(6).fill('')
    nextTick(() => inputRefs.value[0]?.focus())
    return
  }

  isVerifying.value = false

  isDone.value = true
  setTimeout(() => {
    emit('verified')
    emit('update:modelValue', false)
  }, 800)
}

// ── Resend OTP ──────────────────────────────────────────
async function resend() {
  if (!canResend.value || isResending.value) return

  isResending.value = true
  verifyError.value = ''

  try {
    await props.resendFn()
    digits.value = Array(6).fill('')
    startCountdown()
    nextTick(() => inputRefs.value[0]?.focus())
  } catch {
    verifyError.value = 'Gagal mengirim ulang kode. Coba lagi.'
  } finally {
    isResending.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />

        <!-- Modal -->
        <div class="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 z-10">
          <!-- Close button -->
          <button
            @click="close"
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-secondary flex items-center justify-center text-gray-500 transition-colors"
          >
            <X :size="15" />
          </button>

          <!-- Success state -->
          <Transition name="fade" mode="out-in">
            <div v-if="isDone" key="done" class="text-center py-4">
              <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 :size="32" class="text-emerald-500" />
              </div>
              <p class="text-base font-bold text-gray-900">Verifikasi berhasil!</p>
              <p class="text-sm text-gray-400 mt-1">Kamu akan diarahkan...</p>
            </div>

            <!-- OTP form -->
            <div v-else key="form">
              <!-- Icon + heading -->
              <div class="text-center mb-6">
                <div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Mail :size="26" class="text-indigo-500" />
                </div>
                <h2 class="text-lg font-bold text-gray-900">Cek emailmu</h2>
                <p class="text-sm text-gray-500 mt-1 leading-relaxed">
                  Kami mengirim kode 6 digit ke<br />
                  <span class="font-semibold text-gray-700">{{ email }}</span>
                </p>
              </div>

              <!-- 6-digit input boxes -->
              <div class="flex gap-2 justify-center mb-5">
                <input
                  v-for="(_, i) in digits"
                  :key="i"
                  :ref="(el) => { if (el) inputRefs[i] = el as HTMLInputElement }"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  :value="digits[i]"
                  class="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
                  :class="[
                    verifyError
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : digits[i]
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-900 focus:border-indigo-400 focus:bg-indigo-50/40',
                    isVerifying ? 'opacity-50 pointer-events-none' : '',
                  ]"
                  @input="onDigitInput(i, $event)"
                  @keydown="onDigitKeydown(i, $event)"
                  @paste="onDigitPaste"
                />
              </div>

              <!-- Error message -->
              <Transition name="fade">
                <p v-if="verifyError" class="text-center text-xs text-rose-500 mb-4 -mt-1">
                  {{ verifyError }}
                </p>
              </Transition>

              <!-- Verifying indicator -->
              <div v-if="isVerifying" class="flex items-center justify-center gap-2 mb-4 text-sm text-indigo-600">
                <Loader2 :size="15" class="animate-spin" />
                <span>Memverifikasi...</span>
              </div>

              <!-- Resend row -->
              <div class="text-center">
                <p class="text-xs text-gray-400 mb-2">Tidak menerima kode?</p>

                <button
                  v-if="canResend"
                  @click="resend"
                  :disabled="isResending"
                  class="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-primary disabled:opacity-50 transition-colors"
                >
                  <Loader2 v-if="isResending" :size="13" class="animate-spin" />
                  <RotateCcw v-else :size="13" />
                  {{ isResending ? 'Mengirim...' : 'Kirim ulang kode' }}
                </button>

                <p v-else class="text-sm text-gray-400">
                  Kirim ulang dalam
                  <span class="font-semibold tabular-nums text-gray-600">{{ countdownLabel }}</span>
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(8px);
}
.modal-leave-to .relative {
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
