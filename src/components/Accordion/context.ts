import type { InjectionKey } from 'vue'

export interface AccordionContext {
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
}

export const ACCORDION_KEY: InjectionKey<AccordionContext> = Symbol('uid-accordion')
