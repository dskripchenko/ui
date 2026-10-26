import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UidBoard from './UidBoard.vue'
import type { BoardColumn, BoardMove } from './UidBoard.vue'

const meta = {
  title: 'Data/Board',
  component: UidBoard,
  tags: ['autodocs'],
} satisfies Meta<typeof UidBoard>

export default meta
type Story = StoryObj<typeof meta>

const initial: BoardColumn[] = [
  { key: 'todo', title: 'To do', cards: [
    { key: 'GAL-1', title: 'Tenancy on schemas', subtitle: 'GAL-1 · Anna', tags: [{ label: 'backend', tone: 'info' }] },
    { key: 'GAL-2', title: 'Board component', subtitle: 'GAL-2 · Boris', targets: ['doing'] },
  ] },
  { key: 'doing', title: 'In progress', wip: 2, cards: [
    { key: 'GAL-3', title: 'GQL', subtitle: 'GAL-3 · Vera', tags: [{ label: 'urgent', tone: 'danger' }] },
  ] },
  { key: 'review', title: 'Review', cards: [] },
  { key: 'done', title: 'Done', cards: [] },
]

/** A board that applies its own moves, as a host would after saving. */
export const Default: Story = {
  args: { columns: initial },
  render: (args) => ({
    components: { UidBoard },
    setup() {
      const columns = ref<BoardColumn[]>(structuredClone(args.columns))
      function move(m: BoardMove): void {
        const from = columns.value.find((c) => c.key === m.from)
        const to = columns.value.find((c) => c.key === m.to)
        if (!from || !to) return
        from.cards = from.cards.filter((c) => c.key !== m.card.key)
        const at = m.beforeKey === null ? to.cards.length : to.cards.findIndex((c) => c.key === m.beforeKey)
        to.cards.splice(at < 0 ? to.cards.length : at, 0, m.card)
      }
      return { columns, move }
    },
    template: '<UidBoard :columns="columns" @move="move" />',
  }),
}

export const Swimlanes: Story = {
  args: {
    columns: [
      { key: 'todo', title: 'To do', cards: [{ key: 1, title: 'Write docs', lane: 'anna' }, { key: 2, title: 'Fix login', lane: 'boris' }] },
      { key: 'done', title: 'Done', cards: [{ key: 3, title: 'Release', lane: 'anna' }] },
    ],
    lanes: [{ key: 'anna', title: 'Anna' }, { key: 'boris', title: 'Boris' }],
  },
}
