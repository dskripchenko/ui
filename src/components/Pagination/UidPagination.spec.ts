import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidPagination from './UidPagination.vue'
import UidPaginationCursor from './UidPaginationCursor.vue'
import UidLoadMore from './UidLoadMore.vue'
import UidPageSize from './UidPageSize.vue'

describe('UidPagination', () => {
  it('рендерит кнопки страниц', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 1, total: 50, perPage: 10 } })
    const btns = wrapper.findAll('.uid-pagination__btn:not(.uid-pagination__btn--nav)')
    expect(btns.length).toBe(5)
  })

  it('активная страница имеет uid-pagination__btn--active', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 2, total: 50, perPage: 10 } })
    const active = wrapper.findAll('.uid-pagination__btn--active')
    expect(active.length).toBe(1)
    expect(active[0].text()).toBe('2')
  })

  it('эмитит update:modelValue при клике', async () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 1, total: 50, perPage: 10 } })
    const pageBtns = wrapper.findAll('.uid-pagination__btn:not(.uid-pagination__btn--nav)')
    await pageBtns[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('prev кнопка disabled на первой странице', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 1, total: 50, perPage: 10 } })
    const [prev] = wrapper.findAll('.uid-pagination__btn--nav')
    expect(prev.attributes('disabled')).toBeDefined()
  })

  it('next кнопка disabled на последней странице', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 5, total: 50, perPage: 10 } })
    const navBtns = wrapper.findAll('.uid-pagination__btn--nav')
    expect(navBtns[1].attributes('disabled')).toBeDefined()
  })

  it('показывает ellipsis при большом количестве страниц', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 5, total: 200, perPage: 10 } })
    expect(wrapper.findAll('.uid-pagination__ellipsis').length).toBeGreaterThanOrEqual(1)
  })

  it('всегда рендерит первую и последнюю страницу', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 5, total: 200, perPage: 10 } })
    const btns = wrapper.findAll('.uid-pagination__btn:not(.uid-pagination__btn--nav)')
    const texts = btns.map(b => b.text())
    expect(texts).toContain('1')
    expect(texts).toContain('20')
  })

  it('aria-current="page" на активной странице', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 3, total: 50, perPage: 10 } })
    expect(wrapper.find('[aria-current="page"]').text()).toBe('3')
  })

  it('nav с aria-label присутствует', () => {
    const wrapper = mount(UidPagination, { props: { modelValue: 1, total: 10, perPage: 10 } })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Пагинация')
  })
})

describe('UidPaginationCursor', () => {
  it('prev кнопка disabled при hasPrev=false', () => {
    const wrapper = mount(UidPaginationCursor, { props: { hasPrev: false, hasNext: true } })
    expect(wrapper.findAll('button')[0].attributes('disabled')).toBeDefined()
  })

  it('next кнопка disabled при hasNext=false', () => {
    const wrapper = mount(UidPaginationCursor, { props: { hasPrev: true, hasNext: false } })
    expect(wrapper.findAll('button')[1].attributes('disabled')).toBeDefined()
  })

  it('эмитит prev', async () => {
    const wrapper = mount(UidPaginationCursor, { props: { hasPrev: true, hasNext: true } })
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('prev')).toHaveLength(1)
  })

  it('эмитит next', async () => {
    const wrapper = mount(UidPaginationCursor, { props: { hasPrev: true, hasNext: true } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })
})

describe('UidLoadMore', () => {
  it('рендерит кнопку', () => {
    const wrapper = mount(UidLoadMore)
    expect(wrapper.find('.uid-load-more__btn').exists()).toBe(true)
  })

  it('эмитит load при клике', async () => {
    const wrapper = mount(UidLoadMore)
    await wrapper.find('.uid-load-more__btn').trigger('click')
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('кнопка disabled при loading=true', () => {
    const wrapper = mount(UidLoadMore, { props: { loading: true } })
    expect(wrapper.find('.uid-load-more__btn').attributes('disabled')).toBeDefined()
  })

  it('пользовательский label', () => {
    const wrapper = mount(UidLoadMore, { props: { label: 'Загрузить ещё' } })
    expect(wrapper.find('.uid-load-more__btn span').text()).toBe('Загрузить ещё')
  })
})

describe('UidPageSize', () => {
  it('рендерит select с опциями', () => {
    const wrapper = mount(UidPageSize, { props: { modelValue: 10 } })
    expect(wrapper.findAll('option').length).toBe(4)
  })

  it('эмитит update:modelValue при изменении', async () => {
    const wrapper = mount(UidPageSize, { props: { modelValue: 10 } })
    await wrapper.find('select').setValue('25')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([25])
  })

  it('кастомные опции', () => {
    const wrapper = mount(UidPageSize, { props: { modelValue: 5, options: [5, 10, 20] } })
    expect(wrapper.findAll('option').length).toBe(3)
  })
})
