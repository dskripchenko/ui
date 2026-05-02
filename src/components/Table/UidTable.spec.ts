import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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

    // none → asc (новый клик при null direction)
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
})
