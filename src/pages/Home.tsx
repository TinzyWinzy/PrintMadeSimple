import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BUSINESS, PRODUCTS } from '../data/business'
import { catalogPrice, jewelCasePrice } from '../lib/engine'
import { db } from '../lib/db'
import jewelFlyer from '../assets/jewel-flyer.webp'

const WA = (msg: string) => `https://wa.me/${BUSINESS.primaryWhatsapp.replace('+', '')}?text=${encodeURIComponent(msg)}`

export default function Home() {
  return (
    <div className="pb-24">
      <UtilityStrip />
      <Hero />
      <Ticker />
      <Showcase />
      <B2BSteps />
      <Index />
      <TrustFoot />
      <TrackerBand />
      <InstallCard />
      <div className="fixed bottom-0 inset-x-0 no-print">
        <div className="max-w-3xl mx-auto px-4 pb-4 pt-6 bg-gradient-to-t from-white via-white to-transparent">
          <a href={WA('Hello Print Made Simple! I want to order.')} className="block bg-green-600 text-white text-center rounded-sm py-3 font-black min-h-[52px]">
            WHATSAPP {BUSINESS.phones[0].display}
          </a>
        </div>
      </div>
    </div>
  )
}

/* 1 · Utility strip — hairline, mono, left-aligned */
function UtilityStrip() {
  return (
    <p className="chip-mono uppercase text-neutral-500 border-b border-neutral-200 pb-2 -mt-1">
      Shop 4B Regal Star Mall · Harare CBD · USD/ZiG · EcoCash · InnBucks · O'Mari
    </p>
  )
}

/* 2 · Hero — full-bleed ink band, split, oversized display */
function Hero() {
  return (
    <section aria-label="Print Made Simple" className="bg-neutral-950 text-white -mx-4 px-4 pt-8 pb-10 mt-3 relative overflow-hidden">
      <div className="dotgrid absolute inset-0 text-white/10 pointer-events-none" aria-hidden="true" />
      <div className="relative grid gap-6 sm:grid-cols-[1.2fr_1fr] sm:items-end">
        <div>
          <p className="kicker text-red-400">Designing · Printing · Branding</p>
          <h1 className="display mt-2">
            INK ON<br />PAPER.<br />
            <span className="text-[#FF3B47]">BRAND ON</span><br />DESKS.
          </h1>
          <p className="text-sm text-neutral-300 mt-3 max-w-[34ch]">
            300gsm Jewel Case Desk Calendars and tender-ready corporate print — made in Harare CBD, ordered from your phone.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/customizer" className="bg-[#E30613] text-white font-black px-6 py-3 min-h-[52px] inline-flex items-center">
              DESIGN A CALENDAR
            </Link>
            <Link to="/rfq" className="border border-white/40 font-bold px-6 py-3 min-h-[52px] inline-flex items-center">
              B2B QUOTE
            </Link>
          </div>
        </div>
        <figure className="relative">
          <img src={jewelFlyer} alt="Jewel Case Desk Calendar samples printed by Print Made Simple" className="w-full border border-white/20 rotate-1" fetchPriority="high" />
          <figcaption className="absolute -bottom-3 left-3 bg-white text-neutral-900 chip-mono font-bold uppercase px-2 py-1 -rotate-2">
            from ${jewelCasePrice(100, 12, 'gloss').toFixed(2)} / 100 units
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* 3 · Price ticker */
function Ticker() {
  const items = [
    ['JEWEL CALENDAR', '$1.10/u'], ['QR BUSINESS CARDS', '$8/100'], ['A3 DESK CALENDAR', '$3.50/u'],
    ['A5 FLYERS', '$0.12/u'], ['PVC BANNER', '$12/m²'], ['VINYL STICKERS', '$0.25/u'],
  ]
  const row = [...items, ...items]
  return (
    <div className="bg-[#E30613] text-white -mx-4 px-0 py-2.5 overflow-hidden mt-0" aria-label="Indicative prices">
      <div className="marquee-track gap-8 pr-8">
        {row.map(([n, p], i) => (
          <span key={i} className="chip-mono font-bold uppercase whitespace-nowrap">
            {n} <span className="text-white/70">{p}</span> <span className="text-white/40 pl-6">///</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* 4 · Showcase — asymmetric split, numbered spec rows */
const SPECS = [
  ['01', '300gsm gloss or matt premium cardstock'],
  ['02', 'Any month as Month 1 — zero surcharge'],
  ['03', 'Full-colour logo on cover + all 12 pages'],
  ['04', '4 special dates per month + Zim holidays'],
]

function Showcase() {
  return (
    <section aria-label="Jewel Case Desk Calendar" className="pt-8">
      <p className="kicker text-[#E30613]">Flagship — 365-day advertising stand</p>
      <h2 className="display mt-1" style={{ fontSize: 'clamp(2rem, 1.2rem + 7vw, 3.2rem)' }}>THE JEWEL<br />CASE CALENDAR</h2>
      <div className="grid gap-4 mt-4 sm:grid-cols-[1fr_1.1fr]">
        <img src={jewelFlyer} alt="Jewel Case Desk Calendar range" className="w-full border-2 border-neutral-900 -rotate-1" loading="lazy" />
        <ol>
          {SPECS.map(([n, s]) => (
            <li key={n} className="flex gap-3 items-baseline border-b border-neutral-200 py-2.5">
              <span className="font-black text-[#E30613]">{n}</span>
              <span className="text-sm font-semibold">{s}</span>
            </li>
          ))}
          <li className="pt-3">
            <Link to="/customizer" className="inline-flex items-center bg-neutral-900 text-white font-black px-6 py-3 min-h-[52px]">
              CUSTOMIZE YOURS →
            </Link>
          </li>
        </ol>
      </div>
    </section>
  )
}

/* 5 · B2B — overlapping numbered badges, prefill handoff */
function B2BSteps() {
  const nav = useNavigate()
  const [vol, setVol] = useState('200')
  const [tax, setTax] = useState('')
  return (
    <section aria-label="Corporate quotes" className="bg-slate-100 -mx-4 px-4 py-8 mt-8">
      <p className="kicker text-neutral-500">{BUSINESS.name}</p>
      <h2 className="display mt-1" style={{ fontSize: 'clamp(1.9rem, 1.1rem + 6vw, 2.8rem)' }}>TENDER-READY<br />IN 3 STEPS</h2>
      <div className="grid gap-2 mt-4 sm:grid-cols-3">
        {[
          <label key="v" className="block bg-white border border-neutral-300 p-3 text-xs font-bold uppercase tracking-wide" htmlFor="b2b-vol">Volume
            <select id="b2b-vol" value={vol} onChange={e => setVol(e.target.value)} className="block w-full mt-1.5 text-base font-black normal-case p-2 border border-neutral-300 bg-white">
              <option value="100">±100 units</option><option value="200">±200 units</option>
              <option value="500">±500 units</option><option value="1000">1000+ units</option>
            </select>
          </label>,
          <label key="t" className="block bg-white border border-neutral-300 p-3 text-xs font-bold uppercase tracking-wide" htmlFor="b2b-tax">Company Tax ID
            <input id="b2b-tax" value={tax} onChange={e => setTax(e.target.value)} placeholder="20001234" className="block w-full mt-1.5 text-base font-black p-2 border border-neutral-300" />
          </label>,
          <button key="g" onClick={() => { sessionStorage.setItem('pms-prefill', JSON.stringify({ vol, tax })); nav('/rfq') }}
            className="bg-[#E30613] text-white font-black p-3 text-left min-h-[76px]">
            <span className="chip-mono block opacity-70">03</span>
            GET HASHED PDF QUOTE →
          </button>,
        ].map((el, i) => (
          <div key={i} className="relative">
            <span className="absolute -top-2.5 left-2 z-10 bg-neutral-900 text-white chip-mono font-bold px-1.5 py-0.5">0{i + 1}</span>
            {el}
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-2">PRAZ-ready format · SHA-256 sealed · ZIMRA clearance checked before finalizing.</p>
    </section>
  )
}

/* 6 · Product index — editorial rows, no cards */
const GRID = ['jewel-12', 'bc-qr', 'flyer-a5', 'sticker-vinyl', 'banner-pvc', 'corp-tshirt']

function Index() {
  return (
    <section aria-label="Product index" className="pt-8">
      <p className="kicker text-[#E30613]">Full range</p>
      <h2 className="display mt-1" style={{ fontSize: 'clamp(1.9rem, 1.1rem + 6vw, 2.8rem)' }}>PRICE INDEX</h2>
      <ul className="mt-2 border-t-2 border-neutral-900">
        {GRID.map(id => {
          const p = PRODUCTS.find(x => x.id === id)!
          return (
            <li key={id} className="border-b border-neutral-200">
              <Link to="/catalog" className="flex items-baseline gap-3 py-3 min-h-[56px]">
                <span className="font-black text-base leading-tight flex-1">{p.name}</span>
                <span className="chip-mono text-neutral-500 uppercase hidden sm:inline">{p.category}</span>
                <span className="font-black whitespace-nowrap">from ${catalogPrice(p.basePriceUSD, p.minQty).toFixed(2)}</span>
                <span className="font-black text-[#E30613]" aria-hidden="true">→</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* 7 · Trust footnote */
function TrustFoot() {
  return (
    <section aria-label="Trust and payments" className="border-t-2 border-neutral-900 mt-8 pt-3">
      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <p className="kicker text-neutral-500">Fulfillment</p>
          <p className="font-bold mt-1">Express pickup — Shop 4B, Regal Star Mall</p>
          <p className="text-neutral-600">Delivery arranged on WhatsApp · 300 DPI pre-flight on every file</p>
        </div>
        <div>
          <p className="kicker text-neutral-500">We accept</p>
          <p className="font-black mt-1 text-base">EcoCash · InnBucks · O'Mari · USD cash</p>
          <p className="text-neutral-600 text-xs mt-0.5">{BUSINESS.phones.map(p => p.display).join(' · ')}</p>
        </div>
      </div>
    </section>
  )
}

/* 8 · Tracker band */
const STAGES = ['Received', 'Proof ready', 'In production', 'Ready at Shop 4B']

function TrackerBand() {
  const [q, setQ] = useState('')
  const [res, setRes] = useState<string | null>(null)
  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    const ref = q.trim().toUpperCase()
    if (!ref) return
    const hit = await db.designs.where('ref').equalsIgnoreCase(ref).first()
    if (!hit) { setRes(`No ${ref} on this device — it may live on another phone or with Shop 4B.`); return }
    const stage = Math.min(STAGES.length - 1, hit.payload?.stage ?? 0)
    setRes(`${hit.kind} ${hit.ref} — ${STAGES[stage]}${hit.payload?.pickupToken ? ` · pickup ${hit.payload.pickupToken}` : ''}`)
  }
  return (
    <section aria-label="Track your order" className="bg-neutral-950 text-white -mx-4 px-4 py-8 mt-8">
      <p className="kicker text-red-400">Production tracker</p>
      <h2 className="display mt-1" style={{ fontSize: 'clamp(1.9rem, 1.1rem + 6vw, 2.8rem)' }}>WHERE'S<br />MY ORDER?</h2>
      <form onSubmit={lookup} className="flex gap-2 mt-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="REF e.g. PMS-..." className="bg-white/10 border border-white/30 px-4 py-3 text-sm flex-1 font-mono min-h-[52px] placeholder:text-neutral-500" aria-label="Order reference" />
        <button className="bg-[#E30613] font-black px-6 min-h-[52px]">CHECK</button>
      </form>
      {res && <p className="text-sm bg-white/10 border border-white/20 px-3 py-2.5 mt-2">{res}</p>}
      <Link to="/track" className="inline-block mt-2 text-sm font-bold underline underline-offset-4">Open full tracker →</Link>
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
    <section className="border-2 border-neutral-900 p-4 mt-6 flex items-center gap-3 no-print">
      <p className="text-sm flex-1"><strong>Install the app.</strong> Offline catalog + calendar designer, zero data-cost relaunches.</p>
      <button onClick={async () => { await deferred.prompt(); setDone(true) }} className="bg-neutral-900 text-white font-black px-6 py-3 shrink-0 min-h-[52px]">
        INSTALL
      </button>
    </section>
  )
}
