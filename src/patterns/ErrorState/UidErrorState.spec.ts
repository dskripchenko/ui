import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidErrorState from './UidErrorState.vue'

describe('UidErrorState', () => {
  it('рендерит preset для 404', () => {
    const wrapper = mount(UidErrorState, { props: { code: '404' } })
    expect(wrapper.find('.uid-pattern-error-state__title').text()).toBe('Страница не найдена')
    expect(wrapper.find('.uid-pattern-error-state__code').text()).toBe('404')
  })

  it('рендерит preset для 500', () => {
    const wrapper = mount(UidErrorState, { props: { code: '500' } })
    expect(wrapper.find('.uid-pattern-error-state__title').text()).toBe('Ошибка сервера')
  })

  it('рендерит preset для network', () => {
    const wrapper = mount(UidErrorState, { props: { code: 'network' } })
    expect(wrapper.find('.uid-pattern-error-state__title').text()).toBe('Нет соединения')
  })

  it('title из prop переопределяет preset', () => {
    const wrapper = mount(UidErrorState, {
      props: { code: '404', title: 'Не найдено!' },
    })
    expect(wrapper.find('.uid-pattern-error-state__title').text()).toBe('Не найдено!')
  })

  it('рендерит title по умолчанию без code', () => {
    const wrapper = mount(UidErrorState)
    expect(wrapper.find('.uid-pattern-error-state__title').text()).toBe('Что-то пошло не так')
  })

  it('не рендерит code блок без prop', () => {
    const wrapper = mount(UidErrorState)
    expect(wrapper.find('.uid-pattern-error-state__code').exists()).toBe(false)
  })

  it('рендерит actions-слот', () => {
    const wrapper = mount(UidErrorState, {
      slots: { actions: '<button class="retry">Повторить</button>' },
    })
    expect(wrapper.find('.retry').exists()).toBe(true)
  })

  it('рендерит description', () => {
    const wrapper = mount(UidErrorState, {
      props: { description: 'Кастомное описание ошибки' },
    })
    expect(wrapper.find('.uid-pattern-error-state__description').text()).toBe('Кастомное описание ошибки')
  })
})
