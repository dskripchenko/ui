<script setup lang="ts">
import './UidPopover.css'
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { usePopover, type Placement } from '../../composables/usePopover.js'

export interface UidPopoverProps {
  placement?: Placement
}

const props = withDefaults(defineProps<UidPopoverProps>(), {
  placement: 'bottom',
})

defineSlots<{
  trigger(): unknown
  default(): unknown
}>()

const referenceRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const open = ref(false)

const { floatingStyle, update } = usePopover(referenceRef, floatingRef, {
  placement: computed(() => props.placement),
})

async function toggle(): Promise<void> {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    update()
  }
}

function close(): void {
  open.value = false
}

function onOutsideClick(event: MouseEvent): void {
  const target = event.target as Node
  if (
    referenceRef.value?.contains(target) ||
    floatingRef.value?.contains(target)
  ) return
  close()
}

function onEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) close()
}

onMounted(() => {
  document.addEventListener('mousedown', onOutsideClick)
  document.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onOutsideClick)
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <div
    ref="referenceRef"
    class="uid-popover-trigger"
    @click="toggle"
  >
    <slot name="trigger" />
  </div>

  <Teleport to="body">
    <Transition name="uid-popover">
      <div
        v-if="open"
        ref="floatingRef"
        class="uid-popover"
        :style="floatingStyle"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
