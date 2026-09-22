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
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-[#E30613] text-white no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
              <span className="bg-white text-[#E30613] font-black px-2 py-1 text-lg">PMS</span>
              <span className="min-w-0">
                <span className="block font-black leading-tight text-lg tracking-tight truncate">PRINT MADE SIMPLE</span>
                <span className="hidden sm:block text-xs opacity-90">{BUSINESS.tagline} · Shop 4B Regal Star Mall, Harare CBD</span>
                <span className="block sm:hidden text-xs opacity-90">{BUSINESS.tagline}</span>
              </span>
            </Link>
            <span className={`chip-mono font-bold px-2 py-1 whitespace-nowrap ${online ? 'bg-green-500' : 'bg-neutral-800'}`} title={online ? 'Online' : 'Offline — browsing from cache'}>
              {online ? '● ONLINE' : '○ OFFLINE'}
            </span>
            <a href={`https://wa.me/${BUSINESS.primaryWhatsapp.replace('+', '')}`} className="hidden md:inline-flex bg-white text-[#E30613] font-black px-5 py-2.5 min-h-[44px] items-center">
              WHATSAPP SALES
            </a>
          </div>
          <nav className="flex gap-1 sm:gap-2 mt-3 text-sm overflow-x-auto" aria-label="Primary">
            {[
              ['/', 'Home'], ['/catalog', 'Catalog'], ['/customizer', 'Calendar Customizer'], ['/rfq', 'B2B / PRAZ Quote'], ['/track', 'Track Order'],
            ].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `px-4 py-2 whitespace-nowrap font-bold border-b-[3px] ${isActive ? 'bg-white text-[#E30613] border-white' : 'border-transparent text-white/85 hover:text-white hover:border-white/40'}`}>{label}</NavLink>
            ))}
          </nav>
        </div>
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
