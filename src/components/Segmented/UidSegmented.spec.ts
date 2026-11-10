import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSegmented from './UidSegmented.vue'

const views = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]

describe('UidSegmented', () => {
  it('chooses one option as a radio group; arrows move and choose', async () => {
    const wrapper = mount(UidSegmented, { props: { options: views, modelValue: 'week', label: 'View' } })
    expect(wrapper.attributes('role')).toBe('radiogroup')
    const items = wrapper.findAll('button')
    expect(items.map((b) => b.attributes('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect(items.map((b) => b.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
    await items[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['day'])
    await items[1].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['month'])
  })

  it('chooses several when multiple, as toggle buttons', async () => {
    const days = [1, 2, 3].map((d) => ({ value: d, label: String(d), ariaLabel: `Day ${d}` }))
    const wrapper = mount(UidSegmented, { props: { options: days, modelValue: [3], multiple: true, shape: 'round', variant: 'chips' } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['uid-segmented--round', 'uid-segmented--chips']))
    const items = wrapper.findAll('button')
    expect(items[2].attributes('aria-pressed')).toBe('true')
    expect(items[0].attributes('aria-label')).toBe('Day 1')
    await items[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[3, 1]])
    await wrapper.setProps({ modelValue: [3, 1] })
    await items[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[1]])
  })

  it('skips disabled options', async () => {
    const wrapper = mount(UidSegmented, { props: { options: [views[0], { ...views[1], disabled: true }, views[2]], modelValue: 'day' } })
    await wrapper.findAll('button')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['month'])
  })
})
