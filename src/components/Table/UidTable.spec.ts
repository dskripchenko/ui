import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UidTable from './UidTable.vue'

const columns = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'role', label: 'Роль' },
  { key: 'status', label: 'Статус', align: 'center' as const },
]

const data = [
  { name: 'Иван', role: 'Разработчик', status: 'Активен' },
  { name: 'Мария', role: 'Дизайнер', status: 'Активна' },
]

describe('UidTable', () => {
  it('рендерит заголовки колонок', () => {
    const wrapper = mount(UidTable, { props: { columns, data } })
    const headers = wrapper.findAll('.uid-table__th')
    expect(headers[0].text()).toContain('Имя')
    expect(headers[1].text()).toContain('Роль')
  })

  it('рендерит строки данных', () => {
    const wrapper = mount(UidTable, { props: { columns, data } })
    expect(wrapper.findAll('.uid-table__row').length).toBe(2)
  })

  it('рендерит данные ячеек', () => {
    const wrapper = mount(UidTable, { props: { columns, data } })
    const cells = wrapper.findAll('.uid-table__td')
    expect(cells[0].text()).toBe('Иван')
    expect(cells[1].text()).toBe('Разработчик')
  })

  it('показывает emptyText при пустых данных', () => {
    const wrapper = mount(UidTable, {
      props: { columns, data: [], emptyText: 'Нет записей' },
    })
    expect(wrapper.find('.uid-table__td--empty').text()).toBe('Нет записей')
  })

  it('показывает spinner при loading=true', () => {
    const wrapper = mount(UidTable, { props: { columns, data: [], loading: true } })
    expect(wrapper.find('.uid-spinner').exists()).toBe(true)
  })

  it('эмитит update:sortKey при клике на сортируемый заголовок', async () => {
    const wrapper = mount(UidTable, { props: { columns, data } })
    await wrapper.find('.uid-table__th--sortable').trigger('click')
    expect(wrapper.emitted('update:sortKey')?.[0]).toEqual(['name'])
  })

  it('переключает направление при повторном клике на тот же столбец', async () => {
    const wrapper = mount(UidTable, {
      props: { columns, data, sortKey: 'name', sortDirection: 'asc' },
    })
    await wrapper.find('.uid-table__th--sortable').trigger('click')
    expect(wrapper.emitted('update:sortDirection')?.[0]).toEqual(['desc'])
  })

  it('применяет striped класс', () => {
    const wrapper = mount(UidTable, { props: { columns, data, striped: true } })
    expect(wrapper.find('.uid-table').classes()).toContain('uid-table--striped')
  })

  it('aria-sort присутствует на отсортированном столбце', () => {
    const wrapper = mount(UidTable, {
      props: { columns, data, sortKey: 'name', sortDirection: 'asc' },
    })
    const th = wrapper.find('.uid-table__th--sortable')
    expect(th.attributes('aria-sort')).toBe('ascending')
  })

  it('3-режимная сортировка: asc → desc → none → asc', async () => {
    const wrapper = mount(UidTable, {
      props: { columns, data, sortKey: 'name', sortDirection: 'asc' },
    })
    // asc → desc
    await wrapper.find('.uid-table__th--sortable').trigger('click')
    expect(wrapper.emitted('update:sortDirection')?.[0]).toEqual(['desc'])

    // desc → none
    await wrapper.setProps({ sortDirection: 'desc' })
    await wrapper.find('.uid-table__th--sortable').trigger('click')
    expect(wrapper.emitted('update:sortKey')?.[0]).toEqual([null])
    expect(wrapper.emitted('update:sortDirection')?.[1]).toEqual([null])

    // none → asc (a fresh click while the direction is null)
    await wrapper.setProps({ sortDirection: null })
    await wrapper.find('.uid-table__th--sortable').trigger('click')
    expect(wrapper.emitted('update:sortDirection')?.[2]).toEqual(['asc'])
  })

  it('aria-sort=none для sortable столбца без активной сортировки', () => {
    const wrapper = mount(UidTable, {
      props: { columns, data, sortKey: null, sortDirection: null },
    })
    const th = wrapper.find('.uid-table__th--sortable')
    expect(th.attributes('aria-sort')).toBe('none')
  })

  it('selectable: рендерит чекбокс в header и в строках', () => {
    const wrapper = mount(UidTable, {
      props: { columns, data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }], selectable: true },
    })
    const checkboxes = wrapper.findAll('.uid-checkbox')
    expect(checkboxes.length).toBe(3) // header + 2 rows
  })

  it('selectable: header-checkbox эмитит update:selection с всеми id при checked', async () => {
    const wrapper = mount(UidTable, {
      props: {
        columns,
        data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
        selectable: true,
      },
    })
    const headerInput = wrapper.findAll('.uid-checkbox input')[0]
    await headerInput.setValue(true)
    const events = wrapper.emitted('update:selection')
    expect(events).toBeTruthy()
    expect(Array.from((events![0][0] as Set<number>))).toEqual([1, 2])
  })

  it('selectable: row-checkbox эмитит обновлённый Set с одним id', async () => {
    const wrapper = mount(UidTable, {
      props: {
        columns,
        data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
        selectable: true,
      },
    })
    const inputs = wrapper.findAll('.uid-checkbox input')
    await inputs[1].setValue(true)
    const events = wrapper.emitted('update:selection')
    expect(events).toBeTruthy()
    expect(Array.from((events![0][0] as Set<number>))).toEqual([1])
  })

  it('selectable: строка получает класс uid-table__row--selected', () => {
    const wrapper = mount(UidTable, {
      props: {
        columns,
        data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
        selectable: true,
        selection: new Set([1]),
      },
    })
    const rows = wrapper.findAll('.uid-table__row')
    expect(rows[0].classes()).toContain('uid-table__row--selected')
    expect(rows[1].classes()).not.toContain('uid-table__row--selected')
  })

  it('row-click эмитится при клике на строку', async () => {
    const wrapper = mount(UidTable, {
      props: { columns, data: [{ id: 1, name: 'A' }] },
    })
    await wrapper.find('.uid-table__row').trigger('click')
    expect(wrapper.emitted('row-click')?.[0]).toEqual([{ id: 1, name: 'A' }])
  })

  describe('fixed-колонки', () => {
    const fixedColumns = [
      { key: 'id', label: 'ID', width: '60px', fixed: 'left' as const },
      { key: 'name', label: 'Имя', width: '120px', fixed: 'left' as const },
      { key: 'role', label: 'Роль' },
      { key: 'email', label: 'Email' },
      { key: 'actions', label: '', width: '80px', fixed: 'right' as const },
      { key: 'status', label: 'Статус', width: '90px', fixed: 'right' as const },
    ]
    const fixedData = [
      { id: 1, name: 'A', role: 'r', email: 'a@x', actions: '…', status: 'ok' },
      { id: 2, name: 'B', role: 'r', email: 'b@x', actions: '…', status: 'ok' },
    ]

    it('без fixed колонок sticky-классов нет', () => {
      const wrapper = mount(UidTable, { props: { columns, data } })
      expect(wrapper.find('.uid-table__cell--fixed').exists()).toBe(false)
      expect(wrapper.find('.uid-table').classes()).not.toContain('uid-table--has-fixed')
    })

    it('вешает sticky-классы и накопительные смещения на th и td', () => {
      const wrapper = mount(UidTable, { props: { columns: fixedColumns, data: fixedData } })
      expect(wrapper.find('.uid-table').classes()).toContain('uid-table--has-fixed')
      const ths = wrapper.findAll('.uid-table__th')
      expect(ths[0].classes()).toContain('uid-table__cell--fixed-left')
      expect(ths[0].attributes('style')).toContain('left: 0px')
      expect(ths[1].attributes('style')).toContain('left: 60px')
      expect(ths[1].classes()).toContain('uid-table__cell--fixed-left-last')
      expect(ths[0].classes()).not.toContain('uid-table__cell--fixed-left-last')
      expect(ths[2].classes()).not.toContain('uid-table__cell--fixed')
      expect(ths[5].attributes('style')).toContain('right: 0px')
      expect(ths[4].attributes('style')).toContain('right: 90px')
      expect(ths[4].classes()).toContain('uid-table__cell--fixed-right-first')
      // width is kept alongside the offset
      expect(ths[1].attributes('style')).toContain('width: 120px')

      const tds = wrapper.findAll('.uid-table__row')[1].findAll('.uid-table__td')
      expect(tds[1].classes()).toContain('uid-table__cell--fixed-left')
      expect(tds[1].attributes('style')).toContain('left: 60px')
      expect(tds[4].classes()).toContain('uid-table__cell--fixed-right')
      expect(tds[4].attributes('style')).toContain('right: 90px')
      expect(tds[2].attributes('style')).toBeUndefined()
    })

    it('selectable: колонка выбора закрепляется слева и сдвигает остальные', () => {
      const wrapper = mount(UidTable, {
        props: { columns: fixedColumns, data: fixedData, selectable: true, selection: new Set([1]) },
      })
      const selectTh = wrapper.find('.uid-table__th--select')
      expect(selectTh.classes()).toContain('uid-table__cell--fixed-left')
      expect(selectTh.attributes('style')).toContain('left: 0px')
      const ths = wrapper.findAll('.uid-table__th')
      expect(ths[1].attributes('style')).toContain('left: 40px')
      expect(ths[2].attributes('style')).toContain('left: 100px')
      const selectedRow = wrapper.findAll('.uid-table__row')[0]
      expect(selectedRow.classes()).toContain('uid-table__row--selected')
      expect(selectedRow.find('.uid-table__td--select').classes()).toContain('uid-table__cell--fixed')
    })

    it('selectionFixed: колонка выбора закрепляется без fixed-колонок', () => {
      const plain = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
      ]
      const wrapper = mount(UidTable, {
        props: { columns: plain, data: fixedData, selectable: true, selectionFixed: true },
      })
      expect(wrapper.find('.uid-table').classes()).toContain('uid-table--has-fixed')
      const selectTh = wrapper.find('.uid-table__th--select')
      expect(selectTh.classes()).toContain('uid-table__cell--fixed-left')
      expect(selectTh.classes()).toContain('uid-table__cell--fixed-left-last')
      expect(selectTh.attributes('style')).toContain('left: 0px')
      const selectTd = wrapper.find('.uid-table__td--select')
      expect(selectTd.classes()).toContain('uid-table__cell--fixed-left')
      const ths = wrapper.findAll('.uid-table__th')
      expect(ths[1].classes()).not.toContain('uid-table__cell--fixed')
    })

    it('selectable без selectionFixed и fixed-колонок колонку выбора не закрепляет', () => {
      const wrapper = mount(UidTable, {
        props: { columns: [{ key: 'id', label: 'ID' }], data: fixedData, selectable: true },
      })
      expect(wrapper.find('.uid-table__th--select').classes()).not.toContain('uid-table__cell--fixed')
      expect(wrapper.find('.uid-table').classes()).not.toContain('uid-table--has-fixed')
    })

    it('selectionFixed: false не закрепляет колонку выбора даже с fixed-колонками', () => {
      const wrapper = mount(UidTable, {
        props: { columns: fixedColumns, data: fixedData, selectable: true, selectionFixed: false },
      })
      const selectTh = wrapper.find('.uid-table__th--select')
      expect(selectTh.classes()).not.toContain('uid-table__cell--fixed')
      expect(selectTh.attributes('style')).toBeUndefined()
      const ths = wrapper.findAll('.uid-table__th')
      expect(ths[1].attributes('style')).toContain('left: 0px')
    })

    it('использует измеренную ширину ячеек заголовка', async () => {
      const spy = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(150)
      try {
        const wrapper = mount(UidTable, { props: { columns: fixedColumns, data: fixedData } })
        await nextTick()
        const ths = wrapper.findAll('.uid-table__th')
        expect(ths[1].attributes('style')).toContain('left: 150px')
        expect(ths[4].attributes('style')).toContain('right: 150px')
      } finally {
        spy.mockRestore()
      }
    })

    it('ping-классы отражают горизонтальную прокрутку', async () => {
      const wrapper = mount(UidTable, { props: { columns: fixedColumns, data: fixedData } })
      const scroll = wrapper.find('.uid-table-scroll')
      const el = scroll.element as HTMLElement
      Object.defineProperty(el, 'clientWidth', { configurable: true, value: 300 })
      Object.defineProperty(el, 'scrollWidth', { configurable: true, value: 900 })
      el.scrollLeft = 100
      await scroll.trigger('scroll')
      expect(scroll.classes()).toContain('uid-table-scroll--ping-left')
      expect(scroll.classes()).toContain('uid-table-scroll--ping-right')
      el.scrollLeft = 600
      await scroll.trigger('scroll')
      expect(scroll.classes()).not.toContain('uid-table-scroll--ping-right')
    })
  })
})
