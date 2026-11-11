import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import UidDataList from './UidDataList.vue'

const columns = [{ key: 'name', label: 'Канал' }, { key: 'n', label: 'Участники', width: '80px' }]
const rows = [{ id: 1, name: 'ops' }, { id: 2, name: 'pay' }]

describe('UidDataList', () => {
  it('рисует строки по слоту, чипы и поиск', async () => {
    const wrapper = mount(UidDataList<{ id: number; name: string }>, {
      props: { items: rows, rowKey: (r: { id: number }) => r.id, columns, label: 'Каналы', searchLabel: 'Название', chips: [{ key: 'all', label: 'Все', count: 2 }, { key: 'mine', label: 'Мои', count: 1 }], chip: 'all' },
      slots: { row: ({ row }: { row: { name: string } }) => h('span', { role: 'cell', class: 'c' }, row.name) },
    })
    expect(wrapper.findAll('.c').map((c) => c.text())).toEqual(['ops', 'pay'])
    await wrapper.findAll('.uid-data-list__chip')[1]?.trigger('click')
    expect(wrapper.emitted('update:chip')?.[0]).toEqual(['mine'])
    await wrapper.get('input').setValue('op')
    expect(wrapper.emitted('update:query')?.[0]).toEqual(['op'])
  })

  it('группы, пусто и загрузка', () => {
    const grouped = mount(UidDataList<{ id: number; name: string }>, {
      props: { groups: [{ key: 'OPS', title: 'OPS', summary: '1 канал', items: [rows[0]!] }], rowKey: (r: { id: number }) => r.id, columns, label: 'Каналы' },
      slots: { row: ({ row }: { row: { name: string } }) => h('span', { role: 'cell' }, row.name) },
    })
    expect(grouped.get('.uid-data-list__group-head').text()).toContain('OPS · 1 канал')
    const empty = mount(UidDataList, { props: { items: [], rowKey: () => 0, columns, label: 'x' }, slots: { empty: '<p class="none">Ничего</p>' } })
    expect(empty.find('.none').exists()).toBe(true)
    const loading = mount(UidDataList, { props: { items: [], rowKey: () => 0, columns, label: 'x', loading: true } })
    expect(loading.findAll('.uid-data-list__row--skeleton')).toHaveLength(6)
  })
})
