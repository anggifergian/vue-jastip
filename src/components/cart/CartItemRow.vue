<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Minus, Trash2, AlertCircle } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types'
import { features } from '@/lib/features'

const props = defineProps<{ item: CartItem }>()

const cartStore = useCartStore()
const confirmingRemove = ref(false)
const editingNotes = ref(false)
const localNotes = ref(props.item.notes ?? '')

function saveNotes() {
  cartStore.updateNotes(props.item.id, localNotes.value)
  editingNotes.value = false
}

function confirmRemove() {
  confirmingRemove.value = true
}
function cancelRemove() {
  confirmingRemove.value = false
}
function doRemove() {
  confirmingRemove.value = false
  cartStore.removeItem(props.item.id)
}
</script>

<template>
  <!-- Single root wrapper required by TransitionGroup; border lives here so last:border-0 applies correctly -->
  <div class="border-b border-gray-100 last:border-0">
    <!-- <pre>{{ item }}</pre> -->
    <div class="flex gap-4 py-4">
      <!-- Image -->
      <img
        :src="item.images[0]?.url ?? ''"
        :alt="item.name"
        class="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover shrink-0 bg-gray-50 img-lazy"
        loading="lazy"
        @load="(e) => (e.target as HTMLElement).classList.add('loaded')"
      />

      <!-- Details -->
      <div class="flex-1 min-w-0">
        <div class="min-w-0">
          <RouterLink
            :to="`/product/${item.slug}`"
            class="text-xs md:text-sm text-gray-800 leading-snug line-clamp-2 hover:text-primary transition-colors"
          >
            {{ item.name }}
          </RouterLink>

          <div class="mt-2 flex items-end justify-between">
            <div>
              <p class="text-sm md:text-base font-semibold text-gray-800">
                {{ item.price.formattedValue }}
              </p>
              <div class="text-neutral-600 flex items-center gap-0.5 mt-1">
                <span class="text-[10px] md:text-xs">&asymp;</span>
                <p class="text-xs md:text-sm">{{ item.price.idr.formattedValue }}</p>
              </div>
            </div>

            <div
              class="flex items-center bg-white rounded-full overflow-hidden border border-gray-100"
            >
              <button
                @click="
                  item.quantity === 1
                    ? confirmRemove()
                    : cartStore.updateQuantity(item.id, item.quantity - 1)
                "
                class="w-8 h-7 md:w-9 md:h-8 flex items-center justify-center transition-colors hover:bg-secondary"
                :class="item.quantity === 1 ? 'text-gray-400' : 'text-primary'"
                :aria-label="item.quantity === 1 ? 'Remove item' : 'Decrease quantity'"
              >
                <Trash2 v-if="item.quantity === 1" :size="13" />
                <Minus v-else :size="13" :stroke-width="2.5" />
              </button>
              <span class="w-8 text-center text-xs md:text-sm font-semibold text-gray-800">
                {{ item.quantity }}
              </span>
              <button
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                class="w-8 h-7 md:w-9 md:h-8 flex items-center justify-center text-primary hover:bg-secondary transition-colors"
                aria-label="Increase quantity"
              >
                <Plus :size="13" :stroke-width="2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove confirmation modal — inside wrapper so component stays single-root -->
    <Teleport to="body">
      <Transition name="backdrop-fade">
        <div
          v-if="confirmingRemove"
          class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          @click.self="cancelRemove"
        >
          <Transition name="modal-pop" appear>
            <div
              v-if="confirmingRemove"
              class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              @click.stop
            >
              <div class="flex gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0"
                >
                  <AlertCircle :size="20" class="text-rose-500" />
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">Hapus dari titipan?</p>
                  <p class="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                    {{ item.name }}
                  </p>
                </div>
              </div>
              <div class="flex gap-2.5">
                <button
                  @click="cancelRemove"
                  class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  @click="doRemove"
                  class="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-danger transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.notes-expand-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.notes-expand-leave-active {
  transition: opacity 0.15s ease;
}
.notes-expand-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.notes-expand-leave-to {
  opacity: 0;
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.modal-pop-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.modal-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.modal-pop-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
