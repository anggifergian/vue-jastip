import type { Category, Product } from '@/types'
import categoriesData from '@/mock/categories.json'
import productsData from '@/mock/products.json'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchCategories(): Promise<Category[]> {
  await delay(100)
  return categoriesData as Category[]
}

export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  await delay(250)
  const products = productsData as Product[]
  if (categoryId && categoryId !== 'all') {
    return products.filter((p) => p.categoryId === categoryId)
  }
  return products
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  await delay(150)
  return (productsData as Product[]).find((p) => p.id === id)
}
