import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidWizardLayout from './UidWizardLayout.vue'

describe('UidWizardLayout', () => {
  it('рендерит default-слот в main', () => {
    const wrapper = mount(UidWizardLayout, {
      slots: { default: '<div class="step">Шаг</div>' },
    })
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('.step').exists()).toBe(true)
  })

  it('рендерит header-слот', () => {
    const wrapper = mount(UidWizardLayout, {
      slots: { header: '<header class="hdr">Заголовок</header>' },
    })
    expect(wrapper.find('.uid-layout-wizard__header').exists()).toBe(true)
    expect(wrapper.find('.hdr').exists()).toBe(true)
  })

  it('не рендерит header без слота', () => {
    const wrapper = mount(UidWizardLayout)
    expect(wrapper.find('.uid-layout-wizard__header').exists()).toBe(false)
  })

  it('рендерит stepper-слот', () => {
    const wrapper = mount(UidWizardLayout, {
      slots: { stepper: '<div class="stepper">Степпер</div>' },
    })
    expect(wrapper.find('.uid-layout-wizard__stepper').exists()).toBe(true)
  })

  it('не рендерит stepper без слота', () => {
    const wrapper = mount(UidWizardLayout)
    expect(wrapper.find('.uid-layout-wizard__stepper').exists()).toBe(false)
  })

  it('рендерит nav-слот', () => {
    const wrapper = mount(UidWizardLayout, {
      slots: { nav: '<button class="btn-next">Далее</button>' },
    })
    expect(wrapper.find('.uid-layout-wizard__nav').exists()).toBe(true)
    expect(wrapper.find('.btn-next').exists()).toBe(true)
  })

  it('не рендерит nav без слота', () => {
    const wrapper = mount(UidWizardLayout)
    expect(wrapper.find('.uid-layout-wizard__nav').exists()).toBe(false)
  })
})
