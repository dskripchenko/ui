import { computed, inject, provide, watchEffect, type ComputedRef, type InjectionKey } from 'vue'
import type { UidLocale, UidPartialLocale } from '../locales/types.js'
import { ru } from '../locales/ru.js'
import { setValidationLocale } from '../utils/validation/messages.js'

const localeKey: InjectionKey<ComputedRef<UidLocale>> = Symbol('UidLocale')

function deepMerge<T>(base: T, override: unknown): T {
  if (typeof override !== 'object' || override === null) return base
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const k of Object.keys(override)) {
    const ov = (override as Record<string, unknown>)[k]
    const bv = (base as Record<string, unknown>)[k]
    if (ov && typeof ov === 'object' && !Array.isArray(ov) && typeof bv === 'object' && bv !== null && !Array.isArray(bv)) {
      result[k] = deepMerge(bv, ov)
    } else if (ov !== undefined) {
      result[k] = ov
    }
  }
  return result as T
}

export function provideLocale(source: ComputedRef<UidLocale | UidPartialLocale | undefined>): void {
  const merged = computed(() => {
    const v = source.value
    if (!v) return ru
    return deepMerge(ru, v)
  })
  provide(localeKey, merged)
  // Validation messages are produced outside components; they follow the app's locale.
  watchEffect(() => setValidationLocale(merged.value))
}

export function useLocale(): ComputedRef<UidLocale> {
  const injected = inject(localeKey, null)
  if (injected) return injected
  const fallback = computed(() => ru)
  return fallback
}
