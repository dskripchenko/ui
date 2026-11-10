/** A milestone on the strip. */
export interface Milestone {
  key: string
  label: string
  /** YYYY-MM-DD. */
  date: string
  /** A second line under the label. */
  caption?: string
  /** Drawn in the warning colour and announced as at risk. */
  risk?: boolean
  /** The milestone becomes a link. */
  href?: string
}

const DAY_MS = 86_400_000

/** A YYYY-MM-DD date as a day number (days since 1970-01-01, UTC); null when invalid. */
export function dayNumber(date: string | undefined | null): number | null {
  if (!date) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return null
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isFinite(t) ? Math.round(t / DAY_MS) : null
}

export function dayToDate(day: number): Date {
  return new Date(day * DAY_MS)
}

function monthStart(day: number): number {
  const d = dayToDate(day)
  return Math.round(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / DAY_MS)
}

function monthEnd(day: number): number {
  const d = dayToDate(day)
  return Math.round(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0) / DAY_MS)
}

export interface MilestoneRange {
  /** The first day of the scale. */
  start: number
  /** The last day of the scale (inclusive). */
  end: number
}

/**
 * The scale's days: the given start and end, else from the first day of the
 * earliest month to the last day of the latest one, `today` included.
 */
export function milestoneRange(items: Milestone[], start?: string, end?: string, today?: string): MilestoneRange | null {
  const days = [...items.map((i) => dayNumber(i.date)), dayNumber(today)].filter((d): d is number => d !== null)
  const s = dayNumber(start) ?? (days.length ? monthStart(Math.min(...days)) : null)
  const e = dayNumber(end) ?? (days.length ? monthEnd(Math.max(...days)) : null)
  if (s === null || e === null) return null
  return e >= s ? { start: s, end: e } : { start: e, end: s }
}

/** The left edge of a day on the scale, in percent of its width, clamped to 0–100. */
export function dayPercent(day: number, range: MilestoneRange): number {
  const total = range.end - range.start + 1
  return Math.max(0, Math.min(100, ((day - range.start) / total) * 100))
}

/** The first day of every month that starts within the scale. */
export function monthStarts(range: MilestoneRange): number[] {
  const out: number[] = []
  let d = monthStart(range.start)
  if (d < range.start) d = monthEnd(d) + 1
  while (d <= range.end) {
    out.push(d)
    d = monthEnd(d) + 1
  }
  return out
}
