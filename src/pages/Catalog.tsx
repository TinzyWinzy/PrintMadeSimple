import { useMemo, useState } from 'react'
import { BUSINESS, PRODUCTS, type Product } from '../data/business'
import { catalogPrice, whatsappOrderLink } from '../lib/engine'
import { buildOrderMessage } from '../lib/docs-core'
import { pickupToken } from '../lib/security'
import { saveDesign } from '../lib/db'

export default function Catalog() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<string, number>>({})
  const [rush, setRush] = useState<Record<string, boolean>>({})
  const [qrTarget, setQrTarget] = useState<Record<string, string>>({})
  const cats = useMemo(() => [...new Set(PRODUCTS.map(p => p.category))], [])

  const activeCat = useMemo(() => {
    if (!openId) return ''
    return PRODUCTS.find(p => p.id === openId)?.category ?? ''
  }, [openId])

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[26px] leading-tight font-black tracking-tight">Catalog &amp; instant prices</h1>
        <p className="text-sm text-neutral-600 mt-1">Prices in USD, indicative — final quote confirmed on WhatsApp.</p>
      </header>

      {cats.length > 1 && (
        <nav className="flex gap-2 overflow-x-auto no-scrollbar -mb-1 pb-1" aria-label="Categories">
          {cats.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                const first = PRODUCTS.find(p => p.category === cat)?.id
                setOpenId(first ?? null)
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                activeCat === cat
                  ? 'bg-[#E30613] text-white border-[#E30613]'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      )}

      {cats.map(cat => (
        <section key={cat} aria-label={cat}>
          <h2 className="font-bold text-xs uppercase tracking-wide text-neutral-500 mb-1.5">{cat}</h2>
          <div className="space-y-3">
            {PRODUCTS.filter(p => p.category === cat).map(p => (
              <ConfigCard
                key={p.id}
                p={p}
                open={openId === p.id}
                onToggle={() => setOpenId(id => (id === p.id ? null : p.id))}
                qty={qty[p.id] ?? p.minQty}
                setQty={q => setQty(s => ({ ...s, [p.id]: q }))}
                rush={!!rush[p.id]}
                setRush={r => setRush(s => ({ ...s, [p.id]: r }))}
                qr={qrTarget[p.id] || ''}
                setQr={v => setQrTarget(s => ({ ...s, [p.id]: v }))}
              />
            ))}
          </div>
        </section>
      ))}

      <p className="text-xs text-neutral-500 pb-6">Pay on collection at {BUSINESS.address}.</p>
    </div>
  )
}

const baseFrom = (p: Product) => catalogPrice(p.basePriceUSD, p.minQty, { rush: false, qr: p.id === 'bc-qr' })

function ConfigCard({ p, open, onToggle, qty, setQty, rush, setRush, qr, setQr }: {
  p: Product
  open: boolean
  onToggle: () => void
  qty: number
  setQty: (q: number) => void
  rush: boolean
  setRush: (r: boolean) => void
  qr: string
  setQr: (v: string) => void
}) {
  const total = useMemo(() => catalogPrice(p.basePriceUSD, qty, { rush, qr: p.id === 'bc-qr' }), [p.basePriceUSD, qty, rush])
  const step = p.minQty >= 100 ? 50 : p.minQty >= 10 ? 10 : 1

  const decrement = () => setQty(Math.max(p.minQty, qty - step))
  const increment = () => setQty(qty + step)
  const onChange = (v: string) => setQty(Math.max(p.minQty, Number(v) || p.minQty))

  const orderMessage = `${p.name} x${qty} — USD ${total.toFixed(2)}${rush ? ' (RUSH)' : ''}${p.id === 'bc-qr' && qr ? ` QR→${qr}` : ''}`

  const saveOffline = () => {
    const token = pickupToken(`${p.id}${Date.now()}`)
    saveDesign({
      kind: 'order',
      ref: `${p.id}-${Date.now().toString(36)}`,
      payload: { product: p.id, qty, rush, total, pickupToken: token, qrTarget: qr || null },
      status: 'queued',
    })
    alert(`Saved offline. Pickup token ${token} — find it under Track.`)
  }

  return (
    <article
      className={`border rounded-2xl bg-white shadow-sm transition-all overflow-hidden ${
        open ? 'ring-2 ring-[#E30613] border-[#E30613]' : 'hover:border-neutral-300 hover:shadow'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
      >
        <span className="flex-1 min-w-0">
          <span className="font-bold block text-[15px] leading-tight truncate">{p.name}</span>
          <span className="text-xs text-neutral-500 block mt-0.5">{p.specs} · {p.turnaround}</span>
        </span>
        <span className="text-right shrink-0">
          <span className="font-black block text-[15px]">from ${baseFrom(p).toFixed(2)}</span>
          <span className={`text-xs font-bold ${open ? 'text-neutral-500' : 'text-[#E30613]'}`}>
            {open ? 'Close ↑' : 'Configure →'}
          </span>
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t space-y-3">
          <p className="text-sm text-neutral-600">{p.desc}</p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Qty</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={decrement}
                className="w-10 h-10 rounded-full border font-black text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min={p.minQty}
                value={qty}
                onChange={e => onChange(e.target.value)}
                className="border rounded-lg px-2 py-2 w-24 text-center font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={increment}
                className="w-10 h-10 rounded-full border font-black text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="ml-auto font-black text-lg">USD {total.toFixed(2)}</span>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rush}
              onChange={e => setRush(e.target.checked)}
              className="w-5 h-5 accent-[#E30613] focus-visible:ring-2 focus-visible:ring-[#E30613]"
            />
            Rush job <span className="text-neutral-500">(+25%, jumps the queue)</span>
          </label>

          {p.id === 'bc-qr' && (
            <input
              value={qr}
              onChange={e => setQr(e.target.value)}
              placeholder="QR target URL (WhatsApp / website)"
              className="border rounded-lg p-2.5 text-sm w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
              aria-label="QR target URL"
            />
          )}

          <div className="grid grid-cols-2 gap-2 no-print">
            <a
              className="bg-[#25D36A] text-white rounded-full py-2.5 text-sm font-bold text-center min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
              href={whatsappOrderLink(buildOrderMessage('order', p.id.toUpperCase(), orderMessage))}
            >
              WhatsApp order
            </a>
            <button
              type="button"
              onClick={saveOffline}
              className="border rounded-full py-2.5 text-sm font-bold min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
            >
              Save offline
            </button>
          </div>

          <p className="text-[11px] text-neutral-500">
            Min order {p.minQty} {p.unit}s · pickup token issued on save.
          </p>
        </div>
      )}
    </article>
  )
}
