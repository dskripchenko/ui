# Segmented control

`UidSegmented` chooses one option of a few — a view, a length — or several (`multiple`), e.g. weekdays. `joined` draws one bar of buttons; `chips` — separate pills; `shape="round"` — equal round buttons. A single choice is a radio group: arrows move and choose; a multiple one — toggle buttons (`aria-pressed`).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidSegmented } from '@dskripchenko/ui'

const view = ref('week')
const days = ref([1, 3])
</script>

<template>
  <UidSegmented v-model="view" label="View" :options="[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]" />
  <UidSegmented v-model="days" multiple variant="chips" shape="round" size="sm" label="Days"
    :options="[1, 2, 3, 4, 5].map((d) => ({ value: d, label: String(d) }))" />
</template>
```

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `options` | `SegmentedOption[]` | — | `{ value, label, ariaLabel?, disabled? }`. |
| `v-model` | `T | T[] | null` | `null` | The chosen value; an array with `multiple`. |
| `label` | `string` | — | The group's accessible name. |
| `variant` | `'joined' | 'chips'` | `'joined'` | One bar or separate pills. |
| `shape` | `'default' | 'round'` | `'default'` | Round equal buttons. |
| `size` | `'sm' | 'md'` | `'md'` | 28 or 36 px high. |
| `multiple` | `boolean` | `false` | Several may be chosen. |
| `disabled` | `boolean` | `false` | The whole control. |

Emits `change` with the new value, as well as `update:modelValue`. Types: `UidSegmentedProps`, `SegmentedOption`.
