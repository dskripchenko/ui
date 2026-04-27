import type { InjectionKey, Ref, ComputedRef } from 'vue'

export interface WizardStepDef {
  label: string
  description?: string
}

export interface WizardContext {
  current: Ref<number>
  steps: Ref<WizardStepDef[]>
  isFirst: ComputedRef<boolean>
  isLast: ComputedRef<boolean>
  next: () => Promise<void>
  prev: () => void
  goTo: (index: number) => void
  registerValidator: (index: number, fn: () => boolean | Promise<boolean>) => void
  unregisterValidator: (index: number) => void
}

export const WIZARD_KEY: InjectionKey<WizardContext> = Symbol('uid-wizard')
