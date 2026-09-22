# Print Made Simple PWA

Offline-first PWA for Print Made Simple Investments (Pvt) Ltd, Harare — Shop 4B, Basement Regal Star Mall, George Silundika Ave.

## Run
- `npm install`
- `npm run dev` — local dev
- `npm run build` — production (PWA service worker emitted)
- `npm run preview`

## What was built (per PRD/SAD)
- Phase 1: PWA shell + low-bandwidth infra — manifest + shortcuts, Workbox SW (Cache-First static, SWR catalog, Network-Only API w/ IndexedDB outbox), mobile-first Tailwind, bundle kept lean (no Fabric/Konva — plain Canvas API).
- Phase 2: Jewel Case Calendar customizer — 300gsm gloss/matt with texture preview, ANY start month $0 surcharge, 12/15/18-month, logo + cover/month image upload with on-device compression, standard/custom cover, ≤4 highlights/month + static Zim holidays JSON, canvas proof + proof-summary PDF.
- Phase 3: B2B PRAZ RFQ portal — company/tax/delivery/volume inputs, ITF263 gate, unique tracking hash, branded PDF quotation.
- Phase 4: Catalog + spec engine — cards (QR), calendars, flyers, banners, stickers, corporate wear, stationery + volume/rush pricing.
- Phase 5: Dispatch — dual WhatsApp (`+263 773 502 167` primary; SAD lists 4 lines) + Email (`info@printmadesimple.co.zw`) + offline save to IndexedDB outbox (Track page).

## SAD v2 upgrades (implemented)
- §2 hashed quotes: SHA-256 over canonical payload (`src/lib/security.ts`), hex + QR footer on PDF, 14-day binding note + vendor block. jsPDF retained instead of @react-pdf/renderer — same verifiable output, ~1/10th bundle cost.
- §2 ZIMRA gate: ITF263 digit-format + expiry-date validation; expired/missing clearance blocks Compliant finalization. Full ZIMRA cross-reference is server-side on sync.
- §3 pre-flight: measured logo DPI at 40mm print width (PASS/FAIL vs 300), 3mm safety overlay toggle, CMYK soft-proof simulation. Profile-accurate CMYK stays a server worker.
- §3 3D: full Three.js REJECTED — ~600KB min would breach the 1.5MB low-bandwidth mandate. CSS-3D tilt stand preview + canvas proof instead.
- §5 print-to-digital QR: `src/lib/qr.ts` mints redirect IDs (`/q/{id}`), renders QR on proof + proof PDF; retarget/analytics server-side. QR target field also on QR business cards.
- §6 tracker: pickup tokens on every save, token-validated scan-and-go collect, local stage advancement (persisted; SSE/push arrive with server), one-touch RFQ renew/amend.
- §7 server: `prisma/schema.prisma` (accounts/RBAC, products, stock, quotes w/ hash, orders, milestones, QR links). Not wired — static PWA client only.

## Backend on Vercel (same repo, GitHub auto-deploy)
- `api/health.ts` — GET liveness probe.
- `api/quotes.ts` — POST sealed RFQ intake: re-validates ZIMRA gate, recomputes SHA-256 over the canonical payload (409 on tamper), upserts Account by email, stores Quote as COMPLIANT in Neon Postgres via Prisma. 503 with a clear message when `DATABASE_URL` is unset.
- `vercel.json` — `dist` output + SPA fallback that excludes `/api/*`.
- DB: create a free Neon project, copy the pooled connection string into `.env` (local) and Vercel → Settings → Environment Variables (`DATABASE_URL`, all environments). Then `npm run db:push` (prototype) or `npm run db:migrate` (migrations). `postinstall` runs `prisma generate` so Vercel builds succeed.
- Deploy: push to `main` → Vercel builds Vite + functions. Preview deployments per PR get their own URLs (Neon branching optional).
- Client sync: `src/lib/sync.ts` — RFQ page best-effort POSTs when online; any failure keeps the IndexedDB outbox as source of truth.
- Not yet built (next): `api/q/[id].ts` QR redirect + scan logging, `api/dispatch.ts` (Resend + WhatsApp Cloud API), live tracker feed (poll or realtime — SSE is fragile on serverless functions).

## Notes / gaps (honest)
- PRAZ PDFs are client-generated via jsPDF (RGB). Server-side CMYK normalization + BullMQ queue (SAD §3.3/4.2) is stubbed — needs Node/Express worker before high-volume production.
- WhatsApp send is wa.me deep-link with prefilled payload (no Business API key in repo). Email send is mailto: (no SMTP key in repo). Wire Resend/SMTP + WhatsApp Cloud API server-side when keys exist.
- Prices USD indicative; confirm ZWG rate at collection.
- Source specs: `Product Requirements Document (PRD) - Print Made Simple PWA.docx`, `System Architecture Document (SAD) - Print Made Simple PWA.docx` (repo root).
