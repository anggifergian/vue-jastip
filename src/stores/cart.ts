import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { swal } from '@/lib/swal'
import type { CartItem } from '@/types'
import type { CatalogProduct } from '@/services/catalog'

const STORAGE_KEY = 'jastipku-cart'

function loadFromStorage(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const items: CartItem[] = raw ? JSON.parse(raw) : []
    return items.filter((item) => item.id && item.quantity)
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromStorage())

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalPriceIDR = computed(() =>
    items.value.reduce((sum, item) => sum + item.price.idr.value * item.quantity, 0),
  )

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price.value * item.quantity, 0)
  })

  watch(
    items,
    (val) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  function showMaxOrderAlert(maxOrder: number) {
    swal.fire({
      icon: 'warning',
      title: 'Batas maksimal',
      text: `Maksimal ${maxOrder} item per produk untuk satu titipan.`,
      confirmButtonText: 'Mengerti',
    })
  }

  function addItem(product: CatalogProduct) {
    const existing = items.value.find((i) => i.id === product.id)

    if (existing) {
      if (existing.quantity >= product.maxOrder) {
        showMaxOrderAlert(product.maxOrder)
        return
      }

      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1, notes: '' })
    }
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    const item = items.value.find((i) => i.id === id)
    if (!item) return

    if (quantity > item.maxOrder) {
      showMaxOrderAlert(item.maxOrder)
      return
    }

    item.quantity = quantity
  }

  function updateNotes(id: string, notes: string) {
    const item = items.value.find((i) => i.id === id)
    if (item) item.notes = notes
  }

  function getQuantity(id: string): number {
    return items.value.find((i) => i.id === id)?.quantity ?? 0
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalItems,
    totalPrice,
    totalPriceIDR,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    getQuantity,
    clearCart,
  }
})
