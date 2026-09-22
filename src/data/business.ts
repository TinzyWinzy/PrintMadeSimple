export const BUSINESS = {
  name: 'Print Made Simple Investments (Private) Limited',
  tagline: 'designing | printing | branding',
  address: 'Shop 4B, Basement Regal Star Mall, George Silundika Ave, Harare',
  emails: ['info@printmadesimple.co.zw', 'pmsharare@gmail.com'],
  phones: [
    { display: '0773 502 167', intl: '+263773502167' },
    { display: '0777 971 450', intl: '+263777971450' },
    { display: '0716 502 167', intl: '+263716502167' },
    { display: '0772 892 240', intl: '+263772892240' },
  ],
  landlines: ['0710 940 060', '0782 327 902'],
  primaryWhatsapp: '+263773502167',
}

export type Product = {
  id: string
  category: string
  name: string
  desc: string
  specs: string
  basePriceUSD: number // per-unit at qty 1 baseline
  unit: string
  turnaround: string
  minQty: number
}

export const PRODUCTS: Product[] = [
  { id: 'bc-standard', category: 'Business Cards', name: 'Business Cards — Standard', desc: 'Full-colour, double-sided, fast turnaround. QR code optional.', specs: '90x50mm · 300gsm gloss/matt · full colour', basePriceUSD: 0.08, unit: 'card', turnaround: '24–48h', minQty: 100 },
  { id: 'bc-qr', category: 'Business Cards', name: 'Business Cards — QR Smart', desc: 'Card + scannable QR to WhatsApp, website or catalogue.', specs: '90x50mm · 300gsm · QR integrated', basePriceUSD: 0.09, unit: 'card', turnaround: '24–48h', minQty: 100 },
  { id: 'jewel-12', category: 'Calendars', name: 'Jewel Case Desk Calendar — 12mo', desc: 'CD jewel case becomes the stand. Start ANY month, no surcharge. Logo on every page + cover.', specs: '12 months back-to-back · 300gsm gloss/matt · full colour', basePriceUSD: 1.6, unit: 'calendar', turnaround: '3–5 days', minQty: 25 },
  { id: 'jewel-15', category: 'Calendars', name: 'Jewel Case Calendar — 15mo', desc: 'Extended visibility variant (e.g. Oct → Dec next year).', specs: '15 months · 300gsm · full colour', basePriceUSD: 2.0, unit: 'calendar', turnaround: '3–5 days', minQty: 25 },
  { id: 'a3-desk', category: 'Calendars', name: 'A3 Desk Calendar', desc: 'Week-starts-Sunday layout. Suitable for corporates, churches, individuals.', specs: 'A3 · wiro-bound · full colour', basePriceUSD: 3.5, unit: 'calendar', turnaround: '3–5 days', minQty: 20 },
  { id: 'flyer-a5', category: 'Flyers', name: 'Flyers A5', desc: 'Promotions, church & event flyers.', specs: 'A5 · 135gsm gloss · full colour', basePriceUSD: 0.12, unit: 'flyer', turnaround: '24–72h', minQty: 100 },
  { id: 'banner-pvc', category: 'Banners', name: 'PVC Banner (per sqm)', desc: 'Shop, church, campaign banners with eyelets.', specs: '440gsm PVC · per square metre', basePriceUSD: 12, unit: 'sqm', turnaround: '24–48h', minQty: 1 },
  { id: 'sticker-vinyl', category: 'Stickers & Labels', name: 'Vinyl Stickers / Labels', desc: 'Product labels, laptop & shop stickers. Kiss-cut.', specs: 'Vinyl · kiss-cut · waterproof option', basePriceUSD: 0.25, unit: 'sticker', turnaround: '2–4 days', minQty: 50 },
  { id: 'corp-tshirt', category: 'Corporate Wear', name: 'Branded T-Shirt', desc: 'Events, staff & promotions. Sizes S–XXL.', specs: 'Cotton/poly · screen or DTF print', basePriceUSD: 6.5, unit: 'shirt', turnaround: '3–7 days', minQty: 10 },
  { id: 'letterhead', category: 'Office Stationery', name: 'Letterheads A4 (per 100)', desc: 'Corporate letterheads, invoices, receipts.', specs: 'A4 · 80gsm bond · single/full colour', basePriceUSD: 9, unit: 'pack100', turnaround: '24–48h', minQty: 1 },
]

export const STOCK_OPTIONS = [
  { id: 'gloss', label: '300gsm Gloss', note: 'Vivid, shiny — best for photos' },
  { id: 'matt', label: '300gsm Matt', note: 'Premium, non-glare — best for text' },
] as const
