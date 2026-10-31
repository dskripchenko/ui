
export type CalendarView = 'day' | 'week' | 'month' | 'year' | 'agenda'

export interface CalendarEvent {
  id?: string | number
    date: string
    endDate?: string
    time?: string
    endTime?: string
  title: string
  color?: string
}

export interface CalendarRange {
  view: CalendarView
    start: string
    end: string
}

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000)
}

export function startOfWeek(iso: string): string {
  const d = fromISO(iso)
  return addDays(iso, -((d.getDay() + 6) % 7))
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`
}

export function endOfMonth(iso: string): string {
  const d = fromISO(startOfMonth(iso))
  return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

export function minutes(time: string | undefined): number | null {
  if (!time) return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!m) return null
  return Math.min(24 * 60, Number(m[1]) * 60 + Number(m[2]))
}

export function formatTime(min: number): string {
  const h = Math.floor(min / 60)
  return `${String(h).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

export function rangeOf(view: CalendarView, anchor: string): CalendarRange {
  switch (view) {
    case 'day':
      return { view, start: anchor, end: anchor }
    case 'week': {
      const start = startOfWeek(anchor)
      return { view, start, end: addDays(start, 6) }
    }
    case 'month': {
      const start = startOfWeek(startOfMonth(anchor))
      return { view, start, end: addDays(start, 41) }
    }
    case 'year': {
      const y = anchor.slice(0, 4)
      return { view, start: `${y}-01-01`, end: `${y}-12-31` }
    }
    case 'agenda':
      return { view, start: startOfMonth(anchor), end: endOfMonth(anchor) }
  }
}

export function step(view: CalendarView, anchor: string, dir: 1 | -1): string {
  if (view === 'day') return addDays(anchor, dir)
  if (view === 'week') return addDays(anchor, 7 * dir)
  const d = fromISO(anchor)
  if (view === 'year') return toISO(new Date(d.getFullYear() + dir, d.getMonth(), 1))
  return toISO(new Date(d.getFullYear(), d.getMonth() + dir, 1))
}

export function lastDay(e: CalendarEvent): string {
  return e.endDate && e.endDate > e.date ? e.endDate : e.date
}

export function isAllDay(e: CalendarEvent): boolean {
  return minutes(e.time) === null
}

export function isMultiDay(e: CalendarEvent): boolean {
  return lastDay(e) !== e.date
}

export function occursOn(e: CalendarEvent, iso: string): boolean {
  return e.date <= iso && iso <= lastDay(e)
}

export function eventsOn(events: readonly CalendarEvent[], iso: string): CalendarEvent[] {
  return events
    .filter((e) => occursOn(e, iso))
    .sort((a, b) => {
      const ka = isAllDay(a) || isMultiDay(a) ? -1 : (minutes(a.time) ?? 0)
      const kb = isAllDay(b) || isMultiDay(b) ? -1 : (minutes(b.time) ?? 0)
      return ka - kb
    })
}

export interface TimedBlock {
  event: CalendarEvent
    start: number
  end: number
    col: number
  cols: number
}

export function layoutDay(events: readonly CalendarEvent[], iso: string): TimedBlock[] {
  const timed = events
    .filter((e) => e.date === iso && !isAllDay(e) && !isMultiDay(e))
    .map((event) => {
      const start = minutes(event.time) ?? 0
      const end = Math.max(start + 15, minutes(event.endTime) ?? start + 60)
      return { event, start, end: Math.min(end, 24 * 60), col: 0, cols: 1 }
    })
    .sort((a, b) => a.start - b.start || b.end - a.end)
  let group: TimedBlock[] = []
  let groupEnd = -1
  const close = (): void => {
    const cols = group.reduce((n, b) => Math.max(n, b.col + 1), 1)
    for (const b of group) b.cols = cols
    group = []
  }
  for (const block of timed) {
    if (block.start >= groupEnd) {
      close()
      groupEnd = -1
    }
    const taken = new Set(group.filter((b) => b.end > block.start).map((b) => b.col))
    let col = 0
    while (taken.has(col)) col++
    block.col = col
    group.push(block)
    groupEnd = Math.max(groupEnd, block.end)
  }
  close()
  return timed
}

export function moved(e: CalendarEvent, date: string, time?: string): Pick<CalendarEvent, 'date' | 'endDate' | 'time' | 'endTime'> {
  const span = daysBetween(e.date, lastDay(e))
  const out: Pick<CalendarEvent, 'date' | 'endDate' | 'time' | 'endTime'> = { date }
  if (span > 0) out.endDate = addDays(date, span)
  const from = minutes(e.time)
  if (from === null) return out
  const to = minutes(e.endTime) ?? from + 60
  const start = time !== undefined ? (minutes(time) ?? from) : from
  out.time = formatTime(start)
  if (e.endTime !== undefined || time !== undefined) out.endTime = formatTime(Math.min(24 * 60, start + (to - from)))
  return out
}
