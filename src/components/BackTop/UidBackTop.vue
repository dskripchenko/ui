<script setup lang="ts">
import './UidBackTop.css'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ArrowUp } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export interface UidBackTopProps {
  visibleAfter?: number
  target?: string | HTMLElement | (() => HTMLElement | null)
  smooth?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<UidBackTopProps>(), {
  visibleAfter: 200,
  target: undefined,
  smooth: true,
})

const locale = useLocale()
const labelText = computed(() => props.ariaLabel ?? locale.value.backTop.label)

const emit = defineEmits<{
  click: []
}>()

defineSlots<{
  default?(): unknown
}>()

const visible = ref(false)
let containerEl: HTMLElement | Window = window

function resolveTarget(): HTMLElement | Window {
  if (!props.target) return window
  if (typeof props.target === 'function') return props.target() ?? window
  if (typeof props.target === 'string') return document.querySelector(props.target) ?? window
  return props.target
}

function getScrollTop(): number {
  if (containerEl === window) return window.scrollY ?? document.documentElement.scrollTop
  return (containerEl as HTMLElement).scrollTop
}

function onScroll(): void {
  visible.value = getScrollTop() >= props.visibleAfter
}

function onClick(): void {
  emit('click')
  if (containerEl === window) {
    window.scrollTo({ top: 0, behavior: props.smooth ? 'smooth' : 'auto' })
  } else {
    (containerEl as HTMLElement).scrollTo({ top: 0, behavior: props.smooth ? 'smooth' : 'auto' })
  }
}

onMounted(() => {
  containerEl = resolveTarget()
  containerEl.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  containerEl.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition name="uid-back-top">
    <button
      v-show="visible"
      type="button"
      class="uid-back-top"
      :aria-label="labelText"
      @click="onClick"
    >
      <slot>
        <UidIcon
          :icon="ArrowUp"
          :size="20"
        />
      </slot>
    </button>
  </Transition>
</template>
