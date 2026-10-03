<script setup lang="ts">
import { ref, computed } from 'vue'
import AppUpload from '@/components/upload/AppUpload.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { presignUpload } from '@/services/upload'
import { createProduct } from '@/services/product'

const emit = defineEmits<{ success: [] }>()

// ── Form state ──────────────────────────────────────────
const imageKeys   = ref<string[]>([])
const name        = ref('')
const description = ref('')
const categoryId  = ref('')
const origin      = ref<'Japan' | 'Korea'>('Japan')
const price       = ref<number | ''>('')
const weight      = ref<number | ''>('')
const badge       = ref('')
const inStock     = ref(true)

const isSubmitting = ref(false)
const submitError  = ref('')

const currency       = computed(() => (origin.value === 'Japan' ? 'JPY' : 'KRW'))
const currencySymbol = computed(() => (currency.value === 'JPY' ? '¥' : '₩'))

// ── Static data ─────────────────────────────────────────
const categories = [
  { id: 'skincare-beauty',    name: 'Skincare & Beauty' },
  { id: 'food-snacks',        name: 'Food & Snacks' },
  { id: 'merchandise',        name: 'Merchandise & Action Figures' },
  { id: 'stationery',         name: 'Stationery' },
  { id: 'fashion',            name: 'Fashion' },
  { id: 'gadget-electronics', name: 'Gadget & Electronics' },
]

const badges = [
  { value: '',            label: 'Tidak ada' },
  { value: 'Best Seller', label: 'Best Seller' },
  { value: 'New',         label: 'New' },
  { value: 'Limited',     label: 'Limited' },
]

// ── Validation ──────────────────────────────────────────
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  const e: Record<string, string> = {}
  if (!imageKeys.value.length)                    e.image       = 'Upload minimal 1 foto produk.'
  if (!name.value.trim())                         e.name        = 'Nama produk wajib diisi.'
  if (!description.value.trim())                  e.description = 'Deskripsi wajib diisi.'
  if (!categoryId.value)                          e.categoryId  = 'Pilih kategori produk.'
  if (!price.value || Number(price.value) <= 0)   e.price       = 'Masukkan harga yang valid.'
  if (!weight.value || Number(weight.value) <= 0) e.weight      = 'Masukkan berat yang valid.'
  errors.value = e
  return Object.keys(e).length === 0
}

function onPhotosChange(keys: string[]) {
  imageKeys.value = keys
  if (keys.length) delete errors.value.image
}

// ── Submit ──────────────────────────────────────────────
async function submit() {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value  = ''

  try {
    await createProduct({
      name:        name.value.trim(),
      description: description.value.trim(),
      categoryId:  categoryId.value,
      origin:      origin.value,
      currency:    currency.value,
      price:       Number(price.value),
      weight:      Number(weight.value),
      badge:       badge.value || undefined,
      inStock:     inStock.value,
      images:      imageKeys.value,
    })

    emit('success')
  } catch {
    submitError.value = 'Gagal menyimpan produk. Periksa koneksi dan coba lagi.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" novalidate>
    <div class="lg:grid lg:grid-cols-[340px_1fr] lg:gap-10 lg:items-start">
      <!-- Left: Image upload -->
      <div class="mb-8 lg:mb-0 lg:sticky lg:top-24">
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Gambar Produk <span class="text-rose-400">*</span>
        </label>
        <AppUpload
          multiple
          :upload-fn="presignUpload"
          :max-photos="5"
          accept="image/*"
          :max-size-mb="5"
          @change="onPhotosChange"
        />
        <p v-if="errors.image" class="mt-2 text-xs text-rose-500">{{ errors.image }}</p>
      </div>

      <!-- Right: Form fields -->
      <div class="space-y-8">
        <!-- Basic info -->
        <section>
          <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Informasi Dasar
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                Nama Produk <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="name"
                type="text"
                placeholder="cth. Hada Labo Gokujyun Hyaluronic Lotion"
                class="w-full h-10 px-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                :class="errors.name ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-rose-500">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                Deskripsi <span class="text-rose-400">*</span>
              </label>
              <textarea
                v-model="description"
                rows="3"
                placeholder="Deskripsi singkat produk..."
                class="w-full px-3 py-2.5 rounded-xl border text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                :class="errors.description ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
              />
              <p v-if="errors.description" class="mt-1 text-xs text-rose-500">{{ errors.description }}</p>
            </div>
          </div>
        </section>

        <!-- Category & Origin -->
        <section>
          <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Kategori & Asal
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                Kategori <span class="text-rose-400">*</span>
              </label>
              <select
                v-model="categoryId"
                class="w-full h-10 px-3 rounded-xl border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none"
                :class="errors.categoryId ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
              >
                <option value="" disabled>Pilih kategori...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <p v-if="errors.categoryId" class="mt-1 text-xs text-rose-500">{{ errors.categoryId }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-2">Negara Asal</label>
              <div class="flex gap-2">
                <button
                  v-for="o in ['Japan', 'Korea']"
                  :key="o"
                  type="button"
                  @click="origin = o as 'Japan' | 'Korea'"
                  class="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all"
                  :class="
                    origin === o
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                  "
                >
                  {{ o === 'Japan' ? '🇯🇵' : '🇰🇷' }} {{ o }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <span class="text-xs text-gray-400">Mata uang (otomatis)</span>
              <span class="ml-auto text-sm font-bold text-indigo-600">
                {{ currency }} ({{ currencySymbol }})
              </span>
            </div>
          </div>
        </section>

        <!-- Pricing & Logistics -->
        <section>
          <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Harga & Logistik
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                Harga ({{ currency }}) <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  {{ currencySymbol }}
                </span>
                <input
                  v-model="price"
                  type="number"
                  min="1"
                  placeholder="0"
                  class="w-full h-10 pl-7 pr-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  :class="errors.price ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
                />
              </div>
              <p v-if="errors.price" class="mt-1 text-xs text-rose-500">{{ errors.price }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                Berat <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="weight"
                  type="number"
                  min="1"
                  placeholder="0"
                  class="w-full h-10 pl-3 pr-8 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  :class="errors.weight ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-indigo-300'"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">g</span>
              </div>
              <p v-if="errors.weight" class="mt-1 text-xs text-rose-500">{{ errors.weight }}</p>
            </div>
          </div>
        </section>

        <!-- Extras -->
        <section>
          <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Tambahan
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-2">Badge</label>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="b in badges"
                  :key="b.value"
                  type="button"
                  @click="badge = b.value"
                  class="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all"
                  :class="
                    badge === b.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                  "
                >
                  {{ b.label }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">Stok tersedia</p>
                <p class="text-xs text-gray-400">Produk dapat dipesan oleh customer</p>
              </div>
              <button
                type="button"
                @click="inStock = !inStock"
                class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
                :class="inStock ? 'bg-indigo-600' : 'bg-gray-200'"
                role="switch"
                :aria-checked="inStock"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                  :class="inStock ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>
        </section>

        <!-- Submit error -->
        <p
          v-if="submitError"
          class="text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100"
        >
          {{ submitError }}
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <AppButton variant="ghost" type="button" @click="$router.back()">Batal</AppButton>
          <AppButton type="submit" size="lg" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Menyimpan...
            </span>
            <span v-else>Simpan Produk</span>
          </AppButton>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
