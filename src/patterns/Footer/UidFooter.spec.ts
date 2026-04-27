import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidFooter from './UidFooter.vue'

describe('UidFooter', () => {
  it('рендерит <footer>', () => {
    const wrapper = mount(UidFooter)
    expect(wrapper.element.tagName).toBe('FOOTER')
  })

  it('применяет variant класс', () => {
    expect(mount(UidFooter, { props: { variant: 'minimal' } }).classes())
      .toContain('uid-pattern-footer--minimal')
    expect(mount(UidFooter, { props: { variant: 'columns' } }).classes())
      .toContain('uid-pattern-footer--columns')
  })

  it('рендерит default-слот', () => {
    const wrapper = mount(UidFooter, { slots: { default: '<span class="copy">© 2025</span>' } })
    expect(wrapper.find('.copy').exists()).toBe(true)
  })

  it('рендерит columns-слот', () => {
    const wrapper = mount(UidFooter, {
      props: { variant: 'columns' },
      slots: { columns: '<div class="col">Колонка</div>' },
    })
    expect(wrapper.find('.uid-pattern-footer__columns').exists()).toBe(true)
    expect(wrapper.find('.col').exists()).toBe(true)
  })

  it('рендерит bottom-слот', () => {
    const wrapper = mount(UidFooter, {
      slots: { default: '© 2025', bottom: '<span class="bottom">Terms</span>' },
    })
    expect(wrapper.find('.uid-pattern-footer__bottom').exists()).toBe(true)
  })
})
