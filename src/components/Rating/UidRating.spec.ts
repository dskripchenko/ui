import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidRating from './UidRating.vue'

describe('UidRating', () => {
  it('рендерит max звёзд', () => {
    const wrapper = mount(UidRating, { props: { max: 7 } })
    expect(wrapper.findAll('.uid-rating__star')).toHaveLength(7)
  })

  it('заполняет звёзды по modelValue', () => {
    const wrapper = mount(UidRating, { props: { modelValue: 3, max: 5 } })
    expect(wrapper.findAll('.uid-rating__icon--filled')).toHaveLength(3)
  })

  it('эмитит value при клике', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 0 } })
    await wrapper.findAll('.uid-rating__star')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
    expect(wrapper.emitted('change')?.[0]).toEqual([3])
  })

  it('сбрасывает при повторном клике на ту же звезду', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 3 } })
    await wrapper.findAll('.uid-rating__star')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('readonly блокирует клики', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 0, readonly: true } })
    await wrapper.findAll('.uid-rating__star')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.classes()).toContain('uid-rating--readonly')
  })

  it('disabled блокирует клики', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 0, disabled: true } })
    await wrapper.findAll('.uid-rating__star')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('ArrowRight увеличивает', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 2 } })
    await wrapper.findAll('.uid-rating__star')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('ArrowLeft уменьшает', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 3 } })
    await wrapper.findAll('.uid-rating__star')[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('ArrowRight ограничен max', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 5, max: 5 } })
    await wrapper.findAll('.uid-rating__star')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('ArrowLeft ограничен 0', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 0 } })
    await wrapper.findAll('.uid-rating__star')[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('allowHalf использует шаг 0.5 в навигации', async () => {
    const wrapper = mount(UidRating, { props: { modelValue: 2, allowHalf: true } })
    await wrapper.findAll('.uid-rating__star')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2.5])
  })

  it('allowHalf отображает половину', () => {
    const wrapper = mount(UidRating, { props: { modelValue: 2.5, allowHalf: true } })
    const filled = wrapper.findAll('.uid-rating__icon--filled')
    expect(filled).toHaveLength(3)
    expect(filled[2].attributes('data-half')).toBe('true')
  })

  it('применяет size-классы', () => {
    const sm = mount(UidRating, { props: { size: 'sm' } })
    expect(sm.classes()).toContain('uid-rating--sm')
    const lg = mount(UidRating, { props: { size: 'lg' } })
    expect(lg.classes()).toContain('uid-rating--lg')
  })

  it('применяет tone-классы', () => {
    const wrapper = mount(UidRating, { props: { tone: 'success' } })
    expect(wrapper.classes()).toContain('uid-rating--success')
  })

  it('показывает label с числом', () => {
    const wrapper = mount(UidRating, { props: { modelValue: 4, showLabel: true } })
    expect(wrapper.find('.uid-rating__label').text()).toBe('4 / 5')
  })

  it('label с allowHalf даёт десятичный', () => {
    const wrapper = mount(UidRating, {
      props: { modelValue: 3.5, showLabel: true, allowHalf: true },
    })
    expect(wrapper.find('.uid-rating__label').text()).toBe('3.5 / 5')
  })

  it('aria-valuenow отражает значение', () => {
    const wrapper = mount(UidRating, { props: { modelValue: 4 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('4')
  })
})
