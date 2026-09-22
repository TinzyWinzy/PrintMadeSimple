import jsPDF from 'jspdf'
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
  itf263Expiry: string // ISO date — ZIMRA logic gate (SAD v2 §2.2)
  delivery: 'Harare CBD' | 'Harare — outside CBD' | 'Regional / outside Harare'
  items: { desc: string; qty: number; unitPrice: number }[]
  notes: string
  ref: string
}

export function rfqTotal(r: RFQInput): number {
  return Math.round(r.items.reduce((s, i) => s + i.qty * i.unitPrice, 0) * 100) / 100
}

// Downscale uploads on-device before preview/store (SAD §2.1 compression engine)
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

// SAD v2 §2: hashed, PRAZ-compliant quotation. `hash` is the SHA-256 of the
// canonical payload; `hashQr` is a QR dataURL encoding it for footer verification.
// Kept on jsPDF (not @react-pdf/renderer): same client-side verifiable output at
// ~1/10th the bundle cost — the low-bandwidth mandate outranks the library pick.
export function downloadRfqPdf(r: RFQInput, hash: string, hashQr: string | null) {
  const doc = new jsPDF()
  const total = rfqTotal(r)
  doc.setFillColor(227, 6, 19)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text('Print Made Simple Investments (Pvt) Ltd', 14, 12)
  doc.setFontSize(9)
  doc.text('designing | printing | branding — PRAZ-compliant quotation', 14, 19)
  doc.text(BUSINESS.address, 14, 24)
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(13)
  doc.text(`Formal Quotation — ${r.ref}`, 14, 38)
  doc.setFontSize(10)
  doc.text(`To: ${r.company} (${r.contactPerson})`, 14, 46)
  doc.text(`Phone: ${r.phone}   Email: ${r.email}`, 14, 52)
  doc.text(`Tax ID: ${r.taxId}   ITF263: ${r.itf263Ref} (exp ${r.itf263Expiry || '—'})`, 14, 58)
  doc.text(`Delivery: ${r.delivery}`, 14, 64)
  let y = 74
  doc.setFontSize(10)
  doc.text('Description', 14, y); doc.text('Qty', 120, y); doc.text('Unit USD', 140, y); doc.text('Line USD', 170, y)
  y += 6
  r.items.forEach((it) => {
    doc.text(it.desc.slice(0, 52), 14, y)
    doc.text(String(it.qty), 120, y)
    doc.text(it.unitPrice.toFixed(2), 140, y)
    doc.text((it.qty * it.unitPrice).toFixed(2), 170, y)
    y += 6
  })
  y += 4
  doc.setFontSize(13)
  doc.text(`TOTAL (USD): ${total.toFixed(2)}`, 14, y)
  y += 8
  doc.setFontSize(9)
  const notes = `Spec: 12 months printed back to back on 300gsm stock; jewel case becomes the calendar stand. Full-colour digital print. Start calendar in ANY month — no added charge. ${r.notes}`.match(/.{1,95}(\s|$)/g) || []
  notes.forEach((ln) => { doc.text(ln.trim(), 14, y); y += 5 })
  y += 4
  doc.text(`Ref ${r.ref} · ${BUSINESS.emails.join(' · ')} · ${BUSINESS.phones.map(p => p.display).join(' · ')}`, 14, y)
  // Vendor disclosure + integrity footer (SAD v2 §2.1/2.3)
  y += 7
  doc.setFontSize(8)
  doc.text(`Vendor: ${BUSINESS.name} · ${BUSINESS.address}`, 14, y); y += 4
  doc.text('Banking details are issued on the signed tax invoice — this quotation is binding for 14 days.', 14, y); y += 5
  doc.setFontSize(9)
  doc.text(`SHA-256 integrity hash:`, 14, y); y += 5
  doc.setFontSize(7)
  doc.text(hash, 14, y)
  if (hashQr) {
    try { doc.addImage(hashQr, 'PNG', 160, y - 18, 34, 34) } catch { /* offline-safe */ }
    doc.setFontSize(7)
    doc.text('Scan to verify', 162, y + 19)
  }
  doc.save(`${r.ref}.pdf`)
}

export function downloadCalendarProof(cfg: CalendarConfig, ref: string, qrDUrl: string | null, qrTarget: string) {
  const doc = new jsPDF()
  doc.setFillColor(227, 6, 19)
  doc.rect(0, 0, 210, 24, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('Jewel Case Calendar — Proof Summary', 14, 14)
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(10)
  let y = 34
  const rows = [
    `Ref: ${ref}`,
    `Stock: 300gsm ${cfg.stock} (gloss/matt)`,
    `Duration: ${cfg.durationMonths} months from ${MONTHS[cfg.startMonth]} ${cfg.startYear} — no surcharge`,
    `Cover: ${cfg.coverType} — Brand: ${cfg.brandName || '-'} — Recipient: ${cfg.recipientName || '-'}`,
    `Logo: ${cfg.logoDataUrl ? 'attached (pre-flighted on device)' : 'NOT attached (DPI warning)'} — Cover art: ${cfg.coverDataUrl ? 'attached' : cfg.coverType === 'custom' ? 'MISSING' : 'n/a'}`,
    `Print-to-Digital QR: ${qrTarget || '—'}`,
  ]
  rows.forEach((r) => { doc.text(r.slice(0, 100), 14, y); y += 7 })
  if (qrDUrl) {
    try { doc.addImage(qrDUrl, 'PNG', 160, 30, 32, 32) } catch { /* offline-safe */ }
    doc.setFontSize(7)
    doc.text('Buyer QR', 166, 64)
    doc.setFontSize(10)
  }
  y += 2
  doc.text('Month images / highlights:', 14, y); y += 7
  for (let o = 0; o < cfg.durationMonths; o++) {
    const { month, year } = monthYearForOffset(cfg.startMonth, cfg.startYear, o)
    const hl = (cfg.highlights[o] || []).map((h) => `${h.day}:${h.label}`).join(', ') || '—'
    doc.text(`${MONTHS[month]} ${year}: img=${cfg.monthImages[o] ? 'yes' : 'no'} note=${(cfg.monthNotes[o] || '—').slice(0, 30)} hl=[${hl.slice(0, 60)}]`, 14, y)
    y += 6
    if (y > 280) { doc.addPage(); y = 20 }
  }
  doc.save(`${ref}-proof.pdf`)
}
