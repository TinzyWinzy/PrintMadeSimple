import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { BUSINESS } from './data/business'
import Footer from './components/Footer'

const Home = lazy(() => import('./pages/Home'))
const Catalog = lazy(() => import('./pages/Catalog'))
const Customizer = lazy(() => import('./pages/Customizer'))
const RFQ = lazy(() => import('./pages/RFQ'))
const Track = lazy(() => import('./pages/Track'))

const LINKS: [string, string, string][] = [
  ['/', 'Home', '01'], ['/catalog', 'Catalog', '02'], ['/customizer', 'Calendar', '03'], ['/rfq', 'Quote', '04'], ['/track', 'Track', '05'],
]

function RouteFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-[#E30613]" aria-hidden="true" />
        Loading workspace…
      </div>
    </div>
  )
}

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
          <nav className="hidden sm:flex gap-1 mt-2.5 -mb-px text-sm overflow-x-auto" aria-label="Primary">
            {LINKS.map(([to, label, number]) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => `flex items-baseline gap-1.5 px-3 sm:px-4 py-2 whitespace-nowrap font-bold border-b-[3px] -mb-px transition-colors ${isActive ? 'bg-white text-[#E30613] border-white' : 'border-transparent text-white/80 hover:text-white hover:border-white/50'}`}>
                <span className="chip-mono opacity-60">{number}</span>{label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="h-[3px] bg-neutral-950" aria-hidden="true" />
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 pb-40 sm:pb-4">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 h-14 bg-white border-t border-neutral-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:hidden no-print" aria-label="Mobile">
        {LINKS.map(([to, label, number]) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex min-w-0 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold leading-none ${isActive ? 'text-[#E30613]' : 'text-neutral-500'}`}>
            <span className="chip-mono">{number}</span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Suspense fallback={<RouteFallback />}><Home /></Suspense>} />
        <Route path="/catalog" element={<Suspense fallback={<RouteFallback />}><Catalog /></Suspense>} />
        <Route path="/customizer" element={<Suspense fallback={<RouteFallback />}><Customizer /></Suspense>} />
        <Route path="/rfq" element={<Suspense fallback={<RouteFallback />}><RFQ /></Suspense>} />
        <Route path="/track" element={<Suspense fallback={<RouteFallback />}><Track /></Suspense>} />
      </Routes>
    </Shell>
  )
}
