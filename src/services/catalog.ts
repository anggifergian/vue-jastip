import http from '@/lib/http'
import type { Category, Product } from '@/types'
import categoriesData from '@/mock/categories.json'
import productsData from '@/mock/products.json'

// ── Types ────────────────────────────────────────────────

type ImageType = 'PRIMARY' | 'GALLERY' | 'THUMBNAIL'

export interface CatalogProductImage {
  url: string
  altText: string | null
  imageType: ImageType
}

export interface Availability {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  remaining: string
}

export interface CatalogProduct {
  id: string
  slug: string
  name: string
  description: string | null
  price: {
    value: number
    formattedValue: string
    currency: string
    idr: { value: number; formattedValue: string }
  }
  currency: string
  country: string
  category: string | null
  category_name: string | null
  availability: Availability
  maxOrder: number
  images: CatalogProductImage[]
  created_at: number
}

interface CatalogResponse {
  success: boolean
  data: CatalogProduct[]
  pagination: { total: number }
}

// ── Endpoints ────────────────────────────────────────────

export async function fetchProducts(category?: string): Promise<CatalogProduct[]> {
  const params: Record<string, string> = {}
  if (category && category !== 'all') params.category = category

  const { data } = await http.get<CatalogResponse>('/catalogs', { params })
  return data.data
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct> {
  const { data } = await http.get<{ success: boolean; data: CatalogProduct }>(`/catalogs/${slug}`)
  return data.data
}

export async function fetchCategories(): Promise<Category[]> {
  return categoriesData as Category[]
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  return (productsData as Product[]).find((p) => p.id === id)
}
