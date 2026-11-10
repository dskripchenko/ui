# 分段选择

`UidSegmented` 从少量选项中选一个——视图、时长——或选多个（`multiple`），例如星期几。`joined` 为一条按钮栏；`chips` 为独立的胶囊；`shape="round"` 为等大的圆形按钮。单选是单选按钮组：方向键移动并选择；多选为切换按钮（`aria-pressed`）。

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

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `options` | `SegmentedOption[]` | — | `{ value, label, ariaLabel?, disabled? }`。 |
| `v-model` | `T | T[] | null` | `null` | 所选值；`multiple` 时为数组。 |
| `label` | `string` | — | 组的无障碍名称。 |
| `variant` | `'joined' | 'chips'` | `'joined'` | 一条按钮栏或独立胶囊。 |
| `shape` | `'default' | 'round'` | `'default'` | 等大的圆形按钮。 |
| `size` | `'sm' | 'md'` | `'md'` | 高 28 或 36 px。 |
| `multiple` | `boolean` | `false` | 可多选。 |
| `disabled` | `boolean` | `false` | 整个控件。 |

与 `update:modelValue` 一同发出带新值的 `change`。类型：`UidSegmentedProps`、`SegmentedOption`。
