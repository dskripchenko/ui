import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidMessageFeed from './UidMessageFeed.vue'

interface Note {
  id: number
  author: string
  text: string
  at: number
}

const authors = ['Alice', 'Bob', 'Carol']
const lines = [
  'The draft of the onboarding article is ready for review.',
  'Looks good. One question about the second section: should we link the glossary?',
  'Yes — and KB-12 covers the same steps in more detail.\nI will add a short summary on top.',
  'Agreed.',
]

function makeNotes(count: number, startId = 1): Note[] {
  const start = Date.now() - count * 7 * 60_000
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    author: authors[Math.floor(i / 3) % authors.length],
    text: lines[i % lines.length],
    at: start + i * 7 * 60_000,
  }))
}

const meta: Meta = {
  title: 'Data/MessageFeed',
  component: UidMessageFeed,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj

const note = `
  <div style="padding: 2px 16px">
    <strong v-if="!grouped" style="display:block;margin-top:8px">{{ item.author }}</strong>
    <div style="white-space: pre-wrap">{{ item.text }}</div>
  </div>`

export const Default: Story = {
  render: () => ({
    components: { UidMessageFeed },
    setup: () => ({
      items: makeNotes(60),
      key: (n: Note) => n.id,
      date: (n: Note) => n.at,
      continues: (a: Note, b: Note) => a.author === b.author,
    }),
    template: `
      <UidMessageFeed :items="items" :item-key="key" :item-date="date" :continues="continues" :new-marker="55" label="Notes" style="height: 480px; border: 1px solid var(--uid-border-default)">
        <template #item="{ item, grouped }">${note}</template>
      </UidMessageFeed>`,
  }),
}

export const LoadOlder: Story = {
  render: () => ({
    components: { UidMessageFeed },
    setup: () => {
      const items = ref(makeNotes(40, 9_961))
      const loading = ref(false)
      const more = ref(true)
      function loadBefore() {
        loading.value = true
        setTimeout(() => {
          const first = items.value[0]
          const older = makeNotes(40, first.id - 40).map(n => ({ ...n, at: n.at - 40 * 7 * 60_000 }))
          items.value = [...older, ...items.value]
          more.value = items.value[0].id > 1
          loading.value = false
        }, 400)
      }
      function send() {
        const last = items.value[items.value.length - 1]
        items.value = [...items.value, { id: last.id + 1, author: 'Alice', text: 'One more note.', at: Date.now() }]
      }
      return { items, loading, more, loadBefore, send, key: (n: Note) => n.id, date: (n: Note) => n.at }
    },
    template: `
      <div>
        <UidMessageFeed :items="items" :item-key="key" :item-date="date" :has-more-before="more" :loading-before="loading" style="height: 480px; border: 1px solid var(--uid-border-default)" @load-before="loadBefore">
          <template #item="{ item, grouped }">${note}</template>
          <template #before><span style="padding: 2px 8px; background: var(--uid-surface-raised)">Loading…</span></template>
        </UidMessageFeed>
        <button style="margin-top: 8px" @click="send">Add a note</button>
      </div>`,
  }),
}
