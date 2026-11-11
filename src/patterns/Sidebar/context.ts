import type { ComputedRef, InjectionKey } from 'vue'

/** Whether the sidebar around is collapsed to its strip of icons. */
export const SIDEBAR_COLLAPSED: InjectionKey<ComputedRef<boolean>> = Symbol('uid-sidebar-collapsed')
