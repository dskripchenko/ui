import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidMenu from './UidMenu.vue'
import UidMenuItem from './UidMenuItem.vue'
import UidMenuSeparator from './UidMenuSeparator.vue'

const buildMenu = () => mount(UidMenu, {
  slots: {
    trigger: '<button>Меню</button>',
    default: `
      <UidMenuItem>Редактировать</UidMenuItem>
      <UidMenuItem>Дублировать</UidMenuItem>
      <UidMenuSeparator />
      <UidMenuItem variant="danger">Удалить</UidMenuItem>
    `,
  },
  global: { components: { UidMenuItem, UidMenuSeparator } },
  attachTo: document.body,
})

describe('UidMenu', () => {
  it('не показывает меню по умолчанию', () => {
    const wrapper = buildMenu()
    expect(document.querySelector('.uid-menu')).toBeNull()
    wrapper.unmount()
  })

  it('показывает меню при клике на триггер', async () => {
    const wrapper = buildMenu()
    await wrapper.find('.uid-menu-trigger').trigger('click')
    await flushPromises()
    expect(document.querySelector('.uid-menu')).not.toBeNull()
    wrapper.unmount()
  })

  it('закрывает меню при повторном клике', async () => {
    const wrapper = buildMenu()
    await wrapper.find('.uid-menu-trigger').trigger('click')
    await flushPromises()
    await wrapper.find('.uid-menu-trigger').trigger('click')
    expect(document.querySelector('.uid-menu')).toBeNull()
    wrapper.unmount()
  })

  it('role="menu" присутствует', async () => {
    const wrapper = buildMenu()
    await wrapper.find('.uid-menu-trigger').trigger('click')
    await flushPromises()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('закрывается по Escape', async () => {
    const wrapper = buildMenu()
    await wrapper.find('.uid-menu-trigger').trigger('click')
    await flushPromises()
    document.querySelector<HTMLElement>('.uid-menu')?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await flushPromises()
    expect(document.querySelector('.uid-menu')).toBeNull()
    wrapper.unmount()
  })
})

describe('UidMenuItem', () => {
  it('рендерит slot-контент', () => {
    const wrapper = mount(UidMenuItem, { slots: { default: 'Редактировать' } })
    expect(wrapper.text()).toBe('Редактировать')
  })

  it('role="menuitem" присутствует', () => {
    const wrapper = mount(UidMenuItem, { slots: { default: 'Пункт' } })
    expect(wrapper.attributes('role')).toBe('menuitem')
  })

  it('эмитит click', async () => {
    const wrapper = mount(UidMenuItem, { slots: { default: 'Пункт' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('применяет variant класс', () => {
    const wrapper = mount(UidMenuItem, {
      props: { variant: 'danger' },
      slots: { default: 'Удалить' },
    })
    expect(wrapper.classes()).toContain('uid-menu-item--danger')
  })

  it('disabled атрибут применяется', () => {
    const wrapper = mount(UidMenuItem, {
      props: { disabled: true },
      slots: { default: 'Пункт' },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})

describe('UidMenuSeparator', () => {
  it('рендерит разделитель', () => {
    const wrapper = mount(UidMenuSeparator)
    expect(wrapper.find('.uid-menu-separator').exists()).toBe(true)
    expect(wrapper.attributes('role')).toBe('separator')
  })
})
