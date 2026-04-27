import type { InjectionKey } from 'vue'

export const MENU_CLOSE_KEY: InjectionKey<() => void> = Symbol('uid-menu-close')
