<script setup lang="ts">
import './UidTooltip.css'
import { ref, computed, nextTick, useId } from 'vue'
import { usePopover, type Placement } from '../../composables/usePopover.js'

export interface UidTooltipProps {
  content: string
  placement?: Placement
  disabled?: boolean
}

const props = withDefaults(defineProps<UidTooltipProps>(), {
  placement: 'top',
  disabled: false,
})

defineSlots<{
  default(): unknown
}>()

const tooltipId = useId()
const referenceRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const visible = ref(false)

// The anchor is display: contents (an empty box); measure its first child.
const anchorRef = computed<HTMLElement | null>(
  () => (referenceRef.value?.firstElementChild as HTMLElement | null) ?? referenceRef.value,
)

const { floatingStyle, update } = usePopover(anchorRef, floatingRef, {
  placement: computed(() => props.placement),
})

async function show(): Promise<void> {
  if (props.disabled) return
  visible.value = true
  await nextTick()
  update()
}

function hide(): void {
  visible.value = false
}
</script>

<template>
  <div
    ref="referenceRef"
    class="uid-tooltip-anchor"
    :aria-describedby="visible ? tooltipId : undefined"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition name="uid-tooltip">
      <div
        v-if="visible"
        :id="tooltipId"
        ref="floatingRef"
        class="uid-tooltip"
        role="tooltip"
        :style="floatingStyle"
      >
        {{ content }}
      </div>
    </Transition>
  </Teleport>
</template>
