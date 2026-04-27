import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidEmptyState from './UidEmptyState.vue'

describe('UidEmptyState', () => {
  it('рендерит title из prop', () => {
    const wrapper = mount(UidEmptyState, { props: { title: 'Нет проектов' } })
    expect(wrapper.find('.uid-pattern-empty-state__title').text()).toBe('Нет проектов')
  })

  it('рендерит title по умолчанию', () => {
    const wrapper = mount(UidEmptyState)
    expect(wrapper.find('.uid-pattern-empty-state__title').text()).toBe('Ничего не найдено')
  })

  it('рендерит description', () => {
    const wrapper = mount(UidEmptyState, {
      props: { description: 'Создайте первый проект' },
    })
    expect(wrapper.find('.uid-pattern-empty-state__description').text()).toBe('Создайте первый проект')
  })

  it('не рендерит description без prop', () => {
    const wrapper = mount(UidEmptyState, { props: { title: 'Пусто' } })
    expect(wrapper.find('.uid-pattern-empty-state__description').exists()).toBe(false)
  })

  it('рендерит illustration-слот', () => {
    const wrapper = mount(UidEmptyState, {
      slots: { illustration: '<svg class="custom-icon" />' },
    })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('рендерит иконку по умолчанию', () => {
    const wrapper = mount(UidEmptyState)
    expect(wrapper.find('.uid-pattern-empty-state__illustration').exists()).toBe(true)
  })

  it('рендерит actions-слот', () => {
    const wrapper = mount(UidEmptyState, {
      slots: { actions: '<button class="cta">Создать</button>' },
    })
    expect(wrapper.find('.uid-pattern-empty-state__actions').exists()).toBe(true)
    expect(wrapper.find('.cta').exists()).toBe(true)
  })
})
