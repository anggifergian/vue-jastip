<script setup lang="ts">
import { ref } from 'vue'
import { AxiosError } from 'axios'
import AppButton from '@/components/ui/AppButton.vue'
import { updateProduct } from '@/services/admin/product'
import type { AdminProduct } from '@/services/admin/product'

const props = defineProps<{ product: AdminProduct }>()
const emit = defineEmits<{ success: [] }>()

// ── Form state ──────────────────────────────────────────
const name = ref(props.product.name)
const description = ref(props.product.description ?? '')
const category = ref(props.product.category ?? '')
const currency = ref(props.product.currency ?? 'JPY')
const price = ref<number | ''>(props.product.price)
const stock = ref<number | ''>(props.product.stock)
const maxOrder = ref<number | ''>(props.product.maxOrder ?? '')
const inStock = ref(props.product.stock > 0)

const isSubmitting = ref(false)
const submitError = ref('')

// ── Static data ─────────────────────────────────────────
const categories = [
  { id: 'skincare-beauty', name: 'Skincare & Beauty' },
  { id: 'food-snacks', name: 'Food & Snacks' },
  { id: 'merchandise', name: 'Merchandise & Action Figures' },
  { id: 'stationery', name: 'Stationery' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'gadget-electronics', name: 'Gadget & Electronics' },
]

const currencies = [
  { code: 'JPY', label: 'JPY — Yen Jepang' },
  { code: 'KRW', label: 'KRW — Won Korea' },
  { code: 'USD', label: 'USD — Dolar Amerika' },
  { code: 'CNY', label: 'CNY — Yuan Tiongkok' },
  { code: 'IDR', label: 'IDR — Rupiah' },
]

// ── Validation ──────────────────────────────────────────
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  const e: Record<string, string> = {}
  if (!name.value.trim()) e.name = 'Nama produk wajib diisi.'
  if (!description.value.trim()) e.desc = 'Deskripsi wajib diisi.'
  if (!category.value) e.category = 'Pilih kategori produk.'
  if (!price.value || Number(price.value) <= 0) e.price = 'Masukkan harga yang valid.'
  if (stock.value === '' || Number(stock.value) < 0) e.stock = 'Masukkan jumlah stok.'
  if (!maxOrder.value || Number(maxOrder.value) <= 0) e.maxOrder = 'Masukkan batas order.'
  errors.value = e
  return Object.keys(e).length === 0
}

// ── Submit ──────────────────────────────────────────────
async function submit() {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    await updateProduct(props.product.id, {
      name: name.value.trim(),
      description: description.value.trim(),
      category: category.value,
      currency: currency.value,
      price: Number(price.value),
      stock: Number(stock.value),
      maxOrder: Number(maxOrder.value),
    })

    emit('success')
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.log('err', err)
    }
    const apiError = err instanceof AxiosError ? err.response?.data?.error : undefined
    submitError.value = apiError ?? 'Gagal menyimpan produk. Periksa koneksi dan coba lagi.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" novalidate>
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
              :class="
                errors.name
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-gray-200 focus:border-indigo-300'
              "
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
              :class="
                errors.desc
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-gray-200 focus:border-indigo-300'
              "
            />
            <p v-if="errors.desc" class="mt-1 text-xs text-rose-500">{{ errors.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Category -->
      <section>
        <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">Kategori</h2>
        <div>
          <select
            v-model="category"
            class="w-full h-10 px-3 rounded-xl border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none"
            :class="
              errors.category
                ? 'border-rose-300 bg-rose-50'
                : 'border-gray-200 focus:border-indigo-300'
            "
          >
            <option value="" disabled>Pilih kategori...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <p v-if="errors.category" class="mt-1 text-xs text-rose-500">{{ errors.category }}</p>
        </div>
      </section>

      <!-- Pricing & Stock -->
      <section>
        <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Harga & Stok
        </h2>
        <div class="space-y-4">
          <!-- Currency -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Mata Uang</label>
            <select
              v-model="currency"
              class="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 appearance-none"
            >
              <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.label }}</option>
            </select>
          </div>

          <!-- Price -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">
              Harga <span class="text-rose-400">*</span>
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400"
              >
                {{ currency }}
              </span>
              <input
                v-model="price"
                type="number"
                min="1"
                placeholder="0"
                class="w-full h-10 pl-12 pr-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                :class="
                  errors.price
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-gray-200 focus:border-indigo-300'
                "
              />
            </div>
            <p v-if="errors.price" class="mt-1 text-xs text-rose-500">{{ errors.price }}</p>
          </div>

          <!-- Stock & MaxOrder -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                Stok <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="stock"
                type="number"
                min="0"
                placeholder="0"
                class="w-full h-10 px-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                :class="
                  errors.stock
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-gray-200 focus:border-indigo-300'
                "
              />
              <p v-if="errors.stock" class="mt-1 text-xs text-rose-500">{{ errors.stock }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                Maks. Order <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="maxOrder"
                type="number"
                min="1"
                placeholder="0"
                class="w-full h-10 px-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                :class="
                  errors.maxOrder
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-gray-200 focus:border-indigo-300'
                "
              />
              <p v-if="errors.maxOrder" class="mt-1 text-xs text-rose-500">{{ errors.maxOrder }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Stock toggle -->
      <section>
        <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Ketersediaan
        </h2>
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
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Menyimpan...
          </span>
          <span v-else>Simpan Perubahan</span>
        </AppButton>
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
