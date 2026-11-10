# UidObjectCard

Объект другой системы в ленте — статья, заявка, заказ: код, состояние, заголовок, строка сведений и место для быстрых действий и уведомления. Карточка не знает другой системы: показывает то, что ей дали, и сообщает, когда нажали на состояние.

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

## Свойства

| Свойство | Тип | По умолчанию | |
|---|---|---|---|
| `code` | `string` | — | Код объекта, моноширинным |
| `title` | `string` | — | Обязательно |
| `status` | `{ label: string; tone?: 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' }` | — | Пилюля в своём тоне |
| `statusAction` | `boolean` | `false` | Состояние — кнопка: событие `status` с ней самой как якорем меню |
| `statusActionLabel` | `string` | — | Доступное имя кнопки, читается перед состоянием |
| `href` / `hrefLabel` | `string` | — | Ссылка на объект в его системе, в новой вкладке |
| `busy` / `busyLabel` | `boolean` / `string` | `false` | Идёт изменение: подпись со спиннером вместо состояния, действия неактивны |
| `invalid` | `boolean` | `false` | Красная рамка; что не так — в слоте `notice` |
| `size` | `'sm' \| 'md'` | `'md'` | `sm` — для треда или поповера |

## Слоты

`icon` (перед кодом), `default` (между заголовком и сведениями), `meta`, `actions` (под чертой), `notice` (под всем).

## События

`status(anchor: HTMLElement)` — нажата кнопка состояния.

## CSS-переменные

`--uid-object-card-max-width` (560px).
