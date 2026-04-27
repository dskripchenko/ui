import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UidCommand from './UidCommand.vue'
import type { CommandItem } from './UidCommand.vue'

const commands: CommandItem[] = [
  { id: '1', label: 'Создать проект', description: 'Новый проект', group: 'Проекты', action: vi.fn() },
  { id: '2', label: 'Открыть настройки', shortcut: ['⌘', 'K'], group: 'Система', action: vi.fn() },
  { id: '3', label: 'Выйти из аккаунта', group: 'Система', action: vi.fn() },
]

function q<T extends Element = Element>(sel: string) {
  return document.body.querySelector<T>(sel)
}

function qq(sel: string) {
  return Array.from(document.body.querySelectorAll(sel))
}

let wrapper: ReturnType<typeof mount>

afterEach(() => {
  wrapper?.unmount()
})

describe('UidCommand', () => {
  it('не рендерит панель когда closed', () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: false },
      attachTo: document.body,
    })
    expect(q('.uid-command')).toBeNull()
  })

  it('рендерит панель когда open=true', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    expect(q('.uid-command')).not.toBeNull()
  })

  it('рендерит все команды', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    expect(qq('.uid-command__item')).toHaveLength(3)
  })

  it('фильтрует команды по запросу', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    const input = q<HTMLInputElement>('.uid-command__input')!
    input.value = 'настройки'
    input.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    expect(qq('.uid-command__item')).toHaveLength(1)
  })

  it('показывает emptyText если ничего не найдено', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true, emptyText: 'Не найдено' },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    const input = q<HTMLInputElement>('.uid-command__input')!
    input.value = 'zzzzz'
    input.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    expect(q('.uid-command__empty')?.textContent?.trim()).toBe('Не найдено')
  })

  it('рендерит group labels', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    const labels = qq('.uid-command__group-label').map(el => el.textContent?.trim())
    expect(labels).toContain('Проекты')
    expect(labels).toContain('Система')
  })

  it('рендерит shortcut keys', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    expect(qq('.uid-command__kbd').length).toBeGreaterThan(0)
  })

  it('клик по команде вызывает action и закрывает', async () => {
    const action = vi.fn()
    const cmds: CommandItem[] = [{ id: '1', label: 'Тест', action }]
    wrapper = mount(UidCommand, {
      props: { commands: cmds, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    q<HTMLButtonElement>('.uid-command__item')!.click()
    await wrapper.vm.$nextTick()
    expect(action).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('Enter на активной команде вызывает action', async () => {
    const action = vi.fn()
    const cmds: CommandItem[] = [{ id: '1', label: 'Тест', action }]
    wrapper = mount(UidCommand, {
      props: { commands: cmds, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    const panel = q('.uid-command')!
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(action).toHaveBeenCalledOnce()
  })

  it('ArrowDown двигает активный элемент вниз', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    const panel = q('.uid-command')!
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await wrapper.vm.$nextTick()
    const items = qq('.uid-command__item')
    expect(items[1].classList.contains('uid-command__item--active')).toBe(true)
  })

  it('клик по overlay закрывает панель', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    const overlay = q<HTMLElement>('.uid-command-overlay')!
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
