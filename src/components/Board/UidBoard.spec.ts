import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidBoard from './UidBoard.vue'
import type { BoardColumn } from './UidBoard.vue'

function columns(): BoardColumn[] {
  return [
    { key: 'todo', title: 'To do', cards: [
      { key: 1, title: 'One', targets: ['doing'] },
      { key: 2, title: 'Two', tags: [{ label: 'ui', tone: 'info' }] },
    ] },
    { key: 'doing', title: 'Doing', wip: 1, cards: [{ key: 3, title: 'Three' }, { key: 4, title: 'Four' }] },
    { key: 'done', title: 'Done', cards: [] },
  ]
}

function dataTransfer(): DataTransfer {
  const store: Record<string, string> = {}
  return {
    setData: (k: string, v: string) => { store[k] = v },
    getData: (k: string) => store[k] ?? '',
    effectAllowed: 'all',
    dropEffect: 'none',
  } as unknown as DataTransfer
}

describe('UidBoard', () => {
  it('renders columns, cards, counts and the WIP warning', () => {
    const wrapper = mount(UidBoard, { props: { columns: columns() } })
    const sections = wrapper.findAll('.uid-board__column')
    expect(sections).toHaveLength(3)
    expect(sections[0]!.findAll('.uid-board__card')).toHaveLength(2)
    expect(sections[1]!.find('.uid-board__count').text()).toBe('2/1')
    expect(sections[1]!.classes()).toContain('uid-board__column--over')
    expect(sections[2]!.find('.uid-board__empty').exists()).toBe(true)
    expect(wrapper.find('.uid-board__tag--info').text()).toBe('ui')
  })

  it('emits a move with the neighbours at the drop point', async () => {
    const wrapper = mount(UidBoard, { props: { columns: columns() } })
    const dt = dataTransfer()
    const card = wrapper.findAll('.uid-board__card')[1]! // Two, any target
    await card.trigger('dragstart', { dataTransfer: dt })
    const four = wrapper.findAll('.uid-board__column')[1]!.findAll('.uid-board__card')[1]!
    await four.trigger('dragover', { dataTransfer: dt })
    await four.trigger('drop', { dataTransfer: dt })

    expect(wrapper.emitted('move')?.[0]?.[0]).toMatchObject({ from: 'todo', to: 'doing', afterKey: 3, beforeKey: 4 })
  })

  it('drops at the end of a column and refuses columns outside the targets', async () => {
    const wrapper = mount(UidBoard, { props: { columns: columns() } })
    const dt = dataTransfer()
    const one = wrapper.findAll('.uid-board__card')[0]! // One → only doing
    await one.trigger('dragstart', { dataTransfer: dt })

    const done = wrapper.findAll('.uid-board__column')[2]!
    expect(done.classes()).toContain('uid-board__column--blocked')
    await done.trigger('drop', { dataTransfer: dt })
    expect(wrapper.emitted('move')).toBeUndefined()

    const doing = wrapper.findAll('.uid-board__column')[1]!
    await doing.trigger('dragover', { dataTransfer: dt })
    await doing.trigger('drop', { dataTransfer: dt })
    expect(wrapper.emitted('move')?.[0]?.[0]).toMatchObject({ to: 'doing', afterKey: 4, beforeKey: null })
  })

  it('moves with Alt+arrows to the nearest allowed column and opens on Enter', async () => {
    const wrapper = mount(UidBoard, { props: { columns: columns() } })
    const one = wrapper.findAll('.uid-board__card')[0]!
    await one.trigger('keydown', { key: 'ArrowRight', altKey: true })
    expect(wrapper.emitted('move')?.[0]?.[0]).toMatchObject({ from: 'todo', to: 'doing' })

    await one.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('open')?.[0]?.[0]).toMatchObject({ key: 1 })
  })

  it('does not emit a move for a drop on the same place', async () => {
    const wrapper = mount(UidBoard, { props: { columns: columns() } })
    const dt = dataTransfer()
    const two = wrapper.findAll('.uid-board__card')[1]!
    await two.trigger('dragstart', { dataTransfer: dt })
    const todo = wrapper.findAll('.uid-board__column')[0]!
    await todo.trigger('dragover', { dataTransfer: dt })
    await todo.trigger('drop', { dataTransfer: dt })
    expect(wrapper.emitted('move')).toBeUndefined()
  })

  it('groups cards into swimlanes', () => {
    const cols = columns()
    cols[0]!.cards[0]!.lane = 'a'
    cols[0]!.cards[1]!.lane = 'b'
    const wrapper = mount(UidBoard, { props: { columns: cols, lanes: [{ key: 'a', title: 'Anna' }, { key: 'b', title: 'Boris' }] } })
    const lanes = wrapper.findAll('.uid-board__lane')
    expect(lanes).toHaveLength(2)
    expect(lanes[0]!.find('.uid-board__lane-title').text()).toBe('Anna')
    expect(lanes[0]!.findAll('.uid-board__column')[0]!.findAll('.uid-board__card')).toHaveLength(1)
    expect(lanes[1]!.findAll('.uid-board__header')).toHaveLength(0)
  })

  it('readonly: карточки не перетаскиваются и не двигаются клавишами, но открываются', async () => {
    const wrapper = mount(UidBoard, {
      props: {
        readonly: true,
        columns: [
          { key: 'a', title: 'A', cards: [{ key: 1, title: 'One' }] },
          { key: 'b', title: 'B', cards: [] },
        ],
      },
    })
    const card = wrapper.find('.uid-board__card')
    expect(card.attributes('draggable')).toBe('false')
    await card.trigger('keydown', { key: 'ArrowRight', altKey: true })
    expect(wrapper.emitted('move')).toBeUndefined()
    await card.trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })
})
