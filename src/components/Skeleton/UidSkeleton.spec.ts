import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidSkeleton from './UidSkeleton.vue'

describe('UidSkeleton', () => {
  it('рендерит одиночный span по умолчанию', () => {
    const wrapper = mount(UidSkeleton)
    expect(wrapper.find('span.uid-skeleton').exists()).toBe(true)
    expect(wrapper.find('.uid-skeleton-lines').exists()).toBe(false)
  })

  it('рендерит lines-контейнер при lines > 1', () => {
    const wrapper = mount(UidSkeleton, { props: { lines: 3 } })
    expect(wrapper.find('.uid-skeleton-lines').exists()).toBe(true)
    expect(wrapper.findAll('.uid-skeleton')).toHaveLength(3)
  })

  it('последняя строка при lines > 1 имеет width=60%', () => {
    const wrapper = mount(UidSkeleton, { props: { lines: 3, width: '100%' } })
    const spans = wrapper.findAll('.uid-skeleton')
    expect((spans[2].element as HTMLElement).style.width).toBe('60%')
  })

  it('применяет класс rounded при rounded=true', () => {
    const wrapper = mount(UidSkeleton, { props: { rounded: true } })
    expect(wrapper.find('.uid-skeleton').classes()).toContain('uid-skeleton--rounded')
  })

  it('применяет класс full при rounded="full"', () => {
    const wrapper = mount(UidSkeleton, { props: { rounded: 'full' } })
    expect(wrapper.find('.uid-skeleton').classes()).toContain('uid-skeleton--full')
  })

  it('устанавливает width и height через стиль', () => {
    const wrapper = mount(UidSkeleton, { props: { width: '200px', height: '20px' } })
    const el = wrapper.find('.uid-skeleton').element as HTMLElement
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('20px')
  })

  it('aria-hidden="true" присутствует', () => {
    const wrapper = mount(UidSkeleton)
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })
})
