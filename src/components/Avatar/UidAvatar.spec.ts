import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidAvatar from './UidAvatar.vue'

describe('UidAvatar', () => {
  it('рендерит img при наличии src', () => {
    const wrapper = mount(UidAvatar, { props: { src: '/avatar.jpg', alt: 'User' } })
    expect(wrapper.find('.uid-avatar__img').exists()).toBe(true)
    expect(wrapper.find('.uid-avatar__img').attributes('src')).toBe('/avatar.jpg')
  })

  it('показывает инициалы когда src отсутствует', () => {
    const wrapper = mount(UidAvatar, { props: { name: 'Иван Петров' } })
    expect(wrapper.find('.uid-avatar__initials').text()).toBe('ИП')
  })

  it('показывает первую букву для одного слова', () => {
    const wrapper = mount(UidAvatar, { props: { name: 'Иван' } })
    expect(wrapper.find('.uid-avatar__initials').text()).toBe('И')
  })

  it('показывает ? без name и src', () => {
    const wrapper = mount(UidAvatar)
    expect(wrapper.find('.uid-avatar__initials').text()).toBe('?')
  })

  it('применяет size класс', () => {
    const wrapper = mount(UidAvatar, { props: { size: 'lg' } })
    expect(wrapper.classes()).toContain('uid-avatar--lg')
  })

  it('применяет shape класс', () => {
    const wrapper = mount(UidAvatar, { props: { shape: 'square' } })
    expect(wrapper.classes()).toContain('uid-avatar--square')
  })

  it('показывает инициалы после ошибки загрузки img', async () => {
    const wrapper = mount(UidAvatar, { props: { src: '/bad.jpg', name: 'Test' } })
    await wrapper.find('.uid-avatar__img').trigger('error')
    expect(wrapper.find('.uid-avatar__initials').exists()).toBe(true)
  })

  it('role="img" присутствует', () => {
    const wrapper = mount(UidAvatar)
    expect(wrapper.attributes('role')).toBe('img')
  })
})
