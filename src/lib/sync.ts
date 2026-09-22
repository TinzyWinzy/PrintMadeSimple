// Push locally-sealed quotes to /api/quotes when online.
// Failure (offline / 503 no DB) is NOT an error — the IndexedDB outbox
// remains source of truth and Track retries later.
export async function pushQuote(payload: Record<string, unknown>, clientHash: string): Promise<{ ok: boolean; hash?: string; error?: string }> {
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
