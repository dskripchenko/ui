import type { InjectionKey, Ref } from 'vue'

export interface BreadcrumbContext {
  /** Bumped after every UidBreadcrumb update so items can re-check whether they are last. */
  tick: Ref<number>
}

export const BREADCRUMB_KEY: InjectionKey<BreadcrumbContext> = Symbol('UidBreadcrumb')
