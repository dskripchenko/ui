<script setup lang="ts" generic="T">
import './UidCarousel.css'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UidCarouselProps<T> {
  items: T[]
  direction?: 'horizontal' | 'vertical'
  loop?: boolean
  autoplay?: number
  showArrows?: boolean
  showIndicators?: boolean
  pauseOnHover?: boolean
}

const props = withDefaults(defineProps<UidCarouselProps<T>>(), {
  direction: 'horizontal',
  loop: true,
  autoplay: 0,
  showArrows: true,
  showIndicators: true,
  pauseOnHover: true,
})

const emit = defineEmits<{
  change: [index: number]
}>()

defineSlots<{
  default(props: { item: T; index: number }): unknown
}>()

const model = defineModel<number>({ default: 0 })
const trackRef = ref<HTMLElement | null>(null)
const isPaused = ref(false)
const noTransition = ref(false)

const total = computed(() => props.items.length)

const trackStyle = computed(() => {
  const offset = model.value * 100
  if (props.direction === 'vertical') {
    return { transform: `translateY(-${offset}%)` }
  }
  return { transform: `translateX(-${offset}%)` }
})

function goTo(index: number, instant = false): void {
  if (total.value === 0) return
  let next = index
  if (props.loop) {
    next = ((index % total.value) + total.value) % total.value
  } else {
    next = Math.max(0, Math.min(index, total.value - 1))
  }
  if (next === model.value) return
  if (instant) {
    noTransition.value = true
    requestAnimationFrame(() => { noTransition.value = false })
  }
  model.value = next
  emit('change', next)
}

function next(): void { goTo(model.value + 1) }
function prev(): void { goTo(model.value - 1) }

let intervalId: ReturnType<typeof setInterval> | null = null

function startAutoplay(): void {
  stopAutoplay()
  if (!props.autoplay || props.autoplay <= 0) return
  intervalId = setInterval(() => {
    if (!isPaused.value) next()
  }, props.autoplay)
}

function stopAutoplay(): void {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

watch(() => props.autoplay, startAutoplay)
onMounted(startAutoplay)
onUnmounted(stopAutoplay)

function onPointerEnter(): void {
  if (props.pauseOnHover) isPaused.value = true
}

function onPointerLeave(): void {
  if (props.pauseOnHover) isPaused.value = false
}

function onKeydown(e: KeyboardEvent): void {
  const isVertical = props.direction === 'vertical'
  const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
  if (e.key === prevKey) { e.preventDefault(); prev() }
  else if (e.key === nextKey) { e.preventDefault(); next() }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0) }
  else if (e.key === 'End') { e.preventDefault(); goTo(total.value - 1) }
}

defineExpose({ next, prev, goTo })
</script>

<template>
  <div
    class="uid-carousel"
    :class="[
      `uid-carousel--${direction}`,
      noTransition && 'uid-carousel--no-transition',
    ]"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @keydown="onKeydown"
  >
    <div
      ref="trackRef"
      class="uid-carousel__track"
      :style="trackStyle"
    >
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="uid-carousel__slide"
        :aria-hidden="idx !== model"
        :aria-roledescription="'slide'"
        :aria-label="`${idx + 1} из ${total}`"
      >
        <slot
          :item="item"
          :index="idx"
        />
      </div>
    </div>

    <button
      v-if="showArrows && total > 1"
      type="button"
      class="uid-carousel__arrow uid-carousel__arrow--prev"
      :disabled="!loop && model === 0"
      aria-label="Предыдущий"
      @click="prev"
    >
      <UidIcon
        :icon="direction === 'vertical' ? ChevronUp : ChevronLeft"
        :size="20"
      />
    </button>

    <button
      v-if="showArrows && total > 1"
      type="button"
      class="uid-carousel__arrow uid-carousel__arrow--next"
      :disabled="!loop && model === total - 1"
      aria-label="Следующий"
      @click="next"
    >
      <UidIcon
        :icon="direction === 'vertical' ? ChevronDown : ChevronRight"
        :size="20"
      />
    </button>

    <div
      v-if="showIndicators && total > 1"
      class="uid-carousel__indicators"
      role="tablist"
    >
      <button
        v-for="(_, idx) in items"
        :key="idx"
        type="button"
        class="uid-carousel__indicator"
        :class="{ 'uid-carousel__indicator--active': idx === model }"
        role="tab"
        :aria-selected="idx === model"
        :aria-label="`Слайд ${idx + 1}`"
        @click="goTo(idx)"
      />
    </div>
  </div>
</template>
