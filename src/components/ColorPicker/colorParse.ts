export type RgbaTuple = [r: number, g: number, b: number, a: number]

const NUM = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?'

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function parseAlpha(token: string | undefined): number | null {
  if (token === undefined) return 100
  const pct = token.endsWith('%')
  const n = parseFloat(pct ? token.slice(0, -1) : token)
  if (Number.isNaN(n)) return null
  return Math.round(clamp(pct ? n : n * 100, 0, 100))
}

function parseChannel(token: string): number | null {
  const pct = token.endsWith('%')
  const n = parseFloat(pct ? token.slice(0, -1) : token)
  if (Number.isNaN(n)) return null
  return Math.round(clamp(pct ? (n / 100) * 255 : n, 0, 255))
}

function parseHue(token: string): number | null {
  const m = token.match(new RegExp(`^(${NUM})(deg|rad|grad|turn)?$`, 'i'))
  if (!m) return null
  let n = parseFloat(m[1])
  const unit = (m[2] ?? 'deg').toLowerCase()
  if (unit === 'rad') n = (n * 180) / Math.PI
  else if (unit === 'grad') n = n * 0.9
  else if (unit === 'turn') n = n * 360
  return ((n % 360) + 360) % 360
}

function splitArgs(body: string): string[] | null {
  const trimmed = body.trim()
  // Comma syntax: "r, g, b[, a]"; space syntax: "r g b[ / a]".
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim())
    return parts.every(Boolean) ? parts : null
  }
  const [main, alpha, extra] = trimmed.split('/').map((p) => p.trim())
  if (extra !== undefined) return null
  const parts = main.split(/\s+/).filter(Boolean)
  if (alpha !== undefined) {
    if (!alpha) return null
    parts.push(alpha)
  }
  return parts
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const ss = s / 100
  const ll = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = ss * Math.min(ll, 1 - ll)
  const f = (n: number) => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

function parseHexColor(hex: string): RgbaTuple | null {
  if (!/^[0-9a-f]+$/i.test(hex)) return null
  let h = hex
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6 && h.length !== 8) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const a = h.length === 8 ? Math.round((parseInt(h.slice(6, 8), 16) / 255) * 100) : 100
  return [r, g, b, a]
}

// Accepts #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba(), hsl()/hsla(); alpha is 0..100.
export function parseColor(input: string | null | undefined): RgbaTuple | null {
  if (!input) return null
  const str = input.trim().toLowerCase()
  if (str.startsWith('#')) return parseHexColor(str.slice(1))

  const fn = str.match(/^(rgba?|hsla?)\(([^)]*)\)$/)
  if (!fn) return /^[0-9a-f]{3,8}$/.test(str) ? parseHexColor(str) : null

  const args = splitArgs(fn[2])
  if (!args || args.length < 3 || args.length > 4) return null
  const alpha = parseAlpha(args[3])
  if (alpha === null) return null

  if (fn[1].startsWith('rgb')) {
    const channels = args.slice(0, 3).map(parseChannel)
    if (channels.some((c) => c === null)) return null
    const [r, g, b] = channels as number[]
    return [r, g, b, alpha]
  }

  const h = parseHue(args[0])
  if (h === null) return null
  const s = parseFloat(args[1])
  const l = parseFloat(args[2])
  if (Number.isNaN(s) || Number.isNaN(l)) return null
  const [r, g, b] = hslToRgb(h, clamp(s, 0, 100), clamp(l, 0, 100))
  return [r, g, b, alpha]
}

function hex2(n: number): string {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
}

// Lowercase #rrggbb, or #rrggbbaa when alpha < 100.
export function toHex([r, g, b, a]: RgbaTuple): string {
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`
  return a < 100 ? `${base}${hex2((a / 100) * 255)}` : base
}

// Any supported color string to hex; null when it cannot be parsed.
export function normalizeColor(input: string | null | undefined): string | null {
  const parsed = parseColor(input)
  return parsed ? toHex(parsed) : null
}
