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

const planning: CalendarEvent[] = [
  { id: 1, date: '2026-11-02', time: '11:00', endTime: '11:30', title: 'Планирование спринта', color: '#3b82f6' },
  { id: 2, date: '2026-11-03', time: '10:00', endTime: '11:00', title: 'Демо релиза 3.0', color: '#10b981' },
  { id: 3, date: '2026-11-03', time: '10:30', endTime: '12:00', title: 'Разбор инцидента', color: '#ef4444' },
  { id: 4, date: '2026-11-03', time: '14:00', endTime: '14:30', title: '1:1', color: '#8b5cf6' },
  { id: 5, date: '2026-11-05', time: '16:00', endTime: '17:00', title: 'Ретро', color: '#f59e0b' },
  { id: 6, date: '2026-11-10', endDate: '2026-11-14', title: 'Код-фриз', color: '#ef4444' },
  { id: 7, date: '2026-11-04', title: 'Дежурство: Анна' },
  { id: 8, date: '2026-11-27', title: 'Релиз в прод', color: '#10b981' },
]

export const Views: Story = {
  name: 'Виды: день, неделя, месяц, год, повестка',
  render: () => ({
    components: { UidCalendar },
    setup: () => ({
      events: planning,
      view: ref<'day' | 'week' | 'month' | 'year' | 'agenda'>('week'),
      anchor: ref<string | null>('2026-11-04'),
      views: ['day', 'week', 'month', 'year', 'agenda'],
    }),
    template: `<UidCalendar v-model:view="view" v-model:anchor="anchor" :views="views" :events="events" style="width:960px" />`,
  }),
}

export const Editable: Story = {
  name: 'Правка: перенос, растягивание, новое событие',
  render: () => ({
    components: { UidCalendar },
    setup: () => {
      const events = ref<CalendarEvent[]>(planning.map((e) => ({ ...e })))
      let next = 100
      const onMove = (m: { event: CalendarEvent; date: string; endDate?: string; time?: string; endTime?: string }) => {
        events.value = events.value.map((e) => (e === m.event ? { ...e, date: m.date, endDate: m.endDate, time: m.time ?? e.time, endTime: m.endTime ?? e.endTime } : e))
      }
      const onSlot = (s: { date: string; time?: string }) => {
        events.value = [...events.value, { id: next++, date: s.date, time: s.time, title: 'Новое событие' }]
      }
      return { events, onMove, onSlot, views: ['day', 'week', 'month'], view: ref('week'), anchor: ref('2026-11-04') }
    },
    template: `<UidCalendar v-model:view="view" v-model:anchor="anchor" :views="views" :events="events" editable style="width:960px" @event-move="onMove" @slot-click="onSlot" />`,
  }),
}
