import { computed, nextTick, onBeforeUnmount, ref, watch, type MaybeRef, type Ref } from 'vue'
import { usePopover, type Placement } from './usePopover.js'

const VIEWPORT_MARGIN = 8

export interface UseFloatingPanelOptions {
  placement?: MaybeRef<Placement>
  offset?: number
  /**
   * Give the panel at least the anchor's width (`'min'`) or exactly it
   * (`'exact'`), as a select-like dropdown does.
   */
  matchWidth?: false | 'min' | 'exact'
}

/**
 * A dropdown panel that lives in `<Teleport to="body">` and is positioned
 * `fixed` against its anchor.
 *
 * Rendered in place, a panel is clipped by any ancestor with `overflow` —
 * a modal's body, a drawer, a card — and stacks inside that ancestor's
 * stacking context, under a modal's footer. Teleported, it escapes both;
 * `--uid-z-popover` puts it above modals and drawers.
 *
 * While open it follows the anchor on scroll (of any ancestor) and resize,
 * re-measures when its own content changes size, and flips above the anchor
 * when there is no room below. It stays transparent until the first measurement,
 * so it never flashes in the corner of the viewport.
 */
export function useFloatingPanel(
  anchorRef: Ref<HTMLElement | null>,
  panelRef: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  options: UseFloatingPanelOptions = {},
) {
  const { floatingStyle, update, actualPlacement } = usePopover(anchorRef, panelRef, {
    placement: options.placement ?? 'bottom-start',
    offset: options.offset ?? 4,
  })
  const anchorWidth = ref(0)
  const positioned = ref(false)
  const maxHeight = ref<number | null>(null)
  let observer: ResizeObserver | null = null
  let listening = false

  function reposition(): void {
    if (!isOpen.value) return
    const anchor = anchorRef.value
    const panel = panelRef.value
    anchorWidth.value = anchor?.getBoundingClientRect().width ?? 0
    update()
    // Room on neither side: cap the height to the side it went to and let it
    // scroll, rather than cover the anchor.
    if (anchor && panel && typeof window !== 'undefined') {
      const r = anchor.getBoundingClientRect()
      const gap = (options.offset ?? 4) + VIEWPORT_MARGIN
      const room = actualPlacement.value.startsWith('top') ? r.top - gap : window.innerHeight - r.bottom - gap
      const natural = panel.scrollHeight
      const next = natural > 0 && room > 0 && natural > room ? Math.floor(room) : null
      if (next !== maxHeight.value) {
        maxHeight.value = next
        void nextTick(update)
      }
    }
    if (panel) positioned.value = true
  }

  function start(): void {
    if (listening) return
    listening = true
    window.addEventListener('resize', reposition)
    // Capture: a scroll of any ancestor (a modal body, a table) moves the anchor.
    window.addEventListener('scroll', reposition, true)
    if (typeof ResizeObserver !== 'undefined' && panelRef.value) {
      observer = new ResizeObserver(() => reposition())
      observer.observe(panelRef.value)
    }
  }

  function stop(): void {
    if (!listening) return
    listening = false
    window.removeEventListener('resize', reposition)
    window.removeEventListener('scroll', reposition, true)
    observer?.disconnect()
    observer = null
  }

  watch(isOpen, async (open) => {
    positioned.value = false
    maxHeight.value = null
    if (!open) {
      stop()
      return
    }
    await nextTick()
    reposition()
    // A second pass once the browser has laid the panel out.
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(() => reposition())
    start()
  }, { immediate: true })

  onBeforeUnmount(stop)

  const panelStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = { ...floatingStyle.value }
    if (options.matchWidth === 'min' && anchorWidth.value > 0) style.minWidth = `${anchorWidth.value}px`
    if (options.matchWidth === 'exact' && anchorWidth.value > 0) style.width = `${anchorWidth.value}px`
    if (maxHeight.value !== null) {
      style.maxHeight = `${maxHeight.value}px`
      style.overflowY = 'auto'
    }
    // Transparent rather than hidden until measured: a hidden element cannot
    // take focus, and a picker focuses its active cell as it opens.
    if (!positioned.value) {
      style.opacity = '0'
      style.pointerEvents = 'none'
    }
    return style
  })

  /** Whether an event target is inside the (teleported) panel. */
  function containsTarget(target: EventTarget | null): boolean {
    return target instanceof Node && !!panelRef.value?.contains(target)
  }

  return { panelStyle, actualPlacement, update: reposition, containsTarget }
}
