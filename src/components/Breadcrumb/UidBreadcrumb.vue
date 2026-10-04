<script setup lang="ts">
import './UidBreadcrumb.css'
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, provide, ref, shallowRef, toRef, useId, watch } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { usePopover } from '../../composables/usePopover.js'
import { BREADCRUMB_KEY } from './context.js'

export interface UidBreadcrumbProps {
  label?: string
  separator?: string
  /** Keep the trail on one line: crumbs do not wrap and long ones truncate with an ellipsis. */
  nowrap?: boolean
  /**
   * Implies `nowrap`. When the trail does not fit, the middle crumbs (from the
   * second one on) collapse into "…" until it fits; the first and the last crumb stay.
   */
  collapse?: boolean
  /** `collapse` mode: the "…" is a button that opens a menu of the collapsed crumbs. Set `false` for a plain "…". */
  collapseMenu?: boolean
  /**
   * `collapse` mode: when even "first › … › current" does not fit, the first
   * crumb collapses into the "…" as well, leaving "… › current". The current
   * crumb stays visible and truncates with an ellipsis.
   */
  collapseFirst?: boolean
  /**
   * `collapse` mode: an extra element whose width changes re-measure the trail.
   * The trail always watches its own `<nav>` and its parent element; pass an
   * ancestor here when the parent is itself sized by its content (e.g. a flex
   * item without `flex-grow` in a toolbar), so the trail expands again when the
   * room around it grows. A string is a CSS selector matched with `closest()`
   * from the `<nav>`.
   */
  container?: HTMLElement | string | null
}

const props = withDefaults(defineProps<UidBreadcrumbProps>(), {
  label: undefined,
  separator: '/',
  nowrap: false,
  collapse: false,
  collapseMenu: true,
  collapseFirst: false,
  container: null,
})

defineSlots<{
  default(): unknown
}>()

const locale = useLocale()

// Items work out whether they are the last crumb from the DOM; re-check after
// every update of the list (crumbs added, removed or reordered).
const tick = ref(0)
onUpdated(() => { tick.value++ })

// ---- Collapse ---------------------------------------------------------------

const navRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLOListElement | null>(null)
const probeRef = ref<HTMLElement | null>(null)

const hidden = shallowRef<readonly HTMLElement[]>([])
const measuring = ref(false)
const isNowrap = computed(() => props.nowrap || props.collapse)

function crumbElements(): HTMLElement[] {
  const list = listRef.value
  if (!list) return []
  return Array.from(list.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains('uid-breadcrumb__item'),
  )
}

let run = 0

/**
 * Lay every crumb out at its natural width, then hide middle crumbs (second
 * one first) until the rest plus the "…" fits the list. With `collapseFirst`
 * the first crumb goes too when "first › … › current" still does not fit.
 *
 * While measuring nothing in the trail shrinks, so the list gets the room its
 * container can give a full trail: the measured width is the available one
 * even when the trail's parent is sized by its content. Siblings that shrink
 * to make room for a full trail take that room back once it collapses, so the
 * collapsed trail is checked once more and folds further while it overflows.
 */
async function recompute(): Promise<void> {
  const id = ++run
  if (!props.collapse) {
    hidden.value = []
    return
  }
  measuring.value = true
  if (hidden.value.length > 0) hidden.value = []
  await nextTick()
  if (id !== run) return
  const list = listRef.value
  const items = crumbElements()
  const available = list?.clientWidth ?? 0
  const widths = items.map(el => el.getBoundingClientRect().width)
  let total = widths.reduce((sum, w) => sum + w, 0)
  // The order crumbs fold in: the middle ones from the second on, then the first.
  const candidates = items.slice(1, -1)
  if (props.collapseFirst && items.length > 1) candidates.push(items[0])
  let folded = 0
  if (available > 0 && total > available && items.length > 1) {
    const ellipsis = probeRef.value?.getBoundingClientRect().width ?? 0
    while (folded < candidates.length) {
      const el = candidates[folded++]
      total -= widths[items.indexOf(el)]
      if (total + ellipsis <= available) break
    }
  }
  const fold = (count: number): HTMLElement[] =>
    items.filter(el => candidates.slice(0, count).includes(el))
  hidden.value = fold(folded)
  // Still measuring (nothing shrinks): an overflowing list means the room shrank.
  while (list && folded > 0 && folded < candidates.length) {
    await nextTick()
    if (id !== run) return
    if (list.scrollWidth <= list.clientWidth + 0.5) break
    hidden.value = fold(++folded)
  }
  measuring.value = false
}

function schedule(): void {
  void recompute()
}

let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null
/** Last seen width of every observed element: only width changes re-measure. */
const observedWidths = new WeakMap<Element, number>()

function containerElement(): HTMLElement | null {
  const container = props.container
  if (!container) return null
  if (typeof container !== 'string') return container
  return navRef.value?.closest<HTMLElement>(container) ?? null
}

function onResize(entries: ResizeObserverEntry[]): void {
  let changed = false
  for (const entry of entries) {
    const width = entry.contentRect.width
    if (observedWidths.get(entry.target) !== width) {
      observedWidths.set(entry.target, width)
      changed = true
    }
  }
  if (changed) schedule()
}

function observe(): void {
  disconnect()
  if (!props.collapse) return
  const nav = navRef.value
  if (typeof ResizeObserver !== 'undefined' && nav) {
    resizeObserver = new ResizeObserver(onResize)
    // The nav shrinks with a collapsed trail when its parent is sized by its
    // content, so the parent (and an optional container) tell when room grows.
    const targets = new Set<Element>([nav])
    if (nav.parentElement) targets.add(nav.parentElement)
    const container = containerElement()
    if (container) targets.add(container)
    for (const el of targets) resizeObserver.observe(el)
  }
  // Crumbs added or removed through the slot.
  if (typeof MutationObserver !== 'undefined' && listRef.value) {
    mutationObserver = new MutationObserver(schedule)
    mutationObserver.observe(listRef.value, { childList: true })
  }
}

function disconnect(): void {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  resizeObserver = null
  mutationObserver = null
}

onMounted(() => {
  observe()
  schedule()
})

watch(() => props.collapse, () => {
  observe()
  schedule()
  if (!props.collapse) closeMenu()
})

watch(() => props.container, () => {
  observe()
  schedule()
})

watch(() => props.collapseFirst, schedule)

onBeforeUnmount(() => {
  disconnect()
  removeMenuListeners()
})

// ---- Menu of collapsed crumbs -------------------------------------------------

const menuOpen = ref(false)
const anchorRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuId = useId()

const { floatingStyle, update: updatePopover } = usePopover(anchorRef, menuRef, {
  placement: 'bottom-start',
  offset: 4,
})

interface HiddenCrumb {
  el: HTMLElement
  label: string
  /** The crumb's own link or button, activated from the menu. */
  target: HTMLElement | null
}

/** The rendered content of a crumb (link, button or text), not its separator or "…". */
function crumbContent(li: HTMLElement): HTMLElement | null {
  return li.querySelector<HTMLElement>(
    ':scope > :not(.uid-breadcrumb__separator):not(.uid-breadcrumb__ellipsis)',
  )
}

const hiddenCrumbs = computed<HiddenCrumb[]>(() =>
  hidden.value.map((el) => {
    const content = crumbContent(el)
    const target = content && content.matches('a, button') ? content : null
    return { el, label: content?.textContent?.trim() ?? '', target }
  }),
)

function menuItems(): HTMLElement[] {
  return Array.from(menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}

async function openMenu(trigger: HTMLElement): Promise<void> {
  anchorRef.value = trigger
  menuOpen.value = true
  await nextTick()
  updatePopover()
  menuItems()[0]?.focus()
  document.addEventListener('pointerdown', onOutsidePointer)
  window.addEventListener('resize', updatePopover)
  window.addEventListener('scroll', updatePopover, true)
}

function removeMenuListeners(): void {
  document.removeEventListener('pointerdown', onOutsidePointer)
  window.removeEventListener('resize', updatePopover)
  window.removeEventListener('scroll', updatePopover, true)
}

function closeMenu(returnFocus = false): void {
  if (!menuOpen.value) return
  menuOpen.value = false
  removeMenuListeners()
  if (returnFocus) anchorRef.value?.focus()
}

function toggleMenu(trigger: HTMLElement): void {
  if (menuOpen.value) closeMenu()
  else void openMenu(trigger)
}

function onOutsidePointer(e: PointerEvent): void {
  const target = e.target as Node
  if (menuRef.value?.contains(target) || anchorRef.value?.contains(target)) return
  closeMenu()
}

function activate(crumb: HiddenCrumb): void {
  if (!crumb.target) return
  closeMenu()
  // Clicking the crumb's own element keeps RouterLink navigation and click listeners working.
  crumb.target.click()
}

function onMenuKeydown(e: KeyboardEvent): void {
  const items = menuItems()
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(index + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(index - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Home') {
    e.preventDefault()
    items[0]?.focus()
  } else if (e.key === 'End') {
    e.preventDefault()
    items[items.length - 1]?.focus()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closeMenu(true)
  } else if (e.key === 'Tab') {
    closeMenu()
  }
}

watch(hidden, (list) => {
  if (list.length === 0) closeMenu()
})

provide(BREADCRUMB_KEY, {
  tick,
  hidden,
  menu: toRef(props, 'collapseMenu'),
  menuId,
  menuOpen,
  toggleMenu,
})

defineExpose({ recompute })
</script>

<template>
  <nav
    ref="navRef"
    class="uid-breadcrumb"
    :class="{
      'uid-breadcrumb--nowrap': isNowrap,
      'uid-breadcrumb--collapse': collapse,
      'uid-breadcrumb--measuring': measuring,
    }"
    :aria-label="label ?? locale.breadcrumb?.label"
  >
    <ol
      ref="listRef"
      class="uid-breadcrumb__list"
      :style="{ '--uid-breadcrumb-sep': `'${separator}'` }"
    >
      <slot />
    </ol>
    <!-- Measures the width the "…" crumb takes (separator included). -->
    <span
      v-if="collapse"
      ref="probeRef"
      class="uid-breadcrumb__item uid-breadcrumb__probe"
      :style="{ '--uid-breadcrumb-sep': `'${separator}'` }"
      aria-hidden="true"
    >
      <span class="uid-breadcrumb__separator" />
      <span
        class="uid-breadcrumb__ellipsis"
        :class="{ 'uid-breadcrumb__ellipsis--button': collapseMenu }"
      >…</span>
    </span>
    <Teleport
      v-if="collapse && collapseMenu"
      to="body"
    >
      <div
        v-if="menuOpen"
        :id="menuId"
        ref="menuRef"
        class="uid-breadcrumb__menu"
        role="menu"
        :aria-label="locale.breadcrumb?.showHidden"
        :style="floatingStyle"
        @keydown="onMenuKeydown"
      >
        <button
          v-for="(crumb, i) in hiddenCrumbs"
          :key="i"
          type="button"
          role="menuitem"
          class="uid-breadcrumb__menu-item"
          tabindex="-1"
          :aria-disabled="crumb.target ? undefined : 'true'"
          @click="activate(crumb)"
        >
          {{ crumb.label }}
        </button>
      </div>
    </Teleport>
  </nav>
</template>
