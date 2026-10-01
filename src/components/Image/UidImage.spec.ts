import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UidImage from './UidImage.vue'

describe('UidImage', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('рендерит img с alt, lazy и decoding=async по умолчанию', () => {
    const wrapper = mount(UidImage, { props: { src: '/a.png', alt: 'Кот' } })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/a.png')
    expect(img.attributes('alt')).toBe('Кот')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('decoding')).toBe('async')
    expect(wrapper.attributes('data-status')).toBe('loading')
  })

  it('lazy=false ставит loading=eager', () => {
    const wrapper = mount(UidImage, { props: { src: '/a.png', alt: 'a', lazy: false } })
    expect(wrapper.find('img').attributes('loading')).toBe('eager')
  })

  it('применяет width/height и fit', () => {
    const wrapper = mount(UidImage, {
      props: { src: '/a.png', alt: 'a', width: 120, height: '4rem', fit: 'contain' },
    })
    const style = (wrapper.element as HTMLElement).style
    expect(style.width).toBe('120px')
    expect(style.height).toBe('4rem')
    expect(style.getPropertyValue('--uid-image-fit')).toBe('contain')
  })

  it('radius принимает имя токена', () => {
    const wrapper = mount(UidImage, { props: { src: '/a.png', alt: 'a', radius: 'full' } })
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--uid-image-radius'))
      .toBe('var(--uid-radius-full)')
  })

  it('эмитит load и переходит в loaded', async () => {
    const wrapper = mount(UidImage, { props: { src: '/a.png', alt: 'a' } })
    await wrapper.find('img').trigger('load')
    expect(wrapper.emitted('load')).toHaveLength(1)
    expect(wrapper.attributes('data-status')).toBe('loaded')
    expect(wrapper.find('.uid-image__placeholder').exists()).toBe(false)
  })

  it('при ошибке без fallbackSrc показывает заглушку', async () => {
    const wrapper = mount(UidImage, { props: { src: '/broken.png', alt: 'Фото' } })
    await wrapper.find('img').trigger('error')
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(wrapper.find('img').exists()).toBe(false)
    const fallback = wrapper.find('.uid-image__fallback')
    expect(fallback.exists()).toBe(true)
    expect(fallback.attributes('role')).toBe('img')
    expect(fallback.attributes('aria-label')).toBe('Фото')
  })

  it('при ошибке переключается на fallbackSrc', async () => {
    const wrapper = mount(UidImage, {
      props: { src: '/broken.png', alt: 'a', fallbackSrc: '/fallback.png' },
    })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').attributes('src')).toBe('/fallback.png')
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('.uid-image__fallback').exists()).toBe(true)
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('рендерит слот fallback', async () => {
    const wrapper = mount(UidImage, {
      props: { src: '/broken.png', alt: 'a' },
      slots: { fallback: '<span class="custom">нет фото</span>' },
    })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  it('сбрасывает состояние при смене src', async () => {
    const wrapper = mount(UidImage, { props: { src: '/broken.png', alt: 'a' } })
    await wrapper.find('img').trigger('error')
    await wrapper.setProps({ src: '/ok.png' })
    expect(wrapper.attributes('data-status')).toBe('loading')
    expect(wrapper.find('img').attributes('src')).toBe('/ok.png')
  })

  it('без preview нет кнопки', () => {
    const wrapper = mount(UidImage, { props: { src: '/a.png', alt: 'a' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('preview открывает модальное окно с previewSrc', async () => {
    const wrapper = mount(UidImage, {
      props: { src: '/thumb.png', alt: 'Фото', preview: true, previewSrc: '/full.png' },
      attachTo: document.body,
    })
    const trigger = wrapper.find('button.uid-image__trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    await trigger.trigger('click')
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.querySelector('.uid-image__preview-img')?.getAttribute('src')).toBe('/full.png')
    wrapper.unmount()
  })

  it('Escape закрывает просмотр', async () => {
    const wrapper = mount(UidImage, {
      props: { src: '/thumb.png', alt: 'Фото', preview: true },
      attachTo: document.body,
    })
    await wrapper.find('button.uid-image__trigger').trigger('click')
    await new Promise((r) => setTimeout(r, 0))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(document.querySelector('.uid-image__preview-img')).toBeNull()
    wrapper.unmount()
  })

  it('после ошибки превью недоступно', async () => {
    const wrapper = mount(UidImage, { props: { src: '/broken.png', alt: 'a', preview: true } })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('button.uid-image__trigger').exists()).toBe(false)
  })
})
