import { useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'

export interface ControlAttrs {
  /** `class` and `style` only: bind to the component root with `v-bind="rootAttrs()"`. */
  rootAttrs: () => Pick<HTMLAttributes, 'class' | 'style'>
  /** Every other fallthrough attribute and `onXxx` listener: bind to the native control. */
  controlAttrs: () => Record<string, unknown>
}

/**
 * For components with `inheritAttrs: false`. Splits the fallthrough attributes so
 * that `class`/`style` stay on the root element and everything else (`list`,
 * `maxlength`, `pattern`, `inputmode`, `name`, `data-*`, `aria-*`, listeners ...)
 * reaches the native `<input>`/`<textarea>`/`<select>`.
 *
 * Call the returned functions from the template so they are re-read on every render.
 */
export function useControlAttrs(): ControlAttrs {
  const attrs = useAttrs()
  return {
    rootAttrs: () => ({ class: attrs.class as HTMLAttributes['class'], style: attrs.style as HTMLAttributes['style'] }),
    controlAttrs: () => {
      const rest: Record<string, unknown> = {}
      for (const key of Object.keys(attrs)) {
        if (key !== 'class' && key !== 'style') rest[key] = attrs[key]
      }
      return rest
    },
  }
}
