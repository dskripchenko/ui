import type { InjectionKey, Ref } from 'vue'

export type RadioValue = string | number | boolean | null | undefined

export interface RadioGroupContext {
  modelValue: Ref<RadioValue>
  update: (value: RadioValue) => void
  name: string
  disabled: Ref<boolean>
}

export const RADIO_GROUP_KEY: InjectionKey<RadioGroupContext> = Symbol('uid-radio-group')
