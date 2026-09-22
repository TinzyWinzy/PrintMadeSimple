import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Customizer from './pages/Customizer'
import RFQ from './pages/RFQ'
import Track from './pages/Track'
import { BUSINESS } from './data/business'

function Shell({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(navigator.onLine)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    const sh = () => setScrolled(window.scrollY > 8)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    window.addEventListener('scroll', sh, { passive: true })
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); window.removeEventListener('scroll', sh) }
  }, [])
  const LINKS: [string, string][] = [
    ['/', 'Home'], ['/catalog', 'Catalog'], ['/customizer', 'Calendar'], ['/rfq', 'B2B Quote'], ['/track', 'Track'],
  ]
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Utility bar */}
      <div className="bg-neutral-950 text-neutral-300 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-3 chip-mono uppercase">
          <span className="truncate flex-1">Shop 4B Regal Star Mall · George Silundika Ave · Harare CBD</span>
          <a href={`tel:${BUSINESS.phones[0].intl}`} className="hidden sm:inline hover:text-white">{BUSINESS.phones[0].display}</a>
          <span className={online ? 'text-green-400' : 'text-amber-400'}>{online ? '● ONLINE' : '○ OFFLINE'}</span>
        </div>
      </div>
      {/* Sticky main bar */}
      <header className={`bg-[#E30613] text-white sticky top-0 z-40 no-print transition-shadow ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.35)]' : ''}`}>
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all ${scrolled ? 'pt-2 pb-1.5' : 'pt-3.5 pb-2.5'}`}>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 flex-1 min-w-0" aria-label="Print Made Simple home">
              <span className="bg-white text-[#E30613] font-black px-2 py-1 text-xl leading-none">PMS</span>
              <span className="min-w-0 leading-none">
                <span className="block font-display tracking-tight text-xl sm:text-2xl truncate">PRINT MADE SIMPLE</span>
                <span className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 mt-0.5">{BUSINESS.tagline}</span>
              </span>
            </Link>
            <a href={`https://wa.me/${BUSINESS.primaryWhatsapp.replace('+', '')}?text=${encodeURIComponent('Hello Print Made Simple! I want to order.')}`}
              className="hidden md:inline-flex bg-white text-[#E30613] font-black text-sm px-5 py-2.5 min-h-[44px] items-center hover:bg-neutral-100">
              WHATSAPP SALES
            </a>
          </div>
          <nav className="flex gap-0.5 sm:gap-1 mt-2.5 -mb-px text-sm overflow-x-auto" aria-label="Primary">
            {LINKS.map(([to, label], i) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `flex items-baseline gap-1.5 px-3 sm:px-4 py-2 whitespace-nowrap font-bold border-b-[3px] -mb-px transition-colors ${isActive ? 'bg-white text-[#E30613] border-white' : 'border-transparent text-white/80 hover:text-white hover:border-white/50'}`}>
                <span className="chip-mono opacity-60">0{i + 1}</span>{label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="h-[3px] bg-neutral-950" aria-hidden="true" />
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4">{children}</main>
      <footer className="w-full no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 pt-2 text-xs text-neutral-600">
          <p className="font-semibold text-neutral-800">{BUSINESS.name}</p>
          <p>{BUSINESS.address}</p>
          <p>{BUSINESS.emails.join(' · ')}</p>
          <p>{BUSINESS.phones.map(p => p.display).join(' · ')}</p>
          <p className="mt-1 opacity-70">Offline-first PWA · prices in USD indicative · pay on collection/delivery confirmation.</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/customizer" element={<Customizer />} />
        <Route path="/rfq" element={<RFQ />} />
        <Route path="/track" element={<Track />} />
      </Routes>
    </Shell>
  )
}
