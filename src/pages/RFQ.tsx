import { useState } from 'react'
import { BUSINESS } from '../data/business'
import { rfqHash, whatsappOrderLink } from '../lib/engine'
import { buildOrderMessage, downloadRfqPdf, rfqTotal, type RFQInput } from '../lib/docs'
import { canonicalQuote, checkZimra, sha256Hex, pickupToken } from '../lib/security'
import { qrDataUrl } from '../lib/qr'
import { pushQuote } from '../lib/sync'
import { saveDesign } from '../lib/db'

const EMPTY: RFQInput = {
  company: '', contactPerson: '', phone: '', email: '', taxId: '', itf263Ref: '', itf263Expiry: '',
  delivery: 'Harare CBD', items: [{ desc: 'Jewel Case Desk Calendars, 300gsm gloss, 12mo', qty: 200, unitPrice: 0.95 }], notes: '',
  ref: ''
}

export default function RFQ() {
  const [f, setF] = useState<RFQInput>({ ...EMPTY, ref: rfqHash('rfq' + Date.now()) })
  const [err, setErr] = useState('')
  const [hash, setHash] = useState('')
  const total = rfqTotal(f)
  const zimra = checkZimra(f.itf263Ref, f.itf263Expiry)
  const valid = f.company && f.contactPerson && f.phone && f.email.includes('@') && zimra.ok && f.items.length > 0

  async function submit(queueOnly: boolean) {
    if (!valid) {
      setErr(zimra.ok
        ? 'Company, contact, phone and valid email are required (PRAZ gate).'
        : `Quote blocked as Non-Compliant: ${zimra.reason}`)
      return
    }
    setErr('')
    // SAD v2 §2.3: SHA-256 over canonical payload; QR encodes hash for footer verification.
    const h = await sha256Hex(canonicalQuote(f))
    setHash(h)
    const qr = await qrDataUrl(`PMS-QUOTE:${f.ref}:${h}`).catch(() => null)
    const token = pickupToken(f.ref)
    // Best-effort server seal when online; outbox stays source of truth.
    let server: { ok: boolean; error?: string } | null = null
    if (!queueOnly && navigator.onLine) server = await pushQuote({ ...f }, h)
    const status = queueOnly ? 'queued' : server?.ok ? 'sent' : 'queued'
    saveDesign({ kind: 'rfq', ref: f.ref, payload: { ...f, quoteHash: h, pickupToken: token, serverSealed: server?.ok || false }, status })
    if (!queueOnly) {
      downloadRfqPdf(f, h, qr)
      window.location.href = whatsappOrderLink(buildOrderMessage('RFQ', f.ref, `${f.company} · ${f.items.length} lines · USD ${total.toFixed(2)} · ITF263:${f.itf263Ref} · hash:${h.slice(0, 12)}… · pickup:${token}`))
    } else alert(`RFQ ${f.ref} saved offline (hash ${h.slice(0, 12)}…). Send from Track when online. [server: ${server?.ok ? 'sealed' : server?.error || 'unreachable'}]`)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-black">B2B RFQ — PRAZ-ready quote</h1>
      <p className="text-sm text-neutral-600">Instant hashed quotation with {BUSINESS.name} vendor block. Cannot finalize as Compliant without valid, unexpired ITF263.</p>
      <div className="border rounded-2xl p-3 space-y-2">
        <div className="grid grid-cols-1 gap-2">
          <input placeholder="Company name *" value={f.company} onChange={e => setF({ ...f, company: e.target.value })} className="border rounded p-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Contact person *" value={f.contactPerson} onChange={e => setF({ ...f, contactPerson: e.target.value })} className="border rounded p-2 text-sm" />
            <input placeholder="Phone *" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="border rounded p-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Email *" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="border rounded p-2 text-sm" />
            <input placeholder="Tax ID" value={f.taxId} onChange={e => setF({ ...f, taxId: e.target.value })} className="border rounded p-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="ITF263 ref * (digits)" value={f.itf263Ref} onChange={e => setF({ ...f, itf263Ref: e.target.value })} className="border rounded p-2 text-sm" />
            <label className="text-xs">Clearance expiry *<input type="date" value={f.itf263Expiry} onChange={e => setF({ ...f, itf263Expiry: e.target.value })} className="border rounded p-2 text-sm w-full mt-0.5" /></label>
          </div>
          <p className={`text-xs font-bold rounded px-2 py-1 ${zimra.ok ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {zimra.ok ? 'ZIMRA gate: PASS — quote will finalize as Compliant.' : `ZIMRA gate: BLOCKED — ${zimra.reason}`}
          </p>
          <label className="text-sm">Delivery<select value={f.delivery} onChange={e => setF({ ...f, delivery: e.target.value as RFQInput['delivery'] })} className="border rounded w-full p-2 mt-1"><option>Harare CBD</option><option>Harare — outside CBD</option><option>Regional / outside Harare</option></select></label>
        </div>
      </div>
      <div className="border rounded-2xl p-3 space-y-2">
        <p className="font-bold text-sm">Lines</p>
        {f.items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-1">
            <input value={it.desc} onChange={e => setF({ ...f, items: f.items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) })} className="border rounded p-1.5 text-sm col-span-6" />
            <input type="number" value={it.qty} onChange={e => setF({ ...f, items: f.items.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x) })} className="border rounded p-1.5 text-sm col-span-2" />
            <input type="number" step="0.01" value={it.unitPrice} onChange={e => setF({ ...f, items: f.items.map((x, j) => j === i ? { ...x, unitPrice: Number(e.target.value) } : x) })} className="border rounded p-1.5 text-sm col-span-3" />
            <button onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== i) })} className="text-red-600 font-bold">×</button>
          </div>
        ))}
        <button onClick={() => setF({ ...f, items: [...f.items, { desc: '', qty: 100, unitPrice: 1 }] })} className="border rounded-full px-3 py-1 text-sm font-bold">+ Add line</button>
        <textarea placeholder="Notes (volumes, artwork, deadlines)" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} className="border rounded p-2 text-sm w-full" />
        <p className="font-black text-right">TOTAL USD {total.toFixed(2)}</p>
        <p className="text-xs text-neutral-500">Ref {f.ref} · SHA-256 integrity hash + QR rendered on PDF footer.{hash && <span className="block font-mono break-all mt-1">{hash}</span>}</p>
        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{err}</p>}
        <div className="grid grid-cols-2 gap-2 no-print">
          <button onClick={() => submit(true)} className="border rounded-full py-2 text-sm font-bold">Save offline</button>
          <button onClick={() => submit(false)} className="bg-[#E30613] text-white rounded-full py-2 text-sm font-bold">Hash + PDF + WhatsApp</button>
        </div>
        <a className="block text-center border rounded-full py-2 text-sm font-bold no-print" href={`mailto:${BUSINESS.emails[0]}?subject=${encodeURIComponent(`RFQ ${f.ref} — ${f.company}`)}&body=${encodeURIComponent(`${f.company}\n${f.items.map(i => `${i.desc} x${i.qty} @ ${i.unitPrice}`).join('\n')}\nTotal USD ${total.toFixed(2)}\nITF263 ${f.itf263Ref} exp ${f.itf263Expiry}`)}`}>Email RFQ instead</a>
      </div>
    </div>
  )
}
