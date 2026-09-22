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
    <div className="min-h-dvh flex flex-col max-w-3xl mx-auto">
      <header className="bg-[#E30613] text-white px-4 pt-4 pb-3 rounded-b-2xl no-print">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-white text-[#E30613] font-black px-2 py-1 rounded">PMS</span>
          <span className="flex-1">
            <span className="block font-extrabold leading-tight">Print Made Simple</span>
            <span className="block text-xs opacity-90">{BUSINESS.tagline}</span>
          </span>
          <span className={`text-[11px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${online ? 'bg-green-500' : 'bg-neutral-800'}`} title={online ? 'Online' : 'Offline — browsing from cache'}>
            {online ? '● Online' : '○ Offline'}
          </span>
        </Link>
        <nav className="flex gap-1 mt-3 text-sm overflow-x-auto">
          {[
            ['/', 'Home'], ['/catalog', 'Catalog'], ['/customizer', 'Calendar'], ['/rfq', 'RFQ'], ['/track', 'Track'],
          ].map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `px-3 py-1.5 rounded-full whitespace-nowrap ${isActive ? 'bg-white text-[#E30613] font-bold' : 'bg-white/15'}`}>{label}</NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      <footer className="px-4 pb-8 pt-2 text-xs text-neutral-600 no-print">
        <p className="font-semibold text-neutral-800">{BUSINESS.name}</p>
        <p>{BUSINESS.address}</p>
        <p>{BUSINESS.emails.join(' · ')}</p>
        <p>{BUSINESS.phones.map(p => p.display).join(' · ')}</p>
        <p className="mt-1 opacity-70">Offline-first PWA · prices in USD indicative · pay on collection/delivery confirmation.</p>
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
