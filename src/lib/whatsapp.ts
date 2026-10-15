import type { CartItem } from '@/types'

export const WA_NUMBER = import.meta.env.VITE_WA_NUMBER as string

export function waLink(text?: string): string {
  const base = `https://wa.me/${WA_NUMBER}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function buildCartMessage(items: CartItem[]): string {
  const lines = items.map((item, i) => {
    const notes = item.notes ? `\n   Catatan: ${item.notes}` : ''
    return `${i + 1}. ${item.name} (x${item.quantity}) — ${item.price.formattedValue}${notes}`
  })

  return [
    'Halo, saya ingin menitipkan barang berikut:',
    '',
    ...lines,
    '',
    'Mohon info estimasi total harga (kurs + ongkir + jasa titip) dan ketersediaan barang. Terima kasih! 🙏',
  ].join('\n')
}
