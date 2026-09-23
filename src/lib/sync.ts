// Client-to-server sync for quotes and orders.
// Push locally-sealed quote/order to the server when online. Failures
// (offline / 503 DB unavailable) are NOT fatal — the IndexedDB outbox remains
// the source of truth and Track retries later.
import { listDesigns, saveDesign } from './db'

export interface OrderItem {
  productId: string
  qty: number
  unitPrice: number
}

export interface OrderPayload {
  ref: string
  quoteRef: string
  hash: string
  contact?: { name?: string; phone?: string; email?: string }
  items: OrderItem[]
  pickupToken: string
  totalUsd?: number
}

export async function pushQuote(payload: Record<string, unknown>, clientHash: string) {
  try {
    const r = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...payload, clientHash }),
    })
    const j = await r.json().catch(() => ({}))
    return r.ok ? { ok: true, hash: j.hash } : { ok: false, error: j.error || `HTTP ${r.status}` }
  } catch {
    return { ok: false, error: 'offline' }
  }
}

export async function pushOrder(
  payload: OrderPayload,
  idempotencyKey: string,
): Promise<{ ok: boolean; ref?: string; id?: string; totalUsd?: number; reused?: boolean; error?: string }> {
  try {
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
    })
    const j = await r.json().catch(() => ({}))
    return r.ok
      ? { ok: true, ref: j.ref, id: j.id, totalUsd: j.totalUsd, reused: j.reused }
      : { ok: false, error: j.error || `HTTP ${r.status}` }
  } catch {
    return { ok: false, error: 'offline' }
  }
}

export interface OrderStatus {
  ref: string
  stage: string
  totalUsd: number
  createdAt: string
  items: { productId: string; qty: number; unitPrice: number }[]
  milestones: { stage: string; createdAt: string }[]
}

export async function getOrderStatus(ref: string, token?: string): Promise<{ ok: boolean; status?: OrderStatus; error?: string }> {
  try {
    const q = token ? `?token=${encodeURIComponent(token)}` : ''
    const r = await fetch(`/api/orders/${encodeURIComponent(ref)}/status${q}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (r.status === 404) return { ok: false, error: 'Order not found' }
    const j = await r.json().catch(() => ({}))
    return r.ok ? { ok: true, status: j } : { ok: false, error: j.error || `HTTP ${r.status}` }
  } catch {
    return { ok: false, error: 'offline' }
  }
}

// Dispatch every queued local design to the server when online. RFQ rows call
// POST /api/quotes; order rows (with a quoteRef + hash) call POST /api/orders.
// Successful rows flip to "sent"; the rest stay queued for retry.
export async function flushOutbox(): Promise<{ synced: number; failed: number; detail: string[] }> {
  if (!navigator.onLine) return { synced: 0, failed: 0, detail: ['offline'] }
  const items = await listDesigns()
  const queued = items.filter(d => d.status === 'queued')
  let synced = 0
  let failed = 0
  const detail: string[] = []
  for (const d of queued) {
    try {
      let res: { ok: boolean; error?: string }
      if (d.kind === 'rfq' && typeof d.payload?.quoteHash === 'string') {
        res = await pushQuote({ ...d.payload, ref: d.ref }, d.payload.quoteHash)
      } else if (d.kind === 'order' && d.payload?.quoteRef && d.payload?.hash) {
        res = await pushOrder(d.payload as unknown as OrderPayload, `order:${d.ref}`)
      } else {
        continue // jewel-calendar has no server intake yet
      }
      if (res.ok) {
        await saveDesign({ ...d, status: 'sent' })
        synced++
      } else {
        failed++
        detail.push(`${d.ref}: ${res.error || 'unknown'}`)
      }
    } catch (e: any) {
      failed++
      detail.push(`${d.ref}: ${e?.message || 'error'}`)
    }
  }
  return { synced, failed, detail }
}
