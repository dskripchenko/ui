export type HeatmapColorScaleName =
  | 'default'
  | 'viridis'
  | 'magma'
  | 'plasma'
  | 'inferno'
  | 'blues'
  | 'greens'
  | 'reds'

export const HEATMAP_DEFAULT_LOW = 'color-mix(in srgb, var(--uid-heatmap-matrix-color) 14%, var(--uid-color-bg))'
export const HEATMAP_DEFAULT_HIGH = 'var(--uid-heatmap-matrix-color)'

export const heatmapColorScales: Record<HeatmapColorScaleName, readonly string[]> = {
  default: [HEATMAP_DEFAULT_LOW, HEATMAP_DEFAULT_HIGH],
  viridis: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
  magma: ['#000004', '#1c1044', '#4f127b', '#812581', '#b5367a', '#e55064', '#fb8761', '#fec287', '#fcfdbf'],
  plasma: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
  inferno: ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d13d', '#fcffa4'],
  blues: ['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
  greens: ['#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
  reds: ['#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
}

export function isHeatmapColorScaleName(value: string): value is HeatmapColorScaleName {
  return Object.prototype.hasOwnProperty.call(heatmapColorScales, value)
}

// A name gives its stops, a list is taken as custom stops (low → high), and any
// other string is one CSS colour ramped up from a tint of itself.
export function resolveHeatmapStops(scale: string | readonly string[] | undefined): string[] {
  if (Array.isArray(scale)) {
    const stops = scale.filter(s => typeof s === 'string' && s.trim() !== '')
    if (stops.length > 0) return stops
    return [...heatmapColorScales.default]
  }
  const name = typeof scale === 'string' ? scale.trim() : ''
  if (name === '') return [...heatmapColorScales.default]
  const lower = name.toLowerCase()
  if (isHeatmapColorScaleName(lower)) return [...heatmapColorScales[lower]]
  if (!isCssColor(name)) return [...heatmapColorScales.default]
  return [`color-mix(in srgb, ${name} 14%, var(--uid-color-bg))`, name]
}

function isCssColor(value: string): boolean {
  if (/^(#|rgba?\(|hsla?\(|hwb\(|lab\(|lch\(|oklab\(|oklch\(|color\(|color-mix\(|var\()/i.test(value)) return true
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('color', value)
}

export function heatmapColorAt(stops: readonly string[], t: number): string {
  if (stops.length === 0) return 'transparent'
  if (stops.length === 1) return stops[0]
  const clamped = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0
  const x = clamped * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  const f = x - i
  if (f <= 0.0005) return stops[i]
  if (f >= 0.9995) return stops[i + 1]
  return `color-mix(in srgb, ${stops[i + 1]} ${(f * 100).toFixed(1)}%, ${stops[i]})`
}

export function heatmapGradient(stops: readonly string[]): string {
  if (stops.length === 1) return stops[0]
  return `linear-gradient(to right, ${stops.join(', ')})`
}
