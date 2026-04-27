import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSpinner from './UidSpinner.vue'

describe('UidSpinner', () => {
  it('рендерит с role="status"', () => {
    const wrapper = mount(UidSpinner)
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('устанавливает aria-label', () => {
    const wrapper = mount(UidSpinner, { props: { label: 'Идёт загрузка' } })
    expect(wrapper.attributes('aria-label')).toBe('Идёт загрузка')
  })

  it('дефолтный aria-label — "Загрузка..."', () => {
    const wrapper = mount(UidSpinner)
    expect(wrapper.attributes('aria-label')).toBe('Загрузка...')
  })

  it('применяет size класс', () => {
    expect(mount(UidSpinner, { props: { size: 'sm' } }).classes()).toContain('uid-spinner--sm')
    expect(mount(UidSpinner, { props: { size: 'lg' } }).classes()).toContain('uid-spinner--lg')
  })

  it('имеет базовый uid-spinner класс', () => {
    const wrapper = mount(UidSpinner)
    expect(wrapper.classes()).toContain('uid-spinner')
  })
})
