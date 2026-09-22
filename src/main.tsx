import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Offline queue flush hint: queued RFQs/orders live in IndexedDB (pms-db).
// When online, Track page offers one-tap WhatsApp + Email dispatch (Background-Sync-ready).
if ('serviceWorker' in navigator) {
  window.addEventListener('online', () => window.dispatchEvent(new CustomEvent('pms:online')))
}
