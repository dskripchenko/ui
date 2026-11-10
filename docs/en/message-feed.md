# Message feed

`UidMessageFeed` is a chat-like list of messages, oldest at the top and newest at the bottom. It renders only what is near the viewport, so tens of thousands of messages scroll smoothly, and messages may have any height — they are measured as they render.

- **Day dividers** come from `itemDate`; **groups** of messages by one author come from `continues`, and the slot gets `grouped` to drop the repeated header.
- **The "new" divider** goes before the message named by `newMarker`.
- **Loading older messages** keeps the reader on the same message: prepend items and nothing jumps, even when the new rows turn out taller than estimated.
- **Following the bottom**: while the reader is at the bottom, new messages keep it in view; once they scroll up, the feed stays where they are.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidMessageFeed } from '@dskripchenko/ui'

interface Note { id: number; author: string; text: string; at: string }

const notes = ref<Note[]>(await loadLatest())   // your own request
const loading = ref(false)
const more = ref(true)
const feed = ref<InstanceType<typeof UidMessageFeed> | null>(null)

async function loadOlder(): Promise<void> {
  loading.value = true
  const older = await loadBefore(notes.value[0].id)
  notes.value = [...older, ...notes.value]
  more.value = older.length > 0
  loading.value = false
}
</script>

<template>
  <UidMessageFeed
    ref="feed"
    :items="notes"
    :item-key="n => n.id"
    :item-date="n => n.at"
    :continues="(a, b) => a.author === b.author"
    :new-marker="firstUnreadId"
    :has-more-before="more"
    :loading-before="loading"
    label="Team notes"
    style="height: 100%"
    @load-before="loadOlder"
    @visible="range => markRead(range?.last)"
  >
    <template #item="{ item, grouped }">
      <NoteRow :note="item" :compact="grouped" />
    </template>
    <template #before>
      <UidSpinner size="sm" />
    </template>
  </UidMessageFeed>
</template>
```

The feed needs a height: give it one, or place it in a flex column with `min-height: 0`.

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `items` | `T[]` | — | Messages, oldest first |
| `itemKey` | `(item) => string \| number` | — | A stable key |
| `itemDate` | `(item) => Date \| string \| number` | — | Day dividers; without it there are none |
| `continues` | `(previous, item) => boolean` | — | Whether the message continues the previous one's group |
| `newMarker` | key | `null` | First new message; the divider goes before it |
| `estimatedItemHeight` | `number` | `56` | Height assumed until a message is measured |
| `overscan` | `number` | `600` | Pixels rendered beyond the viewport |
| `hasMoreBefore` / `hasMoreAfter` | `boolean` | `false` | Older / newer messages exist |
| `loadingBefore` / `loadingAfter` | `boolean` | `false` | A page is on its way; no more requests meanwhile |
| `followOutput` | `boolean` | `true` | Keep the newest message in view while at the bottom |
| `loadThreshold` | `number` | `400` | Distance from an edge at which more is asked for |
| `dayLabel` | `(date) => string` | Today / Yesterday / date | Text of a day divider |
| `newLabel` | `string` | locale | Text of the "new" divider |
| `label` | `string` | — | Accessible name |

A divider breaks a group: the first message of a day, and the first new one, always show their header.

## Events

| Event | Payload | |
|---|---|---|
| `loadBefore` | — | Near the top while `hasMoreBefore` |
| `loadAfter` | — | Near the bottom while `hasMoreAfter` |
| `atBottom` | `boolean` | The reader reached or left the bottom — show or hide a "jump to latest" button |
| `visible` | `{ first, last } \| null` | Keys of the messages in view — to mark them read |

## Slots

`item` (`{ item, index, grouped }`), `day` (`{ date, label }`), `new` (`{ label }`), `before` and `after` (shown at the top / bottom edge while loading), `empty`.

## Methods

Through a template ref: `scrollToBottom()` goes to the newest message and follows again; `scrollToKey(key, 'start' | 'center')` brings a message into view (to open the feed at the first new one, or jump to a quoted message) and returns `false` when the message is not loaded.

When the feed opens in the middle (`hasMoreAfter`), it does not follow the bottom until the newest page is loaded.

## Accessibility

The feed is a `role="feed"` with `aria-busy` while loading; each message is an `article` with `aria-posinset` and `aria-setsize` (`-1` while more can be loaded); dividers (days, "new") carry no role: a `feed` may hold only `article`s, and their text is read in order. Give the feed a `label`.
