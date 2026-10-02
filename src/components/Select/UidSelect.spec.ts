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

// The dropdown is teleported into the body. Test-utils does not see it through
// the wrapper, so we use document.querySelectorAll. attachTo:document.body does
// not help with a Teleport either — direct DOM queries are needed for the
// dropdown elements.
function bodyQuery(selector: string): HTMLElement | null {
  return document.body.querySelector(selector)
}
function bodyQueryAll(selector: string): HTMLElement[] {
  return Array.from(document.body.querySelectorAll(selector))
}

afterEach(() => {
  // Clear every teleported dropdown between the tests.
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

describe('UidSelect multiple', () => {
  const mountMulti = (props: Record<string, unknown> = {}) =>
    mount(UidSelect, { props: { options, multiple: true, modelValue: [], ...props }, attachTo: document.body })

  it('показывает placeholder при пустом массиве', () => {
    const wrapper = mountMulti()
    expect(wrapper.classes()).toContain('uid-select--multiple')
    expect(wrapper.find('.uid-select__value--placeholder').text()).toBe('Выберите...')
    expect(wrapper.find('.uid-select__tags').exists()).toBe(false)
  })

  it('рендерит выбранные значения чипами', () => {
    const wrapper = mountMulti({ modelValue: ['us', 'ru'] })
    expect(wrapper.findAll('.uid-select__tag-label').map(t => t.text())).toEqual(['США', 'Россия'])
  })

  it('клик по опции добавляет значение и не закрывает dropdown', async () => {
    const wrapper = mountMulti({ modelValue: ['ru'] })
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(bodyQuery('.uid-select__list')?.getAttribute('aria-multiselectable')).toBe('true')
    bodyQueryAll('.uid-select__option')[1].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['ru', 'us']])
    expect(wrapper.emitted('change')?.[0]).toEqual([['ru', 'us']])
    expect(bodyQuery('.uid-select__dropdown')).not.toBeNull()
  })

  it('повторный клик по выбранной опции снимает её', async () => {
    const wrapper = mountMulti({ modelValue: ['ru', 'us'] })
    await wrapper.find('.uid-select__trigger').trigger('click')
    const first = bodyQueryAll('.uid-select__option')[0]
    expect(first.getAttribute('aria-selected')).toBe('true')
    expect(first.classList.contains('uid-select__option--selected')).toBe(true)
    first.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['us']])
  })

  it('крестик на чипе удаляет значение без открытия dropdown', async () => {
    const wrapper = mountMulti({ modelValue: ['ru', 'us'] })
    const remove = wrapper.findAll('.uid-select__tag-remove')[0]
    expect(remove.attributes('aria-label')).toBe('Удалить Россия')
    await remove.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['us']])
    expect(bodyQuery('.uid-select__dropdown')).toBeNull()
  })

  it('Backspace на триггере удаляет последний чип', async () => {
    const wrapper = mountMulti({ modelValue: ['ru', 'us'] })
    await wrapper.find('.uid-select__trigger').trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['ru']])
  })

  it('Enter в списке переключает активную опцию и оставляет список открытым', async () => {
    const wrapper = mountMulti({ modelValue: [] })
    await wrapper.find('.uid-select__trigger').trigger('click')
    bodyQuery('.uid-select__list')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['ru']])
    expect(bodyQuery('.uid-select__dropdown')).not.toBeNull()
  })

  it('clearable очищает до пустого массива', async () => {
    const wrapper = mountMulti({ modelValue: ['ru'], clearable: true })
    await wrapper.find('.uid-select__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
  })

  it('clear не показывается при пустом массиве', () => {
    const wrapper = mountMulti({ modelValue: [], clearable: true })
    expect(wrapper.find('.uid-select__clear').exists()).toBe(false)
  })

  it('maxTagCount сворачивает лишние чипы в +N', () => {
    const wrapper = mountMulti({ modelValue: ['ru', 'us', 'de', 'fr'], maxTagCount: 2 })
    expect(wrapper.findAll('.uid-select__tag-label')).toHaveLength(2)
    expect(wrapper.find('.uid-select__tag--more').text()).toBe('+2')
  })

  it('disabled прячет крестики на чипах', () => {
    const wrapper = mountMulti({ modelValue: ['ru'], disabled: true })
    expect(wrapper.find('.uid-select__tag-remove').exists()).toBe(false)
  })

  it('без multiple поведение одиночного выбора не меняется', async () => {
    const wrapper = mount(UidSelect, { props: { options, modelValue: 'ru' }, attachTo: document.body })
    expect(wrapper.find('.uid-select__tags').exists()).toBe(false)
    await wrapper.find('.uid-select__trigger').trigger('click')
    expect(bodyQuery('.uid-select__list')?.getAttribute('aria-multiselectable')).toBeNull()
  })
})

