<script setup lang="ts">
import { ref } from 'vue'
import { AxiosError } from 'axios'
import AppButton from '@/components/ui/AppButton.vue'
import AppFormField from '@/components/ui/AppFormField.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppInputPrefix from '@/components/ui/AppInputPrefix.vue'
import { updateProduct } from '@/services/admin/product'
import type { AdminProduct } from '@/services/admin/product'

const props = defineProps<{ product: AdminProduct }>()
const emit = defineEmits<{ success: [] }>()

const name = ref(props.product.name)
const description = ref(props.product.description ?? '')
const category = ref(props.product.category ?? '')
const currency = ref(props.product.currency ?? 'JPY')
const country = ref(props.product.country ?? 'JP')
const originalPrice = ref<number | ''>(props.product.original_price)
const flatFee = ref<number | ''>(props.product.flat_fee ?? '')
const stock = ref<number | ''>(props.product.stock)
const maxOrder = ref<number | ''>(props.product.maxOrder ?? '')
const inStock = ref(props.product.stock > 0)

const isSubmitting = ref(false)
const submitError = ref('')

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

const countries = [
  { code: 'JP', label: 'Jepang' },
  { code: 'KR', label: 'Korea Selatan' },
  { code: 'US', label: 'Amerika Serikat' },
  { code: 'CN', label: 'Tiongkok' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'SG', label: 'Singapura' },
]

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  const e: Record<string, string> = {}
  if (!name.value.trim()) e.name = 'Nama produk wajib diisi.'
  if (!description.value.trim()) e.desc = 'Deskripsi wajib diisi.'
  if (!category.value) e.category = 'Pilih kategori produk.'
  if (!originalPrice.value || Number(originalPrice.value) <= 0) e.price = 'Masukkan harga yang valid.'
  if (flatFee.value === '' || Number(flatFee.value) < 0) e.flatFee = 'Masukkan flat fee yang valid.'
  if (stock.value === '' || Number(stock.value) < 0) e.stock = 'Masukkan jumlah stok.'
  if (!maxOrder.value || Number(maxOrder.value) <= 0) e.maxOrder = 'Masukkan batas order.'
  errors.value = e
  return Object.keys(e).length === 0
}

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
      country: country.value,
      original_price: Number(originalPrice.value),
      flat_fee: Number(flatFee.value),
      stock: Number(stock.value),
      maxOrder: Number(maxOrder.value),
    })
    emit('success')
  } catch (err: unknown) {
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
          <AppFormField label="Nama Produk" required :error="errors.name">
            <AppInput
              v-model="name"
              placeholder="cth. Hada Labo Gokujyun Hyaluronic Lotion"
              :error="!!errors.name"
            />
          </AppFormField>

          <AppFormField label="Deskripsi" required :error="errors.desc">
            <AppTextarea
              v-model="description"
              placeholder="Deskripsi singkat produk..."
              :error="!!errors.desc"
            />
          </AppFormField>
        </div>
      </section>

      <!-- Category -->
      <section>
        <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">Kategori</h2>
        <AppFormField label="Kategori" required :error="errors.category">
          <AppSelect v-model="category" :error="!!errors.category">
            <option value="" disabled>Pilih kategori...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </AppSelect>
        </AppFormField>
      </section>

      <!-- Pricing & Stock -->
      <section>
        <h2 class="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Harga & Stok
        </h2>
        <div class="space-y-4">
          <!-- Currency & Country -->
          <div class="grid grid-cols-2 gap-4">
            <AppFormField label="Mata Uang">
              <AppSelect v-model="currency">
                <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.label }}</option>
              </AppSelect>
            </AppFormField>
            <AppFormField label="Negara Asal">
              <AppSelect v-model="country">
                <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.label }}</option>
              </AppSelect>
            </AppFormField>
          </div>

          <AppFormField label="Harga" required :error="errors.price">
            <AppInputPrefix v-model="originalPrice" :prefix="currency" :error="!!errors.price" min="1" />
          </AppFormField>

          <AppFormField label="Flat Fee" required :error="errors.flatFee">
            <AppInputPrefix v-model="flatFee" :prefix="currency" :error="!!errors.flatFee" min="0" />
          </AppFormField>

          <div class="grid grid-cols-2 gap-4">
            <AppFormField label="Stok" required :error="errors.stock">
              <AppInput v-model="stock" type="number" placeholder="0" min="0" :error="!!errors.stock" />
            </AppFormField>
            <AppFormField label="Maks. Order" required :error="errors.maxOrder">
              <AppInput v-model="maxOrder" type="number" placeholder="0" min="1" :error="!!errors.maxOrder" />
            </AppFormField>
          </div>
        </div>
      </section>

      <!-- Availability toggle -->
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

      <p
        v-if="submitError"
        class="text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100"
      >
        {{ submitError }}
      </p>

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
          <span v-else>Simpan Perubahan</span>
        </AppButton>
      </div>
    </div>
  </form>
</template>
