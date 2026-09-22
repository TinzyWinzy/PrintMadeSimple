// GET /api/health — liveness probe (no DB import, stays warm + cheap).
// NOTE: Vercel Node functions require named-method exports; a default export
// returning a Response is silently ignored (caught from production logs).
export function GET() {
  return Response.json({ ok: true, app: 'print-made-simple', time: new Date().toISOString() })
}
