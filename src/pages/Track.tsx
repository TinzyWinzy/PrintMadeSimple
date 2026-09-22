import { useEffect, useState } from 'react'
import { db, saveDesign, type SavedDesign } from '../lib/db'
import { BUSINESS } from '../data/business'
import { rfqHash, whatsappOrderLink } from '../lib/engine'
import { buildOrderMessage } from '../lib/docs'
import { validPickupToken } from '../lib/security'

const STAGES = ['Order Received / RFQ Submitted', 'Digital Proof Ready', 'Production Commenced', 'Ready for Collection (Harare hub)']
// SSE/push milestones (SAD v2 §6) arrive server-side; until then the stage index
// is advanced locally and persisted — the Shop 4B dashboard is source of truth.

export default function Track() {
  const [items, setItems] = useState<SavedDesign[]>([])
  const [online, setOnline] = useState(navigator.onLine)
  const [tokenInput, setTokenInput] = useState<Record<number, string>>({})

  async function load() { setItems(await db.designs.orderBy('updatedAt').reverse().toArray()) }
  useEffect(() => {
    load()
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  async function advance(it: SavedDesign) {
    const stage = Math.min(STAGES.length - 1, (it.payload?.stage ?? 0) + 1)
    await saveDesign({ ...it, payload: { ...it.payload, stage } })
    load()
  }

  async function collect(it: SavedDesign) {
    const entered = (tokenInput[it.id!] || '').trim().toUpperCase()
    const expected = String(it.payload?.pickupToken || '').toUpperCase()
    if (!validPickupToken(entered)) { alert('That token format is invalid (PMS-XXXX-XXXX).'); return }
    if (expected && entered !== expected) { alert('Token does not match this order.'); return }
    await saveDesign({ ...it, status: 'collected', payload: { ...it.payload, stage: STAGES.length - 1 } })
    load()
  }

  async function renew(it: SavedDesign) {
    // SAD v2 §2.4 one-touch Renewal: clone RFQ under a fresh ref + hash cycle.
    const ref = rfqHash('rfq' + Date.now())
    await saveDesign({ kind: 'rfq', ref, payload: { ...it.payload, ref, renewedFrom: it.ref }, status: 'queued' })
    load()
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-black">Track & outbox</h1>
      <p className={`text-xs rounded-full px-3 py-1 w-fit font-bold ${online ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{online ? 'Online — you can dispatch' : 'Offline — drafts safe on this device'}</p>
      {items.length === 0 && <p className="text-sm text-neutral-600 border rounded-2xl p-4">No drafts yet. Design a Jewel Case calendar or create an RFQ — it will appear here and survive load-shedding.</p>}
      {items.map(it => {
        const stage: number = it.payload?.stage ?? 0
        const token: string = it.payload?.pickupToken || ''
        return (
          <article key={it.id} className="border rounded-2xl p-3 text-sm">
            <p className="font-bold">{it.kind} · {it.ref}</p>
            <p className="text-xs text-neutral-500">{new Date(it.updatedAt).toLocaleString()} · {it.status}{token && ` · pickup ${token}`}</p>
            <ol className="mt-2 space-y-1">
              {STAGES.map((s, i) => <li key={s} className={`text-xs flex gap-2 ${i <= stage ? 'font-bold text-neutral-900' : 'text-neutral-400'}`}><span>{i <= stage ? '●' : '○'}</span>{s}</li>)}
            </ol>
            <div className="grid grid-cols-2 gap-2 mt-2 no-print">
              <a className="bg-green-600 text-white rounded-full py-1.5 text-center font-bold" href={whatsappOrderLink(buildOrderMessage(it.kind, it.ref, JSON.stringify(it.payload).slice(0, 800)))}>WhatsApp send</a>
              <button className="border rounded-full py-1.5 font-bold" onClick={() => advance(it)}>Advance stage</button>
              {it.kind === 'rfq' && <button className="border rounded-full py-1.5 font-bold" onClick={() => renew(it)}>Renew / amend</button>}
              <button className="border rounded-full py-1.5 font-bold" onClick={async () => { await db.designs.delete(it.id!); load() }}>Delete</button>
            </div>
            {it.status !== 'collected' && (
              <form className="flex gap-2 mt-2 no-print" onSubmit={e => { e.preventDefault(); collect(it) }}>
                <input value={tokenInput[it.id!] || ''} onChange={e => setTokenInput(s => ({ ...s, [it.id!]: e.target.value }))} placeholder="Pickup token (scan-and-go)" className="border rounded p-1.5 text-sm flex-1 font-mono" />
                <button className="bg-neutral-900 text-white rounded-full px-3 text-sm font-bold">Collect</button>
              </form>
            )}
          </article>
        )
      })}
      <p className="text-xs text-neutral-500">Dispatch goes to {BUSINESS.phones[0].display} / {BUSINESS.emails[0]}. Live SSE + push milestones land with the server (schema in prisma/); local stages persist offline meanwhile.</p>
    </div>
  )
}
