import { getMessage } from './messages'
import type { RuleFn, FieldContext } from './types'

const NULLABLE_SENTINEL = '__uid_nullable__'

function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || String(v).trim() === ''
}

function ctx(base: FieldContext, params?: string[]): FieldContext {
  return params ? { ...base, params } : base
}

export const required = (msg?: string): RuleFn =>
  (v, c) => !isEmpty(v) || (msg ?? getMessage('required', c))

export const nullable = (): RuleFn =>
  (v) => isEmpty(v) ? NULLABLE_SENTINEL : true

export const email = (msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v)) || (msg ?? getMessage('email', c))

export const url = (msg?: string): RuleFn => (v, c) => {
  if (isEmpty(v)) return true
  try { new URL(String(v)); return true }
  catch { return msg ?? getMessage('url', c) }
}

export const numeric = (msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || !isNaN(Number(v)) || (msg ?? getMessage('numeric', c))

export const integer = (msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || Number.isInteger(Number(v)) || (msg ?? getMessage('integer', c))

export const min = (n: number, msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || String(v).length >= n || (msg ?? getMessage('min', ctx(c, [String(n)])))

export const max = (n: number, msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || String(v).length <= n || (msg ?? getMessage('max', ctx(c, [String(n)])))

export const minValue = (n: number, msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || Number(v) >= n || (msg ?? getMessage('min_value', ctx(c, [String(n)])))

export const maxValue = (n: number, msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || Number(v) <= n || (msg ?? getMessage('max_value', ctx(c, [String(n)])))

export const regex = (pattern: string | RegExp, msg?: string): RuleFn => (v, c) => {
  if (isEmpty(v)) return true
  const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  return re.test(String(v)) || (msg ?? getMessage('regex', c))
}

export const inList = (list: string[], msg?: string): RuleFn =>
  (v, c) => isEmpty(v) || list.includes(String(v)) || (msg ?? getMessage('in', c))

export const sameAs = (fieldName: string, msg?: string): RuleFn => (v, c) => {
  if (!c.form) return true
  return v === c.form[fieldName] || (msg ?? getMessage('same_as', c))
}

export const requiredIf = (fieldName: string, fieldValue: unknown, msg?: string): RuleFn => (v, c) => {
  if (!c.form || c.form[fieldName] !== fieldValue) return true
  return !isEmpty(v) || (msg ?? getMessage('required_if', c))
}

export const requiredUnless = (fieldName: string, fieldValue: unknown, msg?: string): RuleFn => (v, c) => {
  if (!c.form || c.form[fieldName] === fieldValue) return true
  return !isEmpty(v) || (msg ?? getMessage('required_unless', c))
}

export { NULLABLE_SENTINEL }
