import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BUSINESS, PRODUCTS } from '../data/business'
import { catalogPrice, jewelCasePrice } from '../lib/engine'
import { db } from '../lib/db'
import jewelFlyer from '../assets/jewel-flyer.webp'

const WA = (msg: string) => `https://wa.me/${BUSINESS.primaryWhatsapp.replace('+', '')}?text=${encodeURIComponent(msg)}`

function Stamp({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-2 border-neutral-900 rounded px-2 py-0.5 text-[11px] font-black uppercase tracking-wider -rotate-1 bg-white">
      {children}
    </span>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-black text-lg tracking-tight">{children}</h2>
}

export default function Home() {
  return (
    <div className="space-y-6 pb-24">
      <UtilityBar />
      <Hero />
      <Showcase />
      <B2BTeaser />
      <CategoryGrid />
      <TrustStrip />
      <TrackerTeaser />
      <InstallCard />
      <div className="fixed bottom-0 inset-x-0 no-print">
        <div className="max-w-3xl mx-auto px-4 pb-4 pt-6 bg-gradient-to-t from-white via-white to-transparent">
          <a href={WA('Hello Print Made Simple! I want to order.')} className="block bg-green-600 text-white text-center rounded-full py-3 font-black min-h-[52px]">
            WhatsApp {BUSINESS.phones[0].display}
          </a>
        </div>
      </div>
    </div>
  )
}

/* 1 · Utility bar */
function UtilityBar() {
  return (
    <div className="bg-slate-100 border rounded-2xl px-3 py-2 text-xs space-y-0.5 -mt-1">
      <p className="font-bold">Shop 4B Basement, Regal Star Mall, George Silundika Ave, Harare CBD</p>
      <p className="text-neutral-600">{BUSINESS.phones[0].display} · USD & ZiG · EcoCash · InnBucks · O'Mari</p>
    </div>
  )
}

/* 3 · Hero with 3-way actions */
function Hero() {
  return (
    <section aria-label="Start an order">
      <h1 className="text-[28px] leading-[1.12] font-black tracking-tight">
        Precision printing & branding — simple, fast, offline-ready.
      </h1>
      <p className="text-sm text-neutral-600 mt-1.5">
        From <strong className="text-neutral-900">300gsm Jewel Case Desk Calendars</strong> to tender-compliant corporate stationery, printed in Harare CBD.
      </p>
      <div className="space-y-2 mt-3">
        <Link to="/customizer" className="block bg-[#E30613] text-white rounded-2xl p-3.5 min-h-[64px]">
          <span className="font-black block">Design a 365-day calendar</span>
          <span className="text-sm opacity-90">Custom start month, logo on every page — start designing →</span>
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/rfq" className="block border-2 border-neutral-900 rounded-2xl p-3 min-h-[64px]">
            <span className="font-black block text-sm">B2B tender quote</span>
            <span className="text-xs text-neutral-600">Hashed PDF in minutes →</span>
          </Link>
          <a href={WA('Hello! I have print-ready artwork to send.')} className="block border-2 border-neutral-900 rounded-2xl p-3 min-h-[64px]">
            <span className="font-black block text-sm">Have artwork?</span>
            <span className="text-xs text-neutral-600">Send it on WhatsApp →</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* 4 · Featured product showcase */
function Showcase() {
  return (
    <section aria-label="Jewel Case Desk Calendar" className="space-y-2">
      <SectionTitle>Jewel Case Desk Calendar</SectionTitle>
      <img src={jewelFlyer} alt="Jewel Case Desk Calendar samples printed by Print Made Simple" className="w-full rounded-2xl border" loading="lazy" />
      <ul className="grid grid-cols-2 gap-1.5 text-xs">
        {['300gsm gloss or matt', 'Any start month, $0 extra', 'Logo on all 12 pages', '4 special dates / month'].map(s => (
          <li key={s} className="bg-slate-100 rounded-xl px-2.5 py-2 font-semibold">{s}</li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <span className="font-black text-lg">from USD {jewelCasePrice(100, 12, 'gloss').toFixed(2)}</span>
        <span className="text-xs text-neutral-500">/ 100 units</span>
        <Link to="/customizer" className="ml-auto bg-neutral-900 text-white rounded-full px-5 py-2.5 text-sm font-bold min-h-[44px]">Customize →</Link>
      </div>
    </section>
  )
}

/* 5 · B2B mini-form → prefilled RFQ */
function B2BTeaser() {
  const nav = useNavigate()
  const [vol, setVol] = useState('200')
  const [tax, setTax] = useState('')
  return (
    <section aria-label="Corporate quotes" className="bg-neutral-950 text-white rounded-2xl p-4 space-y-2.5">
      <p className="text-[11px] font-black uppercase tracking-widest text-red-300">{BUSINESS.name}</p>
      <SectionTitle>Corporate & tender quotes</SectionTitle>
      <p className="text-sm opacity-80">PRAZ-ready hashed PDF. ZIMRA clearance checked before anything is finalized.</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs">1 · Volume
          <select value={vol} onChange={e => setVol(e.target.value)} className="text-neutral-900 rounded-lg w-full p-2.5 mt-1 font-bold">
            <option value="100">±100 units</option>
            <option value="200">±200 units</option>
            <option value="500">±500 units</option>
            <option value="1000">1000+ units</option>
          </select>
        </label>
        <label className="text-xs">2 · Company Tax ID
          <input value={tax} onChange={e => setTax(e.target.value)} placeholder="e.g. 20001234" className="text-neutral-900 rounded-lg w-full p-2.5 mt-1 font-bold" />
        </label>
      </div>
      <button
        onClick={() => { sessionStorage.setItem('pms-prefill', JSON.stringify({ vol, tax })); nav('/rfq') }}
        className="w-full bg-[#E30613] rounded-full py-3 font-black min-h-[52px]">
        3 · Continue to compliant quote →
      </button>
    </section>
  )
}

/* 6 · Category grid with from-prices */
const GRID: { id: string; blurb: string }[] = [
  { id: 'jewel-12', blurb: 'Stand included' },
  { id: 'bc-qr', blurb: 'Links to your vCard' },
  { id: 'flyer-a5', blurb: 'Bulk breaks' },
  { id: 'sticker-vinyl', blurb: 'Die-cut shapes' },
  { id: 'banner-pvc', blurb: 'Events & shops' },
  { id: 'corp-tshirt', blurb: 'Staff & promos' },
]

function CategoryGrid() {
  return (
    <section aria-label="Product categories" className="space-y-2">
      <SectionTitle>What we print</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {GRID.map(g => {
          const p = PRODUCTS.find(x => x.id === g.id)!
          return (
            <Link key={g.id} to="/catalog" className="border rounded-2xl p-3 bg-white min-h-[96px] flex flex-col">
              <span className="font-bold text-sm leading-tight">{p.name}</span>
              <span className="text-xs text-neutral-500">{g.blurb}</span>
              <span className="mt-auto pt-1 font-black text-sm">from ${catalogPrice(p.basePriceUSD, p.minQty).toFixed(2)}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* 7 · Trust, fulfillment, payments */
function TrustStrip() {
  return (
    <section aria-label="Trust and payments" className="space-y-2">
      <SectionTitle>Collect with confidence</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        <Stamp>Express pickup · Shop 4B</Stamp>
        <Stamp>Delivery arranged on WhatsApp</Stamp>
        <Stamp>300 DPI pre-flight check</Stamp>
      </div>
      <div className="border rounded-2xl p-3 text-sm">
        <p className="font-bold text-xs uppercase tracking-wide text-neutral-500">We accept</p>
        <p className="font-black mt-0.5">EcoCash · InnBucks · O'Mari · USD cash</p>
      </div>
    </section>
  )
}

/* 8 · Tracker teaser — real IndexedDB lookup */
const STAGES = ['Received', 'Proof ready', 'In production', 'Ready at Shop 4B']

function TrackerTeaser() {
  const [q, setQ] = useState('')
  const [res, setRes] = useState<string | null>(null)
  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    const ref = q.trim().toUpperCase()
    if (!ref) return
    const hit = await db.designs.where('ref').equalsIgnoreCase(ref).first()
    if (!hit) { setRes(`No order ${ref} on this device yet — it may live on another phone or with Shop 4B.`); return }
    const stage = Math.min(STAGES.length - 1, hit.payload?.stage ?? 0)
    setRes(`${hit.kind} ${hit.ref}: ${STAGES[stage]}${hit.payload?.pickupToken ? ` · pickup ${hit.payload.pickupToken}` : ''}`)
  }
  return (
    <section aria-label="Track your order" className="border rounded-2xl p-3.5 space-y-2">
      <SectionTitle>Where's my order?</SectionTitle>
      <form onSubmit={lookup} className="flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Order ref e.g. PMS-..." className="border rounded-full px-3.5 py-2.5 text-sm flex-1 font-mono min-h-[48px]" aria-label="Order reference" />
        <button className="bg-neutral-900 text-white rounded-full px-5 font-bold text-sm min-h-[48px]">Check</button>
      </form>
      {res && <p className="text-sm bg-slate-100 rounded-xl px-3 py-2">{res}</p>}
      <Link to="/track" className="text-sm font-bold text-[#E30613]">Open full tracker →</Link>
    </section>
  )
}

/* 9 · PWA install */
function InstallCard() {
  const [deferred, setDeferred] = useState<any>(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setDeferred(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])
  if (!deferred || done) return null
  return (
    <section className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3 no-print">
      <p className="text-sm flex-1"><strong>Install the app</strong> for offline catalog + calendar designer.</p>
      <button
        onClick={async () => { await deferred.prompt(); setDone(true) }}
        className="bg-[#E30613] text-white rounded-full px-5 py-2.5 text-sm font-bold shrink-0 min-h-[44px]">
        Install
      </button>
    </section>
  )
}
