import http from '@/lib/http'

// ── Types ────────────────────────────────────────────────
export interface AdminProductImage {
  id: string
  key: string
  url: string
  alt: string | null
}

export interface AdminProduct {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  currency: string | null
  category: string | null
  status: string
  stock: number
  maxOrder: number | null
  images: AdminProductImage[]
  main_image: string | null
  created_at: number
  updated_at: number
}

export interface CreateProductPayload {
  name: string
  description: string
  category: string
  currency: string
  price: number
  stock: number
  maxOrder: number
  image_keys: string[]
}

export interface UpdateProductPayload {
  name?: string
  description?: string
  category?: string
  currency?: string
  price?: number
  stock?: number
  maxOrder?: number
}

// ── Endpoints ────────────────────────────────────────────
export interface GetAdminProductsParams {
  category?: string
  status?: string
}

export async function getAdminProducts(params?: GetAdminProductsParams): Promise<AdminProduct[]> {
  const { data } = await http.get('/admin/products', { params })
  return data.data
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const { data } = await http.get(`/admin/products/${id}`)
  return data.data
}

export async function createProduct(payload: CreateProductPayload) {
  const { data } = await http.post('/admin/products', payload)
  return data
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<AdminProduct> {
  const { data } = await http.put(`/admin/products/${id}`, payload)
  return data.data
}

export async function publishProduct(id: string): Promise<void> {
  await http.post(`/admin/products/${id}/publish`)
}

export async function deleteProduct(id: string): Promise<void> {
  await http.delete(`/admin/products/${id}`)
}

export async function archiveProduct(id: string): Promise<void> {
  await http.post(`/admin/products/${id}/archive`)
}

export async function addProductImages(id: string, imageKeys: string[]): Promise<AdminProduct> {
  const { data } = await http.post(`/admin/products/${id}/images`, { imageKeys })
  return data.data
}

export async function deleteProductImages(id: string, imageKeys: string[]): Promise<AdminProduct> {
  const { data } = await http.delete(`/admin/products/${id}/images`, { data: { imageKeys } })
  return data.data
}
