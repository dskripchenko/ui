export interface NiceTicks {
  /** The lowest tick: the input min rounded down to a nice step. */
  min: number
  /** The highest tick: the input max rounded up to a nice step. */
  max: number
  /** Evenly spaced ticks from `min` to `max`, both included. */
  ticks: number[]
}

const NICE_FRACTIONS = [1, 2, 2.5, 5]

function clean(value: number): number {
  // Strip float noise such as 0.30000000000000004.
  return Number.parseFloat(value.toPrecision(12))
}

function span(lo: number, hi: number, step: number): { min: number; max: number; intervals: number } {
  const min = clean(Math.floor(clean(lo / step)) * step)
  const max = clean(Math.ceil(clean(hi / step)) * step)
  return { min, max, intervals: Math.round((max - min) / step) }
}

/**
 * Rounds a value range out to "nice" axis ticks (multiples of 1, 2, 2.5 or 5
 * times a power of ten). `count` is the approximate number of intervals: the
 * step whose interval count is closest to it wins, the tighter range on a tie.
 */
export function niceTicks(min: number, max: number, count = 4): NiceTicks {
  let lo = Number.isFinite(min) ? min : 0
  let hi = Number.isFinite(max) ? max : 0
  if (lo > hi) [lo, hi] = [hi, lo]
  if (lo === hi) {
    if (lo === 0) hi = 1
    else if (lo > 0) lo = 0
    else hi = 0
  }
  const target = Math.max(1, Math.round(Number.isFinite(count) ? count : 4))
  const exp = Math.floor(Math.log10((hi - lo) / target))
  let best: { step: number; min: number; max: number; intervals: number } | null = null
  for (let e = exp - 1; e <= exp + 1; e++) {
    for (const fraction of NICE_FRACTIONS) {
      const step = clean(fraction * 10 ** e)
      const s = span(lo, hi, step)
      if (!best) {
        best = { step, ...s }
        continue
      }
      const d = Math.abs(s.intervals - target)
      const bestD = Math.abs(best.intervals - target)
      if (d < bestD || (d === bestD && s.max - s.min < best.max - best.min)) best = { step, ...s }
    }
  }
  const { step, min: niceMin, intervals } = best as { step: number; min: number; max: number; intervals: number }
  const ticks: number[] = []
  for (let i = 0; i <= intervals; i++) ticks.push(clean(niceMin + i * step))
  return { min: niceMin, max: clean(niceMin + intervals * step), ticks }
}

function f(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/**
 * A bar from `base` to `end` (SVG y coordinates) whose data end — the end
 * away from the baseline — has rounded corners.
 */
export function barPath(x: number, width: number, base: number, end: number, radius: number): string {
  const h = Math.abs(base - end)
  const r = Math.max(0, Math.min(radius, width / 2, h))
  const right = x + width
  if (r === 0) return `M${f(x)} ${f(base)}V${f(end)}H${f(right)}V${f(base)}Z`
  const dir = end < base ? 1 : -1
  return [
    `M${f(x)} ${f(base)}`,
    `V${f(end + dir * r)}`,
    `Q${f(x)} ${f(end)} ${f(x + r)} ${f(end)}`,
    `H${f(right - r)}`,
    `Q${f(right)} ${f(end)} ${f(right)} ${f(end + dir * r)}`,
    `V${f(base)}Z`,
  ].join('')
}

export interface ChartPoint {
  x: number
  y: number
}

/** Splits points at `null` into contiguous runs. */
export function segments(points: (ChartPoint | null)[]): ChartPoint[][] {
  const runs: ChartPoint[][] = []
  let run: ChartPoint[] = []
  for (const p of points) {
    if (p) run.push(p)
    else if (run.length) {
      runs.push(run)
      run = []
    }
  }
  if (run.length) runs.push(run)
  return runs
}

/** An SVG path through the points, broken (a new `M`) at every `null`. */
export function linePath(points: (ChartPoint | null)[]): string {
  return segments(points)
    .map(run => run.map((p, i) => `${i === 0 ? 'M' : 'L'}${f(p.x)} ${f(p.y)}`).join(''))
    .join('')
}

/** A closed area between the top points and the base points of each run. */
export function areaPath(top: (ChartPoint | null)[], base: (ChartPoint | null)[]): string {
  const paired = top.map((p, i) => (p && base[i] ? { top: p, base: base[i] as ChartPoint } : null))
  const runs: { top: ChartPoint; base: ChartPoint }[][] = []
  let run: { top: ChartPoint; base: ChartPoint }[] = []
  for (const p of paired) {
    if (p) run.push(p)
    else if (run.length) {
      runs.push(run)
      run = []
    }
  }
  if (run.length) runs.push(run)
  return runs
    .filter(r => r.length > 1)
    .map(r => {
      const up = r.map((p, i) => `${i === 0 ? 'M' : 'L'}${f(p.top.x)} ${f(p.top.y)}`).join('')
      const down = [...r].reverse().map(p => `L${f(p.base.x)} ${f(p.base.y)}`).join('')
      return `${up}${down}Z`
    })
    .join('')
}

/** Rough text width for an 11px UI font; enough to lay out axis labels. */
export function estimateTextWidth(text: string, fontPx = 11): number {
  let w = 0
  for (const ch of text) w += /[⺀-鿿가-힯＀-￯]/.test(ch) ? fontPx : fontPx * 0.6
  return w
}
