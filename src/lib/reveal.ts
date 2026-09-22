import { useEffect } from 'react'

// Zero-dependency scroll reveals. Respects data savers, slow networks and
// reduced-motion: in those cases content simply appears, no animation.
export function useReveals() {
  useEffect(() => {
    const conn = (navigator as any).connection
    const calm =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      conn?.saveData === true ||
      (typeof conn?.effectiveType === 'string' && conn.effectiveType.includes('2g'))
    const els = Array.from(document.querySelectorAll('.rv'))
    if (calm || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('rv-in'))
      return
    }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target) }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
