import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import UidMessageFeed from './UidMessageFeed.vue'

interface Note {
  id: number
  author: string
  at: number
}

type Observed = { callback: ResizeObserverCallback; targets: Set<Element> }
const observers: Observed[] = []

beforeEach(() => {
  observers.length = 0
  globalThis.ResizeObserver = class {
    private readonly entry: Observed
    constructor(callback: ResizeObserverCallback) {
      this.entry = { callback, targets: new Set() }
      observers.push(this.entry)
    }
    observe(target: Element) { this.entry.targets.add(target) }
    unobserve(target: Element) { this.entry.targets.delete(target) }
    disconnect() { this.entry.targets.clear() }
  } as unknown as typeof ResizeObserver
})

afterEach(() => {
  vi.useRealTimers()
})

const day = (d: number, h = 10) => new Date(2026, 0, d, h).getTime()

function notes(count: number, at: (i: number) => number = i => day(5, 9) + i * 60_000): Note[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, author: i % 4 < 2 ? 'a' : 'b', at: at(i) }))
}

const key = (n: unknown) => (n as Note).id

function feed(props: Record<string, unknown>) {
  return mount(UidMessageFeed, {
    props: { itemKey: key, items: [], ...props },
    slots: {
      item: ({ item, grouped }: { item: unknown; grouped: boolean }) => h('div', { class: grouped ? 'note grouped' : 'note' }, String((item as Note).id)),
    },
    attachTo: document.body,
  })
}

function last<T>(list: T[] | undefined): T | undefined {
  return list === undefined ? undefined : list[list.length - 1]
}

/** Reports the given height for every observed row, as a browser would after layout. */
function measure(height: (key: string) => number): void {
  for (const o of observers) {
    const entries = [...o.targets]
      .filter(t => (t as HTMLElement).dataset.key !== undefined)
      .map(t => ({ target: t, borderBoxSize: [{ blockSize: height((t as HTMLElement).dataset.key!) }] }))
    if (entries.length > 0) o.callback(entries as unknown as ResizeObserverEntry[], {} as ResizeObserver)
  }
}

describe('UidMessageFeed', () => {
  it('renders only the messages near the viewport', () => {
    const wrapper = feed({ items: notes(10_000) })
    const rendered = wrapper.findAll('.note').length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(200)
  })

  it('separates days and marks continued groups', () => {
    const items = [
      { id: 1, author: 'a', at: day(4) },
      { id: 2, author: 'a', at: day(5) },
      { id: 3, author: 'a', at: day(5, 11) },
      { id: 4, author: 'b', at: day(5, 12) },
    ]
    const wrapper = feed({ items, itemDate: (n: Note) => n.at, continues: (a: Note, b: Note) => a.author === b.author })
    expect(wrapper.findAll('.uid-message-feed__day')).toHaveLength(2)
    // The first message of a day starts a group even after the same author.
    expect(wrapper.findAll('.note').map(n => n.classes('grouped'))).toEqual([false, false, true, false])
  })

  it('puts the "new" divider before the marked message and breaks the group there', () => {
    const items = notes(4).map(n => ({ ...n, author: 'a' }))
    const wrapper = feed({ items, newMarker: 3, continues: () => true })
    const rows = wrapper.findAll('.uid-message-feed__row')
    expect(rows[2].find('.uid-message-feed__new').text()).toBe('Новые сообщения')
    expect(rows[3].find('.note').classes('grouped')).toBe(false)
  })

  it('formats the day as Today and Yesterday (the suite runs in Russian)', () => {
    const now = new Date()
    const items = [
      { id: 1, author: 'a', at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12).getTime() },
      { id: 2, author: 'a', at: now.getTime() },
    ]
    const wrapper = feed({ items, itemDate: (n: Note) => n.at })
    expect(wrapper.findAll('.uid-message-feed__day-label').map(d => d.text())).toEqual(['Вчера', 'Сегодня'])
  })

  it('keeps the reader on the same message when older ones are prepended', async () => {
    const wrapper = feed({ items: notes(50, i => day(5) + i) , hasMoreBefore: true })
    const el = wrapper.element as HTMLElement
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 400 })
    Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => 50 * 56 + 1_000 })
    el.scrollTop = 800
    el.dispatchEvent(new Event('scroll'))
    await flushPromises()

    const before = el.scrollTop
    const older = Array.from({ length: 20 }, (_, i) => ({ id: -20 + i, author: 'a', at: day(5) - 100 + i }))
    await wrapper.setProps({ items: [...older, ...notes(50, i => day(5) + i)] })
    await flushPromises()
    expect(el.scrollTop).toBe(before + 20 * 56)

    // Rows above the reader turn out taller once measured: the reader stays put.
    measure(key => (key.startsWith('i:-') ? 80 : 56))
    await flushPromises()
    const shifted = wrapper.findAll('.uid-message-feed__row').filter(r => r.attributes('data-key')!.startsWith('i:-')).length
    expect(el.scrollTop).toBe(before + 20 * 56 + shifted * 24)
  })

  it('asks for older messages near the top', async () => {
    const wrapper = feed({ items: notes(5), hasMoreBefore: true })
    await flushPromises()
    expect(wrapper.emitted('loadBefore')).toBeTruthy()
  })

  it('does not ask while already loading', async () => {
    const wrapper = feed({ items: notes(5), hasMoreBefore: true, loadingBefore: true })
    await flushPromises()
    expect(wrapper.emitted('loadBefore')).toBeFalsy()
  })

  it('reports leaving the bottom', async () => {
    const wrapper = feed({ items: notes(100) })
    const el = wrapper.element as HTMLElement
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 400 })
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 5_600 })
    el.scrollTop = 1_000
    el.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(last(wrapper.emitted('atBottom'))).toEqual([false])
    ;(wrapper.vm as unknown as { scrollToBottom: () => void }).scrollToBottom()
    expect(last(wrapper.emitted('atBottom'))).toEqual([true])
  })

  it('scrolls to a message by key', async () => {
    const wrapper = feed({ items: notes(100) })
    const el = wrapper.element as HTMLElement
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 400 })
    const found = (wrapper.vm as unknown as { scrollToKey: (k: number) => boolean }).scrollToKey(40)
    expect(found).toBe(true)
    // 39 rows of 56 above it, less the margin of a divider.
    expect(el.scrollTop).toBe(39 * 56 - 36)
    expect((wrapper.vm as unknown as { scrollToKey: (k: number) => boolean }).scrollToKey(1_000)).toBe(false)
  })

  it('shows the empty slot without messages', () => {
    const wrapper = mount(UidMessageFeed, {
      props: { items: [], itemKey: key },
      slots: { empty: '<p class="nothing">Nothing yet</p>', item: '<div />' },
    })
    expect(wrapper.find('.nothing').exists()).toBe(true)
  })

  it('is a feed with articles', () => {
    const wrapper = feed({ items: notes(3), label: 'Notes' })
    expect(wrapper.attributes('role')).toBe('feed')
    expect(wrapper.attributes('aria-label')).toBe('Notes')
    expect(wrapper.findAll('[role="article"]')).toHaveLength(3)
    expect(wrapper.find('[role="article"]').attributes('aria-setsize')).toBe('3')
  })
})
