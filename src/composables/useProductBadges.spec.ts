import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useProductBadges, type ProductAddress } from './useProductBadges.js'

function host(products: ProductAddress[], fetchFn: typeof fetch) {
  let counts: ReturnType<typeof useProductBadges> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        counts = useProductBadges(ref(products), { current: 'platform', fetch: fetchFn, interval: 1000 })
        return () => h('div')
      },
    }),
  )
  return { wrapper, counts: () => counts!.value }
}

const answer = (body: unknown, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response)

describe('useProductBadges', () => {
  afterEach(() => vi.useRealTimers())

  it('asks every other product for its count with the session, not the current one', async () => {
    const fetchFn = vi.fn((url: string) =>
      url.startsWith('https://messenger.') ? answer({ success: true, payload: { count: 4 } }) : answer({ success: true, payload: { count: 0 } }),
    ) as unknown as typeof fetch
    const { counts } = host(
      [
        { key: 'platform', url: 'https://platform.example.test' },
        { key: 'messenger', url: 'https://messenger.example.test' },
        { key: 'tracker', url: 'https://tracker.example.test/' },
      ],
      fetchFn,
    )
    await flushPromises()
    expect(counts()).toEqual({ messenger: 4 })
    const calls = (fetchFn as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls
    expect(calls.map((c) => c[0])).toEqual(['https://messenger.example.test/api/v1/badge/count', 'https://tracker.example.test/api/v1/badge/count'])
    expect(calls[0]![1].credentials).toBe('include')
  })

  it('gives no count for a product that is down, signed out or answers something else', async () => {
    const fetchFn = vi.fn((url: string) =>
      url.startsWith('https://messenger.') ? Promise.reject(new Error('down')) : url.startsWith('https://tracker.') ? answer({}, false) : answer({ success: true, payload: { count: 'many' } }),
    ) as unknown as typeof fetch
    const { counts } = host(
      [
        { key: 'messenger', url: 'https://messenger.example.test' },
        { key: 'tracker', url: 'https://tracker.example.test' },
        { key: 'portal', url: 'https://portal.example.test' },
      ],
      fetchFn,
    )
    await flushPromises()
    expect(counts()).toEqual({})
  })

  it('asks again on its interval', async () => {
    vi.useFakeTimers()
    let n = 1
    const fetchFn = vi.fn(() => answer({ success: true, payload: { count: n++ } })) as unknown as typeof fetch
    const { counts } = host([{ key: 'messenger', url: 'https://messenger.example.test' }], fetchFn)
    await flushPromises()
    expect(counts()).toEqual({ messenger: 1 })
    vi.advanceTimersByTime(1000)
    await flushPromises()
    expect(counts()).toEqual({ messenger: 2 })
  })
})
