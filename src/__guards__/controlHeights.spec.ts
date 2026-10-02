import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Component } from 'vue'
import UidDatePicker from '../components/DatePicker/UidDatePicker.vue'
import UidDateRangePicker from '../components/DateRangePicker/UidDateRangePicker.vue'
import UidTimePicker from '../components/TimePicker/UidTimePicker.vue'
import UidTreeSelect from '../components/TreeSelect/UidTreeSelect.vue'
import UidCascader from '../components/Cascader/UidCascader.vue'
import UidColorPicker from '../components/ColorPicker/UidColorPicker.vue'

/**
 * Form controls of one size share one height, so a select next to an input
 * lines up: every control box takes its min-height from --uid-size-sm|md|lg,
 * never from a literal.
 */
const controls: Array<[string, string]> = [
  ['Input/UidInput.css', 'uid-input-field__control'],
  ['Select/UidSelect.css', 'uid-select__trigger'],
  ['Combobox/UidCombobox.css', 'uid-combobox__control'],
  ['NumberInput/UidNumberInput.css', 'uid-number-input__control'],
  ['TagsInput/UidTagsInput.css', 'uid-tags-input__control'],
  ['DatePicker/UidDatePicker.css', 'uid-datepicker__trigger'],
  ['DateRangePicker/UidDateRangePicker.css', 'uid-daterange__trigger'],
  ['TimePicker/UidTimePicker.css', 'uid-timepicker__trigger'],
  ['TreeSelect/UidTreeSelect.css', 'uid-tree-select__trigger'],
  ['Cascader/UidCascader.css', 'uid-cascader__trigger'],
  ['ColorPicker/UidColorPicker.css', 'uid-colorpicker__trigger'],
]

interface Fs { readFileSync(path: string, encoding: 'utf8'): string }
const css: Record<string, string> = {}
beforeAll(async () => {
  const fs = (await import('node:fs' as string)) as Fs
  const root = `${(globalThis as unknown as { process: { cwd(): string } }).process.cwd()}/src/components`
  for (const [file] of controls) css[file] = fs.readFileSync(`${root}/${file}`, 'utf8')
})

describe('one control height per size', () => {
  it.each(controls)('%s: the control box height comes from the size scale', (file, cls) => {
    const code = css[file]!
    const rules = [...code.matchAll(new RegExp(`[^{}]*\\.${cls}[^{}]*\\{([^}]*)\\}`, 'g'))].map((m) => m[1]!)
    const heights = rules.flatMap((r) => [...r.matchAll(/(?:^|[\s;])(?:min-)?height:\s*([^;]+);/g)].map((m) => m[1]!.trim()))
    expect(heights.length).toBeGreaterThan(0)
    for (const h of heights) expect(h).toMatch(/var\(--uid-(size-(sm|md|lg)|[\w-]+-height)\)/)
  })

  const sized: Array<[string, Component, string, Record<string, unknown>]> = [
    ['UidDatePicker', UidDatePicker, 'uid-datepicker', {}],
    ['UidDateRangePicker', UidDateRangePicker, 'uid-daterange', {}],
    ['UidTimePicker', UidTimePicker, 'uid-timepicker', {}],
    ['UidTreeSelect', UidTreeSelect, 'uid-tree-select', { data: [] }],
    ['UidCascader', UidCascader, 'uid-cascader', { options: [] }],
    ['UidColorPicker', UidColorPicker, 'uid-colorpicker', {}],
  ]
  it.each(sized)('%s takes a size', (_name, component, root, props) => {
    expect(mount(component, { props }).classes()).toContain(`${root}--md`)
    expect(mount(component, { props: { ...props, size: 'sm' } }).classes()).toContain(`${root}--sm`)
  })
})
