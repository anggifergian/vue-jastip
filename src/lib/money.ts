const CURRENCY_LOCALE: Record<string, string> = {
  IDR: 'id-ID',
  JPY: 'ja-JP',
}

export function formatMoney(amount: number, currency: string): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'id-ID'
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
  return currency === 'IDR' ? formatted.replace(/^([^\d\s]+)\s/, '$1') : formatted
}
