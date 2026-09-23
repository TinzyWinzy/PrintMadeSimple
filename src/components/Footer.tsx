import { Link } from 'react-router-dom'
import { BUSINESS } from '../data/business'

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 pt-8 text-xs text-neutral-600">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 text-center sm:text-left">
          <div>
            <p className="font-display text-neutral-900 text-lg mb-2">Print Made Simple</p>
            <p className="text-neutral-500">Shop 4B, Basement Regal Star Mall, George Silundika Ave, Harare CBD</p>
            <p className="mt-1 text-neutral-500">Offline-first PWA · prices in USD indicative</p>
            <p className="mt-1 opacity-60">© {new Date().getFullYear()} {BUSINESS.name}</p>
          </div>
          <div>
            <p className="font-bold text-neutral-800 mb-2">Links</p>
            <ul className="space-y-1">
              <li><Link to="/catalog" className="hover:text-[#E30613]">Catalog</Link></li>
              <li><Link to="/rfq" className="hover:text-[#E30613]">Quote / RFQ</Link></li>
              <li><Link to="/customizer" className="hover:text-[#E30613]">Calendar Customizer</Link></li>
              <li><Link to="/track" className="hover:text-[#E30613]">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-neutral-800 mb-2">Contact</p>
            <p>{BUSINESS.emails.join(' · ')}</p>
            <p>{BUSINESS.phones.map(p => p.display).join(' · ')}</p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <a
              href={`https://wa.me/${BUSINESS.primaryWhatsapp.replace('+', '')}?text=${encodeURIComponent('Hello Print Made Simple! I want to order.')}`}
              className="inline-flex items-center justify-center bg-[#25D36A] text-white font-black text-sm px-4 py-2 min-h-[44px] rounded-full hover:brightness-110"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${BUSINESS.phones[0].intl}`}
              className="inline-flex items-center justify-center border border-neutral-300 text-neutral-800 font-bold text-sm px-4 py-2 min-h-[44px] rounded-full hover:bg-neutral-100"
            >
              {BUSINESS.phones[0].display}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
