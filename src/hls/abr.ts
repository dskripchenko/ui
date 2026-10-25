export interface BandwidthSample {
  bytes: number
  /** Download time in milliseconds. */
  ms: number
}

/** Two exponentially weighted moving averages (fast and slow); the estimate is the lower one. */
export class BandwidthEstimator {
  private fast: number
  private slow: number
  private fastWeight = 0
  private slowWeight = 0
  private readonly defaultEstimate: number

  constructor(defaultEstimate = 1_000_000, private readonly fastHalfLife = 3, private readonly slowHalfLife = 9, private readonly minBytes = 16_000) {
    this.defaultEstimate = defaultEstimate
    this.fast = 0
    this.slow = 0
  }

  sample({ bytes, ms }: BandwidthSample): void {
    if (bytes < this.minBytes || ms <= 0) return
    const bps = (bytes * 8 * 1000) / ms
    const seconds = Math.max(ms / 1000, 0.05)
    const af = Math.exp(Math.log(0.5) / this.fastHalfLife * seconds)
    const as = Math.exp(Math.log(0.5) / this.slowHalfLife * seconds)
    this.fast = bps * (1 - af) + af * this.fast
    this.fastWeight = (1 - af) + af * this.fastWeight
    this.slow = bps * (1 - as) + as * this.slow
    this.slowWeight = (1 - as) + as * this.slowWeight
  }

  get hasSamples(): boolean {
    return this.fastWeight > 0
  }

  /** Bits per second. */
  get estimate(): number {
    if (!this.fastWeight) return this.defaultEstimate
    return Math.min(this.fast / this.fastWeight, this.slow / this.slowWeight)
  }
}

export interface AbrLevel {
  bandwidth: number
  height?: number
}

export interface ChooseLevelOptions {
  /** Share of the estimate a level may use (default 0.8). */
  safety?: number
  /** Player height in device pixels: the smallest level covering it is the tallest considered. */
  maxHeight?: number
  /** Seconds buffered ahead: a healthy buffer allows a step up, a thin one forces caution. */
  bufferAhead?: number
  current?: number
}

/** Index of the best level for the bandwidth; levels must be sorted by bandwidth ascending. */
export function chooseLevel(levels: AbrLevel[], bandwidth: number, options: ChooseLevelOptions = {}): number {
  if (!levels.length) return -1
  let safety = options.safety ?? 0.8
  if (options.bufferAhead !== undefined && options.bufferAhead < 4) safety *= 0.7
  const budget = bandwidth * safety
  let best = 0
  for (let i = 0; i < levels.length; i++) {
    const l = levels[i]
    const prev = levels[i - 1]
    if (options.maxHeight && prev?.height && prev.height >= options.maxHeight) break
    if (l.bandwidth <= budget) best = i
  }
  // Step up at most one level at a time to avoid oscillation.
  const cur = options.current
  if (cur !== undefined && cur >= 0 && best > cur + 1) best = cur + 1
  return best
}
