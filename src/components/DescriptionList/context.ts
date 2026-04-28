import type { InjectionKey, Ref } from 'vue'

export interface DescriptionListContext {
  direction: Ref<'horizontal' | 'vertical'>
  bordered: Ref<boolean>
}

export const descriptionListKey: InjectionKey<DescriptionListContext> = Symbol('UidDescriptionList')
