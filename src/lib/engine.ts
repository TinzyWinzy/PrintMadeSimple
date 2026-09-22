import { BUSINESS } from '../data/business'

export type CalendarConfig = {
  stock: 'gloss' | 'matt'
  startMonth: number // 0-11 (0=January)
  startYear: number
  durationMonths: 12 | 15 | 18
  coverType: 'standard' | 'custom'
  brandName: string
  recipientName: string
  tagline: string
  logoDataUrl: string | null
  coverDataUrl: string | null
  monthImages: Record<number, string | null> // offset 0..17 -> dataURL
  monthNotes: Record<number, string>
  highlights: Record<number, { day: number; label: string }[]> // offset -> up to 4
  includeZimHolidays: boolean
}

export const DEFAULT_CALENDAR: CalendarConfig = {
  stock: 'gloss',
  startMonth: 0,
  startYear: 2026,
  durationMonths: 12,
  coverType: 'standard',
  brandName: '',
  recipientName: '',
  tagline: "Promote your business for 365 days of the year!",
  logoDataUrl: null,
  coverDataUrl: null,
  monthImages: {},
  monthNotes: {},
  highlights: {},
  includeZimHolidays: true
}

// --- Pricing (USD indicative, ZWG equivalent shown at checkout note) ---
export function jewelCasePrice(qty: number, duration: number, stock: 'gloss' | 'matt'): number {
  // base per-unit curve: volume discount; 15/18-month pro-rata; matt +5%
  let unit = qty >= 500 ? 0.85 : qty >= 200 ? 0.95 : qty >= 100 ? 1.1 : qty >= 50 ? 1.3 : 1.6
  unit *= duration / 12
  if (stock === 'matt') unit *= 1.05
  return Math.round(unit * qty * 100) / 100
}

export function catalogPrice(base: number, qty: number, opts?: { rush?: boolean; qr?: boolean }): number {
  let unit = base
  if (qty >= 1000) unit *= 0.55
  else if (qty >= 500) unit *= 0.65
  else if (qty >= 200) unit *= 0.78
  else if (qty >= 100) unit *= 0.9
  if (opts?.qr) unit += 0.01
  let total = unit * qty
  if (opts?.rush) total *= 1.25
  return Math.round(total * 100) / 100
}

export function rfqHash(input: string): string {
  // FNV-1a 32-bit + timestamp base36 — idempotent tracking hash, no dep
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `PMS-${Date.now().toString(36).toUpperCase()}-${h.toString(16).toUpperCase().padStart(8, '0')}`
}

export function whatsappOrderLink(message: string, to = BUSINESS.phones[0].intl): string {
  return `https://wa.me/${to.replace('+', '')}?text=${encodeURIComponent(message)}`
}
