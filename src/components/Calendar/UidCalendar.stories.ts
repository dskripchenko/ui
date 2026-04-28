import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidCalendar, { type CalendarEvent } from './UidCalendar.vue'

const meta: Meta<typeof UidCalendar> = {
  title: 'Data Display/Calendar',
  component: UidCalendar,
  tags: ['autodocs'],
  argTypes: {
    compact: { control: 'boolean' },
    maxEventsPerDay: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidCalendar>

export const Default: Story = {
  render: () => ({
    components: { UidCalendar },
    setup: () => ({ value: ref<string | null>('2026-04-29') }),
    template: `<UidCalendar v-model="value" style="width:720px" />`,
  }),
}

export const WithEvents: Story = {
  render: () => ({
    components: { UidCalendar },
    setup: () => {
      const events: CalendarEvent[] = [
        { date: '2026-04-08', title: 'Демо', color: '#3b82f6' },
        { date: '2026-04-10', title: 'Митап Vue.js', color: '#10b981' },
        { date: '2026-04-15', title: '1:1 с CTO' },
        { date: '2026-04-15', title: 'Релиз 0.5', color: '#f59e0b' },
        { date: '2026-04-15', title: 'Звонок с заказчиком', color: '#ef4444' },
        { date: '2026-04-15', title: 'Ретро', color: '#8b5cf6' },
        { date: '2026-04-22', title: 'Спринт-планинг' },
        { date: '2026-04-29', title: 'Демо v0.5', color: '#10b981' },
      ]
      return { events, value: ref<string | null>('2026-04-15') }
    },
    template: `<UidCalendar v-model="value" :events="events" :max-events-per-day="3" style="width:720px" />`,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { UidCalendar },
    setup: () => {
      const events: CalendarEvent[] = [
        { date: '2026-04-08', title: 'A', color: '#3b82f6' },
        { date: '2026-04-15', title: 'B', color: '#10b981' },
        { date: '2026-04-15', title: 'C', color: '#f59e0b' },
        { date: '2026-04-22', title: 'D' },
      ]
      return { events, value: ref<string | null>('2026-04-15') }
    },
    template: `<UidCalendar v-model="value" :events="events" compact style="width:340px" />`,
  }),
}

export const MinMax: Story = {
  render: () => ({
    components: { UidCalendar },
    setup: () => ({ value: ref<string | null>(null) }),
    template: `
      <UidCalendar
        v-model="value"
        min="2026-04-10"
        max="2026-04-25"
        style="width:720px"
      />
    `,
  }),
}
