import http from '@/lib/http'

// ── Types ────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'purchased'
  | 'shipped'
  | 'arrived'
  | 'delivered'
  | 'cancelled'

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

export interface OrderListItem {
  id: string
  order_number: string
  customer_name: string
  status: OrderStatus
  total: number
  item_count: number
  created_at: number
}

export interface UpdateOrderPayload {
  status?: OrderStatus
  shipping_fee?: number
  service_fee?: number
  notes?: string
}

export interface OrderQuery {
  page?: number
  limit?: number
  status?: OrderStatus
  search?: string
}

export interface PaginatedOrders {
  data: OrderListItem[]
  total: number
  page: number
  limit: number
}

// ── Endpoints ────────────────────────────────────────────
export async function getAdminOrders(query: OrderQuery = {}): Promise<PaginatedOrders> {
  const { data } = await http.get('/admin/orders', { params: query })
  return data.data
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
