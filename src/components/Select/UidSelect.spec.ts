import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UidSelect from './UidSelect.vue'
import type { SelectOption } from './UidSelect.vue'

const options: SelectOption[] = [
  { value: 'ru', label: 'Россия' },
  { value: 'us', label: 'США' },
  { value: 'de', label: 'Германия', group: 'Европа' },
  { value: 'fr', label: 'Франция', group: 'Европа' },
  { value: 'jp', label: 'Япония', disabled: true },
]

// Dropdown — Teleport'нут в body. Test-utils не видит его через wrapper'а,
// поэтому используем document.querySelectorAll. attachTo:document.body тоже
// не помогает с Teleport, нужны direct DOM-queries для dropdown elements.
function bodyQuery(selector: string): HTMLElement | null {
  return document.body.querySelector(selector)
}
function bodyQueryAll(selector: string): HTMLElement[] {
  return Array.from(document.body.querySelectorAll(selector))
}

afterEach(() => {
  // Очистим все Teleport'нутые dropdown'ы между тестами.
  for (const el of bodyQueryAll('.uid-select__dropdown')) {
    el.remove()
  }
})

describe('UidSelect', () => {
  it('рендерит placeholder по умолчанию', () => {
    const wrapper = mount(UidSelect, { props: { options }, attachTo: document.body })
    expect(wrapper.find('.uid-select__value').text()).toBe('Выберите...')
    expect(wrapper.find('.uid-select__value').classes()).toContain('uid-select__value--placeholder')
  })

  it('показывает label выбранного значения', () => {
    const wrapper = mount(UidSelect, { props: { options, modelValue: 'ru' }, attachTo: document.body })
    expect(wrapper.find('.uid-select__value').text()).toBe('Россия')
  })

  it('открывает dropdown при клике', async () => {
    const wrapper = mount(UidSelect, { props: { options }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(bodyQuery('.uid-select__dropdown')).not.toBeNull()
  })

  it('закрывает dropdown повторным кликом', async () => {
    const wrapper = mount(UidSelect, { props: { options }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(bodyQuery('.uid-select__dropdown')).toBeNull()
  })

  it('рендерит все опции', async () => {
    const wrapper = mount(UidSelect, { props: { options }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(bodyQueryAll('.uid-select__option')).toHaveLength(5)
  })

  it('выбирает опцию при клике', async () => {
    const wrapper = mount(UidSelect, { props: { options }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    bodyQueryAll('.uid-select__option')[1].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['us'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['us'])
  })

  it('не выбирает disabled опцию', async () => {
    const wrapper = mount(UidSelect, { props: { options }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    const disabled = bodyQueryAll('.uid-select__option').find(o =>
      o.classList.contains('uid-select__option--disabled'),
    )!
    disabled.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('рендерит group labels', async () => {
    const wrapper = mount(UidSelect, { props: { options }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    const labels = bodyQueryAll('.uid-select__group-label')
    expect(labels.some(l => l.textContent?.includes('Европа'))).toBe(true)
  })

  it('фильтрует при searchable=true', async () => {
    const wrapper = mount(UidSelect, { props: { options, searchable: true }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    const input = bodyQuery('.uid-select__search-input') as HTMLInputElement
    input.value = 'фра'
    input.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    expect(bodyQueryAll('.uid-select__option')).toHaveLength(1)
    expect(bodyQuery('.uid-select__option')?.textContent).toContain('Франция')
  })

  it('показывает empty когда ничего не найдено', async () => {
    const wrapper = mount(UidSelect, { props: { options, searchable: true }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    const input = bodyQuery('.uid-select__search-input') as HTMLInputElement
    input.value = 'zzz'
    input.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    expect(bodyQuery('.uid-select__empty')).not.toBeNull()
  })

  it('рендерит кнопку clear когда clearable и есть значение', () => {
    const wrapper = mount(UidSelect, { props: { options, modelValue: 'ru', clearable: true }, attachTo: document.body })
    expect(wrapper.find('.uid-select__clear').exists()).toBe(true)
  })

  it('очищает значение при клике на clear', async () => {
    const wrapper = mount(UidSelect, { props: { options, modelValue: 'ru', clearable: true }, attachTo: document.body })
    await wrapper.find('.uid-select__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('не открывается при disabled=true', async () => {
    const wrapper = mount(UidSelect, { props: { options, disabled: true }, attachTo: document.body })
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(bodyQuery('.uid-select__dropdown')).toBeNull()
  })

  it('применяет size класс', () => {
    const wrapper = mount(UidSelect, { props: { options, size: 'sm' }, attachTo: document.body })
    expect(wrapper.classes()).toContain('uid-select--sm')
  })
})
