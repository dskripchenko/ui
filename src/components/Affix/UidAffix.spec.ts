import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UidAffix from './UidAffix.vue'

interface MockIO {
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  _trigger: (isIntersecting: boolean) => void
}
const ioInstances: MockIO[] = []

describe('UidAffix', () => {
  beforeEach(() => {
    ioInstances.length = 0
    class MockIntersectionObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      _trigger: (isIntersecting: boolean) => void
      constructor(cb: IntersectionObserverCallback) {
        this._trigger = (isIntersecting) => cb(
          [{ isIntersecting } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
        ioInstances.push(this as unknown as MockIO)
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    })
  })

  it('рендерит default-слот', () => {
    const wrapper = mount(UidAffix, {
      slots: { default: '<div class="content">x</div>' },
    })
    expect(wrapper.find('.content').exists()).toBe(true)
  })

  it('по умолчанию direction=top', () => {
    const wrapper = mount(UidAffix)
    expect(wrapper.classes()).toContain('uid-affix--top')
  })

  it('offsetBottom переключает на direction=bottom', () => {
    const wrapper = mount(UidAffix, { props: { offsetBottom: 20 } })
    expect(wrapper.classes()).toContain('uid-affix--bottom')
  })

  it('применяет offset через CSS-переменную', () => {
    const wrapper = mount(UidAffix, { props: { offsetTop: 64 } })
    expect(wrapper.attributes('style')).toContain('--uid-affix-offset: 64px')
  })

  it('переключает affixed-класс при !isIntersecting', async () => {
    const wrapper = mount(UidAffix, { props: { offsetTop: 0 } })
    ioInstances[0]._trigger(false)
    await nextTick()
    expect(wrapper.classes()).toContain('uid-affix--affixed')
    expect(wrapper.emitted('change')?.[0]).toEqual([true])
  })

  it('эмитит change=false при возврате', async () => {
    const wrapper = mount(UidAffix)
    ioInstances[0]._trigger(false)
    await nextTick()
    ioInstances[0]._trigger(true)
    await nextTick()
    expect(wrapper.classes()).not.toContain('uid-affix--affixed')
    expect(wrapper.emitted('change')?.[1]).toEqual([false])
  })
})
