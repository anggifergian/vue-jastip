<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@lucide/vue'
import { useIntervalFn } from '@vueuse/core'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { cn } from '@/lib/utils'

const COOLDOWN_SECONDS = 30

const orderNumber = ref('')
const isFocused = ref(false)
const cooldown = ref(0)

const { pause, resume } = useIntervalFn(
  () => {
    cooldown.value--
    if (cooldown.value <= 0) pause()
  },
  1000,
  { immediate: false },
)

const isOnCooldown = computed(() => cooldown.value > 0)
const isDisabled = computed(() => !orderNumber.value.trim() || isOnCooldown.value)

const buttonLabel = computed(() =>
  isOnCooldown.value ? `Coba lagi dalam ${cooldown.value}d` : 'Cek Pesanan',
)

function checkOrder() {
  if (isDisabled.value) return
  cooldown.value = COOLDOWN_SECONDS
  resume()
  // TODO: implement order status lookup
}
</script>

<template>
  <AppContainer spacing="py-10 lg:py-16">
    <div class="max-w-md mx-auto">

      <!-- Title -->
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Cek Status Pesanan</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="checkOrder" class="flex flex-col gap-4">
        <!-- Input -->
        <div
          :class="cn(
            'flex items-center gap-2 h-12 rounded-xl border bg-background px-4 transition-colors',
            isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-border',
          )"
        >
          <input
            v-model="orderNumber"
            type="text"
            placeholder="Contoh: ORD-20241001-XXXX"
            class="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            :disabled="isOnCooldown"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
          <Search :size="18" class="text-muted-foreground shrink-0" />
        </div>

        <!-- Cooldown hint -->
        <p v-if="isOnCooldown" class="text-xs text-muted-foreground text-center -mt-1">
          Terlalu banyak percobaan. Silakan tunggu sebentar.
        </p>

        <!-- Submit -->
        <AppButton type="submit" size="lg" class="w-full" :disabled="isDisabled">
          {{ buttonLabel }}
        </AppButton>
      </form>

    </div>
  </AppContainer>
</template>
