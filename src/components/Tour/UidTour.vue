<script setup lang="ts">
import './UidTour.css'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

export type TourPlacement = 'top' | 'right' | 'bottom' | 'left' | 'center'

export interface TourStep {
  target?: string | HTMLElement | (() => HTMLElement | null) | null
  title?: string
  description?: string
  placement?: TourPlacement
}

export interface UidTourProps {
  steps: TourStep[]
  maskClosable?: boolean
  showSkip?: boolean
  showProgress?: boolean
  nextText?: string
  prevText?: string
  finishText?: string
  skipText?: string
}

const props = withDefaults(defineProps<UidTourProps>(), {
  maskClosable: false,
  showSkip: true,
  showProgress: true,
  nextText: 'Далее',
  prevText: 'Назад',
  finishText: 'Готово',
  skipText: 'Пропустить',
})

const emit = defineEmits<{
  finish: []
  close: []
  change: [index: number]
}>()

const open = defineModel<boolean>({ default: false })
const current = defineModel<number>('current', { default: 0 })

const targetRect = ref<DOMRect | null>(null)
const popoverPos = ref<{ top: number; left: number } | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

const step = computed(() => props.steps[current.value])

function resolveTarget(t?: TourStep['target']): HTMLElement | null {
  if (!t) return null
  if (typeof t === 'string') return document.querySelector(t)
  if (typeof t === 'function') return t()
  if (t instanceof HTMLElement) return t
  return null
}

function updateTarget(): void {
  if (!step.value) return
  const el = resolveTarget(step.value.target)
  targetRect.value = el?.getBoundingClientRect() ?? null
  if (el) {
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  }
  computePopoverPos()
}

function computePopoverPos(): void {
  if (!targetRect.value) {
    popoverPos.value = null
    return
  }
  const placement = step.value?.placement ?? 'bottom'
  const r = targetRect.value
  const POPOVER_W = 320
  const GAP = 12
  let top = 0
  let left = 0
  switch (placement) {
    case 'top':
      top = r.top - GAP - 8
      left = r.left + r.width / 2 - POPOVER_W / 2
      break
    case 'bottom':
      top = r.bottom + GAP
      left = r.left + r.width / 2 - POPOVER_W / 2
      break
    case 'left':
      top = r.top + r.height / 2 - 60
      left = r.left - GAP - POPOVER_W
      break
    case 'right':
      top = r.top + r.height / 2 - 60
      left = r.right + GAP
      break
    default:
      top = r.bottom + GAP
      left = r.left + r.width / 2 - POPOVER_W / 2
  }
  const vw = window.innerWidth
  const padding = 16
  if (left < padding) left = padding
  if (left + POPOVER_W > vw - padding) left = vw - POPOVER_W - padding
  popoverPos.value = { top, left }
}

const spotlightStyle = computed(() => {
  if (!targetRect.value) return null
  const r = targetRect.value
  const PAD = 4
  return {
    top: `${r.top - PAD}px`,
    left: `${r.left - PAD}px`,
    width: `${r.width + PAD * 2}px`,
    height: `${r.height + PAD * 2}px`,
  }
})

const popoverStyle = computed(() => {
  if (!popoverPos.value) return null
  return {
    top: `${popoverPos.value.top}px`,
    left: `${popoverPos.value.left}px`,
  }
})

const isCenter = computed(() => {
  return !step.value?.target || (step.value?.placement === 'center')
})

function onPrev(): void {
  if (current.value > 0) {
    current.value--
    emit('change', current.value)
  }
}

function onNext(): void {
  if (current.value < props.steps.length - 1) {
    current.value++
    emit('change', current.value)
  } else {
    finish()
  }
}

function finish(): void {
  emit('finish')
  open.value = false
}

function close(): void {
  emit('close')
  open.value = false
}

function onMaskClick(): void {
  if (props.maskClosable) close()
}

watch([open, current], async () => {
  if (!open.value) return
  await nextTick()
  updateTarget()
})

let resizeRaf = 0
function onResize(): void {
  if (resizeRaf) cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(updateTarget)
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    onNext()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    onPrev()
  }
}

watch(open, async (val) => {
  if (val && typeof window !== 'undefined') {
    lastFocused = document.activeElement as HTMLElement | null
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    const focusBtn = popoverRef.value?.querySelector<HTMLElement>(
      '.uid-tour__btn--primary',
    )
    focusBtn?.focus()
  } else {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', onResize, true)
    window.removeEventListener('keydown', onKeydown)
    lastFocused?.focus?.()
    lastFocused = null
  }
}, { immediate: true })

onUnmounted(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && step"
      class="uid-tour"
      role="dialog"
      aria-modal="true"
      :aria-label="step.title"
    >
      <div
        class="uid-tour__mask"
        @click="onMaskClick"
      />

      <div
        v-if="spotlightStyle"
        class="uid-tour__spotlight"
        :style="spotlightStyle"
      />

      <div
        ref="popoverRef"
        class="uid-tour__popover"
        :class="{ 'uid-tour__popover--center': isCenter }"
        :style="!isCenter ? popoverStyle : undefined"
      >
        <h3
          v-if="step.title"
          class="uid-tour__title"
        >
          {{ step.title }}
        </h3>
        <p
          v-if="step.description"
          class="uid-tour__description"
        >
          {{ step.description }}
        </p>

        <div class="uid-tour__footer">
          <span
            v-if="showProgress"
            class="uid-tour__progress"
          >
            {{ current + 1 }} / {{ steps.length }}
          </span>
          <span v-else />

          <div class="uid-tour__actions">
            <button
              v-if="showSkip && current < steps.length - 1"
              type="button"
              class="uid-tour__btn uid-tour__btn--ghost"
              @click="close"
            >
              {{ skipText }}
            </button>
            <button
              v-if="current > 0"
              type="button"
              class="uid-tour__btn"
              @click="onPrev"
            >
              {{ prevText }}
            </button>
            <button
              type="button"
              class="uid-tour__btn uid-tour__btn--primary"
              @click="onNext"
            >
              {{ current === steps.length - 1 ? finishText : nextText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
