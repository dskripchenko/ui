import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UidToast from './UidToast.vue'
import { useToast } from '../../composables/useToast.js'

describe('UidToast', () => {
  it('рендерит message', () => {
    const wrapper = mount(UidToast, { props: { id: 1, message: 'Привет!' } })
    expect(wrapper.find('.uid-toast__message').text()).toBe('Привет!')
  })

  it('рендерит title при наличии', () => {
    const wrapper = mount(UidToast, { props: { id: 1, message: 'Текст', title: 'Заголовок' } })
    expect(wrapper.find('.uid-toast__title').text()).toBe('Заголовок')
  })

  it('не рендерит title без prop', () => {
    const wrapper = mount(UidToast, { props: { id: 1, message: 'Текст' } })
    expect(wrapper.find('.uid-toast__title').exists()).toBe(false)
  })

  it('применяет variant класс', () => {
    const wrapper = mount(UidToast, { props: { id: 1, message: 'Текст', variant: 'success' } })
    expect(wrapper.classes()).toContain('uid-toast--success')
  })

  it('эмитит dismiss с id при нажатии на кнопку', async () => {
    const wrapper = mount(UidToast, { props: { id: 42, message: 'Текст' } })
    await wrapper.find('.uid-toast__close').trigger('click')
    expect(wrapper.emitted('dismiss')?.[0]).toEqual([42])
  })
})

describe('useToast', () => {
  afterEach(() => {
    useToast().clear()
  })

  it('add добавляет toast', () => {
    const { add, toasts } = useToast()
    add('Сообщение')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('Сообщение')
  })

  it('dismiss удаляет toast по id', () => {
    const { add, dismiss, toasts } = useToast()
    const id = add('Сообщение')
    dismiss(id)
    expect(toasts.value).toHaveLength(0)
  })

  it('clear удаляет все toasts', () => {
    const { add, clear, toasts } = useToast()
    add('A')
    add('B')
    clear()
    expect(toasts.value).toHaveLength(0)
  })

  it('success устанавливает variant=success', () => {
    const { success, toasts } = useToast()
    success('Готово!')
    expect(toasts.value[0].variant).toBe('success')
  })

  it('error устанавливает variant=danger', () => {
    const { error, toasts } = useToast()
    error('Ошибка')
    expect(toasts.value[0].variant).toBe('danger')
  })

  it('add принимает объект с вариантом', () => {
    const { add, toasts } = useToast()
    add({ message: 'Тест', variant: 'warning', title: 'Заголовок' })
    expect(toasts.value[0].variant).toBe('warning')
    expect(toasts.value[0].title).toBe('Заголовок')
  })

  it('add возвращает уникальный id', () => {
    const { add } = useToast()
    const id1 = add('A')
    const id2 = add('B')
    expect(id1).not.toBe(id2)
  })
})
