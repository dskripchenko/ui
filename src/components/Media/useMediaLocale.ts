import { computed, type ComputedRef } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { en } from '../../locales/en.js'
import type { UidMediaLocale } from '../../locales/types.js'

export function useMediaLocale(): ComputedRef<UidMediaLocale> {
  const locale = useLocale()
  return computed(() => {
    const own = locale.value.media
    const base = en.media as UidMediaLocale
    if (!own) return base
    return { ...base, ...own, errors: { ...base.errors, ...own.errors } }
  })
}
