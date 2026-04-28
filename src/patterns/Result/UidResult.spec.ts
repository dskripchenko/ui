import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidResult from './UidResult.vue'

describe('UidResult', () => {
  it('рендерит title и description', () => {
    const wrapper = mount(UidResult, {
      props: { title: 'Готово', description: 'Операция завершена' },
    })
    expect(wrapper.find('.uid-pattern-result__title').text()).toBe('Готово')
    expect(wrapper.find('.uid-pattern-result__description').text()).toBe('Операция завершена')
  })

  it('применяет status-класс по умолчанию success', () => {
    const wrapper = mount(UidResult)
    expect(wrapper.classes()).toContain('uid-pattern-result--success')
  })

  it('применяет другие статусы', () => {
    expect(mount(UidResult, { props: { status: 'info' } }).classes())
      .toContain('uid-pattern-result--info')
    expect(mount(UidResult, { props: { status: 'warning' } }).classes())
      .toContain('uid-pattern-result--warning')
    expect(mount(UidResult, { props: { status: 'error' } }).classes())
      .toContain('uid-pattern-result--error')
  })

  it('компактный вариант', () => {
    const wrapper = mount(UidResult, { props: { compact: true } })
    expect(wrapper.classes()).toContain('uid-pattern-result--compact')
  })

  it('рендерит default-слот в content', () => {
    const wrapper = mount(UidResult, {
      slots: { default: '<div class="extra">extra</div>' },
    })
    expect(wrapper.find('.uid-pattern-result__content .extra').exists()).toBe(true)
  })

  it('рендерит actions-слот', () => {
    const wrapper = mount(UidResult, {
      slots: { actions: '<button class="btn">OK</button>' },
    })
    expect(wrapper.find('.uid-pattern-result__actions .btn').exists()).toBe(true)
  })

  it('кастомный icon-слот', () => {
    const wrapper = mount(UidResult, {
      slots: { icon: '<span class="my-icon" />' },
    })
    expect(wrapper.find('.my-icon').exists()).toBe(true)
  })

  it('не рендерит description если не передано', () => {
    const wrapper = mount(UidResult, { props: { title: 'X' } })
    expect(wrapper.find('.uid-pattern-result__description').exists()).toBe(false)
  })

  it('не рендерит content если default-слот пустой', () => {
    const wrapper = mount(UidResult, { props: { title: 'X' } })
    expect(wrapper.find('.uid-pattern-result__content').exists()).toBe(false)
  })

  it('role=status для a11y', () => {
    const wrapper = mount(UidResult)
    expect(wrapper.attributes('role')).toBe('status')
  })
})
