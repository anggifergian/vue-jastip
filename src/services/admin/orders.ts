import http from '@/lib/http'

// ── Types ────────────────────────────────────────────────
export const ORDER_STATUSES = [
  'pending',
  'payment_uploaded',
  'payment_confirmed',
  'acknowledged',
  'purchased',
  'arrived',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refund_requested',
  'refunded',
] as const

export type OrderStatus = typeof ORDER_STATUSES[number]

export interface AdminOrder {
  id: string
  user_email: string
  user_phone: string
  status: OrderStatus
  notes: string | null
  tracking_number: string | null
  total_price: number
  flat_fee_total: number
  estimated_customs_idr: number
  customs_exceeds_limit: number
  dp_amount: number
  exchange_rates_snapshot: string | null
  created_at: number
  updated_at: number
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
  price: number
  currency: string
  notes: string | null
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shipping_fee: number | null
  service_fee: number | null
  total: number
  notes: string | null
  created_at: number
  updated_at: number
}

export interface UpdateOrderPayload {
  status?: OrderStatus
  tracking_number?: string
  notes?: string
}

export interface OrderQuery {
  page?: number
  limit?: number
  status?: OrderStatus | ''
  search?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedOrders {
  data: AdminOrder[]
  pagination: Pagination
}

// ── Endpoints ────────────────────────────────────────────
export async function getAdminOrders(query: OrderQuery = {}): Promise<PaginatedOrders> {
  const { data } = await http.get('/admin/orders', { params: query })
  return { data: data.data, pagination: data.pagination }
}

export async function getAdminOrder(id: string): Promise<Order> {
  const { data } = await http.get(`/admin/orders/${id}`)
  return data.data
}

export async function updateOrder(id: string, payload: UpdateOrderPayload): Promise<Order> {
  const { data } = await http.patch(`/admin/orders/${id}`, payload)
  return data.data
}

export async function deleteOrder(id: string): Promise<void> {
  await http.delete(`/admin/orders/${id}`)
}
