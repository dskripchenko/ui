<script setup lang="ts" generic="T extends string | number">
import './UidSegmented.css'
import { computed, ref } from 'vue'

export interface SegmentedOption<V extends string | number = string | number> {
  value: V
  label: string
  /** A longer name for screen readers, e.g. «Monday» for «Mo». */
  ariaLabel?: string
  disabled?: boolean
}

export interface UidSegmentedProps<V extends string | number = string | number> {
  options: SegmentedOption<V>[]
  /** The group's accessible name. */
  label?: string
  /** `joined` — one bar of buttons; `chips` — separate pills. */
  variant?: 'joined' | 'chips'
  /** `round` — equal round buttons (e.g. weekdays). */
  shape?: 'default' | 'round'
  size?: 'sm' | 'md'
  /** Several may be chosen: `modelValue` is then an array. */
  multiple?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<UidSegmentedProps<T>>(), {
  label: undefined,
  variant: 'joined',
  shape: 'default',
  size: 'md',
  multiple: false,
  disabled: false,
})

const model = defineModel<T | T[] | null>({ default: null })
const emit = defineEmits<{ change: [value: T | T[] | null] }>()

const chosen = computed<T[]>(() => (Array.isArray(model.value) ? model.value : model.value === null ? [] : [model.value]))
const buttons = ref<HTMLButtonElement[]>([])

function isOn(v: T): boolean {
  return chosen.value.includes(v)
}

function pick(o: SegmentedOption<T>): void {
  if (props.disabled || o.disabled) return
  let next: T | T[] | null
  if (props.multiple) {
    next = isOn(o.value) ? chosen.value.filter((v) => v !== o.value) : [...chosen.value, o.value]
  } else {
    next = o.value
  }
  model.value = next
  emit('change', next)
}

/** Arrows move between the options of a single choice and choose, as radio buttons do. */
function onKey(e: KeyboardEvent, i: number): void {
  if (props.multiple) return
  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (step === 0) return
  e.preventDefault()
  const n = props.options.length
  for (let k = 1; k <= n; k++) {
    const j = (i + step * k + n) % n
    if (!props.options[j].disabled) {
      pick(props.options[j])
      buttons.value[j]?.focus()
      return
    }
  }
}
</script>

<template>
  <div
    class="uid-segmented"
    :class="[`uid-segmented--${variant}`, `uid-segmented--${size}`, { 'uid-segmented--round': shape === 'round', 'uid-segmented--disabled': disabled }]"
    :role="multiple ? 'group' : 'radiogroup'"
    :aria-label="label"
  >
    <button
      v-for="(o, i) in options"
      :key="o.value"
      ref="buttons"
      type="button"
      class="uid-segmented__item"
      :class="{ 'uid-segmented__item--on': isOn(o.value) }"
      :role="multiple ? undefined : 'radio'"
      :aria-checked="multiple ? undefined : isOn(o.value)"
      :aria-pressed="multiple ? isOn(o.value) : undefined"
      :aria-label="o.ariaLabel"
      :tabindex="multiple || isOn(o.value) || (chosen.length === 0 && i === 0) ? 0 : -1"
      :disabled="disabled || o.disabled"
      @click="pick(o)"
      @keydown="onKey($event, i)"
    >
      {{ o.label }}
    </button>
  </div>
</template>
