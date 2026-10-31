import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidBoard from './UidBoard.vue'
import type { BoardColumn } from './UidBoard.vue'
import type { BoardAssignee, BoardCard, BoardMove, UidBoardProps } from '../../index.js'

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

  it('бросок карточки не уходит на страницу (её обработчики файлов его не видят)', async () => {
    const wrapper = mount(UidBoard, {
      attachTo: document.body,
      props: {
        columns: [
          { key: 'a', title: 'A', cards: [{ key: 1, title: 'One' }] },
          { key: 'b', title: 'B', cards: [] },
        ],
      },
    })
    let reached = 0
    const onPage = (): void => { reached++ }
    document.addEventListener('drop', onPage)
    document.addEventListener('dragover', onPage)
    await wrapper.find('.uid-board__card').trigger('dragstart', { dataTransfer: { setData: () => {}, effectAllowed: 'move' } })
    const column = wrapper.findAll('.uid-board__column')[1]
    const target = column.find('.uid-board__cards').exists() ? column.find('.uid-board__cards') : column
    await target.trigger('dragover', { dataTransfer: { dropEffect: '' } })
    await target.trigger('drop', { dataTransfer: {} })
    document.removeEventListener('drop', onPage)
    document.removeEventListener('dragover', onPage)
    expect(reached).toBe(0)
    expect(wrapper.emitted('move')).toHaveLength(1)
    wrapper.unmount()
  })
  it('total: the header count and the WIP check use the real count', () => {
    const wrapper = mount(UidBoard, {
      props: {
        columns: [
          { key: 'a', title: 'A', total: 40, wip: 10, cards: [{ key: 1, title: 'One' }] },
          { key: 'b', title: 'B', total: 3, wip: 5, cards: [] },
          { key: 'c', title: 'C', cards: [{ key: 2, title: 'Two' }] },
        ],
      },
      slots: { 'column-header': '<template #column-header="{ column, count, over }"><i class="h">{{ column.key }}:{{ count }}:{{ over }}</i></template>' },
    })
    expect(wrapper.findAll('.h').map((h) => h.text())).toEqual(['a:40:true', 'b:3:false', 'c:1:false'])

    const plain = mount(UidBoard, { props: { columns: [{ key: 'a', title: 'A', total: 40, wip: 10, cards: [{ key: 1, title: 'One' }] }, { key: 'b', title: 'B', total: 3, cards: [] }] } })
    const sections = plain.findAll('.uid-board__column')
    expect(sections[0]!.find('.uid-board__count').text()).toBe('40/10')
    expect(sections[0]!.classes()).toContain('uid-board__column--over')
    expect(sections[0]!.find('.uid-board__count').attributes('title')).toBe('Превышен лимит незавершённой работы')
    // Unloaded cards are not "empty".
    expect(sections[1]!.find('.uid-board__empty').exists()).toBe(false)
  })

  it('column-footer: rendered once per column, below the last lane', () => {
    const wrapper = mount(UidBoard, {
      props: {
        columns: [
          { key: 'a', title: 'A', cards: [{ key: 1, title: 'One', lane: 'x' }] },
          { key: 'b', title: 'B', cards: [] },
        ],
        lanes: [{ key: 'x', title: 'X' }, { key: 'y', title: 'Y' }],
      },
      slots: { 'column-footer': '<template #column-footer="{ column }"><button class="more">more {{ column.key }}</button></template>' },
    })
    const lanes = wrapper.findAll('.uid-board__lane')
    expect(lanes[0]!.findAll('.uid-board__footer')).toHaveLength(0)
    expect(lanes[1]!.findAll('.uid-board__footer .more').map((b) => b.text())).toEqual(['more a', 'more b'])
    // Without the slot there is no footer element at all.
    expect(mount(UidBoard, { props: { columns: columns() } }).find('.uid-board__footer').exists()).toBe(false)
  })

  it('card fields: assignee, due, overdue and done', () => {
    const cards: BoardCard[] = [
      { key: 1, title: 'Late', due: '2026-03-01', assignee: 'Anna Petrova' },
      { key: 2, title: 'Done late', due: '2026-03-01', done: true, assignee: { name: 'Boris', avatar: 'https://example.com/b.png' } },
      { key: 3, title: 'Soon', due: '2026-03-20', assignee: { name: 'Vera', color: 'var(--uid-color-success)' } },
      { key: 4, title: 'Next year', due: '2027-01-05' },
      { key: 5, title: 'Plain' },
    ]
    const wrapper = mount(UidBoard, { props: { today: '2026-03-10', columns: [{ key: 'a', title: 'A', cards }] } })
    const [late, doneLate, soon, nextYear, plain] = wrapper.findAll('.uid-board__card')

    expect(late!.classes()).toContain('uid-board__card--overdue')
    expect(late!.find('.uid-board__due--overdue').exists()).toBe(true)
    expect(late!.find('.uid-board__due').text()).toContain('Просрочено')
    expect(late!.find('time').attributes('datetime')).toBe('2026-03-01')
    expect(late!.find('time').text()).toBe(new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(2026, 2, 1)))
    expect(late!.find('.uid-board__assignee').text()).toBe('AP')
    expect(late!.find('.uid-board__assignee').attributes('aria-label')).toBe('Исполнитель: Anna Petrova')

    expect(doneLate!.classes()).toContain('uid-board__card--done')
    expect(doneLate!.classes()).not.toContain('uid-board__card--overdue')
    expect(doneLate!.find('.uid-board__due--overdue').exists()).toBe(false)
    expect(doneLate!.find('.uid-board__assignee img').attributes('src')).toBe('https://example.com/b.png')

    expect(soon!.find('.uid-board__due--overdue').exists()).toBe(false)
    expect(soon!.find('.uid-board__assignee').attributes('style')).toContain('--uid-board-avatar-bg: var(--uid-color-success)')
    expect(nextYear!.find('time').text()).toContain('2027')
    expect(plain!.find('.uid-board__card-foot').exists()).toBe(false)
  })

  it('the card slot still replaces the whole card', () => {
    const wrapper = mount(UidBoard, {
      props: { today: '2026-03-10', columns: [{ key: 'a', title: 'A', cards: [{ key: 1, title: 'Late', due: '2026-03-01', assignee: 'Anna' }] }] },
      slots: { card: '<template #card="{ card }"><b class="own">{{ card.title }}</b></template>' },
    })
    expect(wrapper.find('.own').text()).toBe('Late')
    expect(wrapper.find('.uid-board__card-foot').exists()).toBe(false)
  })

  it('exports the payload types', () => {
    const move: BoardMove = { card: { key: 1, title: 'x' }, from: 'a', to: 'b', beforeKey: null, afterKey: null, lane: null }
    const who: BoardAssignee = { name: 'Anna', color: 'var(--uid-color-info)' }
    const props: UidBoardProps = { columns: [{ key: 'a', title: 'A', total: 2, cards: [{ ...move.card, assignee: who, due: '2026-01-01', done: true }] }], today: '2026-01-02' }
    expect(props.columns[0]!.total).toBe(2)
  })
})

