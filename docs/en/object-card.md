# UidObjectCard

An object of another system shown in a feed — an article, a ticket, an order: its code, its status, its title, a meta line, and room for quick actions and a notice. The card does not know the other system: it shows what it is given and says when the status is pressed.

```vue
<UidObjectCard
  code="KB-12"
  title="Refund policy needs the new terms"
  :status="{ label: 'Draft', tone: 'info' }"
  status-action
  status-action-label="Change state"
  href="https://kb.example/KB-12"
  href-label="Open"
  :busy="moving"
  busy-label="Sending to review…"
  :invalid="refused !== null"
  @status="(anchor) => openMoves(anchor)"
>
  <template #icon><FileText :size="14" /></template>
  <template #meta><span>Anna Lee</span><span>Updated 2 days ago</span></template>
  <template #actions>
    <UidButton variant="secondary" size="sm">Assign</UidButton>
    <UidButton variant="secondary" size="sm">Comment</UidButton>
  </template>
  <template #notice>
    <UidAlert v-if="refused" variant="danger" :title="refused.title">{{ refused.why }}</UidAlert>
  </template>
</UidObjectCard>
```

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `code` | `string` | — | The object's code, in monospace |
| `title` | `string` | — | Required |
| `status` | `{ label: string; tone?: 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' }` | — | A pill in its tone |
| `statusAction` | `boolean` | `false` | The status is a button: emits `status` with itself as the anchor of a menu |
| `statusActionLabel` | `string` | — | Accessible name of that button, read before the status |
| `href` / `hrefLabel` | `string` | — | A link to the object in its own system, opened in a new tab |
| `busy` / `busyLabel` | `boolean` / `string` | `false` | A change is under way: the label with a spinner in place of the status; the actions are inert |
| `invalid` | `boolean` | `false` | A danger border; say what went wrong in the `notice` slot |
| `size` | `'sm' \| 'md'` | `'md'` | `sm` for a thread or a popover |

## Slots

`icon` (before the code), `default` (between the title and the meta), `meta`, `actions` (under a divider), `notice` (under everything).

## Events

`status(anchor: HTMLElement)` — the status button was pressed.

## CSS variables

`--uid-object-card-max-width` (560px).
