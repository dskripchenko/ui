import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidCard from './UidCard.vue'

describe('UidCard', () => {
  it('рендерит slot-контент', () => {
    const wrapper = mount(UidCard, { slots: { default: '<p class="body">Текст</p>' } })
    expect(wrapper.find('.body').exists()).toBe(true)
  })

  it('применяет padding класс', () => {
    const wrapper = mount(UidCard, { props: { padding: 'lg' } })
    expect(wrapper.classes()).toContain('uid-card--pad-lg')
  })

  it('применяет clickable класс', () => {
    const wrapper = mount(UidCard, { props: { clickable: true } })
    expect(wrapper.classes()).toContain('uid-card--clickable')
  })

  it('рендерит header-слот', () => {
    const wrapper = mount(UidCard, {
      slots: { header: '<h2 class="header">Заголовок</h2>', default: 'body' },
    })
    expect(wrapper.find('.uid-card__header').exists()).toBe(true)
  })

  it('не рендерит header без слота', () => {
    const wrapper = mount(UidCard, { slots: { default: 'body' } })
    expect(wrapper.find('.uid-card__header').exists()).toBe(false)
  })

  it('рендерит footer-слот', () => {
    const wrapper = mount(UidCard, {
      slots: { footer: '<button>OK</button>', default: 'body' },
    })
    expect(wrapper.find('.uid-card__footer').exists()).toBe(true)
  })

  it('рендерит media-слот', () => {
    const wrapper = mount(UidCard, {
      slots: { media: '<img class="cover" src="" />', default: 'body' },
    })
    expect(wrapper.find('.uid-card__media').exists()).toBe(true)
  })
})
