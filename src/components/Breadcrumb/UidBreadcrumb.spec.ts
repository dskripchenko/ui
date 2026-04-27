import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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
