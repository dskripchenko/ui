<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

export interface UidMediaMenuOption {
  value: string | number
  label: string
  hint?: string
  /** Shorter label for the compact sheet (`1×` instead of `Normal`). */
  short?: string
}

export interface UidMediaMenuGroup {
  id: string
  /** `action` — plain commands (no checked state), e.g. picture-in-picture folded into the menu. */
  kind?: 'radio' | 'action'
  label?: string
  value: string | number | null
  options: UidMediaMenuOption[]
}

const props = withDefaults(defineProps<{
  label: string
  groups: UidMediaMenuGroup[]
  align?: 'start' | 'end'
  buttonClass?: string
  closeLabel?: string
}>(), {
  align: 'end',
  buttonClass: '',
  closeLabel: 'Close',
})

const emit = defineEmits<{
  select: [group: string, value: string | number]
  'update:open': [open: boolean]
}>()

defineSlots<{ default(): unknown }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const menuId = useId()

watch(open, (v) => emit('update:open', v))

function items(): HTMLElement[] {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>('[role="menuitemradio"], [role="menuitem"]') ?? [])
}

async function show(focus: 'checked' | 'first' | 'last' = 'checked'): Promise<void> {
  open.value = true
  document.addEventListener('pointerdown', onOutside, true)
  await nextTick()
  fitPanel()
  const list = items()
  const target = focus === 'last'
    ? list[list.length - 1]
    : focus === 'first' ? list[0] : (list.find((el) => el.getAttribute('aria-checked') === 'true') ?? list[0])
  target?.focus()
}

const sheet = ref(false)

// In a small player a long menu becomes a sheet over the whole player instead of a scrolling popup.
function fitPanel(): void {
  const el = panel.value
  const host = root.value?.closest<HTMLElement>('[data-media-menu-bounds]')
  sheet.value = false
  if (!el || !host || !button.value) return
  const hostRect = host.getBoundingClientRect()
  if (!hostRect.height) return
  const btn = button.value.getBoundingClientRect()
  const up = getComputedStyle(el).bottom !== 'auto'
  const space = up ? btn.top - hostRect.top - 12 : hostRect.bottom - btn.bottom - 12
  if (el.scrollHeight <= space) return
  if (space >= 200) {
    el.style.maxHeight = `${Math.floor(space)}px`
    return
  }
  sheet.value = true
  Object.assign(el.style, {
    top: `${hostRect.top + 8}px`,
    left: `${hostRect.left + 8}px`,
    width: `${hostRect.width - 16}px`,
    height: `${hostRect.height - 16}px`,
    maxHeight: 'none',
  })
}

function hide(returnFocus = true): void {
  if (!open.value) return
  open.value = false
  sheet.value = false
  document.removeEventListener('pointerdown', onOutside, true)
  if (returnFocus) button.value?.focus()
}

function onOutside(e: Event): void {
  if (root.value && !root.value.contains(e.target as Node)) hide(false)
}

onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside, true))

function onButtonKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
    e.stopPropagation()
    show(e.key === 'ArrowUp' ? 'last' : 'first')
  }
}

function onPanelKeydown(e: KeyboardEvent): void {
  const list = items()
  const i = list.indexOf(document.activeElement as HTMLElement)
  let next: HTMLElement | undefined
  switch (e.key) {
    case 'ArrowDown':
      next = list[(i + 1) % list.length]
      break
    case 'ArrowUp':
      next = list[(i - 1 + list.length) % list.length]
      break
    case 'Home':
      next = list[0]
      break
    case 'End':
      next = list[list.length - 1]
      break
    case 'Escape':
      hide()
      break
    case 'Tab':
      hide(false)
      return
    case 'Enter':
    case ' ':
      // Native button activation picks the item; just keep the key from the player hotkeys.
      e.stopPropagation()
      return
    default:
      e.stopPropagation()
      return
  }
  e.preventDefault()
  e.stopPropagation()
  next?.focus()
}

function choose(group: string, value: string | number): void {
  emit('select', group, value)
  hide()
}

defineExpose({ show, hide, open })
</script>

<template>
  <div
    ref="root"
    class="uid-media-menu"
  >
    <button
      ref="button"
      type="button"
      class="uid-media__button"
      :class="[buttonClass, { 'uid-media__button--active': open }]"
      :aria-label="label"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="open ? menuId : undefined"
      :title="label"
      @click="open ? hide() : show()"
      @keydown="onButtonKeydown"
    >
      <slot />
    </button>
    <div
      v-if="open"
      :id="menuId"
      ref="panel"
      class="uid-media-menu__panel"
      :class="[`uid-media-menu__panel--${align}`, { 'uid-media-menu__panel--sheet': sheet }]"
      role="menu"
      :aria-label="label"
      @keydown="onPanelKeydown"
    >
      <div
        v-if="sheet"
        class="uid-media-menu__sheet-head"
      >
        <span>{{ label }}</span>
        <button
          type="button"
          class="uid-media__button uid-media-menu__close"
          :aria-label="closeLabel"
          @click="hide()"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
          ><path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg>
        </button>
      </div>
      <div
        v-for="g in props.groups"
        :key="g.id"
        class="uid-media-menu__group"
        :class="{ 'uid-media-menu__group--compact': g.options.every((o) => o.short) }"
        role="group"
        :aria-label="g.label"
      >
        <div
          v-if="g.label"
          class="uid-media-menu__heading"
          aria-hidden="true"
        >
          {{ g.label }}
        </div>
        <button
          v-for="o in g.options"
          :key="o.value"
          type="button"
          class="uid-media-menu__item"
          :class="{ 'uid-media-menu__item--action': g.kind === 'action' }"
          :role="g.kind === 'action' ? 'menuitem' : 'menuitemradio'"
          tabindex="-1"
          :aria-checked="g.kind === 'action' ? undefined : o.value === g.value"
          @click="choose(g.id, o.value)"
        >
          <span
            v-if="g.kind !== 'action'"
            class="uid-media-menu__check"
            aria-hidden="true"
          />
          <span class="uid-media-menu__label">{{ sheet && o.short ? o.short : o.label }}<span
            v-if="o.hint"
            class="uid-media-menu__hint"
          > · {{ o.hint }}</span></span>
        </button>
      </div>
    </div>
  </div>
</template>
