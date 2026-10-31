import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import UidEventCalendar from './UidEventCalendar.vue'

const meta = {
  title: 'Data/EventCalendar',
  component: UidEventCalendar,
  tags: ['autodocs'],
  argTypes: {
    editable: { control: 'boolean' },
    locked: { control: 'boolean' },
    lockable: { control: 'boolean' },
    view: { control: 'select', options: ['', 'day', 'week', 'month', 'year', 'agenda'] },
  },
} satisfies Meta<typeof UidEventCalendar>

export default meta
type Story = StoryObj<typeof meta>

const SOURCE = `# Releases and duty
date: 2026-11-15
tags: release=danger

2026-11-03 10:00-11:00 Release demo #release {where: Room 4}
2026-11-10..2026-11-14 Code freeze #release
every mon 11:00-11:30 Sprint planning {from: 2026-11-02, until: 2026-12-28, except: 2026-11-30}
every 2 weeks fri 16:00-17:00 Retro {from: 2026-11-06}
every month last fri Release to production #release
every year 12-31 New year freeze
`

/** An editable calendar that keeps its own source, as a host would after saving. */
export const Editable: Story = {
  args: { source: SOURCE, editable: true, lockable: true },
  render: (args) => ({
    components: { UidEventCalendar },
    setup() {
      const source = ref(args.source ?? '')
      const locked = ref(false)
      return { args, source, locked }
    },
    template: '<UidEventCalendar v-bind="args" :source="source" :locked="locked" @change="source = $event" @lock="locked = $event" />',
  }),
}

export const Week: Story = {
  args: { source: SOURCE, view: 'week', date: '2026-11-09' },
}
