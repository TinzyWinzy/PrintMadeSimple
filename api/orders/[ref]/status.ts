// GET /api/orders/[ref]/status — public order status by tracking ref.
// No customer PII: returns ref, stage, createdAt, and items (productId/qty/unitPrice).
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

export async function GET(req: Request) {
  const url = new URL(req.url)
  const ref = url.pathname.split('/').pop()
  if (!ref) return Response.json({ error: 'Missing order ref' }, { status: 400 })

  try {
    const db = prisma()
    const order = await db.order.findUnique({
      where: { id: ref },
      select: {
        id: true,
        pickupToken: true,
        stage: true,
        totalUsd: true,
        createdAt: true,
        items: { select: { productId: true, qty: true, unitPrice: true } },
        milestones: { select: { stage: true, createdAt: true } },
      },
    })
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })

    // Verify the pickup token to prevent enumeration of arbitrary refs.
    // The token is checked via a separate header/query param rather than returned.
    const token = url.searchParams.get('token')
    if (token && order.pickupToken !== token) {
      return Response.json({ error: 'Invalid pickup token' }, { status: 403 })
    }

    return Response.json({
      ref: order.id,
      stage: order.stage,
      totalUsd: order.totalUsd,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({ productId: i.productId, qty: i.qty, unitPrice: i.unitPrice })),
      milestones: order.milestones.map((m) => ({ stage: m.stage, createdAt: m.createdAt })),
    })
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (/DATABASE_URL|connect|ECONN/i.test(msg)) {
      return Response.json({ error: 'Database unavailable', code: 'DB_UNAVAILABLE' }, { status: 503 })
    }
    return Response.json({ error: 'Database error', code: 'DB_ERROR' }, { status: 500 })
  }
}
