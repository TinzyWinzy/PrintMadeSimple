import { BUSINESS } from '../data/business'
import { MONTHS, monthYearForOffset } from '../data/holidays'
import type { CalendarConfig } from './engine'

export type RFQInput = {
  company: string
  contactPerson: string
  phone: string
  email: string
  taxId: string
  itf263Ref: string
  itf263Expiry: string
  delivery: 'Harare CBD' | 'Harare — outside CBD' | 'Regional / outside Harare'
  items: { desc: string; qty: number; unitPrice: number }[]
  notes: string
  ref: string
}

export function rfqTotal(r: RFQInput): number {
  return Math.round(r.items.reduce((s, i) => s + i.qty * i.unitPrice, 0) * 100) / 100
}

export function fileToDataUrl(file: File, maxDim = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

export function buildOrderMessage(kind: string, ref: string, summary: string): string {
  return `Print Made Simple — New ${kind} ${ref}\n${summary}\n— sent from PWA (offline-capable)`
}

export function buildCalendarSummary(cfg: CalendarConfig, qty: number, total: number): string {
  const { month, year } = monthYearForOffset(cfg.startMonth, cfg.startYear, 0)
  const lines: string[] = [
    `Jewel Case Calendar x${qty} — USD ${total.toFixed(2)}`,
    `Stock: 300gsm ${cfg.stock} · ${cfg.durationMonths} months, starts ${MONTHS[month]} ${year}, no surcharge`,
    `Brand: ${cfg.brandName || '-'} · Recipient: ${cfg.recipientName || '-'}`,
    `Cover: ${cfg.coverType}`,
  ]
  return lines.join('\n')
}
