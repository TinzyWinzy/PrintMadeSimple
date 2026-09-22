import { Link } from 'react-router-dom'
import { BUSINESS } from '../data/business'

export default function Home() {
  return (
    <div className="space-y-4">
      <section className="bg-neutral-950 text-white rounded-2xl p-5">
        <p className="text-xs uppercase tracking-widest text-red-300 font-bold">Harare CBD · Shop 4B Regal Star Mall</p>
        <h1 className="text-2xl font-black mt-1">365-day branding that sits on your client's desk.</h1>
        <p className="text-sm mt-2 opacity-90">Jewel Case Desk Calendars — 300gsm gloss/matt, start ANY month at no extra charge, logo on every page.</p>
        <div className="flex gap-2 mt-4">
          <Link to="/customizer" className="bg-[#E30613] px-4 py-2 rounded-full font-bold text-sm">Design calendar</Link>
          <Link to="/rfq" className="bg-white text-neutral-900 px-4 py-2 rounded-full font-bold text-sm">Get PRAZ quote</Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['/catalog', 'Browse catalog', 'Cards · flyers · banners'],
          ['/customizer', 'A3 Desk Calendars', 'Corporates · churches'],
          ['/rfq', 'Bulk / tender RFQ', 'ITF263-ready PDF'],
          ['/track', 'Track my order', 'Offline drafts saved'],
        ].map(([to, t, s]) => (
          <Link key={t} to={to} className="border rounded-2xl p-3 bg-white">
            <span className="font-bold block">{t}</span>
            <span className="text-xs text-neutral-600">{s}</span>
          </Link>
        ))}
      </section>

      <section className="border rounded-2xl p-4 text-sm bg-yellow-50 border-yellow-200">
        <p className="font-bold">Low-bandwidth promise</p>
        <p className="text-neutral-700">Catalog + calendar designer work offline. Drafts save on your phone and send via WhatsApp/Email when you're back online. No app-store download.</p>
      </section>

      <section className="text-sm">
        <p className="font-bold mb-1">Order in 2 taps</p>
        <a className="block bg-green-600 text-white text-center rounded-full py-2.5 font-bold" href={`https://wa.me/${BUSINESS.primaryWhatsapp.replace('+', '')}?text=${encodeURIComponent('Hello Print Made Simple! I want a quote.')}`}>WhatsApp {BUSINESS.phones[0].display}</a>
        <a className="block border text-center rounded-full py-2.5 font-bold mt-2" href={`mailto:${BUSINESS.emails[0]}?subject=${encodeURIComponent('Quote request — Print Made Simple')}`}>Email {BUSINESS.emails[0]}</a>
      </section>
    </div>
  )
}
