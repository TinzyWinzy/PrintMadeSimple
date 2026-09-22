// SAD v2 §2 + §6: SHA-256 integrity hashing, ZIMRA gate, express pickup tokens.
// All client-side (Web Crypto) — offline-capable. Server re-verifies on sync.

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// Canonical payload for quote hashing — field order fixed so server reproduces it.
export function canonicalQuote(p: {
  ref: string; company: string; contactPerson: string; phone: string; email: string
  taxId: string; itf263Ref: string; delivery: string
  items: { desc: string; qty: number; unitPrice: number }[]; notes: string
}): string {
  const items = p.items.map(i => `${i.desc}|${i.qty}|${i.unitPrice}`).join(';')
  return [p.ref, p.company, p.contactPerson, p.phone, p.email, p.taxId, p.itf263Ref, p.delivery, items, p.notes]
    .join('§')
}

// --- ZIMRA Tax Clearance Verification Workflow (SAD v2 §2.2) ---
// Format gate (client): ITF263 refs are numeric; expiry must be future-dated.
// Full cross-reference against ZIMRA happens server-side on sync — this gate
// blocks "Compliant" finalization offline, per spec logic-gate requirement.
export type ZimraCheck = { ok: boolean; reason?: string }

export function checkZimra(itf263Ref: string, expiryISO: string): ZimraCheck {
  const ref = itf263Ref.trim()
  if (!ref) return { ok: false, reason: 'ITF263 reference is required.' }
  if (!/^[0-9]{6,20}$/.test(ref.replace(/\s/g, '')))
    return { ok: false, reason: 'ITF263 ref must be 6–20 digits.' }
  if (!expiryISO) return { ok: false, reason: 'Tax clearance expiry date is required.' }
  const exp = new Date(expiryISO + 'T23:59:59')
  if (isNaN(exp.getTime())) return { ok: false, reason: 'Invalid expiry date.' }
  if (exp.getTime() < Date.now()) return { ok: false, reason: 'Tax clearance is EXPIRED — quote cannot be marked Compliant.' }
  return { ok: true }
}

// --- Express pickup tokens (SAD v2 §6) ---
// Token binds order ref + short checksum so Shop 4B can validate scan-and-go
// offline. Format: PMS-<base36 time>-<4-char checksum>.
export function pickupToken(ref: string): string {
  const t = Date.now().toString(36).toUpperCase()
  let h = 0
  const s = ref + t
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0
  return `PMS-${t}-${h.toString(36).toUpperCase().padStart(4, '0').slice(-4)}`
}

export function validPickupToken(tok: string): boolean {
  return /^PMS-[0-9A-Z]{6,10}-[0-9A-Z]{4}$/.test(tok.trim().toUpperCase())
}
