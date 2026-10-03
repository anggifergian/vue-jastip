<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Minus, Trash2, AlertCircle, StickyNote } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types'

const props = defineProps<{ item: CartItem }>()

const cartStore = useCartStore()
const confirmingRemove = ref(false)
const editingNotes = ref(false)
const localNotes = ref(props.item.notes ?? '')

const formattedPrice = computed(() =>
  new Intl.NumberFormat(props.item.currency === 'JPY' ? 'ja-JP' : 'ko-KR', {
    style: 'currency',
    currency: props.item.currency,
    minimumFractionDigits: 0,
  }).format(props.item.price),
)

function saveNotes() {
  cartStore.updateNotes(props.item.id, localNotes.value)
  editingNotes.value = false
}

function confirmRemove() { confirmingRemove.value = true }
function cancelRemove()  { confirmingRemove.value = false }
function doRemove() {
  confirmingRemove.value = false
  cartStore.removeItem(props.item.id)
}
</script>

<template>
  <!-- Single root wrapper required by TransitionGroup; border lives here so last:border-0 applies correctly -->
  <div class="border-b border-gray-100 last:border-0">
  <div class="flex gap-4 py-4">
    <!-- Image -->
    <img
      :src="item.image"
      :alt="item.name"
      class="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover shrink-0 bg-gray-50"
    />

    <!-- Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
            {{ item.name }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ item.origin === 'Japan' ? '🇯🇵' : '🇰🇷' }} {{ item.origin }}
          </p>
          <p class="text-xs text-gray-500 mt-1">{{ formattedPrice }} / item</p>
        </div>
        <button
          @click="confirmRemove"
          class="text-gray-300 hover:text-rose-500 transition-colors p-1 shrink-0"
          aria-label="Remove item"
        >
          <Trash2 :size="16" />
        </button>
      </div>

      <div class="flex items-center justify-between mt-3">
        <!-- Qty control -->
        <div class="flex items-center bg-gray-100 rounded-lg overflow-hidden">
          <button
            @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
            :disabled="item.quantity === 1"
            class="w-8 h-8 flex items-center justify-center transition-colors"
            :class="item.quantity === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'"
            aria-label="Decrease quantity"
          >
            <Minus :size="13" />
          </button>
          <span class="w-8 text-center text-sm font-semibold text-gray-800">
            {{ item.quantity }}
          </span>
          <button
            @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
            class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus :size="13" />
          </button>
        </div>

        <!-- Notes toggle -->
        <button
          @click="editingNotes = !editingNotes; localNotes = item.notes ?? ''"
          class="flex items-center gap-1 text-xs transition-colors"
          :class="item.notes ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500'"
        >
          <StickyNote :size="13" />
          {{ item.notes ? 'Catatan' : 'Tambah catatan' }}
        </button>
      </div>

      <!-- Notes editor -->
      <Transition name="notes-expand">
        <div v-if="editingNotes" class="mt-3">
          <textarea
            v-model="localNotes"
            rows="2"
            placeholder="Ukuran, warna, atau permintaan khusus..."
            class="w-full text-xs rounded-lg border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-300"
            @keydown.enter.ctrl="saveNotes"
          />
          <div class="flex gap-2 mt-2">
            <button
              @click="editingNotes = false"
              class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Batal
            </button>
            <button
              @click="saveNotes"
              class="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </Transition>

      <!-- Saved notes display -->
      <p
        v-if="!editingNotes && item.notes"
        class="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed"
      >
        {{ item.notes }}
      </p>
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
          <div v-if="confirmingRemove" class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" @click.stop>
            <div class="flex gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertCircle :size="20" class="text-rose-500" />
              </div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">Hapus dari titipan?</p>
                <p class="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{{ item.name }}</p>
              </div>
            </div>
            <div class="flex gap-2.5">
              <button
                @click="cancelRemove"
                class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                @click="doRemove"
                class="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
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
.notes-expand-enter-active { transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1); }
.notes-expand-leave-active { transition: opacity 0.15s ease; }
.notes-expand-enter-from { opacity: 0; transform: translateY(-4px); }
.notes-expand-leave-to  { opacity: 0; }

.backdrop-fade-enter-active, .backdrop-fade-leave-active { transition: opacity 0.2s ease; }
.backdrop-fade-enter-from, .backdrop-fade-leave-to { opacity: 0; }

.modal-pop-enter-active { transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
.modal-pop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-pop-enter-from { opacity: 0; transform: scale(0.95) translateY(8px); }
.modal-pop-leave-to  { opacity: 0; transform: scale(0.95); }
</style>
