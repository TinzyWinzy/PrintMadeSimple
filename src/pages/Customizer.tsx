import { useMemo, useRef, useState } from 'react'
import { MONTHS, ZIM_HOLIDAYS_2026, monthGrid, monthYearForOffset } from '../data/holidays'
import { STOCK_OPTIONS, BUSINESS } from '../data/business'
import { DEFAULT_CALENDAR, jewelCasePrice, rfqHash, whatsappOrderLink, type CalendarConfig } from '../lib/engine'
import { buildCalendarSummary, buildOrderMessage, downloadCalendarProof, fileToDataUrl } from '../lib/docs'
import { probeImage, preflightDpi, cmykSoftProof, type Preflight } from '../lib/preflight'
import { newQrId, qrUrl, qrDataUrl } from '../lib/qr'
import { pickupToken } from '../lib/security'
import { saveDesign } from '../lib/db'

export default function Customizer() {
  const [cfg, setCfg] = useState<CalendarConfig>(DEFAULT_CALENDAR)
  const [qty, setQty] = useState(100)
  const [monthOffset, setMonthOffset] = useState(0)
  const [ref] = useState(() => rfqHash('jewel' + Date.now()))
  const [pf, setPf] = useState<Preflight | null>(null) // logo pre-flight result
  const [showBleed, setShowBleed] = useState(false)
  const [cmykUrl, setCmykUrl] = useState<string | null>(null)
  const [qrTarget, setQrTarget] = useState('')
  const [qrImg, setQrImg] = useState<string | null>(null)
  const [qrId, setQrId] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const total = jewelCasePrice(qty, cfg.durationMonths, cfg.stock)
  const cur = monthYearForOffset(cfg.startMonth, cfg.startYear, monthOffset)
  const grid = useMemo(() => monthGrid(cur.month, cur.year), [cur.month, cur.year])
  const holidays = ZIM_HOLIDAYS_2026.filter(h => h.month === cur.month)
  const highlights = cfg.highlights[monthOffset] || []
  const monthImg = cfg.monthImages[monthOffset]

  const set = (patch: Partial<CalendarConfig>) => setCfg(c => ({ ...c, ...patch }))

  async function onLogo(file: File | undefined) {
    if (!file) return
    const url = await fileToDataUrl(file)
    set({ logoDataUrl: url })
    try {
      const { w, h } = await probeImage(url)
      setPf(preflightDpi(w, h, 40))
    } catch { setPf(null) }
  }

  function addHighlight(day: number, label: string) {
    if (!day || !label.trim()) return
    const list = [...(cfg.highlights[monthOffset] || [])]
    if (list.length >= 4) { alert('Max 4 special dates per month (spec).'); return }
    if (list.some(h => h.day === day)) { alert('Day already highlighted.'); return }
    list.push({ day, label: label.trim() })
    setCfg(c => ({ ...c, highlights: { ...c.highlights, [monthOffset]: list } }))
  }

  async function makeQr() {
    if (!qrTarget.trim()) { alert('Enter the QR target URL first (e.g. your WhatsApp or catalogue link).'); return }
    const id = newQrId()
    setQrId(id)
    setQrImg(await qrDataUrl(qrUrl(id)))
  }

  function drawProof() {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    const W = (cv.width = 900), H = (cv.height = 620)
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#E30613'; ctx.fillRect(0, 0, W, 150)
    ctx.fillStyle = '#fff'
    ctx.font = '900 44px Arial'; ctx.fillText(cfg.brandName || 'YOUR LOGO HERE', 30, 65)
    ctx.font = '28px Arial'; ctx.fillText(`${MONTHS[cur.month]} ${cur.year}  ·  300gsm ${cfg.stock}`, 30, 110)
    if (cfg.recipientName) { ctx.font = 'italic 24px Arial'; ctx.fillText(`Prepared for ${cfg.recipientName}`, 30, 140) }
    ctx.fillStyle = '#f4f4f5'; ctx.fillRect(30, 170, 400, 260)
    ctx.fillStyle = '#71717a'; ctx.font = '20px Arial'
    ctx.fillText(monthImg ? 'Month image attached ✓' : 'Month image: tap "Upload" below', 45, 300)
    ctx.fillStyle = '#18181b'; ctx.font = 'bold 22px Arial'
    ctx.fillText('Mo Tu We Th Fr Sa Su', 470, 200)
    ctx.font = '20px Arial'
    grid.forEach((d, i) => {
      const x = 470 + (i % 7) * 55, y = 230 + Math.floor(i / 7) * 34
      if (d == null) return
      const isHol = cfg.includeZimHolidays && holidays.some(h => h.day === d)
      const isHl = highlights.some(h => h.day === d)
      if (isHl) { ctx.fillStyle = '#E30613'; ctx.beginPath(); ctx.arc(x + 10, y - 7, 14, 0, 7); ctx.fill(); ctx.fillStyle = '#fff' }
      else if (isHol) ctx.fillStyle = '#b45309'
      else ctx.fillStyle = '#18181b'
      ctx.fillText(String(d), x, y)
    })
    if (qrImg) {
      ctx.strokeStyle = '#18181b'; ctx.strokeRect(800, 170, 70, 70)
      ctx.fillStyle = '#18181b'; ctx.font = '14px Arial'
      ctx.fillText('QR', 822, 210)
    }
    if (showBleed) {
      // 3mm safety inset (schematic scale) — keep text/logos inside.
      ctx.setLineDash([10, 6]); ctx.strokeStyle = '#E30613'; ctx.lineWidth = 2
      ctx.strokeRect(18, 162, W - 36, H - 180)
      ctx.setLineDash([]); ctx.fillStyle = '#E30613'; ctx.font = '16px Arial'
      ctx.fillText('3mm safety — keep text inside', 30, H - 8)
    }
    if (cfg.stock === 'gloss') { ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 0, W, H) }
    ctx.fillStyle = '#52525b'; ctx.font = '18px Arial'
    ctx.fillText('Proof: full-colour digital print · 12 months back-to-back · jewel case = stand', 30, 470)
    ctx.fillText(`Cover: ${cfg.coverType} · Start ANY month — no surcharge · Ref ${ref}`, 30, 495)
    highlights.forEach((h, i) => { ctx.fillStyle = '#18181b'; ctx.fillText(`★ ${h.day}: ${h.label}`, 30, 525 + i * 24) })
    setCmykUrl(null)
  }

  function simulateCmyk() {
    const cv = canvasRef.current
    if (!cv || cv.width === 0) { alert('Render the proof preview first.'); return }
    setCmykUrl(cmykSoftProof(cv).toDataURL())
  }

  const summary = buildCalendarSummary(cfg, qty, total)
  const token = useMemo(() => pickupToken(ref), [ref])
  const waLink = whatsappOrderLink(buildOrderMessage('Jewel Case Calendar', ref, summary + `\nCover:${cfg.coverType} Preflight:${pf ? pf.verdict : 'logo pending'} QR:${qrId ? qrUrl(qrId) : 'none'} Pickup:${token}`))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">Jewel Case Calendar customizer</h1>
      <p className="text-sm text-neutral-600">12 months back-to-back · jewel case = stand · start ANY month, no added charge · up to 4 special dates/month · 300gsm gloss/matt.</p>

      <section className="border rounded-2xl p-3 space-y-3">
        <div>
          <p className="font-bold text-sm">1 · Stock (texture preview applies below)</p>
          <div className="flex gap-2 mt-1">
            {STOCK_OPTIONS.map(s => (
              <button key={s.id} onClick={() => set({ stock: s.id as 'gloss' | 'matt' })} className={`flex-1 border rounded-xl p-2 text-left ${cfg.stock === s.id ? 'border-[#E30613] ring-2 ring-red-200' : ''}`}>
                <span className="font-bold text-sm block">{s.label}</span><span className="text-xs text-neutral-500">{s.note}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm">Start month<select value={cfg.startMonth} onChange={e => set({ startMonth: Number(e.target.value) })} className="border rounded w-full p-1.5 mt-1">{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></label>
          <label className="text-sm">Year<input type="number" value={cfg.startYear} onChange={e => set({ startYear: Number(e.target.value) || 2026 })} className="border rounded w-full p-1.5 mt-1" /></label>
          <label className="text-sm">Duration<select value={cfg.durationMonths} onChange={e => set({ durationMonths: Number(e.target.value) as 12 | 15 | 18 })} className="border rounded w-full p-1.5 mt-1"><option value={12}>12 months</option><option value={15}>15 months</option><option value={18}>18 months</option></select></label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <input placeholder="Brand / Company name *" value={cfg.brandName} onChange={e => set({ brandName: e.target.value })} className="border rounded p-2 text-sm" />
          <input placeholder="Recipient name (Standard cover)" value={cfg.recipientName} onChange={e => set({ recipientName: e.target.value })} className="border rounded p-2 text-sm" />
          <div className="flex gap-2 text-sm">
            <button onClick={() => set({ coverType: 'standard' })} className={`flex-1 border rounded-full py-1.5 font-bold ${cfg.coverType === 'standard' ? 'bg-neutral-900 text-white' : ''}`}>Standard cover</button>
            <button onClick={() => set({ coverType: 'custom' })} className={`flex-1 border rounded-full py-1.5 font-bold ${cfg.coverType === 'custom' ? 'bg-neutral-900 text-white' : ''}`}>Custom cover</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="border rounded-xl p-2">Logo upload (every page)<input type="file" accept="image/*" className="mt-1 w-full text-xs" onChange={e => onLogo(e.target.files?.[0])} />{cfg.logoDataUrl && <span className="text-green-700 text-xs font-bold">✓ attached (auto-compressed)</span>}</label>
          <label className="border rounded-xl p-2">Cover / month image<input type="file" accept="image/*" className="mt-1 w-full text-xs" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const url = await fileToDataUrl(f); if (monthOffset === 0 && cfg.coverType === 'custom') set({ coverDataUrl: url }); setCfg(c => ({ ...c, monthImages: { ...c.monthImages, [monthOffset]: url } })) }} /><span className="text-xs text-neutral-500">Applies to {MONTHS[cur.month]}</span></label>
        </div>
        {pf ? (
          <p className={`text-xs rounded p-2 border font-bold ${pf.pass300 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            Pre-flight {pf.pxW}×{pf.pxH}px — {pf.verdict}
          </p>
        ) : (
          !cfg.logoDataUrl && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">DPI warning: no logo attached yet. Upload a sharp logo for clean print.</p>
        )}
      </section>

      <section className="border rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm">2 · Preview — {MONTHS[cur.month]} {cur.year}</p>
          <div className="ml-auto flex gap-1 no-print">
            <button disabled={monthOffset === 0} onClick={() => setMonthOffset(o => Math.max(0, o - 1))} className="border rounded-full px-3 py-1 text-sm disabled:opacity-40">‹</button>
            <button disabled={monthOffset >= cfg.durationMonths - 1} onClick={() => setMonthOffset(o => Math.min(cfg.durationMonths - 1, o + 1))} className="border rounded-full px-3 py-1 text-sm disabled:opacity-40">›</button>
          </div>
        </div>
        <canvas ref={canvasRef} className={`w-full rounded-xl mt-2 border ${cfg.stock === 'gloss' ? 'stock-gloss' : 'stock-matt'}`} style={{ aspectRatio: '900/620' }} />
        <div className="grid grid-cols-2 gap-2 mt-2 no-print">
          <button onClick={drawProof} className="bg-neutral-900 text-white rounded-full py-2 text-sm font-bold">Render proof</button>
          <button onClick={simulateCmyk} className="border rounded-full py-2 text-sm font-bold">Simulate CMYK</button>
        </div>
        <label className="text-xs flex gap-1 items-center mt-2 no-print"><input type="checkbox" checked={showBleed} onChange={e => { setShowBleed(e.target.checked); }} /> Show 3mm bleed/safety overlay on next render</label>
        {cmykUrl && <figure className="mt-2"><img src={cmykUrl} alt="CMYK soft proof" className="w-full rounded-xl border" /><figcaption className="text-xs text-neutral-500 mt-1">CMYK soft-proof (simulated gamut shift — server normalization is authoritative).</figcaption></figure>}
        {cfg.logoDataUrl && <img src={cfg.logoDataUrl} alt="logo preview" className="h-10 mt-2" />}
        {/* CSS-3D stand preview — Three.js rejected on bundle grounds (see README) */}
        <div className="mt-3 [perspective:600px] no-print">
          <p className="font-bold text-xs uppercase text-neutral-500 mb-1">Desk-stand preview (tilt)</p>
          <div className="mx-auto w-44 rounded bg-white border-2 border-neutral-800 shadow-xl [transform:rotateX(12deg)] overflow-hidden">
            <div className="bg-[#E30613] text-white text-center text-xs font-black py-1">{cfg.brandName || 'YOUR BRAND'}</div>
            <div className="text-center text-[10px] py-1">{MONTHS[cur.month]} {cur.year}</div>
            <div className="bg-neutral-900 h-3" />
          </div>
          <p className="text-[11px] text-neutral-500 text-center mt-1">Jewel case doubles as the stand — sits on any desk 365 days.</p>
        </div>
        <div className="mt-2 text-sm">
          <p className="font-bold text-xs uppercase text-neutral-500">Zim public holidays (auto)</p>
          <p className="text-xs">{holidays.length ? holidays.map(h => `${h.day}: ${h.name}`).join(' · ') : 'None this month.'}</p>
          <label className="text-xs flex gap-1 items-center mt-1"><input type="checkbox" checked={cfg.includeZimHolidays} onChange={e => set({ includeZimHolidays: e.target.checked })} /> Show holidays on proof</label>
        </div>
        <HighlightForm onAdd={addHighlight} />
        <ul className="text-sm mt-1 space-y-1">
          {highlights.map((h, i) => <li key={i} className="flex justify-between border rounded px-2 py-1"><span>★ {h.day} — {h.label}</span><button className="text-red-600 font-bold" onClick={() => setCfg(c => ({ ...c, highlights: { ...c.highlights, [monthOffset]: c.highlights[monthOffset].filter((_, j) => j !== i) } }))}>remove</button></li>)}
        </ul>
        <label className="text-sm block mt-2">Note for {MONTHS[cur.month]}<input value={cfg.monthNotes[monthOffset] || ''} onChange={e => setCfg(c => ({ ...c, monthNotes: { ...c.monthNotes, [monthOffset]: e.target.value } }))} placeholder="e.g. Expo special — 20% off" className="border rounded w-full p-1.5 mt-1 text-sm" /></label>
      </section>

      <section className="border rounded-2xl p-3 space-y-2">
        <p className="font-bold text-sm">3 · Print-to-Digital QR (365-day bridge)</p>
        <p className="text-xs text-neutral-500">Printed on the cover/insert. Retargetable later without reprinting (server redirect).</p>
        <div className="flex gap-2 no-print">
          <input value={qrTarget} onChange={e => setQrTarget(e.target.value)} placeholder="https://… (catalogue, vCard, special)" className="border rounded p-2 text-sm flex-1" />
          <button onClick={makeQr} className="border rounded-full px-3 text-sm font-bold">Generate</button>
        </div>
        {qrImg && <div className="flex items-center gap-2"><img src={qrImg} alt="buyer QR" className="h-20 w-20" /><p className="text-xs font-mono break-all">{qrUrl(qrId)}<span className="block text-neutral-500">→ {qrTarget}</span></p></div>}
      </section>

      <section className="border rounded-2xl p-3 space-y-2">
        <p className="font-bold text-sm">4 · Quantity & checkout</p>
        <div className="flex items-center gap-2">
          <input type="number" min={25} value={qty} onChange={e => setQty(Math.max(25, Number(e.target.value) || 25))} className="border rounded p-2 w-28" />
          <span className="ml-auto font-black text-lg">USD {total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-neutral-500">Ref {ref} · min 25 · matt +5% · 15/18-mo pro-rata · USD indicative · pickup token {token}.</p>
        <div className="grid grid-cols-2 gap-2 no-print">
          <button className="border rounded-full py-2 text-sm font-bold" onClick={() => downloadCalendarProof(cfg, ref, qrImg, qrId ? qrUrl(qrId) : '')}>Download proof PDF</button>
          <a className="bg-green-600 text-white rounded-full py-2 text-sm font-bold text-center" href={waLink}>WhatsApp order</a>
          <a className="border rounded-full py-2 text-sm font-bold text-center" href={`mailto:${BUSINESS.emails[0]}?subject=${encodeURIComponent(`Jewel Calendar order ${ref}`)}&body=${encodeURIComponent(summary + `\nPickup: ${token}`)}`}>Email order</a>
          <button className="border rounded-full py-2 text-sm font-bold" onClick={() => { saveDesign({ kind: 'jewel-calendar', ref, payload: { cfg, qty, total, pickupToken: token, qr: qrId ? { id: qrId, target: qrTarget } : null, preflight: pf?.verdict || 'logo pending' }, status: 'queued' }); alert(`Saved offline. Pickup token ${token} — show it at Shop 4B.`) }}>Save offline</button>
        </div>
      </section>
    </div>
  )
}

function HighlightForm({ onAdd }: { onAdd: (day: number, label: string) => void }) {
  const [day, setDay] = useState('')
  const [label, setLabel] = useState('')
  return (
    <form className="flex gap-2 mt-2 no-print" onSubmit={e => { e.preventDefault(); onAdd(Number(day), label); setDay(''); setLabel('') }}>
      <input value={day} onChange={e => setDay(e.target.value)} type="number" min={1} max={31} placeholder="Day" className="border rounded p-1.5 w-16 text-sm" />
      <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label e.g. Founders Day" className="border rounded p-1.5 flex-1 text-sm" />
      <button className="bg-[#E30613] text-white rounded-full px-3 text-sm font-bold">+ Add</button>
    </form>
  )
}
