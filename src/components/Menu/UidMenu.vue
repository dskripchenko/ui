<script setup lang="ts">
import './UidMenu.css'
import { ref, provide, watch, nextTick, onUnmounted, useId } from 'vue'
import { usePopover } from '../../composables/usePopover.js'
import { MENU_CLOSE_KEY } from './context.js'

defineSlots<{
  trigger(): unknown
  default(): unknown
}>()

const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const open = ref(false)
const menuId = useId()

const { floatingStyle, update } = usePopover(triggerRef, menuRef, {
  placement: 'bottom-start',
})

function getItems(): HTMLElement[] {
  return Array.from(
    menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [],
  )
}

function close(): void {
  open.value = false
  triggerRef.value?.querySelector<HTMLElement>('button, [tabindex]')?.focus()
}

provide(MENU_CLOSE_KEY, close)

async function toggle(): Promise<void> {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    update()
    requestAnimationFrame(() => {
      update()
      getItems()[0]?.focus()
    })
  }
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && !open.value) {
    event.preventDefault()
    toggle()
  }
}

function onMenuKeydown(event: KeyboardEvent): void {
  const items = getItems()
  const idx = items.indexOf(document.activeElement as HTMLElement)

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    items[(idx + 1) % items.length]?.focus()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    items[(idx - 1 + items.length) % items.length]?.focus()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    close()
  } else if (event.key === 'Tab') {
    close()
  }
}

function onOutsideClick(event: MouseEvent): void {
  const target = event.target as Node
  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) return
  open.value = false
}

watch(open, (val) => {
  if (val) {
    document.addEventListener('mousedown', onOutsideClick)
  } else {
    document.removeEventListener('mousedown', onOutsideClick)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onOutsideClick)
})
</script>

<template>
  <div
    ref="triggerRef"
    class="uid-menu-trigger"
    role="button"
    tabindex="0"
    aria-haspopup="menu"
    :aria-expanded="open"
    :aria-controls="menuId"
    @click="toggle"
    @keydown="onTriggerKeydown"
  >
    <slot name="trigger" />
  </div>

  <Teleport to="body">
    <Transition name="uid-menu">
      <div
        v-if="open"
        :id="menuId"
        ref="menuRef"
        class="uid-menu"
        role="menu"
        :style="floatingStyle"
        @keydown="onMenuKeydown"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
