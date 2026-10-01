import type { InjectionKey, Ref } from 'vue'

export const MENU_CLOSE_KEY: InjectionKey<() => void> = Symbol('uid-menu-close')

// One menu level (the root menu or a submenu panel): tracks which child
// submenu is open so that opening a sibling closes the previous one.
export interface MenuLevel {
  activeSubmenu: Ref<string | null>
}

export const MENU_LEVEL_KEY: InjectionKey<MenuLevel> = Symbol('uid-menu-level')

const ITEM_SELECTOR = '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'

// Enabled items that belong to `menu` itself, skipping items of nested panels.
export function getLevelItems(menu: HTMLElement | null): HTMLElement[] {
  if (!menu) return []
  return Array.from(menu.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
    .filter((el) => el.parentElement?.closest('[role="menu"]') === menu)
}

// Shared roving-focus handling; returns true when the key was consumed.
export function moveFocus(menu: HTMLElement | null, key: string): boolean {
  const items = getLevelItems(menu)
  if (!items.length) return false
  const idx = items.indexOf(document.activeElement as HTMLElement)
  let next: HTMLElement | undefined
  if (key === 'ArrowDown') next = items[(idx + 1) % items.length]
  else if (key === 'ArrowUp') next = items[(idx - 1 + items.length) % items.length]
  else if (key === 'Home') next = items[0]
  else if (key === 'End') next = items[items.length - 1]
  else return false
  next?.focus()
  return true
}
