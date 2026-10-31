import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import UidBoard from './UidBoard.vue'
import UidButton from '../Button/UidButton.vue'
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
    { key: 'TASK-1', title: 'Sign-in page', subtitle: 'TASK-1 · Anna', tags: [{ label: 'backend', tone: 'info' }] },
    { key: 'TASK-2', title: 'Export to CSV', subtitle: 'TASK-2 · Boris', targets: ['doing'] },
  ] },
  { key: 'doing', title: 'In progress', wip: 2, cards: [
    { key: 'TASK-3', title: 'Search filters', subtitle: 'TASK-3 · Vera', tags: [{ label: 'urgent', tone: 'danger' }] },
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

/** Cards with an assignee, a due date and done; columns with a real `total` and a «Load more» footer. */
export const CardFieldsAndPaging: Story = {
  args: { columns: [] },
  render: () => ({
    components: { UidBoard, UidButton },
    setup() {
      const today = '2026-11-10'
      const all = Array.from({ length: 23 }, (_, i) => ({
        key: `T-${i + 1}`,
        title: `Task ${i + 1}`,
        due: `2026-11-${String(5 + (i % 12)).padStart(2, '0')}`,
        assignee: i % 3 === 0 ? 'Anna Smirnova' : i % 3 === 1 ? { name: 'Boris', color: 'var(--uid-color-success)' } : undefined,
      }))
      const loaded = ref(5)
      const columns = computed<BoardColumn[]>(() => [
        { key: 'todo', title: 'To do', total: all.length, wip: 20, cards: all.slice(0, loaded.value) },
        { key: 'done', title: 'Done', cards: [
          { key: 'D-1', title: 'Release notes', due: '2026-11-01', done: true, assignee: 'Vera Orlova' },
        ] },
      ])
      return { columns, loaded, today, all }
    },
    template: `
      <UidBoard :columns="columns" :today="today">
        <template #column-footer="{ column }">
          <UidButton
            v-if="column.key === 'todo' && loaded < all.length"
            variant="ghost"
            size="sm"
            style="width:100%"
            @click="loaded += 5"
          >Load more ({{ all.length - loaded }})</UidButton>
        </template>
      </UidBoard>`,
  }),
}
