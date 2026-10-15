import http from '@/lib/http'
import type { CartItem } from '@/types'

export interface OrderItem {
  productId: string
  quantity: number
  notes?: string
}

export interface Order {
  orderNumber: string
  email: string
  phone: string
  totalAmount: number
  currency: string
  status: string
  items: OrderItem[]
}

export async function validateOrder(email: string, items: OrderItem[]): Promise<void> {
  await http.post('/orders/validate', { email, items })
}

export async function requestOtp(email: string): Promise<void> {
  await http.post('/orders/otp/request', { email })
}

export async function verifyOtp(email: string, otp: string): Promise<{ token: string }> {
  const { data } = await http.post('/orders/otp/verify', { email, otp })
  return data.data
}

export async function createOrder(payload: {
  token: string
  email: string
  phone: string
  items: OrderItem[]
}): Promise<Order> {
  const { data } = await http.post('/orders', payload)
  return data.data
}

export function cartItemsToOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
    ...(item.notes ? { notes: item.notes } : {}),
  }))
}
