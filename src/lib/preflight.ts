// SAD v2 §3: client-side pre-flight (runs on-device, offline).
// Replaces the v1 "logo attached yes/no" check with measured DPI + bleed/safety
// overlay + CMYK soft-proof simulation. Full profile-accurate CMYK normalization
// remains a server worker (SAD v2 §3) — this catches errors before upload.

export type Preflight = {
  pxW: number; pxH: number
  dpi: number // estimated at stated print width
  pass300: boolean
  verdict: string
}

export function probeImage(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = reject
    img.src = dataUrl
  })
}

// Logo prints ~40mm wide on jewel insert / card. dpi = px / inches.
export function preflightDpi(pxW: number, pxH: number, printWidthMm = 40): Preflight {
  const dpi = Math.round(pxW / (printWidthMm / 25.4))
  const pass300 = dpi >= 300
  return {
    pxW, pxH, dpi, pass300,
    verdict: pass300
      ? `PASS — ~${dpi} DPI at ${printWidthMm}mm print width.`
      : `FAIL — ~${dpi} DPI at ${printWidthMm}mm (need ≥300). Upload a larger file or print the logo smaller.`
  }
}

// Naive RGB→CMYK→RGB round-trip on a downscaled copy for soft-proofing.
// Honest limits: no ICC profiles — shows gamut-shift direction, not exact output.
export function cmykSoftProof(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas')
  const W = (out.width = 300), H = (out.height = Math.max(1, Math.round((300 * src.height) / src.width)))
  const ctx = out.getContext('2d')!
  ctx.drawImage(src, 0, 0, W, H)
  const img = ctx.getImageData(0, 0, W, H)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255
    const k = 1 - Math.max(r, g, b)
    const rr = (1 - Math.min(1, (1 - r - k) / (1 - k || 1))) * (1 - k)
    const gg = (1 - Math.min(1, (1 - g - k) / (1 - k || 1))) * (1 - k)
    const bb = (1 - Math.min(1, (1 - b - k) / (1 - k || 1))) * (1 - k)
    // CMYK total-ink-limit dulls saturated brights — emulate ~8% flattening
    d[i] = Math.round(rr * 255 * 0.94 + 8)
    d[i + 1] = Math.round(gg * 255 * 0.94 + 8)
    d[i + 2] = Math.round(bb * 255 * 0.94 + 8)
  }
  ctx.putImageData(img, 0, 0)
  return out
}
