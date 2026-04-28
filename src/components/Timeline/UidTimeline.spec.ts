import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTimeline from './UidTimeline.vue'
import UidTimelineItem from './UidTimelineItem.vue'

describe('UidTimeline', () => {
  it('рендерит ol-список', () => {
    const wrapper = mount(UidTimeline)
    expect(wrapper.find('ol.uid-timeline').exists()).toBe(true)
  })

  it('применяет alternate-класс', () => {
    const wrapper = mount(UidTimeline, { props: { alternate: true } })
    expect(wrapper.classes()).toContain('uid-timeline--alternate')
  })
})

describe('UidTimelineItem', () => {
  it('рендерит title и description', () => {
    const wrapper = mount(UidTimelineItem, {
      props: { title: 'Заголовок', description: 'Текст' },
    })
    expect(wrapper.find('.uid-timeline-item__title').text()).toBe('Заголовок')
    expect(wrapper.find('.uid-timeline-item__description').text()).toBe('Текст')
  })

  it('рендерит time', () => {
    const wrapper = mount(UidTimelineItem, { props: { time: '12:00' } })
    expect(wrapper.find('.uid-timeline-item__time').text()).toBe('12:00')
  })

  it('применяет tone-класс', () => {
    const wrapper = mount(UidTimelineItem, { props: { tone: 'success', title: 'OK' } })
    expect(wrapper.classes()).toContain('uid-timeline-item--success')
  })

  it('по умолчанию neutral без класса', () => {
    const wrapper = mount(UidTimelineItem, { props: { title: 'X' } })
    expect(wrapper.classes()).not.toContain('uid-timeline-item--neutral')
  })

  it('рендерит default-слот вместо description', () => {
    const wrapper = mount(UidTimelineItem, {
      slots: { default: '<span class="custom">Custom</span>' },
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  it('добавляет with-icon класс при наличии icon', () => {
    const wrapper = mount(UidTimelineItem, {
      slots: { icon: '<svg />' },
    })
    expect(wrapper.classes()).toContain('uid-timeline-item--with-icon')
  })
})
