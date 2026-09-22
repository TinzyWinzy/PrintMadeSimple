// POST /api/quotes — server-side quote intake (SAD v2 §2 + §7).
// Recomputes the SHA-256 over the canonical payload and REJECTS tampered
// submissions (409). ZIMRA cross-reference + COMPLIANT sealing happen here
// once the verification integration lands; until then the client gate
// (format + expiry) is enforced again server-side. Persists to Neon via Prisma.
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

// NOTE: mirrors src/lib/security.ts (sha256Hex/canonicalQuote/checkZimra).
// Duplicated deliberately: Vercel Node functions run unbundled as native ESM,
// so relative TS imports without extensions fail at runtime (ERR_MODULE_NOT_FOUND).
// Keep both copies in sync — they are small, pure, dependency-free.
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function canonicalQuote(p: {
  ref: string; company: string; contactPerson: string; phone: string; email: string
  taxId: string; itf263Ref: string; delivery: string
  items: { desc: string; qty: number; unitPrice: number }[]; notes: string
}): string {
  const items = p.items.map(i => `${i.desc}|${i.qty}|${i.unitPrice}`).join(';')
  return [p.ref, p.company, p.contactPerson, p.phone, p.email, p.taxId, p.itf263Ref, p.delivery, items, p.notes]
    .join('§')
}

function checkZimra(itf263Ref: string, expiryISO: string): { ok: boolean; reason?: string } {
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

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function dbUrl(): string {
  // Prefer explicit DATABASE_URL; fall back to Neon-integration pooled strings.
  const v =
    process.env.DATABASE_URL ||
    process.env.STORAGE_POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.STORAGESEV_PRISMA_DATABASE_URL ||
    ''
  if (!v) throw new Error('DATABASE_URL is not set')
  return v
}

function prisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaNeon({ connectionString: dbUrl() }),
    })
  }
  return globalForPrisma.prisma
}

// NOTE: named POST export — Vercel Node functions ignore a default export
// that returns a Response (caught from production logs).
export async function POST(req: Request) {
  if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 })
  let body: any
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { ref, company, contactPerson, phone, email, taxId, itf263Ref, itf263Expiry, delivery, items, notes, clientHash } = body ?? {}
  if (!ref || !company || !contactPerson || !phone || !email || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const zimra = checkZimra(String(itf263Ref || ''), String(itf263Expiry || ''))
  if (!zimra.ok) return Response.json({ error: `Non-Compliant: ${zimra.reason}`, zimra }, { status: 422 })

  const canonical = canonicalQuote({ ref, company, contactPerson, phone, email, taxId: taxId || '', itf263Ref, delivery, items, notes: notes || '' })
  const hash = await sha256Hex(canonical)
  if (clientHash && clientHash !== hash) {
    return Response.json({ error: 'Integrity mismatch — payload differs from signed hash', hash }, { status: 409 })
  }

  try {
    const db = prisma()
    const totalUsd = Math.round(items.reduce((s: number, i: any) => s + Number(i.qty) * Number(i.unitPrice), 0) * 100) / 100
    // Upsert account by email (guest-friendly), then seal the quote.
    const account = await db.account.upsert({
      where: { email },
      update: { company, contactPerson, phone, taxId: taxId || null, itf263Ref, itf263Expiry: itf263Expiry ? new Date(itf263Expiry) : null },
      create: { company, contactPerson, phone, email, taxId: taxId || null, itf263Ref, itf263Expiry: itf263Expiry ? new Date(itf263Expiry) : null },
    })
    const quote = await db.quote.upsert({
      where: { id: ref },
      update: {},
      create: {
        id: ref, accountId: account.id,
        payload: { company, contactPerson, phone, email, taxId, itf263Ref, itf263Expiry, delivery, items, notes } as any,
        totalUsd, hash, status: 'COMPLIANT',
      },
    })
    return Response.json({ ok: true, ref: quote.id, hash, totalUsd })
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (msg.includes('DATABASE_URL')) return Response.json({ error: 'Database not configured (DATABASE_URL missing)' }, { status: 503 })
    return Response.json({ error: 'Database error', detail: msg.slice(0, 300) }, { status: 500 })
  }
}
