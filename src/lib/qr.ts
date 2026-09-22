// SAD v2 §5: Dynamic 'Print-to-Digital' QR architecture (client slice).
// Each QR links a physical print to a redirect ID. Retargeting + scan analytics
// live server-side; the PWA mints the ID, renders the QR, and queues the binding
// in IndexedDB for sync. Short-URL shape: https://printmadesimple.co.zw/q/{id}

import QRCode from 'qrcode'

export const QR_BASE = 'https://printmadesimple.co.zw/q'

export type QrBinding = {
  id: string // 8-char redirect id
  target: string // landing page / vCard URL (retargetable server-side later)
  label: string // e.g. "Jewel cover — Big Travel"
  ref: string // parent quote/order ref
  scans: number // local counter stub; server is source of truth
  createdAt: number
}

export function newQrId(): string {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let id = ''
  const rnd = crypto.getRandomValues(new Uint8Array(8))
  for (let i = 0; i < 8; i++) id += abc[rnd[i] % abc.length]
  return id
}

export function qrUrl(id: string): string {
  return `${QR_BASE}/${id}`
}

export async function qrDataUrl(text: string, size = 180): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: 'M' })
}
