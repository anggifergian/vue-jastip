export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface ProductImage {
  url: string
  alt?: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  currency: 'JPY' | 'KRW'
  image: string
  images?: ProductImage[]
  description: string
  origin: string
  weight: number
  inStock: boolean
  badge?: string
}

export interface CartItem {
  id: string
  slug: string
  name: string
  price: {
    value: number
    formattedValue: string
    currency: string
    idr: { value: number; formattedValue: string }
  }
  currency: string
  country: string
  availability: { status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'; remaining: string }
  maxOrder: number
  images: { url: string; altText: string | null; imageType: string }[]
  quantity: number
  notes?: string
}
