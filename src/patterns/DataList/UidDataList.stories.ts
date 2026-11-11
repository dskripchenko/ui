import type { Meta, StoryObj } from '@storybook/vue3'
import UidDataList from './UidDataList.vue'

const items = [
  { id: 1, name: 'kb-editors', space: 'KB', members: 12 },
  { id: 2, name: 'kb-review', space: 'KB', members: 5 },
  { id: 3, name: 'general', space: '—', members: 420 },
]

const meta: Meta = {
  title: 'Patterns/DataList',
  component: UidDataList,
  tags: ['autodocs'],
  render: (args) => ({
    components: { UidDataList },
    setup: () => ({ args }),
    template: '<UidDataList v-bind="args"><template #row="{ row }"><span role="cell">{{ row.name }}</span><span role="cell">{{ row.space }}</span><span role="cell">{{ row.members }}</span></template><template #empty>Nothing matches</template></UidDataList>',
  }),
  args: {
    items,
    rowKey: (r: { id: number }) => r.id,
    label: 'Channels',
    searchLabel: 'Name or description',
    columns: [{ key: 'name', label: 'Channel' }, { key: 'space', label: 'Space', width: '100px' }, { key: 'members', label: 'Members', width: '100px' }],
    chips: [{ key: 'all', label: 'All', count: 3 }, { key: 'mine', label: 'Mine', count: 2 }],
    chip: 'all',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
export const Loading: Story = { args: { loading: true } }
export const Empty: Story = { args: { items: [] } }
