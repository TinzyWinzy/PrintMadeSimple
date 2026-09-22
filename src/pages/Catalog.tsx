import { useMemo, useState } from 'react'
import { PRODUCTS, BUSINESS, type Product } from '../data/business'
import { catalogPrice, whatsappOrderLink } from '../lib/engine'
import { buildOrderMessage } from '../lib/docs'
import { pickupToken } from '../lib/security'
import { saveDesign } from '../lib/db'

export default function Catalog() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<string, number>>({})
  const [rush, setRush] = useState<Record<string, boolean>>({})
  const [qrT, setQrT] = useState<Record<string, string>>({})
  const cats = useMemo(() => [...new Set(PRODUCTS.map(p => p.category))], [])

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[26px] leading-tight font-black tracking-tight">Catalog & instant prices</h1>
        <p className="text-sm text-neutral-600 mt-1">Tap a product to configure. Prices in USD, indicative — final quote confirmed on WhatsApp.</p>
      </header>

      {cats.map(cat => (
        <section key={cat} aria-label={cat}>
          <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500 mb-1.5">{cat}</h2>
          <div className="space-y-2">
            {PRODUCTS.filter(p => p.category === cat).map(p => (
              <ConfigCard
                key={p.id} p={p}
                open={openId === p.id}
                onToggle={() => setOpenId(id => (id === p.id ? null : p.id))}
                qty={qty[p.id] ?? p.minQty} setQty={q => setQty(s => ({ ...s, [p.id]: q }))}
                rush={!!rush[p.id]} setRush={r => setRush(s => ({ ...s, [p.id]: r }))}
                qr={qrT[p.id] || ''} setQr={v => setQrT(s => ({ ...s, [p.id]: v }))}
              />
            ))}
          </div>
        </section>
      ))}
      <p className="text-xs text-neutral-500 pb-2">Pay on collection at {BUSINESS.address}.</p>
    </div>
  )
}

function ConfigCard({ p, open, onToggle, qty, setQty, rush, setRush, qr, setQr }: {
  p: Product; open: boolean; onToggle: () => void
  qty: number; setQty: (q: number) => void
  rush: boolean; setRush: (r: boolean) => void
  qr: string; setQr: (v: string) => void
}) {
  const from = catalogPrice(p.basePriceUSD, p.minQty, { rush: false, qr: p.id === 'bc-qr' })
  const total = catalogPrice(p.basePriceUSD, qty, { rush, qr: p.id === 'bc-qr' })
  const step = p.minQty >= 100 ? 50 : p.minQty >= 10 ? 10 : 1

  return (
    <article className={`border rounded-2xl bg-white overflow-hidden ${open ? 'ring-2 ring-red-200 border-[#E30613]' : ''}`}>
      <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3 p-3 text-left min-h-[76px]">
        <span className="flex-1">
          <span className="font-bold block text-[15px] leading-tight">{p.name}</span>
          <span className="text-xs text-neutral-500 block">{p.specs} · {p.turnaround}</span>
        </span>
        <span className="text-right shrink-0">
          <span className="font-black block text-[15px]">from ${from.toFixed(2)}</span>
          <span className={`text-xs font-bold ${open ? 'text-neutral-400' : 'text-[#E30613]'}`}>{open ? 'Close ↑' : 'Configure →'}</span>
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t space-y-2.5">
          <p className="text-sm text-neutral-600">{p.desc}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Qty</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setQty(Math.max(p.minQty, qty - step))} className="w-10 h-10 rounded-full border font-black text-lg" aria-label="Decrease quantity">−</button>
              <input type="number" min={p.minQty} value={qty} onChange={e => setQty(Math.max(p.minQty, Number(e.target.value) || p.minQty))} className="border rounded-lg px-2 py-2 w-24 text-center font-bold" aria-label="Quantity" />
              <button onClick={() => setQty(qty + step)} className="w-10 h-10 rounded-full border font-black text-lg" aria-label="Increase quantity">+</button>
            </div>
            <span className="ml-auto font-black text-lg">USD {total.toFixed(2)}</span>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={rush} onChange={e => setRush(e.target.checked)} className="w-5 h-5 accent-[#E30613]" />
            Rush job <span className="text-neutral-500">(+25%, jumps the queue)</span>
          </label>
          {p.id === 'bc-qr' && (
            <input value={qr} onChange={e => setQr(e.target.value)} placeholder="QR target URL (WhatsApp / website)" className="border rounded-lg p-2.5 text-sm w-full" aria-label="QR target URL" />
          )}
          <div className="grid grid-cols-2 gap-2 no-print">
            <a className="bg-green-600 text-white rounded-full py-2.5 text-sm font-bold text-center min-h-[44px]"
              href={whatsappOrderLink(buildOrderMessage('order', p.id.toUpperCase(), `${p.name} x${qty} — USD ${total.toFixed(2)}${rush ? ' (RUSH)' : ''}${p.id === 'bc-qr' && qr ? ` QR→${qr}` : ''}`))}>
              WhatsApp order
            </a>
            <button className="border rounded-full py-2.5 text-sm font-bold min-h-[44px]" onClick={() => {
              const token = pickupToken(`${p.id}${Date.now()}`)
              saveDesign({ kind: 'order', ref: `${p.id}-${Date.now().toString(36)}`, payload: { product: p.id, qty, rush, total, pickupToken: token, qrTarget: qr || null }, status: 'queued' })
              alert(`Saved offline. Pickup token ${token} — find it under Track.`)
            }}>
              Save offline
            </button>
          </div>
          <p className="text-[11px] text-neutral-500">Min order {p.minQty} {p.unit}s · pickup token issued on save.</p>
        </div>
      )}
    </article>
  )
}
