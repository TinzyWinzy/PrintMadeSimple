// Static Zimbabwe public holidays — kept local for Offline-Always promise (SAD §3.2).
// month is 0-indexed. Update annually.
export type Holiday = { month: number; day: number; name: string }

export const ZIM_HOLIDAYS_2026: Holiday[] = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 3, day: 3, name: 'Good Friday' },
  { month: 3, day: 4, name: 'Holy Saturday' },
  { month: 3, day: 6, name: 'Easter Monday' },
  { month: 3, day: 18, name: 'Independence Day' },
  { month: 4, day: 1, name: "Workers' Day" },
  { month: 4, day: 25, name: 'Africa Day' },
  { month: 7, day: 11, name: "Heroes' Day" },
  { month: 7, day: 12, name: 'Defence Forces Day' },
  { month: 11, day: 25, name: 'Christmas Day' },
  { month: 11, day: 26, name: 'Boxing Day' },
]

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export function monthYearForOffset(startMonth: number, startYear: number, offset: number): { month: number; year: number } {
  const d = new Date(startYear, startMonth + offset, 1)
  return { month: d.getMonth(), year: d.getFullYear() }
}

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Monday-first grid like jewel-case artwork; returns leading blanks
export function monthGrid(month: number, year: number): (number | null)[] {
  const total = daysInMonth(month, year)
  let first = new Date(year, month, 1).getDay() // 0=Sun
  const leading = (first + 6) % 7 // Mon=0
  const cells: (number | null)[] = [...Array(leading).fill(null)]
  for (let d = 1; d <= total; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
