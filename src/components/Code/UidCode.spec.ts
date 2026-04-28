import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UidCode from './UidCode.vue'

describe('UidCode', () => {
  it('рендерит блок с кодом', () => {
    const wrapper = mount(UidCode, { props: { code: 'const x = 1' } })
    expect(wrapper.find('pre').text()).toBe('const x = 1')
  })

  it('inline вариант рендерит <code>', () => {
    const wrapper = mount(UidCode, { props: { code: 'inline', inline: true } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('code')
    expect(wrapper.classes()).toContain('uid-code--inline')
  })

  it('показывает language', () => {
    const wrapper = mount(UidCode, { props: { code: 'x', language: 'TypeScript' } })
    expect(wrapper.find('.uid-code__lang').text()).toBe('TypeScript')
  })

  it('показывает кнопку копирования по умолчанию', () => {
    const wrapper = mount(UidCode, { props: { code: 'x' } })
    expect(wrapper.find('.uid-code__copy').exists()).toBe(true)
  })

  it('скрывает кнопку при copy=false', () => {
    const wrapper = mount(UidCode, { props: { code: 'x', copy: false } })
    expect(wrapper.find('.uid-code__copy').exists()).toBe(false)
  })

  it('показывает номера строк при lineNumbers=true', () => {
    const wrapper = mount(UidCode, {
      props: { code: 'a\nb\nc', lineNumbers: true },
    })
    expect(wrapper.findAll('.uid-code__line-number')).toHaveLength(3)
  })

  it('применяет wrap-класс', () => {
    const wrapper = mount(UidCode, { props: { code: 'x', wrap: true } })
    expect(wrapper.classes()).toContain('uid-code--wrap')
  })

  it('применяет maxHeight', () => {
    const wrapper = mount(UidCode, { props: { code: 'x', maxHeight: '200px' } })
    expect(wrapper.attributes('style')).toContain('--uid-code-max-height: 200px')
  })

  it('рендерит кастомный default-слот', () => {
    const wrapper = mount(UidCode, {
      slots: { default: '<span class="hl">highlighted</span>' },
    })
    expect(wrapper.find('.hl').exists()).toBe(true)
  })

  describe('копирование', () => {
    let writeText: ReturnType<typeof vi.fn>

    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: { writeText } },
        writable: true,
        configurable: true,
      })
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('копирует в буфер при клике', async () => {
      const wrapper = mount(UidCode, { props: { code: 'hello' } })
      await wrapper.find('.uid-code__copy').trigger('click')
      expect(writeText).toHaveBeenCalledWith('hello')
    })

    it('показывает «Скопировано» после клика', async () => {
      const wrapper = mount(UidCode, { props: { code: 'hello' } })
      await wrapper.find('.uid-code__copy').trigger('click')
      await Promise.resolve()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.uid-code__copy').classes()).toContain('uid-code__copy--copied')
    })
  })
})
