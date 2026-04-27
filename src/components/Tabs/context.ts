import type { InjectionKey, Ref } from 'vue'

export type TabValue = string | number

export interface TabsContext {
  activeTab: Ref<TabValue>
  setTab: (value: TabValue) => void
  idPrefix: string
}

export const TABS_KEY: InjectionKey<TabsContext> = Symbol('uid-tabs')
