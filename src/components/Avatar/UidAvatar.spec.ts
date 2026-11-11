import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Bot } from 'lucide-vue-next'
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

  it('считает дефис границей слов в инициалах', () => {
    const wrapper = mount(UidAvatar, { props: { name: 'Anne-Marie' } })
    expect(wrapper.find('.uid-avatar__initials').text()).toBe('AM')
  })

  it('берёт заливку из color вместо цвета по имени', () => {
    const wrapper = mount(UidAvatar, { props: { name: 'Build bot', color: '#52525b' } })
    expect(wrapper.find('.uid-avatar__initials').attributes('style')).toContain('background: rgb(82, 82, 91)')
  })

  it('показывает иконку вместо инициалов и сохраняет имя как подпись', () => {
    const wrapper = mount(UidAvatar, { props: { name: 'Build bot', icon: Bot, shape: 'square' } })
    expect(wrapper.find('.uid-avatar__initials svg').exists()).toBe(true)
    expect(wrapper.find('.uid-avatar__initials').text()).toBe('')
    expect(wrapper.attributes('aria-label')).toBe('Build bot')
    expect(wrapper.classes()).toContain('uid-avatar--square')
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

  it('присутствие — метка в углу и в подписи', () => {
    const wrapper = mount(UidAvatar, { props: { name: 'Мария Соколова', presence: 'dnd' } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Мария Соколова, не беспокоить')
    expect(wrapper.find('.uid-avatar-presence__dot--dnd').exists()).toBe(true)
    expect(wrapper.find('.uid-avatar').attributes('aria-hidden')).toBe('true')
  })

  it('без присутствия — прежняя разметка', () => {
    const wrapper = mount(UidAvatar, { props: { name: 'Боб' } })
    expect(wrapper.classes()).toContain('uid-avatar')
    expect(wrapper.find('.uid-avatar-presence__dot').exists()).toBe(false)
  })
})
