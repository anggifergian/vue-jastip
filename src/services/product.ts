import http from '@/lib/http'

// ── Types ────────────────────────────────────────────────
export interface ProductImage {
  id: string
  key: string
  url: string
  alt: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  category: string
  status: string
  stock: number
  images: ProductImage[]
  main_image: string | null
  created_at: number
  updated_at: number
}

// ── Admin queries ────────────────────────────────────────
export async function getAdminProducts(): Promise<Product[]> {
  const { data } = await http.get('/admin/products')
  return data.data
}

export async function deleteProduct(id: string): Promise<void> {
  await http.delete(`/admin/products/${id}`)
}

export async function updateProductStatus(id: string, status: string): Promise<void> {
  await http.patch(`/admin/products/${id}`, { status })
}

// ── Create ───────────────────────────────────────────────
export interface CreateProductPayload {
  name: string
  description: string
  categoryId: string
  origin: 'Japan' | 'Korea'
  currency: 'JPY' | 'KRW'
  price: number
  weight: number
  badge?: string
  inStock: boolean
  images: string[]
}

export async function createProduct(payload: CreateProductPayload) {
  const { data } = await http.post('/admin/products', payload)
  return data
}
