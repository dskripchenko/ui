import { onBeforeUnmount, onMounted, ref, unref, watch, type MaybeRef, type Ref } from 'vue'

/** A product of the organization as the switcher gets it: its key and its address. */
export interface ProductAddress {
  key: string
  url: string
}

export interface UseProductBadgesOptions {
  /** The product the person is in: its count is on its own bell, it is not asked. */
  current: string
  /** Where a product answers its count, from its address. Default: `/api/v1/badge/count`. */
  path?: string
  /** How often to ask, in ms. Default: a minute; also when the tab comes back. */
  interval?: number
  /** The fetch to use (tests). Default: the global one. */
  fetch?: typeof fetch
}

/** `{ success, payload: { count } }` — the count; anything else is no count. */
function countOf(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null
  const payload = (body as { payload?: unknown }).payload
  const count = payload && typeof payload === 'object' ? (payload as { count?: unknown }).count : undefined
  return typeof count === 'number' && Number.isFinite(count) && count >= 0 ? Math.floor(count) : null
}

/**
 * What waits for the person in the organization's other products: each one is
 * asked for its count with the person's session there (`credentials: include`;
 * the product lets its sibling products read the answer). A product that does
 * not answer — down, signed out, without the method — has no count.
 */
export function useProductBadges(products: MaybeRef<ProductAddress[]>, options: UseProductBadgesOptions): Ref<Record<string, number>> {
  const counts = ref<Record<string, number>>({})
  const path = options.path ?? '/api/v1/badge/count'
  const interval = options.interval ?? 60_000
  let timer: ReturnType<typeof setInterval> | undefined
  let asking = 0

  async function ask(): Promise<void> {
    const run = ++asking
    const doFetch = options.fetch ?? (typeof fetch === 'undefined' ? undefined : fetch)
    if (!doFetch) return
    const others = unref(products).filter((p) => p.key !== options.current && /^https?:\/\//.test(p.url))
    const answers = await Promise.all(
      others.map(async (p): Promise<[string, number | null]> => {
        try {
          const res = await doFetch(new URL(path, p.url).toString(), { credentials: 'include', headers: { Accept: 'application/json' } })
          return [p.key, res.ok ? countOf(await res.json()) : null]
        } catch {
          return [p.key, null]
        }
      }),
    )
    // A later round has started: this one's answers are stale.
    if (run !== asking) return
    const next: Record<string, number> = {}
    for (const [key, count] of answers) if (count !== null && count > 0) next[key] = count
    counts.value = next
  }

  const onVisible = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') void ask()
  }

  onMounted(() => {
    void ask()
    timer = setInterval(() => void ask(), interval)
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible)
  })
  watch(() => unref(products).map((p) => `${p.key}=${p.url}`).join(' '), () => void ask())

  return counts
}
