<script setup lang="ts">
import './UidMenu.css'
import { ref, computed, provide, watch, nextTick, onMounted, onUnmounted, useId } from 'vue'
import { usePopover } from '../../composables/usePopover.js'
import { MENU_CLOSE_KEY, MENU_LEVEL_KEY, getLevelItems, moveFocus } from './context.js'

defineSlots<{
  trigger(): unknown
  default(): unknown
}>()

const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const open = ref(false)
const menuId = useId()

// `.uid-menu-trigger` has `display: contents`, which means the root div itself
// takes no place in the layout and its getBoundingClientRect() returns
// (0,0,0,0). usePopover must see the real dimensions — we take them from the
// first visual child (the contents of the 'trigger' slot, usually a UidAvatar or
// a UidButton).
const triggerAnchorRef = computed<HTMLElement | null>(() => {
  return (triggerRef.value?.firstElementChild as HTMLElement | null) ?? triggerRef.value
})

const { floatingStyle, update } = usePopover(triggerAnchorRef, menuRef, {
  placement: 'bottom-start',
})

// A button inside a button is an accessibility violation: a screen reader
// announces two nested controls and the keyboard lands now on one, now on the
// other. The trigger slot usually already holds a UidButton, so the wrapper
// stops being a button and hands its role over to it.
const INTERACTIVE = 'button, a[href], input, select, textarea, [role="button"], [tabindex]'
const delegatesToChild = ref(false)

function syncTriggerRole(): void {
  const child = triggerRef.value?.firstElementChild as HTMLElement | null
  delegatesToChild.value = child !== null && child.matches(INTERACTIVE)

  if (!delegatesToChild.value) return

  child!.setAttribute('aria-haspopup', 'menu')
  child!.setAttribute('aria-expanded', String(open.value))
  child!.setAttribute('aria-controls', menuId)
}

onMounted(syncTriggerRole)
watch(open, syncTriggerRole)

function getItems(): HTMLElement[] {
  return getLevelItems(menuRef.value)
}

function close(): void {
  open.value = false
  triggerRef.value?.querySelector<HTMLElement>('button, [tabindex]')?.focus()
}

provide(MENU_CLOSE_KEY, close)

const activeSubmenu = ref<string | null>(null)
provide(MENU_LEVEL_KEY, { activeSubmenu })
watch(open, (val) => { if (!val) activeSubmenu.value = null })

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
  if (moveFocus(menuRef.value, event.key)) {
    event.preventDefault()
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
    :role="delegatesToChild ? undefined : 'button'"
    :tabindex="delegatesToChild ? undefined : 0"
    :aria-haspopup="delegatesToChild ? undefined : 'menu'"
    :aria-expanded="delegatesToChild ? undefined : open"
    :aria-controls="delegatesToChild ? undefined : menuId"
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
