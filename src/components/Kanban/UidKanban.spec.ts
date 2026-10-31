import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { computed, defineComponent, h, nextTick } from 'vue'
import { provideLocale } from '../../composables/useLocale.js'
import UidKanban from './UidKanban.vue'
import UidBoard from '../Board/UidBoard.vue'
import UidInput from '../Input/UidInput.vue'

const SOURCE = `# Release
tags: payments=info

## Backlog
- Instant payments #payments {who: Anna, due: 2026-11-15}
- Refunds !high
  Partial refunds.

## In progress {wip: 1}
- [ACME-1](https://example.com/ACME-1) Antifraud

## Done {done}
- Webhooks {due: 2026-01-01}
`

function dataTransfer(): DataTransfer {
  const store: Record<string, string> = {}
  return {
    setData: (k: string, v: string) => { store[k] = v },
    getData: (k: string) => store[k] ?? '',
    effectAllowed: 'all',
    dropEffect: 'none',
  } as unknown as DataTransfer
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('UidKanban', () => {
  it('renders the title, columns and cards from the markup', () => {
    const wrapper = mount(UidKanban, { props: { source: SOURCE, today: '2026-12-01' } })
    expect(wrapper.find('.uid-kanban__title').text()).toBe('Release')
    const columns = wrapper.findAll('.uid-board__column')
    expect(columns.map((c) => c.find('.uid-kanban__column-title').text())).toEqual(['Backlog', 'In progress', 'Done'])
    expect(columns[1]!.find('.uid-kanban__count').text()).toBe('1/1')
    expect(columns[0]!.findAll('.uid-kanban__card')).toHaveLength(2)
    expect(wrapper.find('.uid-kanban__card-title a').attributes('href')).toBe('https://example.com/ACME-1')
    expect(wrapper.find('.uid-kanban__priority--high').exists()).toBe(true)
    expect(wrapper.find('.uid-kanban__avatar').text()).toBe('A')
    // Overdue only outside a done column.
    const dues = wrapper.findAll('.uid-kanban__due')
    expect(dues.map((d) => d.classes().includes('uid-kanban__due--overdue'))).toEqual([true, false])
    expect(wrapper.find('.uid-kanban__card--done').exists()).toBe(true)
  })

  it('filters by tag', async () => {
    const wrapper = mount(UidKanban, { props: { source: SOURCE } })
    await wrapper.find('.uid-kanban__filter').trigger('click')
    expect(wrapper.findAll('.uid-kanban__card')).toHaveLength(1)
  })

  it('a move emits change with the rewritten source', async () => {
    const wrapper = mount(UidKanban, { props: { source: SOURCE, editable: true } })
    const dt = dataTransfer()
    const card = wrapper.findAll('.uid-board__card')[0]!
    await card.trigger('dragstart', { dataTransfer: dt })
    const done = wrapper.findAll('.uid-board__column')[2]!
    await done.trigger('dragover', { dataTransfer: dt })
    await done.trigger('drop', { dataTransfer: dt })
    const next = wrapper.emitted('change')?.[0]?.[0] as string
    expect(next).toBe(SOURCE.replace('- Instant payments #payments {who: Anna, due: 2026-11-15}\n', '').replace('- Webhooks {due: 2026-01-01}\n', '- Webhooks {due: 2026-01-01}\n- Instant payments #payments {who: Anna, due: 2026-11-15}\n'))
  })

  it('locked hides editing and ignores moves', async () => {
    const wrapper = mount(UidKanban, { props: { source: SOURCE, editable: true, locked: true, lockable: true } })
    expect(wrapper.find('.uid-kanban__add').exists()).toBe(false)
    expect(wrapper.find('.uid-kanban__tabs').exists()).toBe(false)
    expect(wrapper.findComponent(UidBoard).props('readonly')).toBe(true)
    wrapper.findComponent(UidBoard).vm.$emit('move', { card: { key: 'card-0' }, from: 'col-0', to: 'col-2', beforeKey: null, afterKey: null, lane: null })
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.find('.uid-kanban__lock').trigger('click')
    expect(wrapper.emitted('lock')?.[0]).toEqual([false])
  })

  it('opens a card and emits open', async () => {
    const wrapper = mount(UidKanban, { props: { source: SOURCE } })
    await wrapper.findAll('.uid-board__card')[1]!.trigger('click')
    expect(wrapper.emitted('open')?.[0]).toEqual([{ id: 'card-1', title: 'Refunds', column: 'Backlog' }])
    await nextTick()
    expect(document.body.querySelector('.uid-kanban__details')?.textContent).toContain('Partial refunds.')
  })

  it('adds a card from the form', async () => {
    const wrapper = mount(UidKanban, { props: { source: SOURCE, editable: true } })
    await wrapper.findAll('.uid-kanban__add')[1]!.trigger('click')
    await nextTick()
    const input = wrapper.findAllComponents(UidInput)[0]!
    input.vm.$emit('update:modelValue', 'Rate limits')
    await nextTick()
    document.body.querySelector('form.uid-kanban__form')!.dispatchEvent(new Event('submit'))
    await nextTick()
    const next = wrapper.emitted('change')?.[0]?.[0] as string
    expect(next).toContain('- [ACME-1](https://example.com/ACME-1) Antifraud\n- Rate limits\n')
  })

  it('edits the source in the source tab', async () => {
    const wrapper = mount(UidKanban, { props: { source: SOURCE, editable: true } })
    await wrapper.findAll('.uid-kanban__tab')[1]!.trigger('click')
    const code = wrapper.find('textarea.uid-kanban__code')
    expect((code.element as HTMLTextAreaElement).value).toBe(SOURCE)
    await code.setValue('## A\nnot a card')
    expect(wrapper.find('.uid-kanban__problems').text()).toContain('2')
  })

  it('takes captions from a partial locale, the rest from English', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        provideLocale(computed(() => ({ kanban: { source: 'Markup' } })))
        return () => h(UidKanban, { source: SOURCE, editable: true, lockable: true })
      },
    }))
    const tabs = wrapper.findAll('.uid-kanban__tab')
    expect(tabs.map((t) => t.text())).toEqual(['Board', 'Markup'])
    expect(wrapper.find('.uid-kanban__lock').attributes('aria-label')).toBe('Lock changes')
  })
})
