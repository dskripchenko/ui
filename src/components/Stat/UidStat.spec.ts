import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidStat from './UidStat.vue'

describe('UidStat', () => {
  it('рендерит title и value', () => {
    const wrapper = mount(UidStat, { props: { title: 'Доход', value: 42 } })
    expect(wrapper.find('.uid-stat__title').text()).toBe('Доход')
    expect(wrapper.find('.uid-stat__value').text().replace(/\s/g, '')).toBe('42')
  })

  it('форматирует число с precision', () => {
    const wrapper = mount(UidStat, { props: { value: 1234.5678, precision: 2 } })
    const text = wrapper.find('.uid-stat__value').text().replace(/\s/g, '').replace(',', '.')
    expect(text).toMatch(/1\.?234\.57/)
  })

  it('применяет custom formatter', () => {
    const wrapper = mount(UidStat, {
      props: { value: 50, formatter: (v) => `[${v}]` },
    })
    expect(wrapper.find('.uid-stat__value').text()).toContain('[50]')
  })

  it('показывает prefix и suffix', () => {
    const wrapper = mount(UidStat, {
      props: { value: 100, prefix: '$', suffix: '/мес' },
    })
    expect(wrapper.find('.uid-stat__prefix').text()).toBe('$')
    expect(wrapper.find('.uid-stat__suffix').text()).toBe('/мес')
  })

  it('положительный trend → up', () => {
    const wrapper = mount(UidStat, { props: { value: 100, trend: 12.5 } })
    expect(wrapper.find('.uid-stat__trend').classes()).toContain('uid-stat__trend--up')
  })

  it('отрицательный trend → down', () => {
    const wrapper = mount(UidStat, { props: { value: 100, trend: -5 } })
    expect(wrapper.find('.uid-stat__trend').classes()).toContain('uid-stat__trend--down')
  })

  it('нулевой trend → flat', () => {
    const wrapper = mount(UidStat, { props: { value: 100, trend: 0 } })
    const trend = wrapper.find('.uid-stat__trend')
    expect(trend.classes()).toContain('uid-stat__trend--flat')
  })

  it('trend без знака — берёт абсолютное значение', () => {
    const wrapper = mount(UidStat, { props: { value: 100, trend: -7.25 } })
    expect(wrapper.find('.uid-stat__trend').text()).toContain('7,25%')
  })

  it('кастомный trendSuffix', () => {
    const wrapper = mount(UidStat, {
      props: { value: 100, trend: 5, trendSuffix: 'pp' },
    })
    expect(wrapper.find('.uid-stat__trend').text()).toContain('5pp')
  })

  it('применяет tone-класс', () => {
    const wrapper = mount(UidStat, { props: { tone: 'success' } })
    expect(wrapper.classes()).toContain('uid-stat--success')
  })

  it('variant=ghost убирает рамку', () => {
    const wrapper = mount(UidStat, { props: { variant: 'ghost' } })
    expect(wrapper.classes()).toContain('uid-stat--ghost')
  })

  it('loading применяет shimmer-класс', () => {
    const wrapper = mount(UidStat, { props: { loading: true } })
    expect(wrapper.classes()).toContain('uid-stat--loading')
  })

  it('рендерит footer', () => {
    const wrapper = mount(UidStat, { props: { footer: 'за неделю' } })
    expect(wrapper.find('.uid-stat__footer').text()).toBe('за неделю')
  })

  it('рендерит value-слот вместо встроенного', () => {
    const wrapper = mount(UidStat, {
      props: { value: 0 },
      slots: { value: '<span class="custom">Inf</span>' },
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  it('строковое значение рендерится как есть', () => {
    const wrapper = mount(UidStat, { props: { value: 'N/A' } })
    expect(wrapper.find('.uid-stat__value').text()).toContain('N/A')
  })

  it('рендерит icon-слот', () => {
    const wrapper = mount(UidStat, {
      slots: { icon: '<span class="my-icon">!</span>' },
    })
    expect(wrapper.find('.my-icon').exists()).toBe(true)
  })
})
