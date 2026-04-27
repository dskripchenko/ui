import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import UidWizard from './UidWizard.vue'
import UidWizardStep from './UidWizardStep.vue'
import { WIZARD_KEY } from './context'

const steps = [{ label: 'Шаг 1' }, { label: 'Шаг 2' }, { label: 'Шаг 3' }]

function mountWizard(opts: { modelValue?: number; validate?: () => boolean } = {}) {
  const validate = opts.validate
  return mount(UidWizard, {
    props: { steps, modelValue: opts.modelValue ?? 0 },
    slots: {
      default: () => [
        h(UidWizardStep, { index: 0, validate }, () => 'Контент 1'),
        h(UidWizardStep, { index: 1 }, () => 'Контент 2'),
        h(UidWizardStep, { index: 2 }, () => 'Контент 3'),
      ],
    },
  })
}

describe('UidWizard', () => {
  it('показывает первый шаг по умолчанию', () => {
    const wrapper = mountWizard()
    expect(wrapper.text()).toContain('Контент 1')
    expect(wrapper.text()).not.toContain('Контент 2')
  })

  it('next() переходит к следующему шагу', async () => {
    const wrapper = mountWizard()
    await wrapper.vm.next()
    expect(wrapper.text()).toContain('Контент 2')
    expect(wrapper.text()).not.toContain('Контент 1')
  })

  it('prev() возвращается к предыдущему шагу', async () => {
    const wrapper = mountWizard({ modelValue: 1 })
    wrapper.vm.prev()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Контент 1')
  })

  it('next() не переходит дальше последнего шага', async () => {
    const wrapper = mountWizard({ modelValue: 2 })
    await wrapper.vm.next()
    expect(wrapper.text()).toContain('Контент 3')
  })

  it('prev() не уходит ниже нуля', async () => {
    const wrapper = mountWizard()
    wrapper.vm.prev()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Контент 1')
  })

  it('goTo() переходит к конкретному шагу', async () => {
    const wrapper = mountWizard()
    wrapper.vm.goTo(2)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Контент 3')
  })

  it('next() блокируется если validate возвращает false', async () => {
    const validate = vi.fn(() => false)
    const wrapper = mountWizard({ validate })
    await wrapper.vm.next()
    expect(wrapper.text()).toContain('Контент 1')
    expect(validate).toHaveBeenCalledOnce()
  })

  it('next() проходит если validate возвращает true', async () => {
    const validate = vi.fn(() => true)
    const wrapper = mountWizard({ validate })
    await wrapper.vm.next()
    expect(wrapper.text()).toContain('Контент 2')
  })

  it('isFirst корректен на первом шаге', () => {
    const wrapper = mountWizard()
    expect(wrapper.vm.isFirst).toBe(true)
    expect(wrapper.vm.isLast).toBe(false)
  })

  it('isLast корректен на последнем шаге', () => {
    const wrapper = mountWizard({ modelValue: 2 })
    expect(wrapper.vm.isFirst).toBe(false)
    expect(wrapper.vm.isLast).toBe(true)
  })
})

describe('UidWizardStep', () => {
  it('рендерит только активный шаг', () => {
    const wrapper = mountWizard({ modelValue: 1 })
    expect(wrapper.text()).not.toContain('Контент 1')
    expect(wrapper.text()).toContain('Контент 2')
    expect(wrapper.text()).not.toContain('Контент 3')
  })

  it('имеет role="tabpanel"', () => {
    const wrapper = mountWizard()
    expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true)
  })
})

describe('useWizard', () => {
  it('предоставляет контекст через inject', () => {
    let capturedCurrent = -1

    const Consumer = defineComponent({
      setup() {
        const ctx = inject(WIZARD_KEY)!
        capturedCurrent = ctx.current.value
      },
      template: '<span />',
    })

    mount(UidWizard, {
      props: { steps, modelValue: 2 },
      slots: { default: () => h(Consumer) },
    })

    expect(capturedCurrent).toBe(2)
  })
})
