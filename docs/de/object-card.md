# UidObjectCard

Ein Objekt eines anderen Systems im Verlauf — ein Artikel, ein Ticket, eine Bestellung: Code, Zustand, Titel, eine Zeile mit Angaben und Platz für Schnellaktionen und einen Hinweis. Die Karte kennt das andere System nicht: Sie zeigt, was sie bekommt, und meldet, wenn der Zustand gedrückt wird.

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

| Prop | Typ | Standard | |
|---|---|---|---|
| `code` | `string` | — | Code des Objekts, in Monospace |
| `title` | `string` | — | Pflicht |
| `status` | `{ label: string; tone?: 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' }` | — | Pille in ihrem Ton |
| `statusAction` | `boolean` | `false` | Der Zustand ist ein Button: Ereignis `status` mit ihm selbst als Anker eines Menüs |
| `statusActionLabel` | `string` | — | Barrierefreier Name des Buttons, vor dem Zustand gelesen |
| `href` / `hrefLabel` | `string` | — | Link zum Objekt in seinem System, in einem neuen Tab |
| `busy` / `busyLabel` | `boolean` / `string` | `false` | Eine Änderung läuft: Text mit Spinner statt Zustand, Aktionen inaktiv |
| `invalid` | `boolean` | `false` | Roter Rahmen; was schiefging, im Slot `notice` |
| `size` | `'sm' \| 'md'` | `'md'` | `sm` für einen Thread oder ein Popover |

## Slots

`icon` (vor dem Code), `default` (zwischen Titel und Angaben), `meta`, `actions` (unter einer Linie), `notice` (ganz unten).

## Ereignisse

`status(anchor: HTMLElement)` — der Zustand-Button wurde gedrückt.

## CSS-Variablen

`--uid-object-card-max-width` (560px).
