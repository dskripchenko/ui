import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, type Component } from 'vue'
import { provideLocale } from '../composables/useLocale.js'
import { en } from '../locales/en.js'
import { ru } from '../locales/ru.js'
import UidTable from '../components/Table/UidTable.vue'
import UidEmptyState from '../patterns/EmptyState/UidEmptyState.vue'
import UidErrorState from '../patterns/ErrorState/UidErrorState.vue'
import UidLoadMore from '../components/Pagination/UidLoadMore.vue'
import UidCommand from '../components/Command/UidCommand.vue'
import { getMessage, setValidationLocale } from '../utils/validation/messages.js'

function inEnglish(component: Component, props: Record<string, unknown> = {}) {
  return mount(defineComponent({
    setup() {
      provideLocale(computed(() => en))
      return () => h(component, props)
    },
  }))
}

describe('captions come from the locale bag', () => {
  it('ru and en bags have the same keys', () => {
    const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === 'object' && !Array.isArray(v) ? keys(v).map((s) => `${k}.${s}`) : [k])
    expect(keys(en).sort()).toEqual(keys(ru).sort())
  })

  it('UidTable empty text', () => {
    expect(inEnglish(UidTable, { columns: [{ key: 'a', label: 'A' }], data: [] }).text()).toContain('No data')
    expect(mount(UidTable, { props: { columns: [{ key: 'a', label: 'A' }], data: [] } }).text()).toContain('Нет данных')
  })

  it('a prop still overrides the locale', () => {
    expect(inEnglish(UidTable, { columns: [{ key: 'a', label: 'A' }], data: [], emptyText: 'Empty!' }).text()).toContain('Empty!')
  })

  it('UidEmptyState and UidErrorState', () => {
    expect(inEnglish(UidEmptyState).text()).toContain('Nothing found')
    expect(inEnglish(UidErrorState, { code: '404' }).text()).toContain('Page not found')
    expect(inEnglish(UidErrorState).text()).toContain('Something went wrong')
  })

  it('UidLoadMore', () => {
    expect(inEnglish(UidLoadMore).text()).toContain('Show more')
  })

  it('UidCommand placeholder', () => {
    const w = inEnglish(UidCommand, { modelValue: true, commands: [] })
    expect(document.body.innerHTML).toContain('Search commands...')
    w.unmount()
  })

  it('validation messages follow the provided locale', () => {
    inEnglish(UidEmptyState)
    expect(getMessage('required', { label: 'Email' } as never)).toBe('The Email field is required')
    expect(getMessage('nope', {} as never)).toBe('Validation failed: nope')
    setValidationLocale(ru)
    expect(getMessage('email', {} as never)).toBe('Введите корректный email')
  })
})
