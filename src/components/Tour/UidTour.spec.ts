import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import UidTour, { type TourStep } from './UidTour.vue'

const steps: TourStep[] = [
  { title: 'Шаг 1', description: 'desc 1' },
  { title: 'Шаг 2', description: 'desc 2' },
  { title: 'Шаг 3', description: 'desc 3' },
]

describe('UidTour', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('не рендерит при modelValue=false', () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: false },
      attachTo: document.body,
    })
    expect(document.querySelector('.uid-tour')).toBeNull()
    wrapper.unmount()
  })

  it('рендерит при modelValue=true', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('.uid-tour')).not.toBeNull()
    wrapper.unmount()
  })

  it('показывает текущий шаг', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, current: 1 },
      attachTo: document.body,
    })
    await nextTick()
    const title = document.querySelector('.uid-tour__title')
    expect(title?.textContent).toBe('Шаг 2')
    wrapper.unmount()
  })

  it('показывает прогресс', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, current: 0 },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('.uid-tour__progress')?.textContent?.trim()).toBe('1 / 3')
    wrapper.unmount()
  })

  it('кнопка Далее переключает шаг', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, current: 0 },
      attachTo: document.body,
    })
    await nextTick()
    const buttons = document.querySelectorAll<HTMLButtonElement>('.uid-tour__btn')
    const nextBtn = buttons[buttons.length - 1]
    nextBtn.click()
    await nextTick()
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1])
    wrapper.unmount()
  })

  it('кнопка Назад появляется со 2го шага', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, current: 1 },
      attachTo: document.body,
    })
    await nextTick()
    const texts = Array.from(document.querySelectorAll('.uid-tour__btn')).map(b => b.textContent?.trim())
    expect(texts).toContain('Назад')
    wrapper.unmount()
  })

  it('последний шаг показывает Готово', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, current: 2 },
      attachTo: document.body,
    })
    await nextTick()
    const last = Array.from(document.querySelectorAll<HTMLButtonElement>('.uid-tour__btn--primary')).pop()
    expect(last?.textContent?.trim()).toBe('Готово')
    wrapper.unmount()
  })

  it('Готово эмитит finish и закрывает', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, current: 2 },
      attachTo: document.body,
    })
    await nextTick()
    const last = Array.from(document.querySelectorAll<HTMLButtonElement>('.uid-tour__btn--primary')).pop()
    last?.click()
    await nextTick()
    expect(wrapper.emitted('finish')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('Skip закрывает с close', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, current: 0, showSkip: true },
      attachTo: document.body,
    })
    await nextTick()
    const skip = Array.from(document.querySelectorAll<HTMLButtonElement>('.uid-tour__btn'))
      .find(b => b.textContent?.trim() === 'Пропустить')
    skip?.click()
    await nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('maskClosable=true закрывает по клику на маску', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, maskClosable: true },
      attachTo: document.body,
    })
    await nextTick()
    const mask = document.querySelector<HTMLElement>('.uid-tour__mask')
    mask?.click()
    await nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('maskClosable=false не закрывает', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true, maskClosable: false },
      attachTo: document.body,
    })
    await nextTick()
    const mask = document.querySelector<HTMLElement>('.uid-tour__mask')
    mask?.click()
    await nextTick()
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('центрирует popover без target', async () => {
    const wrapper = mount(UidTour, {
      props: { steps, modelValue: true },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('.uid-tour__popover--center')).not.toBeNull()
    wrapper.unmount()
  })
})
