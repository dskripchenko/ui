import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSlider from './UidSlider.vue'

describe('UidSlider', () => {
  it('рендерит input[type=range]', () => {
    const wrapper = mount(UidSlider)
    expect(wrapper.find('input[type="range"]').exists()).toBe(true)
  })

  it('устанавливает min/max/step на input', () => {
    const wrapper = mount(UidSlider, { props: { min: 10, max: 200, step: 5 } })
    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('10')
    expect(input.attributes('max')).toBe('200')
    expect(input.attributes('step')).toBe('5')
  })

  it('v-model обновляется при изменении input', async () => {
    const wrapper = mount(UidSlider, { props: { modelValue: 50, 'onUpdate:modelValue': (v: number) => wrapper.setProps({ modelValue: v }) } })
    await wrapper.find('input').setValue(75)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('рендерит label', () => {
    const wrapper = mount(UidSlider, { props: { label: 'Громкость' } })
    expect(wrapper.find('.uid-slider__label').text()).toBe('Громкость')
  })

  it('не рендерит header без label и showValue', () => {
    const wrapper = mount(UidSlider)
    expect(wrapper.find('.uid-slider__header').exists()).toBe(false)
  })

  it('рендерит текущее значение при showValue=true', () => {
    const wrapper = mount(UidSlider, { props: { modelValue: 42, showValue: true } })
    expect(wrapper.find('.uid-slider__value').text()).toBe('42')
  })

  it('применяет formatValue', () => {
    const wrapper = mount(UidSlider, {
      props: { modelValue: 50, showValue: true, formatValue: (v: number) => `${v}%` },
    })
    expect(wrapper.find('.uid-slider__value').text()).toBe('50%')
  })

  it('применяет disabled класс', () => {
    const wrapper = mount(UidSlider, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('uid-slider--disabled')
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('устанавливает aria-valuemin/max/now', () => {
    const wrapper = mount(UidSlider, { props: { min: 0, max: 100, modelValue: 60 } })
    const input = wrapper.find('input')
    expect(input.attributes('aria-valuemin')).toBe('0')
    expect(input.attributes('aria-valuemax')).toBe('100')
    expect(input.attributes('aria-valuenow')).toBe('60')
  })

  it('не рендерит marks без prop', () => {
    const wrapper = mount(UidSlider)
    expect(wrapper.find('.uid-slider__marks').exists()).toBe(false)
    expect(wrapper.classes()).not.toContain('uid-slider--marked')
  })

  it('рендерит marks из массива чисел с подписями-значениями', () => {
    const wrapper = mount(UidSlider, { props: { marks: [0, 50, 100] } })
    const marks = wrapper.findAll('.uid-slider__mark')
    expect(marks).toHaveLength(3)
    expect(marks[1].text()).toBe('50')
    expect(wrapper.classes()).toContain('uid-slider--marked')
  })

  it('рендерит marks из объекта value → label', () => {
    const wrapper = mount(UidSlider, { props: { marks: { 0: 'Мин', 100: 'Макс' } } })
    const labels = wrapper.findAll('.uid-slider__mark-label').map((m) => m.text())
    expect(labels).toEqual(['Мин', 'Макс'])
  })

  it('рендерит marks из массива объектов и применяет formatValue к подписям без label', () => {
    const wrapper = mount(UidSlider, {
      props: { marks: [{ value: 20 }, { value: 80, label: 'Много' }], formatValue: (v: number) => `${v}%` },
    })
    const labels = wrapper.findAll('.uid-slider__mark-label').map((m) => m.text())
    expect(labels).toEqual(['20%', 'Много'])
  })

  it('игнорирует marks вне min/max и сортирует их', () => {
    const wrapper = mount(UidSlider, { props: { min: 10, max: 50, marks: [60, 30, 5, 10] } })
    const labels = wrapper.findAll('.uid-slider__mark-label').map((m) => m.text())
    expect(labels).toEqual(['10', '30'])
  })

  it('позиционирует mark пропорционально значению', () => {
    const wrapper = mount(UidSlider, { props: { min: 0, max: 200, marks: [50] } })
    expect(wrapper.find('.uid-slider__mark').attributes('style')).toContain('--_pos: 0.25')
  })

  it('клик по mark эмитит update:modelValue с его значением', async () => {
    const wrapper = mount(UidSlider, { props: { modelValue: 10, marks: [0, 50, 100] } })
    await wrapper.findAll('.uid-slider__mark')[1].trigger('click')
    const emitted = wrapper.emitted('update:modelValue') as unknown[][]
    expect(emitted[0]).toEqual([50])
  })

  it('отмечает активными marks не правее текущего значения', () => {
    const wrapper = mount(UidSlider, { props: { modelValue: 50, marks: [0, 50, 100] } })
    const active = wrapper.findAll('.uid-slider__mark').map((m) => m.classes().includes('uid-slider__mark--active'))
    expect(active).toEqual([true, true, false])
  })

  it('при disabled клик по mark ничего не эмитит', async () => {
    const wrapper = mount(UidSlider, { props: { modelValue: 10, disabled: true, marks: [0, 50] } })
    expect(wrapper.find('.uid-slider__mark').attributes('disabled')).toBeDefined()
    await wrapper.findAll('.uid-slider__mark')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  describe('доступное имя', () => {
    it('по умолчанию aria-label берётся из label, а label связан с input', () => {
      const wrapper = mount(UidSlider, { props: { label: 'Громкость' } })
      const input = wrapper.find('input')
      expect(input.attributes('aria-label')).toBe('Громкость')
      expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
    })

    it('ariaLabel задаёт имя ручки отдельно от видимого label', () => {
      const wrapper = mount(UidSlider, { props: { label: 'Звук', ariaLabel: 'Громкость уведомлений' } })
      expect(wrapper.find('input').attributes('aria-label')).toBe('Громкость уведомлений')
      expect(wrapper.find('.uid-slider__label').text()).toBe('Звук')
    })

    it('ariaLabel работает без видимого label', () => {
      const wrapper = mount(UidSlider, { props: { ariaLabel: 'Прозрачность' } })
      expect(wrapper.find('.uid-slider__header').exists()).toBe(false)
      expect(wrapper.find('input').attributes('aria-label')).toBe('Прозрачность')
    })

    it('ariaLabelledby передаётся в ручку и отменяет aria-label', () => {
      const wrapper = mount(UidSlider, { props: { label: 'Звук', ariaLabel: 'X', ariaLabelledby: 'ext-caption' } })
      const input = wrapper.find('input')
      expect(input.attributes('aria-labelledby')).toBe('ext-caption')
      expect(input.attributes('aria-label')).toBeUndefined()
    })

    it('formatValue попадает в aria-valuetext', () => {
      const wrapper = mount(UidSlider, { props: { modelValue: 40, formatValue: (v: number) => `${v}%` } })
      expect(wrapper.find('input').attributes('aria-valuetext')).toBe('40%')
    })
  })
})
