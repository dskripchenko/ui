import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UidMenu from './UidMenu.vue'
import UidMenuItem from './UidMenuItem.vue'
import UidMenuSeparator from './UidMenuSeparator.vue'
import UidSubMenu from './UidSubMenu.vue'

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

describe('UidMenu: вложенный интерактив', () => {
  it('обёртка не становится кнопкой, когда в слоте уже кнопка', async () => {
    const wrapper = buildMenu()
    await flushPromises()

    const trigger = wrapper.find('.uid-menu-trigger')
    expect(trigger.attributes('role')).toBeUndefined()
    expect(trigger.attributes('tabindex')).toBeUndefined()

    const button = trigger.find('button')
    expect(button.attributes('aria-haspopup')).toBe('menu')
    expect(button.attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('обёртка остаётся кнопкой, когда в слоте не элемент управления', async () => {
    const wrapper = mount(UidMenu, {
      slots: { trigger: '<span>Меню</span>', default: '<UidMenuItem>Пункт</UidMenuItem>' },
      global: { components: { UidMenuItem } },
      attachTo: document.body,
    })
    await flushPromises()

    const trigger = wrapper.find('.uid-menu-trigger')
    expect(trigger.attributes('role')).toBe('button')
    expect(trigger.attributes('tabindex')).toBe('0')

    wrapper.unmount()
  })

  it('состояние раскрытия уезжает на кнопку слота', async () => {
    const wrapper = buildMenu()
    await flushPromises()
    await wrapper.find('.uid-menu-trigger').trigger('click')
    await flushPromises()

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })
})

describe('UidMenuSeparator', () => {
  it('рендерит разделитель', () => {
    const wrapper = mount(UidMenuSeparator)
    expect(wrapper.find('.uid-menu-separator').exists()).toBe(true)
    expect(wrapper.attributes('role')).toBe('separator')
  })
})

const buildNested = () => mount(UidMenu, {
  slots: {
    trigger: '<button>Меню</button>',
    default: `
      <UidMenuItem>Открыть</UidMenuItem>
      <UidSubMenu label="Экспорт">
        <UidMenuItem class="leaf-pdf">PDF</UidMenuItem>
        <UidMenuItem>DOCX</UidMenuItem>
        <UidSubMenu label="Ещё">
          <UidMenuItem class="leaf-odt">ODT</UidMenuItem>
        </UidSubMenu>
      </UidSubMenu>
      <UidSubMenu label="Поделиться">
        <UidMenuItem>Ссылка</UidMenuItem>
      </UidSubMenu>
      <UidMenuItem>Удалить</UidMenuItem>
    `,
  },
  global: { components: { UidMenuItem, UidSubMenu } },
  attachTo: document.body,
})

async function openRoot(wrapper: ReturnType<typeof buildNested>) {
  await wrapper.find('.uid-menu-trigger').trigger('click')
  await flushPromises()
}

const subTriggers = () => Array.from(document.querySelectorAll<HTMLElement>('.uid-submenu__trigger'))
const panels = () => document.querySelectorAll('.uid-submenu__panel')
const key = (el: Element | null, k: string) => el?.dispatchEvent(
  new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
)

describe('UidSubMenu', () => {
  it('триггер подменю — menuitem с aria-haspopup и aria-expanded', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    const trigger = subTriggers()[0]
    expect(trigger.getAttribute('role')).toBe('menuitem')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panels()).toHaveLength(0)
    wrapper.unmount()
  })

  it('открывается по клику и связывает aria-controls с панелью', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    subTriggers()[0].click()
    await flushPromises()
    const trigger = subTriggers()[0]
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const panel = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
    expect(panel?.getAttribute('role')).toBe('menu')
    wrapper.unmount()
  })

  it('стрелки корневого меню обходят только свой уровень', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    subTriggers()[0].click()
    await flushPromises()
    const root = document.querySelector<HTMLElement>('.uid-menu')!
    const rootItems = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]'))
      .filter((el) => el.parentElement?.closest('[role="menu"]') === root)
    expect(rootItems.map((el) => el.textContent?.trim())).toEqual(['Открыть', 'Экспорт', 'Поделиться', 'Удалить'])
    rootItems[1].focus()
    key(rootItems[1], 'ArrowDown')
    expect(document.activeElement).toBe(rootItems[2])
    wrapper.unmount()
  })

  it('ArrowRight открывает подменю и фокусирует первый пункт', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    const trigger = subTriggers()[0]
    trigger.focus()
    key(trigger, 'ArrowRight')
    await flushPromises()
    expect(panels()).toHaveLength(1)
    expect(document.activeElement?.textContent?.trim()).toBe('PDF')
    wrapper.unmount()
  })

  it('стрелки внутри подменю двигают фокус по его пунктам', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    key(subTriggers()[0], 'ArrowRight')
    await flushPromises()
    key(document.activeElement, 'ArrowDown')
    expect(document.activeElement?.textContent?.trim()).toBe('DOCX')
    key(document.activeElement, 'End')
    expect(document.activeElement?.classList.contains('uid-submenu__trigger')).toBe(true)
    wrapper.unmount()
  })

  it('ArrowLeft закрывает подменю и возвращает фокус на триггер, корень остаётся открытым', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    const trigger = subTriggers()[0]
    key(trigger, 'ArrowRight')
    await flushPromises()
    key(document.activeElement, 'ArrowLeft')
    await flushPromises()
    expect(panels()).toHaveLength(0)
    expect(document.activeElement).toBe(trigger)
    expect(document.querySelector('.uid-menu')).not.toBeNull()
    wrapper.unmount()
  })

  it('Escape внутри подменю закрывает только подменю', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    key(subTriggers()[0], 'ArrowRight')
    await flushPromises()
    key(document.activeElement, 'Escape')
    await flushPromises()
    expect(panels()).toHaveLength(0)
    expect(document.querySelector('.uid-menu')).not.toBeNull()
    wrapper.unmount()
  })

  it('вложенность второго уровня: выбор листа закрывает всё дерево', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    key(subTriggers()[0], 'ArrowRight')
    await flushPromises()
    const nested = subTriggers()[1]
    expect(nested.textContent?.trim()).toBe('Ещё')
    key(nested, 'ArrowRight')
    await flushPromises()
    expect(panels()).toHaveLength(2)
    document.querySelector<HTMLElement>('.leaf-odt')!.click()
    await flushPromises()
    expect(document.querySelector('.uid-menu')).toBeNull()
    wrapper.unmount()
  })

  it('открытие соседнего подменю закрывает предыдущее', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    subTriggers()[0].click()
    await flushPromises()
    const share = subTriggers().find((el) => el.textContent?.includes('Поделиться'))!
    share.click()
    await flushPromises()
    expect(panels()).toHaveLength(1)
    expect(panels()[0].textContent).toContain('Ссылка')
    wrapper.unmount()
  })

  it('мышь: открывается по наведению с задержкой и закрывается при уходе', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = buildNested()
      await openRoot(wrapper)
      const trigger = subTriggers()[0]
      const enter = new MouseEvent('pointerenter') as MouseEvent & { pointerType: string }
      Object.defineProperty(enter, 'pointerType', { value: 'mouse' })
      trigger.dispatchEvent(enter)
      expect(panels()).toHaveLength(0)
      await vi.advanceTimersByTimeAsync(150)
      expect(panels()).toHaveLength(1)
      trigger.closest('.uid-submenu')!.dispatchEvent(new MouseEvent('mouseleave'))
      await vi.advanceTimersByTimeAsync(250)
      expect(panels()).toHaveLength(0)
      wrapper.unmount()
    } finally {
      vi.useRealTimers()
    }
  })

  it('touch: повторный тап закрывает подменю', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    const trigger = subTriggers()[0]
    const down = new MouseEvent('pointerdown', { bubbles: true })
    Object.defineProperty(down, 'pointerType', { value: 'touch' })
    trigger.dispatchEvent(down)
    trigger.click()
    await flushPromises()
    expect(panels()).toHaveLength(1)
    trigger.dispatchEvent(down)
    trigger.click()
    await flushPromises()
    expect(panels()).toHaveLength(0)
    wrapper.unmount()
  })

  it('disabled подменю не открывается', async () => {
    const wrapper = mount(UidMenu, {
      slots: {
        trigger: '<button>Меню</button>',
        default: '<UidSubMenu label="Нет" disabled><UidMenuItem>X</UidMenuItem></UidSubMenu>',
      },
      global: { components: { UidMenuItem, UidSubMenu } },
      attachTo: document.body,
    })
    await openRoot(wrapper as ReturnType<typeof buildNested>)
    const trigger = subTriggers()[0]
    expect(trigger.hasAttribute('disabled')).toBe(true)
    key(trigger, 'ArrowRight')
    await flushPromises()
    expect(panels()).toHaveLength(0)
    wrapper.unmount()
  })

  it('уходит влево и прижимается к низу, если не помещается во viewport', async () => {
    const wrapper = buildNested()
    await openRoot(wrapper)
    const trigger = subTriggers()[0]
    const rect = (l: number, t: number, w: number, h: number) => ({
      left: l, top: t, right: l + w, bottom: t + h, width: w, height: h, x: l, y: t, toJSON: () => ({}),
    }) as DOMRect
    trigger.getBoundingClientRect = () => rect(window.innerWidth - 200, window.innerHeight - 40, 180, 32)
    const proto = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList.contains('uid-submenu__panel') ? rect(0, 0, 160, 120) : proto.call(this)
    }
    try {
      trigger.click()
      await flushPromises()
      const panel = panels()[0] as HTMLElement
      expect(panel.dataset.side).toBe('left')
      expect(parseFloat(panel.style.left)).toBe(window.innerWidth - 200 - 2 - 160)
      expect(parseFloat(panel.style.top)).toBe(window.innerHeight - 8 - 120)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = proto
    }
    wrapper.unmount()
  })
})
