// POST /api/orders — finalize an order from a sealed quote.
// Idempotent on Idempotency-Key (client drives retries). Verifies the quote
// hash server-side so an offline client cannot fabricate an order for a quote
// it never sealed. No DB error strings leak to the client (SAD v2 §6).
// NOTE: Vercel Node functions ignore default exports returning a Response.
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function dbUrl(): string {
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
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: dbUrl() }) })
  }
  return globalForPrisma.prisma
}

type OrderItem = { productId: string; qty: number; unitPrice: number }

export async function POST(req: Request) {
  if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 })

  const idem = req.headers.get('Idempotency-Key')
  const idempotencyKey = idem ? idem.trim() : undefined

  let body: any
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { ref, quoteRef, hash, contact, items, pickupToken } = body ?? {}

  if (!ref || !quoteRef || !hash || !pickupToken || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!pickupToken || typeof pickupToken !== 'string') {
    return Response.json({ error: 'Missing or invalid pickupToken' }, { status: 400 })
  }

  try {
    const db = prisma()

    // Verify the referenced quote exists and its hash matches what the client signed.
    const quote = await db.quote.findUnique({
      where: { id: quoteRef },
      select: { id: true, hash: true, accountId: true, totalUsd: true },
    })
    if (!quote) return Response.json({ error: 'Quote not found' }, { status: 404 })
    if (quote.hash !== hash) return Response.json({ error: 'Hash mismatch — quote has been tampered with' }, { status: 409 })

    // Idempotency: if a prior request with this key exists, return it.
    let order: { id: string; totalUsd: number } | null = null
    if (idempotencyKey) {
      order = await db.order.findFirst({
        where: { idempotencyKey },
        select: { id: true, totalUsd: true },
      })
      if (order) return Response.json({ ok: true, ref: order.id, id: order.id, totalUsd: order.totalUsd, reused: true })
    }

    const totalUsd = Math.round(items.reduce((s: number, i: OrderItem) => s + i.qty * Number(i.unitPrice), 0) * 100) / 100

    await db.$transaction(async (tx) => {
      order = await tx.order.create({
        data: {
          id: ref,
          accountId: quote.accountId,
          customJson: { contact: contact || null },
          stage: 'RECEIVED',
          pickupToken,
          idempotencyKey: idempotencyKey || null,
          totalUsd,
          items: {
            create: (items as OrderItem[]).map((i) => ({
              productId: i.productId,
              qty: Number(i.qty),
              unitPrice: Number(i.unitPrice),
            })),
          },
          milestones: {
            create: [{ stage: 'RECEIVED', channel: 'pwa' }],
          },
        },
        select: { id: true, totalUsd: true },
      })
    })

    return Response.json({ ok: true, ref: order!.id, id: order!.id, totalUsd: order!.totalUsd })
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (/DATABASE_URL|connect|ECONN/i.test(msg)) {
      return Response.json({ error: 'Database unavailable', code: 'DB_UNAVAILABLE' }, { status: 503 })
    }
    if (/23505|unique constraint|duplicate/i.test(msg)) {
      return Response.json({ error: 'Order reference already exists' }, { status: 409 })
    }
    return Response.json({ error: 'Database error', code: 'DB_ERROR' }, { status: 500 })
  }
}
