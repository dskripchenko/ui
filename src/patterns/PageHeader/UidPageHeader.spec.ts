import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidPageHeader from './UidPageHeader.vue'

describe('UidPageHeader', () => {
  it('рендерит title из prop', () => {
    const wrapper = mount(UidPageHeader, { props: { title: 'Проекты' } })
    expect(wrapper.find('.uid-pattern-page-header__title').text()).toBe('Проекты')
  })

  it('рендерит description из prop', () => {
    const wrapper = mount(UidPageHeader, {
      props: { title: 'Проекты', description: 'Список всех проектов' },
    })
    expect(wrapper.find('.uid-pattern-page-header__description').text()).toBe('Список всех проектов')
  })

  it('не рендерит description без prop', () => {
    const wrapper = mount(UidPageHeader, { props: { title: 'Проекты' } })
    expect(wrapper.find('.uid-pattern-page-header__description').exists()).toBe(false)
  })

  it('рендерит back кнопку при back=true', () => {
    const wrapper = mount(UidPageHeader, { props: { back: true } })
    expect(wrapper.find('.uid-pattern-page-header__back').exists()).toBe(true)
  })

  it('не рендерит back кнопку по умолчанию', () => {
    const wrapper = mount(UidPageHeader, { props: { title: 'Страница' } })
    expect(wrapper.find('.uid-pattern-page-header__back').exists()).toBe(false)
  })

  it('эмитит back при клике', async () => {
    const wrapper = mount(UidPageHeader, { props: { back: true } })
    await wrapper.find('.uid-pattern-page-header__back').trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('рендерит breadcrumb-слот', () => {
    const wrapper = mount(UidPageHeader, {
      slots: { breadcrumb: '<nav class="crumb">Путь</nav>' },
    })
    expect(wrapper.find('.uid-pattern-page-header__breadcrumb').exists()).toBe(true)
  })

  it('рендерит actions-слот', () => {
    const wrapper = mount(UidPageHeader, {
      slots: { actions: '<button class="action">Создать</button>' },
    })
    expect(wrapper.find('.uid-pattern-page-header__actions').exists()).toBe(true)
  })

  it('рендерит tabs-слот', () => {
    const wrapper = mount(UidPageHeader, {
      slots: { tabs: '<div class="tabs">Вкладки</div>' },
    })
    expect(wrapper.find('.uid-pattern-page-header__tabs').exists()).toBe(true)
  })
})
