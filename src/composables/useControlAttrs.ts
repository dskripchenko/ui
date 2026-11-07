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

/** Attributes that name or describe a control for assistive technology. */
const NAMING_ATTRS = ['aria-label', 'aria-labelledby', 'aria-describedby'] as const

export interface TriggerAttrs {
  /** Everything but the naming attributes: bind to the component root with `v-bind="rootAttrs()"`. */
  rootAttrs: () => Record<string, unknown>
  /** `aria-label`, `aria-labelledby`, `aria-describedby`: bind to the element with the role. */
  namingAttrs: () => Record<string, unknown>
}

/**
 * For components with `inheritAttrs: false` whose root is a wrapper and whose
 * focusable trigger carries the role (`combobox`). The name a consumer gives
 * (`aria-label="Status"`) has to land on the trigger, or the control has no
 * accessible name; every other attribute (`class`, `data-*`, listeners) stays
 * on the root, where it always was.
 */
export function useTriggerAttrs(): TriggerAttrs {
  const attrs = useAttrs()
  const naming = (key: string): boolean => (NAMING_ATTRS as readonly string[]).includes(key)
  return {
    rootAttrs: () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !naming(key))),
    namingAttrs: () => Object.fromEntries(Object.entries(attrs).filter(([key]) => naming(key))),
  }
}
