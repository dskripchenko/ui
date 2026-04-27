import { ref, computed, toValue, type Ref, type MaybeRef } from 'vue'

export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'right'

export interface UsePopoverOptions {
  placement?: MaybeRef<Placement>
  offset?: number
}

const DEFAULT_OFFSET = 8
const VIEWPORT_MARGIN = 8

export function usePopover(
  referenceRef: Ref<HTMLElement | null>,
  floatingRef: Ref<HTMLElement | null>,
  options: UsePopoverOptions = {},
) {
  const x = ref(0)
  const y = ref(0)
  const actualPlacement = ref<Placement>(toValue(options.placement) ?? 'bottom')

  const floatingStyle = computed(() => ({
    position: 'fixed' as const,
    left: `${x.value}px`,
    top: `${y.value}px`,
  }))

  function update(): void {
    const reference = referenceRef.value
    const floating = floatingRef.value
    if (!reference || !floating) return

    const refRect = reference.getBoundingClientRect()
    const floatRect = floating.getBoundingClientRect()
    const offset = options.offset ?? DEFAULT_OFFSET
    const vw = window.innerWidth
    const vh = window.innerHeight

    let placement = toValue(options.placement) ?? 'bottom'

    if (placement.startsWith('bottom')) {
      const spaceBelow = vh - refRect.bottom
      const spaceAbove = refRect.top
      if (spaceBelow < floatRect.height + offset && spaceAbove > spaceBelow) {
        placement = placement.replace('bottom', 'top') as Placement
      }
    } else if (placement.startsWith('top')) {
      const spaceAbove = refRect.top
      const spaceBelow = vh - refRect.bottom
      if (spaceAbove < floatRect.height + offset && spaceBelow > spaceAbove) {
        placement = placement.replace('top', 'bottom') as Placement
      }
    }

    actualPlacement.value = placement

    let cx = 0
    let cy = 0

    if (placement.startsWith('bottom')) {
      cy = refRect.bottom + offset
      if (placement === 'bottom') cx = refRect.left + refRect.width / 2 - floatRect.width / 2
      else if (placement === 'bottom-start') cx = refRect.left
      else cx = refRect.right - floatRect.width
    } else if (placement.startsWith('top')) {
      cy = refRect.top - floatRect.height - offset
      if (placement === 'top') cx = refRect.left + refRect.width / 2 - floatRect.width / 2
      else if (placement === 'top-start') cx = refRect.left
      else cx = refRect.right - floatRect.width
    } else if (placement === 'left') {
      cx = refRect.left - floatRect.width - offset
      cy = refRect.top + refRect.height / 2 - floatRect.height / 2
    } else {
      cx = refRect.right + offset
      cy = refRect.top + refRect.height / 2 - floatRect.height / 2
    }

    x.value = Math.max(VIEWPORT_MARGIN, Math.min(cx, vw - floatRect.width - VIEWPORT_MARGIN))
    y.value = Math.max(VIEWPORT_MARGIN, Math.min(cy, vh - floatRect.height - VIEWPORT_MARGIN))
  }

  return { x, y, actualPlacement, floatingStyle, update }
}
