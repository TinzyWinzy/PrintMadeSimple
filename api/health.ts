// GET /api/health — liveness probe (no DB import, stays warm + cheap).
export default async function handler(_req: Request) {
  return Response.json({ ok: true, app: 'print-made-simple', time: new Date().toISOString() })
}
