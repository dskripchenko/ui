import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidProgress from './UidProgress.vue'

describe('UidProgress', () => {
  it('рендерит bar при наличии value', () => {
    const wrapper = mount(UidProgress, { props: { value: 50 } })
    expect(wrapper.find('.uid-progress__bar').exists()).toBe(true)
  })

  it('не рендерит bar в indeterminate режиме (value=undefined)', () => {
    const wrapper = mount(UidProgress)
    expect(wrapper.find('.uid-progress__bar').exists()).toBe(false)
  })

  it('добавляет indeterminate класс при value=undefined', () => {
    const wrapper = mount(UidProgress)
    expect(wrapper.find('.uid-progress').classes()).toContain('uid-progress--indeterminate')
  })

  it('устанавливает ширину bar в процентах', () => {
    const wrapper = mount(UidProgress, { props: { value: 75 } })
    const bar = wrapper.find('.uid-progress__bar').element as HTMLElement
    expect(bar.style.width).toBe('75%')
  })

  it('ограничивает value до 0–100', () => {
    const over = mount(UidProgress, { props: { value: 150 } })
    expect((over.find('.uid-progress__bar').element as HTMLElement).style.width).toBe('100%')
    const under = mount(UidProgress, { props: { value: -10 } })
    expect((under.find('.uid-progress__bar').element as HTMLElement).style.width).toBe('0%')
  })

  it('рендерит label', () => {
    const wrapper = mount(UidProgress, { props: { value: 50, label: 'Прогресс' } })
    expect(wrapper.find('.uid-progress-label').text()).toBe('Прогресс')
  })

  it('рендерит значение при showValue=true', () => {
    const wrapper = mount(UidProgress, { props: { value: 50, showValue: true } })
    expect(wrapper.find('.uid-progress-value').text()).toBe('50%')
  })

  it('не рендерит значение при showValue=false', () => {
    const wrapper = mount(UidProgress, { props: { value: 50, showValue: false } })
    expect(wrapper.find('.uid-progress-value').exists()).toBe(false)
  })

  it('применяет size класс', () => {
    expect(mount(UidProgress, { props: { size: 'sm' } }).find('.uid-progress').classes()).toContain('uid-progress--sm')
    expect(mount(UidProgress, { props: { size: 'lg' } }).find('.uid-progress').classes()).toContain('uid-progress--lg')
  })

  it('применяет variant класс', () => {
    const wrapper = mount(UidProgress, { props: { variant: 'success' } })
    expect(wrapper.find('.uid-progress').classes()).toContain('uid-progress--success')
  })

  it('role="progressbar" присутствует', () => {
    const wrapper = mount(UidProgress)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
  })

  it('aria-valuenow равен value', () => {
    const wrapper = mount(UidProgress, { props: { value: 42 } })
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('42')
  })
})
