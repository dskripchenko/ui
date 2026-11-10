# Сегментированный выбор

`UidSegmented` выбирает один вариант из нескольких — вид, длительность — или несколько (`multiple`), например дни недели. `joined` — одна полоса кнопок; `chips` — отдельные пилюли; `shape="round"` — одинаковые круглые кнопки. Одиночный выбор — группа радиокнопок: стрелки двигают и выбирают; множественный — кнопки-переключатели (`aria-pressed`).

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

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `options` | `SegmentedOption[]` | — | `{ value, label, ariaLabel?, disabled? }`. |
| `v-model` | `T | T[] | null` | `null` | Выбранное; массив при `multiple`. |
| `label` | `string` | — | Имя группы для чтения с экрана. |
| `variant` | `'joined' | 'chips'` | `'joined'` | Одна полоса или отдельные пилюли. |
| `shape` | `'default' | 'round'` | `'default'` | Круглые одинаковые кнопки. |
| `size` | `'sm' | 'md'` | `'md'` | Высота 28 или 36 px. |
| `multiple` | `boolean` | `false` | Можно выбрать несколько. |
| `disabled` | `boolean` | `false` | Весь элемент. |

Отдаёт `change` с новым значением, как и `update:modelValue`. Типы: `UidSegmentedProps`, `SegmentedOption`.
