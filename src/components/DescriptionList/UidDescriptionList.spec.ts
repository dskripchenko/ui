import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UidDescriptionList from './UidDescriptionList.vue'
import UidDescriptionItem from './UidDescriptionItem.vue'

describe('UidDescriptionList', () => {
  it('рендерит title', () => {
    const wrapper = mount(UidDescriptionList, { props: { title: 'Профиль' } })
    expect(wrapper.find('.uid-description-list__title').text()).toBe('Профиль')
  })

  it('применяет direction-класс', () => {
    expect(mount(UidDescriptionList).classes()).toContain('uid-description-list--horizontal')
    expect(mount(UidDescriptionList, { props: { direction: 'vertical' } }).classes())
      .toContain('uid-description-list--vertical')
  })

  it('применяет columns через CSS-переменную', () => {
    const wrapper = mount(UidDescriptionList, { props: { columns: 3 } })
    expect(wrapper.find('.uid-description-list__grid').attributes('style')).toContain('--uid-desc-cols: 3')
  })

  it('применяет bordered-класс', () => {
    const wrapper = mount(UidDescriptionList, { props: { bordered: true } })
    expect(wrapper.classes()).toContain('uid-description-list--bordered')
  })

  it('применяет size-класс', () => {
    expect(mount(UidDescriptionList, { props: { size: 'sm' } }).classes())
      .toContain('uid-description-list--sm')
    expect(mount(UidDescriptionList, { props: { size: 'lg' } }).classes())
      .toContain('uid-description-list--lg')
  })

  it('применяет labelWidth', () => {
    const wrapper = mount(UidDescriptionList, { props: { labelWidth: '200px' } })
    expect(wrapper.find('.uid-description-list__grid').attributes('style')).toContain('--uid-desc-label-width: 200px')
  })
})

describe('UidDescriptionItem', () => {
  it('рендерит label и value', () => {
    const wrapper = mount(UidDescriptionList, {
      slots: {
        default: '<div><dt class="lbl">Имя</dt><dd class="val">Иван</dd></div>',
      },
    })
    void wrapper
    const item = mount(UidDescriptionItem, {
      props: { label: 'Имя' },
      slots: { default: 'Иван' },
    })
    expect(item.find('.uid-description-item__label').text()).toBe('Имя')
    expect(item.find('.uid-description-item__value').text()).toBe('Иван')
  })

  it('применяет span через style', () => {
    const wrapper = mount(UidDescriptionItem, { props: { label: 'X', span: 2 } })
    expect(wrapper.attributes('style')).toContain('--uid-desc-span: 2')
  })

  it('label-слот переопределяет prop', () => {
    const wrapper = mount(UidDescriptionItem, {
      props: { label: 'orig' },
      slots: { label: '<span class="custom">custom</span>' },
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  describe('copyable', () => {
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

    it('показывает кнопку копирования', () => {
      const wrapper = mount(UidDescriptionItem, {
        props: { label: 'Email', copyable: true },
        slots: { default: 'a@b.c' },
      })
      expect(wrapper.find('.uid-description-item__copy').exists()).toBe(true)
    })

    it('копирует текстовое содержимое value', async () => {
      const wrapper = mount(UidDescriptionItem, {
        props: { label: 'Email', copyable: true },
        slots: { default: 'a@b.c' },
      })
      await wrapper.find('.uid-description-item__copy').trigger('click')
      expect(writeText).toHaveBeenCalledWith('a@b.c')
    })

    it('копирует copyValue если задан', async () => {
      const wrapper = mount(UidDescriptionItem, {
        props: { label: 'X', copyable: true, copyValue: 'override' },
        slots: { default: 'visible' },
      })
      await wrapper.find('.uid-description-item__copy').trigger('click')
      expect(writeText).toHaveBeenCalledWith('override')
    })
  })
})
