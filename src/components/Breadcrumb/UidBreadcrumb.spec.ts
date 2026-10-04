import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import breadcrumbCss from './UidBreadcrumb.css?raw'
import UidBreadcrumb from './UidBreadcrumb.vue'
import UidBreadcrumbItem from './UidBreadcrumbItem.vue'

const buildCrumb = () => mount(UidBreadcrumb, {
  slots: {
    default: `
      <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
      <UidBreadcrumbItem href="/catalog">Каталог</UidBreadcrumbItem>
      <UidBreadcrumbItem :current="true">Товар</UidBreadcrumbItem>
    `,
  },
  global: { components: { UidBreadcrumbItem } },
})

describe('UidBreadcrumb', () => {
  it('рендерит nav с aria-label', () => {
    const wrapper = buildCrumb()
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Навигация')
  })

  it('рендерит список элементов', () => {
    const wrapper = buildCrumb()
    expect(wrapper.findAll('.uid-breadcrumb__item').length).toBe(3)
  })

  it('ссылки рендерятся для элементов с href', () => {
    const wrapper = buildCrumb()
    expect(wrapper.findAll('.uid-breadcrumb__link').length).toBe(2)
  })

  it('текущий элемент имеет aria-current="page"', () => {
    const wrapper = buildCrumb()
    const current = wrapper.find('.uid-breadcrumb__current')
    expect(current.attributes('aria-current')).toBe('page')
  })

  it('пользовательский разделитель через prop', () => {
    const wrapper = mount(UidBreadcrumb, {
      props: { separator: '>' },
      slots: { default: '' },
    })
    expect(wrapper.find('.uid-breadcrumb__list').attributes('style')).toContain("'>'")
  })

  it('кастомный aria-label', () => {
    const wrapper = mount(UidBreadcrumb, {
      props: { label: 'Путь' },
      slots: { default: '' },
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Путь')
  })
})

describe('UidBreadcrumbItem', () => {
  const mountList = (template: string, extra: Record<string, unknown> = {}) => mount(defineComponent({
    components: { UidBreadcrumb, UidBreadcrumbItem },
    template: `<UidBreadcrumb>${template}</UidBreadcrumb>`,
    ...extra,
  }))

  it('средняя крошка без ссылки не оформляется как текущая', async () => {
    const wrapper = mountList(`
      <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
      <UidBreadcrumbItem>Раздел</UidBreadcrumbItem>
      <UidBreadcrumbItem>Страница</UidBreadcrumbItem>
    `)
    await nextTick()
    const items = wrapper.findAll('.uid-breadcrumb__item')
    expect(items[1].find('.uid-breadcrumb__text').exists()).toBe(true)
    expect(items[1].find('[aria-current]').exists()).toBe(false)
    expect(items[2].find('.uid-breadcrumb__current').attributes('aria-current')).toBe('page')
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
  })

  it('current=false оставляет последнюю крошку обычной', async () => {
    const wrapper = mountList(`
      <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
      <UidBreadcrumbItem :current="false">Черновик</UidBreadcrumbItem>
    `)
    await nextTick()
    expect(wrapper.find('[aria-current]').exists()).toBe(false)
    expect(wrapper.find('.uid-breadcrumb__text').text()).toBe('Черновик')
  })

  it('явный current на средней крошке', async () => {
    const wrapper = mountList(`
      <UidBreadcrumbItem href="/">Главная</UidBreadcrumbItem>
      <UidBreadcrumbItem href="/x" :current="true">Текущая</UidBreadcrumbItem>
      <UidBreadcrumbItem :current="false">Дальше</UidBreadcrumbItem>
    `)
    await nextTick()
    const current = wrapper.findAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].text()).toBe('Текущая')
    expect(wrapper.findAll('a')).toHaveLength(1)
  })

  it('последняя крошка пересчитывается при добавлении элементов', async () => {
    const items = ref(['Главная', 'Каталог'])
    const wrapper = mount(defineComponent({
      setup: () => () => h(UidBreadcrumb, null, {
        default: () => items.value.map(label => h(UidBreadcrumbItem, { key: label }, () => label)),
      }),
    }))
    await nextTick()
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Каталог')
    items.value = [...items.value, 'Товар']
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Товар')
  })

  it('to без RouterLink откатывается на href', async () => {
    const wrapper = mountList(`
      <UidBreadcrumbItem to="/catalog">Каталог</UidBreadcrumbItem>
      <UidBreadcrumbItem>Товар</UidBreadcrumbItem>
    `)
    const link = wrapper.find('a.uid-breadcrumb__link')
    expect(link.attributes('href')).toBe('/catalog')
  })

  it('to рендерится через глобальный RouterLink', async () => {
    const RouterLink = defineComponent({
      name: 'RouterLink',
      props: { to: { type: [String, Object], required: true } },
      setup: (p, { slots }) => () => h('a', { 'class': 'router-link-stub', 'data-to': JSON.stringify(p.to) }, slots.default?.()),
    })
    const wrapper = mount(defineComponent({
      components: { UidBreadcrumb, UidBreadcrumbItem },
      template: `
        <UidBreadcrumb>
          <UidBreadcrumbItem :to="{ name: 'catalog' }">Каталог</UidBreadcrumbItem>
          <UidBreadcrumbItem>Товар</UidBreadcrumbItem>
        </UidBreadcrumb>
      `,
    }), { global: { components: { RouterLink } } })
    const link = wrapper.find('.router-link-stub')
    expect(link.exists()).toBe(true)
    expect(link.classes()).toContain('uid-breadcrumb__link')
    expect(link.attributes('data-to')).toBe('{"name":"catalog"}')
  })

  it('эмитит click по ссылке', async () => {
    const wrapper = mount(UidBreadcrumbItem, { props: { href: '/x', current: false }, slots: { default: 'X' } })
    await wrapper.find('a').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')![0][0]).toBeInstanceOf(MouseEvent)
  })

  it('без ссылки, но с обработчиком click рендерит кнопку', async () => {
    let clicks = 0
    const wrapper = mountList(
      `<UidBreadcrumbItem @click="onClick">Раздел</UidBreadcrumbItem><UidBreadcrumbItem>Страница</UidBreadcrumbItem>`,
      { setup: () => ({ onClick: () => { clicks++ } }) },
    )
    const button = wrapper.find('button.uid-breadcrumb__link')
    expect(button.attributes('type')).toBe('button')
    await button.trigger('click')
    expect(clicks).toBe(1)
  })

  it('текущая крошка не является ссылкой даже с href', () => {
    const wrapper = mount(UidBreadcrumbItem, { props: { href: '/x', current: true }, slots: { default: 'X' } })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('[aria-current="page"]').exists()).toBe(true)
  })
})


describe('UidBreadcrumb разделитель', () => {
  it('разделитель — отдельный элемент с aria-hidden', () => {
    const wrapper = buildCrumb()
    const seps = wrapper.findAll('.uid-breadcrumb__item > .uid-breadcrumb__separator')
    expect(seps.length).toBe(3)
    for (const sep of seps) expect(sep.attributes('aria-hidden')).toBe('true')
  })

  it('в CSS нет невалидного свойства aria-hidden', () => {
    expect(breadcrumbCss).not.toMatch(/aria-hidden\s*:/)
  })
})

describe('UidBreadcrumb nowrap / collapse', () => {
  const ITEM_WIDTH = 100
  const PROBE_WIDTH = 20
  let listWidth = 260

  beforeEach(() => {
    listWidth = 260
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const width = this.classList.contains('uid-breadcrumb__probe')
        ? PROBE_WIDTH
        : this.classList.contains('uid-breadcrumb__item') ? ITEM_WIDTH : 0
      return { width, height: 20, top: 0, left: 0, right: width, bottom: 20, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
    })
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('uid-breadcrumb__list') ? listWidth : 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const el of Array.from(document.body.querySelectorAll('.uid-breadcrumb__menu'))) el.remove()
  })

  const mountTrail = (props: Record<string, unknown>, onSection = vi.fn()) => mount(UidBreadcrumb, {
    props,
    slots: {
      default: () => [
        h(UidBreadcrumbItem, { href: '/' }, () => 'Главная'),
        h(UidBreadcrumbItem, { href: '/a' }, () => 'Раздел A'),
        h(UidBreadcrumbItem, { onClick: onSection }, () => 'Раздел B'),
        h(UidBreadcrumbItem, null, () => 'Раздел C'),
        h(UidBreadcrumbItem, null, () => 'Страница'),
      ],
    },
    attachTo: document.body,
  })

  it('nowrap ставит модификатор, но ничего не сворачивает', async () => {
    const wrapper = mountTrail({ nowrap: true })
    await flushPromises()
    expect(wrapper.find('nav').classes()).toContain('uid-breadcrumb--nowrap')
    expect(wrapper.find('nav').classes()).not.toContain('uid-breadcrumb--collapse')
    expect(wrapper.find('.uid-breadcrumb__ellipsis').exists()).toBe(false)
    wrapper.unmount()
  })

  it('collapse подразумевает nowrap', async () => {
    const wrapper = mountTrail({ collapse: true })
    await flushPromises()
    expect(wrapper.find('nav').classes()).toEqual(expect.arrayContaining(['uid-breadcrumb--nowrap', 'uid-breadcrumb--collapse']))
    wrapper.unmount()
  })

  it('collapse: средние крошки сворачиваются в «…», первая и последняя остаются', async () => {
    const wrapper = mountTrail({ collapse: true })
    await flushPromises()
    const items = wrapper.findAll('.uid-breadcrumb__list > .uid-breadcrumb__item')
    // 5 × 100 = 500 > 260: hide the 2nd, 3rd, 4th → 200 + 20 ("…") fits.
    expect(items[0].classes()).not.toContain('uid-breadcrumb__item--collapsed')
    expect(items[1].classes()).toContain('uid-breadcrumb__item--ellipsis')
    expect(items[2].classes()).toContain('uid-breadcrumb__item--collapsed')
    expect(items[3].classes()).toContain('uid-breadcrumb__item--collapsed')
    expect(items[4].classes()).not.toContain('uid-breadcrumb__item--collapsed')
    expect(wrapper.find('nav').classes()).not.toContain('uid-breadcrumb--measuring')
    const button = items[1].find('button.uid-breadcrumb__ellipsis')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBe('Показать скрытые разделы')
    expect(button.attributes('aria-haspopup')).toBe('menu')
    expect(button.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('collapse сворачивает только сколько нужно', async () => {
    listWidth = 420
    const wrapper = mountTrail({ collapse: true })
    await flushPromises()
    const items = wrapper.findAll('.uid-breadcrumb__list > .uid-breadcrumb__item')
    // 500 → hide the 2nd: 400 + 20 = 420 fits.
    expect(items[1].classes()).toContain('uid-breadcrumb__item--ellipsis')
    expect(items[2].classes()).not.toContain('uid-breadcrumb__item--collapsed')
    expect(wrapper.findAll('.uid-breadcrumb__item--collapsed').length).toBe(0)
    wrapper.unmount()
  })

  it('collapse: если всё помещается, «…» нет', async () => {
    listWidth = 600
    const wrapper = mountTrail({ collapse: true })
    await flushPromises()
    expect(wrapper.find('.uid-breadcrumb__item--ellipsis').exists()).toBe(false)
    wrapper.unmount()
  })

  it('«…» открывает меню скрытых крошек и активирует выбранную', async () => {
    const onSection = vi.fn()
    const wrapper = mountTrail({ collapse: true }, onSection)
    await flushPromises()
    const button = wrapper.find('button.uid-breadcrumb__ellipsis')
    await button.trigger('click')
    await flushPromises()
    const menu = document.body.querySelector('.uid-breadcrumb__menu')!
    expect(menu.getAttribute('role')).toBe('menu')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(button.attributes('aria-controls')).toBe(menu.id)
    const entries = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    expect(entries.map(e => e.textContent?.trim())).toEqual(['Раздел A', 'Раздел B', 'Раздел C'])
    expect(document.activeElement).toBe(entries[0])
    // A plain-text crumb has nothing to activate.
    expect(entries[2].getAttribute('aria-disabled')).toBe('true')
    expect(entries[0].getAttribute('aria-disabled')).toBeNull()

    entries[1].click()
    await flushPromises()
    expect(onSection).toHaveBeenCalledTimes(1)
    expect(document.body.querySelector('.uid-breadcrumb__menu')).toBeNull()
    wrapper.unmount()
  })

  it('меню: стрелки двигают фокус, Escape закрывает и возвращает фокус', async () => {
    const wrapper = mountTrail({ collapse: true })
    await flushPromises()
    const button = wrapper.find('button.uid-breadcrumb__ellipsis')
    await button.trigger('click')
    await flushPromises()
    const menu = document.body.querySelector<HTMLElement>('.uid-breadcrumb__menu')!
    const entries = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(entries[1])
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(document.activeElement).toBe(entries[2])
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(document.body.querySelector('.uid-breadcrumb__menu')).toBeNull()
    expect(document.activeElement).toBe(button.element)
    wrapper.unmount()
  })

  it('collapseMenu: false рендерит «…» текстом без меню', async () => {
    const wrapper = mountTrail({ collapse: true, collapseMenu: false })
    await flushPromises()
    const ellipsis = wrapper.find('.uid-breadcrumb__item--ellipsis .uid-breadcrumb__ellipsis')
    expect(ellipsis.element.tagName).toBe('SPAN')
    expect(ellipsis.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('button.uid-breadcrumb__ellipsis').exists()).toBe(false)
    wrapper.unmount()
  })

  it('выключение collapse разворачивает крошки', async () => {
    const wrapper = mountTrail({ collapse: true })
    await flushPromises()
    expect(wrapper.find('.uid-breadcrumb__item--ellipsis').exists()).toBe(true)
    await wrapper.setProps({ collapse: false })
    await flushPromises()
    expect(wrapper.find('.uid-breadcrumb__item--ellipsis').exists()).toBe(false)
    expect(wrapper.find('.uid-breadcrumb__item--collapsed').exists()).toBe(false)
    wrapper.unmount()
  })

  it('collapse без collapseFirst оставляет первую крошку, даже если не помещается', async () => {
    listWidth = 150
    const wrapper = mountTrail({ collapse: true })
    await flushPromises()
    const items = wrapper.findAll('.uid-breadcrumb__list > .uid-breadcrumb__item')
    expect(items[0].classes()).not.toContain('uid-breadcrumb__item--collapsed')
    expect(items[0].classes()).not.toContain('uid-breadcrumb__item--ellipsis')
    expect(items[1].classes()).toContain('uid-breadcrumb__item--ellipsis')
    wrapper.unmount()
  })

  it('collapseFirst: если не помещается «первая › … › текущая», первая тоже уходит в «…»', async () => {
    listWidth = 150
    const wrapper = mountTrail({ collapse: true, collapseFirst: true })
    await flushPromises()
    const items = wrapper.findAll('.uid-breadcrumb__list > .uid-breadcrumb__item')
    // 100 + 20 + 100 > 150 → hide the first as well: 20 + 100 fits.
    expect(items[0].classes()).toContain('uid-breadcrumb__item--ellipsis')
    expect(items[1].classes()).toContain('uid-breadcrumb__item--collapsed')
    expect(items[2].classes()).toContain('uid-breadcrumb__item--collapsed')
    expect(items[3].classes()).toContain('uid-breadcrumb__item--collapsed')
    expect(items[4].classes()).not.toContain('uid-breadcrumb__item--collapsed')
    expect(items[4].find('[aria-current="page"]').text()).toBe('Страница')

    await items[0].find('button.uid-breadcrumb__ellipsis').trigger('click')
    await flushPromises()
    const entries = Array.from(document.body.querySelectorAll<HTMLElement>('.uid-breadcrumb__menu [role="menuitem"]'))
    expect(entries.map(e => e.textContent?.trim())).toEqual(['Главная', 'Раздел A', 'Раздел B', 'Раздел C'])
    wrapper.unmount()
  })

  it('collapseFirst не трогает первую крошку, когда «первая › … › текущая» помещается', async () => {
    const wrapper = mountTrail({ collapse: true, collapseFirst: true })
    await flushPromises()
    const items = wrapper.findAll('.uid-breadcrumb__list > .uid-breadcrumb__item')
    expect(items[0].classes()).not.toContain('uid-breadcrumb__item--ellipsis')
    expect(items[1].classes()).toContain('uid-breadcrumb__item--ellipsis')
    wrapper.unmount()
  })

  it('collapseFirst работает и для двух крошек', async () => {
    listWidth = 150
    const wrapper = mount(UidBreadcrumb, {
      props: { collapse: true, collapseFirst: true },
      slots: {
        default: () => [
          h(UidBreadcrumbItem, { href: '/' }, () => 'Главная'),
          h(UidBreadcrumbItem, null, () => 'Страница'),
        ],
      },
      attachTo: document.body,
    })
    await flushPromises()
    const items = wrapper.findAll('.uid-breadcrumb__list > .uid-breadcrumb__item')
    expect(items[0].classes()).toContain('uid-breadcrumb__item--ellipsis')
    expect(items[1].classes()).not.toContain('uid-breadcrumb__item--collapsed')
    wrapper.unmount()
  })

  describe('наблюдение за шириной контейнера', () => {
    interface FakeObserver { callback: ResizeObserverCallback, targets: Element[] }
    let observers: FakeObserver[] = []

    beforeEach(() => {
      observers = []
      vi.stubGlobal('ResizeObserver', class {
        private record: FakeObserver
        constructor(callback: ResizeObserverCallback) {
          this.record = { callback, targets: [] }
          observers.push(this.record)
        }

        observe(el: Element): void { this.record.targets.push(el) }
        unobserve(): void {}
        disconnect(): void { this.record.targets = [] }
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    const active = () => observers.filter(o => o.targets.length > 0)
    const resize = (target: Element, width: number) => {
      for (const o of active()) {
        if (!o.targets.includes(target)) continue
        o.callback([{ target, contentRect: { width } } as unknown as ResizeObserverEntry], o as unknown as ResizeObserver)
      }
    }

    const mountInside = (props: Record<string, unknown>) => {
      const host = document.createElement('div')
      host.className = 'toolbar'
      const parent = document.createElement('div')
      parent.className = 'crumbs'
      host.appendChild(parent)
      document.body.appendChild(host)
      const wrapper = mount(UidBreadcrumb, {
        props,
        slots: {
          default: () => [
            h(UidBreadcrumbItem, { href: '/' }, () => 'Главная'),
            h(UidBreadcrumbItem, { href: '/a' }, () => 'Раздел A'),
            h(UidBreadcrumbItem, null, () => 'Раздел B'),
            h(UidBreadcrumbItem, null, () => 'Страница'),
          ],
        },
        attachTo: parent,
      })
      return { wrapper, host, cleanup: () => { wrapper.unmount(); host.remove() } }
    }

    it('следит за nav и его родителем', async () => {
      const { wrapper, cleanup } = mountInside({ collapse: true })
      await flushPromises()
      const nav = wrapper.find('nav').element
      const targets = active().flatMap(o => o.targets)
      expect(targets).toContain(nav)
      expect(targets).toContain(nav.parentElement)
      cleanup()
    })

    it('container (селектор) добавляет предка в наблюдение', async () => {
      const { host, cleanup } = mountInside({ collapse: true, container: '.toolbar' })
      await flushPromises()
      expect(active().flatMap(o => o.targets)).toContain(host)
      cleanup()
    })

    it('container (элемент) добавляет его в наблюдение', async () => {
      const outside = document.createElement('section')
      document.body.appendChild(outside)
      const { cleanup } = mountInside({ collapse: true, container: outside })
      await flushPromises()
      expect(active().flatMap(o => o.targets)).toContain(outside)
      cleanup()
      outside.remove()
    })

    it('разворачивается снова, когда контейнер становится шире', async () => {
      const { wrapper, host, cleanup } = mountInside({ collapse: true, container: '.toolbar' })
      await flushPromises()
      expect(wrapper.find('.uid-breadcrumb__item--ellipsis').exists()).toBe(true)
      resize(host, 260)
      await flushPromises()

      listWidth = 600
      resize(host, 900)
      await flushPromises()
      expect(wrapper.find('.uid-breadcrumb__item--ellipsis').exists()).toBe(false)
      expect(wrapper.find('.uid-breadcrumb__item--collapsed').exists()).toBe(false)

      listWidth = 260
      resize(host, 400)
      await flushPromises()
      expect(wrapper.find('.uid-breadcrumb__item--ellipsis').exists()).toBe(true)
      cleanup()
    })

    it('пересчитывает только при смене ширины', async () => {
      const { wrapper, host, cleanup } = mountInside({ collapse: true, container: '.toolbar' })
      await flushPromises()
      const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      resize(host, 500)
      await flushPromises()
      const calls = spy.mock.calls.length
      expect(calls).toBeGreaterThan(0)
      resize(host, 500)
      await flushPromises()
      expect(spy.mock.calls.length).toBe(calls)
      expect(wrapper.find('nav').exists()).toBe(true)
      cleanup()
    })
  })
})
