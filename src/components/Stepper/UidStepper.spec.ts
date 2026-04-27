import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidStepper from './UidStepper.vue'

const steps = [
  { label: 'Личные данные' },
  { label: 'Детали', description: 'Заполните детали' },
  { label: 'Подтверждение' },
]

describe('UidStepper', () => {
  it('рендерит все шаги', () => {
    const wrapper = mount(UidStepper, { props: { steps, current: 0 } })
    expect(wrapper.findAll('.uid-stepper__step')).toHaveLength(3)
  })

  it('текущий шаг имеет aria-current="step"', () => {
    const wrapper = mount(UidStepper, { props: { steps, current: 1 } })
    const items = wrapper.findAll('.uid-stepper__step')
    expect(items[1].attributes('aria-current')).toBe('step')
    expect(items[0].attributes('aria-current')).toBeUndefined()
  })

  it('завершённые шаги имеют класс completed', () => {
    const wrapper = mount(UidStepper, { props: { steps, current: 2 } })
    const items = wrapper.findAll('.uid-stepper__step')
    expect(items[0].classes()).toContain('uid-stepper__step--completed')
    expect(items[1].classes()).toContain('uid-stepper__step--completed')
    expect(items[2].classes()).toContain('uid-stepper__step--current')
  })

  it('будущие шаги имеют класс pending', () => {
    const wrapper = mount(UidStepper, { props: { steps, current: 0 } })
    const items = wrapper.findAll('.uid-stepper__step')
    expect(items[1].classes()).toContain('uid-stepper__step--pending')
    expect(items[2].classes()).toContain('uid-stepper__step--pending')
  })

  it('рендерит label шага', () => {
    const wrapper = mount(UidStepper, { props: { steps, current: 0 } })
    const labels = wrapper.findAll('.uid-stepper__label')
    expect(labels[0].text()).toBe('Личные данные')
    expect(labels[2].text()).toBe('Подтверждение')
  })

  it('рендерит description если передан', () => {
    const wrapper = mount(UidStepper, { props: { steps, current: 0 } })
    expect(wrapper.find('.uid-stepper__description').text()).toBe('Заполните детали')
  })

  it('не рендерит description если не передан', () => {
    const wrapper = mount(UidStepper, { props: { steps: [{ label: 'Шаг' }], current: 0 } })
    expect(wrapper.find('.uid-stepper__description').exists()).toBe(false)
  })

  it('применяет vertical класс', () => {
    const wrapper = mount(UidStepper, { props: { steps, orientation: 'vertical' } })
    expect(wrapper.classes()).toContain('uid-stepper--vertical')
  })

  it('применяет horizontal класс по умолчанию', () => {
    const wrapper = mount(UidStepper, { props: { steps } })
    expect(wrapper.classes()).toContain('uid-stepper--horizontal')
  })

  it('рендерит нумерацию для незавершённых шагов', () => {
    const wrapper = mount(UidStepper, { props: { steps, current: 1 } })
    const indicators = wrapper.findAll('.uid-stepper__indicator')
    expect(indicators[1].text()).toBe('2')
    expect(indicators[2].text()).toBe('3')
  })
})
