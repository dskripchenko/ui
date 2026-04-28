<script setup lang="ts">
import './UidSplitter.css'
import { computed, ref } from 'vue'

export interface UidSplitterProps {
  direction?: 'horizontal' | 'vertical'
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<UidSplitterProps>(), {
  direction: 'horizontal',
  min: 10,
  max: 90,
  step: 5,
  disabled: false,
})

const emit = defineEmits<{
  change: [value: number]
}>()

defineSlots<{
  start?(): unknown
  end?(): unknown
}>()

const model = defineModel<number>({ default: 50 })
const containerRef = ref<HTMLElement | null>(null)
const handleRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const startSize = computed(() => Math.min(Math.max(model.value, props.min), props.max))

function clamp(n: number): number {
  return Math.min(Math.max(n, props.min), props.max)
}

function commit(percent: number): void {
  const clamped = clamp(percent)
  if (clamped !== model.value) {
    model.value = clamped
    emit('change', clamped)
  }
}

function onPointerDown(e: PointerEvent): void {
  if (props.disabled) return
  e.preventDefault()
  isDragging.value = true
  handleRef.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (!isDragging.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const total = props.direction === 'horizontal' ? rect.width : rect.height
  if (total === 0) return
  const offset = props.direction === 'horizontal' ? e.clientX - rect.left : e.clientY - rect.top
  const percent = (offset / total) * 100
  commit(percent)
}

function onPointerUp(e: PointerEvent): void {
  if (!isDragging.value) return
  isDragging.value = false
  handleRef.value?.releasePointerCapture(e.pointerId)
}

function onKeydown(e: KeyboardEvent): void {
  if (props.disabled) return
  const decKeys = props.direction === 'horizontal' ? ['ArrowLeft', 'ArrowUp'] : ['ArrowUp', 'ArrowLeft']
  const incKeys = props.direction === 'horizontal' ? ['ArrowRight', 'ArrowDown'] : ['ArrowDown', 'ArrowRight']
  if (decKeys.includes(e.key)) {
    e.preventDefault()
    commit(model.value - props.step)
  } else if (incKeys.includes(e.key)) {
    e.preventDefault()
    commit(model.value + props.step)
  } else if (e.key === 'Home') {
    e.preventDefault()
    commit(props.min)
  } else if (e.key === 'End') {
    e.preventDefault()
    commit(props.max)
  }
}

const startStyle = computed(() => {
  const dim = props.direction === 'horizontal' ? 'width' : 'height'
  return { [dim]: `${startSize.value}%` }
})
</script>

<template>
  <div
    ref="containerRef"
    class="uid-splitter"
    :class="[
      `uid-splitter--${direction}`,
      isDragging && 'uid-splitter--dragging',
      disabled && 'uid-splitter--disabled',
    ]"
  >
    <div
      class="uid-splitter__pane uid-splitter__pane--start"
      :style="startStyle"
    >
      <slot name="start" />
    </div>

    <div
      ref="handleRef"
      class="uid-splitter__handle"
      role="separator"
      :tabindex="disabled ? -1 : 0"
      :aria-orientation="direction === 'horizontal' ? 'vertical' : 'horizontal'"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="Math.round(startSize)"
      :aria-disabled="disabled"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    >
      <span
        class="uid-splitter__grip"
        aria-hidden="true"
      >
        <span class="uid-splitter__grip-dot" />
        <span class="uid-splitter__grip-dot" />
        <span class="uid-splitter__grip-dot" />
      </span>
    </div>

    <div class="uid-splitter__pane uid-splitter__pane--end">
      <slot name="end" />
    </div>
  </div>
</template>
