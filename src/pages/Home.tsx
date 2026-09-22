import { Link } from 'react-router-dom'
import { BUSINESS } from '../data/business'
import jewelFlyer from '../assets/jewel-flyer.webp'
import a3Flyer from '../assets/a3-flyer.webp'

function Stamp({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-2 border-neutral-900 rounded px-2 py-0.5 text-[11px] font-black uppercase tracking-wider -rotate-1">
      {children}
    </span>
  )
}

function PriceCard({ to, name, spec, price, action }: { to: string; name: string; spec: string; price: string; action: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 border rounded-2xl p-3 bg-white active:bg-neutral-50 min-h-[76px]">
      <span className="flex-1">
        <span className="font-bold block text-[15px] leading-tight">{name}</span>
        <span className="text-xs text-neutral-500 block">{spec}</span>
      </span>
      <span className="text-right shrink-0">
        <span className="font-black block text-[15px]">{price}</span>
        <span className="text-xs font-bold text-[#E30613]">{action} →</span>
      </span>
    </Link>
  )
}

export default function Home() {
  const wa = `https://wa.me/${BUSINESS.primaryWhatsapp.replace('+', '')}?text=${encodeURIComponent('Hello Print Made Simple! I want to order.')}`
  return (
    <div className="space-y-4 pb-24">
      {/* 1 · Proof: real work, real address */}
      <section aria-label="Featured product">
        <img src={jewelFlyer} alt="Jewel Case Desk Calendar samples printed by Print Made Simple" className="w-full rounded-2xl border" fetchPriority="high" />
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Stamp>300gsm gloss/matt</Stamp>
          <Stamp>Start any month · $0 extra</Stamp>
          <Stamp>Shop 4B Regal Star Mall</Stamp>
        </div>
      </section>

      {/* 2 · One primary CTA */}
      <section aria-label="Design your calendar">
        <h1 className="text-[26px] leading-[1.15] font-black tracking-tight">
          Your logo on your client's desk, 365&nbsp;days.
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Jewel Case Desk Calendars from <strong className="text-neutral-900">USD 1.10/unit</strong> at 100 units. Logo on every page. Design it on your phone, even offline.
        </p>
        <Link to="/customizer" className="block bg-[#E30613] text-white text-center rounded-full py-3.5 mt-3 font-black text-base min-h-[52px]">
          Design my calendar
        </Link>
      </section>

      {/* 3 · Price-anchored strip */}
      <section aria-label="Popular products" className="space-y-2">
        <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">Popular right now</h2>
        <PriceCard to="/customizer" name="Jewel Case Calendar" spec="12mo · back-to-back · case = stand" price="from $1.10/u" action="Design" />
        <div className="flex gap-2">
          <img src={a3Flyer} alt="A3 Desk Calendar 2026" className="w-20 h-20 rounded-xl border object-cover shrink-0" loading="lazy" />
          <div className="flex-1">
            <PriceCard to="/catalog" name="A3 Desk Calendar" spec="Wiro-bound · corporates & churches" price="from $3.50/u" action="Price" />
          </div>
        </div>
        <PriceCard to="/catalog" name="QR Business Cards" spec="100 cards · scannable · 24–48h" price="from $8.00" action="Price" />
      </section>

      {/* 4 · Secondary B2B path */}
      <section aria-label="Corporate quotes" className="bg-neutral-950 text-white rounded-2xl p-4">
        <p className="font-black">Tenders & bulk orders</p>
        <p className="text-sm opacity-80 mt-0.5">PRAZ-ready hashed quote in minutes. ITF263 checked before you send.</p>
        <Link to="/rfq" className="block bg-white text-neutral-900 text-center rounded-full py-2.5 mt-3 font-bold text-sm min-h-[44px]">
          Get a compliant quote
        </Link>
      </section>

      {/* 5 · Sticky thumb-reach order bar */}
      <div className="fixed bottom-0 inset-x-0 no-print">
        <div className="max-w-3xl mx-auto px-4 pb-4 pt-6 bg-gradient-to-t from-white via-white to-transparent">
          <a href={wa} className="block bg-green-600 text-white text-center rounded-full py-3 font-black min-h-[52px]">
            WhatsApp {BUSINESS.phones[0].display}
          </a>
        </div>
      </div>
    </div>
  )
}
