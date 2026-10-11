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

export interface CartItem extends Product {
  quantity: number
  notes?: string
}
