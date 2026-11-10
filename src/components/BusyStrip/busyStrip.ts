/** A stretch of a day in minutes from midnight: busy, away, or one's own (with its title). */
export interface BusySegment {
  start: number
  end: number
  kind: 'busy' | 'away' | 'own'
  /** Shown on `own` stretches; never on others' (whose titles are not seen). */
  label?: string
}

/** One row of the strip: a person, a room, a resource. */
export interface BusyRow {
  id: string | number
  label: string
  segments: BusySegment[]
}

/** The selected time, minutes from midnight. */
export interface BusySelection {
  start: number
  end: number
}

export interface FirstFreeOptions {
  /** The first minute to look from. */
  from: number
  /** The last minute a stretch may end at. */
  to: number
  /** How long the stretch is, minutes. */
  duration: number
  /** Starts are tried on this grid, minutes. */
  step?: number
  /** Start no earlier than this minute (e.g. now). */
  after?: number
}

/**
 * The first start, on the step grid, of a stretch free for every row; `null`
 * when the day has none. Busy, away and own stretches all count as taken.
 */
export function firstFree(rows: readonly BusyRow[], options: FirstFreeOptions): number | null {
  const step = Math.max(1, options.step ?? 15)
  const taken = rows.flatMap((r) => r.segments).filter((s) => s.end > s.start)
  const lowest = Math.max(options.from, options.after ?? options.from)
  let start = Math.ceil(lowest / step) * step
  for (; start + options.duration <= options.to; start += step) {
    const end = start + options.duration
    if (!taken.some((s) => s.start < end && s.end > start)) return start
  }
  return null
}
