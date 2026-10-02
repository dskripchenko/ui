import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
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

