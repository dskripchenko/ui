<script setup lang="ts">
import './UidRating.css'
import { computed, ref } from 'vue'
import { Star } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import type { Size } from '../../types/index.js'

export type RatingTone = 'warning' | 'primary' | 'success' | 'danger'

export interface UidRatingProps {
  max?: number
  allowHalf?: boolean
  readonly?: boolean
  disabled?: boolean
  showLabel?: boolean
  size?: Size
  tone?: RatingTone
  icon?: unknown
  label?: string
}

const props = withDefaults(defineProps<UidRatingProps>(), {
  max: 5,
  allowHalf: false,
  readonly: false,
  disabled: false,
  showLabel: false,
  size: 'md',
  tone: 'warning',
  icon: undefined,
})

const emit = defineEmits<{
  change: [value: number]
}>()

const model = defineModel<number>({ default: 0 })
const hovered = ref<number | null>(null)

const stars = computed(() => Array.from({ length: props.max }, (_, i) => i + 1))
const displayValue = computed(() => hovered.value ?? model.value)
const iconComponent = computed(() => props.icon ?? Star)

function fillFor(index: number): { full: boolean; half: boolean } {
  const v = displayValue.value
  if (v >= index) return { full: true, half: false }
  if (props.allowHalf && v >= index - 0.5) return { full: true, half: true }
  return { full: false, half: false }
}

function setValue(value: number): void {
  if (props.readonly || props.disabled) return
  const next = value === model.value ? 0 : value
  model.value = next
  emit('change', next)
}

function onClick(e: MouseEvent, index: number): void {
  if (!props.allowHalf) {
    setValue(index)
    return
  }
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const isLeft = (e.clientX - rect.left) < rect.width / 2
  setValue(isLeft ? index - 0.5 : index)
}

function onHover(e: MouseEvent, index: number): void {
  if (props.readonly || props.disabled) return
  if (!props.allowHalf) {
    hovered.value = index
    return
  }
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const isLeft = (e.clientX - rect.left) < rect.width / 2
  hovered.value = isLeft ? index - 0.5 : index
}

function onLeave(): void {
  hovered.value = null
}

function onKeydown(e: KeyboardEvent, index: number): void {
  if (props.readonly || props.disabled) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault()
    const step = props.allowHalf ? 0.5 : 1
    const next = Math.min(model.value + step, props.max)
    model.value = next
    emit('change', next)
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    e.preventDefault()
    const step = props.allowHalf ? 0.5 : 1
    const next = Math.max(model.value - step, 0)
    model.value = next
    emit('change', next)
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    setValue(index)
  }
}
</script>

<template>
  <div
    class="uid-rating"
    :class="[
      `uid-rating--${size}`,
      tone !== 'warning' && `uid-rating--${tone}`,
      readonly && 'uid-rating--readonly',
      disabled && 'uid-rating--disabled',
    ]"
    role="slider"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="model"
    :aria-readonly="readonly"
    :aria-disabled="disabled"
    :aria-label="label || `Оценка ${model} из ${max}`"
    @mouseleave="onLeave"
  >
    <button
      v-for="i in stars"
      :key="i"
      type="button"
      class="uid-rating__star"
      :tabindex="readonly || disabled ? -1 : 0"
      :aria-label="`${i} ${i === 1 ? 'звезда' : 'звёзды'}`"
      @click="onClick($event, i)"
      @mousemove="onHover($event, i)"
      @keydown="onKeydown($event, i)"
    >
      <span
        class="uid-rating__icon"
        aria-hidden="true"
      >
        <UidIcon :icon="iconComponent" />
      </span>
      <span
        v-if="fillFor(i).full"
        class="uid-rating__icon uid-rating__icon--filled"
        :data-half="fillFor(i).half ? 'true' : 'false'"
        aria-hidden="true"
      >
        <UidIcon :icon="iconComponent" />
      </span>
    </button>
    <span
      v-if="showLabel"
      class="uid-rating__label"
    >
      {{ model.toFixed(allowHalf ? 1 : 0) }} / {{ max }}
    </span>
  </div>
</template>
