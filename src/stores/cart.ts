import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Product, CartItem } from '@/types'

const STORAGE_KEY = 'jastipku-cart'

function loadFromStorage(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const items: CartItem[] = raw ? JSON.parse(raw) : []
    // Drop items saved before the currency refactor (no currency field)
    return items.filter((item) => item.currency === 'JPY' || item.currency === 'KRW')
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromStorage())

  const totalItems = computed(() => items.value.length)

  watch(
    items,
    (val) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  function addItem(product: Product) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
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
    if (item) item.quantity = quantity
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
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    getQuantity,
    clearCart,
  }
})
