import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidAccordion from './UidAccordion.vue'
import UidAccordionItem from './UidAccordionItem.vue'

const buildAccordion = (modelValue = '') => mount(UidAccordion, {
  props: { modelValue },
  slots: {
    default: `
      <UidAccordionItem value="one" title="Раздел 1">Содержимое 1</UidAccordionItem>
      <UidAccordionItem value="two" title="Раздел 2">Содержимое 2</UidAccordionItem>
      <UidAccordionItem value="three" title="Отключён" :disabled="true">Содержимое 3</UidAccordionItem>
    `,
  },
  global: { components: { UidAccordionItem } },
})

describe('UidAccordion', () => {
  it('закрытые панели не имеют open-класса', () => {
    const wrapper = buildAccordion('')
    const items = wrapper.findAll('.uid-accordion-item')
    expect(items[0].classes()).not.toContain('uid-accordion-item--open')
  })

  it('открытая панель имеет open-класс', () => {
    const wrapper = buildAccordion('one')
    expect(wrapper.findAll('.uid-accordion-item')[0].classes()).toContain('uid-accordion-item--open')
  })

  it('клик по триггеру эмитит update:modelValue', async () => {
    const wrapper = buildAccordion('')
    await wrapper.findAll('.uid-accordion-item__trigger')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['one'])
  })

  it('повторный клик закрывает панель', async () => {
    const wrapper = buildAccordion('one')
    await wrapper.findAll('.uid-accordion-item__trigger')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })

  it('disabled item не реагирует на клик', async () => {
    const wrapper = buildAccordion('')
    await wrapper.findAll('.uid-accordion-item__trigger')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('aria-expanded соответствует состоянию', () => {
    const wrapper = buildAccordion('two')
    const triggers = wrapper.findAll('.uid-accordion-item__trigger')
    expect(triggers[0].attributes('aria-expanded')).toBe('false')
    expect(triggers[1].attributes('aria-expanded')).toBe('true')
  })

  it('aria-controls указывает на панель', () => {
    const wrapper = buildAccordion('one')
    const trigger = wrapper.findAll('.uid-accordion-item__trigger')[0]
    const panel = wrapper.findAll('.uid-accordion-item__body')[0]
    expect(trigger.attributes('aria-controls')).toBe(panel.attributes('id'))
  })
})
