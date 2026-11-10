import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidReactions from './UidReactions.vue'

const reactions = [
  { emoji: '👍', count: 3, mine: true, who: 'вы, Боб и Илья Петров' },
  { emoji: '🎉', count: 1, mine: false, who: 'Мария Соколова' },
]

describe('UidReactions', () => {
  it('ничего не рисует без реакций', () => {
    expect(mount(UidReactions, { props: { reactions: [] } }).html()).not.toContain('uid-reactions__pill')
  })

  it('пилюли с числом, своя нажата, подпись — эмодзи, число и кто', () => {
    const wrapper = mount(UidReactions, { props: { reactions } })
    const pills = wrapper.findAll('.uid-reactions__pill')
    expect(pills).toHaveLength(2)
    expect(pills[0].attributes('aria-pressed')).toBe('true')
    expect(pills[1].attributes('aria-pressed')).toBe('false')
    expect(pills[0].attributes('aria-label')).toBe('👍 3: вы, Боб и Илья Петров')
    expect(pills[0].classes()).toContain('uid-reactions__pill--mine')
  })

  it('нажатие — toggle с эмодзи, «+» — add с кнопкой', async () => {
    const wrapper = mount(UidReactions, { props: { reactions } })
    await wrapper.findAll('.uid-reactions__pill')[1].trigger('click')
    await wrapper.find('.uid-reactions__add').trigger('click')
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['🎉'])
    expect(wrapper.emitted('add')?.[0]?.[0]).toBeInstanceOf(HTMLElement)
  })

  it('на пределе «+» выключен и не открывает выбор', async () => {
    const wrapper = mount(UidReactions, { props: { reactions, max: 2 } })
    const add = wrapper.find('.uid-reactions__add')
    expect(add.attributes('aria-disabled')).toBe('true')
    expect(add.attributes('aria-label')).toBe('Не больше 2 разных реакций')
    await add.trigger('click')
    expect(wrapper.emitted('add')).toBeUndefined()
  })

  it('только чтение — без «+» и без нажатий', () => {
    const wrapper = mount(UidReactions, { props: { reactions, readonly: true } })
    expect(wrapper.find('.uid-reactions__add').exists()).toBe(false)
    expect(wrapper.find('.uid-reactions__pill').attributes('disabled')).toBeDefined()
  })
})
