import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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

  it('tells the host what is typed, and leaves filtering to it with filter=false', async () => {
    const commands = [
      { id: 'a', label: 'Alpha', action: () => {} },
      { id: 'b', label: 'Beta', action: () => {} },
    ]
    const wrapper = mount(UidCommand, {
      props: { modelValue: true, commands, filter: false, 'onUpdate:query': (q: string) => wrapper.setProps({ query: q }) },
      attachTo: document.body,
    })
    await nextTick()
    const input = document.body.querySelector('input') as HTMLInputElement
    input.value = 'zz'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    expect(wrapper.emitted('update:query')?.at(-1)).toEqual(['zz'])
    // Not filtered: both stay, as the host gave them.
    expect(document.body.textContent).toContain('Alpha')
    expect(document.body.textContent).toContain('Beta')
    wrapper.unmount()
  })

  it('draws a row by the item slot and keeps it a button of the list', async () => {
    wrapper = mount(UidCommand, {
      props: { commands, modelValue: true },
      slots: {
        item: `<template #item="{ command, active }"><b class="row">{{ command.label }}{{ active ? ' *' : '' }}</b></template>`,
        header: '<span class="facets">facets</span>',
        footer: '<span class="keys">keys</span>',
      },
      attachTo: document.body,
    })
    await nextTick()

    const rows = qq('.uid-command__item .row').map((el) => el.textContent)
    expect(rows).toEqual(['Создать проект *', 'Открыть настройки', 'Выйти из аккаунта'])
    expect(qq('.uid-command__item')[0]?.getAttribute('role')).toBe('option')
    expect(q('.uid-command__header .facets')).not.toBeNull()
    expect(q('.uid-command__footer .keys')).not.toBeNull()

    q<HTMLButtonElement>('.uid-command__item')?.click()
    expect(commands[0]?.action).toHaveBeenCalled()
  })
})

