<script setup lang="ts">
import './UidMenu.css'
import { ref, inject, provide, watch, nextTick, onUnmounted, useId } from 'vue'
import type { Component } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { MENU_LEVEL_KEY, getLevelItems, moveFocus } from './context.js'

export interface UidSubMenuProps {
  label?: string
  icon?: Component
  disabled?: boolean
}

const props = withDefaults(defineProps<UidSubMenuProps>(), {
  label: '',
  icon: undefined,
  disabled: false,
})

const emit = defineEmits<{
  open: []
  close: []
}>()

defineSlots<{
  default(): unknown
  label?(): unknown
}>()

const HOVER_OPEN_DELAY = 100
const HOVER_CLOSE_DELAY = 200
const VIEWPORT_MARGIN = 8
const GAP = 2

const id = useId()
const panelId = `${id}-menu`
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const open = ref(false)
const side = ref<'right' | 'left'>('right')
const panelStyle = ref<Record<string, string>>({ position: 'fixed', left: '0px', top: '0px', visibility: 'hidden' })

const parentLevel = inject(MENU_LEVEL_KEY, null)
const childActive = ref<string | null>(null)
provide(MENU_LEVEL_KEY, { activeSubmenu: childActive })

let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
let lastPointerType = ''

function clearTimers(): void {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
}

function position(): void {
  const trigger = triggerRef.value
  const panel = panelRef.value
  if (!trigger || !panel) return

  const t = trigger.getBoundingClientRect()
  const p = panel.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = t.right + GAP
  side.value = 'right'
  if (left + p.width > vw - VIEWPORT_MARGIN) {
    const flipped = t.left - GAP - p.width
    if (flipped >= VIEWPORT_MARGIN) {
      left = flipped
      side.value = 'left'
    } else {
      left = Math.max(VIEWPORT_MARGIN, vw - VIEWPORT_MARGIN - p.width)
    }
  }

  // Align the first item with the trigger row.
  const paddingTop = parseFloat(getComputedStyle(panel).paddingTop) || 0
  let top = t.top - paddingTop
  if (top + p.height > vh - VIEWPORT_MARGIN) top = vh - VIEWPORT_MARGIN - p.height
  top = Math.max(VIEWPORT_MARGIN, top)

  panelStyle.value = { position: 'fixed', left: `${left}px`, top: `${top}px` }
}

async function show(focusFirst = false): Promise<void> {
  if (props.disabled) return
  clearTimers()
  if (parentLevel) parentLevel.activeSubmenu.value = id
  if (!open.value) {
    open.value = true
    emit('open')
  }
  await nextTick()
  position()
  if (!focusFirst) return
  // The panel stays visibility:hidden until the positioned style is rendered,
  // and a hidden element cannot take focus.
  await nextTick()
  getLevelItems(panelRef.value)[0]?.focus()
}

function hide(focusTrigger = false): void {
  clearTimers()
  if (open.value) {
    open.value = false
    childActive.value = null
    emit('close')
  }
  if (parentLevel && parentLevel.activeSubmenu.value === id) parentLevel.activeSubmenu.value = null
  if (focusTrigger) triggerRef.value?.focus()
}

if (parentLevel) {
  watch(parentLevel.activeSubmenu, (active) => {
    if (active !== id && open.value) hide()
  })
}

function onPointerDown(event: PointerEvent): void {
  lastPointerType = event.pointerType
}

function onPointerEnter(event: PointerEvent): void {
  lastPointerType = event.pointerType
  if (event.pointerType !== 'mouse' || props.disabled) return
  clearTimeout(closeTimer)
  if (open.value) return
  openTimer = setTimeout(() => { void show() }, HOVER_OPEN_DELAY)
}

function onWrapperEnter(): void {
  clearTimeout(closeTimer)
}

function onWrapperLeave(): void {
  clearTimeout(openTimer)
  if (lastPointerType !== 'mouse' || !open.value) return
  closeTimer = setTimeout(() => hide(), HOVER_CLOSE_DELAY)
}

function onTriggerClick(): void {
  if (props.disabled) return
  // A mouse user has usually opened it by hovering already; a click must not
  // close it again. Touch and pen toggle.
  if (open.value && lastPointerType !== 'mouse') hide()
  else void show()
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    event.stopPropagation()
    void show(true)
  }
}

function onPanelKeydown(event: KeyboardEvent): void {
  if (moveFocus(panelRef.value, event.key)) {
    event.preventDefault()
    event.stopPropagation()
  } else if (event.key === 'ArrowLeft' || event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    hide(true)
  }
}

onUnmounted(() => {
  clearTimers()
  if (parentLevel && parentLevel.activeSubmenu.value === id) parentLevel.activeSubmenu.value = null
})

defineExpose({ open: show, close: hide })
</script>

<template>
  <div
    class="uid-submenu"
    role="none"
    @mouseenter="onWrapperEnter"
    @mouseleave="onWrapperLeave"
  >
    <button
      ref="triggerRef"
      type="button"
      class="uid-menu-item uid-submenu__trigger"
      :class="{ 'uid-menu-item--disabled': disabled, 'uid-submenu__trigger--open': open }"
      role="menuitem"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? panelId : undefined"
      :disabled="disabled"
      @pointerdown="onPointerDown"
      @pointerenter="onPointerEnter"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <UidIcon
        v-if="icon"
        class="uid-menu-item__icon"
        :icon="icon"
        :size="16"
      />
      <span class="uid-submenu__label">
        <slot name="label">{{ label }}</slot>
      </span>
      <UidIcon
        :icon="ChevronRight"
        :size="16"
        class="uid-submenu__chevron"
      />
    </button>

    <Transition name="uid-submenu">
      <div
        v-if="open"
        :id="panelId"
        ref="panelRef"
        class="uid-menu uid-submenu__panel"
        role="menu"
        :aria-label="label || undefined"
        :data-side="side"
        :style="panelStyle"
        @keydown="onPanelKeydown"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>
