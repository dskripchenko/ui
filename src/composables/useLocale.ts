import { computed, effectScope, inject, provide, toValue, watchEffect, type App, type ComputedRef, type InjectionKey, type MaybeRefOrGetter } from 'vue'
import type { UidLocale, UidPartialLocale } from '../locales/types.js'
import { en } from '../locales/en.js'
import { setValidationLocale } from '../utils/validation/messages.js'

export const localeKey: InjectionKey<ComputedRef<UidLocale>> = Symbol('UidLocale')

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

export type UidLocaleSource = MaybeRefOrGetter<UidLocale | UidPartialLocale | undefined>

function mergedLocale(source: UidLocaleSource): ComputedRef<UidLocale> {
  return computed(() => {
    const v = toValue(source)
    if (!v) return en
    return deepMerge(en, v)
  })
}

export function provideLocale(source: UidLocaleSource): void {
  const merged = mergedLocale(source)
  provide(localeKey, merged)
  // Validation messages are produced outside components; they follow the app's locale.
  watchEffect(() => setValidationLocale(merged.value))
}

export function provideAppLocale(app: App, source: UidLocaleSource): () => void {
  const scope = effectScope(true)
  const merged = scope.run(() => {
    const m = mergedLocale(source)
    watchEffect(() => setValidationLocale(m.value))
    return m
  })!
  app.provide(localeKey, merged)
  const stop = () => scope.stop()
  const onUnmount = (app as App & { onUnmount?: (fn: () => void) => void }).onUnmount
  if (typeof onUnmount === 'function') onUnmount.call(app, stop)
  return stop
}

export function useLocale(): ComputedRef<UidLocale> {
  const injected = inject(localeKey, null)
  if (injected) return injected
  const fallback = computed(() => en)
  return fallback
}
