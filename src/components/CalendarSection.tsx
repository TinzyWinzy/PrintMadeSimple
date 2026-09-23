import { useMemo } from 'react'
import { MONTHS, ZIM_HOLIDAYS_2026, monthGrid, type Holiday } from '../data/holidays'

export interface CalendarSectionProps {
  month: number
  year: number
  brandName?: string
  stock?: 'gloss' | 'matt'
  holidays?: Holiday[]
  highlights?: { day: number; label: string }[]
  includeHolidays?: boolean
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function CalendarSection({
  month,
  year,
  brandName,
  stock = 'gloss',
  holidays = ZIM_HOLIDAYS_2026,
  highlights = [],
  includeHolidays = true,
}: CalendarSectionProps) {
  const grid = useMemo(() => monthGrid(month, year), [month, year])
  const today = new Date()
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear()

  return (
    <section aria-label="Calendar preview" className="border rounded-2xl bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="kicker text-[#E30613]">{MONTHS[month]} {year}</p>
        {brandName && (
          <span className="text-[10px] chip-mono font-black uppercase text-neutral-500">
            {brandName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-[1px] calendar-grid text-[11px] font-medium text-neutral-400">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center py-1 uppercase">{d}</div>
        ))}
        {grid.map((d, i) => {
          if (d == null) return <div key={i} className="aspect-square" />
          const isToday = isCurrentMonth && d === today.getDate()
          const isHoliday = includeHolidays && holidays.some(h => h.month === month && h.day === d)
          const hl = highlights.find(h => h.day === d)
          return (
            <div
              key={i}
              className={`relative aspect-square flex items-center justify-center rounded
                ${isToday ? 'ring-2 ring-[#E30613] font-bold text-[#E30613]' : ''}
                ${isHoliday ? 'text-amber-700' : 'text-neutral-800'}`}
              title={isHoliday ? holidays.find(h => h.month === month && h.day === d)!.name : hl?.label}
            >
              {d}
              {hl && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#E30613]" aria-label={hl.label} />
              )}
              {isHoliday && !hl && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-amber-600" aria-label="holiday" />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 items-end">
        <div>
          <p className="text-[10px] text-neutral-500 uppercase">Stock</p>
          <span className={`chip-mono text-xs font-black ${stock === 'gloss' ? 'text-neutral-800' : 'text-neutral-500'}`}>
            300gsm GLOSS
          </span>
          <span className="chip-mono text-xs font-black text-neutral-300"> / </span>
          <span className={`chip-mono text-xs font-black ${stock === 'matt' ? 'text-neutral-800' : 'text-neutral-500'}`}>
            300gsm MATT
          </span>
        </div>
        <div className="ml-auto [perspective:600px]">
          <div className="w-10 h-14 border-2 border-neutral-800 shadow-md overflow-hidden [transform:rotateX(14deg)]">
            <div className="bg-[#E30613] h-3" />
            <div className={`h-11 ${stock === 'gloss' ? 'stock-gloss' : 'stock-matt'}`} />
          </div>
        </div>
      </div>
    </section>
  )
}
