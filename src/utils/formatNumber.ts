/**
 * Locale-aware number formatting shared by the components that print numbers
 * (gauge, rating, file sizes). The locale is a BCP 47 tag, normally the active
 * kit locale's `code`; an unknown tag falls back to the runtime default rather
 * than throwing.
 */
export function formatNumber(
  value: number,
  locale: string | undefined,
  options: Intl.NumberFormatOptions = {},
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value)
  } catch {
    return new Intl.NumberFormat(undefined, options).format(value)
  }
}

/** A number with exactly `digits` fraction digits, in the given locale. */
export function formatFixed(value: number, locale: string | undefined, digits: number): string {
  const d = Math.max(0, Math.min(20, Math.floor(digits)))
  return formatNumber(value, locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

/**
 * A file size with a short unit in the given locale: "512 B", "1.5 kB",
 * "2,3 МБ". Falls back to plain English units where Intl has no unit style.
 */
export function formatFileSize(bytes: number, locale: string | undefined): string {
  const [amount, unit, fallback] = bytes < 1024
    ? [bytes, 'byte', 'B']
    : bytes < 1024 * 1024
      ? [bytes / 1024, 'kilobyte', 'KB']
      : [bytes / 1024 / 1024, 'megabyte', 'MB']
  const digits = unit === 'byte' ? 0 : 1
  try {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
      maximumFractionDigits: digits,
    }).format(amount)
  } catch {
    return `${formatNumber(amount, locale, { maximumFractionDigits: digits })} ${fallback}`
  }
}
