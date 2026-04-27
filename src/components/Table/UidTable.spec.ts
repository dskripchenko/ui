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
})
