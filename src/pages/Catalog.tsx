import { useMemo, useState } from 'react'
import { PRODUCTS, BUSINESS } from '../data/business'
import { catalogPrice, whatsappOrderLink } from '../lib/engine'
import { buildOrderMessage } from '../lib/docs'
import { pickupToken } from '../lib/security'
import { saveDesign } from '../lib/db'

export default function Catalog() {
  const [qty, setQty] = useState<Record<string, number>>({})
  const [qrT, setQrT] = useState<Record<string, string>>({}) // bc-qr print-to-digital target
  const [rush, setRush] = useState(false)
  const cats = useMemo(() => [...new Set(PRODUCTS.map(p => p.category))], [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">Catalog & price calculator</h1>
        <label className="text-xs flex items-center gap-1 border rounded-full px-2 py-1">
          <input type="checkbox" checked={rush} onChange={e => setRush(e.target.checked)} /> Rush +25%
        </label>
      </div>
      {cats.map(cat => (
        <section key={cat}>
          <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">{cat}</h2>
          <div className="space-y-2 mt-1">
            {PRODUCTS.filter(p => p.category === cat).map(p => {
              const q = qty[p.id] ?? p.minQty
              const total = catalogPrice(p.basePriceUSD, q, { rush, qr: p.id === 'bc-qr' })
              return (
                <article key={p.id} className="border rounded-2xl p-3">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm text-neutral-600">{p.desc}</p>
                  <p className="text-xs text-neutral-500 mt-1">{p.specs} · {p.turnaround} · min {p.minQty}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-xs">Qty</label>
                    <input type="number" min={p.minQty} value={q} onChange={e => setQty(s => ({ ...s, [p.id]: Math.max(p.minQty, Number(e.target.value) || p.minQty) }))} className="border rounded px-2 py-1 w-24 text-sm" />
                    <span className="ml-auto font-black">USD {total.toFixed(2)}</span>
                  </div>
                  {p.id === 'bc-qr' && <input value={qrT[p.id] || ''} onChange={e => setQrT(s => ({ ...s, [p.id]: e.target.value }))} placeholder="QR target URL (WhatsApp / website)" className="border rounded p-1.5 text-sm w-full mt-2" />}
                  <div className="flex gap-2 mt-2 no-print">
                    <a className="flex-1 text-center bg-green-600 text-white rounded-full py-1.5 text-sm font-bold"
                      href={whatsappOrderLink(buildOrderMessage('order', p.id.toUpperCase(), `${p.name} x${q} — USD ${total.toFixed(2)}${rush ? ' (RUSH)' : ''}${p.id === 'bc-qr' && qrT[p.id] ? ` QR→${qrT[p.id]}` : ''}`))}>WhatsApp order</a>
                    <button className="flex-1 border rounded-full py-1.5 text-sm font-bold" onClick={() => {
                      const token = pickupToken(`${p.id}${Date.now()}`)
                      saveDesign({ kind: 'order', ref: `${p.id}-${Date.now().toString(36)}`, payload: { product: p.id, qty: q, rush, total, pickupToken: token, qrTarget: qrT[p.id] || null }, status: 'queued' })
                      alert(`Saved offline. Pickup token ${token}.`)
                    }}>Save offline</button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
      <p className="text-xs text-neutral-500">Indicative USD pricing. Final PRAZ quote emailed as PDF. Pay on collection at {BUSINESS.address}.</p>
    </div>
  )
}
