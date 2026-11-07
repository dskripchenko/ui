import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'
import UidCascader from '../components/Cascader/UidCascader.vue'
import UidDatePicker from '../components/DatePicker/UidDatePicker.vue'
import UidDateRangePicker from '../components/DateRangePicker/UidDateRangePicker.vue'
import UidSelect from '../components/Select/UidSelect.vue'
import UidTimePicker from '../components/TimePicker/UidTimePicker.vue'
import UidTreeSelect from '../components/TreeSelect/UidTreeSelect.vue'

// Every control whose trigger has the combobox role, with the least props it renders with.
const controls: [string, Component, Record<string, unknown>][] = [
  ['UidSelect', UidSelect, { options: [{ value: 1, label: 'One' }] }],
  ['UidTreeSelect', UidTreeSelect, { data: [] }],
  ['UidCascader', UidCascader, { options: [] }],
  ['UidDatePicker', UidDatePicker, {}],
  ['UidDateRangePicker', UidDateRangePicker, {}],
  ['UidTimePicker', UidTimePicker, {}],
]

describe.each(controls)('%s', (_name, component, props) => {
  it('names its combobox with the aria-label it is given, and keeps other attributes on the root', () => {
    const wrapper = mount(component, {
      props,
      attrs: { 'aria-label': 'Status', 'aria-describedby': 'status-hint', class: 'extra', 'data-test': 'status' },
    })
    const combobox = wrapper.get('[role="combobox"]')

    expect(combobox.attributes('aria-label')).toBe('Status')
    expect(combobox.attributes('aria-describedby')).toBe('status-hint')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.classes()).toContain('extra')
    expect(wrapper.attributes('data-test')).toBe('status')
  })
})
