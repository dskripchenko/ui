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

  it('подсвечивает код известного языка', () => {
    const wrapper = mount(UidCode, { props: { code: 'const a = 1', language: 'js' } })
    expect(wrapper.find('.uid-code__tok--keyword').text()).toBe('const')
    expect(wrapper.find('.uid-code__tok--number').text()).toBe('1')
    expect(wrapper.find('pre').text()).toBe('const a = 1')
    expect(wrapper.find('pre code').attributes('data-language')).toBe('js')
  })

  it('экранирует содержимое (без v-html)', () => {
    const wrapper = mount(UidCode, {
      props: { code: '<img src=x onerror="alert(1)">', language: 'html' },
    })
    expect(wrapper.find('pre img').exists()).toBe(false)
    expect(wrapper.find('pre').text()).toBe('<img src=x onerror="alert(1)">')
  })

  it('неизвестный язык рендерится как простой текст', () => {
    const wrapper = mount(UidCode, { props: { code: 'a + b', language: 'text' } })
    expect(wrapper.find('.uid-code__tok').exists()).toBe(false)
    expect(wrapper.find('pre').text()).toBe('a + b')
  })

  it('highlight=false отключает подсветку', () => {
    const wrapper = mount(UidCode, {
      props: { code: 'const a = 1', language: 'js', highlight: false },
    })
    expect(wrapper.find('.uid-code__tok').exists()).toBe(false)
  })

  it('номера строк работают вместе с подсветкой', () => {
    const wrapper = mount(UidCode, {
      props: { code: '/* a\nb */\nx', language: 'css', lineNumbers: true },
    })
    expect(wrapper.findAll('.uid-code__line-number')).toHaveLength(3)
    expect(wrapper.find('.uid-code__tok--comment').text()).toBe('/* a\nb */')
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

    it('копирует исходный текст, а не разметку подсветки', async () => {
      const wrapper = mount(UidCode, { props: { code: 'const a = "x"', language: 'ts' } })
      await wrapper.find('.uid-code__copy').trigger('click')
      expect(writeText).toHaveBeenCalledWith('const a = "x"')
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
