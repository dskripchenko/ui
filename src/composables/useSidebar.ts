import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface SidebarContext {
  collapsed: Ref<boolean>
  toggle: () => void
  open: () => void
  close: () => void
}

export const SIDEBAR_LAYOUT_KEY: InjectionKey<SidebarContext> = Symbol('uid-sidebar-layout')

export function useSidebar(): SidebarContext {
  const ctx = inject(SIDEBAR_LAYOUT_KEY)
  if (!ctx) throw new Error('useSidebar() must be used inside UidSidebarLayout')
  return ctx
}
